'use strict';

/**
 * Utility services
 *
 * This path is used to handle utility services.
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
const Handlers = require( '../handlers/Utils' );		// Utility handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'utils' );


/**
 * Get administrator token
 *
 * This service can be used to retrieve the administrator authentication token and
 * optionally refresh the administrator authentication record.
 *
 * The service expects an object in the POST argument having a single property, named
 * 'refresh', which is a boolean: true means refresh authentication record, false means
 * use current authentication record.
 *
 * The service will return an object, { token : value }, where value is the system
 * administrator suthentication token.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a currently logged on user.
 * 	- Assert the current user is the system administrator.
 * 	- Retrieve refresh flag.
 * 	- Optionally refresh authentication record.
 * 	- Return the token.
 *
 * @path		/token/admin
 * @verb		post
 * @response	{Object}	{ result : something }.
 */
router.post( '/token/admin', Handlers.tokenAdmin, 'tokenAdmin' )
	.body(
		require( '../models/utils/getToken' ),
		Application.getServiceDescription(
			'utils', 'tokenAdmin', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signUpAdminForm' ),
		Application.getServiceDescription(
			'utils', 'tokenAdmin', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get administrator user authentication token."
	)
	.description(
		Application.getServiceDescription(
			'utils', 'tokenAdmin', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Retrieve user authentication token
 *
 * The service will return an object, { token : value }, where value is the user
 * suthentication token.
 *
 * The service will perform the following steps:
 *
 * 	- Assert there is a currently logged on user.
 * 	- Assert the current user is the system administrator.
 * 	- Return the token.
 *
 * @path		/token/user
 * @verb		post
 * @response	{Object}	{ result : something }.
 */
router.post( '/token/user', Handlers.tokenUser, 'tokenUser' )
	.body(
		require( '../models/utils/getToken' ),
		Application.getServiceDescription(
			'utils', 'tokenUser', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/user/signUpAdminForm' ),
		Application.getServiceDescription(
			'utils', 'tokenUser', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Get user authentication token."
	)
	.description(
		Application.getServiceDescription(
			'utils', 'tokenUser', 'description', module.context.configuration.defaultLanguage )
	);
