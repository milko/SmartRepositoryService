'use strict';

/**
 * Test services
 *
 * This path is used to test services.
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
router.tag( 'testApplication' );


/**
 * Test Application.createDirectories()
 *
 * The service will test the Application.createDirectories() method.
 *
 * @path		/createDirectories
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/createDirectories',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		const result = test_module.createDirectories();

		response.send({ result : result });
	},
	'createDirectories'
)
	.response(
		200,
		[ 'application/json' ],
		"Application.createDirectories() result"
	)
	.summary(
		"Test Application.createDirectories()"
	)
	.description(dd`
  The service will test the Application.createDirectories() method.
`);


/**
 * Test Application.createDocumentCollections()
 *
 * The service will test the Application.createDocumentCollections() method.
 *
 * @path		/createDocumentCollections
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/createDocumentCollections',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		const result = test_module.createDocumentCollections();

		response.send({ result : result });
	},
	'createDocumentCollections'
)
	.response(
		200,
		[ 'application/json' ],
		"Application.createDocumentCollections() result"
	)
	.summary(
		"Test Application.createDocumentCollections()"
	)
	.description(dd`
  The service will test the Application.createDocumentCollections() method.
`);


/**
 * Test Application.createEdgeCollections()
 *
 * The service will test the Application.createEdgeCollections() method.
 *
 * @path		/createEdgeCollections
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/createEdgeCollections',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		const result = test_module.createEdgeCollections();

		response.send({ result : result });
	},
	'createEdgeCollections'
)
	.response(
		200,
		[ 'application/json' ],
		"Application.createEdgeCollections() result"
	)
	.summary(
		"Test Application.createEdgeCollections()"
	)
	.description(dd`
  The service will test the Application.createEdgeCollections() method.
`);


/**
 * Test Application.createDataDictionary()
 *
 * The service will test the Application.createDataDictionary() method.
 *
 * @path		/createDataDictionary
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post(
	'/createDataDictionary',
	(request, response) =>
	{
		const refresh = request.body.refresh;
		const test_module = require( '../../utils/Application' );
		const result = test_module.createDataDictionary( refresh );

		response.send({ result : result });
	},
	'createDataDictionary'
)
	.body(
		Joi.object({
			refresh : Joi.boolean().default(false).required()
		}),
		"Refresh flag."
	)
	.response(
		200,
		[ 'application/json' ],
		"Application.createDataDictionary() result"
	)
	.summary(
		"Test Application.createDataDictionary()"
	)
	.description(dd`
  The service will test the Application.createDataDictionary() method.
`);


/**
 * Test Application.createRequestSessionData()
 *
 * The service will test the Application.createRequestSessionData() method.
 *
 * @path		/createRequestSessionData
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/createRequestSessionData',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		test_module.createRequestSessionData( request );

		response.send({ result : request });
	},
	'createRequestSessionData'
)
	.response(
		200,
		[ 'application/json' ],
		"The request: check if it contains the 'application' field."
	)
	.summary(
		"Test Application.createRequestSessionData()"
	)
	.description(dd`
  The service will test the Application.createRequestSessionData() method.
`);


/**
 * Test Application.initRequestSessionData()
 *
 * The service will test the Application.initRequestSessionData() method.
 *
 * @path		/initRequestSessionData
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/initRequestSessionData',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		test_module.initRequestSessionData( request );

		response.send({ result : request });
	},
	'initRequestSessionData'
)
	.response(
		200,
		[ 'application/json' ],
		dd`
			The request: if there is a current user the 'application' field will contain
			the user credentials under the 'user'field; if there is no current user in the
			session, .
	`)
	.summary(
		"Test Application.initRequestSessionData()"
	)
	.description(dd`
  The service will test the Application.initRequestSessionData() method.
`);


/**
 * Test Application.initApplicationStatus()
 *
 * The service will test the Application.initApplicationStatus() method.
 *
 * @path		/initApplicationStatus
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/initApplicationStatus',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );

		if( ! request.hasOwnProperty( 'application' ) )
			test_module.createRequestSessionData( request );
		const result = test_module.initApplicationStatus( request );

		response.send({ result : result });
	},
	'initApplicationStatus'
)
	.response(
		200,
		[ 'application/json' ],
		"The result of  Application.initApplicationStatus()"
	)
	.summary(
		"Test Application.initApplicationStatus()"
	)
	.description(dd`
  The service will test the Application.initApplicationStatus() method.
`);
