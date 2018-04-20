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
 * @path		/whoami
 * @verb		get
 * @response	{Object}	{ result : <current user record>|null }.
 */
router.get( '/whoami', Handlers.whoami, 'whoami' )
	.response(
		200,
		require( '../models/whoami' ),
		Application.getServiceDescription(
			'session', 'whoami', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get current user"
	)
	.description(
		Application.getServiceDescription(
			'session', 'whoami', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Login
 *
 * The service will login a user.
 *
 * The service expects the following parameters in the body:
 * 	- username:	The user code.
 * 	- password:	The user password.
 *
 * The service will login the user, set the user _id in the session, set the user
 * record in the request and return the user record; if the user cannot be
 * authenticated:
 * 	- User not found: a 404 exception.
 * 	- Invalid credentials: a 403 exception.
 *
 * If the user is found, the service will return the object
 * { result : <user record> }; the record will be stripped of the _id, _rev, _oldRev
 * and the authentication data.
 *
 * @path		/login
 * @verb		post
 * @request		{Object}	Authentication parameters from body.
 * @response	{Object}	The current user record, or exception.
 */
router.post( '/login', Handlers.login, 'login' )
	.body(
		require( '../models/login' ),
		Application.getServiceDescription(
			'session', 'login', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/login' ),
		Application.getServiceDescription(
			'session', 'login', 'response', module.context.configuration.defaultLanguage )
	)
	.response(
		404,
		'User not found.'
	)
	.response(
		403,
		'Invalid credentials.'
	)
	.summary(
		"Login user"
	)
	.description(
		Application.getServiceDescription(
			'session', 'login', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Logout
 *
 * The service will logout the current user and return the former user record;
 * if there was no former user, the service will return a null 'username' property.
 *
 * @path		/logout
 * @verb		get
 * @response	{Object}	Former user record.
 */
router.get( '/logout', Handlers.logout, 'logout' )
	.response(
		200,
		require( '../models/whoami' ),
		Application.getServiceDescription(
			'session', 'logout', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Logout current user"
	)
	.description(dd`
  Logout and return former current user.
`);
