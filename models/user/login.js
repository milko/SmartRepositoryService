'use strict';

//
// Frameworks.
//
const Joi = require('joi');								// Validation framework.

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
	 * We omit private properties.
	 *
	 * @param theResponse	{Object}	The service response.
	 * @returns {Object}				The filtered user record, or null.
	 */
	forClient( theResponse )
	{
		//
		// Framework.
		//
		const Dictionary = require( '../../utils/Dictionary' );
		
		//
		// Strip privates.
		//
		if( theResponse.result !== null )
			Dictionary.stripDocumentProperties(
				theResponse.result,
				Dictionary.listUserPrivateProperties
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
