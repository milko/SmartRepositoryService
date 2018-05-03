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
			result = Validation.validateGeoJSON( request, null, request.body );

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
			result = Validation.validateDate( request, null, request.body );

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
 * @path		/validateIdReference
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
			result = Validation.validateIdReference( request, null, request.body );

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


/**
 * Test Validation.validateKeyReference()
 *
 * The service will test the provided object in the body against the Validation.validateKeyReference()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * The method expects two parameters in the body: record, which contains the
 * validation structure and value which contains the value.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/validateKeyReference
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/validateKeyReference',
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
			result =
				Validation.validateKeyReference(
					request,
					request.body.record,
					request.body.value
				);

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
	'validateKeyReference'
)
	.body(
		Joi.object({
			record: Joi.object().required(),
			value:	Joi.string().required()
		}),
		'The body should contain the validation record and the value.'
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
		"Check key reference."
	)
	.description(dd`
  Returns the result of Validation.validateKeyReference()
  against the provided string in the body.
`);


/**
 * Test Validation.validateGidReference()
 *
 * The service will test the provided object in the body against the Validation.validateGidReference()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * The method expects two parameters in the body: record, which contains the
 * validation structure and value which contains the value.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/validateGidReference
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/validateGidReference',
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
			result =
				Validation.validateGidReference(
					request,
					request.body.record,
					request.body.value
				);

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
	'validateGidReference'
)
	.body(
		Joi.object({
			record: Joi.object().required(),
			value:	Joi.string().required()
		}),
		'The body should contain the validation record and the value.'
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
		"Check key reference."
	)
	.description(dd`
  Returns the result of Validation.validateGidReference()
  against the provided string in the body.
`);


/**
 * Test Validation.validateInstanceReference()
 *
 * The service will test the provided object in the body against the Validation.validateInstanceReference()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * The method expects two parameters in the body: record, which contains the
 * validation structure and value which contains the value.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/validateInstanceReference
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/validateInstanceReference',
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
			result =
				Validation.validateInstanceReference(
					request,
					request.body.record,
					request.body.value
				);

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
	'validateInstanceReference'
)
	.body(
		Joi.object({
			record: Joi.object().required(),
			value:	Joi.string().required()
		}),
		'The body should contain the validation record and the value.'
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
		"Check key reference."
	)
	.description(dd`
  Returns the result of Validation.validateInstanceReference()
  against the provided string in the body.
`);


/**
 * Test Validation.validateProperty()
 *
 * The service will test the Descriptor.validateProperty() method, the service
 * expects the following properties in the request body:
 *
 * 	- descriptor:	A descriptor reference.
 * 	- value:		The value to test.
 *
 * The service will return an object, { what : <result> }, where result is the value
 * returned by Descriptor.validateProperty().
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/validateProperty
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/validateProperty',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Test method.
		//
		const collection = db._collection( 'descriptors' );
		try
		{
			//
			// Make test.
			//
			const result =
				Validation.validateProperty(
					request,
					request.body.descriptor,
					request.body.value );

			response.send({
				what : result,
				time : time() - stamp
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;

			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;

			response.throw( http, error );										// !@! ==>
		}
	},
	'validateProperty'
)
	.body(
		Joi.object({
			descriptor : Joi.string().required(),
			value	   : Joi.any().required()
		}),
		'Provide descriptor reference and value to test.'
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
		"Check Descriptor.validateProperty() method."
	)
	.description(dd`
  Returns the result of Descriptor.validateProperty()
  against the provided descriptor reference in 'descriptor' and value in 'value'.
`);
