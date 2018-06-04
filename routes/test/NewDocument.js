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
const db = require('@arangodb').db;						// Database.
const time = require('@arangodb').time;					// Timer functions.
const createAuth = require('@arangodb/foxx/auth');		// Authentication framework.
const createRouter = require('@arangodb/foxx/router');	// Router class.

//
// Instantiate test object.
//
const NewDocument = require( '../../classes/NewDocument' );
class TestDocument extends NewDocument {
	get significantFields() {
		return super.significantFields.concat([ ['var'] ]);																	// ==>
	}
	get requiredFields() {
		return super.requiredFields.concat(['var']);																	// ==>
	}
	get uniqueFields() {
		return super.uniqueFields.concat(['var']);																	// ==>
	}
	get lockedFields() {
		return super.lockedFields.concat(['var']);																	// ==>
	}
}

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testNewDocument' );


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
		const dat = ( request.body.hasOwnProperty( 'data' ) )
					? request.body.data
					: null;
		const collection = ( request.body.hasOwnProperty( 'collection' ) )
					? request.body.collection
					: null;
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate user.
			//
			const document = new TestDocument(
				request,						// Current request.
				request.body.doc,				// Selector.
				request.body.collection,		// Collection.
				request.body.immutable			// Is immutable.
			);
			
			//
			// Set data before resolving.
			//
			if( (dat !== null)
			 && request.body.before )
				document.setDocumentProperties(
					dat,
					request.body.modify
				);
			
			//
			// Resolve user.
			//
			let resolve = null;
			if( request.body.resolve )
				resolve = document.resolveDocument(
					request.body.modify,
					request.body.raise
				);
			
			//
			// Set data after resolving.
			//
			if( (dat !== null)
			 && (! request.body.before) )
				document.setDocumentProperties(
					dat,
					request.body.modify
				);
			
			//
			// Insert document.
			//
			let insert = null;
			if( request.body.insert )
			{
				insert = document.insertDocument();
				if( insert )
				{
					if( ! db._exists( document.document ) )
						theResponse.throw( 500, "Document not inserted." );
				}
			}
			
			//
			// Save identifier.
			//
			let id = undefined;
			if( document.persistent )
				id = document.document._id;
			
			//
			// Replace document.
			//
			let replace = null;
			if( request.body.replace )
				replace = document.replaceDocument(
					request.body.revision
				);
			
			//
			// Remove document.
			//
			let remove = null;
			if( request.body.remove )
			{
				//
				// Remove document.
				//
				remove = document.removeDocument();
				
				//
				// Validate removal.
				//
				let cursor;
				const selector = {};
				
				//
				// Check document.
				//
				selector._id = id;
				cursor = db._collection( document.collection ).byExample( selector );
				if( cursor.count() > 0 )
					theResponse.throw( 500, "Document not deleted." );
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
					collection : document.collection,
					instance   : document.instance,
					persistent : document.persistent,
					revised	   : document.revised,
					document   : document.document,
				},
				stats  : {
					significant: document.significantFields,
					required   : document.requiredFields,
					locked	   : document.lockedFields
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
			doc 		: Joi.alternatives().try(
							Joi.string().required(),
							Joi.object().required()
						),
			collection 	: Joi.string(),
			data		: Joi.object(),
			immutable	: Joi.boolean().required(),
			raise		: Joi.boolean().required(),
			modify		: Joi.boolean().required(),
			before		: Joi.boolean().required(),
			insert		: Joi.boolean().required(),
			resolve		: Joi.boolean().required(),
			replace		: Joi.boolean().required(),
			remove		: Joi.boolean().required(),
			revision	: Joi.boolean().required()
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
