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
const MyError = require( '../utils/MyError' );
const Validation = require( '../utils/Validation' );


/**
 * Document virtual class
 *
 * This virtual class declares the methods that all document classes should support.
 * The class features the following properties:
 *
 * 	- _request:			Holds the current service request.
 * 	- _class:			Holds the class reference (term _key), can be retrieved with
 * 						the classname() getter.
 * 	- _collection:		Holds the collection name, can be retrieved with the
 * 						colname() getter.
 * 	- _document:		Holds the document object, can be retrieved with the document()
 * 						getter.
 * 	- _persistent:		A boolean flag indicating whether the document was retrieved or
 * 						stored in the collection, can be retrieved with the persistent()
 * 						getter.
 * 	- _revised:			A boolean flag indicating whether the revision has changed.
 * 						The value is set whenever the document is resilved in the
 * 						collection and the current document has the revision field.
 * 						The value can be retrieved with the revised() getter.
 */
class Document
{
	/**
	 * Constructor
	 *
	 * The constructor instantiates a document from the following parameters:
	 *
	 * 	- theRequest:		The current request, it will be stored in the 'request'
	 * 						property, it is used for parameter passing and to provide
	 * 						environment variables.
	 * 	- theReference:		The document contents provided either as a string, in which
	 * 						case it should represent the object reference, or as an
	 * 						object, in which case it represents the document contents.
	 * 	- theCollection:	The name of the collection where the object is stored. In
	 * 						classes that implement objects that are stored in a
	 * 						specific collection, you can omit this parameter and
	 * 						overload the defaultCollection() method.
	 * 	- isImmutable:		This parameter is only relevant when instantiating the
	 * 						object from a string reference: if true, the resulting
	 * 						document will be immutable, that is, its properties cannot
	 * 						be modified.
	 *
	 * The constructor follows this strategy:
	 *
	 * 	- If you provide a string reference, it is assumed you want to load a document
	 * 	  from the database, the reference is expected to be either the document _id
	 * 	  or its _key. If you provide the _id, the collection can be omitted, if not,
	 * 	  the collection is required and if omitted, the method will raise an illegal
	 * 	  document handle exception.
	 * 	- If you provide an object, it is assumed you want to create a new instance,
	 * 	  or that you do not have either the _id or _key: in this case, if you want to
	 * 	  load the corresponding object from the database, you will have to call the
	 * 	  resolve() method. In this case the collection parameter is required.
	 *
	 * All derived classes should support instantiating a document from the first two
	 * parameter of the constructor, custom arguments can be provided after these two.
	 * In particular:
	 *
	 * 	- If the derived class has a single default collection, the collection
	 * 	  argument should be omitted from the constructor.
	 * 	- isImmutable should always be the last argument.
	 *
	 * Any error will raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theReference	{String}|{Object}	The document reference or object.
	 * @param theCollection	{String}|{null}		The document collection.
	 * @param isImmutable	{Boolean}			True, instantiate immutable document.
	 */
	constructor( theRequest, theReference, theCollection = null, isImmutable = false )
	{
		//
		// Init properties.
		//
		this._request = theRequest;
		this._immutable = isImmutable;
		this._persistent = false;
		this._revised = false;
		
		//
		// Set class.
		//
		this.setClass();
		
		//
		// Set collection.
		//
		this.setCollection( theCollection );
		
		//
		// Handle document object.
		//
		if( K.function.isObject( theReference ) )
		{
			//
			// Init document.
			//
			this._document = {};
			
			//
			// Load document.
			//
			this.modify( theReference, true, false );
		}
		
		//
		// Handle document reference.
		//
		else
			this.resolveReference( theReference );
		
		//
		// Normalise properties.
		//
		this.normaliseProperties();
		
	}	// constructor
	

	/************************************************************************************
	 * PUBLIC METHODS																	*
	 ************************************************************************************/

	/**
	 * Insert
	 *
	 * This method will insert the document in the registered collection after validating
	 * its contents.
	 *
	 * Any validation error or insert error will raise an exception.
	 *
	 * @returns {Boolean}	True, document inserted.
	 */
	insert()
	{
		//
		// Validate document.
		//
		if( this.validate( true ) )
		{
			//
			// Check collection.
			//
			const collection = db._collection( this._collection );
			if( ! collection )
				throw(
					new MyError(
						'InsertDocument',					// Error name.
						K.error.NoCollection,				// Message code.
						this._request.application.language,	// Language.
						null,								// Arguments.
						409									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Try insertion.
			//
			try
			{
				//
				// Insert.
				//
				const meta = collection.insert( this._document );
				
				//
				// Update metadata.
				//
				this._document._id = meta._id;
				this._document._key = meta._key;
				
				//
				// Handle revision.
				//
				if( this._document.hasOwnProperty( '_rev' )
					&& (this._document._rev !== meta._rev) )
					this._revised = true;
				this._document._rev = meta._rev;
				
				//
				// Set persistent flag.
				//
				this._persistent = true;
			}
			catch( error )
			{
				//
				// Reset persistent flag.
				//
				this._persistent = false;
				
				//
				// Handle unique constraint error.
				//
				if( error.isArangoError
					&& (error.errorNum === ARANGO_DUPLICATE) )
				{
					//
					// Set field references.
					//
					let field = null;
					const reference = {};
					for( field of this.uniqueFields )
						reference[ field ] = ( this._document.hasOwnProperty( field ) )
											 ? this._document[ field ]
											 : null;
					
					//
					// Set field arguments.
					//
					let args = [];
					for( field in reference )
					{
						const value = ( Array.isArray( reference[ field ] ) )
									  ? `[${reference[field].join(', ')}]`
									  : reference[field];
						args.push( `${field} = ${value}` );
					}
					
					throw(
						new MyError(
							'InsertDocument',					// Error name.
							K.error.DuplicateDocument,			// Message code.
							this._request.application.language,	// Language.
							[ this._collection, args.join( ', ' ) ],
							409									// HTTP error code.
						)
					);															// !@! ==>
				}
				
				throw( error );													// !@! ==>
			}
			
			return this._persistent;												// ==~
			
		}	// Document is valid.
		
		return false;																// ==>
		
	}	// insert
	
	/**
	 * Resolve
	 *
	 * This method will attempt to load the document corresponding to the significant
	 * fields of the object, if the document was found, its properties will be set in
	 * the current object according to the falue of doReplace:
	 *
	 * 	- true:		The resolved properties will overwrite the existing ones.
	 * 	- false:	The existing properties will not be replaced.
	 *
	 * Note that the _id, _key and _rev properties will overwrite by default the
	 * existing ones.
	 *
	 * The doAssert parameter is used to determine how errors are managed: if true,
	 * errors will raise an exception, if false, the method will return true, if
	 * successful, or false if not.
	 *
	 * The following assertions will be made:
	 *
	 * 	- Assert that the document has the significant fields to resolve the object.
	 * 	- Assert that only one document matches the significant fields combination.
	 * 	- Assert that the resolved document _id and _key fields match the eventual
	 * 	  current ones.
	 *
	 * If the current object has the revision field, the method will update the
	 * _revised flag accordingly. The _persistent flag will also be updated.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	If true, an exception will be raised if not found
	 * 								(defaults to true).
	 * @returns {Boolean}			True if found.
	 */
	resolve( doReplace = false, doAssert = true )
	{
		//
		// Get significant fields combination.
		//
		const match = this.hasSignificantFields( doAssert );
		
		//
		// Check if has significant fields.
		//
		if( match !== false )
		{
			//
			// Load example query from significant fields.
			// Note that the method assumes you have called hasSignificantFields().
			//
			const selector = {};
			for( const field of match )
				selector[ field ] = this._document[ field ];
			
			//
			// Load document.
			//
			const cursor = db._collection( this._collection ).byExample( selector );
			
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
							[ Object.keys( selector ), this._collection],
							412									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Load found document.
				//
				this.modify( cursor.toArray()[ 0 ], doReplace, true );
				
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
					//
					// Build reference.
					//
					const reference = [];
					for( const field in selector )
						reference.push( `${field} = ${selector[field].toString()}`)
					
					//
					// Raise exception.
					//
					throw(
						new MyError(
							'BadDocumentReference',						// Error name.
							K.error.DocumentNotFound,					// Message code.
							this._request.application.language,			// Language.
							[reference.join( ', ' ), this._collection],	// Error value.
							404											// HTTP error code.
						)
					);															// !@! ==>
				}
				
				//
				// Set flag.
				//
				this._persistent = false;
			}
			
			return this._persistent;												// ==>
			
		}	// Found match combination.
		
		return false;																// ==>
		
	}	// resolve
	
	/**
	 * Replace
	 *
	 * This method will replace the contents of the current document in the database, it
	 * will first check if the current object is persistent, if that is the case, it
	 * will validate the current document and replace its contents in the database and
	 * return true.
	 *
	 * If the current object is not persistent, the method will do nothing and return
	 * null.
	 *
	 * The method will raise an exception if any of the following conditions are met:
	 *
	 * 	- Any current property is invalid.
	 * 	- Any current value replaces an existing locked value.
	 * 	- The current object does not exist.
	 * 	- doRevision is true and current and existing revisions do not match.
	 *
	 * If the current document revision is different than the existing document
	 * revision, the method will raise an exception.
	 *
	 * @param doRevision	{Boolean}	If true, check revision (default).
	 * @returns {Boolean}	True replaced, false not found, null not persistent.
	 */
	replace( doRevision = true )
	{
		//
		// Only if persistent.
		//
		if( this._persistent )
		{
			//
			// Validate contents.
			//
			this.validate( true );
			
			//
			// Get existing document.
			// Note that it will raise an exception if the document doesn't exist:
			// this is wanted, since it would indicate that the document was deleted.
			//
			const existing = db._document( this._document._id );
			
			//
			// Check locked fields.
			//
			this.checkLockedProperties( existing, true );
			
			//
			// Replace document.
			//
			const meta =
				db._replace(
					existing,
					this._document,
					{ overwrite : (! doRevision) }
				);
			
			//
			// Set revision flag.
			//
			this._revised = ( meta._rev !== meta.oldRev );
			
			//
			// Set revision.
			//
			this._document._rev = meta._rev;
			
			return true;															// ==>
			
		}	// Is persistent.
		
		return null;																// ==>
		
	}	// replace
	
	/**
	 * Remove
	 *
	 * This method will remove the document from the database, it will first check if
	 * the current object is persistent, if that is the case, it will proceed to
	 * delete the document from the database and will return true.
	 *
	 * If the document does not exist, the method will return false.
	 *
	 * If the current object is not persistent, the method will do nothing and return
	 * null.
	 *
	 * If the current document revision is different than the existing document
	 * revision, the method will raise an exception.
	 *
	 * @returns {Boolean}	True removed, false not found, null not persistent.
	 */
	remove()
	{
		//
		// Only if persistent.
		//
		if( this._persistent )
		{
			//
			// Check if related.
			//
			this.hasConstraints( true );
			
			//
			// Remove.
			//
			try
			{
				//
				// Delete.
				//
				db._remove( this._document );
				
				//
				// Update persistent flag.
				//
				this._persistent = false;
				
				return true;														// ==>
			}
			catch( error )
			{
				//
				// Catch not found.
				//
				if( (! error.isArangoError)
					|| (error.errorNum !== ARANGO_NOT_FOUND) )
					throw( error );												// !@! ==>
			}
			
			//
			// Ensure persistent flag.
			//
			this._persistent = false;
			
			return false;															// ==>
			
		}	// Is persistent.
		
		return null;																// ==>
		
	}	// remove
	
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
	 * Existing data elements will be replaced if:
	 *
	 * 	- doReplace is true.
	 * 	- Or the field is among the locked properties.
	 * 	- Or the current document does not have the property.
	 *
	 * If the replacement conditions are satisfied, any provided property value of null
	 * will remove the eventually existing property from the current document, if it
	 * exists.
	 *
	 * The method will raise an exception if you provide a value that is a locked
	 * property and that is different from an existing value in the current document.
	 *
	 * The last parameter determines the exception type, if true it means the data
	 * comes from the database, if false, it means the data is coming from the client:
	 *
	 * 	- true: The method was called when resolving the object, if there is a
	 * 	  conflict with a locked property it means that we have an ambiguous document,
	 * 	  the existing and resolved objects have ambiguous identification.
	 * 	- false: The method was called by the constructor when providing an object as
	 * 	  reference, in this case no errors should be raised, since the document was
	 * 	  empty. The method can also be called by clients to update the document's
	 * 	  contents: in this case any conflicting locked value will raise an error.
	 *
	 * All exceptions will be raised by the called setProperty() method.
	 *
	 * @param theData		{Object}	The object properties to add.
	 * @param doReplace		{Boolean}	True, overwrite existing properties.
	 * @param isResolving	{Boolean}	True, called by resolve() (default false).
	 */
	modify( theData, doReplace = true, isResolving = false )
	{
		//
		// Load locked fields.
		//
		const locked = this.lockedFields;
		
		//
		// Iterate properties.
		//
		for( const field in theData )
		{
			//
			// Save property locked status.
			//
			const isLocked = locked.includes( field );
			
			//
			// Determine if the value should be set.
			//
			if( doReplace										// Want to replace,
			 || isLocked										// or field is locked,
			 || (! this._document.hasOwnProperty( field )) )	// or not in document.
				this.setProperty(
					field,										// Field name.
					theData[ field ],							// Field value.
					isLocked,									// Locked flag.
					isResolving									// Is resolving flag.
				);
		}
		
		//
		// Normalise properties.
		//
		this.normaliseProperties();
		
	}	// modify
	
	/**
	 * Validate document
	 *
	 * This method will assert all required fields are present and valid,
	 * if any of these tests fails, the method will raise an exception.
	 *
	 * @param doAssert	{Boolean}	If true, an exception will be raised on errors
	 * 								(defaults to true).
	 * @returns {Boolean}			True if valid.
	 */
	validate( doAssert = true )
	{
		//
		// Load computed fields.
		//
		if( ! this.setComputedProperties( doAssert ) )
			return false;															// ==>
		
		//
		// Validate required fields.
		//
		if( ! this.hasRequiredFields( doAssert ) )
			return false;															// ==>
		
		//
		// Validate properties.
		//
		if( ! this.checkProperties( doAssert ) )
			return false;															// ==>
		
		return true;																// ==>
		
	}	// validate
	
	
	/************************************************************************************
	 * PROTECTED METHODS																*
	 ************************************************************************************/
	
	/**
	 * Set class
	 *
	 * This method will set the document class, which is the _key reference of the
	 * term defining the document class.
	 */
	setClass()
	{
		this._class = 'Document';
		
	}	// setClass
	
	/**
	 * Set collection
	 *
	 * This method will set the document collection, if there are any errors, the
	 * method will raise an exception.
	 *
	 * The method will first check if there is a default collection, if that is the
	 * case, the collection name will be forced to that value.
	 *
	 * @param theCollection	{String} The document collection name.
	 */
	setCollection( theCollection )
	{
		//
		// Force default collection.
		//
		const collection = this.defaultCollection;
		if( collection !== null )
			theCollection = collection;
		
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
						K.error.MissingReqCollection,		// Message code.
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
	 * Load document property
	 *
	 * This method can be used to set the value of a property, it is called by
	 * modify() in any of the following cases:
	 *
	 * 	- The client requested to replace existing values.
	 * 	- The property is locked.
	 * 	- The document does not have the property.
	 *
	 * The method takes care of modifying the existing document value with the
	 * provided value and ensure data integrity.
	 *
	 * If the provided value is null it means that the value should be removed.
	 *
	 * The method will raise an exception if there is a mismatch between the existing
	 * property and the provided one: if the property is locked and the object is
	 * persistent, the method will raise an exception. This includes setting a new
	 * value if there is not one, removing an existing value, or changing an existing
	 * value.
	 *
	 * The last parameter determines the type of exception: true means we are
	 * resolving the document, false means we are updating the document properties,
	 * this means that in the first case there is a mismatch between reserved
	 * properties in the current and persistent documents, while in the second case
	 * there is an attempt to change a locked value.
	 *
	 * @param theField		{String}	The property descriptor _key.
	 * @param theValue		{*}			The property value.
	 * @param isLocked		{Boolean}	True if locked properties.
	 * @param isResolving	{Boolean}	True, called by resolve().
	 */
	setProperty( theField, theValue, isLocked, isResolving )
	{
		//
		// Init local storage.
		//
		const value_old = ( this._document.hasOwnProperty( theField ) )
						  ? this._document[ theField ]
						  : null;
		
		//
		// Handle value modifications.
		//
		if( value_old !== theValue )
		{
			//
			// Handle locked field violation.
			// A locked field can be inserted,
			// but cannot be modified once inserted.
			//
			if( isLocked			// Property is locked
			 && this._persistent )	// and document is persistent.
			{
				//
				// Set exception type.
				//
				let name, type;
				if( isResolving )
				{
					name = 'AmbiguousDocumentReference';
					type = K.error.ResolveMismatch;
				}
				else
				{
					name = 'LockedProperty';
					type = K.error.PropertyLocked;
				}
				
				//
				// Raise exception.
				//
				throw(
					new MyError(
						name,									// Error name.
						type,									// Message code.
						this._request.application.language,		// Language.
						theField,							// Arguments.
						409										// HTTP error code.
					)
				);																// !@! ==>
				
			}	// Property is locked and document is persistent.
			
			//
			// Set new value.
			//
			if( theValue !== null )
				this._document[ theField ] = theValue;
			
			//
			// Delete old value.
			//
			else if( value_old !== null )
				delete this._document[ theField ];
			
		}	// Modify value.
		
	}	// setProperty
	
	/**
	 * Load computed fields
	 *
	 * This method is called before validating the document properties, it should take
	 * care of setting any property whose value is computed using other document
	 * properties.
	 *
	 * The method should return a boolean indicating whether the operation was
	 * successful, or return false if not; if doAssert is true, the method will raise
	 * an exception if unsuccessful.
	 *
	 * The method should fail if the value of a computed property conflicts with the
	 * existing value and the property is locked.
	 *
	 * This class has no computed fields.
	 *
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	setComputedProperties( doAssert = true )
	{
		return true;																// ==>
		
	}	// setComputedProperties
	
	/**
	 * Normalise object properties
	 *
	 * This method is called at the end of the constructor and after adding data to
	 * the object, its duty is to eventually normalise object properties that require
	 * processing.
	 *
	 * Do not confuse this method with setComputedProperties(): the former is
	 * requires the latter to have been called before it can safely compute properties.
	 */
	normaliseProperties()
	{
		// Nothing here.
	}
	
	/**
	 * Check collection type
	 *
	 * This method will check if the collection is of the correct type, if that is not
	 * the case, the method will raise an exception.
	 *
	 * In this class we assume any type of collection, which means that this method
	 * MUST be implemented in derived classes.
	 */
	checkCollectionType()
	{
		// Do nothing.
		
	}	// checkCollectionType
	
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
	checkProperties( doAssert = true )
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
		
	}	// checkProperties
	
	/**
	 * Validate locked document fields
	 *
	 * This method will check if the current document would change any existing locked
	 * properties, it will raise an exception, if doAssert is true, or return true if
	 * doAssert is false; if that is not the case, the method will return false.
	 *
	 * If the current object is not persistent, the method will only return null.
	 *
	 * @param theExisting	{Object}	Existing document.
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}|{null}		True/false for locked, or null if not persistent.
	 */
	checkLockedProperties( theExisting, doAssert = true )
	{
		//
		// Check if persistent.
		//
		if( this._persistent )
		{
			//
			// Intersect locked fields with existing and current objects.
			//
			const locked = this.lockedFields
				.filter( field => {
						return ( theExisting.hasOwnProperty( field )
							&& this._document.hasOwnProperty( field )
							&& theExisting[ field ] !== this._document[ field ] );
					}
				);
			
			//
			// Handle conflicts.
			//
			if( locked.length > 0 )
			{
				//
				// Raise exception.
				//
				if( doAssert )
					throw(
						new MyError(
							'ConstraintViolated',				// Error name.
							K.error.LockedFields,				// Message code.
							this._request.application.language,	// Language.
							locked.join( ', ' ),				// Arguments.
							412									// HTTP error code.
						)
					);															// !@! ==>
				
				return true;														// ==>
			}
			
			return false;															// ==>
		}
		
		return null;																// ==>
		
	}	// checkLockedProperties
	
	/**
	 * Load document reference
	 *
	 * This method is called by the constructor when instantiating the document from a
	 * string reference, in this case it is assumed we are instantiating an existing
	 * document that should be resolved using the provided reference.
	 *
	 * The method assumes that the reference is an _id, if the collection is missing
	 * in the current document and will use the database method, if the collection was
	 * provided in the constructor, the method will use the collection method.
	 *
	 * In the first case, if the operation is successful, the method will set the
	 * collection reference in the current document.
	 *
	 * Any error will raise an exception.
	 *
	 * @param theReference	{String}	The document reference.
	 */
	resolveReference( theReference )
	{
		//
		// Resolve reference.
		//
		try
		{
			//
			// Handle _id reference.
			//
			if( ! this.hasOwnProperty( '_collection' ) )
			{
				//
				// Load immutable document.
				//
				if( this._immutable )
					this._document = db._document( theReference );
				
				//
				// Load modifiable document.
				//
				else
				{
					//
					// Load from database.
					//
					const document = db._document( theReference );
					
					//
					// Copy data.
					// Note that db._document() returns an immutable object.
					//
					this._document = JSON.parse(JSON.stringify(document));
				}
				
				//
				// Set collection.
				//
				this._collection = theReference.split( '/' )[ 0 ];
			
			}	// _id reference.
			
			//
			// Handle _key reference.
			//
			else
			{
				//
				// Check collection.
				//
				const collection = db._collection( this._collection );
				if( ! collection )
					throw(
						new MyError(
							'BadCollection',					// Error name.
							K.error.InvalidColName,				// Message code.
							this._request.application.language,	// Language.
							this._collection,					// Arguments.
							400									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Load immutable document.
				//
				if( this._immutable )
					this._document = collection.document( theReference );
				
				//
				// Load modifiable document.
				//
				else
				{
					//
					// Load from database.
					//
					const document = collection.document( theReference );
					
					//
					// Copy data.
					// Note that db._document() returns an immutable object.
					//
					this._document = JSON.parse(JSON.stringify(document));
				}
				
			}	// _key reference.
			
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
		
	}	// resolveReference
	
	/**
	 * Match significant fields combination
	 *
	 * This method will iterate through all significant field combinations,
	 * significantFields(), and return the first match.
	 *
	 * These combinations are an array of descriptor _key elements that represent
	 * unique selectors for the document, this method will compare each combination to
	 * the contents of the current document and return the first matching one.
	 *
	 * If no full match is possible, the method will return false, or raise an
	 * exception if getMad is true.
	 *
	 * In this class there are no significant fields, so this method will fail: to
	 * resolve the document you must provide a document reference.
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
		// Iterate significant field selectors.
		//
		for( const selector of this.significantFields )
		{
			//
			// Iterate selector.
			//
			let matched = true;
			for( const field of selector )
			{
				if( ! this._document.hasOwnProperty( field ) )
				{
					missing.push( field );	// Note field.
					matched = false;		// Signal missing.
					break;														// =>
				}
			
			}	// Iterating selector.
			
			//
			// Handle match.
			//
			if( matched )
				return selector;													// ==>
		
		}	// Iterating selectors.
		
		//
		// Raise exception.
		//
		if( getMad )
			throw(
				new MyError(
					'IncompleteObject',					// Error name.
					K.error.MissingToResolve,			// Message code.
					this._request.application.language,	// Language.
					null,								// Arguments.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
		return false;																// ==>
		
	}	// hasSignificantFields
	
	/**
	 * Assert all required fields have been set
	 *
	 * This method will check if any required field is missing, if you provide true in
	 * getMad, the method will raise an exception, if false, the method will return a
	 * boolean where true means all required fields are present.
	 *
	 * If the getMad parameter is true, if the object is missing reauired fields, the
	 * method will raise an exception.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if all required fields are there.
	 */
	hasRequiredFields( getMad = true )
	{
		//
		// Init local storage.
		//
		const missing = [];
		
		//
		// Get required fields.
		//
		const fields = this.requiredFields;
		
		//
		// Check required fields.
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
		
	}	// hasRequiredFields
	
	/**
	 * Assert if current object is constrained
	 *
	 * This method will check if the current object has constraints that should
	 * prevent the object from being removed, the method will return true if there is
	 * a constraint, or it will return false.
	 *
	 * If the getMad parameter is true and if the object is constrained, the method will
	 * raise an exception.
	 *
	 * In this class we assume no constraints.
	 *
	 * This method is called before removing the current object.
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
			return false;															// ==>
		
		return null;																// ==>
		
	}	// hasConstraints
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Retrieve class name
	 *
	 * This method will return the class name.
	 *
	 * @returns {String}	The class name.
	 */
	get classname()
	{
		return this._class;															// ==>
		
	}	// classname
	
	/**
	 * Retrieve collection name
	 *
	 * This method will return the collection name.
	 *
	 * @returns {Object}	The collection name.
	 */
	get collection()
	{
		return this._collection;													// ==>
		
	}	// collection
	
	/**
	 * Retrieve document object
	 *
	 * This method will return the document object.
	 *
	 * @returns {Object}	The document object.
	 */
	get document()
	{
		return this._document;														// ==>
		
	}	// document
	
	/**
	 * Retrieve persistent flag
	 *
	 * This method will return the persistence status.
	 *
	 * @returns {Boolean}	True if document is persistent.
	 */
	get persistent()
	{
		return this._persistent;													// ==>
		
	}	// persistent
	
	/**
	 * Retrieve revised flag
	 *
	 * This method will return the revision modification status.
	 *
	 * @returns {Boolean}	True if document revision is obsolete.
	 */
	get revised()
	{
		return this._revised;														// ==>
		
	}	// revised
	
	/**
	 * Return list of significant fields
	 *
	 * This method should return the list of properties that will uniquely identify
	 * the document, it is used when resolving a document from an object.
	 *
	 * The method should return an array of elements that represent the combination of
	 * fields necessary to identify a single instance of the object in the database.
	 * Each element of the array must be an array of descriptor _key elements: when
	 * resolving the object, all elements of the returned array will be matched with
	 * the object contents and if one of these combinations matches the fields in the
	 * object, the document will be resolved using this combination.
	 *
	 * In this class we return an empty array, since there are no defined significant
	 * properties: to resolve the document you must provide a reference in the
	 * constructor..
	 *
	 * @returns {Array}	List of significant fields.
	 */
	get significantFields()
	{
		return [];																	// ==>
		
	}	// significantFields
	
	/**
	 * Return list of required fields
	 *
	 * This method should return the list of required properties.
	 *
	 * In this class we return no properties, since the key can be database-assigned.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return [];																	// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of unique fields
	 *
	 * This method should return the list of unique properties.
	 *
	 * In this class we return the key.
	 *
	 * @returns {Array}	List of unique fields.
	 */
	get uniqueFields()
	{
		return [ '_key' ];															// ==>
		
	}	// uniqueFields
	
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
	get lockedFields()
	{
		return [ '_id', '_key', '_rev' ];											// ==>
		
	}	// lockedFields
	
	
	/************************************************************************************
	 * DEFAULT GLOBALS																	*
	 ************************************************************************************/
	
	/**
	 * Return default collection name
	 *
	 * This method should return the default collection name, if the method returns a
	 * string, the document collection will be forced to that value in the
	 * constructor; if the returned value is null, the collection is expected to be
	 * provided in the constructor.
	 *
	 * In this class collections must be provided.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get defaultCollection()
	{
		return null;																// ==>
		
	}	// defaultCollection
	
}	// Document.

module.exports = Document;
