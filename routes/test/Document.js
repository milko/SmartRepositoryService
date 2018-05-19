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
const Joi = require('joi');								// Validation framework.
const time = require('@arangodb').time;					// Timer functions.
const createAuth = require('@arangodb/foxx/auth');		// Authentication framework.
const createRouter = require('@arangodb/foxx/router');	// Router class.

//
// Instantiate objects.
//
const Document = require( '../../classes/Document' );

//
// Instantiate router.
//
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
					( request.body.hasOwnProperty( 'collection' ) ) ? request.body.collection : null
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
				revised : doc.revised,
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
		"The collection name and the document reference or object."
	)
	.response(
		200,
		Joi.object({
			collection : Joi.string(),
			resolved : Joi.boolean(),
			persistent : Joi.boolean(),
			revised : Joi.boolean(),
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
