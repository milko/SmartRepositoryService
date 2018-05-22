'use strict';

/**
 * Test services
 *
 * This path is used to test the edge classes.
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
const Edge = require( '../../classes/Edge' );
const EdgeBranch = require( '../../classes/EdgeBranch' );
const EdgeAttribute = require( '../../classes/EdgeAttribute' );

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testEdge' );


/**
 * Test edge creation
 *
 * The service will instantiate an edge and return its data, it expects the following
 * parameters in the POST body:
 *
 * 	- collection:	Collection name.
 * 	- reference:	Either an edge reference or an edge object.
 *
 * @path		/instantiate/edge
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/instantiate/edge',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate document.
			//
			const doc =
				new Edge(
					request,
					request.body.reference,
					request.body.collection
				);
			
			//
			// Resolve document.
			//
			let resolved = false;
			if( ! doc.document.hasOwnProperty( '_rev' ) )
				resolved = doc.resolve( true, false );
			
			//
			// Insert edge.
			//
			if( ! doc.persistent )
				doc.insert();
			
			response.send({
				collection: doc.collection,
				resolved : resolved,
				persistent : doc.persistent,
				modified : doc.revised,
				data : doc.document,
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
	'instantiateEdge'
)
	.body(
		Joi.object({
			collection : Joi.string(),
			reference : Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required()
		}).required(),
		"The collection name and the edge reference or object."
	)
	.response(
		200,
		Joi.object({
			collection : Joi.string(),
			resolved : Joi.boolean(),
			persistent : Joi.boolean(),
			modified : Joi.boolean(),
			data : Joi.object(),
			time : Joi.number()
		}),
		"The result: 'data' contains the resolved edge and 'time' contains the elapsed time."
	)
	.summary(
		"Instantiate an edge object."
	)
	.description(dd`
  Instantiates and returns an edge object
`);


/**
 * Test attribute edge creation
 *
 * The service will instantiate an attribute edge and return its data, it expects the
 * following parameters in the POST body:
 *
 * 	- collection:	Collection name.
 * 	- reference:	Either an edge reference or an edge object.
 *
 * @path		/instantiate/edgeAttr
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/instantiate/edgeAttr',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate document.
			//
			const doc =
				new EdgeAttribute(
					request,
					request.body.reference,
					request.body.collection
				);
			
			//
			// Resolve document.
			//
			let resolved = false;
			if( ! doc.document.hasOwnProperty( '_rev' ) )
				resolved = doc.resolve( true, false );
			
			//
			// Insert edge.
			//
			if( ! doc.persistent )
				doc.insert();
			
			response.send({
				collection: doc.collection,
				resolved : resolved,
				persistent : doc.persistent,
				modified : doc.revised,
				data : doc.document,
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
	'instantiateEdgeAttribute'
)
	.body(
		Joi.object({
			collection : Joi.string(),
			reference : Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required()
		}).required(),
		"The collection name and the edge reference or object."
	)
	.response(
		200,
		Joi.object({
			collection : Joi.string(),
			resolved : Joi.boolean(),
			persistent : Joi.boolean(),
			modified : Joi.boolean(),
			data : Joi.object(),
			time : Joi.number()
		}),
		"The result: 'data' contains the resolved edge and 'time' contains the elapsed time."
	)
	.summary(
		"Instantiate an attribute edge object."
	)
	.description(dd`
  Instantiates and returns an attribute edge object
`);


/**
 * Test branch edge creation
 *
 * The service will instantiate a branched edge and return its data, it expects the
 * following parameters in the POST body:
 *
 * 	- collection:	Collection name.
 * 	- reference:	Either an edge reference or an edge object.
 *
 * @path		/instantiate/edgeBranch
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/instantiate/edgeBranch',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate document.
			//
			const doc =
				new EdgeBranch(
					request,
					request.body.reference,
					request.body.collection
				);
			
			//
			// Resolve document.
			//
			let resolved = false;
			if( ! doc.document.hasOwnProperty( '_rev' ) )
				resolved = doc.resolve( true, false );
			
			//
			// Insert edge.
			//
			if( ! doc.persistent )
				doc.insert();
			
			response.send({
				collection: doc.collection,
				resolved : resolved,
				persistent : doc.persistent,
				modified : doc.revised,
				data : doc.document,
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
	'instantiateEdgeBranch'
)
	.body(
		Joi.object({
			collection : Joi.string(),
			reference : Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required()
		}).required(),
		"The collection name and the edge reference or object."
	)
	.response(
		200,
		Joi.object({
			collection : Joi.string(),
			resolved : Joi.boolean(),
			persistent : Joi.boolean(),
			modified : Joi.boolean(),
			data : Joi.object(),
			time : Joi.number()
		}),
		"The result: 'data' contains the resolved edge and 'time' contains the elapsed time."
	)
	.summary(
		"Instantiate a branched edge object."
	)
	.description(dd`
  Instantiates and returns a branched edge object
`);


/**
 * Test branch edge branches management
 *
 * The service will instantiate a branched edge, then add and delete a branch, it
 * expects the following parameters in the POST body:
 *
 * 	- collection:	Collection name.
 * 	- reference:	Either an edge reference or an edge object.
 * 	- branch:		The branch to add.
 * 	- modifier:		The modifiers to add.
 *
 * @path		/manage/branch
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/manage/branch',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate document.
			//
			const doc =
				new EdgeBranch(
					request,
					request.body.reference,
					request.body.collection
				);
			
			//
			// Resolve document.
			//
			let resolved = false;
			if( ! doc.document.hasOwnProperty( '_rev' ) )
				resolved = doc.resolve( true, false );
			const original = K.function.clone( doc.document );
			
			//
			// Add branch.
			//
			const modifier = ( request.body.hasOwnProperty( 'modifier' ) )
						   ? request.body.modifier
						   : null;
			
			//
			// Add branch.
			//
			doc.addBranch( request.body.branch, modifier );
			doc.validate( true );
			const before = K.function.clone( doc._document );
			
			//
			// Delete branch.
			//
			doc.delBranch( request.body.branch );
			doc.validate( true );
			const after = doc.document;
			
			response.send({
				collection: doc.collection,
				resolved : resolved,
				persistent : doc.persistent,
				modified : doc.revised,
				original : original,
				before : before,
				after : after,
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
	'instantiateEdgeBranch'
)
	.body(
		Joi.object({
			collection : Joi.string(),
			reference : Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required(),
			branch : Joi.string().required(),
			modifier : Joi.object()
		}).required(),
		"The collection name,the edge reference or object, the branch to add and the" +
		" eventual modifiers."
	)
	.response(
		200,
		Joi.object({
			collection : Joi.string(),
			resolved : Joi.boolean(),
			persistent : Joi.boolean(),
			modified : Joi.boolean(),
			original : Joi.object(),
			before : Joi.object(),
			after : Joi.object(),
			time : Joi.number()
		}),
		"The result: 'before' contains the edge after adding the branch, 'after'" +
		" contains the edge after deleting the branch and 'time' contains the elapsed" +
		" time."
	)
	.summary(
		"Add and delete a branch from a branched edge edge."
	)
	.description(dd`
  Instantiates a branched edge, then add and delete the branch.
`);
