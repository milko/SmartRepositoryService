'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Parent.
//
const Document = require( './Document' );


/**
 * Edge class
 *
 * This class implements the default edge object.
 *
 * The class expects all required collections to exist.
 */
class Edge extends Document
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
	 * Check collection type
	 *
	 * This method will check if the collection is of the correct type, if that is not
	 * the case, the method will raise an exception.
	 *
	 * In this class we assume a document collection.
	 */
	checkCollectionType()
	{
		//
		// Check collection type.
		//
		if( db._collection( this._collection ).type() !== 3 )
			throw(
				new MyError(
					'BadCollection',					// Error name.
					K.error.ExpectingEdgeColl,			// Message code.
					this._request.application.language,	// Language.
					this._collection,					// Error value.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
	}	// checkCollectionType
	
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
			const key = crypto.md5( hash.join( "\t" ) );
			
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
	 * Return list of significant fields
	 *
	 * In this class we return the node references and the predicate.
	 */
	getSignificantFields()
	{
		return [
			'_from',
			'_to',
			Dict.descriptor.kPredicate
		];																			// ==>
		
	}	// getSignificantFields
	
	/**
	 * Return list of required fields
	 *
	 * In this class we return the node references and the predicate.
	 *
	 * @returns {Array}	List of required fields.
	 */
	getRequiredFields()
	{
		return [
			'_from',
			'_to',
			Dict.descriptor.kPredicate
		];																			// ==>
		
	}	// getRequiredFields
	
	/**
	 * Return list of locked fields
	 *
	 * In this class we return the node references and the predicate.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	getLockedFields()
	{
		return [
			'_from',
			'_to',
			Dict.descriptor.kPredicate
		];																			// ==>
		
	}	// getLockedFields
	
}	// Edge.

module.exports = Edge;
