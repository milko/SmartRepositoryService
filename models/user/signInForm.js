'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Sign in form
 *
 * This schema is used to decode a singIn, the schema will validate the main service
 * contents, that is, ensure the user and encoded tokens are provided; the detailed
 * validation will be performed by the handler.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.object({
		token:	 Joi.string().required(),
		encoded: Joi.string().required()
	}).required(),
	
	/**
	 * Transform response
	 *
	 * No transformations here: will be done by handler.
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
	 * No transformations here: will be done by handler.
	 *
	 * @param theRequest	{Object}	The service parameters.
	 * @returns {Object}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
