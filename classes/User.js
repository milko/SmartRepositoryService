'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Parent.
//
const Persistent = require( './Persistent' );

//
// Classes.
//
const Edge = require( './Edge' );
const Transaction = require( './Transaction' );


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
 * All users must be created by another user, the latter becomes the user's manager
 * who takes responsibility to manage it. Only one user is not required to have a
 * manager, the system administrator: this user can only be created when there are no
 * users in the database. The manager relationships are stored using graph edges. Any
 * manager above the current user hierarchical level is allowed to manage that user.
 *
 * Users can also belong to a group, this membership relationship is also implemented
 * using graph edges. The group can be any Document derived instance and, unlike with
 * managers, a user may be a member of more than one group.
 *
 * All users must also have a password, this is required when a user in inserted for
 * the first time in the database and can be changed when updating or replacing the
 * user record. The password is never stored in the user document, it is used to
 * create an authentication record which is used to validate a provided password and
 * can be provided only using the dedicated setPassword() method.
 *
 * These three properties, the manager, the groups and the password, are not user data
 * members, the corresponding descriptors are set as restricted, but can be
 * intercepted before instantiating the user.
 *
 * The following non persistent data members are used to handle manager references:
 *
 * 	- _manager:			This is a non persistent data member of the object which records
 * 						the manager _id, it can be accessed with the 'manager'
 * 						getter/setter.
 * 	- _manages:			This member holds the number of directly managed users, it is
 * 						set if the object is persistent and is used to prevent having to
 * 						repeatedly probe the database.
 * 	- _groups:			This member holds the list of group _id references to which the
 * 						current	user belongs.
 *
 * The password is never stored in the object, it can only be set externally by the static
 * user interface.
 *
 * Manager hierarchies can be handled by the following methods:
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
 *
 * User groups are set or removed using the setGroup() method, this feature is still
 * under development and has not been finalised.
 */
class User extends Persistent
{
	/**
	 * Constructor
	 *
	 * We overload the constructor to load the user manager if the object becomes
	 * persistent, we first call the parent constructor, then, if the provided
	 * reference was resolved, we load the manager in a non persistent data member of
	 * the object.
	 *
	 * The constructor appends an extra private parameter to prevent an instantiation
	 * cascading: when resolving managers, we instantiate the manager user, this means
	 * that if the manager has a manager the process will become recursive: if you provide
	 * false in the last parameter, the manager will not be resolved. This signature
	 * is used internally: the resulting user object will not be valid, since it will
	 * lack the manager, so clients MUST ALWAYS OMIT THIS PARAMETER when calling the
	 * constructor.
	 *
	 * In this class we follow these steps:
	 *
	 * 	- Call the parent constructor.
	 * 	- If the object is persistent.
	 * 		- If doRelated is true:
	 * 			- Load the user manager from the database.
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
	 * In this class we set the User instance.
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
	 * VALIDATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Validate document
	 *
	 * We overload this method to assert that users other than the system
	 * administrator have a manager.
	 *
	 * Note that we do this here, rather than in validateRequiredProperties(), because
	 * the manager is not a document property and the current document must be valid.
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
			// so we have the guarantee that manages returns the actual information.
			//
			if( (this.manages > 0)						// Manages users
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
				
				return false;														// ==>
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
		return User.isDocumentCollection(
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
	 * We overload this method because inserting a user involves inserting the user
	 * document and inserting the manager relationship.
	 *
	 * We follow these steps:
	 *
	 * 	- If persisting, there is a current session user and the manager has not yet
	 * 	  been set, we set the manager to the current user.
	 * 	- Call the parent insert method.
	 * 	- If persisting and has a manager, insert the manager relationship.
	 *
	 * ToDo:
	 * We cannot implement a stransaction as is, because we need to instantiate the
	 * edge with the user _id, passing the edge class hierarchy currently doesn't worh
	 * with transactions.
	 *
	 * @param doPersist		{Boolean}	True means iwrite to database.
	 * @returns {Boolean}				True if inserted.
	 */
	insertDocument( doPersist )
	{
		//
		// Set manager from current session.
		// If the manager has not already been set,
		// and there is a current user,
		// attempt to set the manager as the current session user.
		//
		if( doPersist
		 && (! this.hasOwnProperty( '_manager' )) )
		{
			//
			// Handle non admin user.
			//
			if( this._document.hasOwnProperty( Dict.descriptor.kUsername )
			 && this._request.hasOwnProperty( 'session' )
			 && this._request.session.hasOwnProperty( 'uid' )
			 && (this._document[ Dict.descriptor.kUsername ] !==
					module.context.configuration.adminCode) )
				this.manager = this._request.session.uid;
			
		}	// Persisting and no manager.
		
		//
		// Call parent method.
		//
		let persistent = super.insertDocument( doPersist );
		
		//
		// Handle manager.
		//
		if( doPersist
		 && this.hasOwnProperty( '_manager' ) )
		{
			//
			// Insert manager.
			//
			try
			{
				this.insertManager();
			}
			catch( error )
			{
				//
				// Remove revision.
				// We want to be sure the user will be deleted.
				//
				if( this._document.hasOwnProperty( '_rev' ) )
					delete this._document._rev;
				
				//
				// Remove user.
				//
				if( persistent )
					db._remove( this._document._id );
				
				//
				// Remove references.
				//
				if( this._document.hasOwnProperty( '_id' ) )
					delete this._document._id;
				if( this._document.hasOwnProperty( '_key' ) )
					delete this._document._key;
				
				//
				// We don't consider the edge, since it cannot have been inserted.
				//
				
				throw( error );													// !@! ==>
			}
		
		}	// Persist and has manager.
		
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
					this._request,					// Current request.
					selector,						// Selector.
					this.defaultEdgeCollection,		// Collection.
					false							// Return mutable.
				);

			//
			// Resolve or insert edge.
			//
			// ToDo
			// Here we simply skip the insert if the edge exists,
			// normally an integrity error should be raised.
			//
			if( ! edge.resolveDocument( false, false ) )
				edge.insertDocument( true );

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
				db._collection( this.defaultEdgeCollection )
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
	 * Remove manager relationship
	 *
	 * This method will remove the relationship between the current user and its
	 * manager. The method will register the operation with the povided transaction.
	 *
	 * Note: you must NOT call this method, consider it private, since, if used
	 * incorrectly, it will corrupt the database.
	 *
	 * @param theTransaction	{Transaction}	The transaction object.
	 */
	removeManager( theTransaction )
	{
		//
		// Do it if we have a manager.
		// Note that we assume the document to be persistent and have the manager.
		//
		if( this.hasOwnProperty( '_manager' ) )
		{
			//
			// Init local storage.
			//
			let result;
			let collection = this.defaultEdgeCollection;
			
			//
			// Get manager relationship references.
			//
			result =
				db._query( aql`
					FOR doc IN ${db._collection(collection)}
						FILTER doc._from == ${this._document._id}
						   AND doc._to == ${this._manager}
						   AND doc.${Dict.descriptor.kPredicate} ==
						   			${`terms/${Dict.term.kPredicateManagedBy}`}
					RETURN { _key: doc._key, _rev: doc._rev }
				`).toArray();
			
			//
			// Continue if there.
			// Note that we cannot have more than one record.
			// ToDo: We don't check if the relationship is missing.
			//
			if( result.length === 1 )
				theTransaction.addOperation(
					'D',						// Operation code.
					collection,					// Collection
					result[ 0 ],				// Selector.
					null,						// Record.
					false,						// waitForSync.
					false,						// Don't return result.
					false						// Don't stop.
				);
			
		}	// Has manager.
		
	}	// removeManager
	
	/**
	 * Remove managed relationships
	 *
	 * This method will remove the relationship between the current user and the users
	 * it manages, it will then transfer all those relationships under the current
	 * user's manager, if it is managed.
	 *
	 * Note: you must NOT call this method, consider it private, since, if used
	 * incorrectly, it will corrupt the database.
	 *
	 * @param theTransaction	{Transaction}	The transaction object.
	 */
	removeManaged( theTransaction )
	{
		//
		// Init local storage.
		//
		let result;
		let collection = this.defaultEdgeCollection;
		
		//
		// Get managed relationship references.
		//
		result =
			db._query( aql`
					FOR doc IN ${db._collection(collection)}
						FILTER doc._to == ${this._document._id}
						   AND doc.${Dict.descriptor.kPredicate} ==
						   			${`terms/${Dict.term.kPredicateManagedBy}`}
					RETURN doc
				`).toArray();
		
		//
		// Iterate relationships.
		//
		for( const record of result )
		{
			//
			// Create deletion selector.
			//
			const selector = {
				_key: record._key,
				_rev: record._rev
			};
			
			//
			// Add deletion operation to transaction.
			//
			theTransaction.addOperation(
				'D',						// Operation code.
				collection,					// Collection
				selector,					// Selector.
				null,						// Record.
				false,						// waitForSync.
				false,						// Don't return result.
				false						// Don't stop.
			);
			
			//
			// Remove identifiers, revision and timestamps.
			//
			for( const field of this.localFields )
			{
				if( record.hasOwnProperty( field ) )
					delete record[ field ]
			}
			
			//
			// Replace current user with its manager.
			// Note that if there is no manager, this will have been caught before
			// getting here.
			//
			record._to = this._manager;
			
			//
			// Instantiate edge.
			//
			const edge = new Edge(
				this._request,
				record,
				collection,
				false
			);
			
			//
			// Normalise document for persisting.
			//
			edge.insertDocument( false );
			
			//
			// Add insertion operation to transaction.
			//
			theTransaction.addOperation(
				'I',						// Operation code.
				collection,					// Collection
				null,						// Selector.
				edge.document,				// Record.
				false,						// waitForSync.
				false,						// Don't return result.
				false						// Don't stop.
			);
			
		}	// Iterating managed edges.
		
	}	// removeManaged
	
	/**
	 * Remove user log entries
	 *
	 * This method will remove all log entries featuring the current user.
	 *
	 * The method will return the result of the operation.
	 *
	 * @param theTransaction	{Transaction}	The transaction object.
	 */
	removeLogEntries( theTransaction )
	{
		//
		// Collect log entries.
		//
		const collection = 'logs';
		const result = db._query( aql`
				FOR doc IN ${db._collection(collection)}
					FILTER doc.user == ${this._document._id}
				RETURN { _key: doc._key, _rev: doc._rev }
		`).toArray();
		
		//
		// Add delete operations to transacton.
		//
		for( const selector of result )
			theTransaction.addOperation(
				'D',						// Operation code.
				collection,					// Collection
				selector,					// Selector.
				null,						// Record.
				false,						// waitForSync.
				false,						// Don't return result.
				false						// Don't stop.
			);
		
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
	
	
	/************************************************************************************
	 * CORE PERSISTENCE METHODS															*
	 ************************************************************************************/
	
	/**
	 * Insert
	 *
	 * This method will insert the document into the database, it expects the current
	 * object to have the collection reference.
	 *
	 * The method exists in order to concentrate in one place database operations,
	 * this allows derived objects to implement transactions where required.
	 *
	 * The method should be called after validation and normalisation operations, this
	 * means that if the doPersist flag is off this method should not be called.
	 *
	 * The method should return the database operation result.
	 *
	 * @returns {Object}			The inserted document metadata.
	 */
	doInsert()
	{
		return db._collection( this._collection ).insert( this._document );			// ==>
		
	}	// doInsert
	
	/**
	 * Remove
	 *
	 * We overload this method to implement a transaction, removing a user involves
	 * the following operations:
	 *
	 * 	- Remove the user document.
	 * 	- Remove the manager relationship.
	 * 	- Transfer all managed users under the current user's manager.
	 * 	- Remove other document references.
	 * 	- Remove log entries.
	 *
	 * The method will return the user remove database operation result.
	 *
	 * @returns {Object}			The removed document metadata.
	 */
	doRemove()
	{
		//
		// Instantiate transaction.
		//
		const trans = new Transaction();
		
		//
		// Create deletion selector.
		//
		let selector = {
			_key: this._document_key,
			_rev: this._document._rev
		};
		
		//
		// Add user removal transaction.
		//
		trans.addOperation(
			'D',								// Operation code.
			this.collection,					// Collection name.
			selector,							// Selector.
			null,								// Data.
			false,								// waitForSync.
			true,								// Use result.
			false								// Stop after.
		);
		
		//
		// Add manager removal transaction.
		//
		this.removeManager( trans );
		
		//
		// Add managed removal transaction.
		//
		this.removeManaged( trans );
		
		//
		// Remove log entries.
		//
		this.removeLogEntries( trans );
		
		//
		// Remove user other references.
		//
		this.removeDocumentReferences( trans );
		
		return trans.execute();														// ==>
		
	}	// doRemove
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
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
					db._collection( this.defaultEdgeCollection )
						.byExample( selector ).count();
				
			}	// Not yet computed.
			
			return this._manages;													// ==>
		}
		
		return null;																// ==>
		
	}	// manages
	
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
	 * If you provide null, it means that the manager is the current session's user.
	 * If the object is persistent, any attempt to set a different value for the
	 * manager will result in an exception.
	 *
	 * The method fails and raises an exception in the following cases:
	 *
	 * 	- If the manager cannot be resolved.
	 * 	- If resolving the manager reference results in more than one document.
	 * 	- If the resolved _id doesn't math the existing _manager data member and the
	 * 	  object is persistent.
	 * 	- If the resolved manager is not allowed to manage users.
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
			// Set reference.
			//
			id = manager.document._id;
			
		}	// Provided a reference.
		
		//
		// Consider current session user.
		//
		else if( this._request.hasOwnProperty( 'session' )
			  && this._request.session.hasOwnProperty( 'uid' ) )
			id = this._request.session.uid;
		
		//
		// Catch manager mismatch in persistent object.
		//
		if( this._persistent )
		{
			//
			// Init local storage.
			//
			const this_manager = ( this.hasOwnProperty( '_manager' ) )
							   ? this._manager
							   : null;
			
			//
			// Assert provided reference matches the current one.
			//
			if( id !== this_manager )
				throw(
					new MyError(
						'UserManagerConflict',				// Error name.
						K.error.UserManagerConflict,		// Message code.
						this._request.application.language,	// Language.
						[ this_manager, id ],					// Arguments.
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
	 * We override this method to return the users collection name.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get defaultCollection()
	{
		return 'users';																// ==>
		
	}	// defaultCollection
	
	/**
	 * Return default edge collection name
	 *
	 * We implement this method to return the edge collection name used for user
	 * relationskips.
	 *
	 * @returns {String}|{null}	The default edge collection name.
	 */
	get defaultEdgeCollection()
	{
		return 'hierarchy';															// ==>
		
	}	// defaultEdgeCollection
	
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
				Dict.descriptor.kPassword,	// User password.
				Dict.descriptor.kManager,	// User manager.
				Dict.descriptor.kGroup		// User groups.
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
	 * @param theGroup		{String}|{Object}	The group reference.
	 * @param doAdd			{Boolean}			True means add reference.
	 * @param theCollection	{String}			The group collection.
	 * @returns {Boolean}						True, succeeded; false not.
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
				this._request,				// The current request.
				document,					// The edge contents.
				this.defaultEdgeCollection,	// The hierarchies collection.
				false						// Return mutable.
			);
			
			//
			// Insert edge.
			//
			if( doAdd )
				return edge.insertDocument( true );									// ==>
			
			//
			// Resolve edge.
			//
			if( edge.resolveDocument( false, false ) )
				return edge.removeDocument( true );									// ==>
			
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
	 * 	- If any error occurs when deleting the current edge and inserting the new one.
	 *
	 * If you try to set a manager to the system administrator, the method will simply
	 * return false.
	 *
	 * @param theManager	{String}|{Object}	The manager reference.
	 * @returns {Object}|{false}				The new edge metadata or false if
	 * 											system administrator.
	 */
	setManager( theManager )
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
			// Instantiate manager.
			//
			const manager =
				new User(
					this._request,	// The current request.
					theManager,		// The document selector.
					null,			// Use default users collection.
					true,			// Return immutable.
					false			// Don't resolve related.
				);
			
			//
			// Resolve manager.
			// Will raise an exception if not found.
			//
			if( ! manager.persistent )
				manager.resolveDocument( true, true );
			
			//
			// Assert it can manage users.
			// Raise exception if not.
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
			// Create current manager edge selector.
			//
			let selector = {};
			selector._to = this.manager;
			selector._from = this._document._id;
			selector[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateManagedBy}`;
			
			//
			// Intstantiate current manager edge.
			//
			let edge =
				new Edge(
					this._request,							// The current request.
					selector,								// The document selector.
					this.defaultEdgeCollection,				// The hierarchies collection.
					false									// Return mutable.
				);
			
			//
			// Resolve edge.
			// Will raise an exception if not found.
			//
			if( ! edge.persistent )
				edge.resolveDocument( true, true );
			
			//
			// Instantiate transaction.
			//
			const trans = new Transaction();
			
			//
			// Add current manager reference removal transaction.
			//
			trans.addOperation(
				'D',										// Operation code.
				this.defaultEdgeCollection,					// Collection name.
				edge.document._id,							// Selector.
				null,										// Data.
				false,										// waitForSync.
				false,										// Don't use result.
				false										// Stop after.
			);
			
			//
			// Clone and clean new edge.
			//
			selector = K.function.clone( edge.document );
			for( const field in edge.localFields )
			{
				if( selector.hasOwnProperty( field ) )
					delete selector[ field ];
			}
			
			//
			// Change manager reference.
			//
			selector._to = manager.document._id;
			
			//
			// Instantiate new manager edge.
			//
			edge =
				new Edge(
					this._request,							// The current request.
					selector,								// The document selector.
					this.defaultEdgeCollection,				// The hierarchies collection.
					false									// Return mutable.
				);
			
			//
			// Load document insert properties,
			// without inserting.
			//
			edge.insertDocument( false );
			
			//
			// Add new manager reference insert transaction.
			//
			trans.addOperation(
				'I',										// Operation code.
				this.defaultEdgeCollection,					// Collection name.
				null,										// Selector.
				edge.document,								// Data.
				false,										// waitForSync.
				true,										// Use result.
				false										// Stop after.
			);
			
			//
			// Execute transaction.
			//
			const meta = trans.execute();
			
			//
			// Set new manager.
			//
			this._manager = manager.document._id;
			
			return meta;															// ==>
			
		}	// Persistent.
		
		throw(
			new MyError(
				'SetManager',						// Error name.
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
	 * @param theDocument	{Document}	Receives authentication record.
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
			theDocument.document[ Dict.descriptor.kAuthData ] = data;
		
		//
		// Set in structure.
		//
		else if( K.function.isObject( theDocument ) )
			theDocument[ Dict.descriptor.kAuthData ] = data;
		
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
