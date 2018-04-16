'use strict';

/**
 * Test services
 *
 * This path is used to test utilities.
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
router.tag( 'testUtils' );


/**
 * Mirror GET request contents
 *
 * The service will return the GET request contents.
 *
 * @path		/echo/get
 * @verb		get
 * @response	{Object}	The request contents.
 */
router.get(
	'/echo/get',
	(request, response) => { response.send( request ); },
	'echoGET'
)
	.response(
		200,
		[ 'application/json' ],
		"Request echo"
	)
	.summary(
		"Echo GET request"
	)
	.description(dd`
  The service will return the GET request contents.
`);


/**
 * Test POST request contents
 *
 * The service will return the request contents.
 *
 * @path		/echo/post
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post(
	'/echo/post',
	(request, response) => { response.send( request ); },
	'echoPOST'
)
	.body(
		[ 'application/json' ],
		"Request contents."
	)
	.response(
		[ 'application/json' ],
		"Request echo."
	)
	.summary(
		"Echo POST request"
	)
	.description(dd`
  Returns the POST request contents.
`);
