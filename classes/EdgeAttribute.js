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
	 * @param theAttributes		{Array}		The attributes list.
	 */
	constructor( theSource, theDestination, thePredicate, theAttributes )
	{
		//
		// Call inherited constructor.
		//
		super( theSource, theDestination, thePredicate );
		
		//
		// Normalise attributes.
		//
		theAttributes.sort();
		
		//
		// Set object data.
		//
		this.data[ Dict.descriptor.kAttributes ] = theAttributes;
		
	}	// constructor
	
	/**
	 * Resolve document
	 *
	 * This method will attempt to load the edge corresponding to the current object
	 * data, if the operation is successful, the method will load the found document
	 * excluding the current object data and return true; if the document could not be
	 * resolved, the method will return false.
	 *
	 * @param theCollection	{String}	The collection to test.
	 * @returns {Boolean}				True if found.
	 */
	resolve( theCollection )
	{
		//
		// Query the database.
		//
		const found =
			db._query( aql`
				FOR doc IN ${db._collection(theCollection)}
					FILTER doc._from == ${this.data._from}
					   AND doc._to == ${this.data._to}
					   AND doc.${Dict.descriptor.kPredicate} == ${this.data[Dict.descriptor.kPredicate]}
					   AND doc.${Dict.descriptor.kAttributes} == ${this.data[Dict.descriptor.kAttributes]}
					RETURN doc
				`);
		
		//
		// Check if unique.
		//
		if( found.count() === 1 )
		{
			//
			// Load document.
			//
			const document = found.next();
			for( const field in document )
			{
				if( (field === '_id')
				 || (field === '_key')
				 || (field === '_rev')
				 || (! this.data.hasOwnProperty( field )) )
					this.data[ field ] = document[ field ];
			}
			
			return true;															// ==>
			
		}	// Found one.
		
		return false;																// ==>
		
	}	// resolve
	
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
		this.data._key =
			crypto.md5(
				hash.concat( this.data[ Dict.descriptor.kAttributes ] ).join( "\t" )
			);
		
	}	// setKey
	
}	// EdgeAttribute.

module.exports = EdgeAttribute;
