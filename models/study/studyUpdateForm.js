'use strict';

//
// Frameworks.
//
const Joi = require('joi');

//
// Schema.
//
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.object({
		data	: Joi.alternatives().try(
			Joi.string().reauired(),
			Joi.object().reauired()
		).required()
	}).required(),
	
	/**
	 * Transform response
	 *
	 * No transformations here.
	 *
	 * @param theResponse	{Object}	The service response.
	 * @returns {Object}				The filtered user record, or null.
	 */
	forClient( theResponse )
	{
		return theResponse;															// ==>
	},
	
	/**
	 * Transform request
	 *
	 * Transform the service parameters request.
	 * We do nothing here: it's a GET.
	 *
	 * @param theRequest	{*}	The service parameters.
	 * @returns {*}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
