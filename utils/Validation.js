'use strict';

//
// Frameworks.
//
const fs = require('fs');
const Joi = require('joi');
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
	 * Validate structure
	 *
	 * This method will validate the provided object and return the normalised object.
	 *
	 * If the validation fails, the method will raise an exception that will contain a
	 * property, path, which contains the path of the offending property. Errors that
	 * are not caught by validation will not have that property.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theObject		{Object}	The object.
	 * @param thePath		{String}	The property path.
	 * @returns {Object}				The eventually normalised object.
	 */
	static validateStructure( theRequest, theObject, thePath = null )
	{
		//
		// Assert structure.
		//
		if( ! K.function.isObject( theObject ) )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadValue',							// Error name.
					K.error.MustBeObject,				// Message code.
					theRequest.application.language,	// Language.
					null,								// Error value.
					400									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		//
		// Traverse object.
		//
		for( const property in theObject )
		{
			//
			// Determine path.
			//
			const path = ( thePath === null )
					   ? property
					   : `${thePath}.${property}`;

			//
			// Validate property.
			//
			theObject[ property ] =
				Validation.validateProperty(
					theRequest,
					property,
					theObject[ property ],
					path
				);
		}

		return theObject;															// ==>

	}	// validateStructure

	/**
	 * Validate property
	 *
	 * This method will validate the value associated to the provided property.
	 *
	 * If the validation fails, the method will raise an exception that will contain a
	 * property, path, which contains the path of the offending property. Errors that
	 * are not caught by validation will not have that property.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theProperty	{String}	The property name.
	 * @param theValue		{*}			The property value.
	 * @param thePath		{String}	The property path.
	 * @returns {*}						The eventually normalised property value.
	 */
	static validateProperty( theRequest, theProperty, theValue, thePath )
	{
		//
		// Handle property.
		//
		let descriptor = null;
		try
		{
			//
			// Resolve property.
			//
			descriptor = db._collection( 'descriptors' ).document( theProperty );
		}
		catch( exception )
		{
			//
			// Handle exceptions.
			//
			if( (! exception.isArangoError)
			 || (exception.errorNum !== ARANGO_NOT_FOUND) )
				throw( exception );												// !@! ==>

			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadDescriptor',					// Error name.
					K.error.DescriptorNotFound,			// Message code.
					theRequest.application.language,	// Language.
					theProperty,						// Error value.
					404									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		//
		// Init local storage.
		//
		const type = descriptor[ Dict.descriptor.kType ];
		const base_type = descriptor[ Dict.descriptor.kValidation ][ Dict.descriptor.kType ];

		//
		// Handle list of containers.
		// MILKO - this might not work: need to test thoroughly.
		//
		if( ( (type === Dict.term.kTypeDataStruct)		// Descriptor type is structure
		   || (type === Dict.term.kTypeDataObject) )	// or object,
		 && (base_type === Dict.term.kTypeDataList)		// and base type is list,
		 && Array.isArray( theValue ) )					// and value is array (skip
		{												// when recursing).
			//
			// Iterate array elements.
			//
			for( let i = 0; i < theValue.length; i++ )
			{
				switch( type )
				{
					case Dict.term.kTypeDataStruct:
						theValue[ i ] =
							Validation.validateStructure(
								theRequest,
								theValue[ i ],
								thePath
							);
						break;

					case Dict.term.kTypeDataObject:
						theValue[ i ] =
							Validation.validateObject(
								theRequest,
								theValidation,
								theValue[ i ],
								thePath
							);
						break;
				}
			}

		}	// Value is array.

		//
		// Handle scalars.
		//
		else
			theValue =
				Validation.validateValue(
					theRequest,
					descriptor[ Dict.descriptor.kValidation ],
					theValue,
					thePath
				);

		return theValue;															// ==>

	}	// validateProperty

	/**
	 * Validate value
	 *
	 * This method will validate the provided value using the provided validation
	 * structure, the method will return the value, eventually normalised, if the test
	 * passes, or raise an exception if the test doesn't pass.
	 *
	 * @param theRequest	{Object}	The current resuest.
	 * @param theValidation	{Object}	The validation structure.
	 * @param theValue		{*}			The value to test.
	 * @param thePath		{String}	The property path.
	 * @returns {*}						The eventually normalised property value.
	 */
	static validateValue( theRequest, theValidation, theValue, thePath )
	{
		//
		// Parse by type.
		//
		switch( theValidation[ Dict.descriptor.kType ] )
		{
			case Dict.term.kTypeDataAny:
				break;

			case Dict.term.kTypeDataBool:
			case Dict.term.kTypeDataText:
			case Dict.term.kTypeDataNumeric:
			case Dict.term.kTypeDataList:
				theValue =
					Validation.validateScalar(
						theRequest,
						theValidation,
						theValue,
						thePath
					);
				break;

			case Dict.term.kTypeDataStruct:
				theValue =
					Validation.validateStructure(
						theRequest,
						theValue,
						thePath
					);
				break;

			case Dict.term.kTypeDataObject:
				theValue =
					Validation.validateObject(
						theRequest,
						theValidation,
						theValue,
						thePath
					);
				break;

			default:
				throw(
					new MyError(
						'Unimplemented',						// Error name.
						K.error.InvalidDataType,				// Message code.
						theRequest.application.language,		// Language.
						theValidation[ Dict.descriptor.kType ],	// Error value.
						500										// HTTP error code.
					)
				);													// !@! ==>
		}

		return theValue;															// ==>

	}	// validateValue

	/**
	 * Validate scalar
	 *
	 * This method will validate the provided scalar value using the provided validation
	 * structure, the method will return the value, eventually normalised, if the test
	 * passes, or raise an exception if the test doesn't pass.
	 *
	 * @param theRequest	{Object}	The current resuest.
	 * @param theValidation	{Object}	The validation structure.
	 * @param theValue		{*}			The value to test.
	 * @param thePath		{String}	The property path.
	 * @returns {*}						The eventually normalised property value.
	 */
	static validateScalar( theRequest, theValidation, theValue, thePath )
	{
		//
		// Cast value.
		//
		theValue =
			Validation.validateCastValue(
				theRequest,
				theValidation,
				theValue,
				thePath
			);

		//
		// Joi validation.
		//
		theValue =
			Validation.validateJoiValue(
				theRequest,
				theValidation,
				theValue,
				thePath
			);

		//
		// Custom validation.
		//
		theValue =
			Validation.validateCustomValue(
				theRequest,
				theValidation,
				theValue,
				thePath
			);

		return theValue;															// ==>

	}	// validateScalar

	/**
	 * Validate object
	 *
	 * This method will validate the provided object value using the provided validation
	 * structure, it will use the key and value parts of the validation structure to
	 * check all the object elements. The method will return the value, eventually
	 * normalised, if the test passes, or raise an exception if the test doesn't pass.
	 *
	 * @param theRequest	{Object}	The current resuest.
	 * @param theValidation	{Object}	The validation structure.
	 * @param theValue		{Object}	The value to test.
	 * @param thePath		{String}	The property path.
	 * @returns {*}						The eventually normalised property value.
	 */
	static validateObject( theRequest, theValidation, theValue, thePath )
	{
		//
		// Assert structure.
		//
		if( ! K.function.isObject( theValue ) )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadValue',							// Error name.
					K.error.MustBeObject,				// Message code.
					theRequest.application.language,	// Language.
					null,								// Error value.
					400									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		//
		// Joi validation.
		//
		theValue =
			Validation.validateJoiValue
			(
				theRequest,
				theValidation,
				theValue,
				thePath
			);

		//
		// Iterate data members.
		//
		for( let property in theValue )
		{
			//
			// Set current path.
			//
			const path = thePath + '.' + property;

			//
			// Handle key.
			//
			if( theValidation.hasOwnProperty( Dict.descriptor.kTypeKey ) )
					Validation.validateScalar(
						theRequest,
						theValidation[ Dict.descriptor.kTypeKey ],
						property,
						path
					);

			//
			// Handle value.
			//
			if( theValidation.hasOwnProperty( Dict.descriptor.kTypeValue ) )
				theValue[ property ] =
					Validation.validateValue(
						theRequest,
						theValidation[ Dict.descriptor.kTypeValue ],
						theValue[ property ],
						path
					);
		}

		return theValue;															// ==>

	}	// validateObject

	/**
	 * Joi validation
	 *
	 * This method will perform the Joi validation by evaluating the Joi chain of
	 * commands and will return the eventually normalised value, or raise an exception
	 * if the validation fails.
	 *
	 * Note that this method may recurse when container data types are encountered.
	 *
	 * @param theRequest	{Object}	The current resuest.
	 * @param theValidation	{Object}	The validation structure.
	 * @param theValue		{*}			The value to test.
	 * @param thePath		{String}	The property path.
	 * @returns {*}						The normalised value.
	 */
	static validateJoiValue( theRequest, theValidation, theValue, thePath )
	{
		//
		// Check Joi command.
		//
		if( theValidation.hasOwnProperty( Dict.descriptor.kJoi ) )
		{
			//
			// Instantiate Joi schema.
			//
			const schema = eval( theValidation[ Dict.descriptor.kJoi ] );

			//
			// Validate.
			//
			const result = Joi.validate( theValue, schema );

			//
			// Handle errors.
			//
			if( result.error !== null )
			{
				//
				// Compile error message.
				//
				const messages = [];
				for( const details of result.error.details )
					messages.push( details.message );
				const message = messages.join( '. ' );

				//
				// Compile error.
				//
				const error =
					new MyError(
						result.error.name,					// Error name.
						message,							// Message.
						theRequest.application.language,	// Language.
						null,								// Error value.
						400									// HTTP error code.
					);

				//
				// Add path.
				//
				error.path = thePath;

				throw( error );													// !@! ==>
			}
			else
				theValue = result.value;
		}

		return theValue;															// ==>

	}	// validateJoiValue

	/**
	 * Cast value
	 *
	 * This method will cast the provided value according to the contents of the
	 * validation record, if the record contains a cast function term, the method will
	 * execute it and return the casted value; if the cast cannot be performed, the
	 * method will raise an exception.
	 *
	 * The method handles lists internally, it will call the cast function with each
	 * array element.
	 *
	 * Note that this method may recurse when container data types are encountered.
	 *
	 * @param theRequest	{Object}	The current resuest.
	 * @param theValidation	{Object}	The validation structure.
	 * @param theValue		{*}			The value to test.
	 * @param thePath		{String}	The property path.
	 * @returns {*}						The normalised value.
	 */
	static validateCastValue( theRequest, theValidation, theValue, thePath )
	{
		//
		// Check cast function term.
		//
		if( theValidation.hasOwnProperty( Dict.descriptor.kTypeCast ) )
		{
			//
			// Iterate cast functions.
			//
			for( const name of theValidation[ Dict.descriptor.kTypeCast ] )
			{
				//
				// Locate term.
				//
				const term =
					db._collection( 'terms' )
						.document( name )
						[ Dict.descriptor.kLID ];

				//
				// Locate cast function.
				//
				const cast = Validation.functionCast( theRequest, term );

				//
				// Parse by base type.
				//
				switch( theValidation[ Dict.descriptor.kType ] )
				{
					case Dict.term.kTypeDataAny:
						break;

					case Dict.term.kTypeDataBool:
					case Dict.term.kTypeDataText:
					case Dict.term.kTypeDataNumeric:
						//
						// Assert scalar.
						//
						if( Array.isArray( theValue )
						 || K.function.isObject( theValue ) )
						{
							//
							// Compile error.
							//
							const error =
								new MyError(
									'BadValueFormat',					// Error name.
									K.error.MustBeScalar,				// Message code.
									theRequest.application.language,	// Language.
									theValue,							// Error value.
									400									// HTTP error code.
								);

							//
							// Add path.
							//
							error.path = thePath;

							throw( error );										// !@! ==>
						}

						//
						// Cast scalar.
						//
						theValue = cast( theRequest, theValue, thePath );

						break;

					case Dict.term.kTypeDataList:
						//
						// Assert array.
						//
						if( ! Array.isArray( theValue ) )
						{
							//
							// Compile error.
							//
							const error =
								new MyError(
									'BadValue',							// Error name.
									K.error.MustBeArray,				// Message code.
									theRequest.application.language,	// Language.
									null,								// Error value.
									400									// HTTP error code.
								);

							//
							// Add path.
							//
							error.path = thePath;

							throw( error );										// !@! ==>
						}

						//
						// Cast array elements.
						//
						theValue = theValue.map( x => cast( theRequest, x, thePath ) );

						break;

					case Dict.term.kTypeDataStruct:
						throw( "SHOULDN'T GET HERE!" );							// !@! ==>

					case Dict.term.kTypeDataObject:
						throw( "SHOULDN'T GET HERE!" );							// !@! ==>

					default:
						//
						// Compile error.
						//
						const error =
							new MyError(
								'Unimplemented',						// Error name.
								K.error.InvalidDataType,				// Message code.
								theRequest.application.language,		// Language.
								theValidation[ Dict.descriptor.kType ],	// Error value.
								500										// HTTP error.
							);

						//
						// Add path.
						//
						error.path = thePath;

						throw( error );											// !@! ==>
				}

			}	// Iterating cast functions.

		}	// Has cast function reference.

		return theValue;															// ==>

	}	// validateCastValue

	/**
	 * Custom validation
	 *
	 * This method will perform the custom validation by calling all eventual custom
	 * validation functions in the validation record and return the eventually
	 * normalised value; if the validation fails an exception will be raised.
	 *
	 * Note that this method may recurse when container data types are encountered.
	 *
	 * @param theRequest	{Object}	The current resuest.
	 * @param theValidation	{Object}	The validation structure.
	 * @param theValue		{*}			The value to test.
	 * @param thePath		{String}	The property path.
	 * @returns {*}						The normalised value.
	 */
	static validateCustomValue( theRequest, theValidation, theValue, thePath )
	{
		//
		// Check custom function term.
		//
		if( theValidation.hasOwnProperty( Dict.descriptor.kTypeCustom ) )
		{
			//
			// Iterate custom functions.
			//
			for( const name of theValidation[ Dict.descriptor.kTypeCustom ] )
			{
				//
				// Locate term.
				//
				const term =
					db._collection( 'terms' )
						.document( name )
						[ Dict.descriptor.kLID ];

				//
				// Locate cast function.
				//
				const custom = Validation.functionCustom( theRequest, term );

				//
				// Parse by base type.
				//
				switch( theValidation[ Dict.descriptor.kType ] )
				{
					case Dict.term.kTypeDataAny:
						break;

					case Dict.term.kTypeDataBool:
					case Dict.term.kTypeDataText:
					case Dict.term.kTypeDataNumeric:
						//
						// Validate scalar.
						//
						theValue = custom( theRequest, theValidation, theValue, thePath );

						break;

					case Dict.term.kTypeDataList:
						//
						// Assert array.
						//
						if( ! Array.isArray( theValue ) )
						{
							//
							// Compile error.
							//
							const error =
								new MyError(
									'BadValue',							// Error name.
									K.error.MustBeArray,				// Message code.
									theRequest.application.language,	// Language.
									null,								// Error value.
									400									// HTTP error code.
								);

							//
							// Add path.
							//
							error.path = thePath;

							throw( error );										// !@! ==>
						}

						//
						// Validate array elements.
						//
						theValue = theValue.map( x => custom( theRequest, theValidation, x, thePath ) );

						break;

					case Dict.term.kTypeDataStruct:
						throw( "SHOULDN'T GET HERE!" );							// !@! ==>

					case Dict.term.kTypeDataObject:
						throw( "SHOULDN'T GET HERE!" );							// !@! ==>

					default:
						//
						// Compile error.
						//
						const error =
							new MyError(
								'Unimplemented',						// Error name.
								K.error.InvalidDataType,				// Message code.
								theRequest.application.language,		// Language.
								theValidation[ Dict.descriptor.kType ],	// Error value.
								500										// HTTP error.
							);

						//
						// Add path.
						//
						error.path = thePath;

						throw( error );											// !@! ==>
				}

			}	// Iterating custom functions.

		}	// Has custom function reference.

		return theValue;															// ==>

	}	// validateCustomValue

	/**
	 * Return cast function
	 *
	 * This method will return the address of the static method corresponding to the
	 * provided method name.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theFunction	{String}	Method name.
	 * @returns {Function}				Method address.
	 */
	static functionCast( theRequest, theFunction )
	{
		//
		// Parse by method name.
		//
		switch( theFunction )
		{
			case 'castString':		return Validation.castString;					// ==>
			case 'castNumber':		return Validation.castNumber;					// ==>
			case 'castBoolean':		return Validation.castBoolean;					// ==>
			case 'castHexadecimal':	return Validation.castHexadecimal;				// ==>

			default:
				throw(
					new MyError(
						'BadParam',
						K.error.UnknownCastFunc,
						theRequest.application.language,
						theFunction
					)
				);																// !@! ==>
		}

	}	// functionCast

	/**
	 * Return custom function
	 *
	 * This method will return the address of the static method corresponding to the
	 * provided method name.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theFunction	{String}	Method name.
	 * @returns {Function}				Method address.
	 */
	static functionCustom( theRequest, theFunction )
	{
		//
		// Parse by method name.
		//
		switch( theFunction )
		{
			case 'customUrl':			return Validation.customUrl;				// ==>
			case 'customHex':			return Validation.customHex;				// ==>
			case 'customInt':			return Validation.customInt;				// ==>
			case 'customEmail':			return Validation.customEmail;				// ==>
			case 'customRange':			return Validation.customRange;				// ==>
			case 'customSizeRange':		return Validation.customSizeRange;			// ==>
			case 'customGeoJSON':		return Validation.customGeoJSON;			// ==>
			case 'customDate':			return Validation.customDate;				// ==>
			case 'customTimeStamp':		return Validation.customTimeStamp;			// ==>
			case 'customIdReference':	return Validation.customIdReference;		// ==>
			case 'customKeyReference':	return Validation.customKeyReference;		// ==>
			case 'customGidReference':	return Validation.customGidReference;		// ==>
			case 'customInstance':		return Validation.customInstance;			// ==>

			default:
				throw(
					new MyError(
						'BadParam',
						K.error.UnknownCustomFunc,
						theRequest.application.language,
						theFunction
					)
				);																// !@! ==>
		}

	}	// functionCustom

	/**
	 * Cast to string
	 *
	 * This method will cast the provided value to string.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{*}			The value to cast.
	 * @param thePath		{String}	The property path.
	 * @returns {String}				The value cast to a string.
	 */
	static castString( theRequest, theValue, thePath )
	{
		return theValue.toString();													// ==>

	}	// castString

	/**
	 * Cast to number
	 *
	 * This method will cast the provided value to a number, if the cast failes, the
	 * method will raise an exception.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{*}			The value to cast.
	 * @param thePath		{String}	The property path.
	 * @returns {Number}|{undefined}	The value cast to a number.
	 */
	static castNumber( theRequest, theValue, thePath )
	{
		//
		// Cast.
		//
		const value = Number( theValue );

		//
		// Assert correct.
		//
		if( isNaN( value ) )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadValue',							// Error name.
					K.error.NotNumber,					// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					400									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		return value;																// ==>

	}	// castNumber

	/**
	 * Cast to boolean
	 *
	 * This method will cast the provided value to a boolean.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theValue		{*}			The value to cast.
	 * @param thePath		{String}	The property path.
	 * @returns {Boolean}				The value cast to a boolean.
	 */
	static castBoolean( theRequest, theValue, thePath )
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
	 * @param thePath		{String}	The property path.
	 * @returns {String}				The value cast to a hexadecimal.
	 */
	static castHexadecimal( theRequest, theValue, thePath )
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
	 * This method will validateValue an URL.
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
	 * @param thePath		{String}	The property path.
	 * @returns {String}				The normalised value.
	 */
	static customUrl( theRequest, theRecord, theValue, thePath )
	{
		return theValue;															// ==>

	}	// customUrl

	/**
	 * Validate HEX
	 *
	 * This method will validateValue a hexadecimal string.
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
	 * @param thePath		{String}	The property path.
	 * @returns {String}				The normalised value.
	 */
	static customHex( theRequest, theRecord, theValue, thePath )
	{
		return theValue;															// ==>

	}	// customHex

	/**
	 * Validate integer
	 *
	 * This method will validateValue an integer value.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Number}				The normalised value.
	 */
	static customInt( theRequest, theRecord, theValue, thePath )
	{
		return theValue;															// ==>

	}	// customInt

	/**
	 * Validate e-mail
	 *
	 * This method will validateValue an e-mail address.
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
	 * @param thePath		{String}	The property path.
	 * @returns {String}				The normalised value.
	 */
	static customEmail( theRequest, theRecord, theValue, thePath )
	{
		return theValue;															// ==>

	}	// customEmail

	/**
	 * Validate range
	 *
	 * This method will validateValue a range.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customRange( theRequest, theRecord, theValue, thePath )
	{
		return theValue;															// ==>

	}	// customRange

	/**
	 * Validate size range
	 *
	 * This method will validateValue a size range.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customSizeRange( theRequest, theRecord, theValue, thePath )
	{
		return theValue;															// ==>

	}	// ValidateRange

	/**
	 * Validate GeoJSON
	 *
	 * This method will validateValue a GeoJSON structure.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customGeoJSON( theRequest, theRecord, theValue, thePath )
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
				//
				// Join error messages.
				//
				const errors = error.join( '. ' );

				//
				// Compile error.
				//
				const error =
					new MyError(
						'BadValue',							// Error name.
						errors,								// Message.
						theRequest.application.language,	// Language.
						null,							// Error value.
						400									// HTTP error code.
					);

				//
				// Add path.
				//
				error.path = thePath;

				throw( error );														// !@! ==>
			}
		});

		return theValue;															// ==>

	}	// customGeoJSON

	/**
	 * Validate date
	 *
	 * This method will validateValue a string date.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customDate( theRequest, theRecord, theValue, thePath )
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
					//
					// Compile error.
					//
					const error =
						new MyError(
							'BadValueFormat',					// Error name.
							K.error.BadDateFormat,				// Message code.
							theRequest.application.language,	// Language.
							theValue,							// Error value.
							400									// HTTP error code.
						);

					//
					// Add path.
					//
					error.path = thePath;

					throw( error );												// !@! ==>
			}

			//
			// Check parts.
			//
			for( const item of parts )
			{
				for( const element of seps )
				{
					if( item.includes( element ) )
					{
						//
						// Compile error.
						//
						const error =
							new MyError(
								'BadValueFormat',					// Error name.
								K.error.BadDateFormat,				// Message code.
								theRequest.application.language,	// Language.
								theValue,							// Error value.
								400									// HTTP error code.
							);

						//
						// Add path.
						//
						error.path = thePath;

						throw( error );											// !@! ==>
					}
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
			{
				//
				// Compile error.
				//
				const error =
					new MyError(
						'BadValueFormat',					// Error name.
						K.error.InvalidDate,				// Message code.
						theRequest.application.language,	// Language.
						theValue,							// Error value.
						400									// HTTP error code.
					);

				//
				// Add path.
				//
				error.path = thePath;

				throw( error );													// !@! ==>
			}
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
				{
					//
					// Compile error.
					//
					const error =
						new MyError(
							'BadValueFormat',					// Error name.
							K.error.InvalidMonth,				// Message code.
							theRequest.application.language,	// Language.
							theValue,							// Error value.
							400									// HTTP error code.
						);

					//
					// Add path.
					//
					error.path = thePath;

					throw( error );													// !@! ==>
				}
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

	}	// customDate

	/**
	 * Validate time stamp
	 *
	 * This method will validateValue a time stamp.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customTimeStamp( theRequest, theRecord, theValue, thePath )
	{
		return theValue;															// ==>

	}	// customTimeStamp

	/**
	 * Validate _id reference
	 *
	 * This method will validateValue an _id reference.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customIdReference( theRequest, theRecord, theValue, thePath )
	{
		//
		// Check reference.
		//
		let result = false;
		try
		{
			result = db._exists( theValue );
		}
		catch( exception )
		{
			//
			// Handle exceptions.
			//
			if( (! exception.isArangoError)
			 || (exception.errorNum !== ARANGO_NOT_FOUND) )
				throw( exception );												// !@! ==>

			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadValue',							// Error name.
					K.error.InvalidObjReference,		// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					404									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		//
		// Handle not found.
		//
		if( result === false )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadValue',							// Error name.
					K.error.InvalidObjReference,		// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					404									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		return theValue;															// ==>

	}	// customIdReference

	/**
	 * Validate _key reference
	 *
	 * This method will validateValue a _key reference.
	 *
	 * The method will check if the provided string corresponds to a document key and
	 * will raise an exception if not. If the record contains a list of enumerations,
	 * the method will also check that the term belongs to at least one of them. In
	 * this case, the method will also check if the term endorses another term, which
	 * will replace the original value.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customKeyReference( theRequest, theRecord, theValue, thePath )
	{
		//
		// Check collection.
		//
		if( ! theRecord.hasOwnProperty( Dict.descriptor.kCollection ) )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadParam',							// Error name.
					K.error.NoCollectionInRec,			// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					500									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

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
			let result = false;
			try
			{
				//
				// Make check.
				//
				result =
					Schema.isEnumerationChoice(
						theRequest,
						theValue,
						theRecord[ Dict.descriptor.kEnumTerm ]
					);
			}
			catch( error )
			{
				//
				// Add path.
				//
				error.path = thePath;

				throw( error );													// !@! ==>
			}

			//
			// Handle error.
			//
			if( ! result )
			{
				//
				// Compile error.
				//
				const error =
					new MyError(
						'BadValue',							// Error name.
						K.error.NotInEnumsList,				// Message code.
						theRequest.application.language,	// Language.
						theValue,							// Error value.
						404									// HTTP error code.
					);

				//
				// Add path.
				//
				error.path = thePath;

				throw( error );													// !@! ==>
			}

			//
			// Handle endorsed.
			//
			const example = { _from : collection + '/' + theValue };
			example[ Dict.descriptor.kPredicate ] = "terms/" + Dict.term.kPredicateEndorse;
			const edge = db._collection( 'schemas' ).firstExample( example );
			if( edge !== null )
			{
				const endorsed = db._document( edge._to );
				theValue = endorsed._key;
			}
		}

		//
		// Check term.
		//
		else
		{
			let result = false;
			try
			{
				//
				// Get document.
				//
				result = db._collection( collection ).exists( theValue );

				//
				// Update reference.
				//
				if( result !== false )
					theValue = result._key;
			}
			catch( exception )
			{
				//
				// Handle exceptions.
				//
				if( (! exception.isArangoError)
				 || (exception.errorNum !== ARANGO_NOT_FOUND) )
					throw( exception );											// !@! ==>

				//
				// Compile error.
				//
				const error =
					new MyError(
						'BadValue',							// Error name.
						K.error.InvalidObjReference,		// Message code.
						theRequest.application.language,	// Language.
						theValue,							// Error value.
						404									// HTTP error code.
					);

				//
				// Add path.
				//
				error.path = thePath;

				throw( error );													// !@! ==>
			}

			//
			// Handle error.
			//
			if( result === false )
			{
				//
				// Compile error.
				//
				const error =
					new MyError(
						'BadValue',							// Error name.
						K.error.InvalidObjReference,		// Message code.
						theRequest.application.language,	// Language.
						theValue,							// Error value.
						404									// HTTP error code.
					);

				//
				// Add path.
				//
				error.path = thePath;

				throw( error );													// !@! ==>
			}
		}

		return theValue;															// ==>

	}	// customKeyReference

	/**
	 * Validate gid reference
	 *
	 * This method will validateValue a gid reference.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customGidReference( theRequest, theRecord, theValue, thePath )
	{
		//
		// Check collection.
		//
		if( ! theRecord.hasOwnProperty( Dict.descriptor.kCollection ) )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadParam',							// Error name.
					K.error.NoCollectionInRec,			// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					500									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

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
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadValue',							// Error name.
					K.error.InvalidObjReference,		// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					404									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		return theValue;															// ==>

	}	// customGidReference

	/**
	 * Validate instance reference
	 *
	 * This method will validateValue an instance reference.
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
	 * @param thePath		{String}	The property path.
	 * @returns {Array}					The normalised value.
	 */
	static customInstance( theRequest, theRecord, theValue, thePath )
	{
		//
		// Check collection.
		//
		if( ! theRecord.hasOwnProperty( Dict.descriptor.kCollection ) )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadParam',							// Error name.
					K.error.NoCollectionInRec,			// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					500									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		//
		// Check instance.
		//
		if( ! theRecord.hasOwnProperty( Dict.descriptor.kInstance ) )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadParam',							// Error name.
					K.error.NoInstanceRefInRec,			// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					500									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

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
		catch( exception )
		{
			//
			// Handle exceptions.
			//
			if( (! exception.isArangoError)
			 || (exception.errorNum !== ARANGO_NOT_FOUND) )
				throw( exception );												// !@! ==>

			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadValue',							// Error name.
					K.error.InvalidObjReference,		// Message code.
					theRequest.application.language,	// Language.
					theValue,							// Error value.
					404									// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		//
		// Check instance.
		//
		if( (! result.hasOwnProperty( Dict.descriptor.kInstances ))
		 || (! result[ Dict.descriptor.kInstances ].includes( theRecord[ Dict.descriptor.kInstance ] )) )
		{
			//
			// Compile error.
			//
			const error =
				new MyError(
					'BadValue',												// Error name.
					K.error.NotInstanceOf,									// Message code.
					theRequest.application.language,						// Language.
					[ theValue, theRecord[ Dict.descriptor.kInstance ] ],	// Error value.
					404														// HTTP error code.
				);

			//
			// Add path.
			//
			error.path = thePath;

			throw( error );														// !@! ==>
		}

		return theValue;															// ==>

	}	// customInstance

}	// Validation.

module.exports = Validation;
