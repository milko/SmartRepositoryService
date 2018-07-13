'use strict';

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );

//
// Parent.
//
const Identifier = require( './Identifier' );


/**
 * Term class
 *
 * This class extends the Persistent class by adding the global identifier property,
 * The local and global identifier properties are required, the namespace identifier
 * is optional.
 */
class Term extends Identifier
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
		this._instance = 'Term';
		
	}	// initDocumentMembers
	
	
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we copy the global identifier value to the _key.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseInsertProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.normaliseInsertProperties( doAssert ) )
		{
			//
			// Copy the global identifier to the _key.
			//
			this._document._key = this._document[ Dict.descriptor.kGID ];
			
			return true;															// ==>
			
		}	// Parent method passed.
		
		return false;																// ==>
		
	}	// normaliseInsertProperties
	
	
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
	 * In this class we overload this method to skip the default namespace term: this
	 * term has an empty local identifier, this is intentional in order to prevent
	 * anyone from creating such a namespace, the local identifier is required and
	 * cannot be empty, so we skip this term and assume it is valid.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	validateDocument( doAssert = true )
	{
		//
		// Filter default namespace.
		//
		if( (this._document[ Dict.descriptor.kGID ] === ':')
		 && (this._document[ Dict.descriptor.kDeploy ] === Dict.term.kStateApplicationDefault) )
		{
			//
			// Load computed fields.
			//
			if( ! this.normaliseDocumentProperties( doAssert ) )
				return false;														// ==>
			
			return true;															// ==>
		}
		
		else
			return super.validateDocument( doAssert );								// ==>
		
	}	// validateDocument
	
	/**
	 * Validate collection type
	 *
	 * In this class we assert the collection to be of type document.
	 *
	 * @param theCollection	{String}	The collection name.
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}				True if all required fields are there.
	 */
	validateCollectionType( theCollection, doAssert = true )
	{
		return Term.isDocumentCollection(
			this._request,
			theCollection,
			doAssert
		);																			// ==>
		
	}	// validateCollectionType
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of required fields
	 *
	 * This method should return the list of required properties.
	 *
	 * In this class we return the local identifier and the global identifier.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return super.requiredFields
			.concat([
				'_key'						// Record key.
			]);																		// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of locked fields
	 *
	 * This method should return the list of fields that cannot be changed once the
	 * document has been inserted.
	 *
	 * In this class we return the namespace, local and global identifiers.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				'_key'						// Record key.
			]);																		// ==>
		
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
	 * We overload this method to return the terms collection.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get defaultCollection()
	{
		return 'terms';																// ==>
		
	}	// defaultCollection

	
}	// Term.

module.exports = Term;
