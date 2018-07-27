'use strict';

/**
 * Study services
 *
 * This path is used to handle study services.
 */

//
// Frameworks.
//
const createRouter = require('@arangodb/foxx/router');	// Router class.

//
// Application.
//
const Application = require( '../utils/Application' );	// Application.

//
// Handlers.
//
const Handlers = require( '../handlers/Study' );		// Dataset handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'SMART' );


/**
 * SMART registration form
 *
 * This service can be used to request the SMART registration form, it will return
 * an object, { form : <form> }, where form is the study registration form.
 *
 * The service expects a parameter in the POST body, data, which is an object
 * containing the study registration data, if not empty, the provided data properties
 * will be added to the returned form.
 *
 * @path		/registration/form
 * @verb		post
 * @response	{Object}	The study registration form.
 */
router.post( '/registration/form', Handlers.studyRegistrationForm, 'studyRegistrationForm' )
	.body(
		require( '../models/study/studyRegistrationForm' ),
		Application.getServiceDescription(
			'study', 'studyRegistrationForm', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/study/studyRegistrationForm' ),
		Application.getServiceDescription(
			'study', 'studyRegistrationForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get study registration form"
	)
	.description(
		Application.getServiceDescription(
			'study', 'studyRegistrationForm', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Register study
 *
 * The service will create a study, it expects the post body to contain the following
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
router.post( '/registration', Handlers.studyRegistration, 'singInUser' )
	.body(
		require( '../models/study/studyRegistration' ),
		Application.getServiceDescription(
			'study', 'studyRegistration', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/study/studyRegistration' ),
		Application.getServiceDescription(
			'study', 'studyRegistration', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Register study."
	)
	.description(
		Application.getServiceDescription(
			'study', 'studyRegistration', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Study update form
 *
 * This service can be used to request the study registration form for updating
 * purposes, it will return an object, { form : <form> }, where form is the study
 * registration form.
 *
 * The service expects a parameter in the POST body, data, which is the study
 * reference. It can either be a string, in which case it must be the study _id or
 * _key, or an object containing the gid, or the nid and lid of the study.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user in the session.
 * 	- Assert the user can handle metadata.
 * 	- Resolve the study.
 * 	- Load the form structure.
 * 	- Return the form to the client.
 *
 * @path		/update/form
 * @verb		post
 * @response	{Object}	The study registration form form.
 */
router.post( '/update/form', Handlers.studyUpdateForm, 'studyUpdateForm' )
	.body(
		require( '../models/study/studyUpdateForm' ),
		Application.getServiceDescription(
			'study', 'studyUpdateForm', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/study/studyUpdateForm' ),
		Application.getServiceDescription(
			'study', 'studyUpdateForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get study registration form"
	)
	.description(
		Application.getServiceDescription(
			'study', 'studyUpdateForm', 'description', module.context.configuration.defaultLanguage )
	);
