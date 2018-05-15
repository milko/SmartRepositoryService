'use strict';

//
// Frameworks.
//
const Joi = require('joi');
const _ = require('lodash');

/**
 * Register user
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
	 * No transformations here.
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
		
		//
		// Omit private properties.
		//
		theResponse.result = _.omit(
			theResponse.result,
			[
				'_id',						// ID.
				'_key',						// Key.
				'_rev',						// Revision.
				'_oldRev',					// Old revision.
				Dict.descriptor.kAuthData	// Authentication data.
			]
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
