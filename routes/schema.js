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
const SchemaGetEnumPath = require( '../models/schema/getEnumPath' );

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
		"Provide the reference to the term and the eventual list of enumerations to" +
		" which it must belong.<ul>" +
		"<li><b>term</b>: provide the term <code>_id</code> or <code>_key</code> as" +
		" a scalar <em>string</em>, or as an <em>array</em>.</li>" +
		"<li><b>enums</b>: provide an <em>array</em> of <code>_id</code> or" +
		" <code>_key</code> term references representing the enumerations to which" +
		" the term must belong; an empty array can also be provided, in which case" +
		" the service will only check if the term is an enumeration choice of any" +
		" enumeration.</li></ul>"
	)
	.response(
		200,
		SchemaIsEnumChoice,
		"The service returns an <strong>object</strong> structured as follows:<ul>" +
		"<li><strong>result</strong>: If the reference was provided as a" +
		" <strong>scalar</strong>, the value will be a <strong>boolean</strong>; if the" +
		" reference was provided as an array, the value will be an " +
		"<strong>object</strong> with the provided array element as key and as value a" +
		" <strong>boolean</strong> indicating whether the element is an enumeration" +
		" choice or not.</li>.</ul>"
	)
	.summary(
		"Check if term(s) are an enumeration choice."
	)
	.description(dd`
  Return <code>true</code> if the provided term(s) is/are an eumeration choice.
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
		"Provide the reference to the term:<ul>" +
		"<li><b>term</b>: provide the term <code>_id</code> or <code>_key</code> as" +
		" a scalar <em>string</em>, or as an <em>array</em>.</li></ul>"
	)
	.response(
		200,
		SchemaIsEnumBranch,
		"The service returns an <strong>object</strong> structured as follows:<ul>" +
		"<li><strong>result</strong>: If the reference was provided as a" +
		" <strong>scalar</strong>, the value will be a <strong>boolean</strong>; if the" +
		" reference was provided as an array, the value will be an " +
		"<strong>object</strong> with the provided array element as key and as value a" +
		" <strong>boolean</strong> indicating whether the element is an enumeration" +
		" choice or not.</li>.</ul>"
	)
	.summary(
		"Check if a term is an enumeration branch."
	)
	.description(dd`
  Check if term(s) are an enumeration branch or not.
`);


/**
 * Get enumeration path
 *
 * The service will return the enumeration path starting from the provided leaf node,
 * ending with the provided root node of the provided graph branch.
 *
 * The service expects the following parameters from the body:
 *
 * 	- leaf:			The leaf vertex of the graph, provided as a term _key or _id.
 * 	- branch:		The graph branch to traverse, provided as a term _key or _id.
 * 	- root:			The root vertex of the graph, provided as a term _key or _id.
 * 	- vField:		The vertex property field name(s) to be returned. The value
 * 					may be provided as a descriptor _key, in which case the vertex
 * 					will be the value referenced by that field, or null, if the
 * 					field does not exist. An array of field references may also be
 * 					provided, in which case, the vertex properties will be
 * 					restricted to the provided list. The value may also be null,
 * 					in which case the vertex will remain untouched.
 * 	- eField:		The edge property field name(s) to be returned, please refer to
 * 					the previous parameter explanations.
 * 	- doRoot:		A boolean flag, if true, the root vertex will be included in the
 * 					result.
 * 	- doChoice:		A boolean flag, if true, only enumeration choice elements will be
 * 					included in the result, this means that categories will not be
 * 					included.
 * 	- doLanguage:	A boolean flag, if true, the label, definition, description,
 * 					notes and examples fields will be restricted to the current
 * 					session's user preferred language, this means that the
 * 					properties, instead of being objects indexed by the language
 * 					code, they will be the value corresponding to the session's
 * 					language; if the language cannot be matched, the field will
 * 					remain untouched.
 * 	- doEdge:		A boolean flag, if true, the result elements will include the
 * 					related edge.
 *
 * The service will return an array of elements which depend on the provided
 * parameters:
 *
 * 	- doEdge:		If true, each element will be an object with two fields,
 * 					'term' will contain the vertex and 'edge' will contain the
 * 					edge. If false, the element will be the vertex.
 * 	- vField:		If the parameter is a scalar, the vertex will be the vertex
 * 					value referenced by the parameter, if the parameter is an
 * 					array, the vertex will only contain the referenced fields from
 * 					the parameter.
 * 	- eField:		This parameter is only relevant if 'doEdge' is true and
 * 					behaves like the 'vField' parameter.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/enum/path
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/path',

	//
	// Handler.
	//
	Handlers.getEnumPath,

	//
	// Name.
	//
	'enumGetPath'
)
	.body(
		SchemaGetEnumPath,
		"The service expects the following parameters:<ul>" +
		"<li><b>leaf</b>: The leaf vertex of the graph, provided as a" +
		" term <code>_key</code> or <code>_id</code>.</li>" +
		"<li><b>branch</b>: The graph branch to traverse, provided as a term" +
		" <code>_key</code> or <code>_id</code>.</li>" +
		"<li><b>root</b>: The root vertex of the graph, provided as a term" +
		" <code>_key</code> or <code>_id</code>.</li>" +
		"<li><b>vField</b>: The vertex property field name(s) to be returned. The" +
		" value may be provided as a descriptor <code>_key</code>, in which case the" +
		" vertex will be the value referenced by that field, or <code>null</code>, if" +
		" the field does not exist. An array of field references may also be provided," +
		" in which case, the vertex properties will be restricted to the provided" +
		" list. The value may also be <code>null</code>, in which case the vertex will" +
		" remain untouched.</li>" +
		"<li><b>eField</b>: The edge property field name(s) to be returned, please" +
		" refer to the previous parameter explanations.</li>" +
		"<li><b>doRoot</b>: A boolean flag, if <code>true</code>, the root vertex will" +
		" be included in the result.</li>" +
		"<li><b>doChoice</b>: A boolean flag, if <code>true</code>, only enumeration" +
		" choice elements will be included in the result, this means that categories" +
		" will not be included.</li>" +
		"<li><strong>doLanguage</strong>: A <em>boolean</em> flag, if" +
		" <code>true</code>, the <code>label</code>, <code>definition</code>," +
		" <code>description</code>, <code>note</code> and <code>example</code>" +
		" fields will be restricted to the current session&#39;s user preferred" +
		" language, this means that the properties, instead of being objects indexed" +
		" by the language code, they will be the value corresponding to the" +
		" session&#39;s language; if the language cannot be matched, the field will" +
		" remain untouched.</li>" +
		"<li><strong>doEdge</strong>: A boolean flag, if true, the result" +
		" elements will" +
		" include the related edge.</li></ul>"
	)
	.response(
		200,
		SchemaGetEnumPath,
		"The service will return an array of elements which depend on the provided " +
		"parameters:<ul>" +
		"<li><strong>doEdge</strong>: If true, each element will be an object with two" +
		" fields, <strong>term</strong> will contain the vertex and" +
		" <strong>edge</strong> will contain the edge. If <code>false</code>, the" +
		" element will be the vertex.</li>" +
		"<li><strong>vField</strong>: If the parameter is a scalar, the vertex will" +
		" be the vertex value referenced by the parameter, if the parameter is an" +
		" array, the vertex will only contain the referenced fields from the" +
		" parameter.</li>" +
		"<li><strong>eField</strong>: This parameter is only relevant if" +
		" <strong>doEdge</strong> is true and behaves like the" +
		" <strong>vField</strong> parameter.</li></ul>"
	)
	.summary(
		"Check if a term is an enumeration branch."
	)
	.description(dd`
  Check if term(s) are an enumeration branch or not.
`);
