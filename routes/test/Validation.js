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
 * Test Validation.customGeoJSON()
 *
 * The service will test the provided object in the body against the Validation.customGeoJSON()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/customGeoJSON
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/customGeoJSON',
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
			result = Validation.customGeoJSON( request, null, request.body );

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
	'customGeoJSON'
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
 * Test Validation.customDate()
 *
 * The service will test the provided object in the body against the Validation.customDate()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/customDate
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/customDate',
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
			result = Validation.customDate( request, null, request.body );

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
	'customDate'
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
 * Test Validation.customIdReference()
 *
 * The service will test the provided object in the body against the Validation.customIdReference()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/customIdReference
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/customIdReference',
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
			result = Validation.customIdReference( request, null, request.body );

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
	'customIdReference'
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
 * Test Validation.customKeyReference()
 *
 * The service will test the provided object in the body against the Validation.customKeyReference()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * The method expects two parameters in the body: record, which contains the
 * validation structure and value which contains the value.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/customKeyReference
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/customKeyReference',
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
				Validation.customKeyReference(
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
	'customKeyReference'
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
 * Test Validation.customGidReference()
 *
 * The service will test the provided object in the body against the Validation.customGidReference()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * The method expects two parameters in the body: record, which contains the
 * validation structure and value which contains the value.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/customGidReference
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/customGidReference',
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
				Validation.customGidReference(
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
	'customGidReference'
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
 * Test Validation.customInstance()
 *
 * The service will test the provided object in the body against the Validation.customInstance()
 * script: the service will return an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * The method expects two parameters in the body: record, which contains the
 * validation structure and value which contains the value.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/customInstance
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/customInstance',
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
				Validation.customInstance(
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
	'customInstance'
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
 * Test Joi
 *
 * The service will test the Joi validation, the service
 * expects the following properties in the request body:
 *
 * 	- joi:		A string containing the Joi commands.
 * 	- value:	The value to test.
 *
 * The service will return an object, { what : <result> }, where result is the value
 * returned by Descriptor.validateProperty().
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/joi
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/joi',
	(request, response) =>
	{
		//
		// Init local storage.
		//
		const stamp = time();
		const schema = eval( request.body.joi );
		const value  = request.body.value;

		//
		// Test Joi.
		//
		const result = Joi.validate( value, schema );

		response.send({
			what : result,
			time : time() - stamp
		});
	},
	'joi'
)
	.body(
		Joi.object({
			joi 	: Joi.string().required(),
			value	: Joi.any().required()
		}),
		'Provide Joi commands and value to test.'
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
		"Test Joi validation."
	)
	.description(dd`
  Returns the result of Joi.validate()
  against the provided Joi commands string in 'joi' and value in 'value'.
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


/**
 * Test Validation.validateStructure()
 *
 * The service will test the Descriptor.validateStructure() method, the service
 * expects the structure to validate in the body.
 *
 * The service will return an object, { what : <result> }, where result is the value
 * returned by Descriptor.validateStructure().
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
	'/validateStructure',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Test method.
		//
		try
		{
			//
			// Make test.
			//
			const result =
				Validation.validateStructure( request, request.body );

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
	'validateStructure'
)
	.body(
		Joi.object(),
		'Provide structure to test.'
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
		"Check Descriptor.validateStructure() method."
	)
	.description(dd`
  Returns the result of Descriptor.validateStructure()
  against the provided structure in the request body.
`);


/**
 * Validate descriptors
 *
 * The service will validate all descriptors.
 *
 * The service will return an object, { what : <result> }, where result is the number
 * of documents validated.
 *
 * If a validation error occurs, the method will return an object,
 * { reference : <reference>, error : <error> } where reference is the document _id
 * and error is the raised exception.
 *
 * @path		/validateAllDescriptors
 * @verb		get
 * @response	{ what : <result> }.
 */
router.get
(
	'/validateAllDescriptors',
	(request, response) =>
	{
		//
		// Debug flag.
		//
		const debug = false;

		//
		// Init local storage.
		//
		const stamp = time();
		let object = null;
		let reference = null;

		//
		// Test method.
		//
		try
		{
			//
			// Init local storage.
			//
			let count = 0;
			const collection = db._collection( 'descriptors' );

			//
			// Query descriptors.
			//
			const cursor =
				db._query( aql`
					FOR doc in ${collection}
					RETURN doc
				`);

			//
			// Iterate cursor.
			//
			while( cursor.hasNext() )
			{
				//
				// Get object.
				//
				object = cursor.next();
				reference = object._id;

				//
				// Validate.
				//
				const value = Validation.validateStructure( request, object );

				//
				// Update counter.
				//
				++count;
			}

			//
			// Return response.
			//
			response.send({
				what : count,
				time : time() - stamp
			});
		}
		catch( error )
		{
			//
			// Raise exception.
			//
			if( debug )
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

			//
			// Return error object.
			//
			else
				response.send({
					reference : reference,
					error	  : error,
					object	  : object,
					time : time() - stamp
				});
		}
	},
	'validateAllDescriptors'
)
	.response(
		200,
		Joi.object(),
		"The result: 'what' contains the number of validated documents, or error will" +
		" contain the error."
	)
	.summary(
		"Validate all descriptors."
	)
	.description(dd`
  Will validate all descriptors, returning the number of documents processed, or the eventual error.
`);


/**
 * Validate terms
 *
 * The service will validate all terms.
 *
 * The service will return an object, { what : <result> }, where result is the number
 * of documents validated.
 *
 * If a validation error occurs, the method will return an object,
 * { reference : <reference>, error : <error> } where reference is the document _id
 * and error is the raised exception.
 *
 * @path		/validateAllTerms
 * @verb		get
 * @response	{ what : <result> }.
 */
router.get
(
	'/validateAllTerms',
	(request, response) =>
	{
		//
		// Debug flag.
		//
		const debug = false;

		//
		// Init local storage.
		//
		const stamp = time();
		let count = 0;
		let object = null;
		let reference = null;

		//
		// Test method.
		//
		try
		{
			//
			// Init local storage.
			//
			const collection = db._collection( 'terms' );

			//
			// Query descriptors.
			//
			const cursor =
				db._query( aql`
					FOR doc in ${collection}
					RETURN doc
				`);

			//
			// Iterate cursor.
			//
			while( cursor.hasNext() )
			{
				//
				// Get object.
				//
				object = cursor.next();
				reference = object._id;

				//
				// Validate.
				//
				const value = Validation.validateStructure( request, object );

				//
				// Update counter.
				//
				++count;
			}

			//
			// Return response.
			//
			response.send({
				what : count,
				time : time() - stamp
			});
		}
		catch( error )
		{
			//
			// Raise exception.
			//
			if( debug )
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

			//
			// Return error object.
			//
			else
				response.send({
					count	  : count,
					reference : reference,
					error	  : error,
					object	  : object,
					time : time() - stamp
				});
		}
	},
	'validateAllTerms'
)
	.response(
		200,
		Joi.object(),
		"The result: 'what' contains the number of validated documents, or error will" +
		" contain the error."
	)
	.summary(
		"Validate all terms."
	)
	.description(dd`
  Will validate all terms, returning the number of documents processed, or the eventual error.
`);
