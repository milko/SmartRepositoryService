'use strict';

/**
 * Dataset services
 *
 * This path is used to handle dataset services.
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
const Handlers = require( '../handlers/Dataset' );		// Dataset handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'dataset' );


/**
 * Dataset registration form
 *
 * This service can be used to request the dataset registration form, it will return
 * an object, { form : <form> }, where form is the dataset registration form.
 *
 * @path		/registration/form
 * @verb		get
 * @response	{Object}	The dataset registration form form.
 */
router.get( '/registration/form', Handlers.datasetRegistrationForm, 'datasetRegistrationForm' )
	.response(
		200,
		require( '../models/dataset/datasetRegistrationForm' ),
		Application.getServiceDescription(
			'dataset', 'datasetRegistrationForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get dataset registration form"
	)
	.description(
		Application.getServiceDescription(
			'dataset', 'datasetRegistrationForm', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Register dataset
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
 * @path		/registration
 * @verb		post
 * @request		{Object}	User authentication and signUp tokens, and signIn form data.
 * @response	{Object}	The result.
 */
router.post( '/registration', Handlers.datasetRegistration, 'singInUser' )
	.body(
		require( '../models/dataset/datasetRegistration' ),
		Application.getServiceDescription(
			'dataset', 'datasetRegistration', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/dataset/datasetRegistration' ),
		Application.getServiceDescription(
			'dataset', 'datasetRegistration', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Register dataset."
	)
	.description(
		Application.getServiceDescription(
			'dataset', 'datasetRegistration', 'description', module.context.configuration.defaultLanguage )
	);
