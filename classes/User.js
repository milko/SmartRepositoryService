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

//
// Parent.
//
const Document = require( './Document' );


/**
 * User class
 *
 * This class implements a user object.
 *
 * The class overloads the parent members by adding two properties:
 *
 * 	- group:	The user group reference.
 * 	- manager:	The user manager reference.
 *
 * The class expects all required collections to exist.
 */
class User extends Document
{
	/**
	 * Constructor
	 *
	 * We overload the constructor to add the manager and group properties, both
	 * parameters are optional:
	 *
	 * 	- theGroup:		Provide a group reference. If omitted, the parameter can be
	 * 					resolved, when inserting a new user it is not required.
	 * 	- theManager:	Provide a user reference. If omitted, the parameter can be
	 * 					resolved, when inserting a new user it is required.
	 *
	 * Note that you should only provide these parameters if you intend to insert a
	 * new user, if any of these two parameters conflict with a resolved object, the
	 * method will raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theReference	{String}|{Object}	The document reference or object.
	 * @param theCollection	{String}|{null}		The document collection.
	 * @param theGroup		{String}|{null}		The user group reference.
	 * @param theManager	{String}|{null}		The user manager reference.
	 */
	constructor(
		theRequest,
		theReference,
		theCollection = null,
		theGroup = null,
		theManager = null
	)
	{
		//
		// Call parent constructor.
		//
		super( theRequest, theReference, theCollection );
		
		//
		// Resolve group.
		//
		this.resolveGroup( theGroup );
		
		//
		// Resolve manager.
		//
		this.resolveManager( theManager );
		
	}	// constructor
	
	/**
	 * Resolve document
	 *
	 * We overload this method to handle the user code.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	If true, an exception will be raised if not found
	 * 								(defaults to true).
	 * @returns {Boolean}			True if found.
	 */
	resolve( doReplace = false, doAssert = true )
	{
		//
		// Init local storage.
		//
		let found = false;
		const persistent = this._persistent;
		
		//
		// Call parent method.
		// Note that it will fail if the existing key cannot be found,
		// which means that the user code is superflous.
		//
		found = super.resolve( doReplace, doAssert );
		
		//
		// Handle user code.
		// Note that it will fail if the username was not found,
		// this means that if doAssert is true, an exception will be raised.
		//
		if( (! found)
		 && this._document.hasOwnProperty( Dict.descriptor.kUsername ) )
			found = this.resolveUsername( doReplace, doAssert );
		
		//
		// Handle group and manager refereces.
		//
		if( found )
		{
			//
			// Save current manager.
			//
			const group = ( this.hasOwnProperty( 'group' ) )
						? this.group
						: null;
			
			//
			// Save current manager.
			//
			const manager = ( this.hasOwnProperty( 'manager' ) )
						  ? this.manager
						  : null;
			
			//
			// Resolve group.
			// Only if object was not yet resolved,
			// to check eventual conflicts.
			//
			if( ! persistent )
				this.resolveGroup( group );
			
			//
			// Resolve manager.
			// Need to be resolved if object had no key at instantiation,
			// or if manager was added after; will raise an exception if
			// the manager cannot be resolved.
			//
			if( (! persistent)			// Was not yet resolved,
			 || (manager === null) )	// or the manager is still missing.
				this.resolveManager( manager );
			
			return true;															// ==>
		
		}	// Found.
		
		return false;																// ==>
		
	}	// resolve
	
	/**
	 * Resolve user code
	 *
	 * This method will attempt to load the document corresponding to the user code, if
	 * the document was found, its properties will be set in the current object
	 * according to the falue of doReplace:
	 *
	 * 	- true:		The resolved properties will overwrite the existing ones.
	 * 	- false:	The existing properties will not be replaced.
	 *
	 * Note that the _id, _key and _rev properties will overwrite by default the
	 * existing ones.
	 *
	 * This method assumes the object has the user code, in practice, that you have
	 * checked the property presence before calling this method.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	If true, an exception will be raised if not found
	 * 								(defaults to true).
	 * @returns {Boolean}			True if found.
	 */
	resolveUsername( doReplace = false, doAssert = true )
	{
		//
		// Load example query from significant fields.
		// Note that the method assumes you have called hasSignificantFields().
		//
		const username = this._document[ Dict.descriptor.kUsername ];
		const example = {};
		example[ Dict.descriptor.kUsername ] = username;
		
		//
		// Load document.
		//
		const cursor = db._collection( this._collection ).byExample( example );
		
		//
		// Check if found.
		//
		if( cursor.count() > 0 )
		{
			//
			// Handle ambiguous query.
			//
			if( cursor.count() > 1 )
				throw(
					new MyError(
						'AmbiguousDocumentReference',		// Error name.
						K.error.AmbiguousDocument,			// Message code.
						this.request.application.language,	// Language.
						[ username, this._collection],		// Arguments.
						412									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Load found document.
			//
			this.loadDocumentData( cursor.toArray()[ 0 ], doReplace, true );
			
			//
			// Set flag.
			//
			this._persistent = true;
			
		}	// Found.
		
		//
		// Handle not found.
		//
		else
		{
			//
			// Assert not found.
			//
			if( doAssert )
			{
				throw(
					new MyError(
						'BadDocumentReference',					// Error name.
						K.error.DocumentNotFound,				// Message code.
						this._request.application.language,		// Language.
						[username, this._collection],			// Error value.
						404										// HTTP error code.
					)
				);																// !@! ==>
			}
			
			//
			// Set flag.
			//
			this._persistent = false;
		}
		
		return this._persistent;													// ==>
		
	}	// resolveUsername
	
	/**
	 * Resolve group
	 *
	 * This method will resolve the user's group, it expects a single parameter
	 * which corresponds to a user group's reference, or null.
	 *
	 * If the parameter is not null, the method will instantiate an object referenced
	 * by the parameter.
	 *
	 * If the parameter is null, the method will attempt to locate the group using
	 * the current object's _id or _key properties: if any of these properties is
	 * there, the method will attempt to resolve the group reference,  if these
	 * properties are not there, the method will do nothing.
	 *
	 * Any error will raise an exception.
	 *
	 * @param theGroup	{String}	The user manager reference.
	 */
	resolveGroup( theGroup )
	{
		// TODO: Nedd to implement.
		
	}	// resolveGroup
	
	/**
	 * Resolve manager
	 *
	 * This method will resolve the user's manager, it expects a single parameter
	 * which corresponds to a user manager's reference, or null.
	 *
	 * If the parameter is not null, the method will instantiate an object referenced
	 * by the parameter.
	 *
	 * If the parameter is null, the method will attempt to locate the manager using
	 * the current object's _id or _key properties: if any of these properties is
	 * there, the method will attempt to resolve the manager reference, if the current
	 * object is persistent the method will raise an exception, because all users,
	 * except the system administrator require a manager; if these properties are not
	 * there, the method will do nothing.
	 *
	 * Any error will raise an exception.
	 *
	 * Note that this method is called in the constructor with the provided manager
	 * parameter, if the parameter is not null, the object will have the resolved
	 * parameter, which means that it should be called again only if the the object is
	 * not persistent, or if the manager property in the object is null.
	 *
	 * @param theManager	{String}	The user manager reference.
	 */
	resolveManager( theManager )
	{
		//
		// Init local storage.
		//
		let manager = null;
		
		//
		// Resolve manager.
		// Will raise an exception if not found.
		//
		if( theManager !== null )
			manager = new User( this.request, theManager, this._collection );
		
		//
		// Seek manager.
		// Note the test for null key: without it risks infinite recursion.
		//
		else if( ( this._document.hasOwnProperty( '_id' )
				&& (this._document._id !== null) )
			  || ( this._document.hasOwnProperty( '_key' )
				&& (this._document._key !== null) ) )
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
				// Handle ambiguous query.
				//
				if( cursor.count() > 1 )
					throw(
						new MyError(
							'AmbiguousDocumentReference',			// Error name.
							K.error.AmbiguousDocument,				// Message code.
							this.request.application.language,		// Language.
							[ Object.keys( example ), 'schemas'],	// Arguments.
							412										// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Save document reference.
				//
				manager = cursor.toArray()[ 0 ];
			}
		}
		
		//
		// Handle manager.
		//
		if( manager !== null )
		{
			//
			// Check current value.
			//
			if( this.hasOwnProperty( 'manager' ) )
			{
				//
				// Check for conflicts.
				//
				if( this.manager !== manager._id )
					throw(
						new MyError(
							'UserManagerConflict',				// Error name.
							K.error.UserManagerConflict,		// Message code.
							this._request.application.language,	// Language.
							[ this.manager, manager._id ],		// Arguments.
							409									// HTTP error code.
						)
					);															// !@! ==>
			}
			
			//
			// Set manager.
			//
			else
				this.manager = manager._id;
			
		}	// Found manager.
		
		//
		// Handle missing manager for persistent object.
		//
		else if( this._persistent )
		{
			//
			// Handle provided reference.
			//
			if( theManager !== null )
				throw(
					new MyError(
						'BadUserReference',					// Error name.
						K.error.UserNotFound,				// Message code.
						this._request.application.language,	// Language.
						theManager,							// Arguments.
						404									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Handle missing manager.
			//
			else
				throw(
					new MyError(
						'IncompleteObject',					// Error name.
						K.error.MissingUserManager,			// Message code.
						this._request.application.language,	// Language.
						null,								// Arguments.
						409									// HTTP error code.
					)
				);																// !@! ==>
		
		}	// Manager not found.
		
		//
		// Handle missing manager for non persistent object.
		//
		else if( theManager !== null )
			this.manager = theManager;
		
	}	// resolveManager
	
	/**
	 * Insert document
	 *
	 * We overload this method to add the group and manager relationships.
	 */
	insertDocument()
	{
		//
		// Call parent method.
		//
		super.insertDocument();
		
		//
		// Create group relationship.
		//
		this.insertGroup();
		//
		// Create manager relationship.
		//
		this.insertManager();
		
	}	// insertDocument
	
	/**
	 * Insert group relationship
	 *
	 * This method will insert the edge relating the current user with its group, if
	 * the group is missing, the method will do nothing.
	 */
	insertGroup()
	{
		// TODO: Needs to be implemented.
		
	}	// insertGroup
	
	/**
	 * Insert manager relationship
	 *
	 * This method will insert the edge relating the current user with its manager,
	 * the method expects the manager to have been set and checked beforehand.
	 */
	insertManager()
	{
		// TODO: Needs to be implemented.
		
	}	// insertManager
	
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
		this._class = null;
		
	}	// setClass
	
	/**
	 * Get class
	 *
	 * This method will retrieve the class information from the schema and return it.
	 *
	 * @returns {Object}|{null}	The structure object or null if none.
	 */
	getClass()
	{
		//
		// This class does not have any class.
		//
		return ( this._class !== null )
			   ? this._class															// ==>
			   : null;																// ==>
		
	}	// getClass
	
	/**
	 * Set collection
	 *
	 * This method will set the document collection, if there are any errors, the
	 * method will raise an exception.
	 *
	 * @param theCollection	{String} The document collection name.
	 */
	setCollection( theCollection )
	{
		//
		// Check collection.
		//
		if( theCollection !== null )
		{
			//
			// Set collection.
			//
			this._collection = theCollection;
			if( ! db._collection( this._collection ) )
				throw(
					new MyError(
						'BadCollection',					// Error name.
						K.error.MissingCollection,			// Message code.
						this._request.application.language,	// Language.
						theCollection,						// Error value.
						412									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Check collection type.
			//
			this.checkCollectionType();
		}
		
	}	// setCollection
	
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
	 * Load document data
	 *
	 * This method will add the provided object properties to the current object's
	 * data.
	 *
	 * The first parameter represents the data to be loaded, the second parameter is a
	 * flag that determines whether the provided data should replace existing data,
	 * the third parameter is a flag that indicates whether the method was called when
	 * the object has been resolved.
	 *
	 * The method will raise an exception if the provided data contains a locked
	 * property, getLockedFields(), and the property exists in the current object and
	 * it has a different value; note that locked properties override the doReplace
	 * flag: the flag is set to true for locked properties. The third parameter
	 * determines the error type: if true, errors indicate an ambiguous object, if
	 * false they indicate the attempt to change a locked property.
	 *
	 * @param theData		{Object}	The object properties to add.
	 * @param doReplace		{Boolean}	True, overwrite existing properties (default).
	 * @param isResolving	{Boolean}	True, called by resolveDocument() (default false).
	 */
	loadDocumentData( theData, doReplace = true, isResolving = false )
	{
		//
		// Init document.
		//
		this._document = {};
		
		//
		// Load locked fields.
		//
		const locked = this.getLockedFields();
		
		//
		// Iterate properties.
		//
		for( const field in theData )
		{
			if( doReplace
				|| locked.includes( field )
				|| (! this._document.hasOwnProperty( field )) )
				this.loadDocumentProperty( field, theData[ field ], locked, isResolving );
		}
		
		//
		// Normalise properties.
		//
		this.normaliseProperties();
		
	}	// loadDocumentData
	
	/**
	 * Load document property
	 *
	 * This method wcan be used to set the value of a property, it is called by
	 * loadDocumentData() for all locked properties and for new or replaced properties.
	 *
	 * The method will raise an exception if the provided property is locked and the
	 * replaced value doesn't match the existing value.
	 *
	 * Overload this method when you nneed to process values before setting them and
	 * matching locked properties.
	 *
	 * @param theProperty	{String}	The property name.
	 * @param theValue		{*}			The property value.
	 * @param theLocked		{Array}		List of locked properties.
	 * @param isResolving	{Boolean}	True, called by resolveDocument().
	 */
	loadDocumentProperty( theProperty, theValue, theLocked, isResolving )
	{
		//
		// Check locked properties.
		//
		if( theLocked.includes( theProperty )
			&& this._document.hasOwnProperty( theProperty ) )
		{
			//
			// Handle changes.
			//
			if( this._document[ theProperty ] !== theValue )
			{
				//
				// Handle ambiguous.
				//
				if( isResolving )
					throw(
						new MyError(
							'AmbiguousDocumentReference',			// Error name.
							K.error.ResolveMismatch,				// Message code.
							this._request.application.language,		// Language.
							theProperty,							// Arguments.
							409										// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Handle locked.
				//
				else
					throw(
						new MyError(
							'LockedProperty',					// Error name.
							K.error.PropertyLocked,				// Message code.
							this._request.application.language,	// Language.
							theProperty,						// Error value.
							409									// HTTP error code.
						)
					);															// !@! ==>
			}
		}
		
		//
		// Set value.
		//
		else
			this._document[ theProperty ] = theValue;
		
	}	// loadDocumentProperty
	
	/**
	 * Load document reference
	 *
	 * This method is called by the constructor to instantiate the object from a
	 * document reference: it will load the provided object into the _document property
	 * of the instance from the registered collection, if the operation fails, the
	 * method will raise an exception.
	 *
	 * If the collection is missing, the reference is expected to be the document _id:
	 * if the operation succeeds, the method will load the collection.
	 *
	 * @param theReference	{String}	The document reference.
	 */
	loadDocumentReference( theReference )
	{
		//
		// Init local storage.
		//
		let collection = ( this.hasOwnProperty( '_collection' ) )
						 ? this._collection
						 : 'NOT PROVIDED';
		
		//
		// Resolve reference.
		//
		try
		{
			//
			// Load from collection.
			//
			if( this.hasOwnProperty( '_collection' ) )
				this._document = db._collection( this._collection ).document( theReference );
			
			//
			// Load from database.
			//
			else
			{
				//
				// Load document.
				// Note that db._document() returns an immutable object.
				//
				this._document = JSON.parse(JSON.stringify( db._document( theReference )));
				
				//
				// Set collection.
				//
				this._collection = theReference.split( '/' )[ 0 ];
			}
			
			//
			// Set persistence flag.
			//
			this._persistent = true;
		}
		catch( error )
		{
			//
			// Handle exceptions.
			//
			if( (! error.isArangoError)
				|| (error.errorNum !== ARANGO_NOT_FOUND) )
				throw( error );													// !@! ==>
			
			//
			// Handle not found.
			//
			throw(
				new MyError(
					'BadDocumentReference',				// Error name.
					K.error.DocumentNotFound,			// Message code.
					this._request.application.language,	// Language.
					[theReference, collection],			// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}
		
	}	// loadDocumentReference
	
	/**
	 * Load computed fields
	 *
	 * This method will take care of filling the computed fields and ensuring that
	 * significant computed fields match eventual existing fields.
	 *
	 * The method will return a boolean indicating whether the operation was
	 * successful (true); if the provided flag parameter is true, errors will raise an
	 * exception.
	 *
	 * This class has no computed fields.
	 *
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	loadComputedProperties( doAssert = true )
	{
		return true;																// ==>
		
	}	// loadComputedProperties
	
	/**
	 * Assert all significant fields have been set
	 *
	 * This method will check if any significant field is missing, if you provide true in
	 * getMad, the method will raise an exception, if false, the method will return a
	 * boolean where true means all significant fields are present.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if all significant fields are there.
	 */
	hasSignificantFields( getMad = true )
	{
		//
		// Init local storage.
		//
		const missing = [];
		
		//
		// Get significant fields.
		//
		const fields = this.getSignificantFields();
		
		//
		// Check significant fields.
		//
		for( const field of fields )
		{
			if( ! this._document.hasOwnProperty( field ) )
				missing.push( field );
		}
		
		//
		// Handle missing.
		//
		if( missing.length > 0 )
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
						missing.join( ', ' ),				// Arguments.
						412									// HTTP error code.
					)
				);																// !@! ==>
			
			return false;															// ==>
		}
		
		return true;																// ==>
		
	}	// hasSignificantFields
	
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
		// Resolve group and manager.
		// If persistent, the reference would have been resolved;
		// if not persistent, the reference may have been added.
		//
		if( ! this._persistent )
		{
			//
			// Resolve group.
			//
			const group = ( this.hasOwnProperty( 'group' ) ) ? this.group : null;
			this.resolveGroup( group );
			
			//
			// Resolve manager.
			//
			const manager = ( this.hasOwnProperty( 'manager' ) ) ? this.manager : null;
			this.resolveManager( manager );
			
			//
			// Check manager.
			//
			if( ! this.hasOwnProperty( 'manager' ) )
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
					);															// !@! ==>
				
				return false;														// ==>
			}
		}
		
		return true;																// ==>
		
	}	// hasRequiredFields
	
	/**
	 * Validate document fields
	 *
	 * This method will check if all document fields are valid; if that is not the
	 * case the method will raise an exception, if doAssert is true, or return false.
	 *
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	validateProperties( doAssert = true )
	{
		//
		// Validate document.
		//
		try
		{
			//
			// Validate.
			//
			this._document =
				Validation.validateStructure(
					this._request,
					this._document
				);
			
			return true;															// ==>
		}
		catch( error )
		{
			//
			// Raise errors.
			//
			if( doAssert )
				throw( error );													// !@! ==>
		}
		
		return false;																// ==>
		
	}	// validateProperties
	
	/**
	 * Normalise object properties
	 *
	 * This method is called at the end of the constructor and after adding data to
	 * the object, its duty is to eventually normalise object properties that require
	 * processing.
	 */
	normaliseProperties()
	{
		// Nothing here.
	}
	
	/**
	 * Return persistent flag
	 *
	 * This method will return true if the object was loaded or stored in the collection.
	 *
	 * @returns {Boolean}	Resolved flag: true was resolved.
	 */
	isPersistent()
	{
		return this._persistent;													// ==>
		
	}	// persistent
	
	/**
	 * Return list of significant fields
	 *
	 * This method should return the list of properties that will uniquely identify
	 * the document.
	 *
	 * In this class we return the key.
	 *
	 * @returns {Array}	List of significant fields.
	 */
	getSignificantFields()
	{
		return [ '_key' ];															// ==>
		
	}	// getSignificantFields
	
	/**
	 * Return list of required fields
	 *
	 * This method should return the list of required properties.
	 *
	 * In this class we return the key.
	 *
	 * @returns {Array}	List of required fields.
	 */
	getRequiredFields()
	{
		return [];																	// ==>
		
	}	// getRequiredFields
	
	/**
	 * Return list of locked fields
	 *
	 * This method should return the list of fields that cannot be changed once the
	 * document has been inserted.
	 *
	 * In this class we return the id, key and revision.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	getLockedFields()
	{
		return [ '_id', '_key', '_rev' ];											// ==>
		
	}	// getLockedFields
	
}	// User.

module.exports = User;
