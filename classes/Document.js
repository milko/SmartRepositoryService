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
 *
 * The class provides the following methods:
 *
 * 	- resolve():
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
	 * 	- theCollection:	The name of the collection where the object is stored.
	 *
	 * If you provide a document reference, the constructor will attempt to load the
	 * document from the collection, if you provide an object, the document properties
	 * will be taken from the provided object and no attempt to read the object from
	 * the collection will occur.
	 *
	 * Any error will raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theReference	{String}|{Object}	The document reference or object.
	 * @param theCollection	{String}|{null}		The document collection.
	 */
	constructor( theRequest, theReference, theCollection = null )
	{
		//
		// Init properties.
		//
		this._request = theRequest;
		
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
			this.loadDocumentData( theReference, true, false );
			
			//
			// Set persistence flag.
			//
			this._persistent = false;
		}
		
		//
		// Handle document reference.
		//
		else
			this.loadDocumentReference( theReference );
		
		//
		// Normalise properties.
		//
		this.normaliseProperties();
		
		//
		// Reset revised flag.
		//
		this._revised = false;
		
	}	// constructor
	
	/**
	 * Insert object
	 *
	 * This method will insert the document in the registered collection after validating
	 * its contents.
	 *
	 * Any validation error or insert error will raise an exception.
	 */
	insert()
	{
		//
		// Check contents.
		//
		this.validate( true );
		
		//
		// Insert document.
		//
		this.insertDocument();
		
	}	// insert
	
	/**
	 * Replace object
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
			this.validateLockedProperties( existing, true );
			
			//
			// Replace document.
			//
			const meta = db._replace( existing, this._document, { overwrite : (! doRevision) });
			
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
	 * Remove object
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
	 * Resolve document
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
	 * 	- Check if the document has the required fields to resolve the object.
	 * 	- Check if only one document matches the significant fields.
	 * 	- Check if the resolved document _id and _key fields match the eventual
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
		// Check required properties.
		//
		if( this.hasSignificantFields( doAssert ) )
			return this.resolveDocument( doReplace, doAssert );						// ==>
		
		return false;																// ==>
		
	}	// resolve
	
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
		// Load class.
		//
		const struct = this.getClass();
		
		//
		// Load computed fields.
		//
		if( ! this.loadComputedProperties( doAssert ) )
			return false;															// ==>
		
		//
		// Validate required fields.
		//
		if( ! this.hasRequiredFields( doAssert ) )
			return false;															// ==>
		
		//
		// Validate properties.
		//
		if( ! this.validateProperties( doAssert ) )
			return false;															// ==>
		
		return true;																// ==>
		
	}	// validate
	
	/**
	 * Insert document
	 *
	 * This method will perform the actual insertion, it expects the validation to
	 * have passed.
	 */
	insertDocument()
	{
		//
		// Try insertion.
		//
		try
		{
			//
			// Insert.
			//
			const meta = db._collection( this._collection ).insert( this._document );
			
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
				for( field of this.getUniqueFields() )
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
				);																// !@! ==>
			}
			
			throw( error );														// !@! ==>
		}
		
	}	// insertDocument
	
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
		this._class = 'Document';
		
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
	 * Resolve document
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
	 * This method assumes the object has the necessary properties to resolve it, in
	 * practice, that you have called hasSignificantFields() beforehand and that the
	 * method returned true.
	 *
	 * Please refer to the resolve() method for further documentation.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	If true, an exception will be raised if not found
	 * 								(defaults to true).
	 * @returns {Boolean}			True if found.
	 */
	resolveDocument( doReplace = false, doAssert = true )
	{
		//
		// Load example query from significant fields.
		// Note that the method assumes you have called hasSignificantFields().
		//
		const example = {};
		for( const field of this.getSignificantFields() )
			example[ field ] = this._document[ field ];
		
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
						[ Object.keys( example ), this._collection],
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
				//
				// Build reference.
				//
				const reference = [];
				for( const field of example )
					reference.push( `${field} = ${example.field.toString()}`)
				
				throw(
					new MyError(
						'BadDocumentReference',						// Error name.
						K.error.DocumentNotFound,					// Message code.
						this._request.application.language,			// Language.
						[reference.join( ', ' ), this._collection],	// Error value.
						404											// HTTP error code.
					)
				);																// !@! ==>
			}
			
			//
			// Set flag.
			//
			this._persistent = false;
		}
		
		return this._persistent;													// ==>
		
	}	// resolveDocument
	
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
	 * The method will raise an exception if the following conditions are met:
	 *
	 * 	- A value exists in the provided data that is a locked property.
	 * 	- The same property exists in the current document.
	 * 	- The values are different.
	 *
	 * The last parameter determines the exception type: if true, the error indicates
	 * an ambiguous object, which means that an existing object has a locked property
	 * differebt from the one in the current object; if false, it means an attempt to
	 * change a locked value. The exception is raised in the loadDocumentProperty()
	 * method.
	 *
	 * @param theData		{Object}	The object properties to add.
	 * @param doReplace		{Boolean}	True, overwrite existing properties.
	 * @param isResolving	{Boolean}	True, called by resolveDocument() (default false).
	 */
	loadDocumentData( theData, doReplace = true, isResolving = false )
	{
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
		const fields = this.getRequiredFields();
		
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
	validateLockedProperties( theExisting, doAssert = true )
	{
		//
		// Check if persistent.
		//
		if( this._persistent )
		{
			//
			// Intersect locked fields with existing and current objects.
			//
			const locked = this.getLockedFields()
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
		
	}	// validateLockedProperties
	
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
	 * In this class we return no properties, since the key may be database-assigned.
	 *
	 * @returns {Array}	List of required fields.
	 */
	getRequiredFields()
	{
		return [];																	// ==>
		
	}	// getRequiredFields
	
	/**
	 * Return list of unique fields
	 *
	 * This method should return the list of unique properties.
	 *
	 * In this class we return the key.
	 *
	 * @returns {Array}	List of unique fields.
	 */
	getUniqueFields()
	{
		return [ '_key' ];																// ==>
		
	}	// getUniqueFields
	
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
		
	}	// get classname
	
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
		
	}	// get collection
	
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
		
	}	// get document
	
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
		
	}	// get persistent
	
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
		
	}	// get revised
	
}	// Document.

module.exports = Document;
