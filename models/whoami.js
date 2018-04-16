'use strict';

//
// Frameworks.
//
const _ = require('lodash');							// Lodash library.
const Joi = require('joi');								// Validation framework.

//
// Application.
//
const Dict = require( '../dictionary/Dict' );			// Dictionary.

//
// Session user schema.
//
const SessionSchemas = require( './SessionSchemas' );	// Session schemas.

//
// Schema.
//
module.exports = {

	/**
	 * Input schema
	 *
	 * In this service this is ignored.
	 */
	schema : SessionSchemas.user,

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
	 * @param theResponse	{Object}	The service response.
	 * @returns {Object}				The filtered user record, or null.
	 */
	forClient( theResponse )
	{
		//
		// Handle user record.
		//
		if( theResponse.result !== null )
			theResponse.result =
				_.pick(
					theResponse.result,
					Object.keys( SessionSchemas.user )
				);

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
