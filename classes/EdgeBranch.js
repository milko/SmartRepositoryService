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
 * This class implements a branched edge object, this class differs from its parent
 * only in the management of the brances property: it is required and when replacing
 * the value, rather than replacing the array, it will be merged with the existing values.
 *
 * Note that this means that you should first create the object and only just before
 * updating it you should modify the branch.
 *
 * This class adds helpers for managing the branch.
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
		this._class = 'EdgeBranch';
		
	}	// setClass
	
	/**
	 * Return list of required fields
	 *
	 * In this class we add the branches array.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		//
		// Append local properties.
		//
		return super.requiredFields
			.concat([
				Dict.descriptor.kBranches	// The graph branches.
			]);																		// ==>
		
	}	// requiredFields
	
	/**
	 * Add branch and modifier
	 *
	 * This method will add a branch and the eventual modifiers to the current edge.
	 *
	 * The provided branch must be the object reference, the modifiers must be an
	 * object containing the modifiers data, the branch reference will be set by this
	 * method.
	 *
	 * @param theBranch		{String}		The branch.
	 * @param theModifier	{Object}|{null}	The modifiers.
	 */
	addBranch( theBranch, theModifier = null )
	{
		//
		// Create branch.
		//
		if( ! this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
			this._document[ Dict.descriptor.kBranches ] = [];
		
		//
		// Set branch.
		//
		if( ! this._document[ Dict.descriptor.kBranches ].includes( theBranch ) )
			this._document[ Dict.descriptor.kBranches ].push( theBranch );
		
		//
		// Handle modifiers.
		//
		if( theModifier !== null )
		{
			//
			// Create modifiers.
			//
			if( ! this._document.hasOwnProperty( Dict.descriptor.kModifiers ) )
				this._document[ Dict.descriptor.kModifiers ] = {};
			
			//
			// Set/update modifiers.
			//
			this._document[ Dict.descriptor.kModifiers ][ theBranch ] = theModifier;
		
		}	// Provided modifiers.
		
	}	// addBranch
	
	/**
	 * Delete branch
	 *
	 * This method will delete the provided branch from the object, including the
	 * modifiers.
	 *
	 * @param theBranch		{String}		The branch.
	 */
	delBranch( theBranch )
	{
		//
		// Handle branch.
		//
		if( this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
			this._document[ Dict.descriptor.kBranches ] =
				this._document[ Dict.descriptor.kBranches ].filter( x => x !== theBranch );
		
		//
		// Handle modifiers.
		//
		if( this._document.hasOwnProperty( Dict.descriptor.kModifiers )
		 && this._document[ Dict.descriptor.kModifiers ].hasOwnProperty( theBranch ) )
		{
			//
			// Remove modifier.
			//
			delete this._document[ Dict.descriptor.kModifiers ][ theBranch ];
			
			//
			// Remove modifiers.
			//
			if( Object.keys( this._document[ Dict.descriptor.kModifiers ] ).length === 0 )
				delete this._document[ Dict.descriptor.kModifiers ];
		}
		
	}	// delBranch
	
}	// EdgeBranch.

module.exports = EdgeBranch;
