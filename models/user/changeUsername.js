'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Change username
 *
 * This schema is used when changing a user code, the schema will validate the main
 * service contents, that is, ensure the token and the signUp object are provided; the
 * detailed validation will be performed by the handler.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.object({
		token: Joi.string().required(),
		old:   Joi.string().required(),
		new:   Joi.string().required()
	}).required(),
	
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
