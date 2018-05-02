'use strict';

/**
 * Test services
 *
 * This path is used to test theValidation util.
 */

//
// Import frameworks.
//
const dd = require('dedent');							// For multiline text.
const fs = require('fs');								// File system utilities.
const db = require('@arangodb').db;						// Database object.
const Joi = require('joi');								// Validation framework.
const aql = require('@arangodb').aql;					// AQL queries.
const time = require('@arangodb').time;					// Timer functions.
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
// Instantiate objects.
//
const K = require( '../../utils/Constants' );
const MyError = require( '../../utils/MyError' );
const Validation = require( '../../utils/Validation' );

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testValidation' );


/**
 * Test Validation.validateGeoJSON()
 *
 * The service will test the provided object in the body against the Validation.validateGeoJSON()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/validateGeoJSON
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/validateGeoJSON',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Test.
		//
		let result = null;
		try
		{
			result = Validation.validateGeoJSON( request, request.body );

			response.send({
				what : result,
				time : time() - stamp
			});
		}
		catch( error )
		{
			response.throw( 500, error );
		}
	},
	'validateGeoJSON'
)
	.body(
		Joi.object().required(),
		'The object should be a GeoJSON structure.'
	)
	.response(
		200,
		Joi.object({
			what : Joi.any(),
			time : Joi.number()
		}),
		"The result: 'what' contains the method return value, 'time' contains the elapsed time."
	)
	.summary(
		"Check GeoJSON structure."
	)
	.description(dd`
  Returns the result of Validation.validateGeoJSON()
  against the provided GeoJSON structure provided in the body.
`);


/**
 * Test Validation.validateDate()
 *
 * The service will test the provided object in the body against the Validation.validateDate()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/validateDate
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/validateDate',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Test.
		//
		let result = null;
		try
		{
			result = Validation.validateDate( request, request.body );

			response.send({
				what : result,
				time : time() - stamp
			});
		}
		catch( error )
		{
			response.throw( 500, error );
		}
	},
	'validateDate'
)
	.body(
		Joi.string().required(),
		'The body should contain a string.'
	)
	.response(
		200,
		Joi.object({
			what : Joi.any(),
			time : Joi.number()
		}),
		"The result: 'what' contains the method return value, 'time' contains the elapsed time."
	)
	.summary(
		"Check string date."
	)
	.description(dd`
  Returns the result of Validation.validateDate()
  against the provided string in the body.
`);


/**
 * Test Validation.validateIdReference()
 *
 * The service will test the provided object in the body against the Validation.validateIdReference()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/validateDate
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/validateIdReference',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Test.
		//
		let result = null;
		try
		{
			result = Validation.validateIdReference( request, request.body );

			response.send({
				what : result,
				time : time() - stamp
			});
		}
		catch( error )
		{
			response.throw( 500, error );
		}
	},
	'validateIdReference'
)
	.body(
		Joi.string().required(),
		'The body should contain a string.'
	)
	.response(
		200,
		Joi.object({
			what : Joi.any(),
			time : Joi.number()
		}),
		"The result: 'what' contains the method return value, 'time' contains the elapsed time."
	)
	.summary(
		"Check string date."
	)
	.description(dd`
  Returns the result of Validation.validateIdReference()
  against the provided string in the body.
`);
