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


/**
 * Edge base class
 *
 * This class implements an edge object, it only manages significant fields, other
 * fields should be managed outside of the object.
 *
 * The class expects all required collections to exist.
 */
class Edge
{
	/**
	 * Constructor
	 *
	 * The constructor expects the source and destination node references and the
	 * predicate, it will initialise the edge data and the edge _key.
	 *
	 * The constructor will not validate the provided references.
	 *
	 * @param theSource			{String}	The source node reference.
	 * @param theDestination	{String}	The destination node reference.
	 * @param thePredicate		{String}	The predicate reference.
	 */
	constructor( theSource, theDestination, thePredicate )
	{
		//
		// Init object data.
		//
		this.data = {};
		
		//
		// Set object data.
		//
		this.data._from = theSource;
		this.data._to = theDestination;
		this.data[ Dict.descriptor.kPredicate ] = thePredicate;
		
	}	// constructor
	
	/**
	 * Set key
	 *
	 * This method will set the edge key by hashing the _from, _to and predicate
	 * properties, separated by a TAB character.
	 */
	setKey()
	{
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
		this.data._key = crypto.md5( hash.join( "\t" ) );
		
	}	// setKey
	
	/**
	 * Add data
	 *
	 * This method will add the provided object properties to the current object's
	 * data, excluding existing properties in the current edge.
	 *
	 * @param theData	{Object}	The object properties to add.
	 */
	addData( theData )
	{
		//
		// Iterate properties.
		//
		for( const field in theData )
		{
			if( ! this.data.hasOwnProperty( field ) )
				this.data[ field ] = theData[ field ];
		}
		
	}	// addData
	
	/**
	 * Return edge object
	 *
	 * This method will return the edge object data, if the key was not already set,
	 * the method will set it.
	 *
	 * @returns {Object}	Edge data.
	 */
	getData()
	{
		//
		// Set key.
		//
		if( ! this.data.hasOwnProperty( '_key' ) )
			this.setKey();
		
		return this.data;															// ==>
		
	}	// getData
	
}	// Edge.

module.exports = Edge;
