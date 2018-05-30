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
	hierarchy : ( theRequest, theResponse ) =>
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
		
	}	// hierarchy
};
