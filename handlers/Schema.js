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

	}	// isEnumBranch
};
