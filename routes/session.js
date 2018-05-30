'use strict';

/**
 * Session services
 *
 * This path is used to handle session services, these services deal with the current
 * session and provide operations such as ping, ligin and logout.
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
const Handlers = require( '../handlers/Session' );		// Session handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'session' );


/**
 * Ping
 *
 * The service can be used to check whether the application is responding, it will
 * return the object { result ; "pong" }.
 *
 * @path		/ping
 * @verb		get
 * @response	{Object}	{ response : 'pong }.
 */
router.get( '/ping', Handlers.ping, 'ping' )
	.response(
		200,
		Joi.object({
			result : Joi.any().valid('pong').required()
		}),
		Application.getServiceDescription(
			'session', 'ping', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Check if services are responding."
	)
	.description(
		Application.getServiceDescription(
			'session', 'ping', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Current user
 *
 * This service will return the current session user record, the response will be the
 * object { result : <user record> }, if there is a current record, or { result : null
  * } if there is no current user.
 *
 * @path		/user
 * @verb		get
 * @response	{Object}	{ result : <current user record>|null }.
 */
router.get( '/user', Handlers.user, 'user' )
	.response(
		200,
		require( '../models/session/user' ),
		Application.getServiceDescription(
			'session', 'user', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get current user"
	)
	.description(
		Application.getServiceDescription(
			'session', 'user', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Current user hierarchy
 *
 * This service will return the current session user hierarchy as an array, starting
 * from the current user and ending with the root manager.
 *
 * If there is no current user, the service will return null.
 *
 * The response is an object, { result: <value> }, where value is the hierarchy list
 * array, or null.
 *
 * The service expects the following parameters, all optional:
 *
 * 	- minDepth:		Minimum traversal depth, a numeric where 0 means start with
 * 					traversal origin and greater values start at higher levels; null
 * 					means ignore parameter. (Defaults to 0)
 * 	- maxDepth:		Maximum traversal depth, a numeric where 0 means traverse the
 * 					whole graph and greater values represent the traversal limit; null
 * 					means ignore parameter. (Defaults to 0)
 * 	- doEdge:		If true, the result will be an object with two properties: _vertex
 * 					will contain the user and _edge will contain the edge. (Defaults
 * 					to false)
 *
 * @path		/user/managers
 * @verb		post
 * @response	{Object}	{ result : <current user hierarchy> }.
 */
router.post( '/user/managers', Handlers.managers, 'managers' )
	.body(
		require( '../models/session/managers' ),
		Application.getServiceDescription(
			'session', 'managers', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/session/managers' ),
		Application.getServiceDescription(
			'session', 'managers', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get current user manager hierarchy."
	)
	.description(
		Application.getServiceDescription(
			'session', 'managers', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Current user managed list
 *
 * This service will return the list of users managed by the current session user, the
 * service will return the hierarchical tree as an object, where _children will
 * contain the list of managed users, or the flattened array of all managed siblings.
 *
 * If there is no current user, the service will return null.
 *
 * The response is an object, { result: <value> }, where value is the service result.
 *
 * The service expects the following parameters, all optional:
 *
 * 	- doTree:		If true, the result will be the hierarchy tree object, starting
 * 					from the current user and ending with the managed leaf siblings,
 * 					with a _children field that will contain the array of managed users.
 * 					(Defaults to true)
 * 	- doEdge:		If true, the result will be an object with two properties: _vertex
 * 					will contain the user and _edge will contain the edge.
 * 					(Defaults to false)
 * 	- minDepth:		Minimum traversal depth, a numeric where 0 means start with
 * 					traversal origin and greater values start at higher levels; null
 * 					means ignore parameter.
 * 					(Defaults to 0)
 * 	- maxDepth:		Maximum traversal depth, a numeric where 0 means traverse the
 * 					whole graph and greater values represent the traversal limit; null
 * 					means ignore parameter.
 * 					(Defaults to 0)
 *
 * @path		/user/managed
 * @verb		post
 * @response	{Object}	{ result : <current user managed siblings hierarchy> }.
 */
router.post( '/user/manages', Handlers.manages, 'manages' )
	.body(
		require( '../models/session/manages' ),
		Application.getServiceDescription(
			'session', 'manages', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/session/manages' ),
		Application.getServiceDescription(
			'session', 'manages', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get current user managed hierarchy."
	)
	.description(
		Application.getServiceDescription(
			'session', 'manages', 'description', module.context.configuration.defaultLanguage )
	);
