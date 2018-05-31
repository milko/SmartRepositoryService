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
	 * The constructor will traverse the form graph adding all fields and sub-forms to
	 * the object, if you also provide theData, it will add the data elements to the
	 * structure; note that this parameter will be cloned.
	 *
	 * The constructor will initialise the following data members:
	 *
	 * 	- branch:	The root form _id.
	 * 	- form:		The form contents structured as an array of object elements
	 * 				structured as follows:
	 * 		- _vertex:		Either the form object, or the descriptor object.
	 * 		- _edge:		The edge object.
	 * 		- _value:		If the _vertex is a descriptor, the field data value, if
	 * 						theValue is provided.
	 * 		- _children:	An array of elements belonging to the current one, this
	 * 						property is only relevant for form elements or structure
	 * 						_vertex elements (STRUCTURES ARE NOT YET SUPPORTED).
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theForm		{String}	The form reference.
	 * @param theData		{Object}	The form data.
	 */
	constructor( theRequest, theForm, theData = null )
	{
		//
		// Init descriptors list.
		//
		this.descriptors = [];
		
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
			// Clone data.
			//
			let data = null;
			if( K.function.isObject( theData ) )
				data = JSON.parse(JSON.stringify(theData));
			
			//
			// Normalise and store form hierarchy.
			//
			this.form.forEach( (element) => {
				Form.normaliseForm(
					theRequest,			// Current request.
					this.branch,		// Form root _id.
					element,			// Current element.
					data,				// Eventual data.
					this.descriptors	// Used descriptor _keys.
				);
			});
			
			//
			// Add non-form data values.
			// ToDo
			//
			if( Object.keys( data ).length > 0 )
			{
				//
				// Prepare last form element.
				//
				const element = this.form[ this.form.length - 1 ];
				if( ! element.hasOwnProperty( '_children' ) )
					element._children = [];
				
				//
				// Iterate data fields.
				//
				for( const field in data )
					Form.addDataValue(
						theRequest,			// Current request.
						element._children,	// Elelents receptor.
						field,				// Data value field.
						data[ field ]		// Data value.
					);
			
			}	// Values left.
			
		}	// Has elements.
		
	}	// constructor
	
	/**
	 * Validate form
	 *
	 * This method will validate the provided data against the current form.
	 *
	 * If any value fails to pass the test, the method will raise an exception.
	 *
	 * @param theRequest	{Object}		The current request.
	 * @param theData		{Object}|{null}	The form data.
	 */
	validate( theRequest, theData = null )
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
	 * If you omit theData, the data values are expected to be found in the form
	 * elements _value property.
	 *
	 * @param theRequest	{Object}		The current request.
	 * @param theElement	{Array}			The current form element.
	 * @param theData		{Object}|{null}	The form data.
	 */
	static traverseSchema( theRequest, theElement, theData = null )
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
			const value = ( (theData !== null) && theData.hasOwnProperty( field ) )
						? theData[ field ]
						: ( (theElement.hasOwnProperty( '_value' ))
						  ? theElement._value
						  : null );
			
			//
			// Validate.
			//
			if( value !== null )
			{
				//
				// Validate value.
				//
				const normalised =
					Validation.validateValue(
						theRequest,
						valid,
						value,
						field
					);
				
				//
				// Replace normalised value.
				//
				if( theData !== null )
					theData[ field ] = normalised;
				else
					theElement._value = normalised;
			}
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
	 * If you provide theData, the method will add a _value property to descriptor
	 * elements with the corresponding data value; to ignore, provide null.
	 *
	 * If you provide theFields, all used descriptor _key fields will be added to the
	 * provided array; to ignore, provide null.
	 *
	 * The method returns the normalised element.
	 *
	 * @param theRequest	{Object}		The current request.
	 * @param theBranch		{String}		The form tree branch.
	 * @param theElement	{Object}		The form tree.
	 * @param theData		{Object}|{null}	The form data object.
	 * @param theFields		{Array}|{null}	The form fields list.
	 */
	static normaliseForm(
		theRequest,
		theBranch,
		theElement,
		theData = null,
		theFields = null )
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
		Form.normaliseFormElement(
			theRequest,
			theBranch,
			theElement,
			theData,
			theFields
		);
		
		//
		// Normalise siblings.
		//
		if( theElement.hasOwnProperty( '_children' ) )
			theElement._children.forEach( (element) => {
				Form.normaliseForm(
					theRequest,
					theBranch,
					element,
					theData,
					theFields
				);
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
	 * @param theRequest	{Object}		The current request.
	 * @param theBranch		{String}		The form tree branch.
	 * @param theElement	{Object}		The form tree.
	 * @param theData		{Object}|{null}	The form data object.
	 * @param theFields		{Array}|{null}	The form fields list.
	 * @returns	{Object}					The normalised tree.
	 */
	static normaliseFormElement(
		theRequest,
		theBranch,
		theElement,
		theData = null,
		theFields = null )
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
		// Handle descriptors.
		//
		if( theElement._vertex._id.startsWith( 'descriptors/' ) )
		{
			//
			// Add descriptor to fields list.
			//
			if( Array.isArray( theFields )
			 && (! theFields.includes( theElement._vertex._key )) )
				theFields.push( theElement._vertex._key );
			
			//
			// Update Joi command for required fields.
			//
			if( theElement._vertex.hasOwnProperty( Dict.descriptor.kUsage )
			 && (theElement._vertex[ Dict.descriptor.kUsage ] === Dict.term.kStateUsageRequired) )
				theElement._vertex[ Dict.descriptor.kValidation ][ Dict.descriptor.kJoi ] =
					theElement._vertex[ Dict.descriptor.kValidation ][ Dict.descriptor.kJoi ]
					+ ".required()";
			
			//
			// Add data value to element.
			//
			if( (theData !== null)
			 && theData.hasOwnProperty( theElement._vertex._key ) )
			{
				//
				// Add value.
				//
				theElement._value = theData[ theElement._vertex._key ];
				
				//
				// Remove property from data.
				// MILKO - STRUCTURES ARE NOT SUPPORTED.
				//
				delete theData[ theElement._vertex._key ];
			}
			
		}	// Is descriptor.
	
	}	// normaliseFormElement
	
	/**
	 * Add extra data value
	 *
	 * This method will add the provided data value to the last element of the form,
	 * the method will create a form element with the _vertex property in which it
	 * will load the descriptor properties related to theField and ad the value in the
	 * _value property.
	 *
	 * All added elements will have the interface property set to
	 * ':state:interface:field:in:out' by default.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theElements	{Array}		The receptor of the elements.
	 * @param theField		{String}	Data value field name.
	 * @param theValue		{*}			Data value.
	 */
	static addDataValue( theRequest, theElements, theField, theValue )
	{
		//
		// Init element.
		//
		const element = { _vertex : {} };
		
		//
		// Add element.
		//
		theElement.push( element );
	
	}	// addDataValue
	
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
	
	/**
	 * Return list of descriptors
	 *
	 * This method will return the list of descriptor _key fields used in the form.
	 *
	 * @returns {Array}	List of descriptor fields.
	 */
	get fields()
	{
		return this.descriptors;													// ==>
	
	}	// descriptors
	
}	// Form.

module.exports = Form;
