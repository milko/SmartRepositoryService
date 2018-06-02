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
		this._class = 'Edge';
		
	}	// setClass
	
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
	setComputedProperties( doAssert = true )
	{
		//
		// Check if significant fields are there.
		// Note that with the Edge class family there should only be one combination
		// of significant fields.
		//
		if( this.hasSignificantFields( doAssert ) !== false )
		{
			//
			// Get key.
			//
			const key = this.computeKey();
			
			//
			// Assert key conflict.
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
				
				return false;														// ==>
			}
			
			//
			// Set key.
			//
			this._document._key = key;
			
			return true;															// ==>
			
		}	// Has significant fields.
		
		return false;																// ==>
		
	}	// setComputedProperties
	
	/**
	 * Check collection type
	 *
	 * This method will check if the collection is of the correct type, if that is not
	 * the case, the method will raise an exception.
	 *
	 * In this class we expect an edge collection.
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
	 * Compute edge key.
	 *
	 * This method is called by setComputedProperties() and implements the hashing
	 * algorythm, derived classes should overload this method rather than
	 * setComputedProperties().
	 *
	 * The method expects the document to have all the required properties to compute
	 * the key, hasSignificantFields() must have been called by the caller.
	 *
	 * The edge key is computed by hashing the _from, _to and predicate fields
	 * separated by a tab character, the resulting MD5 hash will be returned by this
	 * method.
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

		return crypto.md5( hash.join( "\t" ) );										// ==>
	
	}	// computeKey
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of significant fields
	 *
	 * In the Edge class family there must be only one combination of significant
	 * fields, in this class we override the parent method to return the node references
	 * and the predicate.
	 */
	get significantFields()
	{
		return [
			[
				'_from',
				'_to',
				Dict.descriptor.kPredicate
			]
		];																			// ==>
		
	}	// significantFields
	
	/**
	 * Return list of required fields
	 *
	 * In this class we add the node references and the predicate.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return super.requiredFields
			.concat([
				'_key',						// The edge hash.
				'_from',					// The source node reference.
				'_to',						// The destination node reference.
				Dict.descriptor.kPredicate	// The predicate reference.
			]);																		// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of locked fields
	 *
	 * In this class we add the node references and the predicate.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				'_key',						// The edge hash.
				'_from',					// The source node reference.
				'_to',						// The destination node reference.
				Dict.descriptor.kPredicate	// The predicate reference.
			]);																		// ==>
		
	}	// lockedFields
	
}	// Edge.

module.exports = Edge;
