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
router.tag( 'study' );


/**
 * Study registration form
 *
 * This service can be used to request the study registration form, it will return
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
 * The service will register a study, it expects the following object in the body:
 *
 * 	- data:	 the study registration form contents.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user in the session.
 * 	- Assert the user can handle metadata.
 * 	- Validate form data.
 * 	- Insert the study.
 * 	- Insert the user registration reference.
 * 	- Return the registration record.
 *
 * The service returns the administrator user record.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/registration
 * @verb		post
 * @request		{Object}	User authentication and signUp tokens, and signIn form data.
 * @response	{Object}	The result.
 */
router.post( '/registration', Handlers.studyRegistration, 'studyRegistration' )
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
		"Get study update form"
	)
	.description(
		Application.getServiceDescription(
			'study', 'studyUpdateForm', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Update study
 *
 * The service will update the provided study, it expects the following object
 * in the body:
 *
 * 	- data:	 the study update form contents.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user in the session.
 * 	- Assert the user can handle metadata.
 * 	- Validate form data.
 * 	- Replace the study.
 * 	- Return the study record.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/registration
 * @verb		post
 * @request		{Object}	User authentication and signUp tokens, and signIn form data.
 * @response	{Object}	The result.
 */
router.post( '/update', Handlers.studyUpdate, 'studyUpdate' )
	.body(
		require( '../models/study/studyRegistration' ),
		Application.getServiceDescription(
			'study', 'studyUpdate', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/study/studyRegistration' ),
		Application.getServiceDescription(
			'study', 'studyUpdate', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Update study."
	)
	.description(
		Application.getServiceDescription(
			'study', 'studyUpdate', 'description', module.context.configuration.defaultLanguage )
	);
