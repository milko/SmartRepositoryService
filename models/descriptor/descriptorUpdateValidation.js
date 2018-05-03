'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Update validation structure
 *
 * This schema is used to check parameters destined to the updateValidation service,
 * it expects the body to be one of the following:
 *
 * 	- A string:				The string is expected to be a descriptor _id or _key.
 * 	- An array of strings:	The array elements are expected to be a descriptor _id or _key.
 * 	- An empty array:		All descriptors will be updated.
 *
 * @type {Object}
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
