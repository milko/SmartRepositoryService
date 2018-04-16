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
const SchemaIsEnumChoice = require( '../models/schema/isEnumChoice' );
const SchemaIsEnumBranch = require( '../models/schema/isEnumBranch' );

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
 * The service will check whether the provided term is an enumeration choice,
 * it expects two parameters in the post body:
 * 	- term:		The term reference _key, it can be a scalar or an array of
 * 				references.
 *	- enums:	An array of _key term references representing the list of
 *				enumerations to which the provided term should belong.
 *
 * If the enumerations list is empty, the service will check if the provided
 * reference is of the enumeration choice instance.
 *
 * The service will return an object with the 'result' field:
 * 	- If the term reference was provided as a scalar, the value will be a boolean.
 * 	- If an array of term references was provided, the value will be an object with
 * 	  key the provided teference element and as value the boolean result.
 *
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/enum/isChoice
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
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
		"term: the term reference as _key or _id, either as a scalar or an array;" +
		" enums: the optional list of enumerations, or an empty array."
	)
	.response(
		200,
		SchemaIsEnumChoice,
		"An object with the 'result' field, the value will be a boolean, if the term" +
		" reference was provided as a scalar, or an object with as key the provided" +
		" reference element and the boolean result as value, if an array of term" +
		" references was provided."
	)
	.summary(
		"Check if a term is an enumeration choice."
	)
	.description(dd`
  Check if term(s) are an enumeration choice or not.
`);


/**
 * Check if term is an enumeration branch
 *
 * The service will check whether the provided term is an enumeration choice,
 * it expects one parameter in the post body:
 * 	- term:		The term reference _key, it can be a scalar or an array of
 * 				references.
 *
 * The service will return an object with the 'result' field:
 * 	- If the term reference was provided as a scalar, the value will be a boolean.
 * 	- If an array of term references was provided, the value will be an object with
 * 	  key the provided teference element and as value the boolean result.
 *
 * @path		/enum/isBranch
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/isBranch',

	//
	// Handler.
	//
	Handlers.isEnumBranch,

	//
	// Name.
	//
	'enumIsBranch'
)
	.body(
		SchemaIsEnumBranch,
		"term: the term reference as _key or _id, either as a scalar or an array."
	)
	.response(
		200,
		SchemaIsEnumBranch,
		"An object with the 'result' field, the value will be a boolean, if the term" +
		" reference was provided as a scalar, or an object with as key the provided" +
		" reference element and the boolean result as value, if an array of term" +
		" references was provided."
	)
	.summary(
		"Check if a term is an enumeration branch."
	)
	.description(dd`
  Check if term(s) are an enumeration branch or not.
`);
