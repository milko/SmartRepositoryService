'use strict';

/**
 * Test services
 *
 * This path is used to test the Schema class.
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
const Schema = require( '../../classes/Schema' );

//
// Instantiate router.
//
const auth = createAuth();
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testSchema' );


/**
 * Test Schema.isEnumerationChoice()
 *
 * The service will check whether the provided term reference belongs to the
 * provided list of enumerations, or, if the enumerations are omitted, if the
 * reference is an enumeration choice.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/isEnumerationChoice
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/isEnumerationChoice',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Normalise parameters.
		//
		if( request.body.enums === null )
			request.body.enums = [];

		//
		// Test method.
		//
		try
		{
			//
			// Make test.
			//
			const result =
				Schema.isEnumerationChoice(
					request,
					request.body.term,
					request.body.enums
				);

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
	'isEnumerationChoice'
)
	.body(
		Joi.object({
		   term	: Joi.any().required(),
		   enums : Joi.any().required()
	   }),
		'Term reference(s) and optional list of enumerations references; provide _id or _key.'
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
		"Check if a term is an enumeration choice."
	)
	.description(dd`
  Returns the result of Schema.isEnumerationChoice()
  against the provided term reference in 'term' and
  against the optional list of enumerations in 'enums'.
`);


/**
 * Test Schema.isEnumerationBranch()
 *
 * The service will check whether the provided term reference is an enumeration branch.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/isEnumerationBranch
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/isEnumerationBranch',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Normalise parameters.
		//
		if( request.body.enums === null )
			request.body.enums = [];

		//
		// Test method.
		//
		try
		{
			//
			// Make test.
			//
			const result =
				Schema.isEnumerationBranch(
					request,
					request.body.term
				);

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
	'isEnumerationBranch'
)
	.body(
		Joi.object({
			term	: Joi.any().required()
		}),
		'Term reference(s) and optional list of enumerations references; provide _id or _key.'
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
		"Check if a term is an enumeration branch."
	)
	.description(dd`
  Returns the result of Schema.isEnumerationBranch()
  against the provided term reference in 'term' and
  against the optional list of enumerations in 'enums'.
`);


/**
 * Test Schema.getEnumPath()
 *
 * The service will check the Schema.getEnumPath() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getEnumPath
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getEnumPath',
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
				Schema.getEnumPath(
					request,
					request.body.leaf,
					request.body.branch,
					request.body.root,
					request.body.vField,
					request.body.eField,
					request.body.doRoot,
					request.body.doChoice,
					request.body.doLanguage,
					request.body.doEdge
				);

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
	'getEnumPath'
)
	.body(
		Joi.object({
			leaf		: Joi.string().required(),
			branch		: Joi.string().required(),
			root		: Joi.string().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doRoot		: Joi.boolean().required(),
			doChoice	: Joi.boolean().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge	: Joi.boolean().required()
		}),
		"Method parameters."
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
		"Get enumeration path from leaf to root."
	)
	.description(dd`
  Returns the result of Schema.getEnumPath().
`);
