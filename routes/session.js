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
