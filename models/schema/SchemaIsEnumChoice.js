'use strict';

//
// Frameworks.
//
const Joi = require('joi');								// Validation framework.

/**
 * Check if term is an enumeration choice
 *
 * This schema expects two parameters:
 *
 * 	- term:	The term to check, it must be a term _id or _key or an array of such
 * 			references.
 * 	- enum:	An array of term _id or _key references representing the enumerations to
 * 			which the provided term should belong; the parameter can either be null,
 * 			or an array.
 *
 * @type {Object}
 */
module.exports = {

	/**
	 * Parameters schema
	 */
	schema : {
		term : Joi.alternatives().try(
			Joi.string(),
			Joi.array().items(Joi.string())
		).required(),
		enum: Joi.alternatives().try(
			Joi.string(),
			Joi.array().items(Joi.string()),
			null
		).default([])
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
	 * We cast an eventual enumeration scalar to an array.
	 *
	 * @param theRequest	{Object}	The service parameters.
	 * @returns {Object}				No transformation.
	 */
	fromClient( theRequest )
	{
		//
		// Aet enumeration choices if missing.
		//
		if( ! theRequest.hasOwnProperty( 'enum' ) )
			theRequest.enum = [];

		//
		// Cast enumerations list to array.
		//
		else if( (theRequest.enum !== null)
			  && (! Array.isArray( theRequest.enum )) )
			theRequest.enum = [ theRequest.enum ];

		return theRequest;															// ==>
	}
};
