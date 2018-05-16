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
const Edge = require( '../classes/Edge' );
const Schema = require( '../classes/Schema' );
const Application = require( '../utils/Application' );

//
// Classes.
//
const Form = require( '../classes/Form' );

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
	admin : ( theRequest, theResponse ) =>
	{

		//
		// Globals.
		//
		const form_admin = Dict.term.kFormAdmin;
		
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
			// Validation.
			//
			const form = new Form( theRequest, Dict.term.kFormAdmin );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Complete user data.
			//
			const user = theRequest.body.data;
			user[ Dict.descriptor.kUsername ] = K.globals.user.sysadm;
			user[ Dict.descriptor.kRank ]	  = Dict.term.kRankSystem;
			user[ Dict.descriptor.kRole ]	  =
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
			user[ Dict.descriptor.kAuthData ] =
				auth.create( user[ Dict.descriptor.kPassword ] );
			
			//
			// Insert user.
			//
			const meta = db._collection( 'users' ).insert( user );
			
			//
			// Update session.
			//
			theRequest.session.uid = meta._id;
			theRequest.session.data = {};
			theRequest.sessionStorage.save( theRequest.session );
			
			//
			// Copy user to request.
			//
			theRequest.application.user = user;
			
			//
			// Return response.
			//
			theResponse.send({ result : user });
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
		
	},	// admin
	
	/**
	 * Signup user
	 *
	 * The service can be used to register a new user, it expects the user
	 * authentication token and the signup form contents in the respective 'token' and
	 * 'data' fields in the POST body.
	 *
	 * The service will return a string token that will be used when the user will
	 * signin, it is the encoded signup user's username and password.
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
		// Globals.
		//
		let http = 500;
		let meta = null;
		let link = null;
		let token = null;
		const form_admin = Dict.term.kFormSignup;
		
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
			// Complete user data.
			//
			const user = theRequest.body.data;
			if( ! user.hasOwnProperty( Dict.descriptor.kUsername ) )
				user[ Dict.descriptor.kUsername ] =
					user[ Dict.descriptor.kEmail ];
			user[ Dict.descriptor.kPassword ] = crypto.genRandomAlphaNumbers( 48 );
			if( ! user.hasOwnProperty( Dict.descriptor.kLanguage ) )
				user[ Dict.descriptor.kLanguage ] =
					module.context.configuration.defaultLanguage;
			user[ Dict.descriptor.kStatus ] = Dict.term.kStateStatusPending;
			
			//
			// Generate token.
			//
			const encode = {};
			encode[ Dict.descriptor.kUsername ] = user[ Dict.descriptor.kUsername ];
			encode[ Dict.descriptor.kPassword ] = user[ Dict.descriptor.kPassword ];
			token =
				Application.encode(
					Application.userAuthentication( false ).key,
					encode
				);
			
			//
			// Create authorisation data.
			//
			const auth = createAuth();
			user[ Dict.descriptor.kAuthData ] =
				auth.create( user[ Dict.descriptor.kPassword ] );
			
			//
			// Insert user.
			//
			meta = db._collection( 'users' ).insert( user );
		}
		catch( error )
		{
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				theResponse.throw( error.param_http, error );					// !@! ==>
			
			//
			// Handle unique constraint error.
			//
			else if( error.isArangoError
				  && (error.errorNum === ARANGO_DUPLICATE) )
				theResponse.throw(
					400,
					new MyError(
						'InsertUser',						// Error name.
						K.error.UserExists,					// Message code.
						theRequest.application.language		// Language.
					)
				);																// !@! ==>
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
		//
		// Set manager link.
		//
		try
		{
			//
			// Get current user.
			// SHOULD NOT FAIL.
			//
			const manager =
				db._collection( 'users' )
					.firstExample(
						Dict.descriptor.kUsername,
						theRequest.application.user[ Dict.descriptor.kUsername ]
					);
			
			//
			// Build edge.
			//
			const edge = new Edge( meta._id, manager._id, `terms/${Dict.term.kPredicateManagedBy}` );
			link = edge.getData();
			db._collection( 'schemas' ).insert( link );
		}
		catch( error )
		{
			//
			// Handle MyError exceptions.
			//
			if( (error.constructor.name === 'MyError')
			 && error.hasOwnProperty( 'param_http' ) )
				http = error.param_http;
			
			//
			// Handle unique constraint error.
			//
			else if( error.isArangoError
				  && (error.errorNum === ARANGO_DUPLICATE) )
				theResponse.throw(
					400,
					new MyError(
						'InsertEdge',						// Error name.
						K.error.EdgeExists,					// Message code.
						theRequest.application.language,	// Language.
						[ link._from, link._to, link[ Dict.descriptor.kPredicate ] ]
					)
				);																// !@! ==>
			
			theResponse.throw( http, error );									// !@! ==>
		}
		
		//
		// Return response.
		//
		theResponse.send({ result : token });
		
	}	// signUp
};
