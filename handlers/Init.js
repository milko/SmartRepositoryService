'use strict';

//
// Framework.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const time = require('@arangodb').time;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );


/**
 * Init services
 *
 * These handlers use the 'init' path, they implement initialisation services.
 */

module.exports = {
	
	/**
	 * Init descriptors
	 *
	 * This service will iterate all existing descriptors and replace them all, its
	 * duty is to initialise the object local properties and validate them.
	 *
	 * The service will return the following structure:
	 *
	 * 	- result:		An object containing the following properties:
	 * 		- count:	Number of processed descriptors.
	 * 		- time:		Duration in seconds.
	 *
	 * The service will follow these steps:
	 *
	 * 	- Set the creation time stamp for all descriptors.
	 * 	- Set the validation record in all descriptors.
	 * 	- Iterate and replace all descriptors.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : true }.
	 */
	initDescriptors : ( theRequest, theResponse ) => {
		
		//
		// Framework.
		//
		const Descriptor = require( '../classes/Descriptor' );
		
		//
		// Init local storage.
		//
		let stamp;
		let count;
		let pages;
		let cursor;
		let buffer;
		let selector;
		const page = 600;
		const result = {};
		const update = {};
		const collection = db._collection( 'descriptors' );
		update[ Dict.descriptor.kCStamp ] = Date.now();
		
		//
		// Set creation time for all descriptors.
		//
		result.step1 =
			db._query( aql`
				FOR item IN ${collection}
				UPDATE item WITH ${update} IN ${collection}
			`);
		
		//
		// Set validation record in all descriptors.
		//
		count = 0;
		stamp = time();
		cursor = collection.all();
		while( cursor.hasNext() )
		{
			//
			// Get descriptor.
			//
			const descriptor = cursor.next();
			
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
			
		}	// Iterating all descriptors.
		
		//
		// Set result.
		//
		result.step2 = { count: count, time: time() - stamp };
		
		//
		// Iterate all descriptors.
		//
		count = 0;
		buffer = [];
		pages = page;
		selector = [];
		stamp = time();
		cursor = collection.all();
		while( cursor.hasNext() )
		{
			//
			// Save key.
			//
			const key = cursor.next()._key;
			selector.push({ _key: key });
			
			//
			// Instantiate descriptor.
			//
			const descriptor = new Descriptor( theRequest, key );
			
			//
			// Replace descriptor.
			// Without saving.
			//
			descriptor.replaceDocument( false );
			
			//
			// Add to buffer.
			//
			buffer.push( descriptor.document );
			
			//
			// Handle counters.
			//
			++count;
			--pages;
			
			//
			// Handle buffer.
			//
			if( pages <= 0 )
			{
				collection.replace( selector, buffer );
				buffer = [];
				pages = page;
				selector = [];
			}
			
		}	// Iterating all records.
		
		//
		// Flush.
		//
		if( buffer.length > 0 )
			collection.replace( selector, buffer );
		
		//
		// Set result.
		//
		result.step3 = { count: count, time: time() - stamp };
		
		theResponse.send({ result : result });										// ==>
		
	},	// initDescriptors
	
	/**
	 * Init shapes
	 *
	 * This service will iterate all existing shapes and replace them all, its
	 * duty is to initialise the object local properties and validate them.
	 *
	 * The service will return the following structure:
	 *
	 * 	- result:		An object containing the following properties:
	 * 		- count:	Number of processed descriptors.
	 * 		- time:		Duration in seconds.
	 *
	 * The service will follow these steps:
	 *
	 * 	- Set the creation time stamp for all shapes.
	 * 	- Iterate and replace all shapes.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : true }.
	 */
	initShapes : ( theRequest, theResponse ) => {
		
		//
		// Framework.
		//
		const Persistent = require( '../classes/Persistent' );
		
		//
		// Init local storage.
		//
		let stamp;
		let count;
		let pages;
		let cursor;
		let buffer;
		let selector;
		const page = 600;
		const result = {};
		const update = {};
		const collection = db._collection( 'shapes' );
		update[ Dict.descriptor.kCStamp ] = Date.now();
		
		//
		// Set creation time for all shapes.
		//
		result.step1 =
			db._query( aql`
				FOR item IN ${collection}
				UPDATE item WITH ${update} IN ${collection}
			`);
		
		//
		// Iterate all shapes.
		//
		count = 0;
		buffer = [];
		pages = page;
		selector = [];
		stamp = time();
		cursor = collection.all();
		while( cursor.hasNext() )
		{
			//
			// Save key.
			//
			const id = cursor.next()._id;
			selector.push({ _id: id });
			
			//
			// Instantiate descriptor.
			//
			const shape = new Persistent( theRequest, id );
			
			//
			// Replace shape.
			// Without saving.
			//
			shape.replaceDocument( false );
			
			//
			// Add to buffer.
			//
			buffer.push( shape.document );
			
			//
			// Handle counters.
			//
			++count;
			--pages;
			
			//
			// Handle buffer.
			//
			if( pages <= 0 )
			{
				collection.replace( selector, buffer );
				buffer = [];
				pages = page;
				selector = [];
			}
			
		}	// Iterating all records.
		
		//
		// Flush.
		//
		if( buffer.length > 0 )
			collection.replace( selector, buffer );
		
		//
		// Set result.
		//
		result.step3 = { count: count, time: time() - stamp };
		
		theResponse.send({ result : result });										// ==>
		
	},	// initShapes
	
	/**
	 * Init toponyms
	 *
	 * This service will iterate all existing toponyms and replace them all, its
	 * duty is to initialise the object local properties and validate them.
	 *
	 * The service will return the following structure:
	 *
	 * 	- result:		An object containing the following properties:
	 * 		- count:	Number of processed descriptors.
	 * 		- time:		Duration in seconds.
	 *
	 * The service will follow these steps:
	 *
	 * 	- Set the creation time stamp for all toponyms.
	 * 	- Iterate and replace all toponyms.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : true }.
	 */
	initToponyms : ( theRequest, theResponse ) => {
		
		//
		// Framework.
		//
		const Persistent = require( '../classes/Persistent' );
		
		//
		// Init local storage.
		//
		let stamp;
		let count;
		let pages;
		let cursor;
		let buffer;
		let selector;
		const page = 600;
		const result = {};
		const update = {};
		const collection = db._collection( 'toponyms' );
		update[ Dict.descriptor.kCStamp ] = Date.now();
		
		//
		// Set creation time for all shapes.
		//
		result.step1 =
			db._query( aql`
				FOR item IN ${collection}
				UPDATE item WITH ${update} IN ${collection}
			`);
		
		//
		// Iterate all shapes.
		//
		count = 0;
		buffer = [];
		pages = page;
		selector = [];
		stamp = time();
		cursor = collection.all();
		while( cursor.hasNext() )
		{
			//
			// Save key.
			//
			const id = cursor.next()._id;
			selector.push({ _id: id });
			
			//
			// Instantiate descriptor.
			//
			const toponym = new Persistent( theRequest, id );
			
			//
			// Replace shape.
			// Without saving.
			//
			toponym.replaceDocument( false );
			
			//
			// Add to buffer.
			//
			buffer.push( toponym.document );
			
			//
			// Handle counters.
			//
			++count;
			--pages;
			
			//
			// Handle buffer.
			//
			if( pages <= 0 )
			{
				collection.replace( selector, buffer );
				buffer = [];
				pages = page;
				selector = [];
			}
			
		}	// Iterating all records.
		
		//
		// Flush.
		//
		if( buffer.length > 0 )
			collection.replace( selector, buffer );
		
		//
		// Set result.
		//
		result.step3 = { count: count, time: time() - stamp };
		
		theResponse.send({ result : result });										// ==>
		
	},	// initToponyms
	
	/**
	 * Init terms
	 *
	 * This service will iterate all existing terms and replace them all, its
	 * duty is to initialise the object local properties and validate them.
	 *
	 * The service will return the following structure:
	 *
	 * 	- result:		An object containing the following properties:
	 * 		- count:	Number of processed descriptors.
	 * 		- time:		Duration in seconds.
	 *
	 * The service will follow these steps:
	 *
	 * 	- Set the creation time stamp for all terms.
	 * 	- Iterate and replace all terms.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : true }.
	 */
	initTerms : ( theRequest, theResponse ) => {
		
		//
		// Framework.
		//
		const Term = require( '../classes/Term' );
		
		//
		// Init local storage.
		//
		let stamp;
		let count;
		let pages;
		let cursor;
		let buffer;
		let selector;
		const page = 600;
		const result = {};
		const update = {};
		const collection = db._collection( 'terms' );
		update[ Dict.descriptor.kCStamp ] = Date.now();
		
		//
		// Set creation time for all records.
		//
		result.step1 =
			db._query( aql`
				FOR item IN ${collection}
				UPDATE item WITH ${update} IN ${collection}
			`);
		
		//
		// Iterate all records.
		//
		count = 0;
		buffer = [];
		pages = page;
		selector = [];
		stamp = time();
		cursor = collection.all();
		while( cursor.hasNext() )
		{
			//
			// Save key.
			//
			const id = cursor.next()._id;
			selector.push({ _id: id });
			
			//
			// Instantiate descriptor.
			//
			const term = new Term( theRequest, id );
			
			//
			// Replace shape.
			// Without saving.
			//
			term.replaceDocument( false );
			
			//
			// Add to buffer.
			//
			buffer.push( term.document );
			
			//
			// Handle counters.
			//
			++count;
			--pages;
			
			//
			// Handle buffer.
			//
			if( pages <= 0 )
			{
				collection.replace( selector, buffer );
				buffer = [];
				pages = page;
				selector = [];
			}
			
		}	// Iterating all records.
		
		//
		// Flush.
		//
		if( buffer.length > 0 )
			collection.replace( selector, buffer );
		
		//
		// Set result.
		//
		result.step3 = { count: count, time: time() - stamp };
		
		theResponse.send({ result : result });										// ==>
		
	},	// initTerms
	
	/**
	 * Init edges
	 *
	 * This service will iterate all existing edges and replace them all, its
	 * duty is to initialise the object local properties and validate them.
	 *
	 * The service will return the following structure:
	 *
	 * 	- result:		An object containing the following properties:
	 * 		- count:	Number of processed descriptors.
	 * 		- time:		Duration in seconds.
	 *
	 * The service will follow these steps:
	 *
	 * 	- Set the creation time stamp for all edges.
	 * 	- Iterate and replace all edges.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : true }.
	 */
	initEdges : ( theRequest, theResponse ) => {
		
		//
		// Framework.
		//
		const Edge = require( '../classes/Edge' );
		const EdgeBranch = require( '../classes/EdgeBranch' );
		const EdgeAttribute = require( '../classes/EdgeAttribute' );
		
		//
		// Init local storage.
		//
		let stamp;
		let count;
		let pages;
		let cursor;
		let buffer;
		let selector;
		const page = 600;
		const result = {};
		const update = {};
		const collection = db._collection( 'edges' );
		update[ Dict.descriptor.kCStamp ] = Date.now();
		
		//
		// Set creation time for all records.
		//
		result.step1 =
			db._query( aql`
				FOR item IN ${collection}
				UPDATE item WITH ${update} IN ${collection}
			`);
		
		//
		// Iterate all records.
		//
		count = 0;
		buffer = [];
		pages = page;
		selector = [];
		stamp = time();
		cursor = collection.all();
		while( cursor.hasNext() )
		{
			//
			// Init local storage.
			//
			let object;
			
			//
			// Save document.
			//
			const document = cursor.next();
			
			//
			// Instantiate edge.
			//
			if( document.hasOwnProperty( Dict.descriptor.kBranches ) )
				object = new EdgeBranch( theRequest, document._id );
			else if( document.hasOwnProperty( Dict.descriptor.kAttributes ) )
				object = new EdgeAttribute( theRequest, document._id );
			else
				object = new Edge( theRequest, document._id );
			
			//
			// Replace shape.
			// Without saving.
			//
			object.replaceDocument( false );
			
			//
			// Add to buffer.
			//
			buffer.push( object.document );
			
			//
			// Handle counters.
			//
			++count;
			--pages;
			
			//
			// Handle buffer.
			//
			if( pages <= 0 )
			{
				collection.replace( selector, buffer );
				buffer = [];
				pages = page;
				selector = [];
			}
			
		}	// Iterating all records.
		
		//
		// Flush.
		//
		if( buffer.length > 0 )
			collection.replace( selector, buffer );
		
		//
		// Set result.
		//
		result.step3 = { count: count, time: time() - stamp };
		
		theResponse.send({ result : result });										// ==>
		
	},	// initEdges
	
	/**
	 * Init schemas
	 *
	 * This service will iterate all existing schemas and replace them all, its
	 * duty is to initialise the object local properties and validate them.
	 *
	 * The service will return the following structure:
	 *
	 * 	- result:		An object containing the following properties:
	 * 		- count:	Number of processed descriptors.
	 * 		- time:		Duration in seconds.
	 *
	 * The service will follow these steps:
	 *
	 * 	- Set the creation time stamp for all schemas.
	 * 	- Iterate and replace all schemas.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theResponse	{Object}	The current response.
	 * @returns {Object}				The object { result : true }.
	 */
	initSchemas : ( theRequest, theResponse ) => {
		
		//
		// Framework.
		//
		const Edge = require( '../classes/Edge' );
		const EdgeBranch = require( '../classes/EdgeBranch' );
		const EdgeAttribute = require( '../classes/EdgeAttribute' );
		
		//
		// Init local storage.
		//
		let stamp;
		let count;
		let pages;
		let cursor;
		let buffer;
		let selector;
		const page = 600;
		const result = {};
		const update = {};
		const collection = db._collection( 'schemas' );
		update[ Dict.descriptor.kCStamp ] = Date.now();
		
		//
		// Set creation time for all records.
		//
		result.step1 =
			db._query( aql`
				FOR item IN ${collection}
				UPDATE item WITH ${update} IN ${collection}
			`);
		
		//
		// Iterate all records.
		//
		count = 0;
		buffer = [];
		pages = page;
		selector = [];
		stamp = time();
		cursor = collection.all();
		while( cursor.hasNext() )
		{
			//
			// Init local storage.
			//
			let object;
			
			//
			// Save document.
			//
			const document = cursor.next();
			
			//
			// Instantiate edge.
			//
			if( document.hasOwnProperty( Dict.descriptor.kBranches ) )
				object = new EdgeBranch( theRequest, document._id );
			else if( document.hasOwnProperty( Dict.descriptor.kAttributes ) )
				object = new EdgeAttribute( theRequest, document._id );
			else
				object = new Edge( theRequest, document._id );
			
			//
			// Replace shape.
			// Without saving.
			//
			object.replaceDocument( false );
			
			//
			// Add to buffer.
			//
			buffer.push( object.document );
			
			//
			// Handle counters.
			//
			++count;
			--pages;
			
			//
			// Handle buffer.
			//
			if( pages <= 0 )
			{
				collection.replace( selector, buffer );
				buffer = [];
				pages = page;
				selector = [];
			}
			
		}	// Iterating all records.
		
		//
		// Flush.
		//
		if( buffer.length > 0 )
			collection.replace( selector, buffer );
		
		//
		// Set result.
		//
		result.step3 = { count: count, time: time() - stamp };
		
		theResponse.send({ result : result });										// ==>
		
	}	// initSchemas

};
