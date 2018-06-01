'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const traversal = require("@arangodb/graph/traversal");
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );
const Dictionary = require( '../utils/Dictionary' );

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
 * This class implements a user object.
 *
 * The class overloads the parent members by adding two properties:
 *
 * 	- group:	The user group reference, it is optional.
 * 	- manager:	The user manager reference, it is required.
 *
 * When instantiating a new user, these properties must be provided in the
 * constructor, when instantiating an existing object, these properties may be omitted
 * from the constructor. The manager is required, the group is optional.
 *
 * When an object is resolved, if the declared group or manager conflicts with the
 * found values, an exception will be raised.
 *
 * The class expects all required collections to exist.
 */
class User extends Document
{
	/**
	 * Constructor
	 *
	 * We overload the constructor to add the manager and group properties:
	 *
	 * 	- theManager:	Provide the user reference of the manager. The parameter is
	 * 					required if the user is new and has to be inserted, it can be
	 * 					omitted if the user already exists.
	 * 	- theGroup:		Provide a group reference. The parameter is optional.
	 *
	 * These two parameters should only be provided when instantiating a new non
	 * persistent object, if the object exists in the database, these can be omitted.
	 *
	 * When resolving these two parameters, if any of the provided references conflict
	 * with the values in the database, the method will raise an exception.
	 *
	 * @param theRequest	{Object}					The current request.
	 * @param theReference	{String}|{Object}			The document reference or object.
	 * @param theGroup		{String}|{Object}|{null}	The user group reference.
	 * @param theManager	{String}|{Object}|{null}	The user manager reference.
	 * @param isImmutable	{Boolean}					True, instantiate immutable document.
	 */
	constructor(
		theRequest,
		theReference,
		theGroup = null,
		theManager = null,
		isImmutable = false
	)
	{
		//
		// Call parent constructor.
		// Note that we enforce the users collection.
		//
		super(
			theRequest,		// Current request.
			theReference,	// Document reference or user object.
			null,			// Collection is set by default.
			isImmutable		// Immutable object.
		);
		
		//
		// Init local storage.
		//
		let reference;
		
		//
		// Resolve group.
		// Cannot fail.
		//
		reference = this.resolveGroupReference( theGroup );
		if( reference !== null )
			this.group = reference;
		
		//
		// Resolve manager.
		// Cannot fail.
		//
		reference = this.resolveManagerReference( theManager );
		if( reference !== null )
			this.manager = reference;
		
	}	// constructor
	
	/**
	 * Resolve from database
	 *
	 * We overload this method to resolve the user group and manager.
	 *
	 * Note that the parent method will resolve the object according to the
	 * significant fields in the object: this means that the document will be resolved
	 * using the user code.
	 *
	 * Regardless of the doAssert value, if the group or manager cannot be resolved,
	 * the method will raise an exception: these two references are expected to be valid.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	If true, an exception will be raised if not found
	 * 								(defaults to true).
	 * @returns {Boolean}			True if found.
	 */
	resolve( doReplace = false, doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.resolve( doReplace, doAssert ) )
		{
			//
			// Resolve group.
			// Any error raises an exception regardless of doAssert.
			//
			this.resolveGroupEdge();
			
			//
			// Resolve manager.
			// Any error raises an exception regardless of doAssert.
			//
			this.resolveManagerEdge();
			
			return true;															// ==>
		
		}	// Found.
		
		return false;																// ==>
		
	}	// resolve
	
	/**
	 * Insert object
	 *
	 * We overload this method to create the authentication record with the provided
	 * password and to add the group and manager edges.
	 *
	 * The method will proceed as follows:
	 *
	 * 	- It will first insert the user document.
	 * 	- It will then insert the group edge, if provided.
	 * 	- It will finally insert the manager edge.
	 * 	- If any of these operations fail, the method will take care of removing the
	 * 	  user document, the group and manager edges, and will raise an exception.
	 *
	 * Note that when inserting the group or the manager edges and there is any error,
	 * only the newly inserted edges will be deleted.
	 *
	 * @param thePassword	{String} The user password.
	 * @returns {Boolean}	True, document inserted.
	 */
	insert( thePassword )
	{
		//
		// Init local storage.
		//
		let inserted_group = false;
		let inserted_manager = false;
		
		//
		// Set authentication record.
		//
		User.authSet( thePassword, this );
		// this.createAuthentication( thePassword );
		
		//
		// Insert user.
		// If there is an error, an exception will be raised
		// before we have a chance of adding group and manager:
		// this means that any error after this point should trigger
		// the removal of the user and the eventual group and manager edges.
		//
		// This also means that in the remove() method the persistent flag
		// will determine if the user has to be removed: on errors the persistent flag
		// will be reset, which means that the parent remove() method will not
		// proceed; if the user was inserted, the persistent flag will be set.
		//
		const result = super.insert();
		
		//
		// Try to insert group and manager.
		//
		try
		{
			//
			// Insert group relationhip.
			//
			inserted_group = this.insertGroup();
			
			//
			// Insert manager relationhip.
			//
			inserted_manager = this.insertManager();
			
			return result;															// ==>
		}
		catch( error )
		{
			//
			// Remove current object.
			// The method will take care of removing eventual group and manager.
			//
			this.remove( inserted_group, inserted_manager );
			
			//
			// Forward exception.
			//
			throw( error );														// !@! ==>
		}
		
	}	// insertDocument
	
	/**
	 * Insert group relationship
	 *
	 * This method will insert the edge relating the current user with its group, if
	 * the group was provided.
	 *
	 * The method will raise an exception on any error and return true if the edge was
	 * inserted.
	 *
	 * @returns {Boolean}	True means inserted.
	 */
	insertGroup()
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
			const doc = {};
			doc._from = this._document._id;
			doc._to   = this.group;
			doc[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateGroupedBy}`;
			
			//
			// Insert.
			//
			const edge = new Edge( this._request, doc, 'schemas' );
			edge.insert();
			
			return true;															// ==>
			
		}	// Has group.
		
		return false;																// ==>
		
	}	// insertGroup
	
	/**
	 * Insert manager relationship
	 *
	 * This method will insert the edge relating the current user with its manager, if
	 * the manager is missing, the method will do nothing.
	 *
	 * The method will raise an exception on any error and return true if the edge was
	 * inserted.
	 *
	 * @returns {Boolean}	True means inserted.
	 */
	insertManager()
	{
		//
		// Check manager.
		//
		if( this.hasOwnProperty( 'manager' )
		 && this._document.hasOwnProperty( '_id' ) )
		{
			//
			// Build selector.
			//
			const doc = {};
			doc._from = this._document._id;
			doc._to   = this.manager;
			doc[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateManagedBy}`;
			
			//
			// Insert.
			//
			const edge = new Edge( this._request, doc, 'schemas' );
			edge.insert();
			
			return true;															// ==>
			
		}	// Has manager.
		
		return false;																// ==>
		
	}	// insertManager
	
	/**
	 * Replace
	 *
	 * We overload this method to provide the new password: if null, the
	 * authentication record will not be changed; if provided, the authentication
	 * record will be updated.
	 *
	 * @param doRevision	{Boolean}		If true, check revision (default).
	 * @param thePassword	{String}|{null}	If provided, update authentication data.
	 * @returns {Boolean}	True replaced, false not found, null not persistent.
	 */
	replace( doRevision = true, thePassword = null )
	{
		//
		// If persistent and provided password,
		// update authentication record.
		//
		if( this._persistent
		 && (thePassword !== null) )
			User.authSet( thePassword, this );
			// this.createAuthentication( thePassword );
		
		return super.replace( doRevision );											// ==>
		
	}	// replace
	
	/**
	 * Remove object
	 *
	 * This method will remove the current document from the database, it will first
	 * remove the user, then the eventual group relationship and finally the manager
	 * relationship and will return true, if the document exists, or false if it doesn't.
	 *
	 * If the current document revision is different than the existing document
	 * revision, the method will raise an exception.
	 *
	 * If the current document doesn't exist or was deleted, the method will set the
	 * persistent flag to false.
	 *
	 * If the current user manages other users, but has no manager, the method will
	 * raise an exception.
	 *
	 * The method expects two parameters that were passed by the insertDocument()
	 * method, these two flags indicate whether the group or manager edges were
	 * inserted: these are necessary in cases where the insert procedure finds an
	 * existing edge, removing it might corrupt the database structure.
	 *
	 * @param doGroup	{Boolean}	If true, remove group (default).
	 * @param doManager	{Boolean}	If true, remove manager (default)
	 * @returns {Boolean}	True removed, false not found, null not persistent.
	 */
	remove( doGroup = true, doManager = true )
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
		
	}	// remove
	
	/**
	 * Remove group relationship
	 *
	 * This method will remove the current user group relationship, if it is set in
	 * the object, it will return true if the user has a group, or false if not.
	 *
	 * If the edge was not found, the method will not raise an exception.
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
	
	/**
	 * Set class
	 *
	 * This method will set the document class, which is the _key reference of the
	 * term defining the document class.
	 *
	 * In this class there is no defined class, so the value will be null.
	 */
	setClass()
	{
		this._class = 'User';
		
	}	// setClass
	
	/**
	 * Check collection type
	 *
	 * This method will check if the collection is of the correct type, if that is not
	 * the case, the method will raise an exception.
	 *
	 * In this class we expect a document collection.
	 */
	checkCollectionType()
	{
		//
		// Check collection type.
		//
		if( db._collection( this._collection ).type() !== 2 )
			throw(
				new MyError(
					'BadCollection',					// Error name.
					K.error.ExpectingDocColl,			// Message code.
					this._request.application.language,	// Language.
					this._collection,					// Error value.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
	}	// checkCollectionType
	
	/**
	 * Return default collection name
	 *
	 * We override this method to force the users collection.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	defaultCollection()
	{
		return 'users';																// ==>
		
	}	// defaultCollection
	
	/**
	 * Load computed fields
	 *
	 * We overload this method to set the preferred language to the default
	 * application language if the property is missing.
	 *
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	loadComputedProperties( doAssert = true )
	{
		//
		// Set default language.
		//
		if( ! this._document.hasOwnProperty( Dict.descriptor.kLanguage ) )
			this._document[ Dict.descriptor.kLanguage ] =
				module.context.configuration.defaultLanguage;
		
		return true;																// ==>
		
	}	// loadComputedProperties
	
	/**
	 * Resolve group edge
	 *
	 * This method can be used to set the current user's group relationship, it is
	 * called when resolving the object and will update the user's group.
	 *
	 * This method will attempt to locate the edge relating the current user with its
	 * group, if such edge was located, the method will assert if the eventual
	 * existing group reference matches the found edge: if that is not the case, the
	 * method will raise an exception; if the current object does not have a group,
	 * the method will set it.
	 *
	 * If more than one edge matches the selection, the method will raise an
	 * exception, since only one edge should relate a user with a group.
	 *
	 * If no edge matches the selection and a group is set in the object, the method
	 * will also raise an exception, because the resolved and existing groups do not
	 * match.
	 *
	 * The method is called by resolve() which will call it only if the user was
	 * resolved, this means that the method expects the user to have all its identifiers.
	 *
	 * The method does not return any value, it either succeeds or it raises an exception.
	 */
	resolveGroupEdge()
	{
		//
		// Init local storage.
		//
		const exists = this.hasOwnProperty( 'group' );
		
		//
		// Create selector.
		//
		const selector = {};
		selector._from = this._document._id;
		selector[ Dict.descriptor.kPredicate ] =
			`terms/${Dict.term.kPredicateGroupedBy}`;
		
		//
		// Resolve selector.
		//
		const cursor = db._collection( 'schemas' ).byExample( selector );
		
		//
		// Handle found.
		//
		if( cursor.count() > 0 )
		{
			//
			// Handle duplicate edge.
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
				);															// !@! ==>
				
			}	// Duplicate edge.
			
			//
			// Get group reference.
			//
			const group = cursor.toArray()[ 0 ]._to;
			
			//
			// Check current value.
			//
			if( exists )
			{
				//
				// Check for conflicts.
				//
				if( this.group !== group )
					throw(
						new MyError(
							'UserGroupConflict',				// Error name.
							K.error.UserGroupConflict,			// Message code.
							this._request.application.language,	// Language.
							[ this.group, group ],				// Arguments.
							409									// HTTP error code.
						)
					);															// !@! ==>
			
			}	// Has group.
			
			//
			// Set group.
			//
			this.group = group;
			
		}	// Found edge.
		
		//
		// Handle existing group and no found group.
		//
		else if( exists )
			throw(
				new MyError(
					'UserGroupConflict',				// Error name.
					K.error.BadGroupReference,			// Message code.
					this._request.application.language,	// Language.
					this.group,							// Arguments.
					409									// HTTP error code.
				)
			);																	// !@! ==>
		
	}	// resolveGroupEdge
	
	/**
	 * Resolve group reference
	 *
	 * This method is called by the constructor to resolve the provided group
	 * reference. If the reference is not null, the method will resolve it, or raise
	 * an exception if not successful.
	 *
	 * The method will return the group _id, or null, if the provided parameter was null.
	 *
	 * @param theGroup	{String}|{Object}|{null}	The group reference.
	 * @returns {String}|{null}						The group _id, or null.
	 */
	resolveGroupReference( theGroup )
	{
		// TODO: Need to implement.
		
		return null;
		
	}	// resolveGroupReference
	
	/**
	 * Resolve manager edge
	 *
	 * This method can be used to set the current user's manager relationship, it is
	 * called when resolving the object and will update the user's manager.
	 *
	 * This method will attempt to locate the edge relating the current user with its
	 * manager, if such edge was located, the method will assert if the eventual
	 * existing manager reference matches the found edge: if that is not the case, the
	 * method will raise an exception; if the current object does not have a manager,
	 * the method will set it.
	 *
	 * If more than one edge matches the selection, the method will raise an
	 * exception, since only one edge should relate a user with a manager.
	 *
	 * If no edge matches the selection and a manager is set in the object, the method
	 * will raise an exception, because the resolved and existing managers do not
	 * match and it will also raise an exception if the current user is not the system
	 * administrator, since only that user does not have a manager.
	 *
	 * The method is called by resolve() which will call it only if the user was
	 * resolved, this means that the method expects the user to have all its identifiers.
	 *
	 * The method does not return any value, it either succeeds or it raises an exception.
	 */
	resolveManagerEdge()
	{
		//
		// Load manager name.
		// Required, to prevent leaking private fields in errors.
		//
		let manager_name = null;
		const exists = this.hasOwnProperty( 'manager' );
		if( exists )
			manager_name = db._document( this.manager )[ Dict.descriptor.kName ];
		
		//
		// Create selector.
		//
		const selector = {};
		selector._from = this._document._id;
		selector[ Dict.descriptor.kPredicate ] =
			`terms/${Dict.term.kPredicateManagedBy}`;
		
		//
		// Resolve selector.
		//
		const cursor = db._collection( 'schemas' ).byExample( selector );
		
		//
		// Handle found.
		//
		if( cursor.count() > 0 )
		{
			//
			// Handle duplicate edge.
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
				);															// !@! ==>
				
			}	// Duplicate edge.
			
			//
			// Get manager reference.
			//
			const manager = cursor.toArray()[ 0 ]._to;
			const manager_found = db._document( manager )[ Dict.descriptor.kName ];
			
			//
			// Check current value.
			//
			if( exists )
			{
				//
				// Check for conflicts.
				//
				if( this.manager !== manager )
					throw(
						new MyError(
							'UserManagerConflict',				// Error name.
							K.error.UserManagerConflict,		// Message code.
							this._request.application.language,	// Language.
							[ manager_name, manager_found ],	// Arguments.
							409									// HTTP error code.
						)
					);															// !@! ==>
				
			}	// Has manager.
			
			//
			// Set manager.
			//
			this.manager = manager;
			
		}	// Found edge.
		
		//
		// Handle no manager.
		//
		else
		{
			//
			// Handle existing manager and no found manager.
			//
			if( exists )
				throw(
					new MyError(
						'UserManagerConflict',				// Error name.
						K.error.BadManagerReference,		// Message code.
						this._request.application.language,	// Language.
						manager_name,						// Arguments.
						409									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Handle required manager.
			// Only system administrator can have no manager.
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
		
		}	// Edge not found.
		
	}	// resolveManagerEdge
	
	/**
	 * Resolve manager reference
	 *
	 * This method is called by the constructor to resolve the provided manager
	 * reference. If the reference is not null, the method will resolve it, or raise
	 * an exception if not successful.
	 *
	 * The method will return the manager _id, or null, if the provided parameter was
	 * null.
	 *
	 * @param theManager	{String}|{Object}|{null}	The manager reference.
	 * @returns {String}|{null}							The manager _id, or null.
	 */
	resolveManagerReference( theManager )
	{
		//
		// Handle reference.
		//
		if( theManager !== null )
		{
			//
			// Resolve.
			// Will raise an exception if not found.
			//
			const manager = new User( this._request, theManager );
			if( ! manager.persistent )
				manager.resolve( false, true );
			
			return manager.document._id;											// ==>
		}
		
		return null;																// ==>
		
	}	// resolveManagerReference
	
	/**
	 * Assert all required fields have been set
	 *
	 * We overload this method to assert the object has the user manager.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if all required fields are there.
	 */
	hasRequiredFields( getMad = true )
	{
		//
		// Call parent method.
		//
		if( ! super.hasRequiredFields( getMad ) )
			return false;															// ==>
		
		//
		// Check manager.
		// Note that the previous method must assert the username property.
		//
		if( (! this.hasOwnProperty( 'manager' ))
		 && (this._document[ Dict.descriptor.kUsername ]
				!== module.context.configuration.adminCode) )
		{
			//
			// Raise exception.
			//
			if( getMad )
				throw(
					new MyError(
						'IncompleteObject',					// Error name.
						K.error.MissingUserManager,			// Message code.
						this._request.application.language,	// Language.
						'USER MANAGER',						// Arguments.
						412									// HTTP error code.
					)
				);																// !@! ==>
			
			return false;															// ==>
		}
		
		return true;																// ==>
		
	}	// hasRequiredFields
	
	/**
	 * Assert if current object is constrained
	 *
	 * This method is called when removing the user, it will check if the current user
	 * manages other users and if it doesn't have a manager, relevant only for the
	 * system administrator. If that is the case, we return true, signaling a violated
	 * constraint, or raise an exception if getMad is true.
	 *
	 * When removing a manager user we transfer its managed users under the user's
	 * manager, to ensure all managed users are still managed. This method will assert
	 * that if the current user manages other users, it has a manager to transfer
	 * these relationships: if that is not the case, the method will return true, or
	 * raise an exception if gotMad.
	 *
	 * Note that we first call the inherited method that will return null if the
	 * object is not persistent or false, if there are no constraints: we only proceed
	 * if the result of the parent method is false, no constraints.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if object is related and null if not persistent.
	 */
	hasConstraints( getMad = true )
	{
		//
		// Call parent method and act only
		// if persistent and has no constraints
		//
		const result = super.hasConstraints( getMad );
		if( result === false )
		{
			//
			// Handle manager that has no manager.
			// Note that we have checked that the user is persistent,
			// so we are guaranteed the method will return a count
			// and not null.
			//
			if( (this.hasManaged() > 0)					// Manages users
			 && (! this.hasOwnProperty( 'manager' )) )	// and has no manager.
			{
				//
				// Raise exception.
				//
				if( getMad )
					throw(
						new MyError(
							'ConstraintViolated',							// Error name.
							K.error.NoManagerManages,						// Message code.
							this._request.application.language,				// Language.
							this._document[ Dict.descriptor.kName ],		// Error value.
							409												// HTTP error code.
						)
					);															// !@! ==>
				
				return true;														// ==>
			}
			
		}	// Parent has no constraints.
		
		return result;																// ==>
		
	}	// hasConstraints
	
	/**
	 * Assert managed users
	 *
	 * This method will check whether the current user manages other users, the method
	 * will return the number of managed users or null if the current object is not
	 * persistent.
	 *
	 * @returns {Number}|{null}	The count or null if not persistent.
	 */
	hasManaged()
	{
		//
		// Handle persistent object.
		//
		if( this._persistent )
		{
			//
			// Set search criteria.
			//
			const selector = {};
			selector._to = this._document._id;
			selector[ Dict.descriptor.kPredicate ] =
				`terms/${Dict.term.kPredicateManagedBy}`;
			
			return db._collection( 'schemas' ).byExample( selector ).count();		// ==>
		}
		
		return null;																// ==>
		
	}	// hasManaged
	
	/**
	 * Return list of significant fields
	 *
	 * We override the parent method to return the user code.
	 *
	 * @returns {Array}	List of significant fields.
	 */
	getSignificantFields()
	{
		return [
			[
				Dict.descriptor.kUsername
			]
		];																			// ==>
		
	}	// getSignificantFields
	
	/**
	 * Return list of required fields
	 *
	 * We overload the method to add the user code, name, e-mail, preferred
	 * language, rank, roles and the authentication record.
	 *
	 * @returns {Array}	List of required fields.
	 */
	getRequiredFields()
	{
		//
		// Append local properties.
		//
		return super.getRequiredFields()
			.concat([
				Dict.descriptor.kUsername,	// User code.
				Dict.descriptor.kName,		// User full name.
				Dict.descriptor.kEmail,		// User e-mail address.
				Dict.descriptor.kLanguage,	// User preferred language.
				Dict.descriptor.kRank,		// User rank.
				Dict.descriptor.kRole,		// User roles.
				Dict.descriptor.kAuthData	// User authentication record.
			]);																		// ==>
		
	}	// getRequiredFields
	
	/**
	 * Return list of unique fields
	 *
	 * This method should return the list of unique properties.
	 *
	 * In this class we add the username.
	 *
	 * @returns {Array}	List of unique fields.
	 */
	getUniqueFields()
	{
		return super.getUniqueFields()
			.concat([
				Dict.descriptor.kUsername	// User code.
			]);																		// ==>
		
	}	// getUniqueFields
	
	/**
	 * Return list of locked fields
	 *
	 * We overload this method to add the user code property.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	getLockedFields()
	{
		return super.getLockedFields()
			.concat([
				Dict.descriptor.kUsername	// User code.
			]);																		// ==>
		
	}	// getLockedFields
	
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
	 * @returns {Array}	The list of user managers.
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
				this.document,						// Origin node.
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
	 * @returns {Array}	The list of managed users.
	 */
	manages(
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
		
	}	// manages
	
	/**
	 * Set authentication record
	 *
	 * This method will create the authentication record and set it into the provided
	 * object.
	 *
	 * The method will assert that the provided document is indeed an object.
	 *
	 * @param thePassword	{String}	The password.
	 * @param theDocument	{Object}	Receives authentication record.
	 */
	static authSet( thePassword, theDocument )
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
			theDocument.document[ Dict.descriptor.kAuthData ] = data;
		
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
		
	}	// authSet
	
	/**
	 * Check authentication record
	 *
	 * This method will check whether the provided password authenticates the provided
	 * object.
	 *
	 * The method will return true if the authentication succeeded, false if it didn't
	 * and null if the provided object does not have the authentication record.
	 *
	 * The method will assert that the provided document is indeed an object.
	 *
	 * @param thePassword	{String}	The password.
	 * @param theDocument	{Object}	The object to authenticate.
	 * @returns {Boolean}|{null}		True OK, false KO, null not there.
	 */
	static authCheck( thePassword, theDocument )
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
		
	}	// authCheck
	
}	// User.

module.exports = User;
