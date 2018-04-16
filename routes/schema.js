'use strict';

/**
 * Schema services
 *
 * This path is used to handle schema services.
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
const Schema = require( '../classes/Schema' );			// Schema class.
const Application = require( '../utils/Application' );	// Application.

//
// Handlers.
//
const Handlers = require( '../handlers/Schema' );		// Schema handlers.

//
// Schemas.
//
const SchemaIsEnumChoice = require( '../models/isEnumChoice' );

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'schema' );


/**
 * Check if term is an enumeration choice
 *
 * The service will chack whether the provided term is an enumeration choice,
 * it expects two parameters in the post body:
 * 	- term:		The term reference _key, it can be a scalar or an array of
 * 				references.
 *	- enums:	An array of _key term references representing the list of
 *				enumerations to which the provided term should belong.
 *
 * If the enumerations list is empty, the service will check if the provided
 * reference is of the enumeration choice instance.
 *
 * The service will return an object with the following fields:
 * 	- result:	An object:
 * 		- key:		The provided term reference.
 * 		- value:	A boolean indicating whether the term is an enumeration.
 * 	- time:		A floating point number indicating the duration of the operation
 * 				in milliseconds.
 *
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/enum/isChoice
 * @verb		post
 * @request		{Object}	Authentication parameters and administrator user.
 * @response	{Object}	The newly created user.
 */
router.post(

	//
	// Path.
	//
	'/enum/isChoice',

	//
	// Handler.
	//
	Handlers.isEnumChoice,

	//
	// Name.
	//
	'enumIsChoice'
)
	.body(
		SchemaIsEnumChoice,
		'User credentials.'
	)
	.response(
		200,
		SchemaIsEnumChoice,
		'The created system administrator.'
	)
	.summary(
		"Create system administrator"
	)
	.description(dd`
  Create system administrator user.
`);
