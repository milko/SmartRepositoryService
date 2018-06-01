'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );
const Schema = require( '../utils/Schema' );
const Dictionary = require( '../utils/Dictionary' );

//
// Parent.
//
const Document = require( './Document' );

//
// Classes.
//
const Edge = require( './Edge' );


/**
 * Descriptor class
 *
 * This class implements a descriptor object.
 */
class Descriptor extends Document
{
	/**
	 * Set class
	 *
	 * This method will set the document class, which is the _key reference of the
	 * term defining the document class.
	 */
	setClass()
	{
		this._class = 'Descriptor';
		
	}	// setClass
	
	/**
	 * Check collection type
	 *
	 * This method will check if the collection is of the correct type, if that is not
	 * the case, the method will raise an exception.
	 *
	 * In this class we expect a document collection.
	 */
	checkCollectionType()
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
					this._collection,					// Error value.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
	}	// checkCollectionType
	
	/**
	 * Load computed fields
	 *
	 * We overload this method to add the validation record.
	 *
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	loadComputedProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.loadComputedProperties( doAssert ) )
		{
			//
			// Compute the global identifier.
			//
			const gid = Dictionary.compileGlobalIdentifier( this._document, doAssert );
			if( gid !== null )
				this._document[ Dict.descriptor.kGID ] = gid;
			else
				return false;														// ==>
			
			//
			// Set validation structure.
			//
			this._document[ Dict.descriptor.kValidation ] =
				Descriptor.getValidationStructure(
					this._request,
					Descriptor.getDescriptorValidationRecord(
						this._request,
						this._document
					)
				);
			
			return true;															// ==>
			
		}	// Parent method was successful.
		
		return false;																// ==>
		
	}	// loadComputedProperties
	
	/**
	 * Assert if current object is constrained
	 *
	 * This method will check if the current object has constraints that should
	 * prevent the object from being removed, the method will return true if there is
	 * a constraint, or it will return false.
	 *
	 * If the getMad parameter is true and if the object is constrained, the method will
	 * raise an exception.
	 *
	 * In this class we prevent removing embedded, default and standard descriptors.
	 *
	 * This method is called before removing the current object.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if object is related and null if not persistent.
	 */
	hasConstraints( getMad = true )
	{
		//
		// Check if persistent.
		//
		if( this._persistent )
		{
			//
			// Check if embedded.
			//
			if( this._document[ Dict.descriptor.kDeploy ]
				=== Dict.term.kStateApplicationEmbedded )
			{
				if( getMad )
					throw(
						new MyError(
							'ConstraintViolated',				// Error name.
							K.error.DescriptorEmbedded,			// Message code.
							this._request.application.language,	// Language.
							this._document._key,				// Error value.
							409									// HTTP error code.
						)
					);															// !@! ==>
				
				return true;														// ==>
			}
			
			//
			// Check if default.
			//
			if( this._document[ Dict.descriptor.kDeploy ]
				=== Dict.term.kStateApplicationDefault )
			{
				if( getMad )
					throw(
						new MyError(
							'ConstraintViolated',				// Error name.
							K.error.DescriptorDefault,			// Message code.
							this._request.application.language,	// Language.
							this._document._key,				// Error value.
							409									// HTTP error code.
						)
					);															// !@! ==>
				
				return true;														// ==>
			}
			
			//
			// Check if standard.
			//
			if( this._document[ Dict.descriptor.kDeploy ]
				=== Dict.term.kStateApplicationStandard )
			{
				if( getMad )
					throw(
						new MyError(
							'ConstraintViolated',				// Error name.
							K.error.DescriptorStandard,			// Message code.
							this._request.application.language,	// Language.
							this._document._key,				// Error value.
							409									// HTTP error code.
						)
					);															// !@! ==>
				
				return true;														// ==>
			}
			
			return false;															// ==>
		}
		
		return null;																// ==>
		
	}	// hasConstraints
	
	/**
	 * Return list of significant fields
	 *
	 * This method should return the list of properties that will uniquely identify
	 * the document.
	 *
	 * In this class we return the global identifier.
	 *
	 * @returns {Array}	List of significant fields.
	 */
	get significantFields()
	{
		return [ [Dict.descriptor.kGID] ];											// ==>
		
	}	// significantFields
	
	/**
	 * Return list of required fields
	 *
	 * This method should return the list of required properties.
	 *
	 * In this class we return the _key, lid, gid, var, kind, type, format, deploy and
	 * label.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return [
			'_key',
			Dict.descriptor.kLID,
			Dict.descriptor.kGID,
			Dict.descriptor.kVariable,
			Dict.descriptor.kKind,
			Dict.descriptor.kType,
			Dict.descriptor.kFormat,
			Dict.descriptor.kDeploy,
			Dict.descriptor.kLabel
		];																			// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of unique fields
	 *
	 * This method should return the list of unique properties.
	 *
	 * In this class we return the key and the global identifier.
	 *
	 * @returns {Array}	List of unique fields.
	 */
	get uniqueFields()
	{
		return super.uniqueFields
			.concat([
				Dict.descriptor.kGID,
				Dict.descriptor.kVariable
			]);																		// ==>
		
	}	// uniqueFields
	
	/**
	 * Return list of locked fields
	 *
	 * This method should return the list of fields that cannot be changed once the
	 * document has been inserted.
	 *
	 * In this class we return the id, key, revision.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				Dict.descriptor.kNID,
				Dict.descriptor.kLID,
				Dict.descriptor.kGID,
				Dict.descriptor.kVariable,
				Dict.descriptor.kKind,
				Dict.descriptor.kType,
				Dict.descriptor.kFormat,
				Dict.descriptor.kDeploy
			]);																		// ==>
		
	}	// lockedFields
	
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
		// Init local storage.
		//
		let types = null;
		let hierarchy = null;
		let is_obj = false;
		
		//
		// Handle array.
		//
		if( Array.isArray( theDescriptor ) )
		{
			const list = [];
			for( const descriptor of theType )
				list.push(
					Descriptor.getDescriptorValidationRecord(
						theRequest,
						descriptor
					)
				);
			
			return list;															// ==>
		}
		
		//
		// Get base type hierarchy.
		//
		types =
			Schema.getTypeHierarchy(
				theRequest,
				theDescriptor[ Dict.descriptor.kType ]
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
		// Handle object key and value types.
		//
		// We do this only if the descriptor type is object,
		// and not a type derived from object.
		//
		// This means that the hierarchy (types variable) will be one element.
		//
		if( theDescriptor[ Dict.descriptor.kType ] === Dict.term.kTypeDataObject )
		{
			//
			// Init local storage.
			//
			is_obj = true;
			let field = null;
			
			//
			// Handle key type.
			//
			field = Dict.descriptor.kTypeKey;
			if( theDescriptor.hasOwnProperty( field ) )
			{
				//
				// Get type hierarchy.
				//
				hierarchy =
					Schema.getTypeHierarchy(
						theRequest,
						theDescriptor[ field ][ Dict.descriptor.kType ]
					);
				
				//
				// Ensure it is text.
				//
				const temp = hierarchy[ hierarchy.length - 1 ][ Dict.descriptor.kVariable ];
				if( temp !== 'kTypeDataText' )
					throw(
						new MyError(
							'BadValueType',						// Error name.
							K.error.KeyMustBeText,					// Message code.
							theRequest.application.language,	// Language.
							temp,								// Error value.
							500									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Inject descriptor validation options.
				//
				Dictionary.injectValidationFields( hierarchy, theDescriptor[ field ] );
				
				//
				// Set hierarchy in object type.
				//
				types[ 0 ][ field ] = hierarchy;
			}
			
			//
			// Handle value type.
			//
			field = Dict.descriptor.kTypeValue;
			if( theDescriptor.hasOwnProperty( field ) )
			{
				//
				// Get type hierarchy.
				//
				hierarchy =
					Schema.getTypeHierarchy(
						theRequest,
						theDescriptor[ field ][ Dict.descriptor.kType ]
					);
				
				//
				// Inject descriptor validation options.
				//
				Dictionary.injectValidationFields( hierarchy, theDescriptor[ field ]  );
				
				//
				// Set hierarchy in object type.
				//
				types[ 0 ][ field ] = hierarchy;
			}
		}
		
		//
		// Get format hierarchy.
		//
		hierarchy = null;
		switch( theDescriptor[ Dict.descriptor.kFormat ] )
		{
			case Dict.term.kTypeFormatList:
				hierarchy =
					Schema.getTypeHierarchy(
						theRequest,
						Dict.term.kTypeDataList
					);
				break;
			
			case Dict.term.kTypeFormatSet:
				hierarchy =
					Schema.getTypeHierarchy(
						theRequest,
						Dict.term.kTypeValueSet
					);
				break;
		}
		
		//
		// Add list type.
		//
		if( hierarchy !== null )
			types = types.concat( hierarchy );
		
		//
		// Inject validation options fields.
		// Note that we do this only for non-object fields.
		//
		if( ! is_obj )
			Dictionary.injectValidationFields( types, theDescriptor );
		
		return Descriptor.getValidationRecord( theRequest, types );					// ==>
		
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
				list.push( Descriptor.getTypeValidationRecord( theRequest, term ) );
			
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
		
		return Descriptor.getValidationRecord( theRequest, types );					// ==>
		
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
		const record = {};
		const base_types = Dictionary.listBaseDataTypes;
		const object_types = [
			Dict.descriptor.kTypeKey,
			Dict.descriptor.kTypeValue
		];
		
		//
		// Iterate hierarchy.
		//
		let current = record;
		while( theHierarchy.length > 0 )
		{
			//
			// Get current type,
			// from general to specific.
			//
			const type = theHierarchy.pop();
			
			//
			// Handle base type.
			// This should only occur when creating the first type,
			// or when switching from a list to a scalar.
			//
			if( base_types.includes( type._key ) )
			{
				//
				// Handle child type.
				// This if current record has no type.
				//
				if( current.hasOwnProperty( Dict.descriptor.kType ) )
				{
					//
					// Create child placeholder.
					//
					current._child = {};
					
					//
					// Point to child.
					//
					current = current._child;
				}
				
				//
				// Set data type.
				//
				current[ Dict.descriptor.kType ] = type[ Dict.descriptor.kVariable ];
			}
			
			//
			// Parse by type.
			//
			switch( current[ Dict.descriptor.kType ] )
			{
				case 'kTypeDataAny':
				case 'kTypeDataBool':
					// Do nothin'.
					break;
				
				case 'kTypeDataText':
					
					Dictionary.compileTextValidationRecord( current, type );
					Dictionary.compileReferenceValidationRecord( current, type );
					
					break;
				
				case 'kTypeDataNumeric':
					
					Dictionary.compileNumericValidationRecord( current, type );
					
					break;
				
				case 'kTypeDataList':
					
					Dictionary.compileListValidationRecord( current, type );
					
					break;
				
				case 'kTypeDataStruct':
					// Contents will be parsed when validating.
					break;
				
				case 'kTypeDataObject':
					
					for( const obj_type of object_types )
					{
						if( type.hasOwnProperty( obj_type ) )
							current[ obj_type ] =
								Descriptor.getValidationRecord(
									theRequest,
									type[ obj_type ]
								);
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
			Dictionary.compileCustomValidationRecord( current, type );
		}
		
		return record;																// ==>
		
	}	// getValidationRecord
	
	/**
	 * Get validation structure
	 *
	 * This method can be used to convert a validation record into a validation
	 * structure, it expects the current request and the validation record, or an
	 * array of validation records.
	 *
	 * The method expects the validation record to contain the following fields:
	 *
	 * 	- type:			The base data type.
	 * 	- type-key:		The object key validation record.
	 * 	- type-value:	The object value validation record.
	 * 	- type-cast:	The term referencing the value cast function.
	 * 	- type-custom:	The term referencing the value custom function.
	 * 	- size:			The array size range.
	 * 	- range:		The value range.
	 * 	- length:		The string length range.
	 * 	- decimals:		The number of significant decimals.
	 * 	- regex:		The string regular expression.
	 * 	- terms:		The list of term enumerations.
	 * 	- fields:		The list of field enumerations.
	 * 	- collection:	The reference collection name.
	 * 	- instance:		The reference instance.
	 * 	- isRef:		True if reference.
	 * 	- isSet:		True if array set.
	 * 	- isInt:		True if integer.
	 * 	- isStamp:		True if time stamp.
	 * 	- isHex:		True if hexadecimal string.
	 * 	- isUrl:		True if URI.
	 * 	- isEmail:		True if e-mail.
	 * 	- _child:		Child type container.
	 *
	 * @param theRequest	{Object}			Current request.
	 * @param theRecord		{Object}|{Array}	Validation record.
	 * @return {Object}							Validation structure.
	 */
	static getValidationStructure( theRequest, theRecord )
	{
		//
		// Handle array.
		//
		if( Array.isArray( theRecord ) )
		{
			const list = [];
			for( const record of theRecord )
				list.push(
					Descriptor.getValidationStructure(
						theRequest,
						record
					)
				);
			
			return list;															// ==>
		}
		
		//
		// Init local storage.
		//
		const structure = {};
		
		//
		// Set base type.
		//
		structure[ Dict.descriptor.kType ] =
			Dict.term[ theRecord[ Dict.descriptor.kType ] ];
		
		//
		// Parse Joi validation string.
		//
		structure[ Dict.descriptor.kJoi ] =
			Dictionary.parseJoi( theRecord );
		
		//
		// Point to scalar definition.
		//
		let record = ( (theRecord[ Dict.descriptor.kType ] === 'kTypeDataList')
			&& theRecord.hasOwnProperty( '_child' ) )
					 ? theRecord._child
					 : theRecord;
		
		//
		// Parse functions.
		//
		for( const field of [ Dict.descriptor.kTypeCast, Dict.descriptor.kTypeCustom ] )
		{
			if( record.hasOwnProperty( field ) )
				structure[ field ] = record[ field ];
		}
		
		//
		// Parse references.
		//
		if( record.hasOwnProperty( 'isRef' )
			&& (record.isRef === true) )
		{
			for( const field of Dictionary.listReferenceValidationFields )
			{
				if( record.hasOwnProperty( field ) )
					structure[ field ] = record[ field ];
			}
		}
		
		//
		// Handle object.
		//
		if( theRecord[ Dict.descriptor.kType ] === 'kTypeDataObject' )
		{
			//
			// Set key Joi string.
			//
			if( theRecord.hasOwnProperty( Dict.descriptor.kTypeKey ) )
				structure[ Dict.descriptor.kTypeKey ] =
					Descriptor.getValidationStructure(
						theRequest,
						theRecord[ Dict.descriptor.kTypeKey ]
					);
			
			//
			// Set value Joi string.
			//
			if( theRecord.hasOwnProperty( Dict.descriptor.kTypeValue ) )
				structure[ Dict.descriptor.kTypeValue ] =
					Descriptor.getValidationStructure(
						theRequest,
						theRecord[ Dict.descriptor.kTypeValue ]
					);
		}
		
		return structure;															// ==>
		
	}	// getValidationStructure
	
}	// Descriptor.

module.exports = Descriptor;
