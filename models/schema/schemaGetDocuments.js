'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Documents retrieval schema
 *
 * This schema is used for services that retrieve document lists, it expects two
 * properties in the POST body:
 *
 * 	- reference:	The document reference provided in one of these two forms:
 * 		- string:	The document reference as its _id or _key.
 * 		- object:	An object containing the document significant fields.
 * 	- doCount:		A boolean flag where:
 * 		- true:		The service will return only the match count.
 * 		- false:	The service will return the list of matched documents.
 * 	- doLanguage:	A boolean flag where:
 * 		- true:		Restrict language strings to the current user preferred language.
 * 		- false:	Do not restrict language.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 *
	 * Provide property name and value.
	 */
	schema : {
		reference	: Joi.alternatives().try(
			Joi.string(),
			Joi.object()
		).required(),
		doCount		: Joi.boolean().default(true).required(),
		doLanguage	: Joi.boolean().default(true).required()
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
