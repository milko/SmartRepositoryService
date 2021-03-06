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
 * Sign-up administrator form
 *
 * The service will return the system administrator user sign-up form, it expects the post
 * body to contain the following fields:
 *
 * 	- token:	The administrator authentication token.
 *
 * The service returns an object { result : <value> } where the value represents the
 * system administrator sign-up form.
 *
 * The service will perform the following assertions:
 *
 * 	- Assert there are no users in the users collection.
 * 	- Validate the authentication token.
 * 	- Load the administration user form.
 * 	- Return the form to the client.
 *
 * The service may raise an exception, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/signup/admin/form
 * @verb		post
 * @request		{Object}	Admin authentication token and admin record.
 * @response	{Object}	The result.
 */
router.post( '/signup/admin/form', Handlers.signUpAdminForm, 'singUpAdmin' )
	.body(
		require( '../models/user/signUpAdminForm' ),
		Application.getServiceDescription(
			'admin', 'signup', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signUpAdminForm' ),
		Application.getServiceDescription(
			'admin', 'signup', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Register system administrator user."
	)
	.description(
		Application.getServiceDescription(
			'admin', 'signup', 'description', module.context.configuration.defaultLanguage )
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
 * @request		{Object}	Admin authentication token and admin record.
 * @response	{Object}	The result.
 */
router.post( '/signin/admin', Handlers.signinAdmin, 'singInAdmin' )
	.body(
		require( '../models/user/signInAdmin' ),
		Application.getServiceDescription(
			'admin', 'signin', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signInAdmin' ),
		Application.getServiceDescription(
			'admin', 'signin', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Create system administrator user."
	)
	.description(
		Application.getServiceDescription(
			'admin', 'signin', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Sign-up user form
 *
 * The service will return the signup form, the service expects the following parameters
 * in the POST body:
 *
 * 	- token:	the user authentication token.
 *
 * The service will perform the following steps:
 *
 * 	- Validate the user authentication token.
 * 	- Load the 'terms/:form:signup' form.
 * 	- Return the form contents.
 *
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/signup/user/form
 * @verb		post
 * @request		{Object}	User authentication and signUp tokens.
 * @response	{Object}	The result.
 */
router.post( '/signup/user/form', Handlers.signUpUserForm, 'signUpUserForm' )
	.body(
		require( '../models/user/signUpUserForm' ),
		Application.getServiceDescription(
			'user', 'signupForm', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signUpUserForm' ),
		Application.getServiceDescription(
			'user', 'signupForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Retrieve user registration form."
	)
	.description(
		Application.getServiceDescription(
			'user', 'signupForm', 'description', module.context.configuration.defaultLanguage )
	);


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
 * @path		/signup/user
 * @verb		post
 * @request		{Object}	User auth token and signup form contents.
 * @response	{Object}	The result.
 */
router.post( '/signup/user', Handlers.signUpUser, 'signUpUser' )
	.body(
		require( '../models/user/signUpUser' ),
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
		"Register user."
	)
	.description(
		Application.getServiceDescription(
			'user', 'signup', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Sign-in user form
 *
 * The service will decode the provided signUp token and return its contents in the
 * signIn form, the service expects the following parameters in the POST body:
 *
 * 	- token:	the user authentication token.
 * 	- encoded:	the sign up token.
 *
 * The service will perform the following steps:
 *
 * 	- Validate the user authentication token.
 * 	- Decode the sign up token.
 * 	- Load the 'terms/:form:signin' form.
 * 	- Return the decoded sign up contents in the sign in form.
 *
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/signin/user/form
 * @verb		post
 * @request		{Object}	User authentication and signUp tokens.
 * @response	{Object}	The result.
 */
router.post( '/signin/user/form', Handlers.signInUserForm, 'signInUserForm' )
	.body(
		require( '../models/user/signInUserForm' ),
		Application.getServiceDescription(
			'user', 'signinForm', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signInUserForm' ),
		Application.getServiceDescription(
			'user', 'signinForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Retrieve user creation form."
	)
	.description(
		Application.getServiceDescription(
			'user', 'signinForm', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Activate user
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
 * @request		{Object}	User authentication and signUp tokens, and signIn form data.
 * @response	{Object}	The result.
 */
router.post( '/signin/user', Handlers.signInUser, 'singnInUser' )
	.body(
		require( '../models/user/signInUser' ),
		Application.getServiceDescription(
			'user', 'signin', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signInUser' ),
		Application.getServiceDescription(
			'user', 'signin', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Create user."
	)
	.description(
		Application.getServiceDescription(
			'user', 'signin', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Reset user
 *
 * The service is used to reset a user, that is, re-route the login through the sign
 * in. It will reset the user's password and return the same token as the sign up
 * service: the returned token can be used in the same way as the token returned by
 * the signUp service. The service expects two parameters in the POST body:
 *
 * 	- token:	the user authentication token.
 * 	- username:	the user code.
 *
 * The service will perform the following steps:
 *
 * 	- Validate the user authentication token.
 * 	- Resolve the provided username.
 * 	- Check that there is no current user in the session, or that the current user
 * 	  can manage the provided user reference.
 * 	- Set the user status to pending.
 * 	- Set random password.
 * 	- Encode the username and password.
 * 	- Create the authorisation data.
 * 	- Replace the user.
 * 	- Return the encoded user record token.
 *
 * The service may raise an exception, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/reset
 * @verb		post
 * @request		{Object}	User authentication token and user code.
 * @response	{Object}	The result.
 */
router.post( '/reset', Handlers.reset, 'resetUser' )
	.body(
		require( '../models/user/reset' ),
		Application.getServiceDescription(
			'user', 'reset', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/reset' ),
		Application.getServiceDescription(
			'user', 'reset', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Reset user."
	)
	.description(
		Application.getServiceDescription(
			'user', 'reset', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Remove user
 *
 * The service is used to remove a user, the service expects two parameters in the POST body:
 *
 * 	- token:	the user authentication token.
 * 	- username:	the user code.
 *
 * The service will perform the following steps:
 *
 * 	- Validate the user authentication token.
 * 	- Resolve the provided username.
 * 	- Check that the current user can manage the provided user reference.
 * 	- Transfer the user's managed under the user's manager.
 * 	- Remove the user.
 *
 * The service may raise an exception, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/remove
 * @verb		post
 * @request		{Object}	User authentication token and user code.
 * @response	{Object}	The result.
 */
router.post( '/remove', Handlers.remove, 'removeUser' )
	.body(
		require( '../models/user/reset' ),
		Application.getServiceDescription(
			'user', 'remove', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/reset' ),
		Application.getServiceDescription(
			'user', 'remove', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Remove user."
	)
	.description(
		Application.getServiceDescription(
			'user', 'remove', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Chande user code
 *
 * The service is used to modify the user code, it is used by a manager to change the
 * username of a managed user. The service expects two parameters in the POST body:
 *
 * 	- token:	the user authentication token.
 * 	- old:		the old user code.
 * 	- new:		the new user code.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user.
 * 	- Validate the user authentication token.
 * 	- Resolve the provided old username.
 * 	- Ensure the current user can manage the resolved user.
 * 	- Assert the new username does not exist.
 * 	- Update the username in the collection.
 * 	- Return the updated username.
 *
 * The service may raise an exception, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/change/code
 * @verb		post
 * @request		{Object}	User authentication token, old and new usernames.
 * @response	{Object}	The result.
 */
router.post( '/change/code', Handlers.changeUsername, 'changeUserCode' )
	.body(
		require( '../models/user/changeUsername' ),
		Application.getServiceDescription(
			'user', 'setUsername', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/changeUsername' ),
		Application.getServiceDescription(
			'user', 'setUsername', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Change user code."
	)
	.description(
		Application.getServiceDescription(
			'user', 'setUsername', 'description', module.context.configuration.defaultLanguage )
	);
