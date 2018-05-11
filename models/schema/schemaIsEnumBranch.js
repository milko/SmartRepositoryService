'use strict';

//
// Frameworks.
//
const Joi = require('joi');								// Validation framework.

/**
 * Check if term is an enumeration
 *
 * This schema expects one parameter:
 *
 * 	- term:	The term to check, it must be a term _id or _key or an array of such
 * 			references.
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
		term : Joi.alternatives().try(
			Joi.string().required(),
			Joi.array().items(Joi.string()).required()
		).required()
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
	 * Transform the service parameters request.
	 * We do nothing here.
	 *
	 * @param theRequest	{Object}	The service parameters.
	 * @returns {Object}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
