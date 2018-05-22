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
 * Edge branch class
 *
 * This class implements a branched edge object, it only manages significant fields, other
 * fields should be managed outside of the object.
 *
 * The class expects all required collections to exist.
 */
class EdgeBranch extends Edge
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
	 * Return list of significant fields
	 *
	 * In this class we return the node references, the predicate and the attributes
	 * array.
	 */
	getSignificantFields()
	{
		return super.getSignificantFields()
			.concat( [ Dict.descriptor.kBranches ] );								// ==>
		
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
		return super.getSignificantFields()
			.concat( [ Dict.descriptor.kBranches ] );								// ==>
		
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
		return super.getSignificantFields()
			.concat( [ Dict.descriptor.kBranches ] );								// ==>
		
	}	// getLockedFields
	
}	// EdgeBranch.

module.exports = EdgeBranch;
