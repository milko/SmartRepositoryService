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
	 * Load document property
	 *
	 * We overload this method to sort the provided attributes array before processing.
	 *
	 * @param theProperty	{String}	The property name.
	 * @param theValue		{*}			The property value.
	 * @param theLocked		{Array}		List of locked properties.
	 * @param isResolving	{Boolean}	True, called by resolveDocument().
	 */
	loadDocumentProperty( theProperty, theValue, theLocked, isResolving )
	{
		//
		// Handle attributes.
		//
		if( theProperty === Dict.descriptor.kAttributes )
			theValue.sort();
		
		//
		// Call parent method.
		//
		super.loadDocumentProperty( theProperty, theValue, theLocked, isResolving );
		
	}	// loadDocumentProperty
	
	/**
	 * Load computed fields
	 *
	 * Here we set the _key property and raise an exception if the existing and
	 * computed _key don't match.
	 *
	 * @param doAssert		{Boolean}	If true, an exception will be raised on errors
	 * 									(defaults to true).
	 * @returns {Boolean}				True if valid.
	 */
	loadComputedProperties( doAssert = true )
	{
		//
		// Check if significat fields are there.
		// Will raise an exception if false.
		//
		if( this.hasSignificantFields( doAssert ) )
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
			
		}	// Has significant fields.
		
		return false;																// ==>
		
	}	// loadComputedProperties
	
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
	 * In this class we return the node references, the predicate and the attributes
	 * array.
	 */
	getSignificantFields()
	{
		return super.getSignificantFields()
			.concat( [ Dict.descriptor.kAttributes ] );								// ==>
		
	}	// getSignificantFields
	
	/**
	 * Return list of required fields
	 *
	 * In this class we return the node references, the predicate and the attributes
	 * array.
	 *
	 * @returns {Array}	List of required fields.
	 */
	getRequiredFields()
	{
		return super.getRequiredFields()
			.concat( [ Dict.descriptor.kAttributes ] );								// ==>
		
	}	// getRequiredFields
	
	/**
	 * Return list of locked fields
	 *
	 * In this class we return the node references, the predicate and the attributes
	 * array.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	getLockedFields()
	{
		return super.getLockedFields()
			.concat( [ Dict.descriptor.kAttributes ] );								// ==>
		
	}	// getLockedFields
	
}	// EdgeAttribute.

module.exports = EdgeAttribute;
