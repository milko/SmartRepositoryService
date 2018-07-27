'use strict';

//
// Frameworks.
//
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

//
// Middleware.
//
const Middleware = require( '../middleware/user' );

/**
 * User services
 *
 * These handlers use the 'user' path, they implement services related to
 * users.
 */

module.exports = {
	
	/**
	 * Return a sign-up administrator form
	 *
	 * This service can be used to retrieve the administrator registration form, it
	 * expects the following parameters in the POST body:
	 *
	 * 	- token:	the administrator authentication token.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there are no users in the users collection.
	 * 	- Validate the authentication token.
	 * 	- Load the form structure.
	 * 	- Return the form to the client.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	signUpAdminForm : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.noUsers( theRequest, theResponse );
			Middleware.assert.tokenAdmin( theRequest, theResponse );
			
			//
			// Resolve sign-up form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormAdmin					// Form _key.
				);
			
			theResponse.send({ result : form.form });								// ==>
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
		
	},	// signUpAdminForm
	
	/**
	 * Create administrator user
	 *
	 * The service will create the system administrator user, it expects the following
	 * object in the body:
	 *
	 * 	- token: the authentication token.
	 * 	- data:	 the administrator form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there are no users in the users collection.
	 * 	- Validate the authentication token.
	 * 	- Validate form data.
	 * 	- Complete the user record.
	 * 	- Create the authorisation data.
	 * 	- Insert the user.
	 * 	- Update the session.
	 * 	- Return the user.
	 *
	 * The service returns the administrator user record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	signinAdmin : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.noUsers( theRequest, theResponse );
			Middleware.assert.tokenAdmin( theRequest, theResponse );
			
			//
			// Validate form.
			//
			const form = new Form( theRequest, Dict.term.kFormAdmin );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Complete user data.
			//
			const data = theRequest.body.data;
			data[ Dict.descriptor.kUsername ] = module.context.configuration.adminCode;
			data[ Dict.descriptor.kRank ]	  = Dict.term.kRankSystem;
			data[ Dict.descriptor.kRole ]	  =
				Schema.getEnumList
				(
					theRequest,				// Request.
					Dict.term.kEnumRole,	// Root.
					Dict.term.kEnumRole,	// Branch.
					1,						// Skip root.
					null,					// Go full depth.
					'_key',					// Return vertex key.
					null,					// Ignore edge fields.
					true,					// Restrict to choices.
					false,					// Ignore language.
					false					// Don't return edges.
				);
			
			//
			// Save and remove password.
			//
			const password = data[ Dict.descriptor.kPassword ];
			delete data[ Dict.descriptor.kPassword ];
			
			//
			// Instantiate user.
			//
			const user = new User( theRequest, data );
			
			//
			// Create authentication record.
			//
			User.setAuthentication( password, user );
			
			//
			// Insert user.
			//
			user.insertDocument( true );
			
			//
			// Login user.
			//
			theRequest.session.uid = user.document._id;
			theRequest.session.data = {};
			theRequest.sessionStorage.save( theRequest.session );
			
			//
			// Copy user to request.
			//
			theRequest.application.user = user.document;
			
			theResponse.send({ result : user.document });							// ==>
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
		
	},	// signinAdmin
	
	/**
	 * Return a sign-up user form
	 *
	 * This service can be used to retrieve the sign-up form, it expects the following
	 * parameters in the POST body:
	 *
	 * 	- token:	the user authentication token.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the current user can manage other users.
	 * 	- Validate the user authentication token.
	 * 	- Load the form structure.
	 * 	- Return the form to the client.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	signUpUserForm : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.hasUser( theRequest, theResponse );
			Middleware.assert.canManage( theRequest, theResponse );
			Middleware.assert.tokenUser( theRequest, theResponse );
			
			//
			// Resolve sign-up form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormSignup					// Form _key.
				);
			
			theResponse.send({ result : form.form });								// ==>
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
		
	},	// signUpUserForm
	
	/**
	 * Register user
	 *
	 * The service can be used to register a new user, it expects the following
	 * properties in the POST body:
	 *
	 * 	- token:	The user authentication token.
	 * 	- data:		The user record contents.
	 *
	 * The service will return a string token that will be used when the user will
	 * signin, it contains the user code and password, these will be used to
	 * authenticate and load the user data when the user will sign in.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the current user can manage other users.
	 * 	- Validate the user authentication token.
	 * 	- Validate form data.
	 * 	- Set the user status to pending.
	 * 	- Set username and password.
	 * 	- Encode the username and password.
	 * 	- Create the authorisation data.
	 * 	- Insert the user.
	 * 	- Set the user manager.
	 * 	- Return the encoded user record token.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	signUpUser : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.hasUser( theRequest, theResponse );
			Middleware.assert.canManage( theRequest, theResponse );
			Middleware.assert.tokenUser( theRequest, theResponse );
			
			//
			// Validation.
			//
			const form = new Form( theRequest, Dict.term.kFormSignup );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Load user data.
			//
			const data = theRequest.body.data;
			data[ Dict.descriptor.kStatus ] = Dict.term.kStateStatusPending;
			if( ! data.hasOwnProperty( Dict.descriptor.kUsername ) )
				data[ Dict.descriptor.kUsername ] =
					data[ Dict.descriptor.kEmail ];
			
			//
			// Generate token.
			//
			const encode = {};
			encode[ Dict.descriptor.kUsername ] = data[ Dict.descriptor.kUsername ];
			encode[ Dict.descriptor.kPassword ] = crypto.genRandomAlphaNumbers( 48 );
			
			//
			// Generate token.
			//
			const token =
				Application.encode(
					Application.userAuthentication( false ).key,
					encode
				);
			
			//
			// Instantiate user.
			//
			const user =
				new User(
					theRequest,			// Current request.
					data,				// User document contents.
					null,				// Default collection.
					false,				// Mutable.
					true				// Load related.
				);
			
			//
			// Set authentication record.
			//
			User.setAuthentication( encode[ Dict.descriptor.kPassword ], user );
			
			//
			// Insert user.
			//
			user.insertDocument( true );
			
			//
			// Return response.
			//
			theResponse.send({ result : token });									// ==>
		}
		catch( error )
		{
			//
			// Init default HTTP error type.
			//
			const http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
				&& error.hasOwnProperty( 'param_http' ) )
				theResponse.throw( error.param_http, error );					// !@! ==>
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// signUpUser
	
	/**
	 * Return sign in user form
	 *
	 * This service can be used to get the signin form along with the saved user data,
	 * it expects the following parameters in the body:
	 *
	 * 	- token:	the user authentication token.
	 * 	- encoded:	the sign up token.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Validate the user authentication token.
	 * 	- Decode the sign up token.
	 * 	- Resolve the corresponding user.
	 * 	- Authenticate the user.
	 * 	- Resolve the signin form.
	 * 	- Add the user data to the form.
	 * 	- Return the signin form with user data.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	signInUserForm : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.tokenUser( theRequest, theResponse );
			
			//
			// Decode token.
			//
			const decoded = Application.decode(
				Application.userAuthentication( false ).key,
				theRequest.body.encoded
			);
			
			//
			// Save and remove password.
			//
			const token_password = decoded[ Dict.descriptor.kPassword ];
			delete decoded[ Dict.descriptor.kPassword ];
			
			//
			// Get user.
			// The decoded token has now only the username.
			//
			const user = new User( theRequest, decoded );
			
			//
			// Check user.
			//
			if( ! user.resolveDocument( false, false ) )
				theResponse.throw(
					404,
					new MyError(
						'AuthFailed',						// Error name.
						K.error.UserNotFound,				// Error code.
						theRequest.application.language,	// Error language.
						decoded.username					// Error data.
					)
				);																// !@! ==>
			
			//
			// Check signup credentials.
			//
			if( ! User.checkAuthentication( token_password, user ) )
				theResponse.throw(
					403,
					new MyError(
						'AuthFailed',						// Error name.
						K.error.BadPassword,				// Error code.
						theRequest.application.language		// Error language.
					)
				);																// !@! ==>
			
			//
			// Resolve signin form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormSignin,					// Form _key.
					K.function.clone(user.document),		// Form data.
					true									// Only form fields.
				);
			
			theResponse.send({ result : form.form });								// ==>
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
		
	},	// signInUserForm
	
	/**
	 * Activate user
	 *
	 * The service will create a user, it expects the following
	 * object in the body:
	 *
	 * 	- token:	the user authentication token.
	 * 	- encoded: 	the sign up token.
	 * 	- data:		the signin form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Validate the user authentication token.
	 * 	- Validate form data.
	 * 	- Load user record.
	 * 	- Decode sign up credentials.
	 * 	- Authenticate the user.
	 * 	- Update the authorisation data.
	 * 	- Remove the status.
	 * 	- Replace the user.
	 * 	- Update the session.
	 * 	- Return the user.
	 *
	 * The service returns the new user record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	signInUser : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.tokenUser( theRequest, theResponse );
			
			//
			// Decode sign up credentials.
			//
			const decoded = Application.decode(
				Application.userAuthentication( false ).key,
				theRequest.body.encoded
			);
			
			//
			// Set user code if missing.
			//
			if( ! theRequest.body.data.hasOwnProperty( Dict.descriptor.kUsername ) )
				theRequest.body.data[ Dict.descriptor.kUsername ] =
					decoded[ Dict.descriptor.kUsername ];
			
			//
			// Validate form.
			//
			const form = new Form( theRequest, Dict.term.kFormSignin );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Save and remove user password from uaser record.
			// User password is required when signin in.
			//
			const password_user = theRequest.body.data[ Dict.descriptor.kPassword ];
			delete theRequest.body.data[ Dict.descriptor.kPassword ];
			
			//
			// Get user.
			//
			const user = new User( theRequest, theRequest.body.data );
			
			//
			// Check user.
			//
			if( ! user.resolveDocument( false, false ) )
				theResponse.throw(
					403,
					new MyError(
						'BadUserReference',							// Error name.
						K.error.UserNotFound,						// Error code.
						theRequest.application.language,			// Error language.
						user.document[ Dict.descriptor.kUsername ]	// Error data.
					)
				);																// !@! ==>
			
			//
			// Check signup credentials.
			//
			if( ! User.checkAuthentication( decoded[ Dict.descriptor.kPassword ], user ) )
				theResponse.throw(
					403,
					new MyError(
						'AuthFailed',						// Error name.
						K.error.BadPassword,				// Error code.
						theRequest.application.language		// Error language.
					)
				);																// !@! ==>
			
			//
			// Remove status.
			//
			delete user.document[ Dict.descriptor.kStatus ];
			
			//
			// Set authentication record.
			//
			User.setAuthentication( password_user, user );
			
			//
			// Replace user.
			//
			user.replaceDocument( true );
			
			//
			// Login user.
			//
			theRequest.session.uid = user.document._id;
			theRequest.session.data = {};
			theRequest.sessionStorage.save( theRequest.session );
			
			//
			// Copy user to request.
			//
			theRequest.application.user = user.document;
			
			theResponse.send({ result : user.document });							// ==>
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
		
	},	// signInUser
	
	/**
	 * Reset user
	 *
	 * The service can be used to reset a user, it expects the following properties in
	 * the POST body:
	 *
	 * 	- token:	The user authentication token.
	 * 	- username:	The user code.
	 *
	 * The service will return a string token that will be used when the user will
	 * signin, it contains the user code and password, these will be used to
	 * authenticate and load the user data when the user will sign in.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Validate the user authentication token.
	 * 	- Resolve the provided username.
	 * 	- Check that there is no current user in the session, or that the current user
	 * 	  can manage the provided user reference.
	 * 	- Set the user status to pending.
	 * 	- Set password.
	 * 	- Encode the username and password.
	 * 	- Create the authorisation data.
	 * 	- Replace the user.
	 * 	- Return the encoded user record token.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	reset : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.tokenUser( theRequest, theResponse );
			
			//
			// Instantiate user.
			//
			const selector = {};
			selector[ Dict.descriptor.kUsername ] =
				theRequest.body.username;
			
			//
			// Instantiate user.
			// Will raise an exception if not found.
			//
			const user = new User( theRequest, selector );
			user.resolveDocument( true, true );
			
			//
			// Validate current user as manager.
			//
			if( theRequest.session.hasOwnProperty( 'uid' )
			 && (theRequest.session.uid !== null)
			 && (! user.managedBy( theRequest.session.uid )) )
				theResponse.throw(
					403,
					new MyError(
						'ServiceUnavailable',				// Error name.
						K.error.CannotManageUser,			// Error code.
						theRequest.application.language,	// Error language.
						theRequest.body.username			// Arguments.
					)
				);																// !@! ==>
			
			//
			// Set user pending status.
			//
			user.document[ Dict.descriptor.kStatus ] = Dict.term.kStateStatusPending;
			
			//
			// Create token data.
			//
			const encode = {};
			encode[ Dict.descriptor.kUsername ] = user.document[ Dict.descriptor.kUsername ];
			encode[ Dict.descriptor.kPassword ] = crypto.genRandomAlphaNumbers( 48 );
			
			//
			// Generate token.
			//
			const token =
				Application.encode(
					Application.userAuthentication( false ).key,
					encode
				);
			
			//
			// Set authentication data.
			//
			User.setAuthentication( encode[ Dict.descriptor.kPassword ], user );
			
			//
			// Replace user.
			//
			user.replaceDocument( true );
			
			//
			// Return response.
			//
			theResponse.send({ result : token });									// ==>
		}
		catch( error )
		{
			//
			// Init default HTTP error type.
			//
			const http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				theResponse.throw( error.param_http, error );					// !@! ==>
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// reset
	
	/**
	 * Remove user
	 *
	 * The service can be used to remove a user, it expects the following properties in
	 * the POST body:
	 *
	 * 	- token:	The user authentication token.
	 * 	- username:	The user code.
	 *
	 * The service will return an ovject, { result : true }, upon completion.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current session user.
	 * 	- Assert the current session user can manage other users.
	 * 	- Validate the user authentication token.
	 * 	- Resolve the provided username.
	 * 	- Assert the current session user can manage provided user.
	 * 	- Remove the user.
	 * 	- Return { result : true }.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	remove : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.hasUser( theRequest, theResponse );
			Middleware.assert.canManage( theRequest, theResponse );
			Middleware.assert.tokenUser( theRequest, theResponse );
			
			//
			// Instantiate user.
			//
			const selector = {};
			selector[ Dict.descriptor.kUsername ] =
				theRequest.body.username;
			
			//
			// Instantiate user.
			// Will raise an exception if not found.
			//
			const user = new User( theRequest, selector );
			user.resolveDocument( true, true );
			
			//
			// Validate current user as manager.
			//
			if( theRequest.session.hasOwnProperty( 'uid' )
			 && (theRequest.session.uid !== null)
			 && (! user.managedBy( theRequest.session.uid )) )
				theResponse.throw(
					403,
					new MyError(
						'ServiceUnavailable',				// Error name.
						K.error.CannotManageUser,			// Error code.
						theRequest.application.language,	// Error language.
						theRequest.body.username			// Arguments.
					)
				);																// !@! ==>
			
			//
			// Remove user.
			//
			user.removeDocument( true, true );
			
			//
			// Return response.
			//
			theResponse.send({ result : true });									// ==>
		}
		catch( error )
		{
			//
			// Init default HTTP error type.
			//
			const http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				theResponse.throw( error.param_http, error );					// !@! ==>
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	},	// remove
	
	/**
	 * Change user code
	 *
	 * The service can be used to modify an existing username, it expects the following
	 * properties in the POST body:
	 *
	 * 	- token:	The user authentication token.
	 * 	- old:		The existing user code.
	 * 	- new:		The new user code.
	 *
	 * The service will return the new username if the service was successful, or
	 * raise an exception if not.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user.
	 * 	- Validate the user authentication token.
	 * 	- Resolve the provided old username.
	 * 	- Ensure the current user can manage the resolved user.
	 * 	- Assert the new username does not exist.
	 * 	- Update the username in the collection.
	 * 	- Return the updated username.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	changeUsername : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			Middleware.assert.hasUser( theRequest, theResponse );
			Middleware.assert.tokenUser( theRequest, theResponse );
			
			//
			// Instantiate user.
			//
			const selector = {};
			selector[ Dict.descriptor.kUsername ] = theRequest.body.old;
			
			//
			// Instantiate user.
			// Will raise an exception if not found.
			//
			const user = new User( theRequest, selector );
			user.resolveDocument( true, true );
			
			//
			// Validate current user as manager.
			// We know the session has the uid.
			// The User method does not include the root node,
			// this means that a user cannot change its own code:
			// this ensures the system administrator username will not change.
			//
			if( ! user.managedBy( theRequest.session.uid ) )
				theResponse.throw(
					403,
					new MyError(
						'ServiceUnavailable',				// Error name.
						K.error.CannotManageUser,			// Error code.
						theRequest.application.language,	// Error language.
						theRequest.body.old					// Arguments.
					)
				);																// !@! ==>
			
			//
			// Check if new username is used.
			//
			selector[ Dict.descriptor.kUsername ] = theRequest.body.new;
			const temp = new User( theRequest, selector );
			if( temp.resolveDocument( false, false ) )
				theResponse.throw(
					403,
					new MyError(
						'ConstraintViolated',				// Error name.
						K.error.UserExists,					// Error code.
						theRequest.application.language,	// Error language.
						null								// Arguments.
					)
				);																// !@! ==>
			
			//
			// Update username.
			//
			db._collection( 'users' ).update( user.document, selector );
			
			//
			// Return response.
			//
			theResponse.send({ result : theRequest.body.new });						// ==>
		}
		catch( error )
		{
			//
			// Init default HTTP error type.
			//
			const http = 500;
			
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				theResponse.throw( error.param_http, error );					// !@! ==>
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
	}	// changeUsername
};
