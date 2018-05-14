'use strict';

//
// Frameworks.
//
const Joi = require('joi');								// Validation framework.

//
// Application.
//
const Dict = require( '../dictionary/Dict' );			// Dictionary.

/**
 * Session schemas
 *
 * This object exports session schemas.
 *
 * user:	Session user schema.
 *
 * @type {Object}
 */
module.exports = {

	/**
	 * Get session user schema
	 *
	 * This schema restricts the user record to the following fields:
	 *	- The user code.
	 *	- The user e-mail address.
	 *	- The user full name.
	 *	- The user's preferred language.
	 *	- The user rank.
	 *	- The User's roles.
	 *	- The user status.
	 *
	 * @returns {Object}	Session user schema.
	 */
	get user() {
		const schema = {};
		schema[ Dict.descriptor.kUsername ] = Joi.string().required();
		schema[ Dict.descriptor.kEmail ] = Joi.string().email().required();
		schema[ Dict.descriptor.kName ] = Joi.string().required();
		schema[ Dict.descriptor.kLanguage ] = Joi.string().required();
		schema[ Dict.descriptor.kRank ] = Joi.string().required();
		schema[ Dict.descriptor.kRole ] = Joi.array().items(Joi.string()).required();
		schema[ Dict.descriptor.kStatus ] = Joi.string();

		return schema;																// ==>

	}	// user

};	// SessionSchemas.
