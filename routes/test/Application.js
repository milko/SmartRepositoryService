'use strict';

/**
 * Test services
 *
 * This path is used to test the Application utility.
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
 * Test Application.createSessionData()
 *
 * The service will test the Application.createSessionData() method.
 *
 * @path		/createSessionData
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/createSessionData',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		test_module.createSessionData( request );

		response.send({ result : request });
	},
	'createSessionData'
)
	.response(
		200,
		[ 'application/json' ],
		"The request: check if it contains the 'application' field."
	)
	.summary(
		"Test Application.createSessionData()"
	)
	.description(dd`
  The service will test the Application.createRequestSessionData() method.
`);


/**
 * Test Application.createAuthFile()
 *
 * The service will test the Application.createAuthFile() method.
 *
 * @path		/createAuthFile
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/createAuthFile',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		const result = test_module.createAuthFile();

		response.send({ result : result });
	},
	'createAuthFile'
)
	.response(
		200,
		[ 'application/json' ],
		"The method result."
	)
	.summary(
		"Test Application.createAuthFile()"
	)
	.description(dd`
  The service will test the Application.createAuthFile() method.
`);


/**
 * Test Application.initSessionData()
 *
 * The service will test the Application.initSessionData() method.
 *
 * @path		/initSessionData
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get(
	'/initSessionData',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		test_module.initSessionData( request );

		response.send({ result : request });
	},
	'initSessionData'
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
		"Test Application.initSessionData()"
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
			test_module.createSessionData( request );
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


/**
 * Test Application.adminAuthentication()
 *
 * The service will test the Application.adminAuthentication() method.
 *
 * @path		/adminAuthentication
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post(
	'/adminAuthentication',
	(request, response) =>
	{
		const refresh = request.body.refresh;
		const test_module = require( '../../utils/Application' );
		const result = test_module.adminAuthentication( refresh );

		response.send({ result : result });
	},
	'adminAuthentication'
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
		"Application.adminAuthentication() result"
	)
	.summary(
		"Test Application.adminAuthentication()"
	)
	.description(dd`
  The service will test the Application.adminAuthentication() method.
`);


/**
 * Test Application.userAuthentication()
 *
 * The service will test the Application.userAuthentication() method.
 *
 * @path		/userAuthentication
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post(
	'/userAuthentication',
	(request, response) =>
	{
		const refresh = request.body.refresh;
		const test_module = require( '../../utils/Application' );
		const result = test_module.userAuthentication( refresh );

		response.send({ result : result });
	},
	'userAuthentication'
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
		"Application.userAuthentication() result"
	)
	.summary(
		"Test Application.userAuthentication()"
	)
	.description(dd`
  The service will test the Application.userAuthentication() method.
`);


/**
 * Test Application.cookieSecret()
 *
 * The service will test the Application.cookieSecret() method.
 *
 * @path		/userAuthentication
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post(
	'/cookieSecret',
	(request, response) =>
	{
		const refresh = request.body.refresh;
		const test_module = require( '../../utils/Application' );
		const result = test_module.cookieSecret( refresh );
		
		response.send({ result : result });
	},
	'cookieSecret'
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
		"Application.cookieSecret() result"
	)
	.summary(
		"Test Application.cookieSecret()"
	)
	.description(dd`
  The service will test the Application.cookieSecret() method.
`);


/**
 * Test Application.encode()
 *
 * The service will test the Application.encode() method.
 *
 * @path		/encode
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post(
	'/encode',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		const result = test_module.encode( request.body.key, request.body.data );
		
		response.send({ result : result });
	},
	'encode'
)
	.body(
		Joi.object({
			key: Joi.string().required(),
			data: Joi.object().required()
		}).required(),
		"Key and object to encode."
	)
	.response(
		200,
		[ 'application/json' ],
		"Application.encode() result"
	)
	.summary(
		"Test Application.encode()"
	)
	.description(dd`
  The service will test the Application.encode() method.
`);


/**
 * Test Application.decode()
 *
 * The service will test the Application.decode() method.
 *
 * @path		/decode
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post(
	'/decode',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		const result = test_module.decode( request.body.key, request.body.token );
		
		response.send({ result : result });
	},
	'decode'
)
	.body(
		Joi.object({
			key: Joi.string().required(),
			token: Joi.string().required()
		}).required(),
		"Key and token to decode."
	)
	.response(
		200,
		[ 'application/json' ],
		"Application.decode() result"
	)
	.summary(
		"Test Application.decode()"
	)
	.description(dd`
  The service will test the Application.decode() method.
`);


/**
 * Get administrator token
 *
 * The service will return the administrator token.
 *
 * @path		/token/admin
 * @verb		get
 * @response	{String}	The administrator token.
 */
router.get(
	'/token/admin',
	(request, response) =>
	{
		const test_module = require( '../../utils/Application' );
		const auth = test_module.adminAuthentication( false );
		const token = test_module.encode( auth.key, auth );
		
		response.send( token );
	},
	'tokenAdmin'
)
	.response(
		200,
		[ 'application/text' ],
		"Administrator token"
	)
	.summary(
		"Retrieve administrator token."
	)
	.description(dd`
  The service will return the administrator token.
`);
