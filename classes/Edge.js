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
			// Check if significant fields are there.
			// This should fail if any of the fields
			// required to compute the key
			// are missing.
			//
			if( this.validateSignificantProperties( doAssert ) !== false )
			{
				//
				// Compute key.
				//
				const key = this.key;
				
				//
				// Check if computed.
				//
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
	 * Edges must contain only one set of significant fields which are then used to
	 * compute the document key, for this reason we overload this method to use the
	 * computed reference for resolving the document.
	 *
	 * This method is only called when explicitly resolving the document, if you
	 * provide an object as the constructor reference, the document will not be
	 * resolved by default.
	 *
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Object}|{null}			Resolved document or null.
	 */
	resolveDocumentByContent( doAssert = true )
	{
		//
		// Get significant fields combination.
		// Check if has significant fields and resolve.
		// We have already checked that all necessary fields are there.
		// Persistent flag is managed by method.
		// If not found method returns null or raises an exception.
		//
		if( this.validateSignificantProperties( doAssert ) !== false )
			return this.resolveDocumentByReference(
				this.key,							// Computed key.
				doAssert,							// Provided assert flag.
				false								// Get a mutable object.
			);																		// ==>
		
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
