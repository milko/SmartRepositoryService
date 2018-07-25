'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Validate structure
 *
 * The service can be used to validate an object structure, it expects the POST body
 * to contain an object that contains a single property, data, which contains the
 * structure to be validated.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 *
	 * Provide structure to validate.
	 */
	schema : {
		data		: Joi.object().required()
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
