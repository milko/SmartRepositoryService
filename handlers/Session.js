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
		if( theRequest.application.user )
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
		if( ! user.resolve( false, false ) )
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
		const auth = createAuth();
		const valid = auth.verify(
			user.document[ Dict.descriptor.kAuthData ],
			theRequest.body.password );
		if( ! valid )
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
	 * Return current user credentials form
	 *
	 * This service will return the current user record and the credentials form, the
	 * service will return an object, { form : <form>, user : <user> }, where form is the
	 * credentials form and user is the current user record; if there is no current user,
	 * the service will return null in both properties.
	 *
	 * The service throws the following exceptions:
	 * 	- User not found: 404.
	 * 	- Invalid credentials: 403.
	 *
	 * @param theRequest	{Object}	username and password.
	 * @param theResponse	{Object}	The user.
	 * @returns {Object}				The object { result : <user> }.
	 */
	getCredentials : ( theRequest, theResponse ) =>
	{
		//
		// Init local storage.
		//
		const result = { form : null, user : null };
		
		//
		// Check current user.
		//
		if( theRequest.session.uid )
		{
			//
			// Framework.
			//
			const Form = require( '../classes/Form' );
			const User = require( '../classes/User' );
			
			//
			// Instantiate user.
			//
			const user = new User( theRequest, theRequest.session.uid );
			
			//
			// Instantiate form.
			//
			const form = new Form( theRequest, Dict.term.kFormCredentials );
		
		}	// There is a session user.
		
		return result;																// ==>
		
		
/*
		//
		// Get user.
		//
		const selector = {};
		selector[ Dict.descriptor.kUsername ] = theRequest.body.username;
		const user = new User( theRequest, selector );
		
		//
		// Check user.
		//
		if( ! user.resolve( false, false ) )
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
		const auth = createAuth();
		const valid = auth.verify(
			user.document[ Dict.descriptor.kAuthData ],
			theRequest.body.password );
		if( ! valid )
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
*/
	
	},	// getCredentials
	
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
		if( theRequest.session.uid )
		{
			//
			// Framework.
			//
			const User = require( '../classes/User' );
			
			//
			// Instantiate user.
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
		if( theRequest.session.uid )
		{
			//
			// Framework.
			//
			const User = require( '../classes/User' );
			
			//
			// Instantiate user.
			//
			const user = new User( theRequest, theRequest.session.uid );
			
			//
			// Get managed hierarchy.
			//
			result.result = user.manages(
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
