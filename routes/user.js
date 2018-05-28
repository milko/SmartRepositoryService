'use strict';

/**
 * User services
 *
 * This path is used to handle user services.
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
const Application = require( '../utils/Application' );	// Application.

//
// Handlers.
//
const Handlers = require( '../handlers/User' );			// User handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'user' );


/**
 * Signup user
 *
 * The service will register a new user, it expects two parameters in the POST body:
 *
 * 	- token:	The user authentication token.
 * 	- data:		The contents of the signup form.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user in the session.
 * 	- Assert the current user can manage other users.
 * 	- Validate the user authentication token.
 * 	- Validate form data.
 * 	- Set the user status to pending.
 * 	- Set username and password.
 * 	- Encode the user record.
 * 	- Create the authorisation data.
 * 	- Insert the user.
 * 	- Set the user manager.
 * 	- Return the encoded user record token.
 *
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/signup
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
 */
router.post( '/signup', Handlers.signUp, 'signup' )
	.body(
		require( '../models/user/signUp' ),
		Application.getServiceDescription(
			'user', 'signup', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		Joi.string().required(),
		Application.getServiceDescription(
			'user', 'signup', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Signup user."
	)
	.description(
		Application.getServiceDescription(
			'user', 'signup', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Signup user form
 *
 * The service will return the contents of the sign up service token, it expects two
 * parameters in the POST body:
 *
 * 	- token:	the user authentication token.
 * 	- encoded:	the sign up token.
 *
 * The service will perform the following steps:
 *
 * 	- Validate the user authentication token.
 * 	- Decode the sign up token.
 * 	- Return the decoded sign up contents.
 *
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/signup/form
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
 */
router.post( '/signup/form', Handlers.signUpForm, 'signupForm' )
	.body(
		require( '../models/user/signUpForm' ),
		Application.getServiceDescription(
			'user', 'signupForm', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signUpForm' ),
		Application.getServiceDescription(
			'user', 'signupForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Retrieve signup form contents."
	)
	.description(
		Application.getServiceDescription(
			'user', 'signupForm', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Create administrator user
 *
 * The service will create the system administrator user, it expects the post body to
 * contain the following fields:
 *
 * 	- token:	The administrator authentication token.
 * 	- data:		The contents of the administrator form.
 *
 * The service returns an object { result : <value> } where the value
 * represents the newly created user.
 *
 * The service will perform the following assertions:
 *
 * 	- Assert there are no users in the users collection.
 * 	- Validate the authentication token.
 * 	- Validate form data.
 * 	- Complete the user record.
 * 	- Create the authorisation data.
 * 	- Insert the user.
 * 	- Update the session.
 * 	- Return the user.
 *
 * The service may raise an exception, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/signin/admin
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
 */
router.post( '/signin/admin', Handlers.signinAdmin, 'singInAdmin' )
	.body(
		require( '../models/user/signInAdmin' ),
		Application.getServiceDescription(
			'user', 'admin', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signInAdmin' ),
		Application.getServiceDescription(
			'user', 'admin', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Create system administrator user."
	)
	.description(
		Application.getServiceDescription(
			'user', 'admin', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Create user
 *
 * The service will create a user, it expects the post body to contain the following
 * fields:
 *
 * 	- token:	the user authentication token.
 * 	- encoded: 	the sign up token.
 * 	- data:		the signin form contents.
 *
 * The service returns an object { result : <value> } where the value
 * represents the newly created user.
 *
 * The service will perform the following assertions:
 *
 * 	- Validate the user authentication token.
 * 	- Validate form data.
 * 	- Load user record.
 * 	- Authenticate the user.
 * 	- Update the authorisation data.
 * 	- Remove the status.
 * 	- Replace the user.
 * 	- Update the session.
 * 	- Return the user.
 *
 * The service may raise an exception, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/signin/user
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
 */
router.post( '/signin/user', Handlers.signinUser, 'singInUser' )
	.body(
		require( '../models/user/signIn' ),
		Application.getServiceDescription(
			'user', 'signin', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signIn' ),
		Application.getServiceDescription(
			'user', 'signin', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Create system administrator user."
	)
	.description(
		Application.getServiceDescription(
			'user', 'signin', 'description', module.context.configuration.defaultLanguage )
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
		require( '../models/user/login' ),
		Application.getServiceDescription(
			'user', 'login', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/login' ),
		Application.getServiceDescription(
			'user', 'login', 'response', module.context.configuration.defaultLanguage )
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
			'user', 'login', 'description', module.context.configuration.defaultLanguage )
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
		require( '../models/user/whoami' ),
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
		require( '../models/user/whoami' ),
		Application.getServiceDescription(
			'session', 'logout', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Logout current user"
	)
	.description(dd`
  Logout and return former current user.
`);
