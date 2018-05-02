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
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );
const Schema = require( '../classes/Schema' );


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
	 * @param theValue		{*}			The value to cast.
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
	 * @param theValue		{*}			The value to cast.
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
	 * @param theValue		{*}			The value to cast.
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
	 * @param theValue		{*}			The value to cast.
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
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {String}				The normalised value.
	 */
	static validateUrl( theRequest, theRecord, theValue )
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
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {String}				The normalised value.
	 */
	static validateHex( theRequest, theRecord, theValue )
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
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {Number}				The normalised value.
	 */
	static validateInt( theRequest, theRecord, theValue )
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
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {String}				The normalised value.
	 */
	static validateEmail( theRequest, theRecord, theValue )
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
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{Array}		The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateRange( theRequest, theRecord, theValue )
	{
		return theValue;															// ==>

	}	// validateRange

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
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{Array}		The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateSizeRange( theRequest, theRecord, theValue )
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
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{Object}	The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateGeoJSON( theRequest, theRecord, theValue )
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
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateDate( theRequest, theRecord, theValue )
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

	/**
	 * Validate time stamp
	 *
	 * This method will validate a time stamp.
	 *
	 * The method currently does not do anything, if it did, it would raise an
	 * exception if the value was invalid. Timestamps are handled by Joi.
	 *
	 * The method returns the provided value with eventual modifications.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{Number}	The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateTimeStamp( theRequest, theRecord, theValue )
	{
		return theValue;															// ==>

	}	// validateTimeStamp

	/**
	 * Validate _id reference
	 *
	 * This method will validate an _id reference.
	 *
	 * The method will check if the provided string corresponds to a document and
	 * will raise an exception if not.
	 *
	 * The method returns the provided value.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateIdReference( theRequest, theRecord, theValue )
	{
		//
		// Check reference.
		//
		let doc = null;
		try
		{
			doc = db._document( theValue );
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
					'BadValue',							// Error name.
					K.error.InvalidObjReference,		// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}

		return doc._id;																// ==>

	}	// validateIdReference

	/**
	 * Validate _key reference
	 *
	 * This method will validate a _key reference.
	 *
	 * The method will check if the provided string corresponds to a document key and
	 * will raise an exception if not. If the record contains a list of enumerations,
	 * the method will also check that the term belongs to at least one of them.
	 *
	 * If the record has the instance property, the method will also check if the
	 * referenced document belongs to that instance.
	 *
	 * The method returns the provided value.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * The method will also raise an exception if the collection property of the
	 * provided record is missing.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateKeyReference( theRequest, theRecord, theValue )
	{
		//
		// Check collection.
		//
		if( ! theRecord.hasOwnProperty( Dict.descriptor.kCollection ) )
			throw(
				new MyError(
					'BadParam',							// Error name.
					K.error.NoCollectionInRec,			// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					500									// HTTP error code.
				)
			);																	// !@! ==>

		//
		// Get collection name.
		//
		const collection =
			db._collection( 'terms' )
				.document( theRecord[ Dict.descriptor.kCollection ] )
					[ Dict.descriptor.kLID ];

		//
		// Check enumeration choice.
		//
		if( theRecord.hasOwnProperty( Dict.descriptor.kEnumTerm ) )
		{
			//
			// Make check.
			//
			const result =
				Schema.isEnumerationChoice(
					theRequest,
					theValue,
					theRecord[ Dict.descriptor.kEnumTerm ]
				);

			//
			// Handle error.
			//
			if( ! result )
				throw(
					new MyError(
						'BadValue',							// Error name.
						K.error.InvalidObjReference,		// Message code.
						theRequest.application.language,	// Language.
						theValue,							// Error value.
						404									// HTTP error code.
					)
				);																// !@! ==>
		}

		//
		// Check term.
		//
		else
		{
			try
			{
				//
				// Get document.
				//
				const result = db._collection( collection ).document( theValue );

				//
				// Update reference.
				//
				theValue = result._key;
			}
			catch( error )
			{
				//
				// Handle exceptions.
				//
				if( (! error.isArangoError)
				 || (error.errorNum !== ARANGO_NOT_FOUND) )
					throw( error );												// !@! ==>

				//
				// Handle not found.
				//
				throw(
					new MyError(
						'BadValue',							// Error name.
						K.error.InvalidObjReference,		// Message code.
						theRequest.application.language,	// Language.
						theValue,							// Error value.
						404									// HTTP error code.
					)
				);																// !@! ==>
			}
		}

		return theValue;															// ==>

	}	// validateKeyReference

	/**
	 * Validate gid reference
	 *
	 * This method will validate a gid reference.
	 *
	 * The method will check if the provided string corresponds to a document gid and
	 * will raise an exception if not.
	 *
	 * The method returns the provided value.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * The method will also raise an exception if the collection property of the
	 * provided record is missing.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateGidReference( theRequest, theRecord, theValue )
	{
		//
		// Check collection.
		//
		if( ! theRecord.hasOwnProperty( Dict.descriptor.kCollection ) )
			throw(
				new MyError(
					'BadParam',							// Error name.
					K.error.NoCollectionInRec,			// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					500									// HTTP error code.
				)
			);																	// !@! ==>

		//
		// Get collection name.
		//
		const collection =
			db._collection( 'terms' )
				.document( theRecord[ Dict.descriptor.kCollection ] )
					[ Dict.descriptor.kLID ];

		//
		// Check gid.
		//
		const result =
			db._collection( collection )
				.firstExample( Dict.descriptor.kGID, theValue );

		//
		// Handle not found.
		//
		if( result === null )
			throw(
				new MyError(
					'BadValue',							// Error name.
					K.error.InvalidObjReference,		// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>

		return theValue;															// ==>

	}	// validateGidReference

	/**
	 * Validate instance reference
	 *
	 * This method will validate an instance reference.
	 *
	 * The method will check if the provided reference corresponds to the provided
	 * instance and will raise an exception if not.
	 *
	 * The method returns the provided value.
	 *
	 * Note that the method expects the provided value to be of the correct type, here
	 * we only check if the contents are valid. The method should raise an exception
	 * if the validation fails.
	 *
	 * The method will also raise an exception if the collection or instance properties
	 * of the provided record are missing.
	 *
	 * Note that we expect the reference to be either the _id or the _key.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theRecord		{Object}	The validation structure.
	 * @param theValue		{String}	The value to check.
	 * @returns {Array}					The normalised value.
	 */
	static validateInstanceReference( theRequest, theRecord, theValue )
	{
		//
		// Check collection.
		//
		if( ! theRecord.hasOwnProperty( Dict.descriptor.kCollection ) )
			throw(
				new MyError(
					'BadParam',							// Error name.
					K.error.NoCollectionInRec,			// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					500									// HTTP error code.
				)
			);																	// !@! ==>

		//
		// Check instance.
		//
		if( ! theRecord.hasOwnProperty( Dict.descriptor.kInstance ) )
			throw(
				new MyError(
					'BadParam',							// Error name.
					K.error.NoInstanceRefInRec,			// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					500									// HTTP error code.
				)
			);																	// !@! ==>

		//
		// Get collection name.
		//
		const collection =
			db._collection( 'terms' )
				.document( theRecord[ Dict.descriptor.kCollection ] )
					[ Dict.descriptor.kLID ];

		//
		// Get reference.
		//
		let result = null;
		try
		{
			result = db._collection( collection ).document( theValue );
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
					'BadValue',							// Error name.
					K.error.InvalidObjReference,		// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}

		//
		// Check instance.
		//
		if( (! result.hasOwnProperty( Dict.descriptor.kInstances ))
		 || (! result[ Dict.descriptor.kInstances ].includes( theRecord[ Dict.descriptor.kInstance ] )) )
			throw(
				new MyError(
					'BadValue',												// Error name.
					K.error.NotInstanceOf,									// Message code.
					theRequest.application.language,						// Language.
					[ theValue, theRecord[ Dict.descriptor.kInstance ] ],	// Error value.
					404														// HTTP error code.
				)
			);																	// !@! ==>

		return theValue;															// ==>

	}	// validateInstanceReference

}	// validateSizeRange.

module.exports = Validation;
