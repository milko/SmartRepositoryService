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
const Document = require( '../../classes/Document' );

//
// Instantiate router.
//
const auth = createAuth();
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testDocument' );


/**
 * Test document creation
 *
 * The service will instantiate a document and return its data, it expects the following
 * parameters in the POST body:
 *
 * 	- collection:	Collection name.
 * 	- reference:	Either a document reference or an object.
 *
 * @path		/instantiate/document
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/instantiate/document',
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
				new Document(
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
				modified : doc.modified,
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
			collection : Joi.string().required(),
			reference : Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			).required()
		}).required(),
		"The collection name and the document reference or object."
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
		"The result: 'data' contains the resolved document and 'time' contains the" +
		" elapsed time."
	)
	.summary(
		"Instantiate a document."
	)
	.description(dd`
  Instantiates and returns a document.
`);
