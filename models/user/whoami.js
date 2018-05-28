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
	 * Input schema
	 *
	 * In this service this is ignored.
	 */
	schema : Joi.any(),
	
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
