'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );

//
// Parent.
//
const Identified = require( './Identified' );


/**
 * Annex class
 *
 * This class extends the Identified class to implement a study Annex document object, it
 * adds the document descriptor statistics field, doc_desc.
 *
 * This field is used to have a the list of descriptors used in the current document
 * that can be used for query purposes.
 */
class Annex extends Identified
{
	/**
	 * Init document properties
	 *
	 * We overload this method to set the instance member.
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
		this._instance = 'Annex';
		
	}	// initDocumentMembers
	
	
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
	 * We overload this method to ensure the namespace is a reference to a document in
	 * the studies collection.
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
		if( result )
		{
			//
			// Check namespace collection.
			//
			const parts = this._document[ Dict.descriptor.kNID ].split( '/' );
			if( parts[ 0 ] !== 'studies' )
			{
				//
				// Raise exception.
				//
				if( doAssert )
					throw(
						new MyError(
							'BadValue',								// Error name.
							K.error.NotAStudy,						// Message code.
							this._request.application.language,		// Language.
							this._document[ Dict.descriptor.kNID ],	// Arguments.
							412										// HTTP error code.
						)
					);															// !@! ==>
				
				return false;														// ==>
			}
			
		}	// Parent method passed.
		
		return result;																// ==>
		
	}	// validateDocument
	
	
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we overload this method to collect the list of leaf descriptors
	 * and the list of descriptor paths used in the current document.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseInsertProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		const result = super.normaliseInsertProperties( doAssert );
		if( result )
			this._document[ Dict.descriptor.kDocDesc ] =
				this.computeDescriptorPaths();
		
		return result;																// ==>
		
	}	// normaliseInsertProperties
	
	/**
	 * Normalise replace properties
	 *
	 * This method should load any default properties set when replacing the object.
	 *
	 * In this class we compute the current descriptor paths and compare them with the
	 * old ones, the method will save the count differences in the object _diffs local
	 * member.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseReplaceProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		const result = super.normaliseReplaceProperties( doAssert );
		if( result )
		{
			//
			// Clone current stats.
			//
			const previous = K.function.clone( this._document[ Dict.descriptor.kDocDesc ] );
			const current = this.computeDescriptorPaths();
			
			//
			// Set differences in object.
			//
			this.computeDescriptorPathsDiffs( previous, current );
			
			//
			// Update field.
			//
			this._document[ Dict.descriptor.kDocDesc ] = current;
			
		}	// Parent method succeeded.
		
		return result;																// ==>
		
	}	// normaliseReplaceProperties
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of required fields
	 *
	 * This method should return the list of required properties.
	 *
	 * In this class we add the annex type field.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return super.requiredFields
			.concat([
				Dict.descriptor.kTypeAnnex				// Annex type.
			]);																		// ==>
		
	}	// requiredFields
	
	
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
	 * We overload this method to return the studies collection.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get defaultCollection()
	{
		return 'annexes';															// ==>
		
	}	// defaultCollection
	
	/**
	 * Return local fields list
	 *
	 * This method should return an array containing all fields that should be
	 * stripped from the document when resolving its contents with
	 * resolveDocumentByContent().
	 *
	 * In this class we remove the descriptor paths property.
	 *
	 * @returns {Array}	The list of local fields.
	 */
	get localFields()
	{
		return super.localFields
			.concat([
				Dict.descriptor.kDocDesc	// Descriptors paths.
			]);																		// ==>
		
	}	// localFields
	
	
}	// Annex.

module.exports = Annex;
