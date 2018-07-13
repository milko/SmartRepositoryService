'use strict';

/**
 * Init services
 *
 * This path is used to initialise database resources.
 */

//
// Frameworks.
//
const dd = require('dedent');							// For multiline text.
const Joi = require('joi');								// Validation framework.
const createRouter = require('@arangodb/foxx/router');	// Router class.

//
// Application.
//
const K = require( '../utils/Constants' );				// Constants.
const Application = require( '../utils/Application' );	// Application.

//
// Handlers.
//
const Handlers = require( '../handlers/Init' );			// Init handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'init' );


/**
 * Init descriptors
 *
 * The service should be used to initialise the descriptors.
 *
 * @path		/descriptors
 * @verb		get
 * @response	{Object}	{ result : something }.
 */
router.get( '/descriptors', Handlers.initDescriptors, 'descriptors' )
	.response(
		200,
		Joi.object({
			result : Joi.any().required()
		}),
		Application.getServiceDescription(
			'init', 'descriptors', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Initialise descriptors."
	)
	.description(
		Application.getServiceDescription(
			'init', 'descriptors', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Init shapes
 *
 * The service should be used to initialise the shapes.
 *
 * @path		/shapes
 * @verb		get
 * @response	{Object}	{ result : something }.
 */
router.get( '/shapes', Handlers.initShapes, 'shapes' )
	.response(
		200,
		Joi.object({
			result : Joi.any().required()
		}),
		Application.getServiceDescription(
			'init', 'shapes', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Initialise shapes."
	)
	.description(
		Application.getServiceDescription(
			'init', 'shapes', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Init toponyms
 *
 * The service should be used to initialise the toponyms.
 *
 * @path		/shapes
 * @verb		get
 * @response	{Object}	{ result : something }.
 */
router.get( '/toponyms', Handlers.initToponyms, 'toponyms' )
	.response(
		200,
		Joi.object({
			result : Joi.any().required()
		}),
		Application.getServiceDescription(
			'init', 'toponyms', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Initialise toponyms."
	)
	.description(
		Application.getServiceDescription(
			'init', 'toponyms', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Init terms
 *
 * The service should be used to initialise the terms.
 *
 * @path		/shapes
 * @verb		get
 * @response	{Object}	{ result : something }.
 */
router.get( '/terms', Handlers.initTerms, 'terms' )
	.response(
		200,
		Joi.object({
			result : Joi.any().required()
		}),
		Application.getServiceDescription(
			'init', 'terms', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Initialise terms."
	)
	.description(
		Application.getServiceDescription(
			'init', 'terms', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Init edges
 *
 * The service should be used to initialise the edges.
 *
 * @path		/edges
 * @verb		get
 * @response	{Object}	{ result : something }.
 */
router.get( '/edges', Handlers.initEdges, 'edges' )
	.response(
		200,
		Joi.object({
			result : Joi.any().required()
		}),
		Application.getServiceDescription(
			'init', 'edges', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Initialise edges."
	)
	.description(
		Application.getServiceDescription(
			'init', 'edges', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Init schemas
 *
 * The service should be used to initialise the schemas.
 *
 * @path		/schemas
 * @verb		get
 * @response	{Object}	{ result : something }.
 */
router.get( '/schemas', Handlers.initSchemas, 'schemas' )
	.response(
		200,
		Joi.object({
			result : Joi.any().required()
		}),
		Application.getServiceDescription(
			'init', 'schemas', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Initialise schemas."
	)
	.description(
		Application.getServiceDescription(
			'init', 'schemas', 'description', module.context.configuration.defaultLanguage )
	);
