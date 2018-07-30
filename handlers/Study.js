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
 * Study services
 *
 * These handlers use the 'study' path, they implement services related to
 * studies.
 */

module.exports = {
	
	/**
	 * Return the study registration form
	 *
	 * This service can be used to retrieve the study registration form, the service
	 * expects one parameter in the POST body, data, which is an object whose properties
	 * will be added to the form.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can handle metadata.
	 * 	- Load the form structure.
	 * 	- Return the form to the client.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	studyRegistrationForm : ( theRequest, theResponse ) =>
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
			UserMiddleware.assert.canMeta( theRequest, theResponse );
			
			//
			// Resolve profile form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormStudy,					// Form _key.
					theRequest.body.data,					// Form data.
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
		
	},	// studyRegistrationForm
	
	/**
	 * Register study
	 *
	 * The service will register a study, it expects the following object in the body:
	 *
	 * 	- data:	 the study registration form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can handle metadata.
	 * 	- Validate form data.
	 * 	- Insert the study.
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
	studyRegistration : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Framework.
			//
			const Dictionary = require( '../utils/Dictionary' );
			
			//
			// Assertions.
			//
			UserMiddleware.assert.hasUser( theRequest, theResponse );
			UserMiddleware.assert.canMeta( theRequest, theResponse );
			
			//
			// Restore language.
			//
			Dictionary.restoreLanguage(
				theRequest.body.data,
				theRequest.application.user[ Dict.descriptor.kLanguage ]
			);
			
			//
			// Validate form.
			//
			const form = new Form( theRequest, Dict.term.kFormStudy );
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
		
	},	// studyRegistration
	
	/**
	 * Return the study update form
	 *
	 * This service can be used to request the study registration form for updating
	 * purposes, it will return an object, { form : <form> }, where form is the study
	 * registration form.
	 *
	 * The service expects a parameter in the POST body, data, which is the study
	 * reference. It can either be a string, in which case it must be the study _id or
	 * _key, or an object containing the gid, or the nid and lid of the study.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can handle metadata.
	 * 	- Resolve the study.
	 * 	- Load the form structure.
	 * 	- Return the form to the client.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	studyUpdateForm : ( theRequest, theResponse ) =>
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
			UserMiddleware.assert.canMeta( theRequest, theResponse );
			
			//
			// Instantiate study.
			//
			const study =
				new Study(
					theRequest,
					theRequest.body.data
				);
			
			//
			// Resolve study.
			//
			if( ! study.persistent )
				study.resolveDocument( true, true );
			
			//
			// Remove unwanted properties.
			//
			const data = K.function.clone( study.document );
			
			//
			// Resolve form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormStudyUpdate,				// Form _key.
					data,									// Form data.
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
		
	},	// studyUpdateForm
	
	/**
	 * Update study
	 *
	 * The service will update the provided stusy, it expects the following object
	 * in the body:
	 *
	 * 	- data:	 the study update form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can handle metadata.
	 * 	- Validate form data.
	 * 	- Replace the study.
	 * 	- Return the study record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	studyUpdate : ( theRequest, theResponse ) =>
	{
		//
		// Procedures.
		//
		try
		{
			//
			// Framework.
			//
			const Dictionary = require( '../utils/Dictionary' );
			
			//
			// Assertions.
			//
			UserMiddleware.assert.hasUser( theRequest, theResponse );
			UserMiddleware.assert.canMeta( theRequest, theResponse );
			
			//
			// Collect properties to be deleted.
			//
			const deleted = {};
			for( let field in theRequest.body.data )
			{
				if( theRequest.body.data[ field ] === null )
				{
					deleted[ field ] = null;
					delete theRequest.body.data[ field ];
				}
			}
			
			//
			// Restore language.
			//
			Dictionary.restoreLanguage(
				theRequest.body.data,
				theRequest.application.user[ Dict.descriptor.kLanguage ]
			);
			
			//
			// Validate form.
			//
			const form = new Form( theRequest, Dict.term.kFormStudyUpdate );
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
			// Resolve study.
			//
			if( ! study.persistent )
				study.resolveDocument( false, true );
			
			//
			// Remove deleted properties.
			//
			study.setDocumentProperties( deleted, true );
			
			//
			// Replace study.
			//
			study.replaceDocument( true );
			
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
		
	},	// studyUpdate

};
