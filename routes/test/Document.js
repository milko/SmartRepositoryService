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
// Instantiate router.
//
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'Test Document Class' );


/**
 * Test Document class
 *
 * The service will test the Document class, the parameters should be provided in the
 * POST body and they determine which actions the service will perform.
 *
 * @path		/Document
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/Document',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Create test class.
		//
		const Document = require( '../../classes/Document' );
		class TestClass extends Document {
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
			// Instantiate class.
			//
			const document = new TestClass(
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
			// Resolve document.
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
				insert = document.insertDocument( true );
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
				replace = document.replaceDocument( true );
			
			//
			// Remove document.
			//
			let remove = null;
			if( request.body.remove )
			{
				//
				// Remove document.
				//
				remove = document.removeDocument( true );
				if( remove )
				{
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
	'Document'
)
	.body(
		Joi.object({
			doc 		: Joi.alternatives().try(
							Joi.string().required(),
							Joi.object().required()
						),
			collection 	: Joi.string(),
			data		: Joi.object(),
			insert		: Joi.boolean().required(),
			resolve		: Joi.boolean().required(),
			replace		: Joi.boolean().required(),
			remove		: Joi.boolean().required(),
			raise		: Joi.boolean().required(),
			modify		: Joi.boolean().required(),
			before		: Joi.boolean().required(),
			immutable	: Joi.boolean().required(),
			revision	: Joi.boolean().required()
		}).required(),
		"An object that contains the following parameters:" +
		"<ul>" +
		"	<li><strong>doc</strong>: Either the <code>_id</code> or <code>_key</code>" +
		" of the document, the document contents, or omit.</li>" +
		"	<li><strong>collection</strong>: The collection name, or omit if you" +
		" provided the document <code>_id</code>.</li>" +
		"	<li><strong>data</strong>: The document contents as an object, or omit.</li>" +
		"	<li><strong>insert</strong>: A boolean indicating whether to insert the" +
		" document.</li>" +
		"	<li><strong>resolve</strong>: A boolean indicating whether to resolve the" +
		" document.</li>" +
		"	<li><strong>replace</strong>: A boolean indicating whether to replace the" +
		" document.</li>" +
		"	<li><strong>remove</strong>: A boolean indicating whether to remove the" +
		" document.</li>" +
		"	<li><strong>raise</strong>: A boolean insicating whether errors should" +
		" raise exceptions.</li>" +
		"	<li><strong>modify</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> parameter contents should overwrite existing values.</li>" +
		"	<li><strong>before</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> contents should be set before resolving the" +
		" document.</li>" +
		"	<li><strong>immutable</strong>: A boolean indicating whether the" +
		" resolved document should be immutable.</li>" +
		"	<li><strong>revision</strong>: A boolean indicating whether to check" +
		" document revisions.</li>" +
		"</ul>"
	)
	.response(
		200,
		Joi.object(),
		"The result will return the provided parameters, the flags indicating which" +
		" operations were performed, the object contents and the object statistics."
	)
	.summary(
		"Instantiate a document."
	)
	.description(dd`
  Test the Document class.
`);


/**
 * Test Edge class
 *
 * The service will test the Edge class, the parameters should be provided in the
 * POST body and they determine which actions the service will perform.
 *
 * @path		/Edge
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/Edge',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Create test class.
		//
		const TestClass = require( '../../classes/Edge' );
		response.send({ result : 'ok' });
		
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
			// Instantiate class.
			//
			const document = new TestClass(
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
			// Resolve document.
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
				insert = document.insertDocument( true );
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
				replace = document.replaceDocument( true );
			
			//
			// Remove document.
			//
			let remove = null;
			if( request.body.remove )
			{
				//
				// Remove document.
				//
				remove = document.removeDocument( true );
				if( remove )
				{
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
	'Edge'
)
	.body(
		Joi.object({
			doc 		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			),
			collection 	: Joi.string(),
			data		: Joi.object(),
			insert		: Joi.boolean().required(),
			resolve		: Joi.boolean().required(),
			replace		: Joi.boolean().required(),
			remove		: Joi.boolean().required(),
			raise		: Joi.boolean().required(),
			modify		: Joi.boolean().required(),
			before		: Joi.boolean().required(),
			immutable	: Joi.boolean().required(),
			revision	: Joi.boolean().required()
		}).required(),
		"An object that contains the following parameters:" +
		"<ul>" +
		"	<li><strong>doc</strong>: Either the <code>_id</code> or <code>_key</code>" +
		" of the document, the document contents, or omit.</li>" +
		"	<li><strong>collection</strong>: The collection name, or omit if you" +
		" provided the document <code>_id</code>.</li>" +
		"	<li><strong>data</strong>: The document contents as an object, or omit.</li>" +
		"	<li><strong>insert</strong>: A boolean indicating whether to insert the" +
		" document.</li>" +
		"	<li><strong>resolve</strong>: A boolean indicating whether to resolve the" +
		" document.</li>" +
		"	<li><strong>replace</strong>: A boolean indicating whether to replace the" +
		" document.</li>" +
		"	<li><strong>remove</strong>: A boolean indicating whether to remove the" +
		" document.</li>" +
		"	<li><strong>raise</strong>: A boolean insicating whether errors should" +
		" raise exceptions.</li>" +
		"	<li><strong>modify</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> parameter contents should overwrite existing values.</li>" +
		"	<li><strong>before</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> contents should be set before resolving the" +
		" document.</li>" +
		"	<li><strong>immutable</strong>: A boolean indicating whether the" +
		" resolved document should be immutable.</li>" +
		"	<li><strong>revision</strong>: A boolean indicating whether to check" +
		" document revisions.</li>" +
		"</ul>"
	)
	.response(
		200,
		Joi.object(),
		"The result will return the provided parameters, the flags indicating which" +
		" operations were performed, the object contents and the object statistics."
	)
	.summary(
		"Instantiate an Edge document."
	)
	.description(dd`
  Test the Edge class.
`);


/**
 * Test EdgeAttribute class
 *
 * The service will test the Edge class, the parameters should be provided in the
 * POST body and they determine which actions the service will perform.
 *
 * @path		/EdgeAttribute
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/EdgeAttribute',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Create test class.
		//
		const TestClass = require( '../../classes/EdgeAttribute' );
		
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
			// Instantiate class.
			//
			const document = new TestClass(
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
			// Resolve document.
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
				insert = document.insertDocument( true );
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
				replace = document.replaceDocument( true );
			
			//
			// Remove document.
			//
			let remove = null;
			if( request.body.remove )
			{
				//
				// Remove document.
				//
				remove = document.removeDocument( true );
				if( remove )
				{
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
	'EdgeAttribute'
)
	.body(
		Joi.object({
			doc 		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			),
			collection 	: Joi.string(),
			data		: Joi.object(),
			insert		: Joi.boolean().required(),
			resolve		: Joi.boolean().required(),
			replace		: Joi.boolean().required(),
			remove		: Joi.boolean().required(),
			raise		: Joi.boolean().required(),
			modify		: Joi.boolean().required(),
			before		: Joi.boolean().required(),
			immutable	: Joi.boolean().required(),
			revision	: Joi.boolean().required()
		}).required(),
		"An object that contains the following parameters:" +
		"<ul>" +
		"	<li><strong>doc</strong>: Either the <code>_id</code> or <code>_key</code>" +
		" of the document, the document contents, or omit.</li>" +
		"	<li><strong>collection</strong>: The collection name, or omit if you" +
		" provided the document <code>_id</code>.</li>" +
		"	<li><strong>data</strong>: The document contents as an object, or omit.</li>" +
		"	<li><strong>insert</strong>: A boolean indicating whether to insert the" +
		" document.</li>" +
		"	<li><strong>resolve</strong>: A boolean indicating whether to resolve the" +
		" document.</li>" +
		"	<li><strong>replace</strong>: A boolean indicating whether to replace the" +
		" document.</li>" +
		"	<li><strong>remove</strong>: A boolean indicating whether to remove the" +
		" document.</li>" +
		"	<li><strong>raise</strong>: A boolean insicating whether errors should" +
		" raise exceptions.</li>" +
		"	<li><strong>modify</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> parameter contents should overwrite existing values.</li>" +
		"	<li><strong>before</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> contents should be set before resolving the" +
		" document.</li>" +
		"	<li><strong>immutable</strong>: A boolean indicating whether the" +
		" resolved document should be immutable.</li>" +
		"	<li><strong>revision</strong>: A boolean indicating whether to check" +
		" document revisions.</li>" +
		"</ul>"
	)
	.response(
		200,
		Joi.object(),
		"The result will return the provided parameters, the flags indicating which" +
		" operations were performed, the object contents and the object statistics."
	)
	.summary(
		"Instantiate an EdgeAttribute document."
	)
	.description(dd`
  Test the EdgeAttribute class.
`);


/**
 * Test EdgeBranch class
 *
 * The service will test the Edge class, the parameters should be provided in the
 * POST body and they determine which actions the service will perform.
 *
 * @path		/Edge
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/EdgeBranch',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Create test class.
		//
		const TestClass = require( '../../classes/EdgeBranch' );
		
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
			// Instantiate class.
			//
			const document = new TestClass(
				request,						// Current request.
				request.body.doc,				// Selector.
				request.body.collection,		// Collection.
				request.body.immutable			// Is immutable.
			);
			
			//
			// Set data before resolving.
			//
			if( request.body.before )
			{
				//
				// Set data.
				//
				if( dat !== null )
					document.setDocumentProperties(
						dat,
						request.body.modify
					);
				
				//
				// Set branch.
				//
				if( request.body.branch !== null )
					document.branchSet( request.body.branch, request.body.add );
				
				//
				// Set modifier.
				//
				if( request.body.modifier !== null )
					document.modifierSet( request.body.modifier, request.body.add );
			}
			
			//
			// Resolve document.
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
			if( ! request.body.before )
			{
				//
				// Set data.
				//
				if( dat !== null )
					document.setDocumentProperties(
						dat,
						request.body.modify
					);
				
				//
				// Set branch.
				//
				if( request.body.branch !== null )
					document.branchSet( request.body.branch, request.body.add );
				
				//
				// Set modifier.
				//
				if( request.body.modifier !== null )
					document.modifierSet( request.body.modifier, request.body.add );
			}
			
			//
			// Insert document.
			//
			let insert = null;
			if( request.body.insert )
			{
				insert = document.insertDocument( true );
				if( insert )
				{
					if( document.document.hasOwnProperty( '_id' ) )
					{
						if( ! db._exists( document.document._id ) )
							response.throw( 500,
								"Document not inserted in database." );
					}
					else
						response.throw( 500, "Insert didn't return document _id." );
				}
				else
					response.throw( 500, "Unable to insert document." );
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
				replace = document.replaceDocument( true );
			
			//
			// Remove document.
			//
			let remove = null;
			if( request.body.remove )
			{
				//
				// Remove document.
				//
				remove = document.removeDocument( true );
				if( remove )
				{
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
						response.throw( 500, "Document not deleted." );
				}
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
	'EdgeBranch'
)
	.body(
		Joi.object({
			doc 		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			),
			collection 	: Joi.string(),
			branch		: Joi.alternatives().try(
				Joi.string(),
				Joi.array(),
				null
			).required(),
			modifier	: Joi.alternatives().try(
				Joi.object(),
				null
			).required(),
			data		: Joi.object(),
			insert		: Joi.boolean().required(),
			resolve		: Joi.boolean().required(),
			replace		: Joi.boolean().required(),
			remove		: Joi.boolean().required(),
			raise		: Joi.boolean().required(),
			modify		: Joi.boolean().required(),
			add			: Joi.boolean().required(),
			before		: Joi.boolean().required(),
			immutable	: Joi.boolean().required(),
			revision	: Joi.boolean().required()
		}).required(),
		"An object that contains the following parameters:" +
		"<ul>" +
		"	<li><strong>doc</strong>: Either the <code>_id</code> or <code>_key</code>" +
		" of the document, the document contents, or omit.</li>" +
		"	<li><strong>collection</strong>: The collection name, or omit if you" +
		" provided the document <code>_id</code>.</li>" +
		"	<li><strong>data</strong>: The document contents as an object, or omit.</li>" +
		"	<li><strong>insert</strong>: A boolean indicating whether to insert the" +
		" document.</li>" +
		"	<li><strong>resolve</strong>: A boolean indicating whether to resolve the" +
		" document.</li>" +
		"	<li><strong>replace</strong>: A boolean indicating whether to replace the" +
		" document.</li>" +
		"	<li><strong>remove</strong>: A boolean indicating whether to remove the" +
		" document.</li>" +
		"	<li><strong>raise</strong>: A boolean insicating whether errors should" +
		" raise exceptions.</li>" +
		"	<li><strong>modify</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> parameter contents should overwrite existing values.</li>" +
		"	<li><strong>before</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> contents should be set before resolving the" +
		" document.</li>" +
		"	<li><strong>immutable</strong>: A boolean indicating whether the" +
		" resolved document should be immutable.</li>" +
		"	<li><strong>revision</strong>: A boolean indicating whether to check" +
		" document revisions.</li>" +
		"</ul>"
	)
	.response(
		200,
		Joi.object(),
		"The result will return the provided parameters, the flags indicating which" +
		" operations were performed, the object contents and the object statistics."
	)
	.summary(
		"Instantiate an EdgeBranch document."
	)
	.description(dd`
  Test the EdgeBranch class.
`);


/**
 * Test EdgeBranch BranchUpdate() static method
 *
 * @path		/Edge
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/EdgeBranchBranchUpdate',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Create test class.
		//
		const TestClass = require( '../../classes/EdgeBranch' );
		
		//
		// Get parameters.
		//
		const collection = ( request.body.hasOwnProperty( 'collection' ) )
						   ? request.body.collection
						   : null;
		
		//
		// Test instantiation.
		//
		try
		{
			//
			// Instantiate class.
			//
			const document = TestClass.BranchUpdate(
				request,						// Current request.
				request.body.doc,				// Selector.
				request.body.branch,			// Branch.
				request.body.modifier,			// Modifier.
				request.body.collection,		// Collection.
				request.body.add				// Add/remove flag.
			);
			
			response.send({
				params : request.body,
				result : document
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
	'EdgeBranchBranchUpdate'
)
	.body(
		Joi.object({
			doc 		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			),
			collection 	: Joi.string(),
			branch		: Joi.alternatives().try(
				Joi.string(),
				Joi.array(),
				null
			).required(),
			modifier	: Joi.alternatives().try(
				Joi.object(),
				null
			).required(),
			add			: Joi.boolean().required()
		}).required(),
		"An object that contains the following parameters:" +
		"<ul>" +
		"	<li><strong>doc</strong>: Either the <code>_id</code> or <code>_key</code>" +
		" of the document, the document contents, or omit.</li>" +
		"	<li><strong>collection</strong>: The collection name, or omit if you" +
		" provided the document <code>_id</code>.</li>" +
		"	<li><strong>data</strong>: The document contents as an object, or omit.</li>" +
		"	<li><strong>insert</strong>: A boolean indicating whether to insert the" +
		" document.</li>" +
		"	<li><strong>resolve</strong>: A boolean indicating whether to resolve the" +
		" document.</li>" +
		"	<li><strong>replace</strong>: A boolean indicating whether to replace the" +
		" document.</li>" +
		"	<li><strong>remove</strong>: A boolean indicating whether to remove the" +
		" document.</li>" +
		"	<li><strong>raise</strong>: A boolean insicating whether errors should" +
		" raise exceptions.</li>" +
		"	<li><strong>modify</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> parameter contents should overwrite existing values.</li>" +
		"	<li><strong>before</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> contents should be set before resolving the" +
		" document.</li>" +
		"	<li><strong>immutable</strong>: A boolean indicating whether the" +
		" resolved document should be immutable.</li>" +
		"	<li><strong>revision</strong>: A boolean indicating whether to check" +
		" document revisions.</li>" +
		"</ul>"
	)
	.response(
		200,
		Joi.object(),
		"The result will return the provided parameters, the flags indicating which" +
		" operations were performed, the object contents and the object statistics."
	)
	.summary(
		"Test EdgeBranch BranchUpdate() static method."
	)
	.description(dd`
  Test the EdgeBranch BranchUpdate() static method.
`);


/**
 * Test User class
 *
 * The service will test the Document class, the parameters should be provided in the
 * POST body and they determine which actions the service will perform.
 *
 * @path		/User
 * @verb		post
 * @response	{Object}	The operation result.
 */
router.post
(
	'/User',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();
		
		//
		// Create test class.
		//
		const TestClass = require( '../../classes/User' );
		
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
			// Instantiate class.
			//
			const document = new TestClass(
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
			// Resolve document.
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
				insert = document.insertDocument( true );
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
				replace = document.replaceDocument( true );
			
			//
			// Remove document.
			//
			let remove = null;
			if( request.body.remove )
			{
				//
				// Remove document.
				//
				remove = document.removeDocument( true );
				if( remove )
				{
					//
					// Init local storage.
					//
					let cursor;
					let selector;
					const group = document.group;
					const manager = document.manager;
					
					//
					// Check document.
					//
					selector = {};
					selector._id = id;
					cursor = db._collection( document.collection ).byExample( selector );
					if( cursor.count() > 0 )
						theResponse.throw( 500, "Document not deleted." );
					
					//
					// Check group relationship.
					//
					selector = {};
					selector._from = group;
					selector.predicate = 'terms/:predicate:grouped-by';
					cursor = db._collection( 'schemas' ).byExample( selector );
					if( cursor.count() > 0 )
						theResponse.throw( 500, "Group relationships not deleted." );
					
					//
					// Check manager relationship.
					//
					selector = {};
					selector._from = group;
					selector.predicate = 'terms/:predicate:managed-by';
					cursor = db._collection( 'schemas' ).byExample( selector );
					if( cursor.count() > 0 )
						theResponse.throw( 500, "Group relationships not deleted." );
				}
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
					group	   : document.group,
					manager	   : document.manager,
					manages	   : document.manages,
					document   : document.document,
				},
				stats  : {
					significant: document.significantFields,
					required   : document.requiredFields,
					locked	   : document.lockedFields,
					managers   : document.managers(1,null,'_id',null,false,false),
					managed	   : document.managed(true,1,0,'_id',null,false,true)
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
	'User'
)
	.body(
		Joi.object({
			doc 		: Joi.alternatives().try(
				Joi.string().required(),
				Joi.object().required()
			),
			collection 	: Joi.string(),
			data		: Joi.object(),
			insert		: Joi.boolean().required(),
			resolve		: Joi.boolean().required(),
			replace		: Joi.boolean().required(),
			remove		: Joi.boolean().required(),
			raise		: Joi.boolean().required(),
			modify		: Joi.boolean().required(),
			before		: Joi.boolean().required(),
			immutable	: Joi.boolean().required(),
			revision	: Joi.boolean().required()
		}).required(),
		"An object that contains the following parameters:" +
		"<ul>" +
		"	<li><strong>doc</strong>: Either the <code>_id</code> or <code>_key</code>" +
		" of the document, the document contents, or omit.</li>" +
		"	<li><strong>collection</strong>: The collection name, or omit if you" +
		" provided the document <code>_id</code>.</li>" +
		"	<li><strong>data</strong>: The document contents as an object, or omit.</li>" +
		"	<li><strong>insert</strong>: A boolean indicating whether to insert the" +
		" document.</li>" +
		"	<li><strong>resolve</strong>: A boolean indicating whether to resolve the" +
		" document.</li>" +
		"	<li><strong>replace</strong>: A boolean indicating whether to replace the" +
		" document.</li>" +
		"	<li><strong>remove</strong>: A boolean indicating whether to remove the" +
		" document.</li>" +
		"	<li><strong>raise</strong>: A boolean insicating whether errors should" +
		" raise exceptions.</li>" +
		"	<li><strong>modify</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> parameter contents should overwrite existing values.</li>" +
		"	<li><strong>before</strong>: A boolean indicating whether the provided" +
		" <strong>data</strong> contents should be set before resolving the" +
		" document.</li>" +
		"	<li><strong>immutable</strong>: A boolean indicating whether the" +
		" resolved document should be immutable.</li>" +
		"	<li><strong>revision</strong>: A boolean indicating whether to check" +
		" document revisions.</li>" +
		"</ul>"
	)
	.response(
		200,
		Joi.object(),
		"The result will return the provided parameters, the flags indicating which" +
		" operations were performed, the object contents and the object statistics."
	)
	.summary(
		"Instantiate a user."
	)
	.description(dd`
  Test the User class.
`);


/**
 * Test test
 *
 * The service will test the Document class, the parameters should be provided in the
 * POST body and they determine which actions the service will perform.
 *
 * @path		/User
 * @verb		get
 * @response	{Object}	The operation result.
 */
router.get
(
	'/Transac',
	(request, response) =>
	{
		//
		// Declare transaction.
		//
		const transaction = () => {
			//
			// Create test class.
			//
			const TestClass = require( '../../classes/Document' );
			
			//
			// Add three documents to test collection.
			//
			let doc;
			doc = new TestClass( request, {_key: "baba4"}, "test" );
			doc.insertDocument( true );
			doc = new TestClass( request, {_key: "baba5"}, "test" );
			doc.insertDocument( true );
			doc = new TestClass( request, {_key: "baba3"}, "test" );
			doc.insertDocument( true );
			
			return true;
		};
		
		//
		// Test instantiation.
		//
		try
		{
			const result = db._executeTransaction({
				collections: {
					write: [ "test" ],
					read: [ "test" ]
				},
				action: transaction
			});
			
			response.send({ result : result});
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
	'Transac'
)
	.response(
		200,
		Joi.object(),
		"The result will return the provided parameters, the flags indicating which" +
		" operations were performed, the object contents and the object statistics."
	)
	.summary(
		"Instantiate a user."
	)
	.description(dd`
  Test the User class.
`);
