'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;

//
// Application.
//
const Dict = require( '../dictionary/Dict' );
const Dictionary = require( '../utils/Dictionary' );

//
// Parent.
//
const Persistent = require( './Persistent' );


/**
 * Identifier class
 *
 * This class extends the Persistent class by adding the global identifier property,
 * The local and global identifier properties are required, the namespace identifier
 * is optional.
 */
class Identifier extends Persistent
{
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Normalise document properties
	 *
	 * This method should finalise the contents of the document, such as setting
	 * eventual missing default values or computing dynamic properties.
	 *
	 * The provided parameter is a flag that determines whether errors raise
	 * exceptions or not, it is set to true by default.
	 *
	 * The method is called at the end of the constructor and before validating the
	 * contents of the document: in the first case the doAssert flag is set to the
	 * value of the persistent flag, which means that if this method fails, an
	 * exception will be raised if the object is persistent, while if the object is
	 * not persistent it may still not have all of its fields; in the second case, the
	 * method should raise an exception according to the value of doAssert passed to
	 * the caller method.
	 *
	 * In this class we compute the global identifier. When called by the constructor,
	 * the assert parameter is set to the value of the persistent flag, when called
	 * when inserting and replacing, the flag is by default on.
	 *
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if valid.
	 */
	normaliseDocumentProperties( doAssert = true )
	{
		//
		// Call parent method.
		//
		if( super.normaliseDocumentProperties( doAssert ) )
		{
			//
			// Compute the global identifier.
			// Will raise an exception if it is unable to compute (doAssert).
			//
			const gid =
				Dictionary.compileGlobalIdentifier(
					this._request, this._document, doAssert
				);
			
			//
			// Set global identifier.
			//
			if( gid !== null )
			{
				//
				// Set global identifier.
				//
				this._document[ Dict.descriptor.kGID ] = gid;
				
				return true;														// ==>
				
			}	// Resolved global identifier.
			
		}	// Parent method passed.
		
		return false;																// ==>
		
	}	// normaliseDocumentProperties
	
	
	/************************************************************************************
	 * VALIDATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Match significant fields combination
	 *
	 * Significant fields are a combination of one or more fields whose values will
	 * uniquely identify the document. The method will iterate these combinations and
	 * return the first one in which all properties can be found in the current document.
	 *
	 * We overload this method to compute the global identifier if the object is not
	 * persistent and the global identifier is missing.
	 *
	 * @param doAssert	{Boolean}		True raises an exception on error (default).
	 * @returns {Array}|{false}|{null}	Array if there is a match.
	 */
	validateSignificantProperties( doAssert = true )
	{
		//
		// Check global identifier and assert not persistent.
		//
		if( (! this._persistent)
		 && (! this._document.hasOwnProperty( Dict.descriptor.kGID )) )
		{
			//
			// Compute the global identifier.
			// Will raise an exception if it is unable to compute (doAssert).
			//
			const gid =
				Dictionary.compileGlobalIdentifier(
					this._request, this._document, doAssert
				);
			
			//
			// Set global identifier.
			//
			if( gid !== null )
				this._document[ Dict.descriptor.kGID ] = gid;
		}
		
		return super.validateSignificantProperties( doAssert );						// ==>
		
	}	// validateSignificantProperties
	
	
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
	 * We overload this method to add the namespace instance to the namespace document.
	 *
	 * Note that transactions will be activated by default.
	 *
	 * @param theTransaction	{Transaction}|{null}	The transaction object.
	 * @returns {Object}								The inserted document metadata.
	 */
	doInsert( theTransaction = null )
	{
		//
		// Call parent method.
		//
		const meta = super.doInsert( theTransaction );
		
		//
		// Handle namespace.
		//
		if( this._document.hasOwnProperty( Dict.descriptor.kNID ) )
		{
			//
			// Init local storage.
			//
			const nid = this._document[ Dict.descriptor.kNID ];
			const nid_parts = nid.split( '/' );
			const nid_collection = nid_parts[ 0 ];
			const nid_key = nid_parts[ 1 ];
			const data = {};
			data[ Dict.descriptor.kInstances ] = Dict.term.kInstanceNamespace;
			
			//
			// Handle transaction.
			//
			if( theTransaction !== null )
				theTransaction.addOperation(
					'AS',								// Operation code.
					nid_collection,						// Collection name.
					{ _key : nid_key },					// Selector.
					data,								// Data.
					false,								// waitForSync.
					false,								// Use result.
					false								// Stop after.
				);
			
			//
			// Handle without transaction.
			//
			else
			{
				const collection = db._collection( nid_collection );
				
				db._query( aql`
					FOR doc IN ${collection}
						FILTER doc._id == ${nid}
					UPDATE doc WITH {
						${Dict.descriptor.kInstances} :
							APPEND(
								doc.${Dict.descriptor.kInstances},
								${[ Dict.term.kInstanceNamespace ]},
								true
							)
					} IN ${collection}
				`);
			}
		}
		
		return meta;																// ==>
		
	}	// doInsert
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of required fields
	 *
	 * This method should return the list of required properties.
	 *
	 * In this class we return the local identifier and the global identifier.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return super.requiredFields
			.concat([
				Dict.descriptor.kLID,		// Local identifier.
				Dict.descriptor.kGID		// Global identifier.
			]);																		// ==>
		
	}	// requiredFields
	
	/**
	 * Return list of unique fields
	 *
	 * This method should return the list of unique properties.
	 *
	 * In this class we return the global identifier.
	 *
	 * @returns {Array}	List of unique fields.
	 */
	get uniqueFields()
	{
		return super.uniqueFields
			.concat([
				Dict.descriptor.kGID		// Global identifier.
			]);																		// ==>
		
	}	// uniqueFields
	
	/**
	 * Return list of locked fields
	 *
	 * This method should return the list of fields that cannot be changed once the
	 * document has been inserted.
	 *
	 * In this class we return the namespace, local and global identifiers.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				Dict.descriptor.kNID,		// Namespace identifier.
				Dict.descriptor.kLID,		// Local identifier.
				Dict.descriptor.kGID		// Global identifier.
			]);																		// ==>
		
	}	// lockedFields
	
	/**
	 * Return list of significant fields
	 *
	 * This method should return the list of properties that will uniquely identify
	 * the document, it is used when resolving a document from an object.
	 *
	 * In this class we add the global identifier.
	 *
	 * @returns {Array}	List of significant fields.
	 */
	get significantFields()
	{
		return super.significantFields
			.concat([
				[ Dict.descriptor.kGID ]	// Global identifier.
			]);																		// ==>
		
	}	// significantFields
	
}	// Identifier.

module.exports = Identifier;
