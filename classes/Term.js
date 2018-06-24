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
// Parent.
//
const Document = require( './Document' );


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
class Term extends Document
{
	/**
	 * Constructor
	 *
	 * We overload the constructor to omit the collection argument, since it has a
	 * default value.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theReference	{String}|{Object}	The document reference or object.
	 * @param isImmutable	{Boolean}			True, instantiate immutable document.
	 */
	constructor( theRequest, theReference, isImmutable = false )
	{
		//
		// Call parent method.
		//
		super( theRequest, theReference, null, isImmutable );
		
	}	// constructor
	
	
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
		this._class = 'Term';
		
	}	// setClass
	
	/**
	 * Load computed fields
	 *
	 * We overload this method to set the global identifier and copy its value to the
	 * document key.
	 *
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	setComputedProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.setComputedProperties( doAssert ) )
		{
			//
			// Compute the global identifier.
			// Will raise an exception if it is unable to compute (doAssert).
			//
			const gid = Dictionary.compileGlobalIdentifier( this._document, doAssert );
			
			//
			// Check global identifier.
			//
			if( gid !== null )
			{
				//
				// Set lock flags.
				//
				const lock_key = this._document.hasOwnProperty( '_key' );
				const lock_gid = this._document.hasOwnProperty( Dict.descriptor.kGID );
				
				//
				// Set identifier.
				// Will raise an exception if document has GID
				// and value is different.
				//
				this.setProperty(
					Dict.descriptor.kGID,	// Field name.
					gid,					// Field value.
					lock_gid,				// Locked if exists.
					false					// Validating, thus not resolving.
				);
				
				//
				// Set key.
				// Will raise an exception if the eventual existing _key
				// is different (locked flag).
				//
				this.setProperty(
					'_key',					// Field name.
					gid,					// Field value.
					lock_key,				// Locked if exists.
					false					// Validating, thus not resolving.
				);
			}
			else
				return false;														// ==>
			
			return true;															// ==>
			
		}	// Parent method was successful.
		
		return false;																// ==>
		
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
		
	}	// initDocumentFromReference
	
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
					missing.join(', '),					// Arguments.
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
	
}	// Term.

module.exports = Term;
