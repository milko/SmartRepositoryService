'use strict';

//
// Frameworks.
//
const _ = require('lodash');							// Lodash library.
const Joi = require('joi');								// Validation framework.

//
// Application.
//
const Dict = require( '../../dictionary/Dict' );		// Dictionary.

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
		term : Joi.any().required()
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
	 * We normalise the parameters
	 *
	 * @param theRequest	{*}	The service parameters.
	 * @returns {*}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
