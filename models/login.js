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
// Session schemas.
//
const SessionSchemas = require( './SessionSchemas' );	// Session schemas.

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
		username: Joi.string().required(),
		password: Joi.string().required()
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
	 * This method could be used to make additional encryption stuff.
	 *
	 * @param theRequest	{*}	The service parameters.
	 * @returns {*}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
