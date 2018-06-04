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
 * are edges that contain a required array parameter, branches, which contains a set
 * of document _id references that represent all the graph branches that pass through
 * the current edge.
 *
 * The class behaves like its ancestor, except that it implements the following
 * branch specific members:
 *
 * 	- _branch:		The current edge branch, which can be set or retrieved using the
 * 					getter/setter branch methods.
 * 	- _branched:	If the current branch is among the edge branches, this flag will
 * 					be true. It must be noted that whenever the object is resolved,
 * 					the branches member will be overwritten and this flag updated
 * 					accordingly. Branches should never be set by the client, but
 * 					updated using the specific methods.
 *
 * and the following methods:
 *
 * 	- branchAdd():	Will add the current branch to the edge stored in the database.
 * 					The method will only execute if the current edge is persistent and
 * 					will not modify any other property.
 * 	- branchDel():	Will remove the current branch from the edge stored in the
 * 					database. The will only execute if the current edge is persistent
 * 					and will not modify any other property.
 *
 * If the only operation to be performed is adding a branch to the edge, the following
 * syteps should be taken:
 *
 * 	- Instantiate the class.
 * 	- If not instantiated with a document reference resolve the object.
 * 	- If the branch was not provided in the constructor, set it now.
 * 	- Call branchAdd(), and the branch will be added to the current object.
 *
 * If the only operation to be performed is removing a branch from the edge, the following
 * syteps should be taken:
 *
 * 	- Instantiate the class.
 * 	- If not instantiated with a document reference resolve the object.
 * 	- If the branch was not provided in the constructor, set it now.
 * 	- Call branchDel(), and the branch will be removed from the current object.
 *
 * Note that when removing branches, if the edge is left without any branch, it will
 * be deleted by default.
 *
 * The branch can only be set once, if you try to change it after it has already been
 * set, an exception will be raised: for this reason you must use the specific branch
 * getter and setter.
 *
 * The setter method will not add the branch to the current branches list, this will
 * be performed by the normaliseDocumentProperties() method at the beginning of the
 * validation procedure. This means that the current branch will be added only when
 * inserting or replacing the object, so despite the fact that an edge may be
 * persistent, this does not mean that it contains the current branch.
 *
 * The branches list property is reserved, that means it can only be set when
 * resolving the object, any attempt from the client to set or change its contsnts,
 * other than using the reserved methods, will fail with an exception.
 *
 * The class expects all required collections to exist.
 */
class NewEdgeBranch extends NewEdge
{
	/**
	 * Constructor
	 *
	 * We overload the constructor to provide the current branch.
	 *
	 * Any error will raise an exception.
	 *
	 * @param theRequest	{Object}					The current request.
	 * @param theReference	{String}|{Object}|”null}	The document reference or
	 *     object.
	 * @param theCollection	{String}|{null}				The document collection.
	 * @param theBranch		{String}|{null}				The Edge branch.
	 * @param isImmutable	{Boolean}					True, instantiate immutable
	 *     document.
	 */
	constructor(
		theRequest,
		theReference = null,
		theCollection = null,
		theBranch = null,
		isImmutable = false )
	{
		//
		// Call parent method.
		//
		super( theRequest, theReference, theCollection, isImmutable );
		
		//
		// Set branch.
		//
		if( theBranch !== null )
			this.branch = theBranch;
		
	}	// constructor
	
	
	/************************************************************************************
	 * MODIFICATION METHODS																*
	 ************************************************************************************/
	
	/**
	 * Set document property
	 *
	 * We overload this method to handle the branches list: if we are resolving, we
	 * allow changing that value, if not, we raise an exception.
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
		 || (theField !== Dict.descriptor.kBranches) )
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
	 * Insert document
	 *
	 * We overload this method to handle the current branch: if there is a current
	 * branch we add it to the list of branches; if the operation fails, we reset the
	 * branches list in the object.
	 *
	 * @returns {Boolean}	True if inserted.
	 */
	insertDocument()
	{
		//
		// Set branch.
		//
		const current = this.setBranch( false );
		
		//
		// Insert object.
		//
		try
		{
			return super.insertDocument();											// ==>
		}
		catch( error )
		{
			//
			// Reset branches list.
			//
			if( current !== null )
				this._document[ Dict.descriptor.kBranches ] = current;
			else
				delete this._document[ Dict.descriptor.kBranches ];
			
			throw( error );														// !@! ==>
		}
		
	}	// insertDocument
	
	/**
	 * replaceDocument
	 *
	 * We overload this method to handle the current branch: if there is a current
	 * branch we add it to the list of branches; if the operation fails, we reset the
	 * branches list in the object.
	 *
	 * @param doRevision	{Boolean}	If true, check revision (default).
	 * @returns {Boolean}|{null}		True if replaced or null if not persistent.
	 */
	replaceDocument( doRevision = true )
	{
		//
		// Only if persistent.
		//
		if( this._persistent )
		{
			//
			// Set branch.
			//
			const current = this.setBranch( false );
			
			//
			// Insert object.
			//
			try
			{
				return super.replaceDocument( doRevision );							// ==>
			}
			catch( error )
			{
				//
				// Reset branches list.
				//
				if( current !== null )
					this._document[ Dict.descriptor.kBranches ] = current;
				else
					delete this._document[ Dict.descriptor.kBranches ];
				
				throw( error );													// !@! ==>
			}
			
		}	// Is persistent.
		
		return null;																// ==>
		
	}	// replaceDocument
	
	/**
	 * Add branch
	 *
	 * This method can be used to add a branch to an existing edge, it will use the
	 * current branch and return true if the operation succeeded or raise an exception
	 * if it didn't; if the object is not persistent, or there is no current branch, the
	 * method will do nothing and return null.
	 *
	 * This method will use the current revision to validate the update operation,
	 * this means that if the revision has not changed, all the other persistent
	 * properties of the object should not habe changed.
	 *
	 * If the update fails, the branches list will be reset to how it was.
	 *
	 * @returns {Boolean}|{null}	True added, null not persistent or no branch.
	 */
	branchAdd()
	{
		//
		// Only if persistent and has branch.
		//
		if( this._persistent
		 && (this.branch !== null) )
		{
			//
			// Set branch in clone.
			//
			const old = this.setBranch( true );
			
			//
			// Create selector.
			//
			const selector = {
				_id : this._document._id,
				_rev: this._document._rev
			};
			
			//
			// Create updator with clone.
			//
			const updator = {};
			updator[ Dict.descriptor.kBranches ] = old;
			
			//
			// Update in database.
			// Will raise an exception if there is a revision mismatch.
			//
			db._update( selector, updator );
			
			//
			// Update current object.
			//
			this._document[ Dict.descriptor.kBranches ] = old;
			
			return true;															// ==>
		
		}	// Is persistent.
		
		return null;																// ==>
		
	}	// branchAdd
	
	/**
	 * Delete branch
	 *
	 * This method can be used to remove a branch from an existing edge, it will use the
	 * current branch and return true if the operation succeeded or raise an exception
	 * if it didn't; if the object is not persistent, or there is no current branch, the
	 * method will do nothing and return null. If the current branch is not in the
	 * list, the method will return false.
	 *
	 * The method will also remove the eventual associated modifier entry if there.
	 *
	 * This method will use the current revision to validate the remove operation,
	 * this means that if the revision has not changed, all the other persistent
	 * properties of the object should not habe changed.
	 *
	 * Note that the operation will only perform if the current object has a list of
	 * branches, if the object is persistent and it has no branches list, the method
	 * will return false, since you are attempting to remove a branch that you have
	 * not yet added.
	 *
	 * If the update fails, the cranches list will be reset to how it was.
	 *
	 * @returns {Boolean}|{null}	True added, null not persistent or no branch.
	 */
	branchDel()
	{
		//
		// Get branch.
		//
		const branch = this.branch;
		
		//
		// Only if persistent and has branch and has branches.
		//
		if( this._persistent
		 && (branch !== null) )
		{
			//
			// Assert branch in list.
			//
			if( (! this._document.hasOwnProperty( Dict.descriptor.kBranches ))
			 || (! this._document[ Dict.descriptor.kBranches ].includes( branch )) )
				return false;														// ==>
			
			//
			// Get branches.
			//
			const branches =
				this._document[ Dict.descriptor.kBranches ] .filter( x => x !== branch );
			
			//
			// Remove document if no more branches.
			//
			if( branches.length === 0 )
				return this.removeDocument();										// ==>
			
			//
			// Get modifiers.
			//
			let modifiers = null;
			if( this._document.hasOwnProperty( Dict.descriptor.kModifiers ) )
			{
				modifiers = _.omit( this._document[ Dict.descriptor.kModifiers ], branch );
				if( Object.keys( modifiers ).length === 0 )
					modifiers = null;
			}
			
			//
			// Create selector.
			//
			const selector = {
				_id : this._document._id,
				_rev: this._document._rev
			};
			
			//
			// Create updator.
			//
			const updator = {};
			updator[ Dict.descriptor.kBranches ] = branches;
			if( modifiers !== null )
				updator[ Dict.descriptor.kModifiers ] = modifiers;
			
			//
			// Update in database.
			// Will raise an exception if there is a revision mismatch.
			//
			db._update( selector, updator, { keepNull : false } );
			
			//
			// Update current object.
			//
			this._document[ Dict.descriptor.kBranches ] =
				updator[ Dict.descriptor.kBranches ];
			if( this._document.hasOwnProperty( Dict.descriptor.kModifiers ) )
			{
				if( modifiers === null )
					delete this._document[ Dict.descriptor.kModifiers ];
				else
					this._document[ Dict.descriptor.kModifiers ] = modifiers;
			}
			else if( modifiers !== null )
				this._document[ Dict.descriptor.kModifiers ] = modifiers;
			
			return true;															// ==>
			
		}	// Is persistent.
		
		return null;																// ==>
		
	}	// branchDel
	
	
	/************************************************************************************
	 * PRIVATE
	 * METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Set branch
	 *
	 * This method can be used to set the current branch in the branches list and
	 * retrieve a clone of the original list in case the operation has to be reverted.
	 *
	 * The method expects a boolean flag parameter that if false, the default, will
	 * perform the changes on the current document list and return the old clone; if
	 * true, the operation will be performed on the clone which will be returned. This
	 * last option is used when adding a branch to the stored document: the current
	 * document list will be updated only if the operation succeeds.
	 *
	 * The method returns an array, or null, if the list doesn't exist.
	 *
	 * @param	{Boolean}		True add branch to clone, false to current document.
	 * @return {Array}|{null}	The cloned list.
	 */
	setBranch( doClone = false )
	{
		//
		// Init local storage.
		//
		const branch = this.branch;
		let old = ( this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
				? JSON.parse(
						JSON.stringify(
							this._document[ Dict.descriptor.kBranches ]))
				: null;
		
		//
		// Check branch.
		//
		if( branch !== null )
		{
			//
			// Create branches list.
			//
			if( ! this._document.hasOwnProperty( Dict.descriptor.kBranches ) )
			{
				if( doClone )
					return [ branch ];												// ==>
				
				this._document[ Dict.descriptor.kBranches ] = [ branch ];
				
				return null;														// ==>
			}
			
			//
			// Append branch if necessary.
			//
			if( ! this._document[ Dict.descriptor.kBranches ].includes( branch ) )
			{
				if( doClone )
					old.push( branch );
				else
					this._document[ Dict.descriptor.kBranches ].push( branch );
			}
		
		}	// Has current branch.
		
		return old;																	// ==>
		
	}	// setBranch
	
	
	/************************************************************************************
	 * GETTER METHODS																	*
	 ************************************************************************************/
	
	/**
	 * Retrieve branched flag
	 *
	 * This method will return the branched status, the method will return:
	 *
	 * 	- True:		The current branch is set in the branches.
	 * 	- False:	The current branch is not among the branches.
	 * 	- Null:		The current object is not persistent, or there is no current
	 * branch.
	 *
	 * @returns {Boolean}|{null}	True if branch exists.
	 */
	get branched()
	{
		//
		// Check if persistent.
		//
		if( this._persistent )
		{
			//
			// Check branch and branches.
			//
			const branch = this.branch;
			if( branch !== null )
				return (
					this._document.hasOwnProperty( Dict.descriptor.kBranches )
				 && this._document[ Dict.descriptor.kBranches ].includes( branch )
				);																	// ==>
		}
		
		return null;																// ==>
		
	}	// branched
	
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
	
	
	/************************************************************************************
	 * BRANCH SETTERS AND GETTERS														*
	 ************************************************************************************/
	
	/**
	 * Set current branch
	 *
	 * This method will set the current branch, if the provided value cannot be
	 * resolved as a document _id, the method will raise an exception.
	 *
	 * @param theBranch	{String}	The branch reference.
	 */
	set branch( theBranch )
	{
		//
		// Check if overwriting.
		//
		if( this.hasOwnProperty( '_branch' ) )
			throw(
				new MyError(
					'ConstraintViolated',				// Error name.
					K.error.LockedFields,				// Message code.
					this._request.application.language,	// Language.
					"BRANCH",							// Arguments.
					412									// HTTP error code.
				)
			);																	// !@! ==>
		
		//
		// Check reference.
		//
		const found = db._exists( theBranch );
		if( found === false )
			throw(
				new MyError(
					'BadDocumentReference',				// Error name.
					K.error.BadDocumentHandle,			// Message code.
					this._request.application.language,	// Language.
					theBranch,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		
		//
		// Set branch.
		//
		this._branch = theBranch;
		
	}	// branch
	
	/**
	 * Get current branch
	 *
	 * This method will return the current branch, or null if not set.
	 *
	 * @returns {String}|{null}	The branch reference.
	 */
	get branch()
	{
		return ( this.hasOwnProperty( '_branch' ) ) ? this._branch : null;			// ==>
		
	}	// branch
	
}	// NewEdgeBranch.

module.exports = NewEdgeBranch;
