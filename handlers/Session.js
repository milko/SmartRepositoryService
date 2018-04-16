'use strict';

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
	 * Logs user in and returns its record: { user ; <user> }.
	 *
	 * @param theRequest	{Object}	username and password.
	 * @param theResponse	{Object}	The user.
	 */
	login : ( theRequest, theResponse ) =>
	{
		//
		// Init framework.
		//
		const db = require('@arangodb').db;
		const createAuth = require('@arangodb/foxx/auth');

		//
		// Init application.
		//
		const K = require( '../utils/Constants' );
		const Dict = require( '../dictionary/Dict' );
		const MyError = require( '../utils/MyError' );

		//
		// Get credentials.
		//
		const code = theRequest.body.username;
		const pass = theRequest.body.password;

		//
		// Locate user.
		//
		const key = {};
		key[ Dict.descriptor.kUsername ] = code;
		const user = db._collection( 'users' ).firstExample( key );

		//
		// Handle user not found.
		//
		if( user === null )
			theResponse.throw(
				404,
				new MyError(
					'AuthFailed',						// Error name.
					K.error.UserNotFound,				// Error code.
					theRequest.application.language,	// Error language.
					code								// Error data.
				)
			);																	// !@! ==>

		//
		// Check credentials.
		//
		const auth = createAuth();
		const valid = auth.verify( user.auth, pass );
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
		theRequest.session.uid = user._id;
		theRequest.session.data = {};
		theRequest.sessionStorage.save( theRequest.session );

		//
		// Copy user to request.
		//
		theRequest.application.user = user;

		theResponse.send({ result : user });											// ==>

	},	// login
};
