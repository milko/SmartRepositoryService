'use strict';

//
// Application.
//
const Dict = require( '../dictionary/Dict' );

//
// Parent.
//
const Document = require( './Document' );


/**
 * Persistent class
 *
 * This  class extends the document class by adding the creation and modification time
 * stamps when the object persists in the database.
 */
class Persistent extends Document
{
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we set the creation and modification time stamps.
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
		if( result === true )
		{
			//
			// Get time stamp.
			//
			const stamp = Date.now();
			
			//
			// Set creation time stamp.
			//
			this._document[ Dict.descriptor.kCStamp ] = stamp;
			
			//
			// Set modification time stamp.
			//
			this._document[ Dict.descriptor.kMStamp ] = stamp;
			
			return true;															// ==>
		}
		
		return result;																// ==>
		
	}	// normaliseInsertProperties
	
	/**
	 * Normalise replace properties
	 *
	 * This method should load any default properties set when replacing the object.
	 *
	 * In this class we set the modification time stamp.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseReplaceProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		const result = super.normaliseInsertProperties( doAssert );
		if( result === true )
		{
			//
			// Set modification time stamp.
			//
			this._document[ Dict.descriptor.kMStamp ] = Date.now();
			
			return true;															// ==>
		}
		
		return result;																// ==>
		
	}	// normaliseReplaceProperties
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of locked fields
	 *
	 * In this class we lock the creation time stamp.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				Dict.descriptor.kCStamp		// Creation time stamp.
			]);																		// ==>
		
	}	// lockedFields
	
	
	/************************************************************************************
	 * DEFAULT GLOBALS																	*
	 ************************************************************************************/
	
	/**
	 * Return local fields list
	 *
	 * This method should return an array containing all fields that should be
	 * stripped from the document when resolving its contents with
	 * resolveDocumentByContent().
	 *
	 * In this class we remove the creation and modification time stamps.
	 *
	 * @returns {Array}	The list of local fields.
	 */
	get localFields()
	{
		return super.localFields
			.concat([
				Dict.descriptor.kCStamp,	// Creation time stamp.
				Dict.descriptor.kMStamp		// Modification time stamp.
			]);																		// ==>
		
	}	// localFields
	
}	// Persistent.

module.exports = Persistent;
