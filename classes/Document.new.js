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
 * This virtual class declares the methods that all persistent document classes should
 * support, the class features the following properties:
 *
 * 	- _request:			Holds the current service request, it is set when the object
 * 						is instanttiated.
 * 	- _collection:		Holds the collection name, it is either explicitly provided in
 * 						the constructor, or it is set to the default value in the
 * 						constructor.
 * 	- _instance:		Holds the document instance, or class, it defines the current
 * 						instance class or instance use.
 * 	- _document:		Holds the document structure.
 * 	- _persistent:		A boolean flag indicating whether the document was retrieved or
 * 						stored in the collection, if true, it means the object was
 * 						retrieved from its collection.
 * 	- _revised:			A boolean flag indicating whether the revision has changed in
 * 						the event the object was loaded from its collection.
 * 						The value can be retrieved with the revised() getter.
 *
 * The class implements the following public interface:
 *
 * 	- constructor():	The constructor will instantiate the document in these stemps:
 * 		- initProperties():		Set the default properties of the object, derived
 * 								classes should overload this method if they implement
 * 								additional data members.
 * 		- initDocument():		Set the document data structure, this will either be
 * 								from the provided object, or by resolving the provided
 * 								reference.
 * 		- normaliseDocument():	Update document with eventual computed properties, or
 * 								other data.
 * 		- resolveRelated():		Resolve related documents, load, resolve or locate
 * 								related documents.
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
		this.initProperties( theRequest, theCollection, isImmutable );
		
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
	 * INITIALISATION PROTECTED METHODS													*
	 ************************************************************************************/
	
	/**
	 * Init properties
	 *
	 * This method is called at the beginning of the instantiation process, its duty
	 * is to set the main object properties before resolving or finalising the
	 * instantiation.
	 *
	 * This method performs the following steps:
	 *
	 * 	- initDocumentProperties():		Set default document data members.
	 * 	- initCollectionProperties():	Set collection properties.
	 * 	- initClassProperties():		Set class properties.
	 *
	 * Any error in this phase should raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theCollection	{String}|{null}		The document collection.
	 * @param isImmutable	{Boolean}			True, instantiate immutable document.
	 */
	initProperties( theRequest, theCollection, isImmutable )
	{
		//
		// Initialise object properties.
		//
		this.initDocumentProperties( theRequestn, isImmutable );
		
		//
		// Initialise collection properties.
		//
		this.initCollectionProperties( theRequest, theCollection );
		
	}	// initProperties
	
	
	/************************************************************************************
	 * INITIALISATION LOCAL METHODS														*
	 ************************************************************************************/
	
	/**
	 * Init document properties
	 *
	 * This method is called by initProperties(), its duty is to initialise the main
	 * object properties.
	 *
	 * The properties initialised in this method should be of a static or default
	 * nature, by default hey concern:
	 *
	 * 	- _request:		The current service request record.
	 * 	- _immutable:	The immutable status.
	 * 	- _persistent:	The persistent status.
	 * 	- _revised:		The revision status.
	 * 	- _instance:		The document class.
	 *
	 * This class is general, it does not implement any specific instance, so testing
	 * for the document class will return undefined: in derived classes that implement
	 * specific instances, you should call the parent method and set the specific
	 * class name.
	 *
	 * Any error in this phase should raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theCollection	{String}|{null}		The document collection.
	 * @param isImmutable	{Boolean}			True, instantiate immutable document.
	 */
	initDocumentProperties( theRequest, theCollection, isImmutable )
	{
		//
		// Initialise object properties.
		//
		this._request = theRequest;
		this._immutable = isImmutable;
		this._persistent = false;
		this._revised = false;
		
	}	// initDocumentProperties
	
	/**
	 * Init collection properties
	 *
	 * This method is called by initProperties(), its duty is to initialise the
	 * document collection environment.
	 *
	 * This method calls two methods that can be overloaded by derived classes:
	 *
	 * 	- defaultCollection():		Returns the default collection if documents of this
	 * 								class are stored in a single specific collection.
	 * 	- checkCollectionType():	Asserts that the collection is of the correct
	 * 								type: document or edge.
	 *
	 * Any error in this phase should raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theCollection	{String}|{null}		The document collection.
	 */
	initCollectionProperties( theRequest, theCollection )
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
			// Check collection.
			//
			if( ! db._collection( theCollection ) )
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
			this.assertCollectionType( theCollection );
			
			//
			// Set collection.
			//
			this._collection = theCollection;
		}
		
	}	// initCollectionProperties
	
	
	/************************************************************************************
	 * ASSERTION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Assert collection type
	 *
	 * This method will check if the collection is of the correct type, if that is not
	 * the case, the method must raise an exception.
	 *
	 * Call the Dictionary.isEdgeCollection() or Dictionary.isDocumentCollection()
	 * static methods where appropriate.
	 *
	 * Collections may be either edge or document.
	 *
	 * In this class they can be either.
	 */
	assertCollectionType()
	{
		// Can be either.
		
	}	// assertCollectionType
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Retrieve instance name
	 *
	 * This method will return the instance name.
	 * 
	 * This class does not implement a specific instance, so it will return undefined.
	 *
	 * @returns {String}	The class name.
	 */
	get instance()
	{
		return this._instance;															// ==>
		
	}	// instance
	
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
	 * This method should return the default collection name: if documents of this
	 * class belong to a specific collection, this method should return its name; if
	 * documents of this class may be stored in different collectons, this method
	 * should return null.
	 *
	 * This method determines whether the collection must be provided or not in the
	 * constructor.
	 *
	 * In this class collections must be provided.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get defaultCollection()
	{
		return null;																// ==>
		
	}	// defaultCollection
	
	
	/************************************************************************************
	 * STATIC INTERFACE																	*
	 ************************************************************************************/
	
	/**
	 * Resolve document reference
	 *
	 * This method can be used to locate and return a document identified by the
	 * provided _id or _key reference.
	 * is called by the constructor when instantiating the document from a
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
	
}	// Document.

module.exports = Document;
