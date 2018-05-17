'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');
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
const MyError = require( '../utils/MyError' );

//
// Ancestor.
//
const Edge = require( './Edge' );


/**
 * Edge option class
 *
 * This class implements an option edge object, it only manages significant fields, other
 * fields should be managed outside of the object.
 *
 * The class expects all required collections to exist.
 */
class EdgeAttribute extends Edge
{
	/**
	 * Resolve edge
	 *
	 * This method will attempt to load the edge corresponding to the significant
	 * fields of the object, in this case the _from, _to, predicate and attribute
	 * properties.
	 *
	 * If the edge was found, the found document properties will be set in the current
	 * object as follows:
	 *
	 * 	- _id, _key and _rev will be overwrittem by default.
	 * 	- If doReplace is true, all other found properties will overwrite the
	 * 	  current data.
	 * 	- If doReplace is false, existing properties will not be replaced (default).
	 *
	 * If the current object does not have the required fields to resolve it, the
	 * method will raise an exception. The method will also raise an exception if more
	 * than one document was found by the query. The method will raise an exception if
	 * the resolved document _id or _key fields do not match.
	 *
	 * The method will return true if resolved, or false.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @returns {Boolean}			True if found.
	 */
	resolve( doReplace = false )
	{
		//
		// Check required properties.
		//
		this.hasRequiredFields();
		
		//
		// Init local storage.
		//
		const query = {
			f: this.data._from,
			t: this.data._to,
			p: this.data[ Dict.descriptor.kPredicate ],
			a: this.data[ Dict.descriptor.kAttributes ]
		};
		
		//
		// Query the collection.
		//
		const cursor =
			db._query( aql`
				FOR doc IN ${this.collection}
					FILTER doc._from == ${query.f}
					   AND doc._to == ${query.t}
					   AND doc.${Dict.descriptor.kPredicate} == ${query.p}
					   AND doc.${Dict.descriptor.kAttributes} == ${query.a}
					RETURN doc
				`);
		
		//
		// Check if found.
		//
		if( cursor.count() > 0 )
		{
			//
			// Handle ambiguous query.
			//
			if( cursor.count() > 1 )
				throw(
					new MyError(
						'AmbiguousEdgeReference',			// Error name.
						K.error.AmbiguousEdge,				// Message code.
						this.request.application.language,	// Language.
						[ query.f, query.t, query.p, query.a.join( ', ' ) ],
						412									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Load found document.
			//
			this.addResolvedData( cursor.toArray()[ 0 ], doReplace );
			
			//
			// Set flag.
			//
			this.persistent = true;
			
		}	// Found.
		
		return this.persistent;														// ==>
		
	}	// resolve
	
	/**
	 * Insert the edge
	 *
	 * This method will insert the edge in the registered collection after validating
	 * its contents.
	 *
	 * Any validation error or insert error will raise an exception.
	 */
	insert()
	{
		//
		// Check contents.
		//
		this.validate();
		
		//
		// Init local storage.
		//
		const query = {
			f: this.data._from,
			t: this.data._to,
			p: this.data[ Dict.descriptor.kPredicate ],
			a: this.data[ Dict.descriptor.kAttributes ]
		};
		
		//
		// Try insertion.
		//
		try
		{
			//
			// Insert.
			//
			const meta = this.collection.insert( this.getData() );
			
			//
			// Update metadata.
			//
			this.data._id = meta._id;
			this.data._key = meta._key;
			this.data._rev = meta._rev;
			
			//
			// Set persistent flag.
			//
			this.persistent = true;
		}
		catch( error )
		{
			//
			// Handle unique constraint error.
			//
			if( error.isArangoError
			 && (error.errorNum === ARANGO_DUPLICATE) )
				throw(
					new MyError(
						'InsertEdge',							// Error name.
						K.error.EdgeAttrExists,					// Message code.
						this.request.application.language,		// Language.
						[ query.f, query.t, query.p, query.a.join( ', ' ) ],
						409										// HTTP error code.
					)
				);																// !@! ==>
			
			throw( error );														// !@! ==>
		}
		
	}	// insert
	
	/**
	 * Normalise object properties
	 *
	 * This method is called at the end of the constructor and after adding data to
	 * the object, its duty is to eventually normalise object properties that require
	 * processing.
	 *
	 * In this class we sort the attributes property, so that it represents a static
	 * list of values.
	 */
	normaliseProperties()
	{
		//
		// Normalise attributes.
		//
		if( this.data.hasOwnProperty( Dict.descriptor.kAttributes ) )
			this.data[ Dict.descriptor.kAttributes ].sort();
	}
	
	/**
	 * Add data
	 *
	 * We overload this method to ensure attributes are sorted.
	 *
	 * @param theData	{Object}	The object properties to add.
	 * @param doReplace	{Boolean}	True, overwrite existing properties (defalut).
	 */
	addData( theData, doReplace = true )
	{
		//
		// Normalise attributes.
		//
		if( theData.hasOwnProperty( Dict.descriptor.kAttributes ) )
			theData[ Dict.descriptor.kAttributes ].sort();
		
		//
		// Call parent method.
		//
		super.addData( theData, doReplace );
		
	}	// loadDocumentData
	
	/**
	 * Set key
	 *
	 * This method will set the edge key by hashing the _from, _to, predicate and
	 * attributes properties, separated by a TAB character.
	 *
	 * If the current object is missing any of the above properties, the method will
	 * raise an exception.
	 */
	setKey()
	{
		//
		// Check if needed.
		//
		if( ! this.data.hasOwnProperty( '_key' ) )
		{
			//
			// Check required properties.
			//
			this.hasRequiredFields();
			
			//
			// Create hash fields.
			// All fields are expected to have been set.
			//
			const hash = [];
			hash.push( this.data._from );
			hash.push( this.data._to );
			hash.push( this.data[ Dict.descriptor.kPredicate ] );
			
			//
			// Set key.
			//
			this.data._key =
				crypto.md5(
					hash.concat(
						this.data[ Dict.descriptor.kAttributes ]
					).join( "\t" ) );
			
		}	// Doesn't have key.
		
	}	// setKey
	
	/**
	 * Assert all required fields have been set
	 *
	 * This method will check if any required field is missing, if you provide true in
	 * getMad, the method will raise an exception, if false, the method will return a
	 * boolean where true means all required fields are present.
	 *
	 * In this class we first call the parent method and then assert the presence of
	 * the attributes property.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if all required fields are there.
	 */
	hasRequiredFields( getMad = true )
	{
		//
		// Check _from, _to and predicate.
		//
		const passed = super.hasRequiredFields( getMad );
		if( ! passed )
			return passed;															// ==>
		
		//
		// Check required properties.
		//
		if( ! this.data.hasOwnProperty( Dict.descriptor.kAttributes ) )
			throw(
				new MyError(
					'IncompleteObject',				// Error name.
					K.error.MissingField,				// Message code.
					this.request.application.language,	// Language.
					Dict.descriptor.kAttributes,		// Arguments.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
	}	// hasSignificantFields
	
}	// EdgeAttribute.

module.exports = EdgeAttribute;