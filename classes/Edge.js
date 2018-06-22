'use strict';

//
// Frameworks.
//
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
const Persistent = require( './Persistent' );


/**
 * Edge class
 *
 * This class implements the default edge object.
 *
 * The Edge class and its derivatives must have only one significant fields
 * combination, this combination contains the fields that are used to compute the
 * _key. These fields are also locked, which means that once the object is persistent
 * they cannot be changed.
 *
 * If one of the significant fields is missing when the _key is computed, the class
 * will raise an exception, so. in practice, these fields are also required and they
 * do not need to be included in the required fields.
 *
 * For this reason, the significant fields behave like the required fields, but the
 * raised error is of a different type.
 *
 * The class will also raise an exception if the _key is set and if the computed _key
 * differs, which means that effectively edges cannot have duplicates.
 *
 * The other custom behaviour is that edges are only resolved by _key: since there is
 * only one significant field combination and that combination represents the key
 * hash, edges are always resolved by reference; this also means that if the object
 * does not have all its significant fields, resolving the object will fail.
 *
 * The class adds a key() getter method that will return the edge _key, or null, if
 * any of the significant fields is missing.
 *
 * The class expects all required collections to exist.
 */
class Edge extends Persistent
{
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
			// Compute key.
			//
			const key = this.key;
			
			//
			// Check if not computed.
			//
			if( key !== null )
			{
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

			}	// Computed key.
			
			//
			// Raise exception if asserting.
			//
			if( doAssert )
				throw(
					new MyError(
						'ConstraintViolated',					// Error name.
						K.error.CannotMakeEdgeKey,				// Message code.
						this._request.application.language,		// Language.
						this.instance,							// Arguments.
						409										// HTTP error code.
					)
				);																// !@! ==>
			
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
		return Edge.isEdgeCollection(
								this._request,
								theCollection,
								doAssert
							);														// ==>
		
	}	// validateCollectionType
	
	
	/************************************************************************************
	 * PERSISTENCE METHODS																*
	 ************************************************************************************/
	
	/**
	 * Resolve document by content
	 *
	 * We overload this method to force resolving edges by key, this is because the
	 * key requires the correct properties and if these are not there it cannot be
	 * computed. Using the document contents might resolve the wrong type of edge, and
	 * is the replace flag is not set when setting the document properties, you might
	 * end up with an edge that looks like the right type, but it isn't.
	 *
	 * Here we compute the key, if that fails, it means the object is missing the
	 * required properties to resolve the edge, so in that case this method must fail.
	 *
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Object}|{null}			Resolved document or null.
	 */
	resolveDocumentByContent( doAssert = true )
	{
		//
		// Ensure significant fields are there.
		// If required properties are missing and doAssert is true,
		// the method will raise an exception.
		//
		if( Array.isArray( this.validateSignificantProperties( doAssert ) ) )
		{
			//
			// Compute key.
			//
			const key = this.key;
			if( key !== null )
				return resolveDocumentByReference( key, doAssert, false );			// ==>
			
			//
			// Prepare exception arguments.
			//
			const missing = [];
			for( const field of this.significantFields )
			{
				if( ! this._document.hasOwnProperty( field ) )
					missing.push( field );
			}
			
			//
			// Force exception, since it is a bug.
			//
			throw(
				new MyError(
					'IncompleteObject',					// Error name.
					K.error.MissingToResolve,			// Message code.
					this._request.application.language,	// Language.
					missing.join( ', ' ),				// Arguments.
					412									// HTTP error code.
				)
			);																	// !@! ==>
			
		}	// Has field to compute key.
		
		return null;																// ==>
		
	}	// resolveDocumentByContent
	
	
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
				'_from',					// Relationship source.
				'_to',						// Relationship destination.
				Dict.descriptor.kPredicate	// Relationship predicate.
			]
		];																			// ==>
		
	}	// significantFields
	
	/**
	 * Return list of locked fields
	 *
	 * We overload this method to add the significant fields to the locked fields,
	 * since, by default, significant fields should also be lopcked.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat(
				this.significantFields[ 0 ]
			);																		// ==>
		
	}	// lockedFields
	
	
	/************************************************************************************
	 * GETTER COMPUTED METHODS															*
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
	
}	// Edge.

module.exports = Edge;
