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
 *
 * 	- term:	The term reference _id or _key, it can be a scalar or an array of references.
 *	- enum:	An array of _id or _key term references representing the list of
 *			enumerations to which the provided term should belong: if the term belongs
 *			to at least one of the provided enumerations, the check will be
 *			successful. The parameter may also be an empty array or null, in which
 *			case the service will only check if the provided term is a choice of any
 *			enumeration.
 *
 * The service will return an object with the 'result' field as a boolean, true means
 * the term is a choice.
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
		require( '../models/schema/SchemaIsEnumChoice' ),
		Application.getServiceDescription(
			'schema', 'enumIsChoice', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/SchemaIsEnumChoice' ),
		Application.getServiceDescription(
			'schema', 'enumIsChoice', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Check if term(s) are an enumeration selection."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumIsChoice', 'description', module.context.configuration.defaultLanguage )
	);


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
		require( '../models/schema/SchemaIsEnumBranch' ),
		Application.getServiceDescription(
			'schema', 'enumIsBranch', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/SchemaIsEnumBranch' ),
		Application.getServiceDescription(
			'schema', 'enumIsBranch', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Check if a term(s) are an enumeration definition."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumIsBranch', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get enumeration path
 *
 * The service will return the enumeration path starting from the provided leaf node,
 * ending with the provided root node of the provided graph branch.
 *
 * The service expects the following parameters from the body:
 *
 * 	- root:			The root vertex of the graph, provided as a term _key or _id.
 * 	- branch:		The graph branch to traverse, provided as a term _key or _id.
 * 	- vField:		The vertex property field name(s) to be returned. The value
 * 					may be provided as a descriptor _key, in which case the vertex
 * 					will be the value referenced by that field, or null, if the
 * 					field does not exist. An array of field references may also be
 * 					provided, in which case, the vertex properties will be
 * 					restricted to the provided list. The value may also be null,
 * 					in which case the vertex will remain untouched.
 * 	- eField:		The edge property field name(s) to be returned, please refer to
 * 					the previous parameter explanations.
 * 	- doTree:		A boolean flag, if true, the the result will be a hierarchy of
 * 					nodes, if false, the result will be an array of nodes.
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
		require( '../models/schema/schemaEnumList' ),
		Application.getServiceDescription(
			'schema', 'enumGetPath', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaEnumList' ),
		Application.getServiceDescription(
			'schema', 'enumGetPath', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Return the enumeration hierarchy from the provided origin to its root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumGetPath', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get enumeration list
 *
 * The service will return the flattened array of siblings of the provided root node,
 * the service will traverse the tree identified by the provided branch from the root
 * to the leaf nodes.
 *
 * The service expects the following parameters from the body:
 *
 * 	- root:			The root vertex of the graph, provided as a term _key or _id.
 * 	- branch:		The graph branch to traverse, provided as a term _key or _id.
 * 	- vField:		The vertex property field name(s) to be returned. The value
 * 					may be provided as a descriptor _key, in which case the vertex
 * 					will be the value referenced by that field, or null, if the
 * 					field does not exist. An array of field references may also be
 * 					provided, in which case, the vertex properties will be
 * 					restricted to the provided list. The value may also be null,
 * 					in which case the vertex will remain untouched.
 * 	- eField:		The edge property field name(s) to be returned, please refer to
 * 					the previous parameter explanations.
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
 * 					'vertex' will contain the vertex and 'edge' will contain the
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
 * @path		/enum/list
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/list',

	//
	// Handler.
	//
	Handlers.getEnumList,

	//
	// Name.
	//
	'enumGetList'
)
	.body(
		require( '../models/schema/schemaEnumList' ),
		Application.getServiceDescription(
			'schema', 'enumGetList', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaEnumList' ),
		Application.getServiceDescription(
			'schema', 'enumGetList', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Return all the enumeration siblings of the provided root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumGetList', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get enumeration tree
 *
 * The service will return the hierarchy of siblings of the provided root node,
 * the service will traverse the tree identified by the provided branch from the root
 * to the leaf nodes.
 *
 * The service expects the following parameters from the body:
 *
 * 	- root:			The root vertex of the graph, provided as a term _key or _id.
 * 	- branch:		The graph branch to traverse, provided as a term _key or _id.
 * 	- vField:		The vertex property field name(s) to be returned. The value
 * 					may be provided as a descriptor _key, in which case the vertex
 * 					will be the value referenced by that field, or null, if the
 * 					field does not exist. An array of field references may also be
 * 					provided, in which case, the vertex properties will be
 * 					restricted to the provided list. The value may also be null,
 * 					in which case the vertex will remain untouched.
 * 	- eField:		The edge property field name(s) to be returned, please refer to
 * 					the previous parameter explanations.
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
 * 					'vertex' will contain the vertex and 'edge' will contain the
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
 * @path		/enum/tree
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/tree',

	//
	// Handler.
	//
	Handlers.getEnumTree,

	//
	// Name.
	//
	'enumGetTree'
)
	.body(
		require( '../models/schema/schemaEnumTree' ),
		Application.getServiceDescription(
			'schema', 'enumGetTree', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaEnumTree' ),
		Application.getServiceDescription(
			'schema', 'enumGetTree', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Return the hierarchy of the enumeration siblings of the provided root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumGetTree', 'description', module.context.configuration.defaultLanguage )
	);
