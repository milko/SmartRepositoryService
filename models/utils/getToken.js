'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Get authentication token
 *
 * This schema is used when retrieving the administrator or user authentication token,
 * it ensures the 'refresh' parameter is provided and is a boolean.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.object({
		refresh: 	  Joi.boolean().required().default(false)
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
