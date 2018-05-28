'use strict';

//
// Frameworks.
//
const _ = require('lodash');

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const Schema = require( '../utils/Schema' );
const Validation = require( '../utils/Validation' );


/**
 * Form class
 *
 * This class implements form helpers.
 *
 * The class expects all required collections to exist.
 */
class Form
{
	/**
	 * Instantiate form
	 *
	 * The constructor expects a single parameter that represents a form reference,
	 * provided as its '_id' or '_key'.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theForm		{String}	The form reference.
	 */
	constructor( theRequest, theForm )
	{
		//
		// Get form hierarchy.
		//
		this.form =
			Schema.getFormTree(
				theRequest,		// Request.
				theForm,		// Root.
				theForm,		// Branch.
				null,			// Minimum depth.
				null,			// Maximum depth.
				null,			// All vertex fields.
				null,			// All edge fields.
				true,			// Restrict language.
				true			// Include edge.
			);
		
		//
		// Handle result.
		//
		if( this.form.length > 0 )
		{
			//
			// Save branch.
			//
			this.branch = this.form[ 0 ]._vertex._id;
			
			//
			// Normalise and store form hierarchy.
			//
			this.form.forEach( (element) => {
				Form.normaliseForm( theRequest, this.branch, element );
			});
			
		}	// Has elements.
		
	}	// constructor
	
	/**
	 * Validate form
	 *
	 * This method will validate the provided data against the current form.
	 *
	 * If any value fails to pass the test, the method will raise an exception.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theData		{Object}	The form data.
	 */
	validate( theRequest, theData )
	{
		//
		// Traverse form.
		//
		for( const element of this.form )
			Form.traverseSchema( theRequest, element, theData );
		
	}	// validate
	
	/**
	 * Traverse form schema
	 *
	 * This method will add all descriptor Joi validation commands to the provided
	 * schema in the order they were added in the form.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theElement	{Array}		The current form element.
	 * @param theData		{Object}	The form data.
	 */
	static traverseSchema( theRequest, theElement, theData )
	{
		//
		// Handle vertex validation.
		// We assume the element has a vertex.
		//
		if( theElement._vertex.hasOwnProperty( Dict.descriptor.kValidation ) )
		{
			//
			// Get validation elements.
			//
			const field = theElement._vertex._key;
			const valid = theElement._vertex[ Dict.descriptor.kValidation ];
			const data	= ( theData.hasOwnProperty( field ) )
						? theData[ field ]
						: null;
			
			//
			// Validate.
			//
			if( data !== null )
				theData[ field ] =
					Validation.validateValue( theRequest, valid, data );
		}
		
		//
		// Handle form siblings.
		//
		if( theElement.hasOwnProperty( '_children' ) )
		{
			for( const element of theElement._children )
				Form.traverseSchema( theRequest, element, theData );
		}
		
	}	// traverseSchema
	
	/**
	 * Normalise form tree
	 *
	 * This method will scan the provided form tree and normalise its elements.
	 *
	 * The provided element is an object that can have the following fields:
	 *
	 * 	- _vertex:		The vertex object, will either be a form or a descriptor.
	 * 	- _edge:		The edge object (may be missing).
	 * 	- _children:	The list of siblings structured as the element (may be missing).
	 *
	 * The method will first remove unwanted fields from the vertex and edge, it will
	 * then feed the element to the normaliseFormElement() method that will transfer
	 * modifiers from the edge to the vertex and finally process the eventual element
	 * siblings.
	 *
	 * The method returns the normalised element.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theBranch		{String}	The form tree branch.
	 * @param theElement	{Object}	The form tree.
	 */
	static normaliseForm( theRequest, theBranch, theElement )
	{
		//
		// Clean vertex.
		//
		theElement._vertex = ( theElement._vertex._id.startsWith( 'terms/' ) )
						   ? _.omit( theElement._vertex, Form.skipFormFields() )
						   : _.omit( theElement._vertex, Form.skipDescriptorFields() );
		
		//
		// Clean edge.
		//
		if( theElement.hasOwnProperty( '_edge' ) )
			theElement._edge =
				_.omit( theElement._edge, Form.skipEdgeFields() );
		
		//
		// Normalise vertex and edge.
		//
		Form.normaliseFormElement( theRequest, theBranch, theElement );
		
		//
		// Normalise siblings.
		//
		if( theElement.hasOwnProperty( '_children' ) )
			theElement._children.forEach( (element) => {
				Form.normaliseForm( theRequest, theBranch, element );
			});
	
	}	// normaliseForm
	
	/**
	 * Normalise form element
	 *
	 * This method will scan all form fields and transfer relevant information from
	 * the edge to the descriptor fields, and return the normalised structure.
	 *
	 * The received structure is a form tree with the form as the root element and its
	 * siblings distributed in the node '_children' array property.
	 *
	 * The method will perform the following operations:
	 *
	 * 	- Transfer modifier fields from the edge to the vertex.
	 * 	- Add 'required()' to Joi validation record if required.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theBranch		{String}	The form tree branch.
	 * @param theElement	{Object}	The form tree.
	 * @returns	{Object}				The normalised tree.
	 */
	static normaliseFormElement( theRequest, theBranch, theElement )
	{
		//
		// Handle edge.
		//
		if( theElement.hasOwnProperty( '_edge' ) )
		{
			//
			// Get fields list.
			//
			const set = new Set( Form.modifierFields() );
			
			//
			// Handle branch modifiers.
			//
			if( theElement._edge.hasOwnProperty( Dict.descriptor.kModifiers )
			 && theElement._edge[ Dict.descriptor.kModifiers ].hasOwnProperty( theBranch ) )
			{
				const modifiers = theElement._edge[ Dict.descriptor.kModifiers ][ theBranch ];
				const iterator = set.values();
				let field = iterator.next().value;
				while( field !== undefined )
				{
					if( modifiers.hasOwnProperty( field ) )
					{
						theElement._vertex[ field ] = modifiers[ field ];
						delete modifiers[ field ];
						set.delete( field );
					}
					
					field = iterator.next().value;
				}
			}
			
			//
			// Handle top level modifiers.
			//
			const iterator = set.values();
			let field = iterator.next().value;
			while( field !== undefined )
			{
				if( theElement._edge.hasOwnProperty( field ) )
				{
					theElement._vertex[ field ] = theElement._edge[ field ];
					delete theElement._edge[ field ];
				}
				
				field = iterator.next().value;
			}
		
		}	// Has edge.
		
		//
		// Handle descriptor vertex.
		//
		if( theElement._vertex._id.startsWith( 'descriptors/' )
		 && theElement._vertex.hasOwnProperty( Dict.descriptor.kUsage )
		 && (theElement._vertex[ Dict.descriptor.kUsage ] === Dict.term.kStateUsageRequired) )
			theElement._vertex[ Dict.descriptor.kValidation ][ Dict.descriptor.kJoi ] =
				theElement._vertex[ Dict.descriptor.kValidation ][ Dict.descriptor.kJoi ]
					+ ".required()";
	
	}	// normaliseFormElement
	
	/**
	 * Return the list of edge fields to skip
	 *
	 * This method will return an array of descriptor _key elements corresponding to
	 * the edge fields that should be ignored, this corresponds to the element edge.
	 *
	 * @returns {Array}	List of field _key references.
	 */
	static skipEdgeFields()
	{
		return [
			'_id',						// Id.
			'_key',						// Key.
			'_from',					// Origin.
			'_to',						// Destination.
			'_rev',						// Revision.
			Dict.descriptor.kOrder,		// Order.
			Dict.descriptor.kBranches	// Branches list.
		];																			// ==>
		
	}	// skipEdgeFields
	
	/**
	 * Return the list of form fields to skip
	 *
	 * This method will return an array of descriptor _key elements corresponding to
	 * the form fields that should be ignored, this corresponds to the term defining a
	 * form.
	 *
	 * @returns {Array}	List of field _key references.
	 */
	static skipFormFields()
	{
		return [
			'_rev',						// Revision.
			Dict.descriptor.kNID,		// Namespace reference.
			Dict.descriptor.kLID,		// Local identifier.
			Dict.descriptor.kGID,		// Global identifier.
			Dict.descriptor.kSynonym,	// Synonyms.
			Dict.descriptor.kKeyword,	// Keywords.
			Dict.descriptor.kInstances	// Instances.
		];																			// ==>
		
	}	// skipFormFields
	
	/**
	 * Return the list of descriptor fields to skip
	 *
	 * This method will return an array of descriptor _key elements corresponding to
	 * the descriptor fields that should be ignored, this corresponds to the descriptor
	 * defining a form field.
	 *
	 * @returns {Array}	List of field _key references.
	 */
	static skipDescriptorFields()
	{
		return [
			'_rev',						// Revision.
			Dict.descriptor.kNID,		// Namespace reference.
			Dict.descriptor.kLID,		// Local identifier.
			Dict.descriptor.kGID,		// Global identifier.
			Dict.descriptor.kSynonym,	// Synonyms.
			Dict.descriptor.kKeyword,	// Keywords.
			Dict.descriptor.kInstances	// Instances.
		];																			// ==>
		
	}	// skipDescriptorFields
	
	/**
	 * Return the list of modifier descriptor fields
	 *
	 * This method will return an array of descriptor _key elements corresponding to
	 * the modifier descriptor fields that should be transferred from the edge to the
	 * vertex.
	 *
	 * @returns {Array}	List of field _key references.
	 */
	static modifierFields()
	{
		return [
			Dict.descriptor.kLabel,			// Label.
			Dict.descriptor.kDefinition,	// Definition.
			Dict.descriptor.kDescription,	// Description.
			Dict.descriptor.kNote,			// Notes.
			Dict.descriptor.kExample,		// Examples.
			Dict.descriptor.kRank,			// Ranks.
			Dict.descriptor.kRole,			// Roles.
			Dict.descriptor.kInit,			// Value initialiser reference.
			Dict.descriptor.kEnable,		// Field enabler reference.
			Dict.descriptor.kUsage,			// Field usage.
			Dict.descriptor.kInterface		// Field interface.
		];																			// ==>
		
	}	// modifierFields
	
}	// Form.

module.exports = Form;
