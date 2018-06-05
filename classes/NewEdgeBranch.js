'use strict';

//
// Frameworks.
//
const _ = require('lodash');
const db = require('@arangodb').db;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Parent.
//
const NewEdge = require( './NewEdge' );


/**
 * Branched edge class
 *
 * This class overloads the Edge class to implement a branched edge: branched edges
 * are edges that feature a required array parameter, 'branches', which contains a set
 * of document _id references which represent all the graph branches that pass through
 * the current edge, and 'modifiers', that contain overload values applying to
 * specific edge branches.
 *
 * This kind of edge is used when many different paths go through a single edge and it
 * is necessary to identify specific paths. For instance, in controlled vocabularies
 * you can use the same subset of paths in different controlled vocabularies: the
 * relationship between a country and a province may appear in the countries
 * constolled vocabulary, but you may also want it to appear in the locations
 * controlled vocabulary, rather than duplicating edges, we keep a single edge, but we
 * mark each path that traverses it, so that the number of edges is reduced and it
 * becomes possible to easily move gub-graphs around. The paths that traverse the
 * current edge are stored in the 'branches' property, which is an array of _id
 * references that mark the path: by following a specific reference in the graph, we
 * can traverse the graph using a specific path.
 *
 * Besides defining a relationship between two nodes, edges also hold information that
 * can be used to customise the significant node of the relationship: for instance in
 * forms, the label is first taken from the field, the edge may feature a label
 * property which will override the node's label in order to customise the message.
 * This kind of edge features a 'modifiers' property which is an object in which the
 * property names match the 'branches' values and the values are objects, the object
 * values override the corresponding node and edge values for the specific path marked
 * by the property name. This allows an edge to modify the properties of a node for
 * all paths except those that appear in 'modifiers'.
 *
 * This class behaves exactly as its ancestor, except that the branches and modifier
 * parameters are reserved: clients are only allowed to explicitly modify these
 * properties using a specific method interface, these properties will only be loaded
 * automatically when resolving the object. The following methods can be used to
 * manage branches:
 *
 * 	- branchSet:	Add or remove branches, this will update the branches property,
 * 					when removing branches, if there is a corresponding modifier
 * 					record, it will also be removed. If the branches list becomes
 * 					empty, the property will be deleted.
 * 	- modifierSet:	Add or remove modifier records, if no modifier records are left,
 * 					the property will be deleted.
 *
 * Once these two properties have been updated, you can use the inherited persistence
 * interface to save the document.
 *
 * When using this class, you will most often need to simply make changes in the
 * branches and modifier fields, leaving the rest of the object untouched, rather than
 * instantiating, resolving, modifying and replacing the object, this class provides
 * an additional static method that can be used to make these changes with one call:
 *
 * - BranchUpdate:	The method expects the same selector as the constructor, a
 * 					parameter that holds the branches to modify another parameter that
 * 					holds the modifiers to update and two boolean flags that indicate
 * 					whether we want to add or delete the corresponding entries.
 *
 * Since these two properties are reserved, when updating the object contents it will
 * be forbidden to set the above properties: these will be loaded only when resolving
 * the object.
 *
 * The class expects all required collections to exist.
 */
class NewEdgeBranch extends NewEdge
{
	/**
	 * Set document property
	 *
	 * We overload this method to handle the branches and modifiers: these two
	 * properties are reserved, if we are resolving, we allow changes, if not we raise
	 * an exception.
	 *
	 * @param theField		{String}	The property descriptor _key.
	 * @param theValue		{*}			The property value.
	 * @param isLocked		{Boolean}	True if locked properties.
	 * @param isResolving	{Boolean}	True, called by resolve().
	 */
	setDocumentProperty( theField, theValue, isLocked, isResolving )
	{
		//
		// Call parent method for all properties other than branches,
		// or if we are resolving the document.
		//
		if( isResolving
		 || (! [ Dict.descriptor.kBranches,
				 Dict.descriptor.kModifiers ].includes( theField )) )
			return super.setDocumentProperty(
				theField,
				theValue,
				isLocked,
				isResolving
			);																		// ==>
		
		throw(
			new MyError(
				'ReservedProperty',					// Error name.
				K.error.CannotManageBranches,		// Message code.
				this._request.application.language,	// Language.
				null,								// Arguments.
				412									// HTTP error code.
			)
		);																		// !@! ==>
		
	}	// setDocumentProperty
	
	
	/************************************************************************************
	 * PERSISTENCE METHODS																*
	 ************************************************************************************/
	
	/**
	 * replaceDocument
	 *
	 * We overload this method to handle the branches and modifiers: when removing
	 * branches, if the list becomes empty, the property is removed, a nranched edge
	 * without branches cannot exist, so we actually remove the edge.
	 *
	 * @param doRevision	{Boolean}	If true, check revision (default).
	 * @returns {Boolean}|{null}		True if replaced or null if not persistent.
	 */
	replaceDocument( doRevision = true )
	{
		//
		// Handle no more branches.
		//
		if( ! this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
			return this.removeDocument();											// ==>
		
		//
		// Call parent method.
		//
		return super.replaceDocument();												// ==>
		
	}	// replaceDocument
	
	
	/************************************************************************************
	 * BRANCHING METHODS																*
	 ************************************************************************************/
	
	/**
	 * Set branch
	 *
	 * This method can be used to add or remove branches, it expects the following
	 * parameters:
	 *
	 * 	- theBranch:	Either a string or an array of strings representing the
	 * 					branches to add or remove.
	 * 	- doAdd:		A boolean flag indicating whether we intend to add the
	 * 					branches, true, or remove them, false.
	 *
	 * The method will return the updated list ov branches, if the list becomes empty,
	 * the method will remove the property and return null. Note that a missing
	 * branches property will be caught when storing the edge, since that property is
	 * required.
	 *
	 * If you provide an empty array, the method will simply return the existing value.
	 *
	 * Note that the provided document reference will not be validated here, these
	 * will be checked when persisting the object.
	 *
	 * @param theBranch	{Array}|{String}	The branch to add or delete.
	 * @param doAdd		{Boolean}			If true, add branch, if false, delete it.
	 * @returns {Array}|{null}				The updated list of branches.
	 */
	branchSet( theBranch, doAdd )
	{
		//
		// Init local storage.
		//
		const bprop = Dict.descriptor.kBranches;
		
		//
		// Convert to array.
		//
		if( ! Array.isArray( theBranch ) )
			theBranch = [ theBranch ];
		
		//
		// Skip empty array.
		//
		if( theBranch.length > 0 )
		{
			//
			// Init local storage.
			//
			const mprop = Dict.descriptor.kModifiers;
			const has_branches = this._document.hasOwnProperty( bprop );
			
			//
			// Add branches.
			//
			if( doAdd )
			{
				//
				// Create property.
				//
				if( ! has_branches )
					this._document[ bprop ]
						= theBranch;
				
				//
				// Update property.
				//
				else
				{
					//
					// Add branches.
					//
					for( const item of theBranch )
					{
						if( ! this._document[ bprop ].includes( item ) )
							this._document[ bprop ].push( item );
					}
				}
				
			}	// Add branches.
			
			//
			// Remove branch.
			//
			else
			{
				//
				// Handle empty list.
				//
				if( ! has_branches )
					return null;													// ==>
				
				//
				// Remove branches and modifiers.
				//
				this._document[ bprop ] =
					this._document[ bprop ].filter(
						( item ) =>
						{
							//
							// Determine match.
							//
							const match = (! theBranch.includes( item ));
							
							//
							// Remove modifiers.
							//
							if( this._document.hasOwnProperty( mprop )
							 && this._document[ mprop ].hasOwnProperty( item ) )
								delete this._document[ mprop ][ item ];
							
							return match;
						}
					);
				
				//
				// Remove modifiers if empty.
				//
				if( this._document.hasOwnProperty( mprop )
				 && (Object.keys( this._document[ mprop ] ).length === 0) )
					delete this._document[ mprop ];
				
				//
				// Handle empty array.
				//
				if( this._document[ bprop ].length === 0 )
				{
					delete this._document[ bprop ];
					return null;													// ==>
				}
				
			}	// Delete branches.
			
		}	// Provided something.
		
		return this._document[ bprop ];												// ==>
		
	}	// branchSet
	
	/**
	 * Set modifier
	 *
	 * This method can be used to add or remove modifiers, it expects the following
	 * parameters:
	 *
	 * 	- theModifier:	An object where the property names represent the branches and
	 * 					the values are objects containing the modifier options.
	 * 	- doAdd:		A boolean flag indicating whether we intend to add the
	 * 					modifiers, true, or remove them, false.
	 *
	 * The method will return the updated list of modifiers, if the object becomes empty,
	 * the method will remove the property and return null.
	 *
	 * An alternative for removing modifiers is to set the provided property value to
	 * null, for this reason we provide a default value of true to doAdd.
	 *
	 * When providing false to doAdd, the value of the provided property object is not
	 * considered.
	 *
	 * If a provided modifier record does not match a branch, the branch will be added.
	 *
	 * If you provide an empty object, the method will simply return the current value.
	 *
	 * It must be noted that when adding modifiers, the corresponding branch will also
	 * be added; when removing modifiers, the branches will remain untouched: this is
	 * why we have two methods.
	 *
	 * Note that the provided branch references will not be validated here, these
	 * will be checked when persisting the object.
	 *
	 * @param theModifier	{Object}	The modifiers to add or delete.
	 * @param doAdd			{Boolean}	If true, add, if false, delete.
	 * @returns {Object}|{null}			The updated mofdifier records.
	 */
	modifierSet( theModifier, doAdd = true )
	{
		//
		// Init local storage.
		//
		const mprop = Dict.descriptor.kModifiers;
		
		//
		// Skip if provided object is empty.
		//
		if( Object.keys( theModifier ).length > 0 )
		{
			//
			// Init local storage.
			//
			let has_modifiers = this._document.hasOwnProperty( mprop );
			
			//
			// Add or delete modifiers.
			//
			if( doAdd )
			{
				//
				// Init local storage.
				//
				const bprop = Dict.descriptor.kBranches;
				let has_branches = this._document.hasOwnProperty( bprop );
				
				//
				// Iterate provided modifiers.
				//
				for( const reference in theModifier )
				{
					//
					// Add record.
					//
					if( theModifier[ reference ] !== null )
					{
						//
						// Init modifiers.
						//
						if( ! has_modifiers )
						{
							this._document[ mprop ] = {};
							has_modifiers = true;
						}
						
						//
						// Add modifier.
						//
						this._document[ mprop ][ reference ] = theModifier[ reference ];
						
						//
						// Add branch.
						//
						if( (! has_branches)
						 || (! this._document[ bprop ].includes( reference )) )
						{
							//
							// Init branches.
							//
							if( ! has_branches )
							{
								this._document[ bprop ] = [];
								has_branches = true;
							}
							
							//
							// Set branch.
							//
							this._document[ bprop ].push( reference );
						}
					
					}	// Provided a record.
					
					//
					// Delete record.
					//
					else
					{
						//
						// Assert modifiers.
						//
						if( has_modifiers )
						{
							//
							// Check branch record.
							//
							if( this._document[ mprop ].hasOwnProperty( reference ) )
							{
								//
								// Delete record.
								//
								delete this._document[ mprop ][ reference ];
								
								//
								// Delete property.
								//
								if( Object.keys( this._document[ mprop ] ).length === 0 )
								{
									delete this._document[ mprop ];
									return null;									// ==>
								}
							}
						
						}	// Has modifiers.
					
					}	// Provided null.
					
				}	// Iterating provided modifiers.
			
			}	// Add or delete modifiers.
			
			//
			// Remove modifiers.
			//
			else
			{
				//
				// Skip if no modifiers.
				//
				if( ! has_modifiers )
					return null;													// ==>
				
				//
				// Iterate provided modifiers.
				//
				for( const reference in theModifier )
				{
					//
					// Check branch record.
					//
					if( this._document[ mprop ].hasOwnProperty( reference ) )
					{
						//
						// Delete record.
						//
						delete this._document[ mprop ][ reference ];
						
						//
						// Delete property.
						//
						if( Object.keys( this._document[ mprop ] ).length === 0 )
						{
							delete this._document[ mprop ];
							return null;											// ==>
						}
					}
					
				}	// Iterating provided modifiers.
			
			}	// Remove modifiers.
			
		}	// Provided something.
		
		return this._document[ mprop ];												// ==>
		
	}	// modifierSet
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Return list of required fields
	 *
	 * We overload this mathod to add the branches list.
	 *
	 * @returns {Array}	List of required fields.
	 */
	get requiredFields()
	{
		return super.requiredFields
			.concat([
				Dict.descriptor.kBranches	// The branches list.
			]);																		// ==>
		
	}	// requiredFields
	
}	// NewEdgeBranch.

module.exports = NewEdgeBranch;
