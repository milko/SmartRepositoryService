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
const User = require( '../../classes/User' );
const Schema = require( '../../utils/Schema' );

//
// Instantiate router.
//
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
					request.body.root,
					request.body.branch,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
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
			root		: Joi.string().required(),
			branch		: Joi.string().required(),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doChoice	: Joi.boolean().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required()
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


/**
 * Test Schema.getEnumList()
 *
 * The service will check the Schema.getEnumList() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getEnumList
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getEnumList',
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
				Schema.getEnumList(
					request,
					request.body.root,
					request.body.branch,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
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
	'getEnumList'
)
	.body(
		Joi.object({
			root		: Joi.string().required(),
			branch		: Joi.string().required(),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doChoice	: Joi.boolean().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required()
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
		"Get list of enumeration elements starting from root in branch."
	)
	.description(dd`
  Returns the result of Schema.getEnumList().
`);


/**
 * Test Schema.getEnumTree()
 *
 * The service will check the Schema.getEnumTree() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getEnumTree
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getEnumTree',
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
				Schema.getEnumTree(
					request,
					request.body.root,
					request.body.branch,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
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
	'getEnumTree'
)
	.body(
		Joi.object({
			root		: Joi.string().required(),
			branch		: Joi.string().required(),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required()
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
		"Get tree of enumeration elements starting from root in branch."
	)
	.description(dd`
  Returns the result of Schema.getEnumTree().
`);


/**
 * Test Schema.getTypePath()
 *
 * The service will check the Schema.getTypePath() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getTypePath
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getTypePath',
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
				Schema.getTypePath(
					request,
					request.body.root,
					request.body.branch,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
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
	'getEnumList'
)
	.body(
		Joi.object({
			root		: Joi.string().required(),
			branch		: Joi.string().required(),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required()
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
		"Get list of enumeration elements starting from root in branch."
	)
	.description(dd`
  Returns the result of Schema.getTypeList().
`);


/**
 * Test Schema.getTypeHierarchy()
 *
 * The service will check the Schema.getTypeHierarchy() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getTypeHierarchy
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getTypeHierarchy',
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
				Schema.getTypeHierarchy(
					request,
					request.body.type
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
	'getTypeHierarchy'
)
	.body(
		Joi.object({
			type : Joi.any().required()
		}),
		"Method parameters: either a term reference or a term object which includes at" +
		" least _id and _key."
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
		"Get tree of enumeration elements starting from root in branch."
	)
	.description(dd`
  Returns the result of Schema.getTypeHierarchy().
`);


/**
 * Test Schema.getFormList()
 *
 * The service will check the Schema.getFormList() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getFormList
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getFormList',
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
				Schema.getFormList(
					request,
					request.body.root,
					request.body.branch,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
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
	'getFormList'
)
	.body(
		Joi.object({
			root		: Joi.string().required(),
			branch		: Joi.string().required(),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doChoice	: Joi.boolean().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required()
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
		"Get list of form elements starting from root in branch."
	)
	.description(dd`
  Returns the result of Schema.getFormList().
`);


/**
 * Test Schema.getFormTree()
 *
 * The service will check the Schema.getFormTree() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getFormTree
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getFormTree',
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
				Schema.getFormTree(
					request,
					request.body.root,
					request.body.branch,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
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
	'getFormTree'
)
	.body(
		Joi.object({
			root		: Joi.string().required(),
			branch		: Joi.string().required(),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required()
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
		"Get tree of form elements starting from root in branch."
	)
	.description(dd`
  Returns the result of Schema.getFormTree().
`);


/**
 * Test Schema.getManagedUsersHierarchy()
 *
 * The service will check the Schema.getManagedUsersHierarchy() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getManagedUsersHierarchy
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getManagedUsersHierarchy',
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
			// Resolve user.
			//
			const user = new User( request, request.body.root );
			if( ! user.persistent )
				user.resolve( false, true );
			
			//
			// Make test.
			//
			const result =
				Schema.getManagedUsersHierarchy(
					request,
					user.document,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
					request.body.doLanguage,
					request.body.doEdge,
					request.body.doStrip
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
	'getManagedUsersHierarchy'
)
	.body(
		Joi.object({
			root		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required() ),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required(),
			doStrip		: Joi.boolean().required()
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
		"Get user managers hierarchy starting from leaf."
	)
	.description(dd`
  Returns the result of Schema.getManagedUsersPath().
`);


/**
 * Test Schema.getManagedUsersList()
 *
 * The service will check the Schema.getManagedUsersList() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getManagedUsersList
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getManagedUsersList',
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
			// Resolve user.
			//
			const user = new User( request, request.body.root );
			if( ! user.persistent )
				user.resolve( false, true );
			
			//
			// Make test.
			//
			const result =
				Schema.getManagedUsersList(
					request,
					user.document,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
					request.body.doLanguage,
					request.body.doEdge,
					request.body.doStrip
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
	'getManagedUsersList'
)
	.body(
		Joi.object({
			root		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required() ),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required(),
			doStrip		: Joi.boolean().required()
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
		"Get list of managed users starting from root."
	)
	.description(dd`
  Returns the result of Schema.getManagedUsersList().
`);


/**
 * Test Schema.getManagedUsersTree()
 *
 * The service will check the Schema.getManagedUsersTree() method.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getManagedUsersTree
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getManagedUsersTree',
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
			// Resolve user.
			//
			const user = new User( request, request.body.root );
			if( ! user.persistent )
				user.resolve( false, true );
			
			//
			// Make test.
			//
			const result =
				Schema.getManagedUsersTree(
					request,
					user.document,
					request.body.minDepth,
					request.body.maxDepth,
					request.body.vField,
					request.body.eField,
					request.body.doLanguage,
					request.body.doEdge,
					request.body.doStrip
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
	'getManagedUsersTree'
)
	.body(
		Joi.object({
			root		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required() ),
			minDepth	: Joi.any().required(),
			maxDepth	: Joi.any().required(),
			vField		: Joi.any().required(),
			eField		: Joi.any().required(),
			doLanguage	: Joi.boolean().required(),
			doEdge		: Joi.boolean().required(),
			doStrip		: Joi.boolean().required()
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
		"Get tree of form elements starting from root in branch."
	)
	.description(dd`
  Returns the result of Schema.getManagedUsersTree().
`);
