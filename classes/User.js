'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');
const errors = require('@arangodb').errors;
const traversal = require("@arangodb/graph/traversal");
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );


/**
 * User class
 *
 * This class implements a user object.
 *
 * The class expects all required collections to exist.
 */
class User
{
	/**
	 * Constructor
	 *
	 * The constructor expects a single parameter that can be either an object, in
	 * which case the constructor will fill the user data with the provided structure,
	 * or a string, in which case the constructor will attempt to instantiate the
	 * object from the database: it will first attempt to resolve the _id or _key
	 * reference, if that doesn't work it will try to match the 'username', if that
	 * also fails, the method will raise an exception.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theReference	{String}|{Object}	The reference or the data.
	 * @param theManager	{String}			The user manager reference.
	 */
	constructor( theRequest, theReference, theManager = null )
	{
		//
		// Handle structure.
		//
		if( K.function.isObject( theReference ) )
		{
			this.data = {};
			for( const field in theReference )
				this.data[ field ] = theReference[ field ];
		}
		
		//
		// Handle reference.
		//
		else
		{
			//
			// Try reference.
			//
			try
			{
				this.data = db._collection( 'users' ).document( theReference );
			}
			catch( error )
			{
				//
				// Handle exceptions.
				//
				if( (! error.isArangoError)
				 || (error.errorNum !== ARANGO_NOT_FOUND) )
					throw( error );												// !@! ==>
			}
			
			//
			// Try username.
			//
			if( ! this.hasOwnProperty( 'data' ) )
			{
				try
				{
					this.data =
						db._collection( 'users' )
							.firstExample(
								Dict.descriptor.kUsername,
								theReference
							);
				}
				catch( error )
				{
					//
					// Handle exceptions.
					//
					if( (! error.isArangoError)
					 || (error.errorNum !== ARANGO_NOT_FOUND) )
						throw( error );											// !@! ==>
					
					//
					// Handle not found.
					//
					throw(
						new MyError(
							'BadUserReference',					// Error name.
							K.error.UserNotFound,				// Message code.
							theRequest.application.language,	// Language.
							theReference,						// Error value.
							404									// HTTP error code.
						)
					);															// !@! ==>
				}
			}
		}
		
		//
		// Set manager.
		//
		if( theManager !== null )
			this.manager = new User( theRequest, theManager );
		
		//
		// Get manager.
		//
		else
		{
		
		}
		
	}	// constructor
	
	/**
	 * Return user object
	 *
	 * This method will return the user object data.
	 *
	 * @returns {Object}	User data.
	 */
	getData()
	{
		return this.data;															// ==>
		
	}	// getData
	
	/**
	 * Return user manager object
	 *
	 * This method will return the user manager object data.
	 *
	 * @returns {Object}	User manager data.
	 */
	getManager()
	{
		return ( this.hasOwnProperty( 'manager' ) )
			 ? this.manager															// ==>
			 : null;																// ==>
		
	}	// getManager
	
}	// User.

module.exports = User;
