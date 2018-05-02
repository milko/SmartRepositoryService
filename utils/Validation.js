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
const MyError = require( '../utils/MyError' );


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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue	{*}				The value to cast.
	 * @returns {String}				The value cast to a string.
	 */
	static castString( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue	{*}				The value to cast.
	 * @returns {Number}|{undefined}	The value cast to a number.
	 */
	static castNumber( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue	{*}				The value to cast.
	 * @returns {Boolean}				The value cast to a boolean.
	 */
	static castBoolean( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue	{*}				The value to cast.
	 * @returns {String}				The value cast to a hexadecimal.
	 */
	static castHexadecimal( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue	{String}		The value to check.
	 * @returns {String}				The normalised value.
	 */
	static validateUrl( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{String}	The value to check.
	 * @returns {String}				The normalised value.
	 */
	static validateHex( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{String}	The value to check.
	 * @returns {Number}				The normalised value.
	 */
	static validateInt( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{String}	The value to check.
	 * @returns {String}				The normalised value.
	 */
	static validateEmail( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{Array}		The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static ValidateRange( theRequest, theValue )
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
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{Array}		The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateSizeRange( theRequest, theValue )
	{
		return theValue;															// ==>

	}	// ValidateRange

	/**
	 * Validate GeoJSON
	 *
	 * This method will validate a GeoJSON structure.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{Array}		The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateGeoJSON( theRequest, theValue )
	{
		//
		// Load framework.
		//
		const validator = require( '../utils/GeoJSONValidation' );

		//
		// Define position checker.
		//
		validator.define( "Position", (position) =>
		{
			let errors = [];

			if( (position[0] < -180)
			 || (position[0] > 180) )
				errors.push( "invalid longitude [" + position[0] + "]" );

			if( (position[1] < -90)
			 || (position[1] > 90) )
				errors.push( "invalid latitude [" + position[1] + "]" );

			return errors;
		});

		//
		// Validate.
		//
		validator.valid( theValue, (valid, error) =>
		{
			if( ! valid )
			{
				const errors = error.join( '. ' );
				throw(
					new MyError(
						'BadValue',							// Error name.
						errors,								// Message.
						theRequest.application.language		// Language.
					)
				);																// !@! ==>
			}
		});

		return theValue;															// ==>

	}	// validateGeoJSON

	/**
	 * Validate date
	 *
	 * This method will validate a string date.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{String}	The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateDate( theRequest, theValue )
	{
		//
		// Init local storage.
		//
		let sep   = null;
		let day   = null;
		let month = null;
		let year  = null;
		let parts = null;
		let seps  = [ '/', '-', '.' ];

		//
		// Check separator.
		//
		for( const item of seps )
		{
			parts = theValue.split( item );
			if( parts.length > 1 )
			{
				sep = item;
				seps = seps.filter( item => item !== sep );
				break;														// =>
			}
		}

		//
		// Handle separator.
		//
		if( sep !== null )
		{
			//
			// Parse by elements.
			//
			switch( parts.length )
			{
				case 3:
					day = parts[ 2 ];
				case 2:
					month = parts[ 1 ];
					year = parts[ 0 ];
					break;

				default:
					throw(
						new MyError(
							'BadValueFormat',
							K.error.BadDateFormat,
							theRequest.application.language,
							theValue
						)
					);															// !@! ==>
			}

			//
			// Check parts.
			//
			for( const item of parts )
			{
				for( const element of seps )
				{
					if( item.includes( element ) )
						throw(
							new MyError(
								'BadValueFormat',
								K.error.BadDateFormat,
								theRequest.application.language,
								theValue
							)
						);														// !@! ==>
				}
			}
		}

		//
		// Handle without separator.
		//
		else
		{
			//
			// Parse by length.
			// Note that regex guarantees
			// these will be the only possible formats.
			//
			switch( theValue.length )
			{
				case 8:
					day = theValue.substr( 6, 2 );
				case 6:
					month = theValue.substr( 4, 2 );
				case 4:
					year = theValue.substr( 0, 4 );
					break;
			}
		}

		//
		// Handle full date.
		//
		if( day !== null )
		{
			const target = parseInt(day).toString();
			const date = new Date( `${year}-${month}-${day}` );
			if( (! Boolean(+date))
			 || (date.getDate().toString() !== target) )
				throw(
					new MyError(
						'BadValue',
						K.error.InvalidDate,
						theRequest.application.language,
						theValue
					)
				);																// !@! ==>
		}

		//
		// Handle partial date.
		//
		else
		{
			//
			// Check month.
			//
			if( month !== null )
			{
				const month_num = parseInt(month);
				if( (month_num < 1)
				 || (month_num > 12) )
					throw(
						new MyError(
							'BadValue',
							K.error.InvalidMonth,
							theRequest.application.language,
							theValue
						)
					);															// !@! ==>
			}
		}

		//
		// Format date.
		//
		let date = null;
		if( day !== null )
			date = new Date( parseInt(year), parseInt(month) - 1, parseInt(day) );
		else if( month !== null )
			date = new Date( parseInt(year), parseInt(month) - 1 );
		else {
			date = new Date( `${year}-01-01` );
			return date.getFullYear().toString();									// ==>
		}

		//
		// Handle parts.
		//
		year = date.getFullYear().toString();
		if( month === null )
			return year;															// ==>
		month = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
		if( day === null )
			return year + month;													// ==>
		day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
		return year + month + day;													// ==>

	}	// validateDate

}	// validateSizeRange.

module.exports = Validation;
