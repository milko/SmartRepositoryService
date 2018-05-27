'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');
const createAuth = require('@arangodb/foxx/auth');

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
const Schema = require( '../classes/Schema' );

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
	 * Signup user
	 *
	 * The service can be used to register a new user, it expects the user
	 * authentication token and the signup form contents in the respective 'token' and
	 * 'data' fields in the POST body.
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
	signUp : ( theRequest, theResponse ) =>
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
			const data = {};
			
			data[ Dict.descriptor.kUsername ]
				= ( data.hasOwnProperty( Dict.descriptor.kUsername ) )
				? theRequest.body.data[ Dict.descriptor.kUsername ]
				: theRequest.body.data[ Dict.descriptor.kEmail ];
			data[ Dict.descriptor.kName ] = theRequest.body.data[ Dict.descriptor.kName ];
			data[ Dict.descriptor.kEmail ] = theRequest.body.data[ Dict.descriptor.kEmail ];
			data[ Dict.descriptor.kLanguage ]
				= ( theRequest.body.data.hasOwnProperty( Dict.descriptor.kLanguage ) )
				? theRequest.body.data[ Dict.descriptor.kLanguage ]
				: module.context.configuration.defaultLanguage;
			data[ Dict.descriptor.kRank ] = theRequest.body.data[ Dict.descriptor.kRank ];
			data[ Dict.descriptor.kRole ] = theRequest.body.data[ Dict.descriptor.kRole ];
			data[ Dict.descriptor.kStatus ] = Dict.term.kStateStatusPending;
			
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
			// Create authorisation data.
			//
			const auth = createAuth();
			data[ Dict.descriptor.kAuthData ] =
				auth.create( encode[ Dict.descriptor.kPassword ] );
			
			//
			// Instantiate user.
			//
			const user = new User(
				theRequest,
				data,
				( theRequest.body.data.hasOwnProperty( Dict.descriptor.kGroup ) )
					? theRequest.body.data[ Dict.descriptor.kGroup ]
					: null,
				theRequest.session.uid
			);
			
			//
			// Insert user.
			//
			user.insert();
			
			//
			// Return response.
			//
			theResponse.send({ result : token });
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
		
	},	// signUp
	
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
			// Create authorisation data.
			//
			const auth = createAuth();
			data[ Dict.descriptor.kAuthData ] =
				auth.create( data[ Dict.descriptor.kPassword ] );
			
			//
			// Remove password.
			//
			delete data[ Dict.descriptor.kPassword ];
			
			//
			// Insert user.
			//
			const meta = db._collection( 'users' ).insert( data );
			
			//
			// Update session.
			//
			theRequest.session.uid = meta._id;
			theRequest.session.data = {};
			theRequest.sessionStorage.save( theRequest.session );
			
			//
			// Copy user to request.
			//
			theRequest.application.user = data;
			
			//
			// Return response.
			//
			theResponse.send({ result : data });
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
	 * Create user
	 *
	 * The service will create a user, it expects the following
	 * object in the body:
	 *
	 * 	- token: the authentication token.
	 * 	- data:	 the signin form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Validate the authentication token.
	 * 	- Validate form data.
	 * 	- Load user record.
	 * 	- Complete the user record.
	 * 	- Remove the status..
	 * 	- Create the authorisation data.
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
	signinUser : ( theRequest, theResponse ) =>
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
			// Validate form.
			//
			const form = new Form( theRequest, Dict.term.kFormSignin );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Save password.
			//
			const pass = theRequest.body.data[ Dict.descriptor.kPassword ];
			delete theRequest.body.data[ Dict.descriptor.kPassword ];
			
			//
			// Get user.
			//
			const user = new User( theRequest, theRequest.body.data );
			
			//
			// Check user.
			//
			if( ! user.resolve( false, false ) )
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
			// Check credentials.
			//
			const auth = createAuth();
			const valid = auth.verify( user.document.auth, password );
			if( ! valid )
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
			delete user.document[ Dict.descriptor.kStateStatus ];
			
			//
			// Replace user.
			//
			user.replace( true );
			
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
		
	}	// signinUser
};
