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
		this._class = 'EdgeAttribute';
		
	}	// setClass
	
	/**
	 * Load document property
	 *
	 * We overload this method to sort the provided attributes array before processing.
	 *
	 * @param theProperty	{String}	The property name.
	 * @param theValue		{*}			The property value.
	 * @param theLocked		{Array}		List of locked properties.
	 * @param isResolving	{Boolean}	True, called by resolve().
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
		super.setProperty( theProperty, theValue, theLocked, isResolving );
		
	}	// setProperty
	
	/**
	 * Compute edge key.
	 *
	 * We overload this method by hashing the _from, _to, predicate and the flattened
	 * attributes list properties, separated by a tab character, the resulting MD5
	 * hash will be returned by this method.
	 *
	 * @returns {String}	The edge _key.
	 */
	computeKey()
	{
		//
		// Collect hash fields.
		//
		const hash = [];
		hash.push( this._document._from );
		hash.push( this._document._to );
		hash.push( this._document[ Dict.descriptor.kPredicate ] );
		
		return(
			crypto.md5(
				hash.concat(
					this._document[ Dict.descriptor.kAttributes ]
				).join( "\t" )
			)
		);																			// ==>
		
	}	// computeKey
	
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
	 * In the Edge class family there must be only one combination of significant
	 * fields, in this class we call the parent method and add the attributes array.
	 */
	get significantFields()
	{
		//
		// Get default properties.
		//
		const selectors = super.significantFields;
		
		//
		// Add attributes to first, and only, selector.
		//
		selectors[ 0 ].push( Dict.descriptor.kAttributes );
		
		return selectors;															// ==>
		
	}	// significantFields
	
	/**
	 * Return list of required fields
	 *
	 * In this class we return the node references, the predicate and the attributes
	 * array.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return super.requiredFields
			.concat([
				Dict.descriptor.kAttributes		// The edge attributes.
			]);																		// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of locked fields
	 *
	 * In this class we return the node references, the predicate and the attributes
	 * array.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				Dict.descriptor.kAttributes		// The edge attributes.
			]);																		// ==>
		
	}	// lockedFields
	
}	// EdgeAttribute.

module.exports = EdgeAttribute;
