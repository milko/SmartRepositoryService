'use strict';

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );

//
// Classes.
//
const Edge = require( './Edge' );
const Transaction = require( './Transaction' );

//
// Parent.
//
const Term = require( './Term' );


/**
 * Study class
 *
 * This class extends the Persistent class by adding the global identifier property,
 * The local and global identifier properties are required, the namespace identifier
 * is optional.
 */
class Study extends Term
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
		this._instance = 'Study';
		
	}	// initDocumentMembers
	
	
	/************************************************************************************
	 * CORE PERSISTENCE METHODS															*
	 ************************************************************************************/
	
	/**
	 * Insert
	 *
	 * This method will insert the document into the database, it expects the current
	 * object to have the collection reference.
	 *
	 * The method exists in order to concentrate in one place database operations,
	 * this allows derived objects to implement transactions where required.
	 *
	 * The method should be called after validation and normalisation operations, this
	 * means that if the doPersist flag is off this method should not be called.
	 *
	 * The method should return the database operation result.
	 *
	 * In this class we overload this method to first store the study, then create the
	 * link with the user who registered it; if anything goes wrong, the operation
	 * will manually be reversed.
	 *
	 * @returns {Object}			The inserted document metadata.
	 */
	doInsert()
	{
		//
		// Call parent method.
		//
		const meta = super.doInsert();
		
		//
		// Create user relationship.
		// We have current object _id and user from request.
		//
		const selector = { _from: meta._id, _to: this._request.session.uid, };
		selector[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateRegisteredBy}`;
		
		//
		// Create user relationship.
		//
		const edge =
			new Edge(
				this._request,
				selector,
				this.defaultEdgeCollection
			);
		
		//
		// Try to insert relationship.
		//
		try
		{
			//
			// Insert edge.
			//
			edge.insertDocument( true );
			
			return meta;															// ==>
		}
		catch( error )
		{
			//
			// Remove study.
			//
			db._remove( meta );
			
			throw( error );														// !@! ==>
		}
	
	}	// doInsert
	
	
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
	 * We overload this method to return the studies collection.
	 *
	 * @returns {String}|{null}	The default collection name.
	 */
	get defaultCollection()
	{
		return 'studies';															// ==>
		
	}	// defaultCollection
	
	/**
	 * Return default edge collection name
	 *
	 * We implement this method to return the edge collection name used for user
	 * relationskips.
	 *
	 * @returns {String}|{null}	The default edge collection name.
	 */
	get defaultEdgeCollection()
	{
		return 'hierarchy';															// ==>
		
	}	// defaultEdgeCollection
	
	
}	// Study.

module.exports = Study;
