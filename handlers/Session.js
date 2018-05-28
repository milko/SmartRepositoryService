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

	}	// whoami
};
