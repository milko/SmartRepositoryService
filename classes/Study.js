'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );

//
// Classes.
//
const Edge = require( './Edge' );

//
// Parent.
//
const Identified = require( './Identified' );


/**
 * Study class
 *
 * This class extends the Identified class to implement a Study object, it adds the
 * document descriptor statistics field, doc_desc.
 *
 * This field is used to have a the list of descriptors used in the current document
 * that can be used for query purposes.
 */
class Study extends Identified
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
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we overload this method to collect the list of leaf descriptors
	 * and the list of descriptor paths used in the current document.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseInsertProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		const result = super.normaliseInsertProperties( doAssert );
		if( result )
			this._document[ Dict.descriptor.kDocDesc ] =
				this.computeDescriptorPaths();
		
		return result;																// ==>
		
	}	// normaliseInsertProperties
	
	/**
	 * Normalise replace properties
	 *
	 * This method should load any default properties set when replacing the object.
	 *
	 * In this class we compute the current descriptor paths and compare them with the
	 * old ones, the method will save the count differences in the object _diffs local
	 * member.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseReplaceProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		const result = super.normaliseReplaceProperties( doAssert );
		if( result )
		{
			//
			// Clone current stats.
			//
			const previous = K.function.clone( this._document[ Dict.descriptor.kDocDesc ] );
			const current = this.computeDescriptorPaths();
			
			//
			// Set differences in object.
			//
			this.computeDescriptorPathsDiffs( previous, current );
			
			//
			// Update field.
			//
			this._document[ Dict.descriptor.kDocDesc ] = current;
			
		}	// Parent method succeeded.
		
		return result;																// ==>
		
	}	// normaliseReplaceProperties
	
	
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
	
	/**
	 * Return local fields list
	 *
	 * This method should return an array containing all fields that should be
	 * stripped from the document when resolving its contents with
	 * resolveDocumentByContent().
	 *
	 * In this class we remove the descriptor paths property.
	 *
	 * @returns {Array}	The list of local fields.
	 */
	get localFields()
	{
		return super.localFields
			.concat([
				Dict.descriptor.kDocDesc	// Descriptors paths.
			]);																		// ==>
		
	}	// localFields
	
	
}	// Study.

module.exports = Study;
