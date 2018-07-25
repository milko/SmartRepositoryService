'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Validate property value
 *
 * The service can be used to validate a property value, it expects an object in the
 * body with two properties:
 *
 * 	- descriptor:	The descriptor _key.
 * 	- value:		The property value.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 *
	 * Provide property name and value.
	 */
	schema : {
		descriptor	: Joi.string().required(),
		value		: Joi.any().required()
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
