'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;

//
// Classes.
//
const Descriptor = require( '../classes/Descriptor' );

/**
 * User middleware services
 *
 * This script implements common user related middleware functions.
 */

module.exports = {
	/**
	 * Assertion middleware
	 *
	 * This set of middleware functions can be used to assert current conditions.
	 */
	assert : {
		
		/**
		 * Assert there are no users
		 *
		 * This middleware will assert that the users collection is empty, if that is
		 * not the case, the function will return an exception response.
		 *
		 * The middleware expects the users collection to exist.
		 *
		 * @param theRequest	{function}	The request.
		 * @param theResponse	{function}	The response.
		 */
		noUsers : ( theRequest, theResponse ) =>
		{
			//
			// Set collection.
			// Users collection is expected to exist.
			//
			const collection = db._collection( 'users' );
			
			//
			// Ensure there are no users.
			//
			if( collection.count() !== 0 )
				theResponse.throw(
					409,
					new MyError(
						'ServiceUnavailable',
						K.error.AdminFirstUser,
						theRequest.application.language
					)
				);															// !@! ==>
			
		},	// noUsers
		
		/**
		 * Assert there is a current user
		 *
		 * This middleware will check if there is a current user in the session.
		 *
		 * @param theRequest	{function}	The request.
		 * @param theResponse	{function}	The response.
		 */
		hasUser : ( theRequest, theResponse ) =>
		{
			//
			// Ensure there is a current user.
			//
			if( ! theRequest.application.user )
				theResponse.throw(
					409,
					new MyError(
						'ServiceUnavailable',
						K.error.AdminFirstUser,
						theRequest.application.language
					)
				);															// !@! ==>
			
		},	// hasUser
		
		/**
		 * Assert current user can manage users
		 *
		 * This middleware will check if the current user can manage users.
		 *
		 * Must call 'hasUser' before this.
		 *
		 * @param theRequest	{function}	The request.
		 * @param theResponse	{function}	The response.
		 */
		canManage : ( theRequest, theResponse ) =>
		{
			//
			// Init framework.
			//
			const Dict = require( '../ddict/Dict' );
			
			//
			// Ensure user can manage.
			//
			if( ! theRequest.use.role.includes( Dict.term.kRoleUser ) )
				theResponse.throw(
					403,
					new MyError(
						'ServiceUnavailable',			// Error name.
						K.error.CannotManageUsers,		// Error code.
						theRequest.application.language	// Error language.
					)
				);															// !@! ==>
			
		}	// canManage
		
	}	// assert
};
