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
 * using graph edges. The group can be any Document derived instance and, unlike with
 * managers, a user may be a member of more than one group.
 *
 * This class adds a series of members which can be used to handle manager hierarchies:
 *
 * - _manager:			This is a non persistent data member of the object which records
 * 						the manager _id, it can be accessed with the 'manager' getter.
 * - _manages:			This member holds the number of directly managed users, it is
 * 						set if the object is persistent and is used to prevent having to
 * 						repeatedly probe the database.
 *
 * Both the group and manager are reserved members, the manager can only be set by
 * providing it in the constructor, or by using the manager() setter while the object
 * is not persistent; the group can only be set once the user has been saved by the
 * dedicated setGroup() method. The current manager can only be changed with the
 * setManager() method, that will assert the current user belongs the the target
 * user's manager hierarchy.
 *
 * Manager hierarchies can be managed by the following methods:
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
 * user's manager, if the current user does not have a manager, which is relevant only
 * for the system administrator, the operation will not be permitted. Once the manager
 * was handled, the method will remove all the user log entries. At the end, the
 * method will call removeDocumentReferences() to remove any edge pointing to the user.
 */
class User extends Document
{
	/**
	 * Constructor
	 *
	 * We overload the constructor to intercept the manager from the provided object
	 * reference, the manager must be provided in the custom '__manager' property and
	 * can take the same signatutes as the theReference parameter to this constructor.
	 *
	 * The manager is stored in the '_manager' data member of this object. All users
	 * MUST have a manager, except the system administrator.
	 *
	 * The user has two unique fields: the _key and the username.
	 *
	 * The constructor adds an extra private parameter to prevent an instantiation
	 * cascading: when resolving managers, for instance, we instantiate the manager
	 * user, this means that if it has a manager the process will go on: if you
	 * provide false in the last parameter, the manager will not be resolved. This
	 * signature is used internally: the resulting user object will not be valid,
	 * since it will lack the manager, so clients MUST ALWAYS OMIT THIS PARAMETER when
	 * calling the constructor.
	 *
	 * In this class we follow these steps:
	 *
	 * 	- Extract and remove the manager reference from the provided object selector.
	 * 	- Call the parent constructor.
	 * 	- If doRelated is true:
	 * 		- If the object is persistent:
	 * 			- We initialise the manager with the eventual one found in the
	 * 			  database.
	 * 		- If the manager was provided, we set it; this covers the case in which
	 * 		  the object is not persistent, or if the manager was not explicitly provided.
	 *
	 * This class implements the defaultCollection() method, which returns the users
	 * collection name. Users reside by default in that collection and the database
	 * expects users to be found in it.
	 *
	 * There may be cases in which we want to grant access to an entity other than a
	 * human user, such as a procedure or external service, in that case you can
	 * provide the collection explicitly which will override the default one. Note
	 * that only elements of the users collection can be managers.
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
		let manager = null;
		
		//
		// Extract and remove the manager from the selector.
		//
		if( K.function.isObject( theReference ) )
		{
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
		// Resolve manager manager.
		//
		if( doRelated )
		{
			//
			// If the object is persistent,
			// set the manager by resolving the edge.
			//
			if( this._persistent )
			{
				//
				// We set the manager data member directly
				// if there is a manager relationship in the database.
				//
				const reference = this.resolveManager();
				if( reference !== null )
					this.manager = reference;
			}
			
			//
			// Set _manager data member if manager was provided.
			// Here we raise an exception if the provided manager
			// does not match the one in the database,
			// if not, the setter will not need to replace the value.
			//
			if( manager !== null )
				this.manager = manager;
		
		}	// Handle related objects.
		
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
				if( doAssert )
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
	 * We overload this method's dignature to provide the user password. The method
	 * will first create the authentication record, set it in the document, insert the
	 * document and finally insert the manager edge.
	 *
	 * The method performs these operations sequentially without programmatically
	 * rolling back if the transaction, for this reason it is the responsibility of
	 * the caller to enclose the business logic in a transaction.
	 *
	 * Note: all persistence methods should first handle the user: the parent class
	 * will raise an exception if the method was called in the wrong context.
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
		// Insert user and manager.
		//
		let persistent = false;
		try
		{
			//
			// Insert user.
			//
			persistent = super.insertDocument();
			
			//
			// Insert manager.
			//
			if( persistent )
				this.insertManager();
		}
		catch( error )
		{
			//
			// Delete authentication record.
			//
			if( this._document.hasOwnProperty( Dict.descriptor.kAuthData ) )
				delete this._document[ Dict.descriptor.kAuthData ];
			
			//
			// Remove revision.
			// We wan t the user to be deleted.
			//
			if( this._document.hasOwnProperty( '_rev' ) )
				delete this._document._rev;
			
			//
			// Remove user.
			//
			if( persistent )
				db._remove( this._document );
			
			throw( error );															// ==>
		}
		
		return persistent;															// ==>
		
	}	// insertDocument
	
	/**
	 * Insert manager relationship
	 *
	 * If the current user has a manager, this method will insert the edge relating the
	 * user with its manager and return the edge's _id; if the current user has no
	 * manager, the method will return null.
	 *
	 * This method is called by insertDocument() only if the document was correctly
	 * inserted, so in this method we have the guarantee that the current object is
	 * persistent and that its _id is available.
	 *
	 * The goal of this method is to ensure there is a relationship between the
	 * current user and its manager, if the edge already exists, the method will
	 * intentionally not raise an exception. This is wanted, because this way eventual
	 * integrity errors might be fixed.
	 *
	 * ToDo: If the edge exists, duplicate error is not raised.
	 * This case should be handled in the future, currently, the methods of this class
	 * ensure the integrity of the database is protected, not asserted.
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
		if( this.hasOwnProperty( '_manager' ) )
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
			// We use the Edge class to add timestamps and other panaphrelia.
			//
			const edge =
				new Edge(
					this._request,	// Current request.
					selector,		// Selector.
					'schemas',		// Collection.
					false			// Return mutable.
				);
			
			//
			// Resolve or insert edge.
			//
			// ToDo
			// Here we simply skip the insert if the edge exists,
			// normally an integrity error should be raised.
			//
			if( ! edge.resolveDocument( false, false ) )
				edge.insertDocument();
			
			return edge.document._id;												// ==>
			
		}	// Has manager.
		
		return null;																// ==>
		
	}	// insertManager
	
	/**
	 * Resolve document
	 *
	 * We overload this method to resolve the manager.
	 *
	 * Regardless of the doAssert value, if the manager cannot be resolved, the method
	 * will raise an exception: the reference is expected to be valid.
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
			// Resolve manager.
			// Any error raises an exception regardless of doAssert.
			// Note that we set the manager data member with the setter,
			// this will ensure that the database and current managers are the same,
			// particularly if resolveManager() returns null, the _manager member
			// should not be there and if it returns a value, this must match the
			// existing one.
			//
			this.manager = this.resolveManager();
			
		}	// Resolved user.
		
		return persistent;															// ==>
		
	}	// resolveDocument
	
	/**
	 * Resolve user manager
	 *
	 * This method will attempt to locate the edge relating the current user to its
	 * manager, for this reason it should only be called on persistent objects.
	 *
	 * The method is called by the constructor to resolve the manager existing in the
	 * database if the object is persistent, it is also called when resolving the
	 * object to set the manager, or assert that the eventual existing manager matches
	 * the found one.
	 *
	 * The method will return the _to property of the found edge, or null, if the
	 * object is not persistent or if the edge was not found.
	 *
	 * The method will raise an exception if there is more than one edge with the
	 * current user in _from and the managed-by predicate in the predicate: this
	 * combination must be unique in the database.
	 *
	 * @returns {String}|{null}		Resolved edge _to property, or null.
	 */
	resolveManager()
	{
		//
		// Only if persistent.
		//
		if( this._persistent )
		{
			//
			// Look in schema edges.
			// The combination must be unique.
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
			// This means database integrity violation.
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
				return cursor.toArray()[ 0 ]._to;									// ==>
			
		}	// Object is persistent.
		
		return null;																// ==>
		
	}	// resolveManager
	
	/**
	 * Replace document
	 *
	 * We overload this method's signature by appending the password parameter, it is
	 * used to update the authentication record in the event of a password change: if
	 * provided, the authentication record will be replaced; if not, the
	 * authentication record will not be changed.
	 *
	 * Note: all persistence methods should first handle the user: the parent class
	 * will raise an exception if the method was called in the wrong context.
	 *
	 * @param doRevision	{Boolean}		If true, check revision (default).
	 * @param thePassword	{String}|{null}	If provided, update authentication data.
	 * @returns {Boolean}					True if replaced or false if not valid.
	 */
	replaceDocument( doRevision = true, thePassword = null )
	{
		//
		// Handle no new password.
		//
		if( thePassword === null )
			return super.replaceDocument( doRevision );								// ==>
		
		//
		// If persistent and provided password, update authentication record.
		// Note that we copy the structure of the parent method: we need to do it
		// because we have to set the authentication record.
		//
		if( this._persistent )
		{
			//
			// Save authentication record.
			// We will reset it if replace fails.
			// Note that we assume it is there: all users must have it.
			//
			const auth = this._document[ Dict.descriptor.kAuthData ];
			
			//
			// Remove.
			//
			try
			{
				//
				// Set authentication record.
				//
				User.setAuthentication( thePassword, this );
				
				//
				// Call parent method.
				//
				if( ! super.replaceDocument( doRevision ) )
				{
					//
					// Reset to old authentication.
					//
					this._document[ Dict.descriptor.kAuthData ] = auth;
					
					return false;													// ==>
				}
				
				return true;														// ==>
			}
			catch( error )
			{
				//
				// Reset authentication.
				//
				this._document[ Dict.descriptor.kAuthData ] = auth;
				
				throw( error );													// !@! ==>
			}
			
		}	// Object is persistent.
		
		throw(
			new MyError(
				'ReplaceDocument',					// Error name.
				K.error.IsNotPersistent,			// Message code.
				this._request.application.language,	// Language.
				null,								// Arguments.
				409									// HTTP error code.
			)
		);																		// !@! ==>
		
	}	// replaceDocument
	
	/**
	 * Remove document
	 *
	 * We overload this method to handle group and manager relationships. The method
	 * will perform the following steps:
	 *
	 * 	- Remove the user.
	 * 	- If successful:
	 * 		- Transfer managed users under the current user's manager.
	 * 		- Remove the relationship with the manager.
	 * 		- Remove all log entries concerning the user.
	 * 		- Remove all edge references to the current user.
	 *
	 * If the current document revision is different than the existing document
	 * revision, the method will raise an exception.
	 *
	 * If the current user manages other users, but has no manager, the method will
	 * raise an exception: this is caught in validateDocumentConstraints().
	 *
	 * ToDo: No integrity check is performed on the current database state.
	 * When removing the manager, no exception is raised if the manager to be deleted
	 * doesn't exist: this is intentional, currently, the methods of this class
	 * ensure the integrity of the database is protected, not asserted.
	 *
	 * @returns {Boolean}	True removed, false not found, null not persistent.
	 */
	removeDocument()
	{
		//
		// Call parent method.
		// The parent method will proceed only if the user is persistent:
		// if this method was called by insert(), it will proceed only if
		// the user was actually inserted or if it exists.
		//
		const result = super.removeDocument();
		
		//
		// Remove group and manager.
		// Only if the user has been removed or exists.
		//
		if( result === true )
		{
			//
			// Remove manager relationship.
			//
			// ToDo
			// Musat implement transactions...
			// Must not fail.
			// When called by insert(), the doGroup flag indicates whether
			// the group edge was inserted, if that is not the case, the
			// group edge might already exist and should not be removed.
			//
			this.removeManager();
			
			//
			// Remove log entries.
			//
			this.removeLogEntries();
			
			//
			// Remove user other references.
			//
			this.removeDocumentReferences();
			
		}	// Removed current document.
		
		return result;																// ==>
		
	}	// removeDocument
	
	/**
	 * Remove manager relationship
	 *
	 * This method will remove the relationship between the curren user and its
	 * manager and will transfer the eventual managed users under the current user's
	 * manager.
	 *
	 * This method is called after validateDocumentConstraints(), which asserts that
	 * if the current user has mnaged users it does have a manager, which means that
	 * the method should guarantee that no users are left without a manager.
	 *
	 * The method can also be called by the constructor, in the event of an error: in
	 * that case the method parameter is expected to be the edge _id, in this case it
	 * will only remove the referenced edge.
	 *
	 * The method will perform the following steps:
	 *
	 * 	- If the reference is provided:
	 * 		- Remove that edge.
	 *  - If the reference was not provided, or null:
	 * 		- Collect all edges relating managed users to the current user, if found,
	 * 		  perform the following with each edge:
	 * 			- Remove the edge.
	 * 			- Delete local fields from the edge.
	 * 			- Set the edge _to to the current user's manager.
	 * 			- Insert the edge.
	 * 		- Select the edge relating the current user with its manager.
	 * 		- Remove the edge.
	 *
	 * The method will return true if the manager edge was removed.
	 *
	 * ToDo: The database structure is not asserted before the method completes.
	 * 		 The mothod only guarantees that once run, no manager relationship will
	 * 		 exist involving the current user: a structure integrity check should be
	 * 		 run before the method operates and logged for post handling.
	 *
	 * Note: this method will be called only if the user is persistent, therefore it
	 * is guaranteed that the user _id exists.
	 *
	 * Note: you must NOT call this method, consider it private, since, if used
	 * incorrectly, it will corrupt the database.
	 *
	 * @param theReference	{String}|{null}	The edge to remove, or null.
	 * @returns {Boolean}					True, deleted.
	 */
	removeManager( theReference = null )
	{
		//
		// Handle edge reference.
		//
		if( theReference !== null )
		{
			//
			// Remove edge.
			//
			try
			{
				db._remove( theReference );
			}
			catch( error )
			{
				//
				// ToDo
				// We ignore any error, this is because here we only ensure that once
				// run, the edge does not exist; if the edge is not there in the first
				// place, it is an error and it should be handled.
				//
				return false;														// ==>
			}
			
			return true;															// ==>
			
		}	// Provided edge reference.
		
		//
		// Select all edges where the current user is manager.
		//
		const sel_managed = {};
		sel_managed._to = this._document._id;				// Current user.
		sel_managed[ Dict.descriptor.kPredicate ] =		// Manager predicate.
			`terms/${Dict.term.kPredicateManagedBy}`;
		const managed =
			db._collection( 'schemas' )
				.byExample( sel_managed ).toArray();
		
		//
		// Swap current user with current user's manager
		// and remove the original edge.
		//
		for( const edge of managed )
		{
			//
			// Remove relationship to current user.
			//
			const sel_current = {};
			sel_current._to = edge._to;
			sel_current._from = edge._from;
			sel_current[ Dict.descriptor.kPredicate ] =
				edge[ Dict.descriptor.kPredicate ];
			db._collection( 'schemas' )
				.removeByExample( sel_current );
			
			//
			// Remove identifiers, revision and timestamps.
			//
			for( const field of this.localFields )
			{
				if( edge.hasOwnProperty( field ) )
					delete edge[ field ]
			}
			
			//
			// Swap manager from current user to current user's manager.
			//
			edge._to = this.manager;
			
			//
			// Instantiate edge.
			//
			const new_edge = new Edge( this._request, edge, 'schemas' );
			
			//
			// Resolve edge.
			// We resolve the edge without raising exceptions,
			// if the edge doesn't exist we insert it,
			// if it does, we do nothing.
			//
			// ToDo
			// If the edge already exists, we do not attempt to insert it,
			// this case obviously indicates a database structure corruption.
			// A solution should be devised to prevent this from happening,
			// like implementing an exception que.
			//
			if( new_edge.resolve( false, false ) !== true )
				new_edge.insert();
			
		}	// Transferring managed users under current manager.
		
		//
		// Remove relationship to current manager.
		// Note that we are guaranteed the current user has a manager.
		// We reuse the original selector, since it has the correct predicate.
		//
		sel_managed._from = this._document._id;
		sel_managed._to	  = this._manager;
		return (
			db._collection( 'schemas' )
				.removeByExample( selector )
				.count() > 0
		);																			// ==>
		
	}	// removeManager
	
	/**
	 * Remove user log entries
	 *
	 * This method will remove all log entries featuring the current user.
	 *
	 * The method will return the result of the operation.
	 *
	 * @returns {*}	The results of the operation.
	 */
	removeLogEntries()
	{
		//
		// Remove entries.
		//
		const collection = db._collection( 'logs' );
		return db._query( aql`
				FOR doc IN ${collection}
					FILTER doc.user == ${this._document._id}
					REMOVE doc IN ${collection}
		`);																			// ==>
	
	}	// removeLogEntries
	
	
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
	 * Set current manager reference
	 *
	 * The method will set the _manager data member with the document _id of the
	 * provided user reference.
	 *
	 * This method is used both to set the data member and to assert that the provided
	 * reference and the existing references match in the event that the object is
	 * persistent. To change the manager, you must use the dedicated setManager() method.
	 *
	 * The provided reference can either be the user _id or _key as a string
	 * reference, or an object containing the key fields, in this case the username.
	 * If you provide null, it means that the current user doesn't have a manager, in
	 * this case the data member will deleted; if the object is persistent, any
	 * attempt to set a different value for the manager will result in an exception.
	 *
	 * The method fails and raises an exception in the following cases:
	 *
	 * 	- If the manager cannot be resolved.
	 * 	- If resolving the manager reference results in more than one document.
	 * 	- If the resolved _id doesn't math the existing _manager data member and the
	 * 	  object is persistent.
	 *
	 * @param theReference	{String}|{Object}{null}	The manager reference.
	 */
	set manager( theReference )
	{
		//
		// Init local storage.
		//
		let id = null;
		
		//
		// Handle provided reference.
		//
		if( theReference !== null )
		{
			//
			// Instantiate manager.
			// Will raise an exception if not found.
			//
			const manager =
				new User(
					this._request,		// Current request.
					theReference,		// Manager reference.
					null,				// Force users collection.
					false,				// Return mutable.
					false				// Don't resolve related.
				);
			
			//
			// Resolve document.
			//
			if( ! manager.persistent )
				manager.resolveDocument( true, true );
			
			//
			// Set reference.
			//
			id = manager.document._id;
			
		}	// Provided a reference.
		
		//
		// Catch manager mismatch in persistent object.
		//
		if( this._persistent )
		{
			//
			// Init local storage.
			//
			const this_id = ( this.hasOwnProperty( '_manager' ) )
						  ? this._manager
						  : null;
			
			//
			// Assert provided reference matches the current one.
			//
			if( id !== this_id )
				throw(
					new MyError(
						'UserManagerConflict',				// Error name.
						K.error.UserManagerConflict,		// Message code.
						this._request.application.language,	// Language.
						[ this_id, id ],					// Arguments.
						409									// HTTP error code.
					)
				);																// !@! ==>
			
		}	// Object is persistent.
		
		//
		// Handle non persistent object.
		// Note that if persistent they must match, so no need to set.
		//
		else
			this._manager = id;
		
	}	// manager
	
	/**
	 * Return current manager reference
	 *
	 * The method returns the contents of the _manager data member, or null, if it is
	 * not set.
	 *
	 * @returns {String}|{null}	The current user manager reference.
	 */
	get manager()
	{
		return ( this.hasOwnProperty( '_manager' ) )
			   ? this._manager														// ==>
			   : null;																// ==>
		
	}	// manager
	
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
	
	/**
	 * Return local fields list
	 *
	 * We overload this method to add the time stamps.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get localFields()
	{
		return super.localFields
			.concat([
				Dict.descriptor.kCStamp,	// Creation time stamp.
				Dict.descriptor.kMStamp		// Modivifation time stamp.
			]);																		// ==>
		
	}	// localFields
	
	/**
	 * Return restricted fields list
	 *
	 * We overload this nethod to add the password.
	 *
	 * @returns {Array}	The list of restricted fields.
	 */
	get restrictedFields()
	{
		return super.restrictedFields
			.concat(
				Dict.descriptor.kPassword	// Prevent password from being stored.
			);																		// ==>
		
	}	// restrictedFields
	
	
	/************************************************************************************
	 * REFERENCES INTERFACE																*
	 ************************************************************************************/
	
	/**
	 * Set or remove group relationship
	 *
	 * This method can be used to manage the group of a persistent user, the method
	 * expects the following parameters:
	 *
	 * 	- theGroup:			The group reference as would be provided to the Document
	 * 						constructor.
	 * 	- doAdd:			A boolean flag that if true means add the relation to the
	 * 						provided group, if false, remove it, if it exists.
	 * 	- theCollection:	The group's collection name, if the provided reference is
	 * 						not an _id.
	 *
	 * The method will return the results of the operation, or raise an exception on
	 * errors.
	 *
	 * The method will also raise an exception if the object is not persistent.
	 *
	 * @returns {Boolean}	True, succeeded; false not.
	 */
	setGroup( theGroup, doAdd, theCollection = null )
	{
		//
		// Assert persistent object.
		//
		if( this._persistent )
		{
			//
			// Resolve group.
			// Will raise an exception if not found.
			//
			const group =
				new Document(
					this._request,	// The current request.
					theGroup,		// The document selector.
					theCollection,	// The eventual group collection.
					true			// Return immutable.
				);
			
			//
			// Compile edge.
			//
			const document = {};
			document._to = group.document._to;
			document._from = group.document._from;
			document[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateGroupedBy}`;
			
			//
			// Create edge.
			//
			const edge = new Edge(
				this._request,		// The current request.
				document,			// The edge contents.
				'schemas',			// The schemas collection.
				false				// Return mutable.
			);
			
			//
			// Insert edge.
			//
			if( doAdd )
				return edge.insertDocument();										// ==>
			
			//
			// Resolve edge.
			//
			if( edge.resolveDocument( false, false ) )
				return edge.removeDocument();										// ==>
			
			return false;															// ==>
			
		}	// Persistent.
		
		throw(
			new MyError(
				'SetGroup',							// Error name.
				K.error.IsNotPersistent,			// Message code.
				this._request.application.language,	// Language.
				null,								// Arguments.
				409									// HTTP error code.
			)
		);																		// !@! ==>
		
	}	// setGroup
	
	/**
	 * Switch manager
	 *
	 * This method can be used to change the manager of the current user, the method
	 * expects a single parameter as the reference provided to the User constructor.
	 *
	 * The method will perform the following operations:
	 *
	 * 	- Resolve the provided manager.
	 * 	- Assert it can manage users.
	 * 	- Transfer all users managed by the current user under the provided manager.
	 * 	- Remove the relationship with the current manager.
	 * 	- Set the relationship with the current manager.
	 * 	- Update the current user object data member.
	 *
	 * The method will raise an exception on any eror and also in the following cases:
	 *
	 * 	- If the current object is not persistent.
	 * 	- If the provided manager user does not have the required role.
	 *
	 * If you try to set a manager to the system administrator, the method will simply
	 * return false.
	 *
	 * @returns {Boolean}	True, succeeded; false not.
	 */
	setManager( theGroup, doAdd, theCollection = null )
	{
		//
		// Assert persistent object.
		//
		if( this._persistent )
		{
			//
			// Assert has manager.
			//
			if( this._document[ Dict.descriptor.kUsername ]
				=== module.context.configuration.adminCode )
				return false;														// ==>
			
			//
			// Resolve manager.
			// Will raise an exception if not found.
			//
			const manager =
				new User(
					this._request,	// The current request.
					theGroup,		// The document selector.
					theCollection,	// The eventual group collection.
					true,			// Return immutable.
					false			// Don't resolve related.
				);
			
			//
			// Save IDs.
			//
			const id_user = this._document._id;
			const id_manager = manager._document._id;
			
			//
			// Assert it can manage users.
			//
			if( ! manager._document[ Dict.descriptor.kRole ].includes( Dict.term.kRoleUser ) )
				throw(
					new MyError(
						'SetManager',						// Error name.
						K.error.CannotManageUsers,			// Message code.
						this._request.application.language,	// Language.
						null,								// Arguments.
						409									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Init local storage.
			//
			const predicate = `terms/${Dict.term.kPredicateManagedBy}`;
			const predicate_field = Dict.descriptor.kPredicate;
			
			//
			// Get current manager edge.
			//
			const selector = {};
			selector._to = this.manager;
			selector._from = id_user;
			selector[ predicate_field ] = predicate;
			let edge =
				new Edge(
					this._request,	// The current request.
					selector,		// The document selector.
					'schemas',		// The schemas collection.
					false			// Return mutable.
				);
			
			//
			// Select all edges where the current user is manager.
			//
			selector._to = id_user;	// Points to current user.
			delete selector._from;	// Any source node.
			const managed =
				db._collection( 'schemas' )
					.byExample( sel_managed )
					.toArray();
			
			//
			// Swap current user with current user's manager
			// and remove the original edge.
			//
			for( const item of managed )
			{
				//
				// Remove relationship to current user.
				//
				selector._from = item._from;	// Set the source node.
				db._collection( 'schemas' )
					.removeByExample( sel_current );
				
				//
				// Remove identifiers, revision and timestamps.
				//
				for( const field of this.localFields )
				{
					if( item.hasOwnProperty( field ) )
						delete item[ field ]
				}
				
				//
				// Swap manager from current user to current user's manager.
				//
				item._to = id_manager;
				
				//
				// Instantiate edge.
				//
				const new_edge = new Edge( this._request, item, 'schemas' );
				
				//
				// Resolve edge.
				// We resolve the edge without raising exceptions,
				// if the edge doesn't exist we insert it,
				// if it does, we do nothing.
				//
				// ToDo
				// If the edge already exists, we do not attempt to insert it,
				// this case obviously indicates a database structure corruption.
				// A solution should be devised to prevent this from happening,
				// like implementing an exception que.
				//
				if( new_edge.resolve( false, false ) !== true )
					new_edge.insert();
				
			}	// Transferring managed users under current manager.
			
			//
			// Remove relationship to current manager.
			//
			edge.removeDocument();
			
			//
			// Update directly the current user manager.
			//
			this._manager = id_manager;
			
			//
			// Remove identifiers, revision and timestamps.
			//
			const data = JSON.parse(JSON.stringify(edge._document));
			for( const field of this.localFields )
			{
				if( data.hasOwnProperty( field ) )
					delete data[ field ]
			}
			
			//
			// Set new manager.
			//
			data._to = id_manager;
			
			//
			// Create new edge.
			//
			edge =
				new Edge(
					this._request,	// The current request.
					data,			// The edge contents.
					'schemas',		// The schemas collection.
					false			// Return mutable.
				);
			
			//
			// Insert updated edge.
			//
			// ToDo: If insertion fails, it should only be because of a duplicate.
			// If that is not the case, the database is corrupt: need to implement
			// safeguards.
			//
			edge.insertDocument();
			
		}	// Persistent.
		
		throw(
			new MyError(
				'SetGroup',							// Error name.
				K.error.IsNotPersistent,			// Message code.
				this._request.application.language,	// Language.
				null,								// Arguments.
				409									// HTTP error code.
			)
		);																		// !@! ==>
		
	}	// setManager
	
	
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
