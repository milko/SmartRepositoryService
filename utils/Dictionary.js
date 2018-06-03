'use strict';

//
// Frameworks.
//
const fs = require('fs');
const _ = require('lodash');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;

//
// Application.
//
const K = require( './Constants' );					// Application constants.
const MyError = require( './MyError' );				// Custom errors.
const Dict = require( '../dictionary/Dict' );		// Data dictionary.
const Schema = require( './Schema' );		// Schema class.

/**
 * Data dictionary class
 *
 * This class implements data dictionary helpers.
 */
class Dictionary
{
	/**
	 * Restrict to field(s)
	 *
	 * This method will restrict the provided document to the provided field names, it
	 * expects the document to process and the fields to be selected.
	 *
	 * If you provide a scalar string, this will be interpreted as a descriptor _key, the
	 * method will return the provided document's value corresponding to that field,
	 * or null, if the field doesn't exist in the document.
	 *
	 * If you provide an array, the document will be stripped of all properties that
	 * do not correspond to the provided list of field references.
	 *
	 * If you provide null, the document will be returned unchanged.
	 *
	 * Note that the processing is done on the object, so clone it if you want changes
	 * to be local. Also, the fields may only reference top level properties, nested
	 * documents cannot be handled.
	 *
	 * @param theDocument	{Object}				The document to process.
	 * @param theFields		{String}|{Array}|{null}	The fields to select.
	 * @returns {*}			The processed document or the selected field's value.
	 */
	static restrictFields( theDocument, theFields )
	{
		//
		// Handle no changes.
		//
		if( theFields === null )
			return theDocument;														// ==>

		//
		// Handle single field.
		//
		if( ! Array.isArray( theFields ) )
			return ( theDocument.hasOwnProperty( theFields ) )
				 ? theDocument[ theFields ]
				 : null;															// ==>

		return _.pick( theDocument, theFields );									// ==>

	}	// restrictFields

	/**
	 * Restrict to language
	 *
	 * This method will reduce label, definition, description, notes and example of the
	 * provided document to the provided language: instead of an object indexed by
	 * language code, these properties will be the string corresponding to the
	 * provided language; if the language is not matched, the properties will not be
	 * touched.
	 *
	 * @param theDocument	{Object}	The document to process.
	 * @param theLanguage	{String}	The desired language.
	 */
	static restrictLanguage( theDocument, theLanguage )
	{
		//
		// Iterate properties.
		//
		for( const property of Dictionary.listLanguageFields )
		{
			//
			// Handle property.
			//
			if( theDocument.hasOwnProperty( property )
			 && theDocument[ property ].hasOwnProperty( theLanguage ) )
				theDocument[ property ] = theDocument[ property ][ theLanguage ];
		}

	}	// restrictLanguage

	/**
	 * Restrict edge to language
	 *
	 * This method will reduce label, definition, description, notes and example of the
	 * provided edge to the provided language, this method applies the
	 * restrictLanguage() methpd to the edge top fields and to the eventual edge
	 * modifier fields.
	 *
	 * @param theDocument	{Object}	The edge to process.
	 * @param theLanguage	{String}	The desired language.
	 */
	static restrictEdgeLanguage( theDocument, theLanguage )
	{
		//
		// Process top level properties.
		//
		Dictionary.restrictLanguage( theDocument, theLanguage );

		//
		// Process modifier properties.
		//
		if( theDocument.hasOwnProperty( Dict.descriptor.kModifiers ) )
			Dictionary.restrictLanguage(
				theDocument[ Dict.descriptor.kModifiers ],
				theLanguage
			);

	}	// restrictEdgeLanguage

	/**
	 * Text field validation record compiler
	 *
	 * This method will populate the provided validation record with the validation
	 * fields of the provided data type term.
	 *
	 * It will handle:
	 *
	 * 	- kLength:	Set length or normalise two lengths.
	 * 	- kRegex:	Add regular expression to record.
	 *
	 * The following custom fields will be set:
	 *
	 * 	- isRef:	Set to true if the type is a reference.
	 * 	- isUrl:	Set to true if the type is an URL.
	 * 	- isHex:	Set to true if the type is hexadecimal.
	 * 	- isEmail:	Set to true if the type is an e-mail.
	 *
	 * @param theRecord	{Object}	The validation record.
	 * @param theType	{Object}	The data type.
	 */
	static compileTextValidationRecord( theRecord, theType )
	{
		//
		// Length.
		//
		let field = Dict.descriptor.kLength;
		if( theType.hasOwnProperty( field ) )
			theRecord[ field ] =
				Dictionary.combineRanges(
					theType[ field ],
					theRecord[ field ]
				);

		//
		// Regex.
		//
		field = Dict.descriptor.kRegex;
		if( theType.hasOwnProperty( field ) )
		{
			if( ! theRecord.hasOwnProperty( field ) )
				theRecord[ field ] = [];

			theRecord[ field ]
				.push( theType[ field ] );
		}

		//
		// Reference.
		//
		if( Dictionary.listBaseReferenceDataTypes.includes( theType._key ) )
			theRecord.isRef = true;

		//
		// HEX.
		//
		if( theType._key === Dict.term.kTypeValueUrl )
			theRecord.isUrl = true;

		//
		// URL.
		//
		if( theType._key === Dict.term.kTypeValueHex )
			theRecord.isHex = true;

		//
		// E-mail.
		//
		if( theType._key === Dict.term.kTypeValueEmail )
			theRecord.isEmail = true;

	}	// compileTextValidationRecord

	/**
	 * Numeric field validation record compiler
	 *
	 * This method will populate the provided validation record with the validation
	 * fields of the provided data type term.
	 *
	 * It will handle:
	 *
	 * 	- kRange:		Set range or normalise two ranges.
	 * 	- kDecimals:	Set decimals.
	 *
	 * The following custom fields will be set:
	 *
	 * 	- isInt:		Set to true if the type is integer.
	 * 	- isStamp:		Set to true if the type is a time-stamp.
	 *
	 * @param theRecord	{Object}	The validation record.
	 * @param theType	{Object}	The data type.
	 */
	static compileNumericValidationRecord( theRecord, theType )
	{
		//
		// Range.
		//
		let field = Dict.descriptor.kRange;
		if( theType.hasOwnProperty( field ) )
			theRecord[ field ] =
				Dictionary.combineRanges(
					theType[ field ],
					theRecord[ field ]
				);

		//
		// Decimals.
		//
		field = Dict.descriptor.kDecimals;
		if( theType.hasOwnProperty( field ) )
		{
			if( (! theRecord.hasOwnProperty( field ))
				|| (theType[ field ] < theRecord[ field ]) )
				theRecord[ field ] = theType[ field ];
		}

		//
		// Integer.
		//
		if( theType._key === Dict.term.kTypeValueInt )
			theRecord.isInt = true;

		//
		// Timestamp.
		//
		if( theType._key === Dict.term.kTypeValueStamp )
			theRecord.isStamp = true;

	}	// compileNumericValidationRecord

	/**
	 * List field validation record compiler
	 *
	 * This method will populate the provided validation record with the validation
	 * fields of the provided data type term.
	 *
	 * It will handle:
	 *
	 * 	- kSize:		Set size or normalise two sizes.
	 *
	 * The following custom fields will be set:
	 *
	 * 	- isSet:		Set to true if the type is set.
	 *
	 * @param theRecord	{Object}	The validation record.
	 * @param theType	{Object}	The data type.
	 */
	static compileListValidationRecord( theRecord, theType )
	{
		//
		// Range.
		//
		let field = Dict.descriptor.kSize;
		if( theType.hasOwnProperty( field ) )
			theRecord[ field ] =
				Dictionary.combineRanges(
					theType[ field ],
					theRecord[ field ]
				);

		//
		// Set.
		//
		if( theType._key === Dict.term.kTypeValueSet )
			theRecord.isSet = true;

	}	// compileListValidationRecord

	/**
	 * Reference field validation record compiler
	 *
	 * This method will populate the provided validation record with the validation
	 * fields of the provided data type term.
	 *
	 * It will handle:
	 *
	 * 	- kCollection:	Set collection (will be replaced).
	 * 	- kInstance:	Set instance (will be replaced).
	 * 	- kEnumTerm:	Terms enumerations (will be replaced).
	 * 	- kEnumField:	Field enumerations (will be replaced).
	 *
	 * @param theRecord	{Object}	The validation record.
	 * @param theType	{Object}	The data type.
	 */
	static compileReferenceValidationRecord( theRecord, theType )
	{
		//
		// Iterate fields.
		//
		for( const field of Dictionary.listReferenceValidationFields )
		{
			if( theType.hasOwnProperty( field ) )
				theRecord[ field ] = theType[ field ];
		}

	}	// compileReferenceValidationRecord
	
	/**
	 * Compile global identifier
	 *
	 * This method will return the global identifier according to the provided record
	 * contents.
	 *
	 * The global identifier is composed by combining the namespace identifier global
	 * identifier andf the local identifier separated by a colon. If the namespace is
	 * missing and the second parameter is true, the method will raise an exception,
	 * if false, the method will return null.
	 *
	 * @param theRecord	{Object}	The object to identify.
	 * @param doAssert	{Boolean}	If true, raise an exception if unable to identify.
	 * @returns {String}|{null}		The global identifier, or null.
	 */
	static compileGlobalIdentifier( theRecord, doAssert = true )
	{
		//
		// Init local storage.
		//
		let nid = null;
		let lid = null;
		
		//
		// Handle namespace.
		//
		if( theRecord.hasOwnProperty( Dict.descriptor.kNID ) )
		{
			const namespace = db._document( theRecord[ Dict.descriptor.kNID ] );
			if( namespace.hasOwnProperty( Dict.descriptor.kGID ) )
				nid = namespace[ Dict.descriptor.kGID ];
			else
			{
				if( doAssert )
					throw(
						new MyError(
							'ConstraintViolated',				// Error name.
							K.error.NoGlobalIdentifier,			// Message code.
							this._request.application.language,	// Language.
							namespace._id,						// Namespace ID.
							409									// HTTP error code.
						)
					);															// !@! ==>
				
				return null;														// ==>
			}
		}
		
		//
		// Handle local identifier.
		//
		if( theRecord.hasOwnProperty( Dict.descriptor.kLID ) )
			lid = theRecord[ Dict.descriptor.kLID ];
		else
		{
			if( doAssert )
				throw(
					new MyError(
						'ConstraintViolated',				// Error name.
						K.error.NoLocalIdentifier,			// Message code.
						this._request.application.language,	// Language.
						null,								// No arguments.
						409									// HTTP error code.
					)
				);																// !@! ==>
			
			return null;															// ==>
		}
		
		//
		// Compute global identifier.
		//
		return ( nid !== null )
			 ? `${nid}${K.token.idSeparator}${lid}`									// ==>
			 : `${lid}`;															// ==>
		
	}	// compileGlobalIdentifier

	/**
	 * Inject validation fields
	 *
	 * This method expects two parameters: the first represents the type hierarchy and
	 * the second represents a structure containing validation option fields.
	 *
	 * The method will locate the scalar base type and inject the relevant validation
	 * option fields.
	 *
	 * Note that the data types are updated in place.
	 *
	 * @param theHierarchy	{Array}		The types hierarchy.
	 * @param theOptions	{Object}	The structure containing the validation fields.
	 */
	static injectValidationFields( theHierarchy, theOptions )
	{
		//
		// Set scalar validation fields.
		//
		Dictionary.injectScalarValidationFields( theHierarchy, theOptions );

		//
		// Set reference validation fields.
		//
		Dictionary.injectReferenceValidationFields( theHierarchy, theOptions );

		//
		// Set list validation fields.
		//
		Dictionary.injectListValidationFields( theHierarchy, theOptions );

	}	// injectValidationFields

	/**
	 * Inject scalar validation fields
	 *
	 * This method expects two parameters: the first represents the type hierarchy and
	 * the second represents a structure containing validation option fields.
	 *
	 * The method will locate the scalar base type and inject the relevant validation
	 * option fields.
	 *
	 * Note that the data types are updated in place.
	 *
	 * @param theHierarchy	{Array}		The types hierarchy.
	 * @param theOptions	{Object}	The structure containing the validation fields.
	 */
	static injectScalarValidationFields( theHierarchy, theOptions )
	{
		//
		// Locate base scalar type.
		// Note that we are modifying the original item.
		//
		const base_type = theHierarchy[ theHierarchy.length - 1 ];

		//
		// Add scalar validation fields.
		//
		switch( base_type[ Dict.descriptor.kVariable] )
		{
			case 'kTypeDataAny':
			case 'kTypeDataBool':
				// Do nothin'.
				break;

			case 'kTypeDataText':

				//
				// Remove validation fields,
				// and set from provided structure.
				//
				for( const field of Dictionary.listTextValidationFields )
				{
					if( base_type.hasOwnProperty( field ) )
						delete base_type[ field ];

					if( theOptions.hasOwnProperty( field ) )
						base_type[ field ] = theOptions[ field ];
				}

				break;

			case 'kTypeDataNumeric':

				//
				// Copy validation fields.
				//
				for( const field of Dictionary.listNumericValidationFields )
				{
					if( base_type.hasOwnProperty( field ) )
						delete base_type[ field ];

					if( theOptions.hasOwnProperty( field ) )
						base_type[ field ] = theOptions[ field ];
				}

				break;
		}

	}	// injectScalarValidationFields

	/**
	 * Inject list validation fields
	 *
	 * This method expects two parameters: the first represents the type hierarchy and
	 * the second represents a structure containing validation option fields.
	 *
	 * The method will locate the list base type and inject the relevant validation
	 * option fields. The hierarchy search will start from the last element until the
	 * first, this means that, in case of nested lists, the top-most list type will be
	 * affected. If the type is not found, the method will do nothing.
	 *
	 * Note that the data types are updated in place.
	 *
	 * @param theHierarchy	{Array}		The types hierarchy.
	 * @param theOptions	{Object}	The structure containing the validation fields.
	 */
	static injectListValidationFields( theHierarchy, theOptions )
	{
		//
		// Init base list type.
		//
		let base_type = null;

		//
		// Locate list base type.
		// Note that we are modifying the original item.
		//
		for( let i = (theHierarchy.length - 1); i >= 0; i-- )
		{
			if( theHierarchy[ i ].var === 'kTypeDataList' )
			{
				base_type = theHierarchy[ i ];
				break;															// =>
			}
		}

		//
		// Handle list base type.
		//
		if( base_type !== null )
		{
			//
			// Copy validation fields.
			//
			for( const field of Dictionary.listArrayValidationFields )
			{
				if( base_type.hasOwnProperty( field ) )
					delete base_type[ field ];

				if( theOptions.hasOwnProperty( field ) )
					base_type[ field ] = theOptions[ field ];
			}

		}	// Found list base type.

	}	// injectListValidationFields

	/**
	 * Inject reference validation fields
	 *
	 * This method expects two parameters: the first represents the type hierarchy and
	 * the second represents a structure containing validation option fields.
	 *
	 * The method will locate the reference base type and inject the relevant validation
	 * option fields. The hierarchy search will start from the last element until the
	 * first, until it finds the kTypeValueRef type. If the type is not found, the
	 * method will do nothing.
	 *
	 * Note that the data types are updated in place.
	 *
	 * @param theHierarchy	{Array}		The types hierarchy.
	 * @param theOptions	{Object}	The structure containing the validation fields.
	 */
	static injectReferenceValidationFields( theHierarchy, theOptions )
	{
		//
		// Init base reference type.
		//
		let base_type = null;

		//
		// Locate reference base type.
		// Note that we are modifying the original item.
		//
		for( let i = (theHierarchy.length - 1); i >= 0; i-- )
		{
			if( theHierarchy[ i ].var === 'kTypeValueRef' )
			{
				base_type = theHierarchy[ i ];
				break;															// =>
			}
		}

		//
		// Handle reference base type.
		//
		if( base_type !== null )
		{
			//
			// Copy validation fields.
			//
			for( const field of Dictionary.listReferenceValidationFields )
			{
				if( base_type.hasOwnProperty( field ) )
					delete base_type[ field ];

				if( theOptions.hasOwnProperty( field ) )
					base_type[ field ] = theOptions[ field ];
			}

		}	// Found reference base type.

	}	// injectReferenceValidationFields

	/**
	 * Parse validation record into a Joi command chain
	 *
	 * @param theRecord	{Object}	Validation record.
	 * @return {String}				Joi commands chain as a string.
	 */
	static parseJoi( theRecord )
	{
		//
		// Init result.
		//
		let result = "";

		//
		// Parse by base type.
		//
		switch( theRecord[ Dict.descriptor.kType ] )
		{
			case 'kTypeDataAny':
				result = "Joi.any()";
				break;

			case 'kTypeDataBool':
				result = "Joi.boolean()";
				break;

			case 'kTypeDataText':
				result = Dictionary.parseJoiString( theRecord );
				break;

			case 'kTypeDataNumeric':
				result = Dictionary.parseJoiNumber( theRecord );
				break;

			case 'kTypeDataList':
				result = Dictionary.parseJoiArray( theRecord );
				break;

			case 'kTypeDataStruct':
			case 'kTypeDataObject':
				result = "Joi.object()";
				break;
		}

		return result;																// ==>

	}	// parseJoi

	/**
	 * Parse a text validation record into a Joi command chain string
	 *
	 * The method will convert the provided validation record into a Joi chain of
	 * commands as a string to be evaluated.
	 *
	 * @param theRecord	{Object}	The validation record.
	 * @returns {String}			The Joi chain of commands as string.
	 */
	static parseJoiString( theRecord )
	{
		//
		// Init result.
		//
		let result = "Joi.string()";

		//
		// Handle length.
		//
		if( theRecord.hasOwnProperty( Dict.descriptor.kLength ) )
			result += Dictionary.length2JoiString( theRecord[ Dict.descriptor.kLength ] );

		//
		// Handle regular expression.
		//
		if( theRecord.hasOwnProperty( Dict.descriptor.kRegex ) )
		{
			for( const item of theRecord[ Dict.descriptor.kRegex ] )
				result += (".regex(" + item + ")");
		}

		//
		// Handle URL.
		//
		if( theRecord.hasOwnProperty( 'isUrl' )
		 && (theRecord.isUrl === true) )
			result += ".uri()";

		//
		// Handle HEX.
		//
		else if( theRecord.hasOwnProperty( 'isHex' )
			  && (theRecord.isHex === true) )
			result += ".hex()";

		//
		// Handle e-mail.
		//
		else if( theRecord.hasOwnProperty( 'isEmail' )
			  && (theRecord.isEmail === true) )
			result += ".email()";

		return result;																// ==>

	}	// parseJoiString

	/**
	 * Parse a numeric validation record into a Joi command chain string
	 *
	 * The method will convert the provided validation record into a Joi chain of
	 * commands as a string to be evaluated.
	 *
	 * @param theRecord	{Object}	The validation record.
	 * @returns {String}			The Joi chain of commands as string.
	 */
	static parseJoiNumber( theRecord )
	{
		//
		// Init result.
		//
		let result = "Joi.number()";

		//
		// Handle integer.
		//
		if( theRecord.hasOwnProperty( 'isInt' )
		 && (theRecord.isInt === true) )
			result += ".integer()";

		//
		// Handle range.
		//
		if( theRecord.hasOwnProperty( Dict.descriptor.kRange ) )
			result += Dictionary.range2JoiString( theRecord[ Dict.descriptor.kRange ] );

		return result;																// ==>

	}	// parseJoiNumber

	/**
	 * Parse an array validation record into a Joi command chain string
	 *
	 * The method will convert the provided validation record into a Joi chain of
	 * commands as a string to be evaluated.
	 *
	 * @param theRecord	{Object}	The validation record.
	 * @returns {String}			The Joi chain of commands as string.
	 */
	static parseJoiArray( theRecord )
	{
		//
		// Init result.
		//
		let result = "Joi.array()";

		//
		// Handle size.
		//
		if( theRecord.hasOwnProperty( Dict.descriptor.kSize ) )
			result += Dictionary.length2JoiString( theRecord[ Dict.descriptor.kSize ] );

		//
		// Handle items.
		//
		if( theRecord.hasOwnProperty( '_child' ) )
			result += (".items(" + Dictionary.parseJoi( theRecord._child ) + ")" );

		//
		// Handle set.
		//
		if( (theRecord.hasOwnProperty( 'isSet' ))
		 && (theRecord.isSet === true) )
			result += ".unique()";

		return result;																// ==>

	}	// parseJoiArray

	/**
	 * Return Joi options string for length and size
	 *
	 * This method will return a sequence of Joi commands as a string
	 * corresponding to the provided size element; the size element must be
	 * either a string length or an array size.
	 *
	 * The method expects the provided size not to be empty.
	 *
	 * @param theOption	{Array}	The size option.
	 * @return {string}			The Joi commands as a string.
	 */
	static length2JoiString( theOption )
	{
		//
		// Get limits.
		//
		let min = theOption[ 0 ];
		let max = theOption[ 1 ];

		//
		// Handle single limit
		if( min === max )
			return ".length(" + min + ")";											// ==>

		//
		// Adjust limits.
		//
		if( ! theOption[ 2 ] )
			min++;
		if( ! theOption[ 3 ] )
			max--;

		//
		// Build options.
		//
		let opts = '';
		opts += (".min(" + min + ")");
		opts += (".max(" + max + ")");

		return opts;																// ==>

	}	// length2JoiString

	/**
	 * Return Joi options string for range
	 *
	 * This method will return a sequence of Joi commands as a string
	 * corresponding to the provided size element; the size element must be
	 * a range.
	 *
	 * The method expects the provided size not to be empty.
	 *
	 * @param theOption	{Array}	The size option.
	 * @return {string}			The Joi commands as a string.
	 */
	static range2JoiString( theOption )
	{
		//
		// Init local storage.
		//
		let opts = '';

		//
		// Get limits.
		//
		let min = theOption[ 0 ];
		let max = theOption[ 1 ];

		//
		// Set limits.
		//
		if( theOption[ 2 ] )
			opts += (".min(" + min + ")");
		else
			opts += ("greater(" + min + ")");

		if( theOption[ 3 ] )
			opts += (".max(" + max + ")");
		else
			opts += ("less(" + max + ")");

		return opts;																// ==>

	}	// range2JoiString

	/**
	 * Custom field validation record compiler
	 *
	 * This method will populate the provided validation record with the validation
	 * fields of the provided data type term.
	 *
	 * It will handle:
	 *
	 * 	- kTypeCast:	Set cast function (will be added).
	 * 	- kTypeCustom:	Set custom function (will be added).
	 *
	 * @param theRecord	{Object}	The validation record.
	 * @param theType	{Object}	The data type.
	 */
	static compileCustomValidationRecord( theRecord, theType )
	{
		//
		// Iterate fields.
		//
		for( const field of Dictionary.listCustomValidationFields )
		{
			if( theType.hasOwnProperty( field ) )
			{
				if( ! theRecord.hasOwnProperty( field ) )
					theRecord[ field ] = [];

				theRecord[ field ].push( theType[ field ] );
			}
		}

	}	// compileCustomValidationRecord

	/**
	 * Combine length range
	 *
	 * This method will return the combined length range of the two provided ranges,
	 * the method will ensure that the smallest value will be taken:
	 *
	 * 	- Minimum length:	the largest length, or, if equal, the one that does not
	 * 						include the limit will be selected.
	 * 	- Maximum length:	the smallest length, or, if equal, the one that does not
	 * 						include	the limit will be taken.
	 *
	 * The method expects the ranges to be arrays of 4 elements: the first and second
	 * must be integers, the third and fourth must be booleans; the method assumes the
	 * ranges to be correct.
	 *
	 * If the second range is not an array, it means that there is no second range and the
	 * first range will be set.
	 *
	 * @param theRange1	{Array}				First range.
	 * @param theRange2	{Array}|{undefined}	Second range.
	 * @returns {Array}						The combined range.
	 */
	static combineRanges( theRange1, theRange2 )
	{
		//
		// Init local storage.
		//
		let temp = null;

		//
		// Normalise range.
		//
		if( theRange1[ 0 ] > theRange1[ 1 ] )
		{
			temp = theRange1[ 0 ];
			theRange1[ 0 ] = theRange1[ 1 ];
			theRange1[ 1 ] = temp;
			temp = theRange1[ 2 ];
			theRange1[ 2 ] = theRange1[ 3 ];
			theRange1[ 3 ] = temp;
		}

		//
		// Assert second range.
		//
		if( ! Array.isArray( theRange2 ) )
			return theRange1;														// ==>

		//
		// Init local storage.
		//
		const range = [];

		//
		// Normalise range.
		//
		if( theRange2[ 0 ] > theRange2[ 1 ] )
		{
			temp = theRange2[ 0 ];
			theRange2[ 0 ] = theRange2[ 1 ];
			theRange2[ 1 ] = temp;
			temp = theRange2[ 2 ];
			theRange2[ 2 ] = theRange2[ 3 ];
			theRange2[ 3 ] = temp;
		}

		//
		// Handle minimum bound.
		//
		if( theRange1[ 0 ] > theRange2[ 0 ] )
		{
			range[ 0 ] = theRange1[ 0 ];
			range[ 2 ] = theRange1[ 2 ];
		}
		else if( theRange1[ 0 ] < theRange2[ 0 ] )
		{
			range[ 0 ] = theRange2[ 0 ];
			range[ 2 ] = theRange2[ 2 ];
		}
		else
		{
			range[ 0 ] = theRange1[ 0 ];
			range[ 2 ] = ( theRange1[ 2 ] && theRange2 [ 2 ] );
		}

		//
		// Handle maximum bound.
		//
		if( theRange1[ 1 ] < theRange2[ 1 ] )
		{
			range[ 1 ] = theRange1[ 1 ];
			range[ 3 ] = theRange1[ 3 ];
		}
		else if( theRange1[ 1 ] > theRange2[ 1 ] )
		{
			range[ 1 ] = theRange2[ 1 ];
			range[ 3 ] = theRange2[ 3 ];
		}
		else
		{
			range[ 1 ] = theRange1[ 1 ];
			range[ 3 ] = ( theRange1[ 3 ] && theRange2 [ 3 ] );
		}

		return range;																// ==>

	}	// combineRanges
	
	/**
	 * Strip document properties
	 *
	 * This method can be used to strip properties from the provided document, it
	 * expects two parameters:
	 *
	 * 	- theDocument:		The document(s) to normalise:
	 * 		- Object:		If a document is provided, the method will normalise it; if
	 * 						the document has the '_children', '_vertex' or '_edge'
	 * 						property, the	method	will recurse with those values.
	 * 		- Array:		The method will iterate the elements and recurse its elements.
	 * 	- theProperties:	The list of properties to remove, provided as descriptor
	 * 						_key values.
	 *
	 * In general this method is used to strip private fields from users which include
	 * _id, _key, _rev, _from and _to, this is to shade identifiers from clients.
	 *
	 * All modifications are done in place.
	 *
	 * @param theDocument	{Object}|{Array}	The document to normalise.
	 * @param theProperties	{Array}				The list of properties.
	 */
	static stripDocumentProperties( theDocument, theProperties )
	{
		//
		// Check properties.
		//
		if( theProperties.length > 0 )
		{
			//
			// Handle array.
			//
			if( Array.isArray( theDocument ) )
			{
				//
				// Recurse elements.
				//
				for( const element of theDocument )
					Dictionary.stripDocumentProperties(
						element,
						theProperties
					);
				
			}	// Provided array.
			
			//
			// Handle object.
			//
			else if( K.function.isObject( theDocument ) )
			{
				//
				// Handle node edge.
				//
				if( theDocument.hasOwnProperty( '_edge' ) )
					Dictionary.stripDocumentProperties(
						theDocument._edge,
						theProperties
					);
				
				//
				// Handle node vertex.
				//
				if( theDocument.hasOwnProperty( '_vertex' ) )
					Dictionary.stripDocumentProperties(
						theDocument._vertex,
						theProperties
					);
				
				//
				// Handle siblings.
				//
				if( theDocument.hasOwnProperty( '_children' ) )
					Dictionary.stripDocumentProperties(
						theDocument._children,
						theProperties
					);
				
				//
				// Iterate properties.
				//
				for( const field of theProperties )
				{
					if( theDocument.hasOwnProperty( field ) )
						delete theDocument[ field ];
				}
				
			}	// Provided object.
			
		}	// Provided properties.
		
	}	// stripDocumentProperties
	
	
	/************************************************************************************
	 * STATIC ASSERTION METHODS															*
	 ************************************************************************************/
	
	/**
	 * Is edge collection
	 *
	 * This method will check if the provided collection type is edge, if that is not
	 * the case, the method will raise an exception.
	 *
	 * The raised exception has the HTTP status of 412.
	 *
	 * @param theCollection	{String}|{null}		The document collection.
	 */
	static isEdgeCollection( theCollection )
	{
		//
		// Check collection type.
		//
		if( db._collection( this._collection ).type() !== 3 )
			throw(
				new MyError(
					'BadCollection',					// Error name.
					K.error.ExpectingEdgeColl,			// Message code.
					this._request.application.language,	// Language.
					theCollection,						// Error value.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
	}	// isEdgeCollection
	
	/**
	 * Is document collection
	 *
	 * This method will check if the provided collection type is document, if that is not
	 * the case, the method will raise an exception.
	 *
	 * The raised exception has the HTTP status of 412.
	 *
	 * @param theCollection	{String}|{null}		The document collection.
	 */
	static isDocumentCollection( theCollection )
	{
		//
		// Check collection type.
		//
		if( db._collection( this._collection ).type() !== 2 )
			throw(
				new MyError(
					'BadCollection',					// Error name.
					K.error.ExpectingDocColl,			// Message code.
					this._request.application.language,	// Language.
					theCollection,						// Error value.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
	}	// isDocumentCollection

	/**
	 * List language description fields.
	 *
	 * This method will return the descriptor _key names of all description
	 * fields which have a language component.
	 *
	 * These will be the fields that will be processed when restricting
	 * contents to athe selected language.
	 *
	 * @returns {string[]}	List of language string field _keys.
	 */
	static get listLanguageFields()
	{
		return [
			Dict.descriptor.kLabel,			// Label.
			Dict.descriptor.kDefinition,	// Definition.
			Dict.descriptor.kDescription,	// Description.
			Dict.descriptor.kNote,			// Notes.
			Dict.descriptor.kExample		// Examples.
		];																			// ==>

	}	// listLanguageFields

	/**
	 * List base data types.
	 *
	 * This method will return the list of base data types as variable names.
	 *
	 * @returns {string[]}	List of base data type var field names.
	 */
	static get listBaseDataTypes()
	{
		return [
			Dict.term.kTypeDataAny,			// Any type.
			Dict.term.kTypeDataBool,		// Boolean.
			Dict.term.kTypeDataText,		// Text.
			Dict.term.kTypeDataNumeric,		// Number.
			Dict.term.kTypeDataList,		// Array.
			Dict.term.kTypeDataStruct,		// Structure.
			Dict.term.kTypeDataObject		// Object.
		];																			// ==>

	}	// listBaseDataTypes

	/**
	 * List base reference data types.
	 *
	 * This method will return the list of base reference data types as variable names.
	 *
	 * @returns {string[]}	List of base reference data type var field names.
	 */
	static get listBaseReferenceDataTypes()
	{
		return [
			Dict.term.kTypeValueRef,		// Reference.
			Dict.term.kTypeValueRefId,		// _id reference.
			Dict.term.kTypeValueRefKey,		// _key reference.
			Dict.term.kTypeValueRefGid,		// gid reference.
			Dict.term.kTypeValueTerm,		// Term reference.
			Dict.term.kTypeValueField,		// Field reference.
			Dict.term.kTypeValueEnum		// Enumeration reference.
		];																			// ==>

	}	// listBaseReferenceDataTypes

	/**
	 * List scalar text validation fields.
	 *
	 * This method will return the list of scalar text validation fields as an array of
	 * descriptor _key.
	 *
	 * @returns {string[]}	List of scalar text validation field _key.
	 */
	static get listTextValidationFields()
	{
		return [
			Dict.descriptor.kLength,		// String length range.
			Dict.descriptor.kRegex			// Regular expression.
		];																			// ==>

	}	// listTextValidationFields

	/**
	 * List scalar numeric validation fields.
	 *
	 * This method will return the list of scalar numeric validation fields as an array of
	 * descriptor _key.
	 *
	 * @returns {string[]}	List of scalar numeric validation field _key.
	 */
	static get listNumericValidationFields()
	{
		return [
			Dict.descriptor.kRange,			// Value range.
			Dict.descriptor.kDecimals		// Decimal positions.
		];																			// ==>

	}	// listNumericValidationFields

	/**
	 * List scalar reference validation fields.
	 *
	 * This method will return the list of scalar reference validation fields as an array of
	 * descriptor _key.
	 *
	 * @returns {string[]}	List of scalar reference validation field _key.
	 */
	static get listReferenceValidationFields()
	{
		return [
			Dict.descriptor.kCollection,	// Collection.
			Dict.descriptor.kInstance,		// Instance.
			Dict.descriptor.kEnumTerm,		// Enumerations.
			Dict.descriptor.kEnumField		// Field enumerations.
		];																			// ==>

	}	// listReferenceValidationFields

	/**
	 * List array validation fields.
	 *
	 * This method will return the list of array validation fields as an array of
	 * descriptor _key.
	 *
	 * @returns {string[]}	List of array validation field _key.
	 */
	static get listArrayValidationFields()
	{
		return [
			Dict.descriptor.kSize		// Array size.
		];																			// ==>

	}	// listArrayValidationFields

	/**
	 * List custom validation fields.
	 *
	 * This method will return the list of custom validation fields as an array of
	 * descriptor _key.
	 *
	 * @returns {string[]}	List of custom validation field _key.
	 */
	static get listCustomValidationFields()
	{
		return [
			Dict.descriptor.kTypeCast,	// Cast function.
			Dict.descriptor.kTypeCustom	// Custom function.
		];																			// ==>

	}	// listCustomValidationFields
	
	/**
	 * Get user private properties
	 *
	 * This method will return an array containing the user private fields, these
	 * fields correspond to those properties that should not be returned to the client.
	 *
	 * @returns {Array}	The list of user private properties.
	 */
	static get listUserPrivateProperties()
	{
		return [
			'_id',						// Document ID.
			'_key',						// Document key.
			'_rev',						// Document revision.
			'_oldRev',					// Previous revision.
			Dict.descriptor.kAuthData	// Authentication record.
		];																			// ==>
		
	}	// listUserPrivateProperties
}

module.exports = Dictionary;
