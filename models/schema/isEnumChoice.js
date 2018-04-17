'use strict';

//
// Frameworks.
//
const Joi = require('joi');								// Validation framework.

//
// Schema.
//
module.exports = {

	/**
	 * Parameters schema
	 */
	schema : {
		term : Joi.alternatives().try(
			Joi.string().required(),
			Joi.array().items(Joi.string())
		).required(),
		enums: Joi.array().default([])
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
	 * @param theRequest	{*}	The service parameters.
	 * @returns {*}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
