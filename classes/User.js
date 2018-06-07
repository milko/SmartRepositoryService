'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Parent.
//
const Document = require( './Document' );

//
// Classes.
//
const Edge = require( './Edge' );


/**
 * User class
 *
 * This class implements a user, users can log into the application and have the
 * following required properties:
 *
 * 	- _key:				The document key is assigned by the database, immutable.
 * 	- username:			The user code, the identication provided to log in.
 * 	- name:				The user full name, this property is publicly available for
 * 						referring to users.
 * 	- email:			The user's e-mail address.
 * 	- language:			Contains the user's preferred language code.
 * 	- rank:				This represents the user's rank, it represents the domain of
 * 						the user.
 * 	- role:				This is a list of role codes that indicate which activities
 * 						and operations the user is allowed to perform, this
 * 						information is used to restrict the user interface and access
 * 						to certain services.
 * 	- authentication:	This is a record containing authentication data, it should
 * 						never be returned by services.
 *
 * A user is created following these steps:
 *
 * 	- A user having a role that allows creating other users registers the new user.
 * 	- The registration service, sign up, returns a token that can be sent via e-mail
 * 	  to the newly created user, the token contains the default user information, such
 * 	  as the user code, name, email, rank and role. The first and last two properties
 * 	  can only be changed by the manager user.
 * 	- The user responds to the e-mail which sends the token to the sing in service,
 * 	  which presents the user a form in which it can update personal information and
 * 	  provide the password. Once the form is submitted, the user is active and logged in.
 *
 * All users must be created by another user, the latter becomes the manager of that
 * user and takes responsibility to manage it. Only one user is not required to have a
 * manager, the system administrator: this user is created with a service which will
 * run only if there are no users in the database. The manager relationships are store
 * using graph edges, to allow traversing manager hierarchies. Any manager above the
 * current user hierarchical level is allowed to manage that user.
 *
 * Users can also be part of a group, this membership relationship is also implemented
 * using graph edges. The group can be any Document derived instance.
 *
 * This class adds a series of members which can be used to manage the above-mentioned
 * hierarchies:
 *
 * - _group:			This is a non persistent data member of the object which records
 * 						the eventual group _id, it can be accessed with the 'group'
 * 						getter.
 * - _manager:			This is a non persistent data member of the object which records
 * 						the manager _id, it can be accessed with the 'manager' getter.
 * - _manages:			This member holds the number of directly managed users, it is
 * 						set if the object is persistent and is used to prevent having to
 * 						repeatedly probe the database.
 *
 * Both the group and manager are reserved members, these are only set by providing
 * them in the constructor object selector or by resolving the object, through the
 * respective resolveGroup() and resolveManager() methods. To change a group or
 * manager there are two dedicated methods which only operate on resolved users:
 *
 * 	- setGroup():		Used to change or remove the group membership.
 * 	- setManager():		Used to change the user manager, should only be available to a
 * 						user in the user's manager hierarchy.
 *
 * Another set of utility methods are available:
 *
 * 	- manages():		Returns the count of users directly managed by the current user.
 * 	- managed():		Returns the list or hierarchy of managed users, it is possible
 * 						to limit how many levels are traversed.
 * 	- managers():		Returns the hierarchy of managers, starting from the current
 * 						user and ending with the root manager.
 * 	- managedBy():		Returns a boolean indicating whether the provided user
 * 						reference is among the current user's managers hierarchy.
 *
 * When a user is deleted, all its managed users will be transferred under the current
 * user's manager, if the current user is the system administrator, the operation will
 * not be permitted.
 */
class User extends Document
{
	/**
	 * Constructor
	 *
	 * We overload the constructor to intercept the group and manager from the
	 * provided object reference, if provided, these properties must resolve, or by
	 * resolving them if the object was resolved.
	 *
	 * The class features two custom data members:
	 *
	 * 	- _group:	The user group _id reference.
	 * 	- _manager:	The user manager User _id reference.
	 *
	 * These two members can be retirieved by the respective group and manager
	 * getters, they, however, can only be set from an object reference provided in
	 * the constructor, or modified using a custom interface; the group is optional,
	 * the manager is required for all users, except the system administrator.
	 *
	 * When providing these members to the constructor using an object reference, you
	 * should use the following custom property names:
	 *
	 * 	__group:	For the group.
	 * 	__manager:	For the manager.
	 *
	 * Note that if the document was resolved, both the resolved group and manager
	 * will be used:
	 *
	 * The user has two unique fields: the _key and the username.
	 *
	 * In this class we follow these steps:
	 *
	 * 	- Extract and remove group and manager references from the provided object
	 * 	  selector.
	 * 	- Call the parent constructor.
	 * 	- Resolve the group and manager.
	 * 	- If the object is persistent:
	 * 		- Assert that the resolved group and manager match the eventual provided ones.
	 * 		- Assert that the user has a manager, or that it is the system administrator.
	 *
	 * Note that both the group and manager MUST be provided either as an object
	 * selector or as their _id reference.
	 *
	 * The constructor adds an extra private parameter to prevent an instantiation
	 * cascading: when resolving managers, for instance, we instantiate the manager
	 * user, this means that if it has a manager the process will go on: if you
	 * provide false in the last parameter, the group and manager will not be
	 * reserved, since you are only interested in the _id of the group or manager.
	 *
	 * This class implements the defaultCollection() method, which returns the users
	 * collection name, users reside by default in that collection and the database
	 * expects users to be found in it. However, there may be cases in which you might
	 * want to instantiate a user that is not a human client, rather a batch
	 * controller or some other entity which doesn't belong in a collection of users:
	 * in this case you can provide explicitly the collection in which it resides, in
	 * all other cases you should omit the collection from the constructor.
	 *
	 * @param theRequest	{Object}					The current request.
	 * @param theReference	{String}|{Object}|{null}	The document reference or object.
	 * @param theCollection	{String}|{null}				The document collection.
	 * @param isImmutable	{Boolean}					True, instantiate immutable document.
	 * @param doRelated		{Boolean}					True, resolve group and manager.
	 */
	constructor(
		theRequest,
		theReference = null,
		theCollection = null,
		isImmutable = false,
		doRelated = true )
	{
		//
		// Init local storage.
		//
		let group = null;
		let manager = null;
		
		//
		// Handle object reference.
		//
		if( K.function.isObject( theReference ) )
		{
			//
			// Extract group.
			//
			if( theReference.hasOwnProperty( '__group' ) )
			{
				group = theReference.__group;
				delete theReference.__group;
			}
			
			//
			// Extract manager.
			//
			if( theReference.hasOwnProperty( '__manager' ) )
			{
				manager = theReference.__manager;
				delete theReference.__manager;
			}
			
		}	// Provided an object initialiser.
		
		//
		// Call parent constructor.
		//
		super( theRequest, theReference, theCollection, isImmutable );
		
		//
		// Handle group and manager.
		//
		if( doRelated )
		{
			//
			// Resolve provided group and manager.
			//
			this.resolveGroup( group );
			this.resolveManager( manager );
			
		}	// Resolve group and manager.
		
	}	// constructor
	
	
	/************************************************************************************
	 * INITIALISATION METHODS															*
	 ************************************************************************************/
	
	/**
	 * Init document properties
	 *
	 * We overload this method to set the instance member.
	 *
	 * 	- _request:		The current service request record.
	 * 	- _immutable:	The immutable status.
	 * 	- _persistent:	The persistent status.
	 * 	- _revised:		The revision status.
	 * 	- _instance:	The document instance, if applicable.
	 *
	 * In this class we initialise all but the last member: this class does not
	 * represeent any specific instance, so here it will be undefined..
	 *
	 * Any error in this phase should raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theCollection	{String}|{null}		The document collection.
	 * @param isImmutable	{Boolean}			True, instantiate immutable document.
	 */
	initDocumentMembers( theRequest, theCollection, isImmutable )
	{
		//
		// Call parent method.
		//
		super.initDocumentMembers( theRequest, theCollection, isImmutable );
		
		//
		// Set edge instance.
		//
		this._instance = 'User';
		
	}	// initDocumentMembers
	
	
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we set the creation time stamp.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseInsertProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.normaliseInsertProperties( doAssert ) )
		{
			//
			// Set creation time stamp.
			//
			this._document[ Dict.descriptor.kCStamp ] = Date.now();
			
			return true;															// ==>
		}
		
		return false;																// ==>
		
	}	// normaliseInsertProperties
	
	/**
	 * Normalise replace properties
	 *
	 * This method should load any default properties set when replacing the object.
	 *
	 * In this class we set the modification time stamp.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseReplaceProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.normaliseReplaceProperties( doAssert ) )
		{
			//
			// Set creation time stamp.
			//
			this._document[ Dict.descriptor.kMStamp ] = Date.now();
			
			return true;															// ==>
		}
		
		return false;																// ==>
		
	}	// normaliseReplaceProperties
	
	
	/************************************************************************************
	 * VALIDATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Validate document
	 *
	 * We overload this method to assert that users other than the system
	 * administrator have a manager.
	 *
	 * Note that we do this here, rather than in validateRequiredProperties(), because
	 * the manager is not a document property snd the current document must be valid.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	validateDocument( doAssert = true )
	{
		//
		// Call parent method.
		//
		const result = super.validateDocument( doAssert );
		
		//
		// Continue if OK.
		//
		if( result === true )
		{
			//
			// Handle missing manager.
			//
			if( (! this.hasOwnProperty( '_manager' ))				// No manager
			 && (this._document[ Dict.descriptor.kUsername ]		// and current user
					!== module.context.configuration.adminCode) )	// not sysadm.
			{
				if( doAssert )
					throw(
						new MyError(
							'IncompleteObject',					// Error name.
							K.error.MissingUserManager,			// Message code.
							this._request.application.language,	// Language.
							'USER MANAGER',						// Arguments.
							412									// HTTP error code.
						)
					);															// !@! ==>
				
				return false;														// ==>
			}
			
		}	// Object is valid.
		
		return result;																// ==>
		
	}	// validateDocument
	
	/**
	 * Validate document constraints
	 *
	 * We overload this method to ensure managed users can be transferred under the
	 * current user's manager: if the current user manages other users and it does not
	 * have a manager we fail.
	 *
	 * @param doAssert	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True/false if no constraints and null if not
	 * 								persistent.
	 */
	validateDocumentConstraints( doAssert = true )
	{
		//
		// Call parent method.
		//
		const result = super.validateDocumentConstraints( doAssert );
		
		//
		// Continue if no constraints.
		//
		if( result === true )
		{
			//
			// Handle manager that has no manager.
			// Note that this method is called when deleting a document,
			// which operates only if the document is persistent,
			// so we have the guarantee that hasManaged returns the actual information.
			//
			if( (this.hasManaged > 0)					// Manages users
			 && (! this.hasOwnProperty( '_manager' )) )	// and has no manager.
			{
				//
				// Raise exception.
				//
				if( getMad )
					throw(
						new MyError(
							'ConstraintViolated',						// Error name.
							K.error.NoManagerManages,					// Message code.
							this._request.application.language,			// Language.
							this._document[ Dict.descriptor.kName ],	// Error value.
							409											// HTTP error code.
						)
					);															// !@! ==>
				
				return true;														// ==>
			}
			
		}	// Parent has no constraints.
		
		return result;																// ==>
		
	}	// validateDocumentConstraints
	
	/**
	 * Validate collection type
	 *
	 * In this class we assert the collection to be of type document.
	 *
	 * @param theCollection	{String}	The collection name.
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}				True if all required fields are there.
	 */
	validateCollectionType( theCollection, doAssert = true )
	{
		return Document.isDocumentCollection(
			this._request,
			theCollection,
			doAssert
		);																			// ==>
		
	}	// validateCollectionType
	
	
	/************************************************************************************
	 * PERSISTENCE METHODS																*
	 ************************************************************************************/
	
	/**
	 * Insert document
	 *
	 * We overload this method to create the authentication record  and to add the
	 * group and manager edges.
	 *
	 * The method will proceed as follows:
	 *
	 * 	- It will first insert the user document.
	 * 	- It will then insert the group edge, if provided.
	 * 	- It will finally insert the manager edge.
	 * 	- If any of these operations fail, the method will take care of removing the
	 * 	  user document, the group and manager edges, and will raise an exception.
	 *
	 * We also overload the method signature to require the user password, which is
	 * needed to create the authentication record.
	 *
	 * Note that when inserting the group or the manager edges and there is any error,
	 * only the newly inserted edges will be deleted.
	 *
	 * @param thePassword	{String} The user password.
	 * @returns {Boolean}	True if inserted.
	 */
	insertDocument( thePassword )
	{
		//
		// Set authentication record.
		//
		User.setAuthentication( thePassword, this );
		
		//
		// Insert user.
		// If there is an error, an exception will be raised
		// before we have a chance of adding group and manager:
		// this means that any error after this point should trigger
		// the removal of the user and the eventual group and manager edges.
		//
		// This also means that in the removeDocument() method the persistent flag
		// will determine if the user has to be removed: on errors the persistent flag
		// will be reset, which means that the parent remove() method will not
		// proceed; if the user was inserted, the persistent flag will be set.
		//
		const persistent = super.insertDocument();
		
		//
		// Insert group and manager relationships.
		//
		if( persistent )
		{
			//
			// Init local storage.
			//
			let group_edge_id = null;
			let manager_edge_id = null;
			
			//
			// Try to insert group and manager.
			//
			try
			{
				//
				// Insert group relationhip.
				//
				group_edge_id = this.insertGroup();
				
				//
				// Insert manager relationhip.
				//
				manager_edge_id = this.insertManager();
			}
			catch( error )
			{
				//
				// Remove inserted group.
				// Must not raise exceptions.
				//
				if( group_edge_id !== null )
					this.removeGroup();
				
				//
				// Remove inserted manager.
				// Must not raise exceptions.
				//
				if( manager_edge_id !== null )
					this.removeManager();
				
				//
				// Reset eventual _manages member.
				//
				if( this.hasOwnProperty( '_manages' ) )
					delete this._manages;
				
				//
				// Forward exception.
				//
				throw( error );													// !@! ==>
			}
			
		}	// User was inserted.
		
		return persistent;															// ==>
		
	}	// insertDocument
	
	/**
	 * Insert group relationship
	 *
	 * If the current user has a group, this method will insert the edge relating the
	 * user with the group and return the edge's _id; if the current user has no
	 * group, the method will return null.
	 *
	 * This method is called by insertDocument() only if the document was correctly
	 * inserted, so in this method we have the guarantee that the current object is
	 * persistent.
	 *
	 * Any error will raise an exception, in particular, if the edge already exists,
	 * the edge insert will raise an exception, since the edge is not supposed to exist.
	 *
	 * Note: you must NOT call this method, consider it private, since, if used
	 * incorrectly, it will corrupt the database.
	 *
	 * @returns {String}|{null}	The edge _id or null if no group.
	 */
	insertGroup()
	{
		//
		// Check group and _id.
		// We assume _id is there, since the object is persistent.
		//
		if( this.hasOwnProperty( '_group' )
		 && this._document.hasOwnProperty( '_id' ) )
		{
			//
			// Build selector.
			//
			const selector = {};
			selector._from = this._document._id;
			selector._to   = this._group;
			selector[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateGroupedBy}`;
			
			//
			// Instantiate.
			//
			const edge =
				new Edge(
					this._request,	// Current request.
					selector,		// Selector.
					'schemas',		// Collection.
					false			// Return mutable.
				);
			
			//
			// Insert edge.
			//
			edge.insertDocument();
			
			return edge.document._id;												// ==>
			
		}	// Has group.
		
		return false;																// ==>
		
	}	// insertGroup
	
	/**
	 * Insert manager relationship
	 *
	 * If the current user has a manager, this method will insert the edge relating the
	 * user with its manager and return the edge's _id; if the current user has no
	 * manager, the method will return null.
	 *
	 * This method is called by insertDocument() only if the document was correctly
	 * inserted, so in this method we have the guarantee that the current object is
	 * persistent.
	 *
	 * Any error will raise an exception, in particular, if the edge already exists,
	 * the edge insert will raise an exception, since the edge is not supposed to exist.
	 *
	 * Note: you must NOT call this method, consider it private, since, if used
	 * incorrectly, it will corrupt the database.
	 *
	 * @returns {String}|{null}	The edge _id or null if no manager.
	 */
	insertManager()
	{
		//
		// Check manager and _id.
		// We assume _id is there, since the object is persistent.
		//
		if( this.hasOwnProperty( '_manager' )
		 && this._document.hasOwnProperty( '_id' ) )
		{
			//
			// Build selector.
			//
			const selector = {};
			selector._from = this._document._id;
			selector._to   = this._manager;
			selector[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateManagedBy}`;
			
			//
			// Instantiate.
			//
			const edge =
				new Edge(
					this._request,	// Current request.
					selector,		// Selector.
					'schemas',		// Collection.
					false			// Return mutable.
				);
			
			//
			// Insert edge.
			//
			edge.insertDocument();
			
			return edge.document._id;												// ==>
			
		}	// Has group.
		
		return false;																// ==>
		
	}	// insertManager
	
	/**
	 * Resolve document
	 *
	 * We overload this method to resolve the user group and manager.
	 *
	 * Regardless of the doAssert value, if the group or manager cannot be resolved,
	 * the method will raise an exception: these two references are expected to be valid.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if resolved.
	 */
	resolveDocument( doReplace = false, doAssert = true )
	{
		//
		// Resolve user.
		//
		const persistent = super.resolveDocument( doReplace, doAssert );
		
		//
		// Continue if resolved.
		//
		if( persistent === true )
		{
			//
			// Resolve group.
			// Any error raises an exception regardless of doAssert.
			//
			this.resolveGroup();
			
			//
			// Resolve manager.
			// Any error raises an exception regardless of doAssert.
			//
			this.resolveManager();
			
		}	// Resolved user.
		
		return persistent;															// ==>
		
	}	// resolveDocument
	
	/**
	 * Resolve user group
	 *
	 * This method will resolve the current user's group and return its _id. The
	 * method requires a parameter that can take the following types:
	 *
	 * 	- null:		In this case, either the user has no group, or, if the object is
	 * 				persistent, we want to resolve the group. If the user is
	 * 				persistent, the method will return the resolved document _id, or
	 * 				null if not found; if the user is not persistent, the method will
	 * 				return null.
	 * 	- string:	A string is expected to be the group document _id, the method will
	 * 				assert that the document exists and return its _id; if the
	 * 				document does not exist, the method will raise an exception.
	 * 	- object:	The parameter is expected to be the group selector object, the
	 * 				method will	resolve it and return its _id, or raise an exception
	 * 				if not found.
	 *
	 * This method is called by the constructor after the user has been instantiated,
	 * in that case the user may be persistent or not: if persistent, the method
	 * will be used to set the eventual group in the object, if not persistent, the
	 * method will be used to resolve the group and set the relative data member.
	 *
	 * The method is also called when resolving the object, in that case it will be
	 * called after the user was resolved successfully. In that case the group will be
	 * matched with the eventual existing data member: if the member does not exist,
	 * or is null, the method will set it; if it exists, and the values do not match,
	 * the method will raise an ambiguous document exception.
	 *
	 * In this class we only handle _id references and null: user groups must be
	 * implemented still.
	 *
	 * @param theReference	{Object}|{String}|{null}	Manager reference or null.
	 * @returns {String}|{null}							Resolved document _id or null.
	 */
	resolveGroup( theReference = null )
	{
		//
		// Init local storage.
		//
		let found = null;
		
		//
		// Handle object selector.
		//
		if( K.function.isObject( theReference ) )
		{
			//
			// Instantiate group.
			//
			const group =
				new Document(
					this._request,		// Current request.
					theReference,		// Manager reference.
					null,				// Use default collection.
					false				// Return mutable.
				);
			
			//
			// Resolve document.
			//
			if( ! group.persistent )
				group.resolveDocument( true, true );
			
			found = group.document._id;
			
		}	// Provided selector.
		
		//
		// Handle _id reference.
		//
		else if( theReference !== null )
		{
			//
			// Check if it exists.
			//
			if( db._exists( theReference ) === false )
				throw(
					new MyError(
						'BadDocumentReference',				// Error name.
						K.error.DocumentNotFound,			// Message code.
						this._request.application.language,	// Language.
						// [theReference, this._collection],	// Error value.
						[theReference, null],				// Error value.
						404									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Set match.
			//
			found = meta._id;
			
		}	// Provided group _id.
			
			//
			// theReference is null.
			//
		
		//
		// Handle persistent object.
		//
		else if( this._persistent )
		{
			//
			// Look in schema edges.
			//
			const selector = {};
			selector._from = this._document._id;
			selector[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateGroupedBy}`;
			const cursor =
				db._collection( 'schemas' )
					.byExample( selector );
			
			//
			// Intercept duplicate edge.
			//
			if( cursor.count() > 1 )
			{
				//
				// Compute signature.
				//
				const signature = [];
				for( const field in selector )
					signature.push( `${field} = ${selector[field].toString()}` );
				
				throw(
					new MyError(
						'DatabaseCorrupt',						// Error name.
						K.error.DuplicateEdge,					// Message code.
						this._request.application.language,		// Language.
						signature.join( ', ' ),					// Arguments.
						500										// HTTP error code.
					)
				);																// !@! ==>
				
			}	// Duplicate edge.
			
			//
			// Set match.
			//
			if( cursor.count() === 1 )
				found = cursor.toArray()[ 0 ]._to;
			
		}	// Object is persistent.
		
		//
		// Handle found group.
		//
		if( found !== null )
		{
			//
			// Handle new user.
			//
			if( ! this._persistent )
				this._group = found;
			
			//
			// Handle existing user.
			//
			else
			{
				//
				// Set if missing or null.
				// Note that here we do not strictly enforce mismatches
				// since we don't know whether a group was provided or not:
				// as a rule, you set the group in the constructor to insert,
				// and you omit it when replacing.
				//
				if( (! this.hasOwnProperty( '_group' ))
				 || (this._group === null) )
					this._group = found;
				
				//
				// Handle mismatch.
				//
				else if( this._group !== found )
					throw(
						new MyError(
							'UserGroupConflict',				// Error name.
							K.error.UserGroupConflict,			// Message code.
							this._request.application.language,	// Language.
							[ this._group, found ],				// Arguments.
							409									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// No need to set it here:
				// either null or missing was set,
				// or existing matches found.
				//
				
			}	// User exists.
			
		}	// Found group.
		
		//
		// Handle group not provided or found.
		//
		else
		{
			//
			// Handle mismatch.
			// The group was set but the user doesn't have it.
			//
			if( this.hasOwnProperty( '_group' )			// Group is set
			 && (this._group !== null) )				// and not empty.
				throw(
					new MyError(
						'UserGroupConflict',				// Error name.
						K.error.UserGroupConflict,			// Message code.
						this._request.application.language,	// Language.
						[ this._group, found ],				// Arguments.
						409									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Set group.
			//
			if( ! this.hasOwnProperty( '_group' ) )
				this._group = null;
			
		}	// Group not provided or found.
		
		return this._group;															// ==>
		
	}	// resolveGroup
	
	/**
	 * Resolve user manager
	 *
	 * This method will resolve the current user's manager and return its _id. The
	 * method requires a parameter that can take the following types:
	 *
	 * 	- null:		In this case, either the user has no group, or, if the object is
	 * 				persistent, we want to resolve the group. If the user is
	 * 				persistent, the method will return the resolved document _id, or
	 * 				null if not found; if the user is not persistent, the method will
	 * 				return null.
	 * 	- string:	A string is expected to be the manager document _id, the method will
	 * 				assert that the document exists and return its _id; if the
	 * 				document does not exist, the method will raise an exception.
	 * 	- object:	The parameter is expected to be the manager selector object, the
	 * 				method will	resolve it and return its _id, or raise an exception
	 * 				if not found.
	 *
	 * This method is called by the constructor after the user has been instantiated,
	 * in that case the user may be persistent or not: if persistent, the method
	 * will be used to set the eventual manager in the object, if not persistent, the
	 * method will be used to resolve the group and set the relative data member.
	 *
	 * The method is also called when resolving the object, in that case it will be
	 * called after the user was resolved successfully. In that case the manager will be
	 * matched with the eventual existing data member: if the member does not exist,
	 * or is null, the method will set it; if it exists, and the values do not match,
	 * the method will raise an ambiguous document exception.
	 *
	 * @param theReference	{Object}|{String}|{null}	Manager reference or null.
	 * @returns {String}|{null}							Resolved document _id or null.
	 */
	resolveManager( theReference = null )
	{
		//
		// Init local storage.
		//
		let found = null;
		
		//
		// Handle object selector.
		//
		if( K.function.isObject( theReference ) )
		{
			//
			// Instantiate manager.
			//
			const manager =
				new User(
					this._request,		// Current request.
					theReference,		// Manager reference.
					null,				// Use default collection.
					false,				// Return mutable.
					false				// Don't resolve related.
				);
			
			//
			// Resolve document.
			//
			if( ! manager.persistent )
				manager.resolveDocument( true, true );
			
			found = manager.document._id;
			
		}	// Provided selector.
		
		//
		// Handle _id reference.
		//
		else if( theReference !== null )
		{
			//
			// Check if it exists.
			//
			if( db._exists( theReference ) === false )
				throw(
					new MyError(
						'BadDocumentReference',				// Error name.
						K.error.DocumentNotFound,			// Message code.
						this._request.application.language,	// Language.
						[theReference, this._collection],	// Error value.
						404									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Set match.
			//
			found = meta._id;
			
		}	// Provided manager _id.
		
		//
		// theReference is null.
		//
		
		//
		// Handle persistent object.
		//
		else if( this._persistent )
		{
			//
			// Look in schema edges.
			//
			const selector = {};
			selector._from = this._document._id;
			selector[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateManagedBy}`;
			const cursor =
				db._collection( 'schemas' )
					.byExample( selector );
			
			//
			// Intercept duplicate edge.
			//
			if( cursor.count() > 1 )
			{
				//
				// Compute signature.
				//
				const signature = [];
				for( const field in selector )
					signature.push( `${field} = ${selector[field].toString()}` );
				
				throw(
					new MyError(
						'DatabaseCorrupt',						// Error name.
						K.error.DuplicateEdge,					// Message code.
						this._request.application.language,		// Language.
						signature.join( ', ' ),					// Arguments.
						500										// HTTP error code.
					)
				);																// !@! ==>
				
			}	// Duplicate edge.
			
			//
			// Set match.
			//
			if( cursor.count() === 1 )
				found = cursor.toArray()[ 0 ]._to;
			
			//
			// Assert it is the SysAdm.
			// We must have the username and name.
			//
			else if( this._document[ Dict.descriptor.kUsername ]
				!== module.context.configuration.adminCode )
				throw(
					new MyError(
						'DatabaseCorrupt',						// Error name.
						K.error.NoManager,						// Message code.
						this._request.application.language,		// Language.
						this._document[ Dict.descriptor.kName ],
						500										// HTTP error code.
					)
				);																// !@! ==>
			
		}	// Object is persistent.
		
		//
		// Set object data member.
		//
		
		//
		// Handle found manager.
		//
		if( found !== null )
		{
			//
			// Handle new user.
			//
			if( ! this._persistent )
				this._manager = found;
			
			//
			// Handle existing user.
			//
			else
			{
				//
				// Set if missing or null.
				// Note that here we do not strictly enforce mismatches
				// since we don't know whether a manager was provided or not:
				// as a rule, you set the group in the constructor to insert,
				// and you omit it when replacing.
				//
				if( (! this.hasOwnProperty( '_manager' ))
				 || (this._manager === null) )
					this._manager = found;
				
				//
				// Handle mismatch.
				//
				else if( this._manager !== found )
					throw(
						new MyError(
							'UserManagerConflict',				// Error name.
							K.error.UserManagerConflict,		// Message code.
							this._request.application.language,	// Language.
							[ this._manager, found ],			// Arguments.
							409									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// No need to set it here:
				// either null or missing was set,
				// or existing matches found.
				//
				
			}	// User exists.
			
		}	// Found manager.
		
		//
		// Handle manager not provided or found.
		//
		else
		{
			//
			// Handle mismatch.
			// The manager was set but the user doesn't have it.
			//
			if( this.hasOwnProperty( '_manager' )			// Manager is set
			 && (this._manager !== null) )					// and not empty.
				throw(
					new MyError(
						'UserGroupConflict',				// Error name.
						K.error.UserGroupConflict,			// Message code.
						this._request.application.language,	// Language.
						[ this._manager, found ],			// Arguments.
						409									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Set manager.
			//
			if( ! this.hasOwnProperty( '_manager' ) )
				this._manager = null;
			
		}	// Manager not provided or found.
		
		return this._manager;														// ==>
		
	}	// resolveManager
	
	/**
	 * replaceDocument
	 *
	 * We overload this method's signatire by appending the password parameter, it is
	 * used to update the authentication record in the event of a password change: if
	 * provided, the authentication record will be replaced; if not, the
	 * authentication record will not be changed.
	 *
	 * @param doRevision	{Boolean}		If true, check revision (default).
	 * @param thePassword	{String}|{null}	If provided, update authentication data.
	 * @returns {Boolean}					True if replaced or null if not persistent.
	 */
	replaceDocument( doRevision = true, thePassword = null )
	{
		//
		// If persistent and provided password,
		// update authentication record.
		//
		if( this._persistent
		 && (thePassword !== null) )
			User.setAuthentication( thePassword, this );
		
		return super.replaceDocument( doRevision );									// ==>
		
		
	}	// replaceDocument
	
	/**
	 * Remove document
	 *
	 * We overload this method to remove the current user from the database, it will
	 * first remove the user, then the eventual group relationship and finally the manager
	 * relationship and will return true, if the user exists, or false if it doesn't.
	 *
	 * If the current document revision is different than the existing document
	 * revision, the method will raise an exception.
	 *
	 * If the current user manages other users, but has no manager, the method will
	 * raise an exception; the managed users will be transferred under the current
	 * user's manager.
	 *
	 * The method overrides its signature by adding two parameters, these two flags
	 * indicate whether the group or manager edges were inserted: these are necessary
	 * in cases where the insert procedure finds an existing edge, removing it might
	 * corrupt the database structure. The method can be called as with its ancestor,
	 * since these two parameters default values
	 *
	 * @param doGroup	{Boolean}	If true, remove group (default).
	 * @param doManager	{Boolean}	If true, remove manager (default)
	 * @returns {Boolean}	True removed, false not found, null not persistent.
	 */
	removeDocument( doGroup = true, doManager = true )
	{
		//
		// Call parent method.
		// The parent method will proceed only if the user is persistent:
		// if this method was called by insert(), it will proceed only if
		// the user was actually inserted or if it exists.
		//
		const result = super.remove();
		
		//
		// Remove group and manager.
		// Only if the user has been removed or exists.
		//
		if( result === true )
		{
			//
			// Remove group relationship.
			// Should not fail.
			// When called by insert(), the doGroup flag indicates whether
			// the group edge was inserted, if that is not the case, the
			// group edge might already exist and should not be removed.
			//
			if( doGroup )
				this.removeGroup();
			
			//
			// Remove group relationship.
			// Should not fail.
			// When called by insert(), the doGroup flag indicates whether
			// the group edge was inserted, if that is not the case, the
			// group edge might already exist and should not be removed.
			//
			if( doManager )
				this.removeManager();
			
		}	// Removed current document.
		
		return result;																// ==>
		
	}	// removeDocument
	
	/**
	 * Remove group relationship
	 *
	 * This method will remove the current user group relationship, if it is set in
	 * the object, it will return true if the edge was removed, or false if not.
	 *
	 * If the edge was not found, the method will not raise an exception.
	 *
	 * This method is called both when inserting a new user, in the event the user
	 * insert failed, and when removing the user, after the current user was removed,
	 * so it is guaranteed that the object information
	 *
	 * Note: you must NOT call this method, consider it private, since, if used
	 * incorrectly, it will corrupt the database.
	 *
	 * @returns {Boolean}|{null}	True, deleted; false, not there; null not set.
	 */
	removeGroup()
	{
		//
		// Check group.
		//
		if( this.hasOwnProperty( 'group' )
		 && this._document.hasOwnProperty( '_id' ) )
		{
			//
			// Build selector.
			//
			const selector = {};
			selector._from = this._document._id;
			selector._to   = this.group;
			selector[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateGroupedBy}`;
			
			//
			// Instantiate edge.
			//
			const edge = new Edge( this._request, selector, 'schemas' );
			
			//
			// Resolve edge.
			// We resolve the edge without raising exceptions,
			// if the edge exists we remove it and return the status,
			// if not, we return false.
			//
			if( edge.resolve( false, false ) === true )
				return edge.remove();												// ==>
			
			return false;															// ==>
		}
		
		return null;																// ==>
		
	}	// removeGroup
	
	/**
	 * Remove manager relationship
	 *
	 * This method will remove the current user manager relationship, if it is set in
	 * the object, it will return true if the user has a manager, or false if not.
	 *
	 * If the edge was not found, the method will not raise an exception.
	 *
	 * If the current user manages other users, these will be transferred under the
	 * current user's manager, note that if we get here it is guaranteed that the user
	 * has a manager.
	 *
	 * Note: this method will be called only if the user is persistent, therefore it
	 * is guaranteed that the user _id exists.
	 *
	 * Note: you must NOT call this method, consider it private, since, if used
	 * incorrectly, it will corrupt the database.
	 *
	 * @returns {Boolean}|{null}	True, deleted; false, not there; null not set.
	 */
	removeManager()
	{
		//
		// Check manager.
		//
		if( this.hasOwnProperty( 'manager' ) )
		{
			//
			// Prepare managed users selector.
			//
			const selector = {};
			selector._to = this._document._id;
			selector[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateManagedBy}`;
			
			//
			// Select managed.
			//
			const managed = db._collection( 'schemas' ).byExample( selector ).toArray();
			
			//
			// Transfer managed to current object's manager,
			// and remove managed relationships to current user.
			//
			for( const edge of managed )
			{
				//
				// ToDo
				// When removing the edges, a revision mismatch will trigger an exception,
				// this will corrupt the database.
				// A solution should be devised to prevent this from happening.
				//
				
				//
				// Remove relationship to current user.
				//
				db._remove( edge );
				
				//
				// Remove identifiers and revision.
				//
				delete edge._id;
				delete edge._key;
				delete edge._rev;
				
				//
				// Set relationship to manager.
				//
				edge._to = this.manager;
				
				//
				// Instantiate edge.
				//
				const new_edge = new Edge( this._request, edge, 'schemas' );
				
				//
				// ToDo
				// If the edge already exists, we do not attempt to insert it,
				// this case obviously indicates a database structure corruption.
				// A solution should be devised to prevent this from happening.
				//
				
				//
				// Resolve edge.
				// We resolve the edge without raising exceptions,
				// if the edge doesn't exist we insert it,
				// if it does, we do nothing.
				//
				if( new_edge.resolve( false, false ) !== true )
					new_edge.insert();
			}
			
			//
			// Prepare managed users selector.
			//
			selector._from = this._document._id;
			selector._to   = this.manager;
			
			//
			// Instantiate edge.
			//
			const old_edge = new Edge( this._request, selector, 'schemas' );
			
			//
			// ToDo
			// If the manager doesn't exist it either means the user is the
			// administrator, or it means that the database is corrupt.
			// A solution should be devised to clarify this case.
			//
			
			//
			// Remove manager relationship if it exists.
			//
			if( old_edge.resolve( false, false ) === true )
				return old_edge.remove();											// ==>
			
			return false;															// ==>
			
		}	// Has manager.
		
		return null;																// ==>
		
	}	// removeManager
	
	
	/************************************************************************************
	 * USER HIERARCHY METHODS															*
	 ************************************************************************************/
	
	/**
	 * Return manager hierarchy
	 *
	 * This method will return the hierarchy of managers as an array, starting from the
	 * current user, up to the root user.
	 *
	 * The method expects the following parameter:
	 *
	 * 	- theMinDepth:		The minimum traversal depth, provide null or 0 to start
	 * 						with the current user, numbers greater than 0 will move
	 * 						the origin closer to the root.
	 * 	- theMaxDepth:		The maximum traversal depth, provide null or 0 to traverse
	 * 						the whole tree, numbers greater than 0 indicate the levels
	 * 						that will be traversed; the value must be greater than
	 * 						theMinDepth.
	 * 	- theVertexField:	Provide this parameter to select which vertex fields to
	 * 						display: it can be provided as a string or an array of
	 * 						strings, whose values represent the descriptor _key values
	 * 						corresponding to the desired fields. Provide null to ignore.
	 * 	- theEdgeField:		Provide this parameter to select which edge fields to
	 * 						display: it can be provided as a string or an array of
	 * 						strings, whose values represent the descriptor _key values
	 * 						corresponding to the desired fields; this field is only
	 * 						relevant if 'doIncludeEdge' is true. Provide null to ignore.
	 * 	- doIncludeEdge:	If true, the result will be an array of elements in which
	 * 						the '_vertex' property will contain the user and the
	 * 						'_edge' property will contain the edge; if false, the
	 * 						array elements will be user records.
	 * 	- doStripFields:	If true, private fields will be stripped: all elements
	 * 						will be stripped of the object identifiers and revision,
	 * 						the manager users will also lack the roles.
	 *
	 * Note that this method assumes the current object to be persistent, if this is
	 * not the case, the method will return null.
	 *
	 * @returns {Array}|{null}	The list of user managers, or null if not persistent.
	 */
	managers(
		theMinDepth = 1,
		theMaxDepth = null,
		theVertexField = null,
		theEdgeField = null,
		doIncludeEdge = false,
		doStripFields = true
	)
	{
		//
		// Handle persistent object.
		//
		if( this._persistent )
		{
			//
			// Framework.
			//
			const Schema = require( '../utils/Schema' );
			
			return Schema.getManagedUsersHierarchy(
				this._request,						// Current request.
				this._document,						// Origin node.
				theMinDepth,						// Minimum depth.
				theMaxDepth,						// Maximum depth.
				theVertexField,						// Vertex fields selection.
				theEdgeField,						// Edge fields selection.
				true,								// Restrict language.
				doIncludeEdge,						// Include edges.
				doStripFields						// Strip privates.
			);																		// ==>
		}
		
		return null;																// ==>
		
	}	// managers
	
	/**
	 * Return managed users
	 *
	 * This method will return the flattened list or tree of managed users, the method
	 * will traverse the graph starting from the current user collecting all managed
	 * siblings.
	 *
	 * The method expects the following parameter:
	 *
	 * 	- doTree:			If true, the method will return an object in which the
	 * 						'_children' property will contain the list of users
	 * 						managed by the the current node; if false, the method will
	 * 						return the flattened list of sibling managed users.
	 * 	- theMinDepth:		The minimum traversal depth, provide null or 0 to start
	 * 						with the current user, numbers greater than 0 will move
	 * 						the origin closer to the root.
	 * 	- theMaxDepth:		The maximum traversal depth, provide null or 0 to traverse
	 * 						the whole tree, numbers greater than 0 indicate the levels
	 * 						that will be traversed; the value must be greater than
	 * 						theMinDepth.
	 * 	- theVertexField:	Provide this parameter to select which vertex fields to
	 * 						display: it can be provided as a string or an array of
	 * 						strings, whose values represent the descriptor _key values
	 * 						corresponding to the desired fields. Provide null to ignore.
	 * 	- theEdgeField:		Provide this parameter to select which edge fields to
	 * 						display: it can be provided as a string or an array of
	 * 						strings, whose values represent the descriptor _key values
	 * 						corresponding to the desired fields; this field is only
	 * 						relevant if 'doIncludeEdge' is true. Provide null to ignore.
	 * 	- doIncludeEdge:	If true, the result will be an array of elements in which
	 * 						the '_vertex' property will contain the user and the
	 * 						'_edge' property will contain the edge; if false, the
	 * 						array elements will be user records.
	 * 	- doStripFields:	If true, private fields will be stripped: all elements
	 * 						will be stripped of the object identifiers and revision,
	 * 						the manager users will also lack the roles.
	 *
	 * Note that this method assumes the current object to be persistent, if this is
	 * not the case, the method will return null.
	 *
	 * @returns {Array}|{null}	The list of managed users, or null if not persistent.
	 */
	managed(
		doTree = false,
		theMinDepth = 1,
		theMaxDepth = null,
		theVertexField = null,
		theEdgeField = null,
		doIncludeEdge = false,
		doStripFields = true
	)
	{
		//
		// Handle persistent object.
		//
		if( this._persistent )
		{
			//
			// Framework.
			//
			const Schema = require( '../utils/Schema' );
			
			//
			// Return tree.
			//
			if( doTree )
				return Schema.getManagedUsersTree(
					this._request,					// Current request.
					this._document,					// Current user.
					theMinDepth,					// Minimum depth.
					theMaxDepth,					// Maximum depth.
					theVertexField,					// Vertex fields.
					theEdgeField,					// Edge fields.
					true,							// Restrict language.
					doIncludeEdge,					// Include edge.
					doStripFields					// Strip privates.
				);																	// ==>
			
			//
			// Return list.
			//
			return Schema.getManagedUsersList(
				this._request,					// Current request.
				this._document,					// Current user.
				theMinDepth,					// Minimum depth.
				theMaxDepth,					// Maximum depth.
				theVertexField,					// Vertex fields.
				theEdgeField,					// Edge fields.
				true,							// Restrict language.
				doIncludeEdge,					// Include edge.
				doStripFields					// Strip privates.
			);																		// ==>
		}
		
		return null;																// ==>
		
	}	// managed
	
	/**
	 * Is managed by
	 *
	 * This method will return a boolean indicating whether the provided user
	 * reference can manage the current user.
	 *
	 * The reference can be provided as the same parameter of the constructor, if the
	 * manager cannot be resolved, the method will raise an exception.
	 *
	 * @param theReference	{String}|{Object}	The manager reference.
	 * @returns {boolean}						True is managed by.
	 */
	managedBy( theReference )
	{
		//
		// Instantiate manager.
		// Will raise an exception if not found.
		//
		const manager =
			new User(
				this._request,	// Current request.
				theReference,	// Manager reference.
				null,			// Collection, use default.
				false,			// Return mutable object.
				false			// Don't resolve group and manager.
			);
		
		//
		// Resolve manager if necessary.
		// Will raise an exception if not found.
		//
		if( ! manager.persistent )
			manager.resolveDocument( true, true );
		
		//
		// Get current user managers.
		//
		const managers =
			this.managers(
				1,			// Skip user.
				null,		// Traverse full graph.
				'_id',		// Return _id field.
				null,		// Ignore edge fields.
				false,		// Don't include edges.
				false		// No need to strip privates.
			);
		
		//
		// Check if in managers chain.
		//
		return ( managers.includes( manager.document._id ) );						// ==>
		
	}	// managedBy
	
	/**
	 * Assert managed users
	 *
	 * This method will check whether the current user manages other users, the method
	 * will return the number of managed users or null if the current object is not yet
	 * persistent.
	 *
	 * @returns {Number}|{null}	The count or null if not persistent.
	 */
	get manages()
	{
		//
		// Handle persistent object.
		//
		if( this._persistent )
		{
			//
			// Create data member.
			//
			if( ! this.hasOwnProperty( '_manages' ) )
			{
				//
				// Set search criteria.
				//
				const selector = {};
				selector._to = this._document._id;
				selector[ Dict.descriptor.kPredicate ] =
					`terms/${Dict.term.kPredicateManagedBy}`;
				
				//
				// Save count.
				//
				this._manages =
					db._collection( 'schemas' )
						.byExample( selector ).count();
				
			}	// Not yet computed.
			
			return this._manages;													// ==>
		}
		
		return null;																// ==>
		
	}	// manages
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of significant fields
	 *
	 * We override the parent method to return the user code.
	 *
	 * @returns {Array}	List of significant fields.
	 */
	get significantFields()
	{
		return [
			[
				Dict.descriptor.kUsername
			]
		];																			// ==>
		
	}	// significantFields
	
	/**
	 * Return list of required fields
	 *
	 * We overload the method to add the user code, name, e-mail, preferred
	 * language, rank, roles and the authentication record.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		//
		// Append local properties.
		//
		return super.requiredFields
			.concat([
				Dict.descriptor.kUsername,	// User code.
				Dict.descriptor.kName,		// User full name.
				Dict.descriptor.kEmail,		// User e-mail address.
				Dict.descriptor.kLanguage,	// User preferred language.
				Dict.descriptor.kRank,		// User rank.
				Dict.descriptor.kRole,		// User roles.
				Dict.descriptor.kAuthData	// User authentication record.
			]);																		// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of unique fields
	 *
	 * We overload this method to add the username.
	 *
	 * @returns {Array}	List of unique fields.
	 */
	get uniqueFields()
	{
		return super.uniqueFields
			.concat([
				Dict.descriptor.kUsername	// User code.
			]);																		// ==>
		
	}	// uniqueFields
	
	/**
	 * Return list of locked fields
	 *
	 * We overload this method to add the user code property.
	 *
	 * Note that technically the rank and role are also locked, except for the user
	 * manager: this must be handled by the service that uses this class.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				Dict.descriptor.kUsername	// User code.
			]);																		// ==>
		
	}	// lockedFields
	
	
	/************************************************************************************
	 * DEFAULT GLOBALS																	*
	 ************************************************************************************/
	
	/**
	 * Return default collection name
	 *
	 * we override this method to return the users collection name.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get defaultCollection()
	{
		return 'users';																// ==>
		
	}	// defaultCollection
	
	
	/************************************************************************************
	 * STATIC INTERFACE																	*
	 ************************************************************************************/
	
	/**
	 * Set authentication record
	 *
	 * This method will create the authentication record and set it into the provided
	 * object.
	 *
	 * The method will assert that the provided document is indeed an object and will
	 * load the authentication record into the appropriate property of the object.
	 *
	 * @param thePassword	{String}	The password.
	 * @param theDocument	{Object}	Receives authentication record.
	 */
	static setAuthentication( thePassword, theDocument )
	{
		//
		// Authentication framework.
		//
		// const crypto = require('@arangodb/crypto');
		const createAuth = require('@arangodb/foxx/auth');
		const auth = createAuth();
		
		//
		// Create authorisation data.
		//
		const data = auth.create( thePassword );
		
		//
		// Set in user.
		//
		if( theDocument instanceof User )
			theDocument.document[ Dict.descriptor.kAuthData ] =
				data;
		
		//
		// Set in structure.
		//
		else if( K.function.isObject( theDocument ) )
			theDocument[ Dict.descriptor.kAuthData ] =
				data;
		
		//
		// Complain.
		//
		else
			throw(
				new MyError(
					'BadParam',							// Error name.
					K.error.MustBeObject,				// Message code.
					this._request.application.language,	// Language.
					null,								// Error value.
					400									// HTTP error code.
				)
			);																	// !@! ==>
		
	}	// setAuthentication
	
	/**
	 * Check authentication record
	 *
	 * This method will check whether the provided password authenticates the provided
	 * object.
	 *
	 * The method will return true if the authentication succeeded, false if it didn't
	 * and null if the provided object does not have the authentication record.
	 *
	 * The method will assert that the provided document is indeed an object and has
	 * the know-how to retrieve tha authentication record.
	 *
	 * @param thePassword	{String}	The password.
	 * @param theDocument	{Object}	The object to authenticate.
	 * @returns {Boolean}|{null}		True OK, false KO, null not there.
	 */
	static checkAuthentication( thePassword, theDocument )
	{
		//
		// Init local storage.
		//
		let data = null;
		
		//
		// Get authentication record
		// from User instance.
		//
		if( theDocument instanceof User )
		{
			if( theDocument.document.hasOwnProperty( Dict.descriptor.kAuthData ) )
				data = theDocument.document[ Dict.descriptor.kAuthData ];
			else
				return null;														// ==>
		}
		
		//
		// Get authentication record
		// from object.
		//
		else if( K.function.isObject( theDocument ) )
		{
			if( theDocument.hasOwnProperty( Dict.descriptor.kAuthData ) )
				data = theDocument[ Dict.descriptor.kAuthData ];
			else
				return null;														// ==>
		}
		
		//
		// Complain.
		//
		else
			throw(
				new MyError(
					'BadParam',							// Error name.
					K.error.MustBeObject,				// Message code.
					this._request.application.language,	// Language.
					null,								// Error value.
					400									// HTTP error code.
				)
			);																	// !@! ==>
		
		//
		// Authentication framework.
		//
		// const crypto = require('@arangodb/crypto');
		const createAuth = require('@arangodb/foxx/auth');
		const auth = createAuth();
		
		return auth.verify( data, thePassword );									// ==>
		
	}	// checkAuthentication
	
}	// User.

module.exports = User;
