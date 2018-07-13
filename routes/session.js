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
 * @path		/user/login
 * @verb		post
 * @request		{Object}	Authentication parameters from body.
 * @response	{Object}	The current user record, or exception.
 */
router.post( '/user/login', Handlers.login, 'login' )
	.body(
		require( '../models/session/login' ),
		Application.getServiceDescription(
			'session', 'login', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/session/login' ),
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
 * User profile form
 *
 * This service can be used to request the current user's filled credentials form, it
 * will return an object, { form : <form>, user : <user> }, where form is the
 * credentials form and user is the current user record; if there is no current user,
 * the service will return null in both properties.
 *
 * @path		/user/profile/form
 * @verb		get
 * @response	{Object}	The current user record and the credentials form.
 */
router.get( '/user/profile/form', Handlers.userProfileForm, 'userProfileForm' )
	.response(
		200,
		require( '../models/session/userProfileForm' ),
		Application.getServiceDescription(
			'session', 'userProfileForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get current user profile form"
	)
	.description(
		Application.getServiceDescription(
			'session', 'userProfileForm', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * User profile
 *
 * This service can be used to change the current user's profile data, it expects the
 * data from the profile form and will return the updated user record.
 *
 * @path		/user/profile
 * @verb		post
 * @response	{Object}	The current user record and the credentials form.
 */
router.post( '/user/profile', Handlers.userProfile, 'userProfile' )
	.body(
		require( '../models/session/userProfile' ),
		Application.getServiceDescription(
			'session', 'userProfile', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/session/userProfile' ),
		Application.getServiceDescription(
			'session', 'userProfile', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Set current user profile."
	)
	.description(
		Application.getServiceDescription(
			'session', 'userProfile', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Logout
 *
 * The service will logout the current user and return the former user record;
 * if there was no former user, the service will return a null 'username' property.
 *
 * @path		/user/logout
 * @verb		get
 * @response	{Object}	Former user record.
 */
router.get( '/user/logout', Handlers.logout, 'logout' )
	.response(
		200,
		require( '../models/session/user' ),
		Application.getServiceDescription(
			'session', 'logout', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Logout current user"
	)
	.description(dd`
  Logout and return former current user.
`);


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
