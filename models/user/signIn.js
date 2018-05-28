'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Sign in user
 *
 * This schema is used to register a user, the schema will validate the main service
 * contents, that is, ensure the token and the user object are provided; the detailed
 * validation will be performed by the handler.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.object({
		token: Joi.string().required(),
		data:  Joi.object().required()
	}).required(),
	
	/**
	 * Transform response
	 *
	 * We omit private properties.
	 *
	 * @param theResponse	{Object}	The service response.
	 * @returns {Object}				No changes.
	 */
	forClient( theResponse )
	{
		//
		// Framework.
		//
		const Dict = require( '../../dictionary/Dict' );
		const Dictionary = require( '../../utils/Dictionary' );
		
		//
		// Strip privates.
		//
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
	 * We normalise the parameters.
	 *
	 * @param theRequest	{Object}	The service parameters.
	 * @returns {Object}				No transformation.
	 */
	fromClient( theRequest )
	{
		return theRequest;															// ==>
	}
};
