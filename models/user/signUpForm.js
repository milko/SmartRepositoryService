'use strict';

//
// Frameworks.
//
const Joi = require('joi');

/**
 * Sign up form
 *
 * This schema is used to decode a signUp, the schema will validate the main service
 * contents, that is, ensure the key and token are provided; the detailed validation
 * will be performed by the handler.
 */
module.exports = {
	
	/**
	 * Parameters schema
	 */
	schema : Joi.object({
		token:	 Joi.string().required(),
		encoded: Joi.string().required()
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
				.concat(
					Dict.descriptor.kRank,
					Dict.descriptor.kRole,
					Dict.descriptor.kStatus
				)
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
