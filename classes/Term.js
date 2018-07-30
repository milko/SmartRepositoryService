'use strict';

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );

//
// Parent.
//
const Identified = require( './Identified' );


/**
 * Term class
 *
 * This class extends the Identified class by setting the document instance, the
 * default collection and by asserting the collection to be of document type.
 */
class Term extends Identified
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
		// Set term instance.
		//
		this._instance = 'Term';
		
	}	// initDocumentMembers
	
	
	/************************************************************************************
	 * VALIDATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Validate collection type
	 *
	 * In this class we assert the collection to be of type document.
	 *
	 * @param theCollection	{String}	The collection name.
	 * @param doAssert		{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}				True if all required fields are there.
	 */
	validateCollectionType( theCollection, doAssert = true )
	{
		return Term.isDocumentCollection(
			this._request,
			theCollection,
			doAssert
		);																			// ==>
		
	}	// validateCollectionType
	
	
	/************************************************************************************
	 * DEFAULT GLOBALS																	*
	 ************************************************************************************/
	
	/**
	 * Return default collection name
	 *
	 * This method should return the default collection name: if documents of this
	 * class belong to a specific collection, this method should return its name; if
	 * documents of this class may be stored in different collectons, this method
	 * should return null.
	 *
	 * We overload this method to return the terms collection.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get defaultCollection()
	{
		return 'terms';																// ==>
		
	}	// defaultCollection

	
}	// Term.

module.exports = Term;
