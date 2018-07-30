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
 * Identified class
 *
 * This class extends the Identifier class by ensuring the _key to be equal to the
 * global dentifier.
 */
class Identified extends Identifier
{
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise document properties
	 *
	 * This method should finalise the contents of the document, such as setting
	 * eventual missing default values or computing dynamic properties.
	 *
	 * The provided parameter is a flag that determines whether errors raise
	 * exceptions or not, it is set to true by default.
	 *
	 * The method is called at the end of the constructor and before validating the
	 * contents of the document: in the first case the doAssert flag is set to the
	 * value of the persistent flag, which means that if this method fails, an
	 * exception will be raised if the object is persistent, while if the object is
	 * not persistent it may still not have all of its fields; in the second case, the
	 * method should raise an exception according to the value of doAssert passed to
	 * the caller method.
	 *
	 * In this class we copy the computer global identifier to the _key, if the former
	 * is there.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseDocumentProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.normaliseDocumentProperties( doAssert ) )
		{
			//
			// Copy the global identifier to the _key.
			// If missing, it would return false.
			//
			this._document._key = this._document[ Dict.descriptor.kGID ];
			
			return true;															// ==>
			
		}	// Parent method passed.
		
		return false;																// ==>
		
	}	// normaliseDocumentProperties
	
	
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
	
	
}	// Identified.

module.exports = Identified;
