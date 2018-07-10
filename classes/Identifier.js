'use strict';

//
// Application.
//
const Dict = require( '../dictionary/Dict' );
const Dictionary = require( '../utils/Dictionary' );

//
// Parent.
//
const Persistent = require( './Persistent' );


/**
 * Identifier class
 *
 * This class extends the Persistent class by adding the global identifier property,
 * The local and global identifier properties are required, the namespace identifier
 * is optional.
 */
class Identifier extends Persistent
{
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we compute the global identifier.
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
			// Compute the global identifier.
			// Will raise an exception if it is unable to compute (doAssert).
			//
			const gid = Dictionary.compileGlobalIdentifier( this._document, doAssert );
			
			//
			// Set global identifier.
			//
			if( gid !== null )
				this._document[ Dict.descriptor.kGID ] = gid;
			else
				return false;														// ==>
			
			return true;															// ==>
			
		}	// Parent method passed.
		
		return false;																// ==>
		
	}	// normaliseInsertProperties
	
	
	/************************************************************************************
	 * VALIDATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Match significant fields combination
	 *
	 * Significant fields are a combination of one or more fields whose values will
	 * uniquely identify the document. The method will iterate these combinations and
	 * return the first one in which all properties can be found in the current document.
	 *
	 * We overload this method to compute the global identifier if the object is not
	 * persistent and the global identifier is missing.
	 *
	 * @param doAssert	{Boolean}		True raises an exception on error (default).
	 * @returns {Array}|{false}|{null}	Array if there is a match.
	 */
	validateSignificantProperties( doAssert = true )
	{
		//
		// Check global identifier and assert not persistent.
		//
		if( (! this._persistent)
		 && (! this._document.hasOwnProperty( Dict.descriptor.kGID )) )
		{
			//
			// Compute the global identifier.
			// Will raise an exception if it is unable to compute (doAssert).
			//
			const gid = Dictionary.compileGlobalIdentifier( this._document, doAssert );
			
			//
			// Set global identifier.
			//
			if( gid !== null )
				this._document[ Dict.descriptor.kGID ] = gid;
		}
		
		return super.validateSignificantProperties( doAssert );						// ==>
		
	}	// validateSignificantProperties
	
	
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
				Dict.descriptor.kLID,		// Local identifier.
				Dict.descriptor.kGID		// Global identifier.
			]);																		// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of unique fields
	 *
	 * This method should return the list of unique properties.
	 *
	 * In this class we return the global identifier.
	 *
	 * @returns {Array}	List of unique fields.
	 */
	get uniqueFields()
	{
		return super.uniqueFields
			.concat([
				Dict.descriptor.kGID		// Global identifier.
			]);																		// ==>
		
	}	// uniqueFields
	
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
				Dict.descriptor.kNID,		// Namespace identifier.
				Dict.descriptor.kLID,		// Local identifier.
				Dict.descriptor.kGID		// Global identifier.
			]);																		// ==>
		
	}	// lockedFields
	
	/**
	 * Return list of significant fields
	 *
	 * This method should return the list of properties that will uniquely identify
	 * the document, it is used when resolving a document from an object.
	 *
	 * In this class we add the global identifier.
	 *
	 * @returns {Array}	List of significant fields.
	 */
	get significantFields()
	{
		return super.significantFields
			.concat([
				[ Dict.descriptor.kGID ]	// Global identifier.
			]);																		// ==>
		
	}	// significantFields
	
}	// Identifier.

module.exports = Identifier;
