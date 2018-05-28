'use strict';

//
// Classes.
//
const Schema = require( '../classes/Schema' );

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
				user.resolve( true, true );
			
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
		
	}	// getUserManaged
};
