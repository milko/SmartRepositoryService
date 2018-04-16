'use strict';

//
// Frameworks.
//
const _ = require('lodash');							// WTF?
const Joi = require('joi');								// Validation framework.

//
// Application.
//
const Dict = require( '../dictionary/Dict' );			// Dictionary.

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
		term : Joi.any().required(),
		enums: Joi.array().items(Joi.string())
	},

	/**
	 * Transform response
	 *
	 * If there is a current user, we only return the following fields:
	 *	- The user code.
	 *	- The user e-mail address.
	 *	- The user full name.
	 *	- The user's preferred language.
	 *	- The user rank.
	 *	- The User's roles.
	 *	- The user status.
	 *
	 * @param theResponse	{Object}	The response is the object
	 * 									{ result : <result> }, where the result is
	 * 									either the full user record, or null.
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
