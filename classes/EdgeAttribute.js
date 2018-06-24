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
const Edge = require( './Edge' );


/**
 * Attribute edge class
 *
 * This class overloads the Edge class to implement an attribute edge: attribute edges
 * behave like the parent class, except that they add an attribute property which
 * contributes to the object key and its identification.
 *
 * The attribute property is an array of terms that once set cannot be modified.
 * Before inserting the object, these attributes are sorted, so that reconstituting an
 * existing attribute will always produce the same sequence of values.
 *
 * The edge key is computed by hashing the _from, _to and predicate and the flattened
 * contents of the attributes property.
 *
 * The class expects all required collections to exist.
 */
class EdgeAttribute extends Edge
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
		this._instance = 'EdgeAttribute';
		
	}	// initDocumentMembers
	
	
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise document properties
	 *
	 * The method is called at the end of the constructor and before validating the
	 * contents of the document.
	 *
	 * In the first case, if the document is persistent and the attributes are
	 * missing, this means that the instantiated document is not of the attribute edge
	 * type and an exception will be raised accordingly.
	 *
	 * In the second case, the current edge cannot be stored, since it lacks the required
	 * attributes property: in that case we do nothing and we let the parent method
	 * fail since it is unable to compute the key.
	 *
	 * Before making this check we ensure the attributes array is not empty, if that
	 * is the case, we delete the property.
	 *
	 * Only after making this check we then call the parent method that will compute
	 * the edge key.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseDocumentProperties( doAssert = true )
	{
		//
		// Remove attributes if empty.
		//
		if( this._document.hasOwnProperty( Dict.descriptor.kAttributes )
		 && (this._document[ Dict.descriptor.kAttributes ].length === 0) )
			delete this._document[ Dict.descriptor.kAttributes ];
		
		//
		// Assert attributes in persistent object.
		// This will catch instantiating an edge of the wrong type.
		//
		if( this._persistent
		 && (! this._document.hasOwnProperty( Dict.descriptor.kAttributes )) )
			throw(
				new MyError(
					'ConstraintViolated',				// Error name.
					K.error.NotAttributeEdge,			// Message code.
					this._request.application.language,	// Language.
					[
						this._document._from,
						this._document[ Dict.descriptor.kPredicate ],
						this._document._to
					],
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
		//
		// Call parent method.
		//
		return super.normaliseDocumentProperties( doAssert );						// ==>
		
	}	// normaliseDocumentProperties
	
	
	/************************************************************************************
	 * ASSERTIONS METHODS																*
	 ************************************************************************************/
	
	/**
	 * Match locked property
	 *
	 * We overload this method to match the contents of the attributes property: since
	 * it is an array, even if the contents are the same, the identity match will
	 * fail, so we match their stringified bersion.
	 *
	 * @param theProperty	{String}	Property name.
	 * @param theExisting	{*}			Existing value.
	 * @param theProvided	{*}			Provided value.
	 * @returns {Boolean}				True if identical.
	 */
	matchPropertyValue( theProperty, theExisting, theProvided )
	{
		//
		// Trap attributes.
		//
		if( theProperty === Dict.descriptor.kAttributes )
		{
			//
			// Sort values.
			//
			if( Array.isArray( theExisting )
				&& (theExisting.length > 0) )
				theExisting.sort();
			
			if( Array.isArray( theProvided )
				&& (theProvided.length > 0) )
				theProvided.sort();
			
			return (JSON.stringify(theExisting) === JSON.stringify(theProvided));	// ==>
		}
		
		return super.matchPropertyValue( theProperty, theExisting, theProvided );	// ==~
		
	}	// matchPropertyValue
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of significant fields
	 *
	 * We overload the parent method to add the attributes property.
	 *
	 * @returns {Array}	List of significant fields.
	 */
	get significantFields()
	{
		return super.significantFields
			.concat([
				Dict.descriptor.kAttributes	// The attributes list.
			]);																		// ==>
		
	}	// significantFields
	
	/**
	 * Return list of locked fields
	 *
	 * We overload the parent method to add the attributes property.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				Dict.descriptor.kAttributes	// The attributes list.
			]);																		// ==>
		
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
	 * This class expects the _from, _to, predicate and attribute properties; it will
	 * sort the attributes property before computing the key.
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
		 && this._document.hasOwnProperty( Dict.descriptor.kPredicate )
		 && this._document.hasOwnProperty( Dict.descriptor.kAttributes )
		 && (this._document[ Dict.descriptor.kAttributes ].length > 0) )
		{
			//
			// Collect main fields.
			//
			const hash = [];
			hash.push( this._document._from );
			hash.push( this._document._to );
			hash.push( this._document[ Dict.descriptor.kPredicate ] );
			
			//
			// Sort attributes.
			//
			this._document[ Dict.descriptor.kAttributes ].sort();
			
			return(
				crypto.md5(
					hash.concat(
						this._document[ Dict.descriptor.kAttributes ]
					).join( "\t" )
				)
			);																		// ==>
			
		}	// Has required key fields.
		
		return null;																// ==>
		
	}	// key
	
}	// EdgeAttribute.

module.exports = EdgeAttribute;
