'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');

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
const Study = require( '../classes/Study' );
const Schema = require( '../utils/Schema' );

//
// Middleware.
//
const UserMiddleware = require( '../middleware/user' );

/**
 * Dataset services
 *
 * These handlers use the 'dataset' path, they implement services related to
 * datasets.
 */

module.exports = {
	
	/**
	 * Return the dataset registration form
	 *
	 * This service can be used to retrieve the dataset registration form.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can upload.
	 * 	- Load the form structure.
	 * 	- Return the form to the client.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	datasetRegistrationForm : ( theRequest, theResponse ) =>
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
			UserMiddleware.assert.canUpload( theRequest, theResponse );
			
			//
			// Resolve profile form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormSmart,					// Form _key.
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
		
	},	// datasetRegistrationForm
	
	/**
	 * Register dataset
	 *
	 * The service will register a dataset, it expects the following object in the body:
	 *
	 * 	- data:	 the dataset registration form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can upload.
	 * 	- Validate form data.
	 * 	- Insert the dataset.
	 * 	- Insert the user registration reference.
	 * 	- Return the registration record.
	 *
	 * The service returns the administrator user record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	datasetRegistration : ( theRequest, theResponse ) =>
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
			UserMiddleware.assert.canUpload( theRequest, theResponse );
			
			//
			// Validate form.
			//
			const form = new Form( theRequest, Dict.term.kFormSmart );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Instantiate study.
			//
			const study =
				new Study(
					theRequest,
					theRequest.body.data
				);
			
			//
			// Insert study.
			//
			study.insertDocument( true );
			
			theResponse.send({ result : study.document });							// ==>
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
		
	},	// datasetRegistration

};
