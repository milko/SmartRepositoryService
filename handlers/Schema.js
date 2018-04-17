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
	 * omitted, if the reference is an enumeration choice.
	 *
	 * The service returns an object as { term : <result> } where term is
	 * the provided reference and result a boolean indicating whether the
	 * term is or is not an enumeration choice.
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
					 theRequest.body.enums
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
	 * The service returns an object as { term : <result> } where term is
	 * the provided reference and result a boolean indicating whether the
	 * term is or is not an enumeration choice.
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
					theRequest.body.leaf,
					theRequest.body.branch,
					theRequest.body.root,
					theRequest.body.vField,
					theRequest.body.eField,
					theRequest.body.doRoot,
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

	}	// getEnumPath
};
