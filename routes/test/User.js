'use strict';

/**
 * Test services
 *
 * This path is used to test the user class.
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
const User = require( '../../classes/User' );

//
// Instantiate router.
//
const auth = createAuth();
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testUser' );


/**
 * Test user creation
 *
 * The service will instantiate a user and return its data, it expects two parameters
 * in the POST body:
 *
 * 	- user:		Either a user object, or a user reference.
 * 	- mabager:	The optional user manager reference.
 *
 * @path		/instantiate
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/instantiate',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Normalise parameters.
		//
		const params = { user : request.body.user };
		params.manager = ( request.body.hasOwnProperty( 'manager' ) )
						 ? request.body.manager
						 : null;
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate user.
			//
			const user = new User( request, params.user, params.manager );
			
			response.send({
				user : user.getData(),
				manager : user.getManager(),
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
	'instantiate'
)
	.body(
		Joi.object({
			user : Joi.alternatives().try(
				Joi.object().required(),
				Joi.string().required()
			).required(),
			manager : Joi.string()
		}).required(),
		"An object with 'user' that contains eother the user structure or a string" +
		" representing the user reference and 'manager' containing the eventual user" +
		" manager reference."
	)
	.response(
		200,
		Joi.object({
			user : Joi.object().required(),
			manager : Joi.object(),
			time : Joi.number()
		}),
		"The result: 'user' contains the user object, 'manager' contains the" +
		" eventual user manager object and 'time' contains the elapsed time."
	)
	.summary(
		"Instantiate a user object."
	)
	.description(dd`
  Instantiates and returns a user object
`);
