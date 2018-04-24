'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const traversal = require("@arangodb/graph/traversal");
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const Schema = require( './Schema' );
const MyError = require( '../utils/MyError' );
const Dictionary = require( '../utils/Dictionary' );


/**
 * Descriptor class
 *
 * This class implements descriptor helpers.
 *
 * The class expects all required collections to exist.
 */
class Descriptor
{
	/**
	 * Get descriptor validation record
	 *
	 * This method will return the validator record associated with the provided
	 * descriptor document.
	 *
	 * The method will first retrieve the type hierarchy related to the descriptor's
	 * data type, it will then inject the validation option fields as follows:
	 *
	 * 	- Scalar type:
	 * 	  - The method will locate the last element of the hierarchy, which
	 * 	    corresponds to the base scalar type,
	 * 	  - it will then inject the descriptor's scalar validation option fields into
	 * 	    that type.
	 * 	- List type:
	 * 	  - The method will locate the last element of the hierarchy, which
	 * 	    corresponds to the base scalar type,
	 * 	  - it will then inject the descriptor's scalar validation option fields into
	 * 	    that type.
	 * 	  - The method will then scan the types hierarchy until it locates the base
	 * 	    list type,
	 * 	  - It will then inject the descriptor's list validation option fields into
	 * 	    that type.
	 * 	- Object:
	 * 	  - The method will load the type hierarchy for the eventual data type stored
	 * 	    in the 'type-key.type' field of the descriptor.
	 * 	  - It will then recurse the procedure for that type hierarchy injecting the
	 * 	    relevant validation option fields contained in the 'type-key' structure.
	 * 	  - The method will load the type hierarchy for the eventual data type stored
	 * 	    in the 'type-value.type' field of the descriptor.
	 * 	  - It will then recurse the procedure for that type hierarchy injecting the
	 * 	    relevant validation option fields contained in the 'type-value' structure.
	 *
	 * The method will finally feed the updated type hierarchy into the
	 * getValidationRecord() method that will parse the hierarchy and return a
	 * validation record.
	 *
	 * The descriptor can be provided as a descriptor document or as a list of
	 * descriptor documents.
	 *
	 * For more information about the process, please consult the
	 * getValidationRecord() method.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theDescriptor	{Object}|{Array}	The descriptor(s) document.
	 * @return {Object}							The validation record.
	 */
	static getDescriptorValidationRecord( theRequest, theDescriptor )
	{
		//
		// Handle array.
		//
		if( Array.isArray( theDescriptor ) )
		{
			const list = [];
			for( const descriptor of theType )
				list.push( this.getDescriptorValidationRecord( theRequest, descriptor ) );

			return list;															// ==>
		}

		//
		// Get type hierarchy.
		//
		const types =
			Schema.getTypeHierarchy(
				theRequest,
				theDescriptor[ Dict.descriptor.kType]
			);

		//
		// If the hierarchy is empty, it means the type is not a data type.
		//
		if( types.length === 0 )
			throw(
				new MyError(
					'BadTypeReference',					// Error name.
					K.error.NotDataType,				// Message code.
					theRequest.application.language,	// Language.
					theType._id							// Error value.
				)
			);																	// !@! ==>

		//
		// Set scalar validation fields.
		//
		Dictionary.injectScalarValidationFields( types, theDescriptor );

		//
		// Set list validation fields.
		//
		// Dictionary.injectListValidationFields( types, theDescriptor );

		//
		// Handle objects.
		//
		// - Load key validation hierarchy (where?).
		// - Load value validation hierarchy (where?).
		// - Inject options in key hierarchy.
		// - Inject options in value hierarchy.
		//
		// Dictionary.injectObjectValidationFields( types, theDescriptor );

		return this.getValidationRecord( theRequest, types );						// ==>

	}	// getDescriptorValidationRecord

	/**
	 * Get type validation record
	 *
	 * This method will return the type validation record for the provided data type
	 * or list of data type references.
	 *
	 * Please consult the getValidationRecord() method for more information regarding
	 * validation records.
	 *
	 * The method will raise an exception if the provided data type does not exist,
	 * and if the provided term is not a data type.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theType		{String}|{Array}	The type term _id or _key.
	 * @return {Object}							The validation record.
	 */
	static getTypeValidationRecord( theRequest, theType )
	{
		//
		// Handle array.
		//
		if( Array.isArray( theType ) )
		{
			const list = [];
			for( const term of theType )
				list.push( this.getTypeValidationRecord( theRequest, term ) );

			return list;															// ==>
		}

		//
		// Get type hierarchy.
		//
		const types = Schema.getTypeHierarchy( theRequest, theType );
		if( types.length === 0 )
			throw(
				new MyError(
					'BadTypeReference',					// Error name.
					K.error.NotDataType,				// Message code.
					theRequest.application.language,	// Language.
					theType._id							// Error value.
				)
			);																	// !@! ==>

		return this.getValidationRecord( theRequest, types );						// ==>

	}	// getTypeValidationRecord

	/**
	 * Get type validation record
	 *
	 * This method will return the type validation record for the provided data type.
	 * The validation record will be an object containing the validation fields
	 * extracted from the hierarchy of the provided data type. The object will contain
	 * the validation fields relevant to the base type and will eventually contain a
	 * '_child' field which will contain the record for the child data type.
	 *
	 * Data types are organised in a hierarchy, for instance, the key string data type
	 * derives from the string data type, which derives from the text data type, at
	 * each level the validation fields will be collected and recorded in the relevant
	 * level.
	 *
	 * Levels are broken up according to the base data type: for instance, in the
	 * previous example, the text data type defines all the levels, so the record will
	 * have a single level where, in tyrn, the key, string and text data type
	 * validation fields will be processed and stored in the record. The last level,
	 * the one containing the target data type, may contain validation fields
	 * pertaining to all levels.
	 *
	 * There are two kinds of base data types: scalar and container. Scalar data types
	 * refer to scalar values, while container data types refer to arrays and structures.
	 *
	 * Scalar data types are:
	 *
	 * 	- kTypeDataAny:		The value can take any type, this one should not have
	 * 						derived types.
	 * 	- kTypeDataBool:	The value must be a boolean, this one should not have
	 * 						derived types.
	 * 	- kTypeDataText:	The value is text, this one has several nested derived
	 * 						types.
	 * 	- kTypeDataNumeric:	The value is numeric, it has the integer derived data
	 * 						type.
	 *
	 * Container data types, as the word says, are containers fr other data types:
	 *
	 * 	- kTypeDataList:	The value is an array, it has the set derived type.
	 * 	- kTypeDataStruct:	The value is an object containing other defined data
	 * 						types.
	 * 	- kTypeDataObject:	The value is an object structure that contains undefined
	 * 						data types and fields.
	 *
	 * The resulting validation record will have the following fields depending on the
	 * base data type:
	 *
	 * 	- kTypeDataText:	The field length range, kLength, and the regular
	 * 						expression, kRegex.
	 * 	- kTypeDataNumeric:	The value range, kRange, and the eventual number of
	 * 						decimal positions, kDecimals.
	 * 	- kTypeValueRefKey:	This type may have a list of enumerations, kEnumTerm.
	 * 	- kTypeValueRefGid:	This type may have a list of enumerations, kEnumField.
	 * 	- kTypeDataList:	This type may have the size range, kSize.
	 * 	- kTypeDataObject:	This type may have two fields, kTypeKey and/or kTypeValue:
	 * 						these represent respectively the object key and value
	 * 						validation records. These two values are expected as type
	 * 						hierarchies, with the same field name, embedded in the
	 * 						object data type element of the main hierarchy.
	 *
	 * Besides the fields picked from the data type record, there are two other fields
	 * that will be set in this method:
	 *
	 * 	- kTypeCast:		This field will contain a reference to a term whose local
	 * 						identifier is the Descriptor static method name used to
	 * 						cast the value to the correct type.
	 * 	- kTypeCustom:		This field will contain a reference to a term whose local
	 * 						identifier is the Descriptor static method name used to
	 * 						perform custom validation.
	 * 	- kCollection:		This field contains a reference to the term that defines
	 * 						to which collection	the value must belong to.
	 * 	- kInstance:		This field contains a reference to the term that defines
	 * 						to which instance the value must belong to.
	 *
	 * The above two last fields will contain this class'es static method names.
	 *
	 * The record also contains the following custom flag properties that will be used
	 * when compiling Joi validation strings:
	 *
	 * 	- isUrl:			The string is an URL (Joi.string().uri()).
	 * 	- isEmail:			The string is an e-mail (Joi.string().email()).
	 * 	- isHex:			The string is hexadecimal (Joi.string().hex()).
	 * 	- isInt:			The number is an integer (Joi.number().integer()).
	 * 	- isStamp:			The number is a time-stamp (Joi.date().timestamp()).
	 *
	 * Note that data types are not expected to have more than two base type levels,
	 * this means that you may have one container type that contains a scalar base
	 * type. Scalar base types cannot be nested.
	 *
	 * The method expects a full term object, or an array of full term objects.
	 *
	 * The method will raise an exception if the provided data type does not exist,
	 * and if the provided term is not a data type.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theHierarchy	{Array}		The type hierarchy.
	 * @return {Object}					The validation record.
	 */
	static getValidationRecord( theRequest, theHierarchy )
	{
		//
		// Init local storage.
		//
		let rec = {};
		let temp_rec = {};
		const base_types = Dictionary.listBaseDataTypes;
		const object_types = [
			Dict.descriptor.kTypeKey,
			Dict.descriptor.kTypeValue
		];

		//
		// Iterate hierarchy.
		//
		while( theHierarchy.length > 0 )
		{
			//
			// Get current type,
			// from general to specific.
			//
			const type = theHierarchy.pop();

			//
			// Handle base type.
			//
			if( base_types.includes( type._key ) )
			{
				//
				// Handle child type.
				//
				if( rec.hasOwnProperty( 'type' ) )
				{
					//
					// Save current record.
					//
					temp_rec = JSON.parse(JSON.stringify(rec));

					//
					// Init new record.
					//
					rec = { _child : temp_rec };
				}

				//
				// Set data type.
				//
				rec[ Dict.descriptor.kType ] = type.var;
			}

			//
			// Parse by type.
			//
			switch( rec.type )
			{
				case 'kTypeDataAny':
				case 'kTypeDataBool':
					// Do nothin'.
					break;

				case 'kTypeDataText':

					Dictionary.compileTextValidationRecord( rec, type );
					Dictionary.compileReferenceValidationRecord( rec, type );

					break;

				case 'kTypeDataNumeric':

					Dictionary.compileNumericValidationRecord( rec, type );

					break;

				case 'kTypeDataList':

					Dictionary.compileListValidationRecord( rec, type );

					break;

				case 'kTypeDataStruct':
					// Contents will be parsed when validating.
					break;

				case 'kTypeDataObject':

					for( const obj_type of object_types )
					{
						if( type.hasOwnProperty( obj_type ) )
							rec[ obj_type ] =
								this.getTypeValidationRecord(
									theRequest,
									type[ obj_type ] );
					}

					break;

				default:
					throw(
						new MyError(
							'BadBaseType',						// Error name.
							K.error.NotBaseDataType,			// Message code.
							theRequest.application.language,	// Language.
							type._id							// Error value.
						)
					);															// !@! ==>
			}

			//
			// Set custom validation fields.
			//
			Dictionary.compileCustomValidationRecord( rec, type );
		}

		return rec;																	// ==>

	}	// getValidationRecord

}	// Descriptor.

module.exports = Descriptor;
