'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
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
const NewDocument = require( './NewDocument' );


/**
 * Edge class
 *
 * This class implements the default edge object.
 *
 * The class expects all required collections to exist.
 */
class NewEdge extends NewDocument
{
	/************************************************************************************
	 * INITIALISATION METHODS															*
	 ************************************************************************************/
	
	/**
	 * Init document properties
	 *
	 * We overload this method to set the instance member.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theCollection	{String}|{null}		The document collection.
	 * @param isImmutable	{Boolean}			True, instantiate immutable document.
	 */
	initDocumentMembers( theRequest, theCollection, isImmutable )
	{
		//
		// Call parent method.
		//
		super.initDocumentMembers( theRequest, theCollection, isImmutable );
		
		//
		// Set edge instance.
		//
		this._instance = 'Edge';
		
	}	// initDocumentMembers
	
	
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise document properties
	 *
	 * We overload this method to compute the edge _key and assert that, if the current
	 * object has the _key, it is not different.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseDocumentProperties( doAssert = true )
	{
		//
		// Check parent method.
		//
		if( super.normaliseDocumentProperties( doAssert ) )
		{
			//
			// Check if significant fields are there.
			// This should fail if any of the fields
			// required to compute the key
			// are missing.
			//
			if( this.validateSignificantProperties( doAssert ) !== false )
			{
				//
				// Get key.
				//
				const key = this.key;
				if( key === null )
					throw(
						new MyError(
							'Bug',									// Error name.
							K.error.BugEdgeKeyMissFld,				// Message code.
							this._request.application.language,		// Language.
							this.instance,							// Arguments.
							500										// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Check existing key.
				//
				if( this._document.hasOwnProperty( '_key' ) )
				{
					//
					// Assert they are equal.
					//
					if( key !== this._document._key )
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
							);													// !@! ==>
						
						return false;												// ==>
					
					}	// Key mismatch.
					
				}	// Edge has key.
				
				//
				// Set key.
				//
				this._document._key = key;
				
				return true;														// ==>
				
			}	// Has significant fields.
			
		}	// Parent method passed.
		
		return false;																// ==>
		
	}	// normaliseDocumentProperties
	
	
	/************************************************************************************
	 * VALIDATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Validate collection type
	 *
	 * In this class we assert the collection to be of type edge.
	 *
	 * @param theCollection	{String}	The collection name.
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}				True if all required fields are there.
	 */
	validateCollectionType( theCollection, doAssert = true )
	{
		return NewDocument.isEdgeCollection( theCollection, doAssert );				// ==>
		
	}	// validateCollectionType


	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Compute edge key.
	 *
	 * This method will return the computed edge key value, or null, if any required
	 * field is missing.
	 *
	 * This class expects the _from, _to and predicate properties to have been set.
	 *
	 * @returns {String}|{null}	The edge _key, or null, if missing required fields.
	 */
	get key()
	{
		//
		// Ensure required fields.
		//
		if( this._document.hasOwnProperty( '_to' )
		 && this._document.hasOwnProperty( '_from' )
		 && this._document.hasOwnProperty( Dict.descriptor.kPredicate ) )
		{
			//
			// Collect hash fields.
			//
			const hash = [];
			hash.push( this._document._from );
			hash.push( this._document._to );
			hash.push( this._document[ Dict.descriptor.kPredicate ] );
			
			return crypto.md5( hash.join( "\t" ) );									// ==>
			
		}	// Has required key fields.
		
		return null;																// ==>
		
	}	// key
	
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
				'_to',						// Relationship destination.
				'_from',					// Relationship source.
				Dict.descriptor.kPredicate	// Relationship predicate.
			]
		];																			// ==>
		
	}	// significantFields
	
	/**
	 * Return list of required fields
	 *
	 * We overload this mathod to add the key and the significant fields.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return super.requiredFields
			.concat([
				'_key',						// The edge key.
				'_from',					// The source node reference.
				'_to',						// The destination node reference.
				Dict.descriptor.kPredicate	// The predicate reference.
			]);																		// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of locked fields
	 *
	 * We overload this mathod to add the significant fields.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				'_to',						// Relationship destination.
				'_from',					// Relationship source.
				Dict.descriptor.kPredicate	// Relationship predicate.
			]);																		// ==>
		
	}	// lockedFields
	
}	// NewEdge.

module.exports = NewEdge;
