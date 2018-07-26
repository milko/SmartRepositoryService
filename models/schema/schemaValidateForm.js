'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Validate data structure associated to a form
 *
 * The service can be used to validate a data structure associated to a form, it
 * expects an object in the body with two properties:
 *
 * 	- form:	The form term _key.
 * 	- data:	The data structure to validate.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 *
	 * Provide property name and value.
	 */
	schema : {
		form	: Joi.string().required(),
		data	: Joi.object().required()
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
