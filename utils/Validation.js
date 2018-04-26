'use strict';

//
// Frameworks.
//
const fs = require('fs');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;

//
// Application.
//
const K = require( './Constants' );


/**
 * Validation class
 *
 * This class contains a series of static methods that manage data validation.
 */
class Validation
{
	/**
	 * Cast to string
	 *
	 * This method will cast the provided value to string.
	 *
	 * @param theValue	{*}	The value to cast.
	 * @returns {String}	The value cast to a string.
	 */
	static castString( theValue )
	{
		return theValue.toString();													// ==>

	}	// castString

	/**
	 * Cast to number
	 *
	 * This method will cast the provided value to a number.
	 *
	 * If the cast failes, the method will return undefined.
	 *
	 * @param theValue	{*}				The value to cast.
	 * @returns {Number}|{undefined}	The value cast to a number.
	 */
	static castNumber( theValue )
	{
		//
		// Cast.
		//
		const value = Number( theValue );

		//
		// Assert correct.
		//
		if( isNaN( value ) )
			return undefined;														// ==>

		return value;																// ==>

	}	// castNumber

	/**
	 * Cast to boolean
	 *
	 * This method will cast the provided value to a boolean.
	 *
	 * @param theValue	{*}	The value to cast.
	 * @returns {Boolean}	The value cast to a boolean.
	 */
	static castBoolean( theValue )
	{
		return Boolean( theValue );													// ==>

	}	// castBoolean

	/**
	 * Cast to hexadecimal
	 *
	 * This method will cast the provided value to a hexadecimal.
	 *
	 * The method doesn't cast the value to hexadecimal, it rather sets the string to
	 * lowercase, so that comparing hex strings will work.
	 *
	 * @param theValue	{*}	The value to cast.
	 * @returns {String}	The value cast to a hexadecimal.
	 */
	static castHexadecimal( theValue )
	{
		//
		// Cast to string.
		//
		let value = Validation.castString( theValue );

		return value.toLowerCase();													// ==>

	}	// castHexadecimal

	/**
	 * Validate URL
	 *
	 * This method will validate an URL.
	 *
	 * The method currently does not do anything, if it did, it would raise an
	 * exception if the URL was invalid.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theValue	{String}	The value to check.
	 * @returns {String}			The normalised value.
	 */
	static validateUrl( theValue )
	{
		return theValue;															// ==>

	}	// validateUrl

	/**
	 * Validate HEX
	 *
	 * This method will validate a hexadecimal string.
	 *
	 * The method currently does not do anything, if it did, it would raise an
	 * exception if the value was invalid. Hexadecimal strings are handled by the cast
	 * method and by Joi.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theValue	{String}	The value to check.
	 * @returns {String}			The normalised value.
	 */
	static validateHex( theValue )
	{
		return theValue;															// ==>

	}	// validateHex

	/**
	 * Validate integer
	 *
	 * This method will validate an integer value.
	 *
	 * The method currently does not do anything, if it did, it would raise an
	 * exception if the value was invalid. Integers are handled by the cast
	 * method and by Joi.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theValue	{String}	The value to check.
	 * @returns {Number}			The normalised value.
	 */
	static validateInt( theValue )
	{
		return theValue;															// ==>

	}	// validateInt

	/**
	 * Validate e-mail
	 *
	 * This method will validate an e-mail address.
	 *
	 * The method currently does not do anything, if it did, it would raise an
	 * exception if the value was invalid. E-mails are handled by the cast
	 * method and by Joi.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theValue	{String}	The value to check.
	 * @returns {String}			The normalised value.
	 */
	static validateEmail( theValue )
	{
		return theValue;															// ==>

	}	// validateEmail

	/**
	 * Validate range
	 *
	 * This method will validate a range.
	 *
	 * The method currently does not do anything, if it did, it would raise an
	 * exception if the value was invalid. Ranges are handled by Joi.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theValue	{Array}	The value to check.
	 * @returns {Array}			The normalised value.
	 */
	static ValidateRange( theValue )
	{
		return theValue;															// ==>

	}	// ValidateRange

	/**
	 * Validate size range
	 *
	 * This method will validate a size range.
	 *
	 * The method currently does not do anything, if it did, it would raise an
	 * exception if the value was invalid. Ranges are handled by Joi.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theValue	{Array}	The value to check.
	 * @returns {Array}			The normalised value.
	 */
	static validateSizeRange( theValue )
	{
		return theValue;															// ==>

	}	// ValidateRange

}	// validateSizeRange.

module.exports = Validation;
