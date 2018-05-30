'use strict';

/**
 * Test services
 *
 * This path is used to test the Descriptor class.
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
const Form = require( '../../classes/Form' );

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testForm' );


/**
 * Test Form
 *
 * The service will instantiate a form object from the provided form reference.
 *
 * The service returns an object as { branch : <branch>, form : <form> } where branch
 * is the form branch and form is the normalised form tree.
 *
 * The service POST body must contain { form : <value> }, where value is the form _id
 * or _key.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/form
 * @verb		post
 * @response	{ branch : <branch>, form : <form> }.
 */
router.post
(
	'/form',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Instantiate form.
		//
		try
		{
			//
			// Create form.
			//
			const form = new Form( request, request.body.form );
			
			response.send({
				branch : form.branch,
				form   : form.form,
				fields : form.fields,
				time   : time() - stamp
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
	'form'
)
	.body(
		Joi.object({
			form : Joi.string().required()
		}).required(),
		'Form reference as term _id or _key.'
	)
	.response(
		200,
		Joi.object({
			branch : Joi.string(),
			form   : Joi.object(),
			fields : Joi.array().items(Joi.string()),
			time   : Joi.number()
		}),
		"The result: 'branch' contains the form branch, 'form' contains the normalised" +
		" form tree and 'time' contains the elapsed time."
	)
	.summary(
		"Instantiate a form object."
	)
	.description(dd`
  Instantiates a form object and returns its branch in 'branch',
  the form tree in 'tree' and the elapsed time in 'time'.
`);


/**
 * Test form validation
 *
 * The service will instantiate a form object and validate the provided object.
 *
 * The service returns an object as { branch : <branch>, data : <data> } where branch
 * is the form branch and data is the result of the validation.
 *
 * The service body must contain a form reference string.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/schema
 * @verb		post
 * @response	{ branch : <branch>, schema : <schema> }.
 */
router.post
(
	'/validate',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Instantiate form.
		//
		try
		{
			//
			// Init local storage.
			//
			const data = request.body.data;
			const form = new Form( request, request.body.form );
			
			//
			// Validate.
			//
			form.validate( request, data );
			
			response.send({
				branch : form.branch,
				data : data,
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
	'validate'
)
	.body(
		Joi.object({
			form: Joi.string().required(),
			data: Joi.object().required()
		}).required(),
		'Form reference as term _id or _key and form data.'
	)
	.response(
		200,
		Joi.object({
			branch : Joi.string(),
			data   : Joi.object(),
			time   : Joi.number()
		}),
		"The result: 'branch' contains the form branch," +
		" 'data' contains the form validated data" +
		" and 'time' contains the elapsed time."
	)
	.summary(
		"Validate form."
	)
	.description(dd`
  Instantiates a form object and validates the provided form object in 'data',
  and the elapsed time in 'time'.
`);

