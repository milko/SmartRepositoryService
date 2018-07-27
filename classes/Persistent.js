'use strict';

//
// Application.
//
const Dict = require( '../dictionary/Dict' );
const Dictionary = require( '../utils/Dictionary' );

//
// Parent.
//
const Document = require( './Document' );


/**
 * Persistent class
 *
 * This  class extends the document class by adding the creation and modification time
 * stamps when the object persists in the database.
 */
class Persistent extends Document
{
	/**
	 * Normalise insert properties
	 *
	 * This method should load any default properties set when inserting the object.
	 *
	 * In this class we set the creation time stamp and delete the eventual
	 * modification time stamp.
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
		if( result === true )
		{
			//
			// Set creation time stamp.
			//
			this._document[ Dict.descriptor.kCStamp ] = Date.now();
			
			//
			// Delete modification time stamp.
			//
			if( this._document.hasOwnProperty( Dict.descriptor.kMStamp ) )
				delete this._document[ Dict.descriptor.kMStamp ];
			
			return true;															// ==>
		}
		
		return result;																// ==>
		
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
		const result = super.normaliseInsertProperties( doAssert );
		if( result === true )
		{
			//
			// Set modification time stamp.
			//
			this._document[ Dict.descriptor.kMStamp ] = Date.now();
			
			return true;															// ==>
		}
		
		return result;																// ==>
		
	}	// normaliseReplaceProperties
	
	/**
	 * Compute descriptor paths
	 *
	 * This method can be used to compute the document descriptor instances structure,
	 * doc_desc, it will return the computed structure.
	 *
	 * This method should not fail.
	 *
	 * @returns {Object}			The document descriptor instances stats record.
	 */
	computeDescriptorPaths()
	{
		//
		// Init local storage.
		//
		const deleted = [];
		const stats = { _fields : [] };
		const excluded = Dictionary.listIgnoredPathProperties;
		
		//
		// Compute leaf path descriptor instances.
		//
		this._paths.forEach( path => {
			const parts = path.split( '.' );
			const part = parts[ parts.length - 1 ];
			
			if( (! excluded.includes( part ))
			 && (! stats._fields.includes( part )) )
				stats._fields.push( part );
			else
				deleted.push( path );
		});
		
		//
		// Remove ignored descriptors from paths.
		//
		this._paths = this._paths.filter( path => ! deleted.includes( path ) );
		
		//
		// Save paths.
		//
		stats._paths = this._paths;
		
		return stats;																// ==>
		
	}	// computeDescriptorPaths
	
	/**
	 * Compute descriptor paths difference
	 *
	 * This method can be used to compute the difference between the existing
	 * descriptor paths and the current ones, it will set the current object's _diffs
	 * data member with the the difference as an object whose property names
	 * correspond to descriptor keys and the values correspond to the difference
	 * count, negative if the descriptor was removed or positive if it was added.
	 *
	 * This method should not fail.
	 *
	 * @param theOld	{Object}	Old descriptor stats.
	 * @param theNew	{Object}	New descriptor stats.
	 */
	computeDescriptorPathsDiffs( theOld, theNew )
	{
		//
		// Init data member.
		//
		this._diffs = {};
		
		//
		// Compute removals.
		//
		for( let path of theOld._paths )
		{
			//
			// Handle deleted element.
			//
			if( ! theNew._paths.includes( path ) )
			{
				//
				// Compute field.
				//
				const parts = path.split( '.' );
				const part = parts[ parts.length - 1 ];
				
				//
				// Init field element.
				//
				if( ! this._diffs.hasOwnProperty( part ) )
					this._diffs[ part ] = -1;
				
				//
				// Update difference.
				//
				else
					this._diffs[ part ]--;
				
			}	// Removed.
			
		}	// Iterating old paths.
		
		//
		// Compute additions.
		//
		for( let path of theNew._paths )
		{
			//
			// Handle deleted element.
			//
			if( ! theOld._paths.includes( path ) )
			{
				//
				// Compute field.
				//
				const parts = path.split( '.' );
				const part = parts[ parts.length - 1 ];
				
				//
				// Init field element.
				//
				if( ! this._diffs.hasOwnProperty( part ) )
					this._diffs[ part ] = 1;
				
				//
				// Update difference.
				//
				else
					this._diffs[ part ]++;
				
			}	// Added.
			
		}	// Iterating new paths.
		
	}	// computeDescriptorPathsDiffs
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of locked fields
	 *
	 * In this class we lock the creation time stamp.
	 *
	 * @returns {Array}	List of locked fields.
	 */
	get lockedFields()
	{
		return super.lockedFields
			.concat([
				Dict.descriptor.kCStamp		// Creation time stamp.
			]);																		// ==>
		
	}	// lockedFields
	
	
	/************************************************************************************
	 * DEFAULT GLOBALS																	*
	 ************************************************************************************/
	
	/**
	 * Return local fields list
	 *
	 * This method should return an array containing all fields that should be
	 * stripped from the document when resolving its contents with
	 * resolveDocumentByContent().
	 *
	 * In this class we remove the creation and modification time stamps.
	 *
	 * @returns {Array}	The list of local fields.
	 */
	get localFields()
	{
		return super.localFields
			.concat([
				Dict.descriptor.kCStamp,	// Creation time stamp.
				Dict.descriptor.kMStamp		// Modification time stamp.
			]);																		// ==>
		
	}	// localFields
	
}	// Persistent.

module.exports = Persistent;
