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
 * Descriptor services
 *
 * These handlers use the 'descriptor' path, they implement services related to
 * descriptors.
 */

module.exports = {

	/**
	 * Update descriptor validation structure
	 *
	 * The service will update the validation structure of the descriptor(s) provided
	 * in the request body, the references can be provided as follows:
	 *
	 * 	- A string:				The string is expected to be a descriptor _id or _key.
	 * 	- An array of strings:	The array elements are expected to be a descriptor _id or _key.
	 * 	- An empty array:		All descriptors will be updated.
	 *
	 * The service returns an object { result : <value> } where the value represents
	 * the number of updated descriptors.
	 *
	 * If the method raises an exception, the service will forward it using the
	 * HTTP code if the exception is of class MyError.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 */
	updateValidation : ( theRequest, theResponse ) =>
	{
		try
		{
			//
			// Framework.
			//
			const Dict = require( '../dictionary/Dict' );

			//
			// Init local storage.
			//
			let count = 0;
			const collection = db._collection( 'descriptors' );

			//
			// Normalise parameter.
			//
			if( ! Array.isArray( theRequest.body.param ) )
				theRequest.body.param = [ theRequest.body.param ];

			//
			// Handle all descriptors.
			//
			if( theRequest.body.param.length === 0 )
			{
				//
				// Query descriptors.
				//
				theRequest.body.param =
					db._query( aql`
						FOR doc in ${collection}
						RETURN doc._key
					`).toArray();
			}

			//
			// Iterate descriptors.
			//
			for( const reference of theRequest.body.param )
			{
				//
				// Get descriptor.
				//
				const descriptor = collection.document( reference );

				//
				// Get record.
				//
				const record = Descriptor.getDescriptorValidationRecord( theRequest, descriptor );

				//
				// Get structure.
				//
				const structure = Descriptor.getValidationStructure( theRequest, record );

				//
				// Set validation structure.
				//
				const data = {};
				data[ Dict.descriptor.kValidation ] = structure;

				//
				// Update descriptor.
				//
				collection.update( descriptor, data );

				//
				// Update counter.
				//
				++count;
			}

			//
			// Return response.
			//
			theResponse.send({ result : count });
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

	}	// updateValidation
};
