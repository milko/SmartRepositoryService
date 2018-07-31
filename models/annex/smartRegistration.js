'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Register study SMART dataset annex
 *
 * This schema is used to register a SMART dataset; the detailed validation
 * will be performed by the handler.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.object({
		data:	 Joi.object().required()
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
