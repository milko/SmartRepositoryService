'use strict';

/**
 * Test services
 *
 * This path is used to test the Descriptor class.
 */

//
// Import frameworks.
//
const dd = require('dedent');							// For multiline text.
const fs = require('fs');								// File system utilities.
const db = require('@arangodb').db;						// Database object.
const Joi = require('joi');								// Validation framework.
const aql = require('@arangodb').aql;					// AQL queries.
const time = require('@arangodb').time;					// Timer functions.
const crypto = require('@arangodb/crypto');				// Cryptographic functions.
const httpError = require('http-errors');				// HTTP errors.
const status = require('statuses');						// Don't know what it is.
const errors = require('@arangodb').errors;				// ArangoDB errors.
const createAuth = require('@arangodb/foxx/auth');		// Authentication framework.
const createRouter = require('@arangodb/foxx/router');	// Router class.
const jwtStorage = require('@arangodb/foxx/sessions/storages/jwt');

//
// Error constants.
//
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

//
// Instantiate objects.
//
const K = require( '../../utils/Constants' );
const MyError = require( '../../utils/MyError' );
const Descriptor = require( '../../classes/Descriptor' );

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;


//
// Set router tags.
//
router.tag( 'testDescriptor' );


/**
 * Test Descriptor.getTypeValidationRecord()
 *
 * The service will return the validation record(s) of the provided data type(s). The
 * data type(s) must be provided as a term _id, or _key reference.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getTypeValidationRecord
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getTypeValidationRecord',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Test method.
		//
		let param = null;
		const collection = db._collection( 'terms' );
		try
		{
			//
			// Resolve references.
			//
			if( (typeof request.body.term === 'string')
			 || (request.body.term instanceof String) )
				param = collection.document( request.body.term );
			else
				param = request.body.term;

			//
			// Make test.
			//
			const result = Descriptor.getTypeValidationRecord( request, param );

			response.send({
				what : result,
				time : time() - stamp
			});
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

			response.throw( http, error );										// !@! ==>
		}
	},
	'getTypeValidationRecord'
)
	.body(
		Joi.object({
			term : Joi.alternatives().try(
				Joi.string(),
				Joi.array().items(Joi.string()),
				Joi.object(),
				Joi.array().items(Joi.object())
			)
		}),
		'Object { term : value } where value is either a term reference or a term' +
		' object, or an array of the prior two.'
	)
	.response(
		200,
		Joi.object({
			what : Joi.any(),
			time : Joi.number()
		}),
		"The result: 'what' contains the method return value, 'time' contains the elapsed time."
	)
	.summary(
		"Get validation records for the provided data types."
	)
	.description(dd`
  Returns the result of Descriptor.getTypeValidationRecord()
  against the provided term reference in 'term'.
`);


/**
 * Test Descriptor.getDescriptorValidationRecord()
 *
 * The service will return the validation record(s) of the provided data type(s). The
 * data type(s) must be provided as a term _id, or _key reference.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getDescriptorValidationRecord
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getDescriptorValidationRecord',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Test method.
		//
		const collection = db._collection( 'descriptors' );
		try
		{
			//
			// Resolve references.
			//
			let param = null;
			try
			{
				param = collection.document( request.body.descriptor );
			}
			catch( error )
			{
				response.throw( 400, `Unable to reference descriptor [${request.body.descriptor}].` )
			}

			//
			// Make test.
			//
			const result = Descriptor.getDescriptorValidationRecord( request, param );

			response.send({
				what : result,
				time : time() - stamp
			});
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

			response.throw( http, error );										// !@! ==>
		}
	},
	'getDescriptorValidationRecord'
)
	.body(
		Joi.object({
			descriptor : Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
		}),
		'Object { descriptor : value } with descriptor reference(s) as _id or _key.'
	)
	.response(
		200,
		Joi.object({
			what : Joi.any(),
			time : Joi.number()
		}),
		"The result: 'what' contains the method return value, 'time' contains the elapsed time."
	)
	.summary(
		"Get validation records for the provided descriptor(s)."
	)
	.description(dd`
  Returns the result of Descriptor.getDescriptorValidationRecord()
  against the provided descriptor reference in 'descriptor'.
`);


/**
 * Test Descriptor.getValidationStructure()
 *
 * The service will return the validation structure(s) of the provided validation
 * record(s). The service expects a descriptor reference or an array of references.
 *
 * The service returns an object as { what : <result> } where result is the
 * value returned by the tested method.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/getValidationStructure
 * @verb		post
 * @response	{ what : <result> }.
 */
router.post
(
	'/getValidationStructure',
	(request, response) =>
	{
		//
		// Init timer.
		//
		const stamp = time();

		//
		// Test method.
		//
		const collection = db._collection( 'descriptors' );
		try
		{
			//
			// Resolve references.
			//
			let param = null;
			try
			{
				param = collection.document( request.body.descriptor );
			}
			catch( error )
			{
				response.throw( 400, `Unable to reference descriptor [${request.body.descriptor}].` )
			}

			//
			// Make test.
			//
			const record = Descriptor.getDescriptorValidationRecord( request, param );
			const result = Descriptor.getValidationStructure( request, record );

			response.send({
				what : result,
				time : time() - stamp
			});
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

			response.throw( http, error );										// !@! ==>
		}
	},
	'getValidationStructure'
)
	.body(
		Joi.object({
			descriptor : Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
		}),
		'Object { descriptor : value } with descriptor reference(s) as _id or _key.'
	)
	.response(
		200,
		Joi.object({
			what : Joi.any(),
			time : Joi.number()
		}),
		"The result: 'what' contains the method return value, 'time' contains the elapsed time."
	)
	.summary(
		"Get validation structures for the provided descriptor(s)."
	)
	.description(dd`
  Returns the result of Descriptor.getValidationStructure()
  against the provided descriptor reference in 'descriptor'.
`);


/**
 * Test all descriptor validation records
 *
 * The service will scan all descriptors and create the validation records returning
 * all validation record field names and their respective counts.
 *
 * This service should be used to check if validation record generation works for all
 * descriptors.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/testDescriptorValidationRecords
 * @verb		get
 * @response	{ what : <result> }.
 */
router.get
(
	'/testDescriptorValidationRecords',
	(request, response) =>
	{
		//
		// Init framework.
		//
		const Dict = require( '../../dictionary/Dict' );
		const collect = (theResult, theStruct) => {
			for( const item in theStruct )
			{
				if( theResult.hasOwnProperty( item ) )
					theResult[ item ]++;
				else
					theResult[ item ] = 1;
			}
		};
		const traverse = (theResult, theStruct) => {
			collect(theResult, theStruct);
			if( theStruct.hasOwnProperty(Dict.descriptor.kTypeKey) )
				collect(theResult, theStruct[ Dict.descriptor.kTypeKey ]);
			if( theStruct.hasOwnProperty(Dict.descriptor.kTypeValue) )
				collect(theResult, theStruct[ Dict.descriptor.kTypeValue ]);
			if( theStruct.hasOwnProperty('_child') )
				return theStruct._child;
			else
				return null;
		};

		//
		// Init timer.
		//
		const stamp = time();

		//
		// Get all descriptors.
		//
		const cursor = db._collection( 'descriptors' ).all();

		//
		// Init result.
		//
		const result = {};

		//
		// Iterate descriptors.
		//
		let temp = null;
		try
		{
			while( cursor.hasNext() )
			{
				//
				// Get validation record.
				//
				temp = Descriptor.getDescriptorValidationRecord( request, cursor.next() );

				//
				// Traverse record.
				//
				let current = temp;
				while( current !== null )
					current = traverse( result, current );
			}
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

			response.throw( http, error );										// !@! ==>
		}

		response.send({
			what : result,
			time : time() - stamp
		});
	},
	'testDescriptorValidationRecords'
)
	.response(
		200,
		Joi.object({
			what : Joi.any(),
			time : Joi.number()
		}),
		"The result: 'what' contains an object with as key the validation record field" +
		" and as key the occurrence count, 'time' contains the elapsed time."
	)
	.summary(
		"Test validation record generation for all descriptors."
	)
	.description(dd`
  Returns the list of all fields in the validation records for all descriptors.
`);
