'use strict';

//
// Frameworks.
//
const _ = require('lodash');
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
const Validation = require( '../utils/Validation' );


/**
 * Edge class
 *
 * This class implements the default edge object.
 *
 * The class expects all required collections to exist.
 */
class Edge
{
	/**
	 * Constructor
	 *
	 * The constructor expects the collection name and a reference that may either be
	 * the edge object or a string referening the edge _id or _key.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theReference	{String}|{Object}	The edge reference or object.
	 * @param theCollection	{String}			The edge collection.
	 */
	constructor( theRequest, theReference, theCollection )
	{
		//
		// Init default fields.
		//
		this.request = theRequest;
		
		//
		// Set collection.
		//
		this.colname = theCollection;
		this.collection = db._collection( theCollection );
		if( ! this.collection )
			throw(
				new MyError(
					'BadCollection',					// Error name.
					K.error.MissingCollection,			// Message code.
					theRequest.application.language,	// Language.
					theCollection,						// Error value.
					412									// HTTP error code.
				)
			);																// !@! ==>
		
		//
		// Check collection type.
		//
		if( this.collection.type() !== 3 )
			throw(
				new MyError(
					'BadCollection',					// Error name.
					K.error.ExpectingEdgeColl,			// Message code.
					theRequest.application.language,	// Language.
					theCollection,						// Error value.
					412									// HTTP error code.
				)
			);																// !@! ==>
		
		//
		// Handle edge object.
		//
		if( K.function.isObject( theReference ) )
		{
			//
			// Set persistent flag.
			//
			this.persistent = false;
			
			//
			// Load data.
			//
			this.data = theReference;
		}
		
		//
		// Handle edge reference.
		//
		else
		{
			
			//
			// Resolve reference.
			//
			try
			{
				//
				// Load document.
				//
				this.data = this.collection.document( theReference );
				
				//
				// Set persistent flag.
				//
				this.persistent = true;
			}
			catch( error )
			{
				//
				// Handle exceptions.
				//
				if( (! error.isArangoError)
				 || (error.errorNum !== ARANGO_NOT_FOUND) )
					throw( error );												// !@! ==>
				
				//
				// Handle not found.
				//
				throw(
					new MyError(
						'BadDocumentReference',					// Error name.
						K.error.DocumentNotFound,				// Message code.
						theRequest.application.language,	// Language.
						[theReference, theCollection],		// Error value.
						404									// HTTP error code.
					)
				);																// !@! ==>
			}
		}
		
		//
		// Normalise properties.
		//
		this.normaliseProperties();
		
	}	// constructor
	
	/**
	 * Resolve edge
	 *
	 * This method will attempt to load the edge corresponding to the significant
	 * fields of the object, in this case the _from, _to and predicate properties.
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
	 * @param doAssert	{Boolean}	If true, an exception will be raised if not found
	 * 								(defaults to true).
	 * @returns {Boolean}			True if found.
	 */
	resolve( doReplace = false, doAssert = true )
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
			p: this.data[ Dict.descriptor.kPredicate ]
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
						[ query.f, query.t, query.p ],		// Arguments.
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
		
		//
		// Assert not found.
		//
		else if( doAssert )
			throw(
				new MyError(
					'BadDocumentReference',					// Error name.
					K.error.DocumentNotFound,				// Message code.
					this.request.application.language,	// Language.
					[Object.values(query), this.getCollectionName()],
					404									// HTTP error code.
				)
			);																	// !@! ==>
		
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
			p: this.data[ Dict.descriptor.kPredicate ]
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
						'InsertEdge',						// Error name.
						K.error.EdgeExists,					// Message code.
						theRequest.application.language,	// Language.
						[ query.f, query.t, query.p ],		// Error value.
						409									// HTTP error code.
					)
				);																// !@! ==>
			
			throw( error );														// !@! ==>
		}
		
	}	// insert
	
	/**
	 * Validate edge
	 *
	 * This method will assert all required fields are present and validate all fields,
	 * if any of these tests fails, the method will raise an exception.
	 */
	validate()
	{
		//
		// Check for required fields.
		//
		this.hasRequiredFields();
		
		//
		// Validate fields.
		//
		this.data = Validation.validateStructure( this.request, this.data );
		
	}	// validate
	
	/**
	 * Assert all required fields have been set
	 *
	 * This method will check if any required field is missing, if you provide true in
	 * getMad, the method will raise an exception, if false, the method will return a
	 * boolean where true means all required fields are present.
	 *
	 * In this class we assert the presence of _from, _to and predicate.
	 *
	 * @param getMad	{Boolean}	True raises an exception (default).
	 * @returns {Boolean}			True if all required fields are there.
	 */
	hasRequiredFields( getMad = true )
	{
		//
		// Check _from, _to and predicate.
		//
		if( (! this.data.hasOwnProperty( '_from' ))
		 || (! this.data.hasOwnProperty( '_to' ))
		 || (! this.data.hasOwnProperty( Dict.descriptor.kPredicate )) )
		{
			//
			// Raise an exception.
			//
			if( getMad )
			{
				//
				// Select missing properties.
				//
				const missing = [];
				const fields = [ '_from', '_to', Dict.descriptor.kPredicate ];
				for( const field of fields )
				{
					if( ! this.data.hasOwnProperty( field ) )
						missing.push( field );
				}
				
				throw(
					new MyError(
						'IncompleteObject',				// Error name.
						K.error.MissingField,				// Message code.
						this.request.application.language,	// Language.
						missing.join( ', ' ),				// Arguments.
						412									// HTTP error code.
					)
				);																// !@! ==>
			}
			
			return false;															// ==>
		}
		
		return true;																// ==>
		
	}	// hasSignificantFields
	
	/**
	 * Normalise object properties
	 *
	 * This method is called at the end of the constructor and after adding data to
	 * the object, its duty is to eventually normalise object properties that require
	 * processing.
	 */
	normaliseProperties()
	{
		// Nothing here.
	}
	
	/**
	 * Add data
	 *
	 * This method will add the provided object properties to the current object's
	 * data.
	 *
	 * If the second parameter is false, existing properties will not be overwritten,
	 * the default is true, which means the provided properties will overwrite the
	 * existing ones.
	 *
	 * @param theData	{Object}	The object properties to add.
	 * @param doReplace	{Boolean}	True, overwrite existing properties (defalut).
	 */
	addData( theData, doReplace = true )
	{
		//
		// Iterate properties.
		//
		for( const field in theData )
		{
			if( doReplace
			 || (! this.data.hasOwnProperty( field )) )
				this.data[ field ] = theData[ field ];
		}
		
	}	// loadDocumentData
	
	/**
	 * Add resolved data
	 *
	 * This method will add the provided object properties to the current object's
	 * data, unlike the loadDocumentData() method, this one expects the provided object to be
	 * complete and will overwrite by default the _id, _key and _rev fields.
	 *
	 * If the second parameter is false, existing properties will not be overwritten,
	 * the default is true, which means the provided properties will overwrite the
	 * existing ones.
	 *
	 * @param theData	{Object}	The object properties to add.
	 * @param doReplace	{Boolean}	True, overwrite existing properties (defalut).
	 */
	addResolvedData( theData, doReplace = true )
	{
		//
		// Set _id.
		//
		if( this.data.hasOwnProperty( '_id' )
		 && (this.data._id !== theData._id) )
			throw(
				new MyError(
					'AmbiguousEdgeReference',			// Error name.
					K.error.IdMismatch,					// Message code.
					this.request.application.language,	// Language.
					[ this.data._id, theData._id ],		// Arguments.
					409									// HTTP error code.
				)
			);																// !@! ==>
		this.data._id = theData._id;
		delete theData._id;
		
		//
		// Set _key.
		//
		if( this.data.hasOwnProperty( '_key' )
			&& (this.data._key !== theData._key) )
			throw(
				new MyError(
					'AmbiguousEdgeReference',			// Error name.
					K.error.KeyMismatch,				// Message code.
					this.request.application.language,	// Language.
					[ this.data._key, theData._key ],		// Arguments.
					409									// HTTP error code.
				)
			);																// !@! ==>
		this.data._key = theData._key;
		delete theData._key;
		
		//
		// Set _rev.
		//
		this.data._rev = theData._rev;
		delete theData._rev;
		
		//
		// Set other fields.
		//
		this.addData( theData, doReplace );
		
	}	// loadResolvedDocument
	
	/**
	 * Return edge collection
	 *
	 * This method will return the edge collection.
	 *
	 * @returns {Object}	Edge collection.
	 */
	getCollection()
	{
		return this.collection;														// ==>
		
	}	// getCollection
	
	/**
	 * Return edge collection name
	 *
	 * This method will return the edge collection name.
	 *
	 * @returns {String}	Edge collection name.
	 */
	getCollectionName()
	{
		return this.colname;												// ==>
		
	}	// getCollectionName
	
	/**
	 * Return persistent flag
	 *
	 * This method will return true if the object was loaded or stored in the collection.
	 *
	 * @returns {Boolean}	Resolved flag: true was resolved.
	 */
	isPersistent()
	{
		return this.persistent;														// ==>
		
	}	// persistent
	
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
		this.setKey();
		
		return this.data;															// ==>
		
	}	// getData
	
	/**
	 * Set key
	 *
	 * This method will set the edge key by hashing the _from, _to and predicate
	 * properties, separated by a TAB character.
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
			this.data._key = crypto.md5( hash.join( "\t" ) );
			
		}	// Doesn't have key.
		
	}	// setKey
	
}	// Edge.

module.exports = Edge;
