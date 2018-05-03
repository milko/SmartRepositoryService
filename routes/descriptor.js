'use strict';

/**
 * Descriptor services
 *
 * This path is used to handle descriptor services.
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
const Handlers = require( '../handlers/Descriptor' );	// Descriptor handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'descriptor' );


/**
 * Set description validation structure
 *
 * The service will update the validation structure of the provided descriptor(s), it
 * expects the post body to contain:
 *
 * 	- A string:				The string is expected to be a descriptor _id or _key.
 * 	- An array of strings:	The array elements are expected to be a descriptor _id or _key.
 * 	- An empty array:		All descriptors will be updated.
 *
 * The service returns an object { result : <value> } where the value represents
 * the number of updated descriptors.
 *
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/update/validation
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
 */
router.post( '/update/validation', Handlers.updateValidation, 'updateValidation' )
	.body(
		require( '../models/descriptor/descriptorUpdateValidation' ),
		Application.getServiceDescription(
			'descriptor', 'updateValidation', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/descriptor/descriptorUpdateValidation' ),
		Application.getServiceDescription(
			'descriptor', 'updateValidation', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Update descriptor(s) validation structure."
	)
	.description(
		Application.getServiceDescription(
			'descriptor', 'updateValidation', 'description', module.context.configuration.defaultLanguage )
	);
