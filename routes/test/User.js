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
 * The service will instantiate a user and return its data, it expects three parameters
 * in the POST body:
 *
 * 	- user:		Either a user object, or a user reference.
 * 	- group:	The optional user group reference.
 * 	- manager:	The optional user manager reference.
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
		// Get parameters.
		//
		const usr = request.body.user;
		const grp = ( request.body.hasOwnProperty( 'group' ) ) ? request.body.group : null;
		
		//
		// Handle manager.
		//
		let man = null;
		if( request.body.hasOwnProperty( 'manager' ) )
			man = request.body.manager;
		else if( request.session.hasOwnProperty( 'uid' ) )
			man = request.session.uid;
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate user.
			//
			const user = new User( request, usr, grp, man );
			
			//
			// Resolve user.
			//
			const doReplace = false;
			const doAssert  = false;
			if( ! user.persistent )
				user.resolve( doReplace, doAssert );
			
			//
			// Insert user.
			//
			let inserted = false;
			if( ! user.persistent )
			{
				user.insert();
				inserted = true;
			}
			
			response.send({
				inserted : inserted,
				group : user.group,
				manager : user.manager,
				collection : user.collection,
				class : user.classname,
				persistent : user.persistent,
				revised : user.revised,
				hasManaged : user.hasManaged(),
				manages : user.manages,
				user : user.document,
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
				Joi.string().required(),
				Joi.object().required()
			).required(),
			group : Joi.alternatives().try(
				Joi.string(),
				null
			),
			manager : Joi.string()
		}).required(),
		"An object with 'user' that contains eother the user structure or a string" +
		" representing the user reference, 'group' containing the user group reference" +
		" and 'manager' containing the eventual user manager reference."
	)
	.response(
		200,
		Joi.object(),
		"The result: 'user' contains the user object, 'group' con tains the" +
		" group reference, 'manager' contains the eventual user manager object " +
		"and 'time' contains the elapsed time."
	)
	.summary(
		"Instantiate a user object."
	)
	.description(dd`
  Instantiates and returns a user object
`);


/**
 * Test user replacement
 *
 * The service will instantiate a user from a document and replace the existing
 * document if it exists, it expects two parameters in the POST body:
 *
 * 	- existing:	The reference or object of the existing user.
 * 	- replaced:	The object of the replacing user.
 *
 * @path		/replace
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/replace',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Get parameters.
		//
		const usr = request.body.existing;
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate user.
			//
			const user = new User( request, usr );
			
			//
			// Resolve user.
			//
			if( ! user.persistent )
				user.resolve( false, true );
			
			//
			// Update user.
			//
			for( const field in request.body.replaced )
				user._document[ field ] = request.body.replaced[ field ];
			
			//
			// Replace user.
			//
			const checkRevision = true;
			const replaced = user.replace( checkRevision );
			
			response.send({
				replaced : replaced,
				group : user.group,
				manager : user.manager,
				collection : user.collection,
				class : user.classname,
				persistent : user.persistent,
				revised : user.revised,
				hasManaged : user.hasManaged(),
				managed : user.manages,
				user : user.document,
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
	'replace'
)
	.body(
		Joi.object({
			existing : Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required(),
			replaced : Joi.object()
		}).required(),
		"The existing and replacement users."
	)
	.response(
		200,
		Joi.object(),
		"An object containing relevant information."
	)
	.summary(
		"Replace a user object."
	)
	.description(dd`
  Replace an existing user
`);


/**
 * Test user deletion
 *
 * The service will instantiate a user from a reference and delete the user if it
 * exists, it expects a single parameter in the POST body:
 *
 * 	- reference:	The user reference or an object containing the user code.
 *
 * @path		/delete
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/delete',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Get parameters.
		//
		const usr = request.body.reference;
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate user.
			//
			const user = new User( request, usr );
			
			//
			// Resolve user.
			//
			const doReplace = false;
			const doAssert  = false;
			if( ! user.persistent )
				user.resolve( doReplace, doAssert );
			
			//
			// Insert user.
			//
			let deleted = false;
			if( user.persistent )
			{
				user.remove();
				deleted = true;
			}
			
			response.send({
				deleted : deleted,
				group : user.group,
				manager : user.manager,
				collection : user.collection,
				class : user.classname,
				persistent : user.persistent,
				revised : user.revised,
				hasManaged : user.hasManaged(),
				managed : user.manages,
				user : user.document,
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
	'delete'
)
	.body(
		Joi.object({
			reference : Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required()
		}).required(),
		"An object with 'reference' that contains eother the user structure or a string" +
		" representing the user reference."
	)
	.response(
		200,
		Joi.object(),
		"An object containing relevant information."
	)
	.summary(
		"Delete a user object."
	)
	.description(dd`
  Delete an existing user
`);
