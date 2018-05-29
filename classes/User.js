'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');
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
	 * When resolving these two parameters, if any of the references provided as
	 * parameters conflict with the values in the database, the method will raise an
	 * exception, there are two dedicated methods to change group and user.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theReference	{String}|{Object}	The document reference or object.
	 * @param theGroup		{String}|{null}		The user group reference.
	 * @param theManager	{String}|{null}		The user manager reference.
	 */
	constructor(
		theRequest,
		theReference,
		theGroup = null,
		theManager = null
	)
	{
		//
		// Call parent constructor.
		// Note that we enforce the users collection.
		//
		super( theRequest, theReference, 'users' );
		
		//
		// Init local storage.
		//
		let reference = null;
		
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
	 * significant fields in the object: this means that the key field will be the
	 * user code
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
	 * We overload this method to add the group and manager relationships.
	 */
	insert()
	{
		//
		// Set default language.
		//
		if( ! this._document.hasOwnProperty( Dict.descriptor.kLanguage ) )
			this._document[ Dict.descriptor.kLanguage ] =
				module.context.configuration.defaultLanguage;
		
		//
		// Try to insert.
		//
		try
		{
			//
			// Insert current object.
			//
			super.insert();
			
			//
			// Insert group relationhip.
			//
			this.insertGroup();
			
			//
			// Insert manager relationhip.
			//
			this.insertManager();
		}
		catch( error )
		{
			//
			// Remove current object.
			// The method will take care of removing eventual group and manager.
			//
			this.remove();
			
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
	 * the group is missing, the method will do nothing.
	 *
	 * The method will raise an exception on any error, except for ARANGO_DUPLICATE error.
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
			
		}	// Has group.
		
	}	// insertGroup
	
	/**
	 * Insert manager relationship
	 *
	 * This method will insert the edge relating the current user with its manager, if
	 * the manager is missing, the method will do nothing.
	 *
	 * The method will raise an exception on any error, except for ARANGO_DUPLICATE error.
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
			
		}	// Has manager.
		
	}	// insertManager
	
	/**
	 * Remove object
	 *
	 * This method will remove the current document from the database, it will first
	 * remove the user, then the eventual group relationship and finally the manager
	 * relationship and will return true, if the document exists, or false if it doesn't.
	 *
	 * Any exception, except the ARANGO_NOT_FOUND error, will be forwarded.
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
	 * @returns {Boolean}	True removed, false not found, null not persistent.
	 */
	remove()
	{
		//
		// Call parent method.
		// And forward exceptions.
		// And exit if the current document doesn't exist
		// or if the object is not persistent.
		//
		const result = super.remove();
		if( result === true )
		{
			//
			// Remove group relationship.
			// Should not fail.
			//
			this.removeGroup();
			
			//
			// Remove manager relationship.
			// Should not fail.
			//
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
			selector[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateGroupedBy}`;
			
			//
			// Remove.
			//
			const edge = new Edge( this._request, selector, 'schemas' );
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
	 * Uf the current user manages other users, these will be transferred under the
	 * current user's manager, note that if we get here it is guaranteed that the user
	 * has a manager..
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
			// Init local storage.
			//
			const selector = {};
			
			//
			// Select managed.
			//
			selector._to = this._document._id;
			selector[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateManagedBy}`;
			const managed = db._collection( 'schemas' ).byExample( selector ).toArray();
			
			//
			// Iterate relationships.
			//
			for( const edge of managed )
			{
				//
				// Remove relationship to current user.
				//
				db._remove( edge );
				
				//
				// Clean.
				//
				delete edge._id;
				delete edge._key;
				delete edge._rev;
				
				//
				// Set relationship to manager.
				//
				edge._to = this.manager;
				
				//
				// Save new relationship.
				//
				const new_edge = new Edge( this._request, edge, 'schemas' );
				new_edge.insert();
			}
			
			//
			// Remove manager.
			//
			selector._from = this._document._id;
			selector._to   = this.manager;
			const old_edge = new Edge( this._request, selector, 'schemas' );
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
	 * In this class we assume a document collection.
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
	 * Resolve group edge
	 *
	 * This method will attempt to locate the edge holding the current object's _id
	 * and the member-of predicate.
	 *
	 * If such a document exists, the method will perform the following steps:
	 *
	 * 	- If the current object has a group, it will compare the found and existing
	 * 	  values: if these differ, the method will raise an exception; if they are
	 * 	  equal, the method will return null.
	 * 	- If the current object does not have a group, the method will set it with the
	 * 	  found edge's _to reference and return true.
	 *
	 * If such document does not exist:
	 *
	 * 	- If the persistent flag of the current object is true, the method will raise
	 * 	  a 500 exception indicating that the database structure is corrupt.
	 * 	- If the persistent flag of the current object is false, the method will
	 * 	  return false.
	 *
	 * If the current object does not yet have a _key, the method will return undefined.
	 *
	 * This method is called when resolving the object.
	 *
	 * @returns {null}|{true}|{false|{undefined}	The result of the operation.
	 */
	resolveGroupEdge()
	{
		//
		// Check if it can resolve.
		//
		if( this._document.hasOwnProperty( '_id' )
		 || this._document.hasOwnProperty( '_key' ) )
		{
			//
			// Compute _id.
			//
			const reference = ( this._document.hasOwnProperty( '_id' ) )
							? this._document._id
							: `users/${this._document._key}`;
			
			//
			// Resolve.
			//
			const example = {};
			example._from = reference;
			example[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateGroupedBy}`;
			const cursor = db._collection( 'schemas' ).byExample( example );
			
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
					for( const field in example )
						signature.push( `${field} = ${example[field].toString()}` );
					
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
				if( this.hasOwnProperty( 'group' ) )
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
						);														// !@! ==>
					
					return null;													// ==>
				}
				
				//
				// Set group.
				//
				this.group = group;
				
				return true;														// ==>
				
			}	// Found edge.
			
			return false;															// ==>
			
		}	// Can resolve.
		
		return undefined;															// ==>
		
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
	 * @param theGroup	{String}|{null}	The group reference.
	 * @returns {String}|{null}			The group _id, or null.
	 */
	resolveGroupReference( theGroup )
	{
		// TODO: Need to implement.
		
		return null;
		
	}	// resolveGroupReference
	
	/**
	 * Resolve manager edge
	 *
	 * This method will attempt to locate the edge holding the current object's _id
	 * and the managed-by predicate.
	 *
	 * If such a document exists, the method will perform the following steps:
	 *
	 * 	- If the current object has a manager, it will compare the found and existing
	 * 	  values: if these differ, the method will raise an exception; if they are
	 * 	  equal, the method will return null.
	 * 	- If the current object does not have a manager, the method will set it with the
	 * 	  found edge's _to reference and return true.
	 *
	 * If such document does not exist:
	 *
	 * 	- If the persistent flag of the current object is true, the method will raise
	 * 	  a 500 exception indicating that the database structure is corrupt.
	 * 	- If the persistent flag of the current object is false, the method will
	 * 	  return false.
	 *
	 * If the current object does not yet have a _key, the method will return undefined.
	 *
	 * This method is called when resolving the object.
	 *
	 * @returns {null}|{true}|{false|{undefined}	The result of the operation.
	 */
	resolveManagerEdge()
	{
		//
		// Check if it can resolve.
		//
		if( this._document.hasOwnProperty( '_id' )
		 || this._document.hasOwnProperty( '_key' ) )
		{
			//
			// Compute _id.
			//
			const reference = ( this._document.hasOwnProperty( '_id' ) )
							? this._document._id
							: `users/${this._document._key}`;
			
			//
			// Resolve.
			//
			const example = {};
			example._from = reference;
			example[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateManagedBy}`;
			const cursor = db._collection( 'schemas' ).byExample( example );
			
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
					for( const field in example )
						signature.push( `${field} = ${example[field].toString()}` );
					
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
				
				//
				// Check current value.
				//
				if( this.hasOwnProperty( 'manager' ) )
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
								[ this.manager, manager ],			// Arguments.
								409									// HTTP error code.
							)
						);														// !@! ==>
					
					return null;													// ==>
				}
				
				//
				// Set manager.
				//
				this.manager = manager;
				
				return true;														// ==>
			
			}	// Found edge.
			
			//
			// Handle persistent object.
			// Raise flag only if not Godalmighty.
			//
			if( this._persistent
			 && this._document.hasOwnProperty( Dict.descriptor.kUsername )
			 && (this._document[ Dict.descriptor.kUsername ] !== module.context.configuration.adminCode) )
				throw(
					new MyError(
						'DatabaseCorrupt',						// Error name.
						K.error.NoManager,						// Message code.
						this._request.application.language,		// Language.
						reference,								// Arguments.
						500										// HTTP error code.
					)
				);																// !@! ==>
			
			return false;															// ==>
			
		}	// Can resolve.
		
		return undefined;															// ==>
		
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
	 * @param theManager	{String}|{null}	The manager reference.
	 * @returns {String}|{null}				The manager _id, or null.
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
			const manager = new User( this._request, theManager, this._collection );
			
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
		 && (this._document[ Dict.descriptor.kUsername ] !== module.context.configuration.adminCode) )
		{
			//
			// Raise exception.
			//
			if( getMad )
				throw(
					new MyError(
						'IncompleteObject',					// Error name.
						K.error.MissingField,				// Message code.
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
	 * We overload this method to check whether the current user is a manager, if that
	 * is the case we return true, or raise an exception.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if object is related and null if not persistent.
	 */
	hasConstraints( getMad = true )
	{
		//
		// Check if persistent.
		//
		if( this._persistent )
		{
			//
			// Prevent if manages and no manager.
			// Note we don't check for managed null,
			// because we know the object is persistent.
			//
			const managed = this.hasManaged();
			if( (managed > 0)
			 && (! this.hasOwnProperty( 'manager' )) )
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
							this._document[ Dict.descriptor.kUsername ],	// Error value.
							409												// HTTP error code.
						)
					);															// !@! ==>
				
				return true;														// ==>
			}
			
			return false;															// ==>
		}
		
		return null;																// ==>
		
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
	 * We overload this method to return the user code.
	 *
	 * @returns {Array}	List of significant fields.
	 */
	getSignificantFields()
	{
		return [ Dict.descriptor.kUsername ];										// ==>
		
	}	// getSignificantFields
	
	/**
	 * Return list of required fields
	 *
	 * We overload the method to return the user code, name, e-mail, preferred
	 * language, rank, roles and the authentication record.
	 *
	 * @returns {Array}	List of required fields.
	 */
	getRequiredFields()
	{
		return [
			Dict.descriptor.kUsername,	// User code.
			Dict.descriptor.kName,		// User full name.
			Dict.descriptor.kEmail,		// User e-mail address.
			Dict.descriptor.kLanguage,	// User preferred language.
			Dict.descriptor.kRank,		// User rank.
			Dict.descriptor.kRole,		// User roles.
			Dict.descriptor.kAuthData	// User authentication record.
		];																			// ==>
		
	}	// getRequiredFields
	
	/**
	 * Return list of unique fields
	 *
	 * This method should return the list of unique properties.
	 *
	 * In this class we return the username.
	 *
	 * @returns {Array}	List of unique fields.
	 */
	getUniqueFields()
	{
		return super.getUniqueFields().concat([ Dict.descriptor.kUsername ]);			// ==>
		
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
		return super.getLockedFields().concat([
			Dict.descriptor.kUsername,
			Dict.descriptor.kEmail
		]);																			// ==>
		
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
	 * not the case, the method will return an empty array; this means that unless you
	 * test for persistence, you will not know if an empty array means no managers.
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
		
		return [];																	// ==>
		
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
	 * not the case, the method will return an empty array; this means that unless you
	 * test for persistence, you will not know if an empty array means no managers.
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
		
		return [];																	// ==>
		
	}	// manages
	
	/**
	 * Return directly managed users
	 *
	 * This method will return the list of directly managed users as an array of user
	 * _id references, the method will only consider those users directly managed by
	 * the current user.
	 *
	 * Note that this method assumes the current object to be persistent, if this is
	 * not the case, the method will return an empty array; this means that unless you
	 * test for persistence, you will not know if an empty array means no managers.
	 *
	 * @returns {Array}	The list of managed users.
	 */
	get managed()
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
			const cursor = db._collection( 'schemas' ).byExample( selector );
			
			//
			// Collect _id.
			//
			const result = [];
			while( cursor.hasNext() )
				result.push( cursor.next()._from );
			
			return result;															// ==>
		}
		
		return [];																	// ==>
		
	}	// managed
	
}	// User.

module.exports = User;
