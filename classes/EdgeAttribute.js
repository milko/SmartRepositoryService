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
	 * Resolve document
	 *
	 * This method will attempt to load the document corresponding to the significant
	 * fields of the object, if the document was found, its properties will be set in
	 * the current object.
	 *
	 * This method assumes the object has the necessary properties to resolve it.
	 *
	 * Please refer to the resolve() method for documentation.
	 *
	 * In this class we resolve using the _from, _to, predicate and attributes properties.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	If true, an exception will be raised if not found
	 * 								(defaults to true).
	 * @returns {Boolean}			True if found.
	 */
	resolveDocument( doReplace = false, doAssert = true )
	{
		//
		// Get significant field references.
		//
		const pred = Dict.descriptor.kPredicate;
		const attr = Dict.descriptor.kAttributes;
		const refs = {
			f: this._document._from,
			t: this._document._to,
			p: this._document[ pred ],
			a: this._document[ attr ]
		};
		
		//
		// Query the collection.
		//
		const collection = db._collection( this._collection );
		const cursor =
			db._query( aql`
				FOR doc IN ${collection}
					FILTER doc._from == ${refs.f}
					   AND doc._to == ${refs.t}
					   AND doc.${pred} == ${refs.p}
					   AND doc.${attr} == ${refs.a}
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
						'AmbiguousDocumentReference',		// Error name.
						K.error.AmbiguousAttrEdge,			// Message code.
						this.request.application.language,	// Language.
						[ refs.f, refs.t, refs.p, refs.a.join( ', ' ) ],
						412									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Load found document.
			//
			this.loadResolvedDocument( cursor.toArray()[ 0 ], doReplace );
			
			//
			// Set flag.
			//
			this._persistent = true;
			
		}	// Found.
		
		//
		// Handle not found.
		//
		else
		{
			//
			// Assert not found.
			//
			if( doAssert )
			{
				//
				// Build reference.
				//
				const reference = [];
				reference.push( `_from = "${refs.f}"` );
				reference.push( `_from = "${refs.t}"` );
				reference.push( `${pred} = "${refs.p}"` );
				reference.push( `${attr} = "${refs.a}"` );
				
				throw(
					new MyError(
						'BadDocumentReference',						// Error name.
						K.error.EdgeAttrNotFound,					// Message code.
						this._request.application.language,			// Language.
						[refs.f, refs.t, refs.p, refs.a.join( ', ' ), this._collection],
						404											// HTTP error code.
					)
				);																// !@! ==>
			}
			
			//
			// Set flag.
			//
			this._persistent = false;
		}
		
		return this._persistent;													// ==>
		
	}	// resolveDocument
	
	/**
	 * Set class
	 *
	 * This method will set the document class, which is the _key reference of the
	 * term defining the document class.
	 *
	 * In this class there is no defined class, so the value will be null.
	 */
	setClass()
	{
		this._class = null;
		
	}	// setClass
	
	/**
	 * Fill computed fields
	 *
	 * This method will take care of filling the computed fields.
	 *
	 * Here we set the _key property and raise an exception if the existing and
	 * computed _key don't match.
	 *
	 * @param theStructure	{Structure}	The class structure object.
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	validateComputed( theStructure, doAssert = true )
	{
		//
		// Check if significat fields are there.
		// Will raise an exception if false.
		//
		if( this.hasSignificantFields( true ) )
		{
			//
			// Create hash fields.
			// All fields are expected to have been set.
			//
			const hash = [];
			hash.push( this._document._from );
			hash.push( this._document._to );
			hash.push( this._document[ Dict.descriptor.kPredicate ] );
			
			//
			// Get key.
			//
			const key =
				crypto.md5(
					hash.concat(
						this._document[ Dict.descriptor.kAttributes ]
					).join( "\t" ) );
			
			//
			// Check key.
			//
			if( this._document.hasOwnProperty( '_key' )
				&& (key !== this._document._key) )
			{
				if( doAssert )
					throw(
						new MyError(
							'AmbiguousDocumentReference',			// Error name.
							K.error.KeyMismatch,					// Message code.
							this._request.application.language,		// Language.
							[ this._document._key, key ],			// Arguments.
							409										// HTTP error code.
						)
					);															// !@! ==>
				
				return false;
			}
			
			//
			// Set key.
			//
			this._document._key = key;
			
			return true;															// ==>
		}
		
		return false;																// ==>
		
	}	// validateComputed
	
	/**
	 * Check required fields
	 *
	 * This method will check if all required fields are present, if that is the case,
	 * the method will return true; if that is not the case the method will raise an
	 * exception, if doAssert is true, or return false.
	 *
	 * Here we do nothing, since we already checked the significant fields.
	 *
	 * @param theStructure	{Structure}	The class structure object.
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	validateRequired( theStructure, doAssert = true )
	{
		//
		// Nothing to do here.
		//
		if( theStructure === null )
			return true;															// ==>
		
		return true;																// ==>
		
	}	// validateRequired
	
	/**
	 * Normalise object properties
	 *
	 * In this method we sort the attribute elements..
	 */
	normaliseProperties()
	{
		//
		// Normalise attributes.
		//
		if( this._document.hasOwnProperty( Dict.descriptor.kAttributes ) )
			this._document[ Dict.descriptor.kAttributes ].sort();
	}
	
	/**
	 * Return list of significant fields
	 *
	 * This method will return the descriptor _key names for all the significant
	 * fields for documents of this class, this means the fields that uniquely
	 * identify the document in the collection.
	 */
	getSignificantFields()
	{
		return super.getSignificantFields()
			.join( [ Dict.descriptor.kAttributes ] );								// ==>
		
	}	// getSignificantFields
	
}	// EdgeAttribute.

module.exports = EdgeAttribute;
