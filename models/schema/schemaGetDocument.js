'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Document retrieval schema
 *
 * This schema is used for services that retrieve documents, it expects a single
 * property in the POST body:
 *
 * 	- reference:	The document reference provided in one of these two forms:
 * 		- string:	The document reference as its _id or _key.
 * 		- object:	An object containing the document significant fields.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 *
	 * Provide property name and value.
	 */
	schema : {
		reference	: Joi.alternatives().try(
			Joi.string().reauired(),
			Joi.object().reauired()
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
