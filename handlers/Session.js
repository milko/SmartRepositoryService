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
	whoami : ( theRequest, theResponse ) =>
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

	},	// whoami

	/**
	 * Login
	 *
	 * Login user.
	 *
	 * Logs user in and returns its record: { user : <user> }.
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
		const valid = auth.verify( user.document.auth, theRequest.body.password );
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

		theResponse.send({ result : user.document });										// ==>

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
	 * Hierarchy
	 *
	 * Return the current user hierarchy, the result will be an array of users
	 * starting from the current user up to the root manager.
	 *
	 * @param theRequest	{Object}	Current request.
	 * @param theResponse	{Object}	Current response.
	 * @returns {Array}					The user hierarchy
	 * 									{ result : <hierarchy> }.
	 */
	hierarchy : ( theRequest, theResponse ) =>
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
		
	}	// hierarchy
};
