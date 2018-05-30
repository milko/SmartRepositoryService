'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Request current user hierarchy
 *
 * This schema is used to provide the parameters needed to format the hierarchy of
 * managers of the current user.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.object({
		minDepth: Joi.alternatives().try(
			Joi.number().integer(),
			null
		).default(1),
		maxDepth: Joi.alternatives().try(
			Joi.number().integer(),
			null
		).default(0),
		doEdge: Joi.boolean().default(false),
		doTree: Joi.boolean().default(true)
	}).required(),
	
	/**
	 * Transform response
	 *
	 * No transformations.
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
	 * No transformation.
	 *
	 * @param theRequest	{Object}	The service parameters.
	 * @returns {Object}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
