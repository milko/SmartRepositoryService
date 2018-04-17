'use strict';

//
// Frameworks.
//
const _ = require('lodash');							// Lodash library
const Joi = require('joi');								// Validation framework.

//
// Application.
//
const Dict = require( '../../dictionary/Dict' );			// Dictionary.

//
// Schema.
//
module.exports = {

	/**
	 * Parameters schema
	 *
	 * Ensure username and password are provided.
	 */
	schema : {
		leaf		: Joi.string().required(),
		branch		: Joi.string().required(),
		root		: Joi.string().required(),
		vField		: Joi.alternatives().try(
						Joi.string(),
						Joi.array().items(Joi.string().required()),
						null
					  ).default(null),
		eField		: Joi.alternatives().try(
						Joi.string(),
						Joi.array().items(Joi.string().required()),
						null
					  ).default(null),
		doRoot		: Joi.boolean().default(true),
		doChoice	: Joi.boolean().default(false),
		doLanguage	: Joi.boolean().default(false),
		doEdge		: Joi.boolean().default(false)
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
	 * We normalise the parameters.
	 *
	 * @param theRequest	{*}	The service parameters.
	 * @returns {*}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
