'use strict';

//
// Frameworks.
//
const _ = require('lodash');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
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
const Document = require( './NewDocument' );
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
 * The class also provides two getters, branches and modifiers, which return the
 * respective properties of the object, or null, if not there.
 *
 * The class adds a flag getter, branched, that returns true if the object is not
 * persistent, or if the object is persistent and has the branches property: this can
 * be used to check if a resolved edge is indeed a branched edge.
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
	 * Constructor
	 *
	 * We overload the constructor to set the branched data member if resolved and to
	 * assert that the current edge, if resolved, is indeed branched: in this last
	 * case, the method will raise an exception.
	 *
	 * @param theRequest	{Object}					The current request.
	 * @param theReference	{String}|{Object}|”null}	The document reference or object.
	 * @param theCollection	{String}|{null}				The document collection.
	 * @param isImmutable	{Boolean}					True, instantiate immutable document.
	 */
	constructor(
		theRequest,
		theReference = null,
		theCollection = null,
		isImmutable = false )
	{
		//
		// Call parent method.
		//
		super( theRequest, theReference, theCollection, isImmutable );
		
		//
		// Handle persistent object.
		//
		if( this._persistent )
		{
			//
			// Check if branched.
			//
			if( ! this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
				throw(
					new MyError(
						'ConstraintViolated',				// Error name.
						K.error.NotBranchedEdge,			// Message code.
						this._request.application.language,	// Language.
						[
							this._document._from,
							this._document[ Dict.descriptor.kPredicate ],
							this._document._to
						],
						412									// HTTP error code.
					)
				);																// !@! ==>
				
			//
			// Set branched flag.
			//
			this._branched = true;
		}
		
	}	// constructor
	
	
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
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
	 * Resolve document
	 *
	 * We overload this method to set the branched flag data member and return false
	 * or raise an exception if the resolved edge is not branched.
	 *
	 * @param doReplace	{Boolean}	Replace existing data (false is default).
	 * @param doAssert	{Boolean}	True raises an exception on error (default).
	 * @returns {Boolean}			True if resolved.
	 */
	resolveDocument( doReplace = false, doAssert = true )
	{
		//
		// Call parent method.
		// Parent returns the persistent status.
		//
		const result = super.resolveDocument( doReplace, doAssert );
		if( result )
		{
			//
			// Check if branched.
			//
			if( ! this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
			{
				//
				// Raise exception.
				//
				if( doAssert )
					throw(
						new MyError(
							'ConstraintViolated',				// Error name.
							K.error.NotBranchedEdge,			// Message code.
							this._request.application.language,	// Language.
							[
								this._document._from,
								this._document[ Dict.descriptor.kPredicate ],
								this._document._to
							],
							412									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Set branched flag.
				//
				this._branched = false;
				
				return false;														// ==>
			}
			
			//
			// Set branched flag.
			//
			this._branched = true;
			
		}
		
		return result;																// ==>
		
	}	// resolveDocument
	
	/**
	 * replaceDocument
	 *
	 * We overload this method to handle branches: if after updating the list of
	 * branches, the list becomes empty, the branches property will be deleted. This
	 * means that no paths traverse the current edge, so instead of replacing the edge
	 * we remove it. In this case the method returns the result of removeDocument().
	 *
	 * Note that the operation will only perform if the current object is persistent,
	 * you must always remember to resolve the object, if not already done, before
	 * calling this method.
	 *
	 * @param doRevision	{Boolean}	If true, check revision (default).
	 * @returns {Boolean}|{null}		True if replaced or null if not persistent.
	 */
	replaceDocument( doRevision = true )
	{
		//
		// Prevent replacing non persistent objects.
		// We check this here to catch eventual blunders.
		//
		if( this._persistent )
		{
			//
			// Handle no more branches.
			//
			if( ! this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
				return this.removeDocument();										// ==>
			
			//
			// Call parent method.
			//
			return super.replaceDocument();											// ==>
			
		}	// Document is persistent.
		
		throw(
			new MyError(
				'ReplaceDocument',					// Error name.
				K.error.IsNotPersistent,			// Message code.
				this._request.application.language,	// Language.
				null,								// Arguments.
				409									// HTTP error code.
			)
		);																		// !@! ==>
		
	}	// replaceDocument
	
	/**
	 * Remove document
	 *
	 * We overload this method to reset the branched flag data member.
	 *
	 * @returns {Boolean}|{null}	True removed, false not found, null not persistent.
	 */
	removeDocument()
	{
		//
		// Prevent replacing non persistent objects.
		// We check this here to catch eventual blunders.
		//
		if( this._persistent )
		{
			//
			// Call parent method.
			// Parent returns the persistent status.
			//
			const result = super.removeDocument();
			if( result === true )
				delete this._branched;
			
			return result;															// ==>
			
		}	// Document is persistent.
		
		throw(
			new MyError(
				'RemoveDocument',					// Error name.
				K.error.IsNotPersistent,			// Message code.
				this._request.application.language,	// Language.
				null,								// Arguments.
				409									// HTTP error code.
			)
		);																		// !@! ==>
		
	}	// removeDocument
	
	
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
	 * Note that the provided document references will not be validated here, these
	 * will be checked when persisting the object.
	 *
	 * This method calls the SetBranch() static method, because the functionality is
	 * needed both by member and static methods.
	 *
	 * @param theBranch	{Array}|{String}	The branch to add or delete.
	 * @param doAdd		{Boolean}			If true, add branch, if false, delete it.
	 * @returns {Array}|{null}				The updated list of branches.
	 */
	branchSet( theBranch, doAdd )
	{
		//
		// Use static method.
		//
		return NewEdgeBranch.SetBranch( this._document, theBranch, doAdd );			// ==>
		
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
	 * This method calls the SetModifier() static method, because the functionality is
	 * needed both by member and static methods.
	 *
	 * @param theModifier	{Object}	The modifiers to add or delete.
	 * @param doAdd			{Boolean}	If true, add, if false, delete.
	 * @returns {Object}|{null}			The updated mofdifier records.
	 */
	modifierSet( theModifier, doAdd = true )
	{
		//
		// Use static method.
		//
		return NewEdgeBranch.SetModifier( this._document, theModifier, doAdd );		// ==>
		
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
	
	/**
	 * Return true if branched or not yet persistent
	 *
	 * This method serves the purpose of asserting whether the current edge is
	 * branched: it will return true if the object is persistent and has branches,
	 * false if the resolved object did not have branches and null, if the object is
	 * not yet persistent.
	 *
	 * Note that this value is set once the edge has been resolved, which means that
	 * you can check its value even after adding the branches.
	 *
	 * @returns {Boolean}|{null}	True branched, false not, null not persistent.
	 */
	get branched()
	{
		//
		// Check object member.
		// Note that if the member exists it means the object is persistent.
		//
		if( this.hasOwnProperty( '_branched' ) )
			return this._branched;													// ==>
		
		return null;																// ==>
		
	}	// branched
	
	/**
	 * Return current branches
	 *
	 * This method will return the current list of branches, or null, if not there.
	 *
	 * @returns {Array}|{null}	Branches list or null if no branches.
	 */
	get branches()
	{
		if( this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
			return this._document[ Dict.descriptor.kBranches ];						// ==>
		
		return null;																// ==>
		
	}	// branches
	
	/**
	 * Return current modifiers
	 *
	 * This method will return the current modifier records, or null, if not there.
	 *
	 * @returns {Object}|{null}	Modifier records or null if no modifiers.
	 */
	get modifiers()
	{
		if( this._document.hasOwnProperty( Dict.descriptor.kModifiers ) )
			return this._document[ Dict.descriptor.kModifiers ];					// ==>
		
		return null;																// ==>
		
	}	// modifiers
	
	
	/************************************************************************************
	 * STATIC INTERFACE																	*
	 ************************************************************************************/
	
	/**
	 * Update branches and modifiers
	 *
	 * This method can be used to add or remove branches and modifiers from the
	 * persistent copy of the edge in the database, it expects the following parameters:
	 *
	 * 	- theRequest:		The current service request.
	 * 	- theReference:		Either a document reference or a selector object, in
	 * 						the last case, the object is expected to have the _from,
	 * 						predicate and _to properties, only these will be used to
	 * 						resolve the document.
	 * 	- theBranch:		The branches to be added or removed.
	 * 	- theModifiers:		The modifier records to be added or removed.
	 * 	- theCollection:	If you provide an _id reference this parameter can be
	 * 						omitted or null; in all other cases it must be provided.
	 * 	- doAdd:			A boolean flag, if true add provided values; if false
	 * 						remove them.
	 *
	 * The method will perform the following steps:
	 *
	 * 	- Check the collection.
	 * 	- Assert the collection is of type edge.
	 * 	- Resolve the provided reference:
	 * 		- If found:
	 * 			- If the edge has no branches, raise an exception.
	 * 			- If there are more than one resolved edge, raise an exception.
	 * 			- Retain from the resolved edge only the _id, _rev, branches and
	 * 			  modifier fields.
	 * 		- If not found:
	 * 			- If provided an _id or _key reference, raise an exception.
	 * 	- Update local branches and modifiers.
	 * 	- If no branches are left:
	 * 		- Remove the edge.
	 * 		- Return false.
	 *  - If there are branches left:
	 *  	- If the edge exists:
	 * 			- Update the document in the database.
	 * 			- Raise an exception if there is a revision mismatch.
	 * 		- If the edge does not exist:
	 * 			- Insert the edge.
	 * 			- Copy insert metadata to record.
	 * 		- Return record.
	 *
	 * The behaviour of theBranch, theModifier and doAdd is documented in the
	 * SetBranch() and SetModifier() static methods. Note that SetModifier() may
	 * remove modifiers if the property value is null, please refer to those methods
	 * documentation.
	 *
	 * If neither the branches or the modifiers were provided, or if both parameters
	 * are empty, the method will return null; if the edge was deleted, due to the
	 * branches becoming empty, the method will return false.
	 *
	 * @param theRequest	{Object}					The current request.
	 * @param theReference	{String}|{Object}|{null}	The document reference or object.
	 * @param theBranch		{String}|{Array}|{null}		The branches.
	 * @param theModifier	{Object}|{null}				The modifiers.
	 * @param theCollection	{String}|{null}				The edge collection.
	 * @param doAdd			{Boolean}					True add, false delete.
	 * @returns {Object}|{null}							The updated record.
	 */
	static BranchUpdate(
		theRequest,
		theReference,
		theBranch = null,
		theModifier = null,
		theCollection = null,
		doAdd = true )
	{
		//
		// Check parameters.
		//
		if( ( (theBranch !== null)
		   && (theBranch.length > 0) )
		 || ( (theModifier !== null)
		   && (Object.keys( theModifier ).length > 0) ) )
		{
			//
			// Init local storage.
			//
			let record;
			let found = false;
			const selectors = [
				'_to',
				'_from',
				Dict.descriptor.kPredicate
			];
			
			//
			// Assert collection.
			//
			if( theCollection === null )
			{
				//
				// Collection is required.
				//
				if( K.function.isObject( theReference ) )
					throw(
						new MyError(
							'MissingRequiredParameter',			// Error name.
							K.error.NoCollection,				// Message code.
							theRequest.application.language,	// Language.
							null,								// Error value.
							400									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Extract collection from reference.
				//
				theCollection = theReference.toString().split( '/' )[ 0 ];
				
			}	// Collection not provided.
			
			//
			// Check collection.
			//
			const collection = db._collection( theCollection );
			if( ! collection )
				throw(
					new MyError(
						'BadCollection',					// Error name.
						K.error.InvalidColName,				// Message code.
						theRequest.application.language,	// Language.
						theCollection,						// Arguments.
						400									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Check collection type.
			// Will raise an exception.
			//
			Document.isEdgeCollection( theRequest, theCollection, true );
			
			//
			// Resolve by contents.
			//
			if( K.function.isObject( theReference ) )
			{
				//
				// Init local storage.
				//
				const matcher = {};
				const missing = [];
				
				//
				// Fill matcher.
				//
				for( const selector of selectors )
				{
					//
					// Add selector.
					//
					if( theReference.hasOwnProperty( selector ) )
						matcher[ selector ] =
							theReference[ selector ];
					
					//
					// Add to error list.
					//
					else
						missing.push( selector );
				}
				
				//
				// Handle errors.
				//
				if( missing.length > 0 )
					throw(
						new MyError(
							'MissingRequiredParameter',			// Error name.
							K.error.MissingToResolve,			// Message code.
							theRequest.application.language,	// Language.
							missing.join( ', ' ),				// Error value.
							400									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Resolve edge.
				//
				const cursor = collection.byExample( matcher );
				
				//
				// Handle ambiguous edge.
				//
				if( cursor.count() > 1 )
					throw(
						new MyError(
							'AmbiguousDocumentReference',		// Error name.
							K.error.AmbiguousEdge,				// Message code.
							theRequest.application.language,	// Language.
							[
								matcher._from,
								matcher._to,
								matcher[Dict.descriptor.kPredicate]
							],
							412									// HTTP error code.
						)
					);															// !@! ==>
				
				//
				// Handle found edge.
				//
				if( cursor.count() === 1 )
				{
					//
					// Load edge.
					//
					record = cursor.toArray()[ 0 ];
					
					//
					// Set found flag.
					//
					found = true;
					
				}	// Found edge.
				
				//
				// Handle new edge.
				//
				else
					record = theReference;
				
			}	// Provided object selector.
			
			//
			// Resolve by reference.
			// Note that unlike selecting by content,
			// if the reference doesn't resolve,
			// an exception will be raised.
			//
			else
			{
				//
				// Resolve reference.
				// Will raise an exception if not found.
				//
				const temp = collection.document( theReference );
				
				//
				// Clone immutable object.
				//
				record = JSON.parse(JSON.stringify(temp));
				
				//
				// Set found flag.
				//
				found = true;
			
			}	// Provided reference selector.
			
			//
			// Assert branched edge.
			//
			if( found
			 && (! record.hasOwnProperty( Dict.descriptor.kBranches )) )
				throw(
					new MyError(
						'ConstraintViolated',				// Error name.
						K.error.NotBranchedEdge,			// Message code.
						theRequest.application.language,	// Language.
						[
							record._from,
							record[ Dict.descriptor.kPredicate ],
							record._to
						],
						412									// HTTP error code.
					)
				);														// !@! ==>
			
			//
			// Update branches.
			//
			if( theBranch !== null )
				NewEdgeBranch.SetBranch( record, theBranch, doAdd );
			
			//
			// Check if branches left.
			//
			if( ! record.hasOwnProperty( Dict.descriptor.kBranches ) )
			{
				if( found )
					collection.remove( record );
				
				return false;														// ==>
			}
			
			//
			// Update modifiers.
			//
			if( theModifier !== null )
				NewEdgeBranch.SetModifier( record, theModifier, doAdd );
			
			//
			// Update.
			//
			if( found )
			{
				//
				// Init local storage.
				//
				const updator = {};
				
				//
				// Handle branches.
				//
				if( theBranch !== null )
					updator[ Dict.descriptor.kBranches ] =
						record[ Dict.descriptor.kBranches ];
				
				//
				// Handle modifiers.
				//
				if( theModifier !== null )
					updator[ Dict.descriptor.kModifiers ] =
						( record.hasOwnProperty( Dict.descriptor.kModifiers ) )
							? record[ Dict.descriptor.kModifiers ]
							: null;
				
				//
				// Update edge.
				// Will raise an exception on errors.
				//
				collection.update( record, updator, { keepNull : false } );
				
			}	// Existing edge.
			
			//
			// Insert.
			//
			else
			{
				//
				// Insert.
				//
				const meta = collection.insert( record );
				
				//
				// Update record.
				//
				record._id = meta._id;
				record._key = meta._id;
				record._rev = meta._rev;
				
			}	//  New edge.
			
			return record;															// ==>
			
		}	// Provided data.
		
		return null;																// ==>
		
	}	// BranchUpdate
	
	/**
	 * Set branch
	 *
	 * This method can be used to add or remove branches, it expects the following
	 * parameters:
	 *
	 * 	- theObject:	The object containing the branches and the modifiers.
	 * 	- theBranch:	Either a string or an array of strings representing the
	 * 					branches to add or remove.
	 * 	- doAdd:		A boolean flag indicating whether we intend to add the
	 * 					branches, true, or remove them, false.
	 *
	 * The method will return the updated list ov branches, if the list becomes empty,
	 * the method will remove the property and return null.
	 *
	 * If you provide an empty array, the method will simply return the existing value.
	 *
	 * We implement this method statically, to provide its services both to member and
	 * static methods: when called from an object pass the object document as the
	 * first parameter.
	 *
	 * The method must not raise exceptions.
	 *
	 * @param theObject	{Object}			The object to update.
	 * @param theBranch	{Array}|{String}	The branch to add or delete.
	 * @param doAdd		{Boolean}			If true, add branch, if false, delete it.
	 * @returns {Array}|{null}				The updated list of branches.
	 */
	static SetBranch( theObject, theBranch, doAdd )
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
			const has_branches = theObject.hasOwnProperty( bprop );
			
			//
			// Add branches.
			//
			if( doAdd )
			{
				//
				// Create property.
				//
				if( ! has_branches )
					theObject[ bprop ] = theBranch;
				
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
						if( ! theObject[ bprop ].includes( item ) )
							theObject[ bprop ].push( item );
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
				theObject[ bprop ] =
					theObject[ bprop ].filter(
						( item ) =>
						{
							//
							// Determine match.
							//
							const match = (! theBranch.includes( item ));
							
							//
							// Remove modifiers.
							//
							if( theObject.hasOwnProperty( mprop )
							 && theObject[ mprop ].hasOwnProperty( item ) )
								delete theObject[ mprop ][ item ];
							
							return match;
						}
					);
				
				//
				// Remove modifiers if empty.
				//
				if( theObject.hasOwnProperty( mprop )
				 && (Object.keys( theObject[ mprop ] ).length === 0) )
					delete theObject[ mprop ];
				
				//
				// Handle empty array.
				//
				if( theObject[ bprop ].length === 0 )
				{
					delete theObject[ bprop ];
					return null;													// ==>
				}
				
			}	// Delete branches.
			
		}	// Provided something.
		
		return theObject[ bprop ];													// ==>
		
	}	// SetBranch
	
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
	 * We implement this method statically, to provide its services both to member and
	 * static methods: when called from an object pass the object document as the
	 * first parameter.
	 *
	 * The method must not raise exceptions.
	 *
	 * @param theObject	{Object}		The object to update.
	 * @param theModifier	{Object}	The modifiers to add or delete.
	 * @param doAdd			{Boolean}	If true, add, if false, delete.
	 * @returns {Object}|{null}			The updated mofdifier records.
	 */
	static SetModifier( theObject, theModifier, doAdd = true )
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
			let has_modifiers = theObject.hasOwnProperty( mprop );
			
			//
			// Add or delete modifiers.
			//
			if( doAdd )
			{
				//
				// Init local storage.
				//
				const bprop = Dict.descriptor.kBranches;
				let has_branches = theObject.hasOwnProperty( bprop );
				
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
							theObject[ mprop ] = {};
							has_modifiers = true;
						}
						
						//
						// Add modifier.
						//
						theObject[ mprop ][ reference ] = theModifier[ reference ];
						
						//
						// Add branch.
						//
						if( (! has_branches)
							|| (! theObject[ bprop ].includes( reference )) )
						{
							//
							// Init branches.
							//
							if( ! has_branches )
							{
								theObject[ bprop ] = [];
								has_branches = true;
							}
							
							//
							// Set branch.
							//
							theObject[ bprop ].push( reference );
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
							if( theObject[ mprop ].hasOwnProperty( reference ) )
							{
								//
								// Delete record.
								//
								delete theObject[ mprop ][ reference ];
								
								//
								// Delete property.
								//
								if( Object.keys( theObject[ mprop ] ).length === 0 )
								{
									delete theObject[ mprop ];
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
					if( theObject[ mprop ].hasOwnProperty( reference ) )
					{
						//
						// Delete record.
						//
						delete theObject[ mprop ][ reference ];
						
						//
						// Delete property.
						//
						if( Object.keys( theObject[ mprop ] ).length === 0 )
						{
							delete theObject[ mprop ];
							return null;											// ==>
						}
					}
					
				}	// Iterating provided modifiers.
				
			}	// Remove modifiers.
			
		}	// Provided something.
		
		return theObject[ mprop ];													// ==>
		
	}	// SetModifier
	
}	// NewEdgeBranch.

module.exports = NewEdgeBranch;
