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

//
// Models.
//
const SchemaWhoami = require( '../models/whoami' );		// WhoamI schema.
const SchemaLogin = require( '../models/login' );		// LogIn schema.

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
router.get(

	//
	// Path.
	//
	'/ping',

	//
	// Handler.
	//
	Handlers.ping,

	//
	// Name.
	//
	'ping'
)
	.response(
		200,
		Joi.object({
			result : Joi.any().valid('pong').required()
		}),
		"The object { result : 'pong' }."
	)
	.summary(
		"Check if application responds"
	)
	.description(dd`
  Check if the application is responding, expect the object { result : 'pong' }.
`);


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
router.get(

	//
	// Path.
	//
	'/whoami',

	//
	// Handler.
	//
	Handlers.whoami,

	//
	// Name.
	//
	'whoami'
)
	.response(
		200,
		SchemaWhoami,
		'The user profile, or a null "result" property.'
	)
	.summary(
		"Get current user"
	)
	.description(dd`
  Return the current user.
`);


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
router.post(

	//
	// Path.
	//
	'/login',

	//
	// Handler.
	//
	Handlers.login,

	//
	// Name.
	//
	'login'
)
	.body(
		SchemaLogin,
		'User credentials: username and password.'
	)
	.response(
		200,
		SchemaLogin,
		'The user record.'
	)
	.response(
		404,
		'User not found.'
	)
	.response(
		403,
		'Invalid password.'
	)
	.summary(
		"Login user"
	)
	.description(dd`
  Login user and return record.
`);
