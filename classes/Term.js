'use strict';

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
	
}	// Term.

module.exports = Term;
