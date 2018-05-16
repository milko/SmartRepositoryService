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
 * Create administrator user
 *
 * The service will create the system administrator user, it expects the post body to
 * contain the following fields:
 *
 * 	- token:	The administrator authentication token.
 * 	- data:		The contents of the administrator form:
 * 		- name:		The user full name.
 * 		- password:	The user password.
 * 		- email:	The user e-mail address.
 * 		- language:	The user preferred language.
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
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/user/admin
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
 */
router.post( '/signin/admin', Handlers.admin, 'admin' )
	.body(
		require( '../models/user/signinUser' ),
		Application.getServiceDescription(
			'user', 'admin', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signinUser' ),
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
 * Signup user
 *
 * The service will register a new user, it expects two parameters in the POST body:
 *
 * 	- token:	The user authentication token.
 * 	- data:		The contents of the signup form:
 * 		- username:	The user code; can be omitted, if that is the case, it will be set
 * 					to the user e-mail.
 * 		- name:		The user full name.
 * 		- email:	The user e-mail address.
 * 		- language:	The user preferred language; can be omitted, if that is the case,
 * 					it will be set to the default application language.
 * 		- rank:		The user rank.
 * 		- role:		The user roles.
 * 		- group:	The user group; can be omitted.
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
 * @path		/user/admin
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
 */
router.post( '/signup', Handlers.signUp, 'signup' )
	.body(
		require( '../models/user/signupUser' ),
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
