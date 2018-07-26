'use strict';

//
// Frameworks.
//
const fs = require('fs');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');

//
// Errors.
//
const errors = require('@arangodb').errors;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );
const Application = require( '../utils/Application' );

//
// Classes.
//
const User = require( '../classes/User' );
const Edge = require( '../classes/Edge' );
const Form = require( '../classes/Form' );
const Schema = require( '../utils/Schema' );

/**
 * User services
 *
 * These handlers use the 'user' path, they implement services related to
 * users.
 */

module.exports = {
	
	/**
	 * Get administrator token
	 *
	 * This service can be used to retrieve the administrator authentication token and
	 * optionally refresh the administrator authentication record.
	 *
	 * The service expects an object in the POST argument having a single property, named
	 * 'refresh', which is a boolean: true means refresh authentication record, false means
	 * use current authentication record.
	 *
	 * The service will return an object, { token : value }, where value is the system
	 * administrator suthentication token.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a currently logged on user.
	 * 	- Assert the current user is the system administrator.
	 * 	- Retrieve refresh flag.
	 * 	- Optionally refresh authentication record.
	 * 	- Return the token.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	tokenAdmin : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const Middleware = require( '../middleware/user' );
		
		//
		// Procedures.
		//
		try
		{
			//
			// Assert there is a current user.
			//
			Middleware.assert.hasUser( theRequest, theResponse );
			
			//
			// Assert the current user is the system administrator.
			//
			if( theRequest.application.user[ Dict.descriptor.kUsername ]
				!== module.context.configuration.adminCode )
				theResponse.throw(
					403,
					new MyError(
						'AuthFailed',						// Error name.
						K.error.OnlySysAdmAllowed,			// Error code.
						theRequest.application.language,	// Error language.
						null								// Arguments.
					)
				);																// !@! ==>
			
			//
			// Retrieve refresh flag.
			//
			let refresh = false;
			if( theRequest.body.refresh )
				refresh = true;
			
			//
			// Retrieve authentication record.
			//
			const auth = Application.adminAuthentication( refresh );
			
			
			//
			// Retrieve administrator token.
			//
			const token =
				Application.encode(
					auth.key,			// Encoding key.
					auth				// Encoding value.
				);
			
			theResponse.send({ token : token });									// ==>
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
		
	},	// tokenAdmin
	
	/**
	 * Get user token
	 *
	 * This service can be used to retrieve the user authentication token and
	 * optionally refresh the user authentication record.
	 *
	 * The service expects an object in the POST argument having a single property, named
	 * 'refresh', which is a boolean: true means refresh authentication record, false means
	 * use current authentication record.
	 *
	 * The service will return an object, { token : value }, where value is the system
	 * administrator suthentication token.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a currently logged on user.
	 * 	- Assert the current user is the system administrator.
	 * 	- Retrieve refresh flag.
	 * 	- Optionally refresh authentication record.
	 * 	- Return the token.
	 *
	 * IMPORTANT: If you refresh the authentication record, any user sign-up token
	 * sent by e-mail will become invalid: ensure no user registration requests are
	 * pending before running this service with the refresh flag on.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	tokenUser : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const Middleware = require( '../middleware/user' );
		
		//
		// Procedures.
		//
		try
		{
			//
			// Assert there is a current user.
			//
			Middleware.assert.hasUser( theRequest, theResponse );
			
			//
			// Assert the current user is the system administrator.
			//
			if( theRequest.application.user[ Dict.descriptor.kUsername ]
				!== module.context.configuration.adminCode )
				theResponse.throw(
					403,
					new MyError(
						'AuthFailed',						// Error name.
						K.error.OnlySysAdmAllowed,			// Error code.
						theRequest.application.language,	// Error language.
						null								// Arguments.
					)
				);																// !@! ==>
			
			//
			// Retrieve refresh flag.
			//
			let refresh = false;
			if( theRequest.body.refresh )
				refresh = true;
			
			//
			// Retrieve authentication record.
			//
			const auth = Application.userAuthentication( refresh );
			
			//
			// Retrieve user token.
			//
			const token =
				Application.encode(
					auth.key,			// Encoding key.
					auth				// Encoding value.
				);
			
			theResponse.send({ token : token });									// ==>
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
		
	}	// tokenUser
	
};
