'use strict';

/**
 * Test services
 *
 * This path is used to test the MyError class.
 */

//
// Import frameworks.
//
const dd = require('dedent');							// For multiline text.
const fs = require('fs');								// File system utilities.
const db = require('@arangodb').db;						// Database object.
const Joi = require('joi');								// Validation framework.
const aql = require('@arangodb').aql;					// AQL queries.
const crypto = require('@arangodb/crypto');				// Cryptographic functions.
const httpError = require('http-errors');				// HTTP errors.
const status = require('statuses');						// Don't know what it is.
const errors = require('@arangodb').errors;				// ArangoDB errors.
const createAuth = require('@arangodb/foxx/auth');		// Authentication framework.
const createRouter = require('@arangodb/foxx/router');	// Router class.
const jwtStorage = require('@arangodb/foxx/sessions/storages/jwt');

//
// Error constants.
//
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

//
// Instantiate router.
//
const auth = createAuth();
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testError' );


/**
 * Test MyError
 *
 * The service will return a MyError exception.
 *
 * @path		/error
 * @verb		post
 * @response	{Object}	The error object.
 */
router.post(
	'/error',
	(request, response) =>
	{
		const test_module = require( '../../utils/MyError' );
		const error = new test_module(
			request.body.name,
			request.body.code,
			request.body.lang,
			request.body.data,
			request.body.http
		);

		if( error.param_http !== null )
			response.throw( error.param_http, error );
		else
			response.send( error );
	},
	'error'
)
	.body(
		Joi.object({
			exch: Joi.boolean().default(false).description("True for exception, false for object"),
			name: Joi.string().default("NoCurrentUser", "Error name").required(),
			code: Joi.number().integer().default(1, "Error code or message").required(),
			lang: Joi.string().default("ISO:639:3:eng", "Default language code"),
			data: Joi.any().default(null, "Error data"),
			http: Joi.number().integer().default(400, "HTTP error code")
		}),
		"MyError constructor arguments."
	)
	.response(
		[ 'application/json' ],
		"The error object."
	)
	.summary(
		"Tert MyError class"
	)
	.description(dd`
  Returns a MyError Class instance.
`);
