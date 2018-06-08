'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );


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
 * 						constructor, or it is extracted when resolvinf the object.
 * 	- _document:		Holds the document structure.
 * 	- _instance:		Holds the document instance, or class, it defines the current
 * 						instance class or instance use.
 * 	- _persistent:		A boolean flag indicating whether the document was retrieved or
 * 						stored in the collection, if true, it means the object was
 * 						retrieved from its collection.
 * 	- _revised:			A boolean flag indicating whether the revision has changed in
 * 						the event the object was loaded from its collection.
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
	 * 						property, it is used to access environment variables.
	 * 	- theReference:		This parameter represents either the document reference or
	 * 						its initial contents: if provided as a string, it is
	 * 						expected to be the document _id or _key; if provided as an
	 * 						object it is expected to be the document contents; if
	 * 						omitted or null, the object will be an empty document and
	 * 						the collection argument will be asserted.
	 * 	- theCollection:	The name of the collection where the object is stored; if
	 * 						omitted or null, it will be inferred.
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
	 * 	  or that you do not have either the _id or _key. If you want to load the
	 * 	  corresponding object from the database, you will have to explicitly call the
	 * 	  resolve() method. In this case the collection parameter is required.
	 *
	 * All derived classes must support this constructor signature, eventual custom
	 * arguments should be set using a local method interface, or provided in the
	 * object selector as custom arguments that should be caught, resolved and removed
	 * in the derived constructor; these arguments should start by '__' as a convention.
	 *
	 * If the derived class has a single default collection, the collection argument
	 * will be overwritten by the defaultCollection() getter, so, in this case,
	 * clients should omit or set the collection parameter to null.
	 *
	 * Any error will raise an exception.
	 *
	 * This is the instantiation strategy for documents:
	 *
	 * 	- If you want to create a new document:
	 *
	 * 		- If you know it doesn't already exist, or if the key is database-assigned:
	 * 			- Provide the full contents in theReference.
	 * 			- Provide the collection.
	 * 			- Instantiate the object.
	 * 			- Call insertDocument().
	 *
	 * 		- If you don't know if the object exists:
	 * 			- Provide the significant fields in theReference.
	 * 			- Provide the collection.
	 * 			- Instantiate the object.
	 * 			- Call resolveDocument():
	 * 				- If it succeeds, you cannot insert.
	 * 				- if it doesn't succeed:
	 * 					- Add the rest of the contents with setDocumentProperties().
	 * 					- Call insertDocument().
	 * 			- Or call insertDocument() which will raise an exception if duplicate.
	 *
	 * 	- If you want to get an existing document:
	 *
	 * 		- If you have the _id:
	 * 			- Provide the _id in theReference.
	 * 			- Instantiate the object.
	 *
	 * 		- If you have the _key:
	 * 			- Provide the _key in theReference.
	 * 			- Provide the collection.
	 * 			- Instantiate the object.
	 *
	 *		- You have the significant fields:
	 *			- Provide the significant fields in theReference.
	 *			- Provide the collection.
	 *			- Instantiate the object.
	 *			- Call resolveDocument().
	 *
	 * @param theRequest	{Object}					The current request.
	 * @param theReference	{String}|{Object}|”null}	The document reference or object.
	 * @param theCollection	{String}|{null}				The document collection.
	 * @param isImmutable	{Boolean}					True, instantiate immutable document.
	 */
	constructor(
		theRequest,
		theReference = null,
		theCollection = null,
		isImmutable = false )
	{
		//
		// Init properties.
		//
		this.initProperties( theRequest, theCollection, isImmutable );
		
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
			this.setDocumentProperties(
				theReference,			// Provided contents.
				true,					// Replace values.
				false					// Is resolving.
			);
		
		}	// Provided document properties.
		
		//
		// Handle document reference.
		//
		else if( theReference !== null )
		{
			//
			// Resolve document.
			//
			this._document =
				this.resolveDocumentByReference(
					theReference,					// _id or _key.
					true,							// Raise exception.
					isImmutable						// Immutable flag.
				);
			
			//
			// Set persistence flag.
			// We get here only if successful.
			//
			this._persistent = true;
		
		}	// Provided document reference.
		
		//
		// Init document properties.
		//
		else
			this._document = {};
		
		//
		// Assert collection.
		//
		if( ! this.hasOwnProperty( '_collection' ) )
			throw(
				new MyError(
					'MissingRequiredParameter',			// Error name.
					K.error.NoCollection,				// Message code.
					this._request.application.language,	// Language.
					theCollection,						// Error value.
					400									// HTTP error code.
				)
			);																	// !@! ==>
		
		//
		// Normalise properties.
		// We force exceptions if the document is persistent.
		//
		this.normaliseDocumentProperties( this._persistent );
		
	}	// constructor
	
	
	/************************************************************************************
	 * INITIALISATION METHODS															*
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
	 * 	- initDocumentMembers():		Set default document data members.
	 * 	- initDocumentCollection():		Set collection properties.
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
		// Initialise object data members.
		//
		this.initDocumentMembers( theRequest, isImmutable );
		
		//
		// Initialise object environment.
		//
		this.initDocumentCollection( theRequest, theCollection );
		
	}	// initProperties
	
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
		// Initialise object properties.
		//
		this._request = theRequest;
		this._immutable = isImmutable;
		this._persistent = false;
		this._revised = false;
		
	}	// initDocumentMembers
	
	/**
	 * Init document collection
	 *
	 * This method is called through the constructor by initProperties(), its duty is to
	 * initialise the document collection environment.
	 *
	 * This method calls two methods that can be overloaded by derived classes:
	 *
	 * 	- defaultCollection():		Returns the default collection if documents of this
	 * 								class are stored in a single specific collection.
	 * 	- checkCollectionType():	Asserts that the collection is of the correct
	 * 								type: document or edge.
	 *
	 * If defaultCollection() returns a valid collection name and the collection was
	 * not provided in the constructor, this method will set the default collection
	 * name; if the defaultCollection() method was not overloaded and no collection
	 * provided, it will remain unassigned: it is assumed an _id reference was
	 * provided and the collection name will be resolved from it.
	 *
	 * If the method resolves a collection, its type will be checked and the
	 * collection will be stored in the object data member.
	 *
	 * Any error in this phase should raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theCollection	{String}|{null}		The document collection.
	 */
	initDocumentCollection( theRequest, theCollection )
	{
		//
		// Set collection.
		//
		if( theCollection === null )
			theCollection = this.defaultCollection;
		
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
						K.error.InvalidColName,				// Message code.
						this._request.application.language,	// Language.
						theCollection,						// Error value.
						412									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Check collection type.
			// Will raise an exception if unsuccessful.
			//
			this.validateCollectionType( theCollection, true );
			
			//
			// Set collection.
			//
			this._collection = theCollection;
		}
		
	}	// initDocumentCollection
	
	
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Set document properties
	 *
	 * This method will add the provided object properties to the current object's
	 * data.
	 *
	 * The first parameter represents the data to be loaded, the second parameter is a
	 * flag that determines whether the provided data should replace existing properties,
	 * the third parameter is a private flag that indicates whether the method was called
	 * when resolving the object, clients should ignore it.
	 *
	 * This method will iterate all provided properties and call the
	 * setDocumentProperty() for each field/value pair if the following conditions are
	 * satisfied:
	 *
	 * 	- doReplace is true, meaning that the client requires provided properties to
	 * 	  replace existing ones.
	 * 	- Or the field is among the document locked properties.
	 * 	- Or the current document does not have the property.
	 *
	 * If all required conditions are satisfied, the provided value will replace the
	 * existing one as follows:
	 *
	 * 	- If the property doesn't exist, it will be set.
	 * 	- If the property exists, it will be replaced.
	 * 	- If the provided value is null and the property exists, it will be removed.
	 *
	 * The called method will raise an exception if the property is locked, the
	 * provided and existing values do not match and the object is persistent; a
	 * locked property is one that can be inserted, but not modified.
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
	 * Once the client has finished updating properties it should call the
	 * normaliseDocumentProperties(), which tajes care of finalising the contents of the
	 * document, such as loading default values and computing dynamic properties.
	 *
	 * All exceptions will be raised by the called setDocumentProperty() method.
	 *
	 * @param theData		{Object}	The object properties to add.
	 * @param doReplace		{Boolean}	True, overwrite existing properties.
	 * @param isResolving	{Boolean}	True, called by resolve() (default false).
	 */
	setDocumentProperties( theData, doReplace = true, isResolving = false )
	{
		//
		// Get locked fields.
		//
		const locked = this.lockedFields;
		
		//
		// Iterate provided properties.
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
				this.setDocumentProperty(
					field,										// Field name.
					theData[ field ],							// Field value.
					isLocked,									// Locked flag.
					isResolving									// Is resolving flag.
				);
		}
		
	}	// setDocumentProperties
	
	/**
	 * Set document property
	 *
	 * This method can be used to set a single document property, it expects the
	 * following parameters:
	 *
	 * 	- theField:		The property field name: the descriptor _key.
	 * 	- theValue:		The property value, if null, it means we want to remove the
	 * 					existing one.
	 * 	- isLocked:		Will be true if the property is locked.
	 * 	- isResolving:	Will be true if the method was called while resolving the
	 * 					document.
	 *
	 * The method is protected and will be called if any of the following conditions
	 * is satisfied:
	 *
	 * 	- The client requested to replace an existing value,
	 * 	- or the property is locked,
	 * 	- or the document does not have that property.
	 *
	 * The method will update values as follows: null means remove the property and
	 * any other value means replace.
	 *
	 * The method will raise an exception if the provided and existing values do not
	 * match, the current document is persistent and the property is locked.
	 *
	 * The last parameter determines the type of exception: true means we are
	 * resolving the document, which means that there is a mismatch between reserved
	 * properties in the current and persistent documents; false means that we are
	 * modifying a document, which means that there is an attempt to change a locked
	 * value.
	 *
	 * @param theField		{String}	The property descriptor _key.
	 * @param theValue		{*}			The property value.
	 * @param isLocked		{Boolean}	True if locked properties.
	 * @param isResolving	{Boolean}	True, called by resolve().
	 */
	setDocumentProperty( theField, theValue, isLocked, isResolving )
	{
		//
		// Save existing value.
		//
		const value_old = ( this._document.hasOwnProperty( theField ) )
						? this._document[ theField ]
						: null;
		
		//
		// Normalise provided value.
		//
		if( theValue === undefined )
			theValue = null;
		
		//
		// Handle value modifications.
		//
		if( ! this.matchPropertyValue( theField, value_old, theValue ) )
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
						theField,								// Arguments.
						409										// HTTP error code.
					)
				);																// !@! ==>
				
			}	// Property is locked and document is persistent.
			
			//
			// Set value.
			//
			if( theValue !== null )
				this._document[ theField ] = theValue;
			
			//
			// Delete value.
			//
			else if( value_old !== null )			// Superflous?
				delete this._document[ theField ];
			
		}	// Modify value.
		
	}	// setDocumentProperty
	
	/**
	 * Normalise document properties
	 *
	 * This method should finalise the contents of the document, such as setting
	 * eventual missing default values or computing dynamic properties.
	 *
	 * The method is called at the end of the constructor and before validating the
	 * contents of the document.
	 *
	 * The provided parameter is a flag that determines whether errors raise
	 * exceptions or not, it is set to false by default.
	 *
	 * In this class we have no dynamic properties.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseDocumentProperties( doAssert = true )
	{
		return true;																// ==>
		
	}	// normaliseDocumentProperties
	
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we do notning.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseInsertProperties( doAssert = true )
	{
		return true;																// ==>
		
	}	// normaliseInsertProperties
	
	/**
	 * Normalise replace properties
	 *
	 * This method should load any default properties set when replacing the object.
	 *
	 * In this class we do notning.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseReplaceProperties( doAssert = true )
	{
		return true;																// ==>
		
	}	// normaliseReplaceProperties
	
	
	/************************************************************************************
	 * VALIDATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Validate document
	 *
	 * This method will assert that the current document contents are valid and that
	 * the object is ready to be stored in the database, it will perform the following
	 * steps:
	 *
	 * 	- Normalise document: load any default or computed required property.
	 * 	- Assert if all required properties are there.
	 * 	- Validate all document properties.
	 *
	 * If the provided parameter is true, is any of these checks fails, the method
	 * will raise an exception; if the parameter is false, the method will return a
	 * boolean indicating whether the operation was successful, true, or not, false.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	validateDocument( doAssert = true )
	{
		//
		// Load computed fields.
		//
		if( ! this.normaliseDocumentProperties( doAssert ) )
			return false;															// ==>
		
		//
		// Validate required fields.
		//
		if( ! this.validateRequiredProperties( doAssert ) )
			return false;															// ==>
		
		//
		// Validate properties.
		//
		if( ! this.validateDocumentProperties( doAssert ) )
			return false;															// ==>
		
		return true;																// ==>
		
	}	// validateDocument
	
	/**
	 * Validate document properties
	 *
	 * This method will check if all document fields are valid; if that is not the
	 * case the method will raise an exception, if doAssert is true, or return false.
	 *
	 * The validation is performed by feeding the Validation.validateStructure() with
	 * the current contents of the document.
	 *
	 * This method expects the current document to be complete, this means that
	 * normaliseDocument() and validateRequiredProperties() must have been called before.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	validateDocumentProperties( doAssert = true )
	{
		//
		// Framework.
		//
		const Validation = require( '../utils/Validation' );
		
		//
		// Validate document.
		//
		try
		{
			//
			// Validate document structure.
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
		
	}	// validateDocumentProperties
	
	/**
	 * Validate document constraints
	 *
	 * This method is called before deleting a document, it should ensure the current
	 * document has no constraints that would prevent it from being deleted.
	 *
	 * If the current document is not persistent, the method will return null; if
	 * there are no constraints, the method will return true; if there are
	 * constraints, the method will raise an exception if doAssert is true, or return
	 * false.
	 *
	 * @param doAssert	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True/false if no constraints and null if not
	 * 								persistent.
	 */
	validateDocumentConstraints( doAssert = true )
	{
		return ( this._persistent ) ? true											// ==>
									: null;											// ==>
		
	}	// validateDocumentConstraints
	
	/**
	 * Assert all required fields have been set
	 *
	 * This method can be used to check whether the current document has all of its
	 * required properties, if this is the case, the method will return true; if that
	 * is not the case, the method will return false, or raise an exception if
	 * doAssert is true.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if all required fields are there.
	 */
	validateRequiredProperties( doAssert = true )
	{
		//
		// Init local storage.
		//
		const missing = [];
		const fields = this.requiredFields;
		
		//
		// Check required fields.
		//
		for( const field of fields )
		{
			//
			// Add missing field to list.
			//
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
			if( doAssert )
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
		
	}	// validateRequiredProperties
	
	/**
	 * Match significant fields combination
	 *
	 * This method will iterate through all significant field combinations,
	 * significantFields(), and return the first match.
	 *
	 * Significant fields are a combination of one or more fields whose values will
	 * uniquely identify the document. The method will iterate these combinations and
	 * return the first one in which all properties can be found in the current document.
	 *
	 * If none of these combinations can be satisfied the method will return false, or
	 * raise an exception if doAssert is true.
	 *
	 * If the document has no default significant fields, the method will use the
	 * current document contents, strip local fields using the localFields() getter
	 * and return the normalised contents as the selection; note that in this case it
	 * is likely that resolving the document will result in more than one match, which
	 * by default will raise an exception.
	 *
	 * This method is called by resolveDocument() if neither the _id or _key can be
	 * located in the document.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Array}|{false}		True if all significant fields are there.
	 */
	validateSignificantProperties( doAssert = true )
	{
		//
		// Handle no significant fields.
		//
		const fields = this.significantFields;
		if( fields.length === 0 )
		{
			//
			// Clone document contents and strip local fields.
			//
			const data = JSON.parse(JSON.stringify(this._document));
			for( const field of this.localFields )
			{
				if( data.hasOwnProperty( field ) )
					delete data[ field ];
			}
			
			return data;															// ==>
		}
		
		//
		// Init local storage.
		//
		const missing = [];
		
		//
		// Iterate significant field selectors.
		//
		for( const selector of fields )
		{
			//
			// Iterate selector.
			//
			let matched = true;
			for( const field of selector )
			{
				//
				// Collect missing significant fields.
				//
				if( ! this._document.hasOwnProperty( field ) )
				{
					missing.push( field );	// Note field.
					matched = false;		// Signal missing.
					break;													// =>
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
		if( doAssert )
			throw(
				new MyError(
					'IncompleteObject',					// Error name.
					K.error.MissingToResolve,			// Message code.
					this._request.application.language,	// Language.
					missing.join( ', ' ),				// Arguments.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
		return false;																// ==>
		
	}	// validateSignificantProperties
	
	/**
	 * Validate locked properties
	 *
	 * This method is used to check if the current document would modify any existing
	 * locked properties. The method will return null, if the current document is not
	 * persistent, true if there are no locked properties conflicts and false if there
	 * is a conflict or raise an exception if there is a conflict and doAssert is true.
	 *
	 * The method will load the copy of the current document residing in the database
	 * and check if any locked property would be changed. This operation will raise an
	 * exception, regardless of doAssert, if the document cannot be located in the
	 * database. This also means that the method expects the current document to have
	 * the _id property.
	 *
	 * @param doAssert	{Boolean}	If true, an exception will be raised on errors
	 * 								(defaults to true).
	 * @returns {Boolean}|{null}	True/false for locked, or null if not persistent.
	 */
	validateLockedProperties( doAssert = true )
	{
		//
		// Check if persistent.
		//
		if( this._persistent )
		{
			//
			// Locate document in database.
			//
			const existing = db._document( this._document._id );
			
			//
			// Intersect locked fields with existing and current objects.
			//
			const locked =
				this.lockedFields
					.filter( field => {
						return ( existing.hasOwnProperty( field )
							  && this._document.hasOwnProperty( field )
							  && (! this.matchPropertyValue(
							  			field,
										existing[ field ],
										this._document[ field ]
							))
						);
					});
			
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
	 * Validate collection type
	 *
	 * Collections can either be of type document or edge: this method will check if
	 * the provided collection is of the correct type, if that is the case, the method
	 * will return true, if not, the method will return false, or raise an exception
	 * if doAssert is true.
	 *
	 * Call the Document.isEdgeCollection() or Document.isDocumentCollection() static
	 * methods where appropriate.
	 *
	 * In this class they can be either.
	 *
	 * @param theCollection	{String}	The collection name.
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}				True if all required fields are there.
	 */
	validateCollectionType( theCollection, doAssert = true )
	{
		return true;																// ==>
		
	}	// validateCollectionType
	
	
	/************************************************************************************
	 * ASSERTIONS METHODS																*
	 ************************************************************************************/
	
	/**
	 * Match locked property
	 *
	 * This method is used to implement custom identity matching: if matching two
	 * values requires more than just using "===", you can catch the property name and
	 * the two values in this method/
	 *
	 * The method returns true if both values match, or false if not.
	 *
	 * The method is called in two places: in setDocumentProperty() when
	 * explicitly updating the document contents, and in validateLockedProperties()
	 * when validating the document before persisting.
	 *
	 * In this class we return A === B.
	 *
	 * @param theProperty	{String}	Property name.
	 * @param theExisting	{*}			Existing value.
	 * @param theProvided	{*}			Provided value.
	 * @returns {Boolean}				True if identical.
	 */
	matchPropertyValue( theProperty, theExisting, theProvided )
	{
		return (theExisting === theProvided);										// ==>
		
	}	// matchPropertyValue
	
	
	/************************************************************************************
	 * PERSISTENCE METHODS																*
	 ************************************************************************************/
	
	/**
	 * Insert document
	 *
	 * This method will insert the current document in the database, it will first
	 * validate the document contents, if this succeeds, it will insert the document
	 * in the registered collection.
	 *
	 * If the operation was successful, the persistent status of the current document
	 * will be set to true, if not, it will be set to false.
	 *
	 * Before performing any action, this method will check if the current document is
	 * persistent, if that is the case, it will raise an exception.
	 *
	 * Any error encountered in this method will raise an exception, including
	 * validation errors.
	 *
	 * @returns {Boolean}	True if inserted.
	 */
	insertDocument()
	{
		//
		// Prevent inserting persistent objects.
		// We check this here to catch eventual blunders.
		//
		if( ! this._persistent )
		{
			//
			// Validate document contents.
			// Will raise an exception on error.
			//
			this.validateDocument( true );
			
			//
			// Try insertion.
			//
			try
			{
				//
				// Set insert information.
				//
				if( ! this.normaliseInsertProperties( true ) )
					return false;													// ==>
				
				//
				// Insert.
				//
				const meta =
					db._collection( this._collection )
						.insert( this._document );
				
				//
				// Update metadata.
				//
				this._document._id = meta._id;
				this._document._key = meta._key;
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
					let field;
					const reference = {};
					for( field of this.uniqueFields )
					{
						if( this._document.hasOwnProperty( field ) )
							reference[ field ] = this._document[ field ];
					}
					
					//
					// Set field arguments.
					//
					let args = [];
					for( field in reference )
					{
						//
						// Format display value.
						//
						const value = ( Array.isArray( reference[ field ] ) )
									  ? `[${reference[field].join(', ')}]`
									  : reference[field];
						
						//
						// Add error argument.
						//
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
			
			return this._persistent;												// ==>
			
		}	// Document is not persistent
		
		throw(
			new MyError(
				'InsertDocument',					// Error name.
				K.error.IsPersistent,				// Message code.
				this._request.application.language,	// Language.
				this._document._id,					// Arguments.
				409									// HTTP error code.
			)
		);																		// !@! ==>
		
	}	// insertDocument
	
	/**
	 * Resolve document
	 *
	 * This method will locate the document in the database using either the
	 * document's _key field, or by using the first existing significant fields
	 * matching combination.
	 *
	 * The method expects two parameters:
	 *
	 * 	- doReplace:	If true, properties found in the database will overwrite
	 * 					eventual existing properties of the document.
	 * 	- doAssert:		If this parameter is true, the method will raise an exception
	 * 					on errors; if false, the method will return true if resolved,
	 * 					or false.
	 *
	 * The method will first use the _key value, if there, or it will try to use the
	 * significant fields of the document, if present.
	 *
	 * If the document was resolved, the persistent flag will be set to true; if not,
	 * this flag will be forced to false.
	 *
	 * Note that this method will change the immutable status of the document to false.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if resolved.
	 */
	resolveDocument( doReplace = false, doAssert = true )
	{
		//
		// Init local storage.
		//
		let document;
		
		//
		// Resolve document by _id.
		//
		if( this._document.hasOwnProperty( '_id' ) )
			document =
				this.resolveDocumentByReference(
					this._document._id,
					doAssert,
					this._immutable
				);
		
		//
		// Resolve document by _key.
		//
		else if( this._document.hasOwnProperty( '_key' ) )
			document =
				this.resolveDocumentByReference(
					this._document._key,
					doAssert,
					this._immutable
				);
		
		//
		// Resolve document by content.
		//
		else
			document = this.resolveDocumentByContent( doAssert );
		
		//
		// Load found document.
		//
		if( document !== null )
		{
			//
			// Update document properties.
			//
			this.setDocumentProperties(
				document,					// The resolved document.
				doReplace,					// Replace?
				true						// We are resolving.
			);
			
			//
			// Set persistence flag.
			//
			this._persistent = true;
			
		}	// Resolved document.
		
		return this._persistent;													// ==>
		
	}	// resolveDocument
	
	/**
	 * Resolve document by reference
	 *
	 * This method will attempt to locate the document in the database or current
	 * collection identified by the provided reference and return its contents.
	 *
	 * This method is called by the constructor to initialise the document when an _id
	 * or _key reference is provided: if the collection is missing from the current
	 * object, the method assumes an _id was provided, the method will then set the
	 * document collection.
	 *
	 * The method is also called when resolving the document, in that case the
	 * collection is expected to exist.
	 *
	 * If the document was resolved, the method will return the document contents
	 * object, if the document was not resolved, the method will raise an exception,
	 * if doAssert is true, or return null.
	 *
	 * Note that this method will reset the persistent flag if unsuccessful, but the
	 * caller is responsible for setting it if successful.
	 *
	 * @param theReference	{String}	The document reference.
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @param isImmutable	{Boolean}	True, instantiate immutable document.
	 * @returns {Object}|{null}			Resolved document or null.
	 */
	resolveDocumentByReference( theReference, doAssert = true, isImmutable = false )
	{
		//
		// Init local storage.
		//
		let document;
		
		//
		// Use collection.
		//
		if( this.hasOwnProperty( '_collection' ) )
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
				);																// !@! ==>
			
			//
			// Resolve reference.
			//
			try
			{
				//
				// Resolve.
				//
				document = collection.document( theReference );
				
				return ( isImmutable ) ? document									// ==>
					   				   : JSON.parse(JSON.stringify(document));		// ==>
			}
			catch( error )
			{
				//
				// Set persistence flag.
				//
				this._persistent = false;
				
				//
				// Raise exceptions other than not found.
				//
				if( (! error.isArangoError)
				 || (error.errorNum !== ARANGO_NOT_FOUND) )
					throw( error );												// !@! ==>
				
				//
				// Handle not found.
				//
				if( doAssert )
					throw(
						new MyError(
							'BadDocumentReference',				// Error name.
							K.error.DocumentNotFound,			// Message code.
							this._request.application.language,	// Language.
							[theReference, this._collection],	// Error value.
							404									// HTTP error code.
						)
					);															// !@! ==>
			}
			
			return null;															// ==>
			
		}	// Document has collection.
		
		//
		// Document doesn't have collection:
		// assume _id and extract collection from it.
		//
		
		//
		// Expect _id reference.
		//
		try
		{
			//
			// Resolve.
			//
			document = db._document( theReference );
			
			//
			// Set collection.
			//
			if( ! this.hasOwnProperty( '_collection' ) )
			{
				//
				// Extract collection name.
				//
				const collection = theReference.split( '/' )[ 0 ];
				
				//
				// Validate collection type.
				//
				this.validateCollectionType( collection, doAssert );
				
				//
				// Set collection member.
				//
				this._collection = collection;
			}
			
			return ( isImmutable ) ? document										// ==>
								   : JSON.parse(JSON.stringify(document));			// ==>
		}
		catch( error )
		{
			//
			// Set persistence flag.
			//
			this._persistent = false;
			
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
						'BadDocumentReference',				// Error name.
						K.error.DocumentNotFound,			// Message code.
						this._request.application.language,	// Language.
						[theReference, this._collection],	// Error value.
						404									// HTTP error code.
					)
				);																// !@! ==>
		}
		
		return null;																// ==>
		
	}	// resolveDocumentByReference
	
	/**
	 * Resolve document by content
	 *
	 * This method will attempt to locate the document in the database or current
	 * collection identified by the significant fields of the current document.
	 *
	 * This method is called when resolving a document that does not have either the
	 * _id nor the _key. The method calls validateSignificantProperties() which
	 * returns either a valid combination array of descriptor _key references, null,
	 * if there are no default combinations and false if there are default
	 * combinations, but none are completely matched in the current document. If
	 * doAssert is true, a false result of that method will trigger an exception, or
	 * make this method return null. If that method returns null, this method will
	 * clone the contents of the current document, strip the local fields with the
	 * localFields() getter and use that structure as the selector, this means that
	 * when resolving the object by contents you should only set relevant fields
	 *
	 * If the document was resolved, the method will return the document contents
	 * object, if the document was not resolved, the method will raise an exception,
	 * if doAssert is true, or return null.
	 *
	 * Note that if the combination resolves more than one document, this is
	 * considered an error and will be raised as an exception by default.
	 *
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Object}|{null}			Resolved document or null.
	 */
	resolveDocumentByContent( doAssert = true )
	{
		//
		// Get significant fields combination.
		// Will raise an exception if doAssert is true.
		//
		const match = this.validateSignificantProperties( doAssert );
		
		//
		// Check if has significant fields.
		//
		if( match !== false )
		{
			//
			// Load example query from significant fields.
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
				
				return cursor.toArray()[ 0 ];										// ==>
				
			}	// Found at least one.
			
			//
			// Set flag.
			//
			this._persistent = false;
			
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
				);																// !@! ==>
			}
			
		}	// Found match combination.
		
		return null;																// ==>
		
	}	// resolveDocumentByContent
	
	/**
	 * replaceDocument
	 *
	 * This method will replace the contents of the current document in the database, it
	 * will first check if the current object is persistent, if that is the case, it
	 * will validate the current document and replace its contents in the database.
	 *
	 * The method will return true if the document was replaced or false if the
	 * document is not valid. The method will raise an exception if any of the
	 * following conditions are met:
	 *
	 * 	- Any current property is invalid.
	 * 	- Any current value replaces an existing locked value.
	 * 	- The current object does not exist.
	 * 	- doRevision is true and current and existing revisions do not match.
	 * 	- The current object is not persistent.
	 *
	 * @param doRevision	{Boolean}	If true, check revision (default).
	 * @returns {Boolean}				True if replaced or false if not valid.
	 */
	replaceDocument( doRevision = true )
	{
		//
		// Prevent replacing non persistent objects.
		// We check this here to catch eventual blunders.
		//
		if( this._persistent )
		{
			//
			// Validate contents.
			//
			this.validateDocument( true );
			
			//
			// Check locked fields.
			// Will raise an exception if unsuccessful.
			//
			this.validateLockedProperties( true );
			
			//
			// Set replace information.
			//
			if( ! this.normaliseReplaceProperties( true ) )
				return false;														// ==>
			
			//
			// Replace document.
			//
			const meta =
				db._replace(
					{ _id : this._document._id },	// Selector.
					this._document,					// New data.
					{ overwrite : (! doRevision) }	// Handle revision.
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
	 * This method will remove the document from the database, it will first check if
	 * the current object is persistent, if that is the case, it will proceed to
	 * delete the document from the database and will return true.
	 *
	 * If the document is not persistent, the method will raise an exception.
	 *
	 * If the current object is not persistent, the method will raise an exception.
	 *
	 * If the current document revision is different than the existing document
	 * revision, the method will raise an exception.
	 *
	 * @returns {Boolean}	True removed, false not found, null not persistent.
	 */
	removeDocument()
	{
		//
		// Prevent replacing non persistent objects.
		// We check this here to catch eventual blunders.
		//
		if( this._persistent )
		{
			//
			// Clear from constraints.
			// Errors will raise an exception.
			//
			this.validateDocumentConstraints( true );
			
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
				// Ignore not found.
				//
				if( (! error.isArangoError)
				 || (error.errorNum !== ARANGO_NOT_FOUND) )
					throw( error );												// !@! ==>
				
				//
				// Update persistent flag.
				//
				this._persistent = false;
				
				return false;														// ==>
			}
			
		}	// Is persistent.
		
		throw(
			new MyError(
				'RemoveDocument',					// Error name.
				K.error.IsNotPersistent,			// Message code.
				this._request.application.language,	// Language.
				null,								// Arguments.
				409									// HTTP error code.
			)
		);																		// !@! ==>
		
	}	// removeDocument
	
	/**
	 * Remove document references
	 *
	 * This method will iterate all edge collections and remove any edge that
	 * references the current object both as _to and _from. This means that before
	 * calling this method you MUST handle references that need to be updated if the
	 * current document ceases to exist.
	 *
	 * Since this method is called by removeDocument() we assume the document _id exists.
	 *
	 * The method will return an object containing as property the collection name and
	 * as value the result of the operation.
	 *
	 * This method is not called in this class, derived classes should call it if
	 * approperiate.
	 *
	 * ToDo: The method should not raise an exception on error.
	 * 		 The method expects the delete operation not to fail, a transaction
	 * 		 management procedure should be implemented.
	 *
	 * @returns {Object}	The results indexed by collection name.
	 */
	removeDocumentReferences()
	{
		//
		// Init local storage.
		//
		const result = {};
		const collections =
			db._collections().filter( item => {
				return (
					(item._type === 3) &&
					(! item._name.startsWith( '_' ))
				);
			});
		
		//
		// Iterate all collections.
		//
		for( const item of collections )
		{
			//
			// Remove relationships.
			//
			const collection = db._collection( item._name );
			const op =
				db._query( aql`
					FOR doc IN ${collection}
						FILTER doc._to == ${this._document._id}
							OR doc._from == ${this._document._id}
					REMOVE doc IN ${collection}
				`);
			
			//
			// Log to results.
			//
			result[ item ] = op;
			
		}	// Iterating all collections.
		
		return result;																// ==>
		
	}	// removeDocumentReferences
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Retrieve collection name
	 *
	 * This method will return the current document collection name.
	 *
	 * @returns {String}	The document collection name.
	 */
	get collection()
	{
		return this._collection;													// ==>
		
	}	// collection
	
	/**
	 * Retrieve instance name
	 *
	 * This method will return the current document instance name.
	 * 
	 * This class does not implement a specific instance, so it will return undefined.
	 *
	 * @returns {String}|{undefined}	The document instance name.
	 */
	get instance()
	{
		return this._instance;															// ==>
		
	}	// instance
	
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
	
	/**
	 * Return local fields list
	 *
	 * This method should return an array containing all fields that should be
	 * stripped from the document when resolving its contents with
	 * resolveDocumentByContent().
	 *
	 * In this class we remove _id, _key and _rev.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get localFields()
	{
		return [ '_id', '_key', '_rev' ];											// ==>
		
	}	// localFields
	
	
	/************************************************************************************
	 * STATIC ASSERTION METHODS															*
	 ************************************************************************************/
	
	/**
	 * Is edge collection
	 *
	 * This method will check if the provided collection type is edge, if that is not
	 * the case, the method will raise an exception.
	 *
	 * The raised exception has the HTTP status of 412.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theCollection	{String}	The collection name.
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}				True if of the correct type.
	 */
	static isEdgeCollection( theRequest, theCollection, doAssert = true )
	{
		//
		// Check collection type.
		//
		if( db._collection( theCollection ).type() === 3 )
			return true;															// ==>
		
		if( doAssert )
			throw(
				new MyError(
					'BadCollection',					// Error name.
					K.error.ExpectingEdgeColl,			// Message code.
					theRequest.application.language,	// Language.
					theCollection,						// Error value.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
		return false;																// ==>
		
	}	// isEdgeCollection
	
	/**
	 * Is document collection
	 *
	 * This method will check if the provided collection type is document, if that is not
	 * the case, the method will raise an exception.
	 *
	 * The raised exception has the HTTP status of 412.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theCollection	{String}	The collection name.
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}				True if of the correct type.
	 */
	static isDocumentCollection( theRequest, theCollection, doAssert = true )
	{
		//
		// Check collection type.
		//
		if( db._collection( theCollection ).type() === 2 )
			return true;															// ==>
		
		if( doAssert )
			throw(
				new MyError(
					'BadCollection',					// Error name.
					K.error.ExpectingDocColl,			// Message code.
					theRequest.application.language,	// Language.
					theCollection,						// Error value.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
		return false;																// ==>
		
	}	// isDocumentCollection
	
}	// Document.

module.exports = Document;
