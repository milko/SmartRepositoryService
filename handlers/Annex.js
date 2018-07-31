'use strict';

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );

//
// Classes.
//
const Form = require( '../classes/Form' );
const Study = require( '../classes/Study' );
const Annex = require( '../classes/Annex' );

//
// Middleware.
//
const UserMiddleware = require( '../middleware/user' );

/**
 * SMART annex services
 *
 * These handlers use the 'annex' path, they implement services related to
 * study SMART annex files.
 */

module.exports = {
	
	/**
	 * Return the SMART dataset annex registration form
	 *
	 * This service can be used to retrieve the annex registration form, the service
	 * expects two parameters in the POST body:
	 *
	 * 	- study:		The study reference provided as:
	 * 		- string:	The study _id or _key.
	 * 		- object:	The study significant fields.
	 * 	- data:			The eventual annex data record or an empty object.
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
	smartRegistrationForm : ( theRequest, theResponse ) =>
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
					theRequest.body.study
				);
			
			//
			// Resolve study.
			//
			if( ! study.persistent )
				study.resolveDocument( true, true );
			
			//
			// Set study reference and annex type.
			//
			theRequest.body.data[ Dict.descriptor.kNID ] = study.document._id;
			theRequest.body.data[ Dict.descriptor.kTypeAnnex ] = Dict.term.kTypeAnnexDataset;
			
			//
			// Resolve form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormSmart,					// Form _key.
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
		
	},	// smartRegistrationForm
	
	/**
	 * Register study SMART dataset annex
	 *
	 * The service will register a study SMART dataset, it expects the following object
	 * in the body:
	 *
	 * 	- data:	 the study SMART dataset registration form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can handle metadata.
	 * 	- Validate form data.
	 * 	- Insert the dataset.
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
	smartRegistration : ( theRequest, theResponse ) =>
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
			const form = new Form( theRequest, Dict.term.kFormSmart );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Instantiate study.
			//
			const dataset =
				new Annex(
					theRequest,
					theRequest.body.data
				);
			
			//
			// Insert study.
			//
			dataset.insertDocument( true );
			
			theResponse.send({ result : dataset.document });						// ==>
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
		
	},	// smartRegistration
	
	/**
	 * Return the study SMART dataset update form
	 *
	 * This service can be used to request the study SMART dataset registration form
	 * for updating purposes, it will return an object, { form : <form> }, where form
	 * is the dataset registration form.
	 *
	 * The service expects a parameter in the POST body, data, which is the dataset
	 * reference. It can either be a string, in which case it must be the dataset _id or
	 * _key, or an object containing the gid, or the nid and lid of the dataset.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can handle metadata.
	 * 	- Resolve the dataset.
	 * 	- Load the form structure.
	 * 	- Return the form to the client.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	smartUpdateForm : ( theRequest, theResponse ) =>
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
			// Instantiate dataset.
			//
			const dataset =
				new Annex(
					theRequest,
					theRequest.body.data
				);
			
			//
			// Resolve dataset.
			//
			if( ! dataset.persistent )
				dataset.resolveDocument( true, true );
			
			//
			// Resolve form.
			//
			const form =
				new Form(
					theRequest,								// Current request.
					Dict.term.kFormSmartUpdate,				// Form _key.
					dataset.document,						// Form data.
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
		
	},	// smartUpdateForm
	
	/**
	 * Update study SMART dataset annex
	 *
	 * The service will update the provided dataset, it expects the following object
	 * in the body:
	 *
	 * 	- data:	 the dataset update form contents.
	 *
	 * The service will perform the following steps:
	 *
	 * 	- Assert there is a current user in the session.
	 * 	- Assert the user can handle metadata.
	 * 	- Validate form data.
	 * 	- Replace the dataset.
	 * 	- Return the study record.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	smartUpdate : ( theRequest, theResponse ) =>
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
			const form = new Form( theRequest, Dict.term.kFormSmartUpdate );
			form.validate( theRequest, theRequest.body.data );
			
			//
			// Instantiate dataset.
			//
			const dataset =
				new Annex(
					theRequest,
					theRequest.body.data
				);
			
			//
			// Resolve dataset.
			//
			if( ! dataset.persistent )
				dataset.resolveDocument( false, true );
			
			//
			// Remove deleted properties.
			//
			dataset.setDocumentProperties( deleted, true );
			
			//
			// Replace dataset.
			//
			dataset.replaceDocument( true );
			
			theResponse.send({ result : dataset.document });							// ==>
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
		
	},	// smartUpdate
	
};
