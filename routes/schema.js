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
const Schema = require( '../utils/Schema' );			// Schema class.
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
router.post( '/enum/isChoice', Handlers.isEnumChoice, 'enumIsChoice' )
	.body(
		require( '../models/schema/schemaIsEnumChoice' ),
		Application.getServiceDescription(
			'schema', 'enumIsChoice', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaIsEnumChoice' ),
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
router.post( '/enum/isBranch', Handlers.isEnumBranch, 'enumIsBranch' )
	.body(
		require( '../models/schema/schemaIsEnumBranch' ),
		Application.getServiceDescription(
			'schema', 'enumIsBranch', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaIsEnumBranch' ),
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
router.post( '/enum/path', Handlers.getEnumPath, 'enumGetPath' )
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
router.post( '/enum/list', Handlers.getEnumList, 'enumGetList' )
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
router.post( '/enum/tree', Handlers.getEnumTree, 'enumGetTree' )
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


/**
 * Get type hierarchy
 *
 * The service will return the  hierarchy of the provided data type term reference,
 * starting from the leaf type node.
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
router.post( '/type/hierarchy', Handlers.getEnumList, 'typeHierarchy' )
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
 * Get form list
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
 * 	- doChoice:		A boolean flag, if true, only form field elements will be
 * 					included in the result, this means that embedded forms will not be
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
 * @path		/form/list
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post( '/form/list', Handlers.getFormList, 'formGetList' )
	.body(
		require( '../models/schema/schemaEnumList' ),
		Application.getServiceDescription(
			'schema', 'formGetList', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaEnumList' ),
		Application.getServiceDescription(
			'schema', 'formGetList', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Return all the form siblings of the provided root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'formGetList', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get form tree
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
 * @path		/form/tree
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post( '/form/tree', Handlers.getFormTree, 'formGetTree' )
	.body(
		require( '../models/schema/schemaEnumTree' ),
		Application.getServiceDescription(
			'schema', 'formGetTree', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaEnumTree' ),
		Application.getServiceDescription(
			'schema', 'formGetTree', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Return the hierarchy of the form siblings of the provided root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'formGetTree', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get user hierarchy
 *
 * The service will return the manager hierarchy of the provided user, it will return
 * the path starting from the provided leaf node, ending with the provided root node
 * of the provided graph branch.
 *
 * The service expects the following parameters from the body:
 *
 * 	- origin:		Determines the traversal origin node, it must be provided as
 * 					the user _id or _key, or as an object containing the username
 * 					property.
 * 	- minDepth:		Represents the minimum depth of the traversal, it must be
 * 					provided as an integer, or can be null, to ignore it. (default is
 * 					null).
 * 	- maxDepth:		Represents the maximum depth of the traversal, it must be
 * 					provided as an integer, or can be null, to ignore it. (default is
 * 					null).
 * 	- vField:		References the field(s) that should be included in the vertex.
 * 					The value can be a string representing the requested vertex field,
 * 					provided as a descriptor _key, or an array of such references. The
 * 					value may also be null, in which case the option is ignored.
 * 					(default is null).
 * 	- eField:		References the field(s) that should be included in the edge.
 * 					This parameter behaves exactly as the previous one, except
 * 					that it refers to edges; this parameter is only relevant if
 * 					the 'doEdge' parameter is true.
 * 	- doLanguage:	If this parameter is true, the label, definition, description,
 * 					note and example of both the vertex and the edge, if
 * 					requested, will be set to the current session language. This
 * 					means that these fields, instead of being objects indexed by
 * 					the language code, will hold the value matched by the session
 * 					language code. I the session language doesn't match any
 * 					element, the field will remain untouched. (default is false)
 * 	- doEdge:		If this parameter is true, the result nodes will be an object
 * 					with two elements: '_vertex' will contain the vertex and '_edge'
 * 					will contain the edge. (default is false)
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
 * @path		/user/managers
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post( '/user/managers', Handlers.getUserManagers, 'userGetPath' )
	.body(
		require( '../models/schema/schemaUserSchema' ),
		Application.getServiceDescription(
			'schema', 'userManagerHierarchy', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaUserSchema' ),
		Application.getServiceDescription(
			'schema', 'userManagerHierarchy', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Return the user hierarchy from the provided origin to its root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'userManagerHierarchy', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get managed users list
 *
 * The service will return the list of users managed by the provided user, it will return
 * the flattened array of siblings of the provided root node, the service will
 * traverse the tree identified by the provided branch from the root to the leaf nodes.
 *
 * The service expects the following parameters from the body:
 *
 * 	- origin:		Determines the traversal origin node, it must be provided as
 * 					the user _id or _key, or as an object containing the username
 * 					property.
 * 	- minDepth:		Represents the minimum depth of the traversal, it must be
 * 					provided as an integer, or can be null, to ignore it. (default is
 * 					null).
 * 	- maxDepth:		Represents the maximum depth of the traversal, it must be
 * 					provided as an integer, or can be null, to ignore it. (default is
 * 					null).
 * 	- vField:		References the field(s) that should be included in the vertex.
 * 					The value can be a string representing the requested vertex field,
 * 					provided as a descriptor _key, or an array of such references. The
 * 					value may also be null, in which case the option is ignored.
 * 					(default is null).
 * 	- eField:		References the field(s) that should be included in the edge.
 * 					This parameter behaves exactly as the previous one, except
 * 					that it refers to edges; this parameter is only relevant if
 * 					the 'doEdge' parameter is true.
 * 	- doLanguage:	If this parameter is true, the label, definition, description,
 * 					note and example of both the vertex and the edge, if
 * 					requested, will be set to the current session language. This
 * 					means that these fields, instead of being objects indexed by
 * 					the language code, will hold the value matched by the session
 * 					language code. I the session language doesn't match any
 * 					element, the field will remain untouched. (default is false)
 * 	- doEdge:		If this parameter is true, the result nodes will be an object
 * 					with two elements: '_vertex' will contain the vertex and '_edge'
 * 					will contain the edge. (default is false)
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
 * @path		/user/managed/list
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post( '/user/managed/list', Handlers.getUserManaged, 'userGetList' )
	.body(
		require( '../models/schema/schemaUserSchema' ),
		Application.getServiceDescription(
			'schema', 'userManagedList', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaUserSchema' ),
		Application.getServiceDescription(
			'schema', 'userManagedList', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Return the user hierarchy from the provided origin to its root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'userManagedList', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get managed users tree
 *
 * The service will return the hierarchy of managed siblings of the provided user,
 * the service will traverse the graph starting from the origin node down to the leaf
 * nodes, the result will be an object in which the siblings will be found as an array
 * in the '_children' property.
 *
 * The service expects the following parameters from the body:
 *
 * 	- origin:		Determines the traversal origin node, it must be provided as
 * 					the user _id or _key, or as an object containing the username
 * 					property.
 * 	- minDepth:		Represents the minimum depth of the traversal, it must be
 * 					provided as an integer, or can be null, to ignore it. (default is
 * 					null).
 * 	- maxDepth:		Represents the maximum depth of the traversal, it must be
 * 					provided as an integer, or can be null, to ignore it. (default is
 * 					null).
 * 	- vField:		References the field(s) that should be included in the vertex.
 * 					The value can be a string representing the requested vertex field,
 * 					provided as a descriptor _key, or an array of such references. The
 * 					value may also be null, in which case the option is ignored.
 * 					(default is null).
 * 	- eField:		References the field(s) that should be included in the edge.
 * 					This parameter behaves exactly as the previous one, except
 * 					that it refers to edges; this parameter is only relevant if
 * 					the 'doEdge' parameter is true.
 * 	- doLanguage:	If this parameter is true, the label, definition, description,
 * 					note and example of both the vertex and the edge, if
 * 					requested, will be set to the current session language. This
 * 					means that these fields, instead of being objects indexed by
 * 					the language code, will hold the value matched by the session
 * 					language code. I the session language doesn't match any
 * 					element, the field will remain untouched. (default is false)
 * 	- doEdge:		If this parameter is true, the result nodes will be an object
 * 					with two elements: '_vertex' will contain the vertex and '_edge'
 * 					will contain the edge. (default is false)
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
 * @path		/user/managed/tree
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post( '/user/managed/tree', Handlers.getUserManagedTree, 'userGetTree' )
	.body(
		require( '../models/schema/schemaUserSchema' ),
		Application.getServiceDescription(
			'schema', 'userManagedTree', 'body', module.context.configuration.defaultLanguage )
	)
	.response(
		200,
		require( '../models/schema/schemaUserSchema' ),
		Application.getServiceDescription(
			'schema', 'userManagedTree', 'response', module.context.configuration.defaultLanguage )
	)
	.summary(
		"Return the user hierarchy from the provided origin to its root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'userManagedTree', 'description', module.context.configuration.defaultLanguage )
	);
