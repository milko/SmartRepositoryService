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

//
// Classes.
//
const Structure = require( './Structure' );


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
 * 	- _modified:		A boolean flag indicating whether the revision has changed.
 * 						The value is set whenever the document is resilved in the
 * 						collection and the current document has the revision field.
 * 						The value can be retrieved with the modified() getter.
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
	 * document from the collection, if you provide an pbject, the document properties
	 * will be taken from the provided object.
	 *
	 * Any error will raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theReference	{String}|{Object}	The document reference or object.
	 * @param theCollection	{String}			The document collection.
	 */
	constructor( theRequest, theReference, theCollection )
	{
		//
		// Set request.
		//
		this._request = theRequest;
		
		//
		// Set persistent flag.
		//
		this._persistent = false;
		
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
			this._document = JSON.parse( JSON.stringify( theReference ) );
		
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
		// Reset modified flag.
		//
		this._modified = false;
		
	}	// constructor
	
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
	 * _modified flag accordingly. The _persistent flag will also be updated.
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
		// Fill computed fields.
		//
		if( ! this.validateComputed( struct, doAssert ) )
			return false;															// ==>
		
		//
		// Validate required fields.
		//
		if( ! this.validateRequired( struct, doAssert ) )
			return false;															// ==>
		
		//
		// Validate properties.
		//
		if( ! this.validateProperties( struct, doAssert ) )
			return false;															// ==>
		
		return true;																// ==>
		
	}	// validate
	
	/**
	 * Insert document
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
	 * Retrieve modified flag
	 *
	 * This method will return the revision modification status.
	 *
	 * @returns {Boolean}	True if document revision is obsolete.
	 */
	get modified()
	{
		return this._modified;														// ==>
		
	}	// get modified
	
	/**
	 * Resolve document
	 *
	 * This method will attempt to load the document corresponding to the significant
	 * fields of the object, if the document was found, its properties will be set in
	 * the current object.
	 *
	 * This method assumes the object has the necessary properties to resolve it.
	 *
	 * Please refer to the resolve() method for documentation.
	 *
	 * In this class we resolve using the _key property.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	If true, an exception will be raised if not found
	 * 								(defaults to true).
	 * @returns {Boolean}			True if found.
	 */
	resolveDocument( doReplace = false, doAssert = true )
	{
		//
		// Init local storage.
		//
		const reference = this._document._key;
		
		//
		// Resolve _key.
		//
		try
		{
			//
			// Load document.
			//
			const found = db._collection( this._collection ).document( reference );
			
			//
			// Load found document.
			//
			this.loadResolvedDocument( found, doReplace );
			
			//
			// Set flag.
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
			if( doAssert )
				throw(
					new MyError(
						'BadDocumentReference',					// Error name.
						K.error.DocumentNotFound,				// Message code.
						this._request.application.language,		// Language.
						[reference, this._collection],			// Error value.
						404										// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Set flag.
			//
			this._persistent = false;
		}
		
		return this._persistent;													// ==>
		
	}	// resolveDocument
	
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
				this._modified = true;
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
				for( field of this.getSignificantFields() )
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
			   ? new Structure( this._request, this._class )							// ==>
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
			);																	// !@! ==>
		
		//
		// Check collection type.
		//
		this.checkCollectionType();
		
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
	 * If the second parameter is false, existing properties will not be overwritten,
	 * the default is true, which means the provided properties will overwrite the
	 * existing ones.
	 *
	 * @param theData	{Object}	The object properties to add.
	 * @param doReplace	{Boolean}	True, overwrite existing properties (defalut).
	 */
	loadDocumentData( theData, doReplace = true )
	{
		//
		// Iterate properties.
		//
		for( const field in theData )
		{
			if( doReplace
				|| (! this._document.hasOwnProperty( field )) )
				this._document[ field ] = theData[ field ];
		}
		
		//
		// Normalise properties.
		//
		this.normaliseProperties();
		
	}	// loadDocumentData
	
	/**
	 * Load document reference
	 *
	 * This method is called by the constructor when the provided reference is a
	 * document reference: it will load the provided object into the _document property
	 * of the instance from the registered collection, if the operation fails, the
	 * method will raise an exception.
	 *
	 * This method implies that the document was instantiated from the collection,
	 * thus it is persistent.
	 *
	 * @param theReference	{String}	The document reference.
	 */
	loadDocumentReference( theReference )
	{
		//
		// Resolve reference.
		//
		try
		{
			//
			// Load document.
			//
			this._document = db._collection( this._collection ).document( theReference );
			
			//
			// Set persistent flag.
			//
			this._persistent = true;
		}
			
			//
			// Handle errors.
			//
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
					[theReference, this._collection],	// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}
		
	}	// loadDocumentReference
	
	/**
	 * Add resolved data
	 *
	 * This method will add the provided object properties to the current object's
	 * data, unlike the loadDocumentData() method, this one expects the provided object to be
	 * complete and will overwrite by default the _id, _key and _rev fields.
	 *
	 * If the second parameter is false, existing properties will not be overwritten,
	 * the default is true, which means the provided properties will overwrite the
	 * existing ones.
	 *
	 * @param theData	{Object}	The object properties to add.
	 * @param doReplace	{Boolean}	True, overwrite existing properties (defalut).
	 */
	loadResolvedDocument( theData, doReplace = true )
	{
		//
		// Check _id.
		//
		if( this._document.hasOwnProperty( '_id' )
			&& (this._document._id !== theData._id) )
			throw(
				new MyError(
					'AmbiguousDocumentReference',			// Error name.
					K.error.IdMismatch,						// Message code.
					this._request.application.language,		// Language.
					[ this._document._id, theData._id ],	// Arguments.
					409										// HTTP error code.
				)
			);																	// !@! ==>
		
		//
		// Set _id.
		//
		this._document._id = theData._id;
		delete theData._id;
		
		//
		// Check _key.
		//
		if( this._document.hasOwnProperty( '_key' )
			&& (this._document._key !== theData._key) )
			throw(
				new MyError(
					'AmbiguousDocumentReference',			// Error name.
					K.error.KeyMismatch,					// Message code.
					this._request.application.language,		// Language.
					[ this._document._key, theData._key ],	// Arguments.
					409										// HTTP error code.
				)
			);																// !@! ==>
		
		//
		// Set _key.
		//
		this._document._key = theData._key;
		delete theData._key;
		
		//
		// Check _rev.
		//
		if( this._document.hasOwnProperty( '_rev' )
			&& (this._document._rev !== theData._rev) )
			this._modified = true;
		
		//
		// Set _rev.
		//
		this._document._rev = theData._rev;
		delete theData._rev;
		
		//
		// Set other fields.
		//
		this.loadDocumentData( theData, doReplace );
		
	}	// loadResolvedDocument
	
	/**
	 * Assert all required fields have been set
	 *
	 * This method will check if any required field is missing, if you provide true in
	 * getMad, the method will raise an exception, if false, the method will return a
	 * boolean where true means all required fields are present.
	 *
	 * In this class we assert the presence of _from, _to and predicate.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if all required fields are there.
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
	 * Fill computed fields
	 *
	 * This method will take care of filling the computed fields.
	 *
	 * The instructions will be taken from the provided Structure object.
	 *
	 * @param theStructure	{Structure}	The class structure object.
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	validateComputed( theStructure, doAssert = true )
	{
		return true;																// ==>
		
	}	// validateComputed
	
	/**
	 * Check required fields
	 *
	 * This method will check if all required fields are present, if that is the case,
	 * the method will return true; if that is not the case the method will raise an
	 * exception, if doAssert is true, or return false.
	 *
	 * @param theStructure	{Structure}	The class structure object.
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	validateRequired( theStructure, doAssert = true )
	{
		//
		// Nothing to do here.
		//
		if( theStructure === null )
			return true;															// ==>
		
		return true;																// ==>
		
	}	// validateRequired
	
	/**
	 * Validate document fields
	 *
	 * This method will check if all document fields are valid; if that is not the
	 * case the method will raise an exception, if doAssert is true, or return false.
	 *
	 * @param theStructure	{Structure}	The class structure object.
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	validateProperties( theStructure, doAssert = true )
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
	 * Return list of significant fields
	 *
	 * This method will return the descriptor _key names for all the significant
	 * fields for documents of this class, this means the fields that uniquely
	 * identify the document in the collection.
	 */
	getSignificantFields()
	{
		return [ '_key' ];															// ==>
		
	}	// getSignificantFields
	
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
	
}	// Document.

module.exports = Document;
