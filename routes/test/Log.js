'use strict';

/**
 * Test services
 *
 * This path is used to test services.
 */

//
// Timestamp.
//
const stamp = Date.now();

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
router.tag( 'testLog' );


/**
 * Test Log.writeEvent()
 *
 * The service will test the Log.writeEvent() method.
 *
 * @path		/writeEvent
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/writeEvent',
	(request, response) =>
	{
		const test_module = require( '../../utils/Log' );
		const result = test_module.writeEvent( stamp, Date.now(), request, response );

		response.send({ result : result });
	},
	'writeEvent'
)
	.response(
		200,
		[ 'application/json' ],
		"Log.writeEvent() result"
	)
	.summary(
		"Test Log.writeEvent()"
	)
	.description(dd`
  The service will test the Log.writeEvent() method.
`);
