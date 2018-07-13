'use strict';

//
// Framework.
//
const db = require('@arangodb').db;
const createAuth = require('@arangodb/foxx/auth');

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Classes.
//
const User = require( '../classes/User' );
const Form = require( '../classes/Form' );

//
// User middleware.
//
const UserMiddleware = require( '../middleware/user' );


/**
 * Session services
 *
 * These handlers use the 'session' path, they implement services at the session
 * level, such as ping, login and logout.
 */

module.exports = {

	/**
	 * Ping
	 *
	 * This service returns the object { result : "pong" }, the service serves the
	 * purpose of knowing whether the application is responding.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : "pong" }.
	 */
	ping : ( theRequest, theResponse ) => {

		theResponse.send({ result : 'pong' });										// ==>

	},	// ping
	
	/**
	 * Who am I?
	 *
	 * Return the current user record, if there is a current user, or
	 * { username : null } if there is no current user.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : <user>|null }.
	 */
	user : ( theRequest, theResponse ) =>
	{
		//
		// Init result.
		//
		const result = { result : null };
		
		//
		// Handle user.
		//
		if( theRequest.hasOwnProperty( 'application' )
		 && theRequest.application.hasOwnProperty( 'user' ) )
			result.result = theRequest.application.user;
		
		theResponse.send( result );													// ==>
		
	},	// user
	
	/**
	 * Login
	 *
	 * Logs user in and returns its record: { user : <user> }.
	 *
	 * The service expects the following parameters in the POST body:
	 *
	 * 	- username:	The user code.
	 * 	- password:	The user password.
	 *
	 * The service throws the following exceptions:
	 * 	- User not found: 404.
	 * 	- Invalid credentials: 403.
	 *
	 * @param theRequest	{Object}	username and password.
	 * @param theResponse	{Object}	The user.
	 * @returns {Object}				The object { result : <user> }.
	 */
	login : ( theRequest, theResponse ) =>
	{
		//
		// Framework.
		//
		const User = require( '../classes/User' );
		
		//
		// Get user.
		//
		const selector = {};
		selector[ Dict.descriptor.kUsername ] = theRequest.body.username;
		const user = new User( theRequest, selector );
		
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
					theRequest.body.username			// Error data.
				)
			);																	// !@! ==>
		
		//
		// Check if pending or disabled.
		//
		if( user.document.hasOwnProperty( Dict.descriptor.kStatus )
		 && ( (user.document[ Dict.descriptor.kStatus ] === Dict.term.kStateStatusPending)
		   || (user.document[ Dict.descriptor.kStatus ] === Dict.term.kStateStatusDisabled) ) )
			theResponse.throw(
				403,
				new MyError(
					'AuthFailed',						// Error name.
					K.error.UserNotFound,				// Error code.
					theRequest.application.language,	// Error language.
					theRequest.body.username			// Error data.
				)
			);																	// !@! ==>
		
		//
		// Check credentials.
		//
		if( ! User.checkAuthentication( theRequest.body.password, user.document ) )
			theResponse.throw(
				403,
				new MyError(
					'AuthFailed',						// Error name.
					K.error.BadPassword,				// Error code.
					theRequest.application.language		// Error language.
				)
			);																	// !@! ==>
		
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
		
		theResponse.send({ result : user.document });								// ==>
		
	},	// login
	
	/**
	 * Logout
	 *
	 * Logout user and return former user: { user : <former user>|null }.
	 *
	 * @param theRequest	{Object}	Current request.
	 * @param theResponse	{Object}	Current response.
	 * @returns {Object}				The object { result : <former user>|null }.
	 */
	logout : ( theRequest, theResponse ) =>
	{
		//
		// Logout user.
		//
		theRequest.session.uid = null;
		theRequest.session.data = {};
		theRequest.sessionStorage.save( theRequest.session );
		
		//
		// Save current user.
		//
		const user = theRequest.application.user;
		
		//
		// Reset user in request.
		//
		theRequest.application.user = null;
		
		theResponse.send({ result : user });										// ==>
		
	},	// logout
	
	/**
	 * Return the user profile form
	 *
	 * This service can be used to retrieve the current session user profile
	 * management form.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Load the form structure.
	 * 	- Return the form to the client with the current user record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	userProfileForm : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			UserMiddleware.assert.hasUser( theRequest, theResponse );
			
			//
			// Resolve profile form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormSignin,					// Form _key.
					theRequest.application.user,			// User profile record.
					true									// Restrict form fields.
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
		
	},	// userProfileForm
	
	/**
	 * Update user profile
	 *
	 * The service will update the current session user profile, it expects the following
	 * object in the body:
	 *
	 * 	- token:	the user authentication token.
	 * 	- data:		the signin form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current session user.
	 * 	- Validate the user authentication token.
	 * 	- Instantiate current user.
	 * 	- Assert current session user is the same.
	 * 	- Validate form data.
	 * 	- Load user record.
	 * 	- Update the user profile.
	 * 	- Update the authorisation data if password provided.
	 * 	- Replace the user.
	 * 	- Return the user.
	 *
	 * The service returns the user record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	userProfile : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Assertions.
			//
			UserMiddleware.assert.hasUser( theRequest, theResponse );
			UserMiddleware.assert.tokenUser( theRequest, theResponse );
			
			//
			// Save and remove user password from user record.
			//
			let password = null;
			if( theRequest.body.data.hasOwnProperty( Dict.descriptor.kPassword ) )
			{
				password = theRequest.body.data[ Dict.descriptor.kPassword ];
				delete theRequest.body.data[ Dict.descriptor.kPassword ];
			}
			
			//
			// Instantiate and resolve user.
			//
			const user = new User( theRequest, theRequest.body.data );
			if( ! user.persistent )
				user.resolveDocument( true, true );
			
			//
			// Check if it is the same user as the current session's one.
			//
			if( user.document._id !== theRequest.session.uid )
				theResponse.throw(
					403,
					new MyError(
						'DifferentCurrentUser',						// Error name.
						K.error.SessionUserChanged,					// Error code.
						theRequest.application.language,			// Error language.
						null										// Error data.
					)
				);																// !@! ==>
			
			//
			// Validate form.
			//
			const form = new Form( theRequest, Dict.term.kFormSignin );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Update user record.
			//
			user.setDocumentProperties( theRequest.body.data, true, false );
			
			//
			// Set authentication record.
			//
			if( password !== null )
				User.setAuthentication( password, user );
			
			//
			// Replace user.
			//
			user.replaceDocument( true );
			
			//
			// Update user in request.
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
		
	},	// userProfile
	
	/**
	 * Hierarchy
	 *
	 * Return the manager hierarchy of the current user, the service will return an
	 * array of user records formatted according to the provided parameters; if there
	 * is no current user, the service will return null.
	 *
	 * The returned list represents the mchain of management starting from the current
	 * user, up to the root manager.
	 *
	 * The response is an object, { result: <result> }, where result is the list of
	 * managers or null.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : <user>|null }.
	 */
	managers : ( theRequest, theResponse ) =>
	{
		//
		// Init result.
		//
		const result = { result : null };
		
		//
		// Handle user.
		//
		if( theRequest.session.hasOwnProperty( 'uid' )
		 && (theRequest.session.uid !== null) )
		{
			//
			// Framework.
			//
			const User = require( '../classes/User' );
			
			//
			// Instantiate user.
			// By providing a reference we know the object is persistent.
			//
			const user = new User( theRequest, theRequest.session.uid );
			
			//
			// Get hierarchy.
			//
			result.result = user.managers(
				theRequest.body.minDepth,
				theRequest.body.maxDepth,
				null,
				null,
				theRequest.body.doEdge,
				true
			);
			
		}	// Has current user.
		
		theResponse.send( result );													// ==>
		
	},	// hierarchy
	
	/**
	 * Manages
	 *
	 * Return the managed hierarchy of the current user, the service will return an
	 * array of user records formatted according to the provided parameters; if there
	 * is no current user, the service will return null.
	 *
	 * The returned list represents the chain of management starting from the current
	 * user, down to the managed siblings. The hierarchy is either the flattened array
	 * of all siblings or the hierarchical tree, depending on the service parameters.
	 *
	 * The response is an object, { result: <value> }, where value is the result of
	 * the service.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : <user>|null }.
	 */
	manages : ( theRequest, theResponse ) =>
	{
		//
		// Init result.
		//
		const result = { result : null };
		
		//
		// Handle user.
		//
		if( theRequest.session.hasOwnProperty( 'uid' )
		 && (theRequest.session.uid !== null) )
		{
			//
			// Framework.
			//
			const User = require( '../classes/User' );
			
			//
			// Instantiate user.
			// By providing a reference we know the object is persistent.
			//
			const user = new User( theRequest, theRequest.session.uid );
			
			//
			// Get managed hierarchy.
			//
			result.result = user.managed(
				theRequest.body.doTree,
				theRequest.body.minDepth,
				theRequest.body.maxDepth,
				null,
				null,
				theRequest.body.doEdge,
				true
			);
			
		}	// Has current user.
		
		theResponse.send( result );													// ==>
		
	}	// manages
};
