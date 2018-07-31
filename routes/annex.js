'use strict';

/**
 * SMART annex services
 *
 * This path is used to handle study SMART annex file services.
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
const Handlers = require( '../handlers/Annex' );		// Annex handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'annex' );


/**
 * Return the SMART dataset annex registration form
 *
 * This service can be used to retrieve the annex registration form, the service
 * expects two parameters in the POST body:
 *
 * 	- study:		The study reference provided as:
 * 		- string:	The study _id or _key.
 * 		- object:	The study significant fields.
 * 	- data:			The eventual annex data record or an empty object.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user in the session.
 * 	- Assert the user can handle metadata.
 * 	- Resolve the study.
 * 	- Load the form structure.
 * 	- Return the form to the client.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/SMART/registration/form
 * @verb		post
 * @response	{Object}	The study registration form.
 */
router.post( '/SMART/registration/form', Handlers.smartRegistrationForm, 'smartRegistrationForm' )
	.body(
		require( '../models/annex/smartRegistrationForm' ),
		Application.getServiceDescription(
			'SMART', 'smartRegistrationForm', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/annex/smartRegistrationForm' ),
		Application.getServiceDescription(
			'SMART', 'smartRegistrationForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get study SMART dataset annex registration form"
	)
	.description(
		Application.getServiceDescription(
			'SMART', 'smartRegistrationForm', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Register study SMART dataset annex
 *
 * The service will register a study SMART dataset, it expects the following object
 * in the body:
 *
 * 	- data:	 the study SMART dataset registration form contents.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user in the session.
 * 	- Assert the user can handle metadata.
 * 	- Validate form data.
 * 	- Insert the dataset.
 * 	- Return the registration record.
 *
 * The service returns the administrator user record.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/SMART/registration
 * @verb		post
 * @request		{Object}	User authentication and signUp tokens, and signIn form data.
 * @response	{Object}	The result.
 */
router.post( '/SMART/registration', Handlers.smartRegistration, 'smartRegistration' )
	.body(
		require( '../models/annex/smartRegistration' ),
		Application.getServiceDescription(
			'SMART', 'smartRegistration', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/annex/smartRegistration' ),
		Application.getServiceDescription(
			'SMART', 'smartRegistration', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Register study SMART dataset annex."
	)
	.description(
		Application.getServiceDescription(
			'SMART', 'smartRegistration', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Return the study SMART dataset update form
 *
 * This service can be used to request the study SMART dataset registration form
 * for updating purposes, it will return an object, { form : <form> }, where form
 * is the dataset registration form.
 *
 * The service expects a parameter in the POST body, data, which is the dataset
 * reference. It can either be a string, in which case it must be the dataset _id or
 * _key, or an object containing the gid, or the nid and lid of the dataset.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user in the session.
 * 	- Assert the user can handle metadata.
 * 	- Resolve the dataset.
 * 	- Load the form structure.
 * 	- Return the form to the client.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/SMART/update/form
 * @verb		post
 * @response	{Object}	The study registration form form.
 */
router.post( '/SMART/update/form', Handlers.smartUpdateForm, 'smartUpdateForm' )
	.body(
		require( '../models/annex/smartUpdateForm' ),
		Application.getServiceDescription(
			'SMART', 'smartUpdateForm', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/annex/smartUpdateForm' ),
		Application.getServiceDescription(
			'SMART', 'smartUpdateForm', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get study SMART dataset annex update form"
	)
	.description(
		Application.getServiceDescription(
			'SMART', 'smartUpdateForm', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Update study SMART dataset annex
 *
 * The service will update the provided dataset, it expects the following object
 * in the body:
 *
 * 	- data:	 the dataset update form contents.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a current user in the session.
 * 	- Assert the user can handle metadata.
 * 	- Validate form data.
 * 	- Replace the dataset.
 * 	- Return the study record.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/SMART/registration
 * @verb		post
 * @request		{Object}	User authentication and signUp tokens, and signIn form data.
 * @response	{Object}	The result.
 */
router.post( '/SMART/update', Handlers.smartUpdate, 'smartUpdate' )
	.body(
		require( '../models/annex/smartRegistration' ),
		Application.getServiceDescription(
			'SMART', 'smartUpdate', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/annex/smartRegistration' ),
		Application.getServiceDescription(
			'SMART', 'smartUpdate', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Update study SMART dataset annex."
	)
	.description(
		Application.getServiceDescription(
			'SMART', 'smartUpdate', 'description', module.context.configuration.defaultLanguage )
	);
