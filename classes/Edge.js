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
	
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we set the creation time stamp.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseInsertProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.normaliseInsertProperties( doAssert ) )
		{
			//
			// Set creation time stamp.
			//
			this._document[ Dict.descriptor.kCStamp ] = Date.now();
			
			return true;															// ==>
		}
		
		return false;																// ==>
		
	}	// normaliseInsertProperties
	
	/**
	 * Normalise replace properties
	 *
	 * This method should load any default properties set when replacing the object.
	 *
	 * In this class we set the modification time stamp.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseReplaceProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.normaliseReplaceProperties( doAssert ) )
		{
			//
			// Set creation time stamp.
			//
			this._document[ Dict.descriptor.kMStamp ] = Date.now();
			
			return true;															// ==>
		}
		
		return false;																// ==>
		
	}	// normaliseReplaceProperties
	
	
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
		return Document.isEdgeCollection(
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
		if( Array.isArray( validateSignificantProperties( doAssert ) ) )
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
	
	
	/************************************************************************************
	 * DEFAULT GLOBALS																	*
	 ************************************************************************************/
	
	/**
	 * Return local fields list
	 *
	 * We overload this method to add the time stamps.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get localFields()
	{
		return super.localFields
			.concat([
				Dict.descriptor.kCStamp,	// Creation time stamp.
				Dict.descriptor.kMStamp		// Modivifation time stamp.
			]);																		// ==>
		
	}	// localFields
	
	
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
