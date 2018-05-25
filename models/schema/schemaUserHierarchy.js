'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Get user hierarchies
 *
 * This schema is used to check parameters destined to the userGetPath, userGetList and
 * userGetTree services, it defines the following fields:
 *
 * 	- origin:		Determines the traversal origin node, it must be provided as
 * 					the user _id or _key, or as an object containing the username
 * 					property.
 * 	- minDepth:		Represents the minimum depth of the traversal, it must be
 * 					provided as an integer, or can be null, to ignore it. (default is
 * 					null).
 * 	- maxDepth:		Represents the maximum depth of the traversal, it must be
 * 					provided as an integer, or can be null, to ignore it. (default is
 * 					null).
 * 	- vField:		References the field(s) that should be included in the vertex.
 * 					The value can be a string representing the requested vertex field,
 * 					provided as a descriptor _key, or an array of such references. The
 * 					value may also be null, in which case the option is ignored.
 * 					(default is null).
 * 	- eField:		References the field(s) that should be included in the edge.
 * 					This parameter behaves exactly as the previous one, except
 * 					that it refers to edges; this parameter is only relevant if
 * 					the 'doEdge' parameter is true.
 * 	- doLanguage:	If this parameter is true, the label, definition, description,
 * 					note and example of both the vertex and the edge, if
 * 					requested, will be set to the current session language. This
 * 					means that these fields, instead of being objects indexed by
 * 					the language code, will hold the value matched by the session
 * 					language code. I the session language doesn't match any
 * 					element, the field will remain untouched. (default is false)
 * 	- doEdge:		If this parameter is true, the result nodes will be an object
 * 					with two elements: '_vertex' will contain the vertex and '_edge'
 * 					will contain the edge. (default is false)
 *
 * @type {Object}
 */
module.exports = {
	
	/**
	 * Parameters schema
	 *
	 * Ensure username and password are provided.
	 */
	schema : {
		origin		: Joi.alternatives().try(
			Joi.string().required(),
		Joi.object().required() ),
		minDepth	: Joi.number().integer().default(0),
		maxDepth	: Joi.number().integer().default(0),
		vField		: Joi.alternatives().try(
			Joi.string(),
			Joi.array().items(Joi.string()),
			null
		).default(null),
		eField		: Joi.alternatives().try(
			Joi.string(),
			Joi.array().items(Joi.string()),
			null
		).default(null),
		doLanguage	: Joi.boolean().default(false),
		doEdge		: Joi.boolean().default(false)
	},
	
	/**
	 * Transform response
	 *
	 * No transformations here.
	 *
	 * @param theResponse	{Object}	The service response.
	 * @returns {Object}				No changes.
	 */
	forClient( theResponse )
	{
		return theResponse;															// ==>
	},
	
	/**
	 * Transform request
	 *
	 * No transformations here.
	 *
	 * @param theRequest	{Object}	The service parameters.
	 * @returns {Object}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
