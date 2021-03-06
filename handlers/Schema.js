'use strict';

//
// Classes.
//
const Schema = require( '../utils/Schema' );

/**
 * Schema services
 *
 * These handlers use the 'schema' path, they implement services related to data
 * dictionary schemas.
 */

module.exports = {

	/**
	 * Check enumeration choice
	 *
	 * The service will check whether the provided term reference belongs to
	 * the provided list of enumerations, or, if the enumerations are
	 * omitted, if the reference is an choice of any enumeration.
	 *
	 * The handler expects the following parameters from the request body:
	 *
	 * 	- term:	The term to check, it must be a term _id or _key or an array of such
	 * 			references.
	 * 	- enum:	An array of term _id or _key references representing the enumerations to
	 * 			which the provided term should belong; the parameter can either be null,
	 * 			or an array.
	 *
	 * The service returns an object { result : <value> }: if the provided term
	 * reference is a scalar, the value will be a boolean; if the provided term was an
	 * array, the value will be an object indexed by the provided elements with a
	 * boolean as value.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	isEnumChoice : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Test term.
			//
			theResponse.send({
				 result : Schema.isEnumerationChoice(
					 theRequest,
					 theRequest.body.term,
					 theRequest.body.enum
				 )
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;

			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;

			theResponse.throw( http, error );									// !@! ==>
		}

	},	// isEnumChoice

	/**
	 * Check enumeration branch
	 *
	 * The service will check whether the provided term reference is an emumeration
	 * branch.
	 *
	 * The handler expects the following parameter from the request body:
	 *
	 * 	- term:	The term to check, it must be a term _id or _key or an array of such
	 * 			references.
	 *
	 * The service returns an object { result : <value> }: if the provided term
	 * reference was a scalar, the value will be a boolean; if the provided term was an
	 * array, the value will be an object indexed by the provided elements with a
	 * boolean as value.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	isEnumBranch : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Test term.
			//
			theResponse.send({
				 result : Schema.isEnumerationBranch(
					 theRequest,
					 theRequest.body.term
				 )
			 });
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;

			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;

			theResponse.throw( http, error );									// !@! ==>
		}

	},	// isEnumBranch

	/**
	 * Get enumeration path
	 *
	 * The service will return the enumeration path starting from the provided leaf node,
	 * ending with the provided root node of the provided graph branch.
	 *
	 * The service expects the following parameters from the body:
	 *
	 * 	- origin:		The leaf vertex of the graph, provided as a term _key or _id.
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
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getEnumPath : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Test term.
			//
			theResponse.send({
				 result : Schema.getEnumPath(
				 	theRequest,
					theRequest.body.origin,
					theRequest.body.branch,
					theRequest.body.minDepth,
					theRequest.body.maxDepth,
					theRequest.body.vField,
					theRequest.body.eField,
					theRequest.body.doChoice,
					theRequest.body.doLanguage,
					theRequest.body.doEdge
				 )
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;

			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;

			theResponse.throw( http, error );									// !@! ==>
		}

	},	// getEnumPath

	/**
	 * Get enumeration list
	 *
	 * The service will return the list of enumeration siblings starting from the provided
	 * origin node, ending with the tree leaf nodes traversing the provided graph branch.
	 *
	 * The service expects the following parameters from the body:
	 *
	 * 	- origin:		The leaf vertex of the graph, provided as a term _key or _id.
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
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getEnumList : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Test term.
			//
			theResponse.send({
				 result : Schema.getEnumList(
					 theRequest,
					 theRequest.body.origin,
					 theRequest.body.branch,
					 theRequest.body.minDepth,
					 theRequest.body.maxDepth,
					 theRequest.body.vField,
					 theRequest.body.eField,
					 theRequest.body.doChoice,
					 theRequest.body.doLanguage,
					 theRequest.body.doEdge
				 )
			 });
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;

			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
				&& error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;

			theResponse.throw( http, error );									// !@! ==>
		}

	},	// getEnumList

	/**
	 * Get enumeration tree
	 *
	 * The service will return the hierarchy of enumeration siblings starting from the
	 * provided origin node, ending with the tree leaf nodes traversing the provided
	 * graph branch. The result will start with the root node and its siblings will be
	 * stored in a '_children' array property of the node.
	 *
	 * The service expects the following parameters from the body:
	 *
	 * 	- origin:		The leaf vertex of the graph, provided as a term _key or _id.
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
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getEnumTree : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Test term.
			//
			theResponse.send({
				result : Schema.getEnumTree(
							theRequest,
							theRequest.body.origin,
							theRequest.body.branch,
							theRequest.body.minDepth,
							theRequest.body.maxDepth,
							theRequest.body.vField,
							theRequest.body.eField,
							theRequest.body.doLanguage,
							theRequest.body.doEdge
						)
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;

			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;

			theResponse.throw( http, error );									// !@! ==>
		}

	},	// getEnumTree
	
	/**
	 * Get type path
	 *
	 * The service will return the type path starting from the provided leaf node,
	 * ending with the provided root node of the provided graph branch.
	 *
	 * The service expects the following parameters from the body:
	 *
	 * 	- origin:		The leaf vertex of the graph, provided as a term _key or _id.
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
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getTypePath : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Test term.
			//
			theResponse.send({
				result : Schema.getTypePath(
					theRequest,
					theRequest.body.origin,
					theRequest.body.branch,
					theRequest.body.minDepth,
					theRequest.body.maxDepth,
					theRequest.body.vField,
					theRequest.body.eField,
					theRequest.body.doLanguage,
					theRequest.body.doEdge
				)
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// getTypePath
	
	/**
	 * Get form list
	 *
	 * The service will return the list of form siblings starting from the provided
	 * origin node, ending with the tree leaf nodes traversing the provided graph branch.
	 *
	 * The service expects the following parameters from the body:
	 *
	 * 	- origin:		The leaf vertex of the graph, provided as a term _key or _id.
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
	 * 	- doChoice:		A boolean flag, if true, only form field elements will be
	 * 					included in the result, this means that embedded form elements
	 * 					will not be included.
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
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getFormList : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Test term.
			//
			theResponse.send({
				result : Schema.getFormList(
					theRequest,
					theRequest.body.origin,
					theRequest.body.branch,
					theRequest.body.minDepth,
					theRequest.body.maxDepth,
					theRequest.body.vField,
					theRequest.body.eField,
					theRequest.body.doChoice,
					theRequest.body.doLanguage,
					theRequest.body.doEdge
				)
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// getFormList
	
	/**
	 * Get from tree
	 *
	 * The service will return the hierarchy of form siblings starting from the
	 * provided origin node, ending with the tree leaf nodes traversing the provided
	 * graph branch. The result will start with the root node and its siblings will be
	 * stored in a '_children' array property of the node.
	 *
	 * The service expects the following parameters from the body:
	 *
	 * 	- origin:		The leaf vertex of the graph, provided as a term _key or _id.
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
	 * 	- doLanguage:	A boolean flag, if true, the label, definition, description,
	 * 					notes and examples fields will be restricted to the current
	 * 					session's signUp preferred language, this means that the
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
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getFormTree : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Test term.
			//
			theResponse.send({
				result : Schema.getFormTree(
					theRequest,
					theRequest.body.origin,
					theRequest.body.branch,
					theRequest.body.minDepth,
					theRequest.body.maxDepth,
					theRequest.body.vField,
					theRequest.body.eField,
					theRequest.body.doLanguage,
					theRequest.body.doEdge
				)
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// getFormTree
	
	/**
	 * Get user managers hierarchy
	 *
	 * The service will return the user manager hierarchy starting from the provided leaf
	 * node, ending with the provided root node of the provided graph branch.
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
	 * 					'vertex' will contain the vertex and 'edge' will contain the
	 * 					edge. If false, the element will be the vertex.
	 * 	- vField:		If the parameter is a scalar, the vertex will be the vertex
	 * 					value referenced by the parameter, if the parameter is an
	 * 					array, the vertex will only contain the referenced fields from
	 * 					the parameter.
	 * 	- eField:		This parameter is only relevant if 'doEdge' is true and
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getUserManagers : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const User = require( '../classes/User' );
		
		//
		// Try handler.
		//
		try
		{
			//
			// Instantiate user.
			//
			const user = new User( theRequest, theRequest.body.origin );
			if( ! user.persistent )
				user.resolve( true, true );
			
			//
			// Traverse upwards.
			//
			theResponse.send({
				result : Schema.getManagedUsersHierarchy(
					theRequest,
					user.document,
					theRequest.body.minDepth,
					theRequest.body.maxDepth,
					theRequest.body.vField,
					theRequest.body.eField,
					theRequest.body.doLanguage,
					theRequest.body.doEdge
				)
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// getUserManagers
	
	/**
	 * Get managed users list
	 *
	 * The service will return the flattened list of users managed by the provided
	 * user, it will perform an inbound traversal of the graph, starting from the
	 * provided user, down to the graph leaves.
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
	 * 					'vertex' will contain the vertex and 'edge' will contain the
	 * 					edge. If false, the element will be the vertex.
	 * 	- vField:		If the parameter is a scalar, the vertex will be the vertex
	 * 					value referenced by the parameter, if the parameter is an
	 * 					array, the vertex will only contain the referenced fields from
	 * 					the parameter.
	 * 	- eField:		This parameter is only relevant if 'doEdge' is true and
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getUserManaged : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const User = require( '../classes/User' );
		
		//
		// Try handler.
		//
		try
		{
			//
			// Instantiate user.
			//
			const user = new User( theRequest, theRequest.body.origin );
			if( ! user.persistent )
				user.resolveDocument( true, true );
			
			//
			// Traverse downwards.
			//
			theResponse.send({
				result : Schema.getManagedUsersList(
					theRequest,
					user.document,
					theRequest.body.minDepth,
					theRequest.body.maxDepth,
					theRequest.body.vField,
					theRequest.body.eField,
					theRequest.body.doLanguage,
					theRequest.body.doEdge
				)
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// getUserManaged
	
	/**
	 * Get managed users tree
	 *
	 * The service will return the siblings tree of users managed by the provided
	 * user, it will perform an inbound traversal of the graph, starting from the
	 * provided user, down to the graph leaves and return an object in which the
	 * siblings can be found in an array of the '_children' property.
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
	 * 					'vertex' will contain the vertex and 'edge' will contain the
	 * 					edge. If false, the element will be the vertex.
	 * 	- vField:		If the parameter is a scalar, the vertex will be the vertex
	 * 					value referenced by the parameter, if the parameter is an
	 * 					array, the vertex will only contain the referenced fields from
	 * 					the parameter.
	 * 	- eField:		This parameter is only relevant if 'doEdge' is true and
	 * 					behaves like the 'vField' parameter;
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getUserManagedTree : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const User = require( '../classes/User' );
		
		//
		// Try handler.
		//
		try
		{
			//
			// Instantiate user.
			//
			const user = new User( theRequest, theRequest.body.origin );
			if( ! user.persistent )
				user.resolveDocument( true, true );
			
			//
			// Traverse downwards.
			//
			theResponse.send({
				result : Schema.getManagedUsersTree(
					theRequest,
					user.document,
					theRequest.body.minDepth,
					theRequest.body.maxDepth,
					theRequest.body.vField,
					theRequest.body.eField,
					theRequest.body.doLanguage,
					theRequest.body.doEdge
				)
			});
		}
		catch( error )
		{
			//
			// Init local storage.
			//
			let http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// getUserManagedTree
	
	/**
	 * Validate property value
	 *
	 * The service can be used to validate a property value, it expects an object in the
	 * body with two properties:
	 *
	 * 	- property:	The property _key.
	 * 	- value:	The property value.
	 *
	 * The service will return the same object as provided, if the operation was
	 * successful, with the value cast to the correct type. If there is an error, the
	 * service will return an object, { error : error }, where error is the error record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	validateProperty : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const Validation = require( '../utils/Validation' );
		const Middleware = require( '../middleware/user' );
		
		//
		// Assertions.
		//
		Middleware.assert.hasUser( theRequest, theResponse );
		
		//
		// Try handler.
		//
		try
		{
			//
			// Make test.
			//
			const result =
				Validation.validateProperty(
					theRequest,
					theRequest.body.descriptor,
					theRequest.body.value );
			
			//
			// Build result.
			//
			const response = {};
			response.descriptor = theRequest.body.descriptor;
			response.value = result;
			
			theResponse.send( response );											// ==>
		}
		catch( error )
		{
			//
			// Handle MyError exceptions.
			//
			if( error.constructor.name === 'MyError' )
			{
				error.description = error.getCodeMessage();
				theResponse.send({ error : error });								// ==>
			}
			else
				theResponse.throw( 500, error );								// !@! ==>
		}
		
	},	// validateProperty
	
	/**
	 * Validate structure
	 *
	 * The service can be used to validate an object structure, it expects the POST body
	 * to contain an object that contains a single property, data, which contains the
	 * structure to be validated.
	 *
	 * The service will return the same object as provided, if the operation was
	 * successful, with the values cast to the correct types. If there is an error, the
	 * service will return an object, { error : error }, where error is the error record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	validateStructure : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const Validation = require( '../utils/Validation' );
		const Middleware = require( '../middleware/user' );
		
		//
		// Assertions.
		//
		Middleware.assert.hasUser( theRequest, theResponse );
		
		//
		// Init paths.
		//
		const paths = [];
		
		//
		// Try handler.
		//
		try
		{
			//
			// Make test.
			//
			const result =
				Validation.validateStructure(
					theRequest,
					theRequest.body.data,
					paths
				);
			
			//
			// Build result.
			//
			const response = {};
			response.data = result;
			
			theResponse.send( response );											// ==>
		}
		catch( error )
		{
			//
			// Handle MyError exceptions.
			//
			if( error.constructor.name === 'MyError' )
			{
				error.description = error.getCodeMessage();
				theResponse.send({ error : error });								// ==>
			}
			else
				theResponse.throw( 500, error );								// !@! ==>
		}
		
	},	// validateStructure
	
	/**
	 * Validate form
	 *
	 * The service can be used to validate a data structure associated to a form, it
	 * expects the POST body to contain the following parameters:
	 *
	 * 	- form:	The form term _key.
	 * 	- data:	The data applied to the form.
	 *
	 * If there are no errors, the service will return { result : form } where form is the
	 * form structure with for each form element corresponding to a data element an
	 * additional property, _value, which will contain the value cast to the correct
	 * types. If there is an error, the service will return an object, { error : error },
	 * where error is the error record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	validateForm : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const Form = require( '../classes/Form' );
		const Middleware = require( '../middleware/user' );
		
		//
		// Assertions.
		//
		Middleware.assert.hasUser( theRequest, theResponse );
		
		//
		// Try handler.
		//
		try
		{
			//
			// Instantiate form.
			//
			const form =
				new Form(
					theRequest,
					theRequest.body.form,
					theRequest.body.data
				);
			
			//
			// Validate.
			//
			form.validate( theRequest );
			
			theResponse.send({
				_branch : form.branch,
				_fields : form.fields,
				_form   : form.form
			});
		}
		catch( error )
		{
			//
			// Handle MyError exceptions.
			//
			if( error.constructor.name === 'MyError' )
			{
				error.description = error.getCodeMessage();
				theResponse.send({ error : error });								// ==>
			}
			else
				theResponse.throw( 500, error );								// !@! ==>
		}
		
	},	// validateForm
	
	/**
	 * Get term
	 *
	 * The service can be used to retrieve a specific term, it expects the POST body to
	 * contain the following parameters:
	 *
	 * 	- reference:	The term reference provided in one of these two forms:
	 * 		- string:	The term reference as its _id or _key.
	 * 		- object:	An object containing the term significant fields.
	 *
	 * The service will return an object, { document : value }, where value will be the
	 * matched term object.
	 *
	 * When providing the term reference as an object, if the search results in more than
	 * one term, the service will raise an exception.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getTerm : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const db = require('@arangodb').db;
		const errors = require('@arangodb').errors;
		const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
		
		//
		// Application.
		//
		const K = require( '../utils/Constants' );
		const MyError = require( '../utils/MyError' );
		const Middleware = require( '../middleware/user' );
		
		//
		// Assertions.
		//
		Middleware.assert.hasUser( theRequest, theResponse );
		
		//
		// Globals.
		//
		const collection = 'terms';
		
		//
		// Handle object selector.
		//
		if( K.function.isObject( theRequest.body.reference ) )
		{
			//
			// Try search.
			//
			try
			{
				const cursor =
					db._collection( collection )
						.byExample( theRequest.body.reference );
				
				if( cursor.count() === 0 )
					theResponse.throw(
						404,
						new MyError(
							'BadDocumentReference',				// Error name.
							K.error.DocumentNotFound,			// Message code.
							theRequest.application.language,	// Language.
							theTerm,							// Error value.
							404									// HTTP error code.
						)
					);															// !@! ==>
				
				if( cursor.count() > 1 )
					theResponse.throw(
						412,
						new MyError(
							'AmbiguousDocumentReference',		// Error name.
							K.error.AmbiguousDocument,			// Message code.
							theRequest.application.language,	// Language.
							[									// Error value.
								JSON.stringify(theRequest.body.reference),
								'terms'
							],
							412									// HTTP error code.
						)
					);															// !@! ==>
				
				theResponse.send({ document : cursor.toArray()[ 0 ] });				// ==>
			}
			catch( error )
			{
				//
				// Init local storage.
				//
				let http = 500;
				
				//
				// Handle MyError exceptions.
				//
				if( (error.constructor.name === 'MyError')
					&& error.hasOwnProperty( 'param_http' ) )
					http = error.param_http;
				
				theResponse.throw( http, error );								// !@! ==>
			}
			
		}	// Provided object selector.
		
		//
		// Handle string reference.
		//
		else
		{
			//
			// Try search.
			//
			try
			{
				const document =
					db._collection( collection )
						.document( theRequest.body.reference );
				theResponse.send({ document : document });							// ==>
			}
			catch( error )
			{
				//
				// Init local storage.
				//
				let http = 500;
				
				//
				// Handle exceptions.
				//
				if( (! error.isArangoError)
				 || (error.errorNum !== ARANGO_NOT_FOUND) )
					theResponse.throw( http, error );							// !@! ==>
				
				//
				// Handle not found.
				//
				theResponse.throw(
					404,
					new MyError(
						'BadDocumentReference',				// Error name.
						K.error.DocumentNotFound,			// Message code.
						theRequest.application.language,	// Language.
						[									// Error value.
							theRequest.body.reference,
							'terms'
						],
						404									// HTTP error code.
					)
				);																// !@! ==>
			}
			
		}	// Provided _id or _key.
	
	},	// getTerm
	
	/**
	 * Get descriptor
	 *
	 * The service can be used to retrieve a specific descriptor, it expects the POST
	 * body to contain the following parameters:
	 *
	 * 	- reference:	The descriptor reference provided in one of these two forms:
	 * 		- string:	The descriptor reference as its _id or _key.
	 * 		- object:	An object containing the descriptor significant fields.
	 *
	 * The service will return an object, { document : value }, where value will be the
	 * matched descriptor object.
	 *
	 * When providing the descriptor reference as an object, if the search results in more than
	 * one descriptor, the service will raise an exception.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getDescriptor : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const db = require('@arangodb').db;
		const errors = require('@arangodb').errors;
		const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
		
		//
		// Application.
		//
		const K = require( '../utils/Constants' );
		const MyError = require( '../utils/MyError' );
		const Middleware = require( '../middleware/user' );
		
		//
		// Assertions.
		//
		Middleware.assert.hasUser( theRequest, theResponse );
		
		//
		// Globals.
		//
		const collection = 'descriptors';
		
		//
		// Handle object selector.
		//
		if( K.function.isObject( theRequest.body.reference ) )
		{
			//
			// Try search.
			//
			try
			{
				const cursor =
					db._collection( collection )
						.byExample( theRequest.body.reference );
				
				if( cursor.count() === 0 )
					theResponse.throw(
						404,
						new MyError(
							'BadDocumentReference',				// Error name.
							K.error.DocumentNotFound,			// Message code.
							theRequest.application.language,	// Language.
							theTerm,							// Error value.
							404									// HTTP error code.
						)
					);															// !@! ==>
				
				if( cursor.count() > 1 )
					theResponse.throw(
						412,
						new MyError(
							'AmbiguousDocumentReference',		// Error name.
							K.error.AmbiguousDocument,			// Message code.
							theRequest.application.language,	// Language.
							[									// Error value.
								JSON.stringify(theRequest.body.reference),
								'terms'
							],
							412									// HTTP error code.
						)
					);															// !@! ==>
				
				theResponse.send({ document : cursor.toArray()[ 0 ] });				// ==>
			}
			catch( error )
			{
				//
				// Init local storage.
				//
				let http = 500;
				
				//
				// Handle MyError exceptions.
				//
				if( (error.constructor.name === 'MyError')
					&& error.hasOwnProperty( 'param_http' ) )
					http = error.param_http;
				
				theResponse.throw( http, error );								// !@! ==>
			}
			
		}	// Provided object selector.
		
		//
		// Handle string reference.
		//
		else
		{
			//
			// Try search.
			//
			try
			{
				const document =
					db._collection( collection )
						.document( theRequest.body.reference );
				theResponse.send({ document : document });							// ==>
			}
			catch( error )
			{
				//
				// Init local storage.
				//
				let http = 500;
				
				//
				// Handle exceptions.
				//
				if( (! error.isArangoError)
					|| (error.errorNum !== ARANGO_NOT_FOUND) )
					theResponse.throw( http, error );							// !@! ==>
				
				//
				// Handle not found.
				//
				theResponse.throw(
					404,
					new MyError(
						'BadDocumentReference',				// Error name.
						K.error.DocumentNotFound,			// Message code.
						theRequest.application.language,	// Language.
						[									// Error value.
							theRequest.body.reference,
							'terms'
						],
						404									// HTTP error code.
					)
				);																// !@! ==>
			}
			
		}	// Provided _id or _key.
		
	},	// getDescriptor
	
	/**
	 * Get study
	 *
	 * The service can be used to retrieve a specific study, it expects the POST
	 * body to contain the following parameters:
	 *
	 * 	- reference:	The study reference provided in one of these two forms:
	 * 		- string:	The study reference as its _id or _key.
	 * 		- object:	An object containing the study significant fields.
	 *
	 * The service will return an object, { document : value }, where value will be the
	 * matched study object.
	 *
	 * When providing the study reference as an object, if the search results in more than
	 * one study, the service will raise an exception.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	getStudy : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const db = require('@arangodb').db;
		const errors = require('@arangodb').errors;
		const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
		
		//
		// Application.
		//
		const K = require( '../utils/Constants' );
		const MyError = require( '../utils/MyError' );
		const Middleware = require( '../middleware/user' );
		
		//
		// Assertions.
		//
		Middleware.assert.hasUser( theRequest, theResponse );
		
		//
		// Globals.
		//
		const collection = 'studies';
		
		//
		// Handle object selector.
		//
		if( K.function.isObject( theRequest.body.reference ) )
		{
			//
			// Try search.
			//
			try
			{
				const cursor =
					db._collection( collection )
						.byExample( theRequest.body.reference );
				
				if( cursor.count() === 0 )
					theResponse.throw(
						404,
						new MyError(
							'BadDocumentReference',				// Error name.
							K.error.DocumentNotFound,			// Message code.
							theRequest.application.language,	// Language.
							theTerm,							// Error value.
							404									// HTTP error code.
						)
					);															// !@! ==>
				
				if( cursor.count() > 1 )
					theResponse.throw(
						412,
						new MyError(
							'AmbiguousDocumentReference',		// Error name.
							K.error.AmbiguousDocument,			// Message code.
							theRequest.application.language,	// Language.
							[									// Error value.
								JSON.stringify(theRequest.body.reference),
								'terms'
							],
							412									// HTTP error code.
						)
					);															// !@! ==>
				
				theResponse.send({ document : cursor.toArray()[ 0 ] });				// ==>
			}
			catch( error )
			{
				//
				// Init local storage.
				//
				let http = 500;
				
				//
				// Handle MyError exceptions.
				//
				if( (error.constructor.name === 'MyError')
					&& error.hasOwnProperty( 'param_http' ) )
					http = error.param_http;
				
				theResponse.throw( http, error );								// !@! ==>
			}
			
		}	// Provided object selector.
		
		//
		// Handle string reference.
		//
		else
		{
			//
			// Try search.
			//
			try
			{
				const document =
					db._collection( collection )
						.document( theRequest.body.reference );
				theResponse.send({ document : document });							// ==>
			}
			catch( error )
			{
				//
				// Init local storage.
				//
				let http = 500;
				
				//
				// Handle exceptions.
				//
				if( (! error.isArangoError)
					|| (error.errorNum !== ARANGO_NOT_FOUND) )
					theResponse.throw( http, error );							// !@! ==>
				
				//
				// Handle not found.
				//
				theResponse.throw(
					404,
					new MyError(
						'BadDocumentReference',				// Error name.
						K.error.DocumentNotFound,			// Message code.
						theRequest.application.language,	// Language.
						[									// Error value.
							theRequest.body.reference,
							'terms'
						],
						404									// HTTP error code.
					)
				);																// !@! ==>
			}
			
		}	// Provided _id or _key.
		
	}	// getStudy

};
