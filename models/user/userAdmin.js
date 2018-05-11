'use strict';

//
// Frameworks.
//
const Joi = require('joi');
const form = 'terms/:form:admin';

/**
 * Register administrator user
 *
 * This schema is used to register the system administration user, the schema will
 * load the 'terms/:form:admin' form and create the according schema.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.alternatives().try(
		Joi.string().required(),
		Joi.array().items( Joi.string() ).required(),
		Joi.array().required()
	),
	
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
	 * Transform the service parameters request.
	 * We normalise the parameters.
	 *
	 * @param theRequest	{Object}	The service parameters.
	 * @returns {Object}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
