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
const Dict = require( '../../dictionary/Dict');
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
 * Test User class
 *
 * The service will test the User class, it expects the following parameters
 * in the POST body:
 *
 * 	- user:			Either a user object, or a user reference.
 * 	- group:		The optional user group reference or object.
 * 	- manager:		The optional user manager reference, object, omit for current user.
 * 	- data:			Eventual modification data.
 * 	- immutable:	Immutable object.
 * 	- raise:		Raise exceptions.
 * 	- modify:		If data is provided, replace values when resolving and modifying.
 * 	- before:		If data is provided, set data before resolving, or after.
 * 	- insert:		True, insert object.
 * 	- resolve:		True, resolve before modifying.
 * 	- replace:		If true, replace document.
 * 	- remove:		True, remove object.
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
		const grp = ( request.body.hasOwnProperty( 'group' ) )
				  ? request.body.group
				  : null;
		const dat = ( request.body.hasOwnProperty( 'data' ) )
				  ? request.body.data
				  : null;
		const man = ( request.body.hasOwnProperty( 'manager' ) )
					? request.body.manager
					: request.session.uid;
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate user.
			//
			const user = new User(
				request,
				request.body.user,
				grp,
				man,
				request.body.immutable
			);
			
			//
			// Set data.
			//
			if( (dat !== null)
			 && request.body.before )
				user.modify(
					dat,
					request.body.modify,
					request.body.raise
				);
			
			//
			// Resolve user.
			//
			let resolve = null;
			if( request.body.resolve )
				resolve = user.resolve(
					request.body.modify,
					request.body.raise
				);
			
			//
			// Set data.
			//
			if( (dat !== null)
			 && (! request.body.before) )
				user.modify(
					dat,
					request.body.modify,
					request.body.raise
				);
			
			//
			// Insert user.
			//
			let insert = null;
			if( request.body.insert )
				insert = user.insert( "secret" );
			
			//
			// Save identifier.
			//
			const id = user.document._id;
			
			//
			// Replace user.
			//
			let replace = null;
			if( request.body.replace )
				replace = user.replace( true, "secret" );
			
			//
			// Remove user.
			//
			let remove = null;
			if( request.body.remove )
			{
				//
				// Remove user.
				//
				remove = user.remove();
				
				//
				// Validate removal.
				//
				let cursor;
				const selector = {};
				
				//
				// Check user record.
				//
				selector._id = id;
				cursor = db._collection( 'schemas' ).byExample( selector );
				if( cursor.count() > 0 )
					theResponse.throw( 500, "User not deleted." );
				delete selector._id;
				
				//
				// Check manager.
				//
				selector[ Dict.descriptor.kPredicate ] = Dict.term.kPredicateManagedBy;
				selector._from = id;
				cursor = db._collection( 'schemas' ).byExample( selector );
				if( cursor.count() > 0 )
					theResponse.throw( 500, "Manager edge not deleted." );
				delete selector._from;
				
				//
				// Check managed.
				//
				selector._to = id;
				cursor = db._collection( 'schemas' ).byExample( selector );
				if( cursor.count() > 0 )
					theResponse.throw( 500, "Managed edge not deleted." );
			}
			
			response.send({
				params : request.body,
				result : {
					resolve : resolve,
					insert  : insert,
					replace : replace,
					remove  : remove
				},
				object : {
					id		   : id,
					group	   : user.group,
					manager	   : user.manager,
					collection : user.collection,
					class	   : user.classname,
					persistent : user.persistent,
					revised	   : user.revised,
					hasManaged : user.hasManaged(),
					manages	   : user.managed,
					document   : user.document,
				}
				
			});																		// ==>
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
			user 		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required(),
			group 		: Joi.alternatives().try(
				Joi.string(),
				Joi.object()
			),
			manager 	: Joi.alternatives().try(
				Joi.string(),
				Joi.object(),
				null
			),
			data		: Joi.alternatives().try(
				Joi.object(),
				null
			).required(),
			immutable	: Joi.boolean().required(),
			raise		: Joi.boolean().required(),
			modify		: Joi.boolean().required(),
			before		: Joi.boolean().required(),
			insert		: Joi.boolean().required(),
			resolve		: Joi.boolean().required(),
			replace		: Joi.boolean().required(),
			remove		: Joi.boolean().required()
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
 * Test get managers hierarchy
 *
 * The service will instantiate a user from a reference and return its managers
 * hierarchy, it expects the following parameters in the POST body:
 *
 * 	- reference:	The user reference or an object containing the user code.
 * 	- minDepth:		Minimum traversal depth.
 * 	- maxDepth:		Maximum traversal depth.
 * 	- vField:		Vertex fields selector, string, array or null.
 * 	- eField:		Edge fields selector, string, array or null.
 * 	- doEdge:		Include edge, true or false.
 * 	- doStrip:		Strip private fields, true or false.
 *
 * @path		/hierarchy
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/hierarchy',
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
			// Get hierarchy.
			//
			const result = user.managers(
				request.body.minDepth,
				request.body.maxDepth,
				request.body.vField,
				request.body.eField,
				request.body.doEdge,
				request.body.doStrip
			);
			
			response.send({
				result : result,
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
	'hierarchy'
)
	.body(
		Joi.object({
			reference	: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required(),
			minDepth	: Joi.number().integer().required().default(0),
			maxDepth	: Joi.number().integer().required().default(0),
			vField		: Joi.any().required().default(null),
			eField		: Joi.any().required().default(null),
			doEdge		: Joi.boolean().required().default(false),
			doStrip		: Joi.boolean().required().default(true)
		}).required(),
		"An object with 'reference' that contains either the user structure or a string" +
		" representing the user reference."
	)
	.response(
		200,
		Joi.object(),
		"An object containing relevant information."
	)
	.summary(
		"Get user hierarchy."
	)
	.description(dd`
  Return user hierarchy.
`);


/**
 * Test get managed users
 *
 * The service will instantiate a user from a reference and return its managed
 * siblings, it expects the following parameters in the POST body:
 *
 * 	- reference:	The user reference or an object containing the user code.
 * 	- doTree:		True returns a tree as an object, false returns a flattened array.
 * 	- minDepth:		Minimum traversal depth.
 * 	- maxDepth:		Maximum traversal depth.
 * 	- vField:		Vertex fields selector, string, array or null.
 * 	- eField:		Edge fields selector, string, array or null.
 * 	- doEdge:		Include edge, true or false.
 * 	- doStrip:		Strip private fields, true or false.
 *
 * @path		/hierarchy
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/siblings',
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
			// Get hierarchy.
			//
			const result = user.manages(
				request.body.doTree,
				request.body.minDepth,
				request.body.maxDepth,
				request.body.vField,
				request.body.eField,
				request.body.doEdge,
				request.body.doStrip
			);
			
			response.send({
				result : result,
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
	'siblings'
)
	.body(
		Joi.object({
			reference	: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required(),
			doTree		: Joi.boolean().required().default(false),
			minDepth	: Joi.number().integer().required().default(0),
			maxDepth	: Joi.number().integer().required().default(0),
			vField		: Joi.any().required().default(null),
			eField		: Joi.any().required().default(null),
			doEdge		: Joi.boolean().required().default(false),
			doStrip		: Joi.boolean().required().default(true)
		}).required(),
		"An object with 'reference' that contains either the user structure or a string" +
		" representing the user reference."
	)
	.response(
		200,
		Joi.object(),
		"An object containing relevant information."
	)
	.summary(
		"Get user siblings."
	)
	.description(dd`
  Return user siblings.
`);
