'use strict';

//
// Unit test framework.
//
const should = require('chai').should();
const expect = require('chai').expect;

//
// Database framework.
//
const db = require('@arangodb').db;
const Dict = require( '../dictionary/Dict' );

//
// Test class.
//
const TestClass = require( '../classes/Term' );

//
// Parameters.
// We only use the request here.
//
const params = require( './parameters/Document' );

//
// Unit tests.
//
describe('Term class tests:', function ()
{
	//
	// Init local storage.
	//
	let doc;
	let func;
	let meta;
	let action;
	let message;
	const collection = 'test_Document';
	
	//
	// Truncate all test collections.
	//
	it('Clear collections', function ()
	{
		func = function() {
			db._collection( collection ).truncate();
		};
		expect( func, "Clearing test document collection" )
			.not.to.throw();
	});
	
	//
	// Insert namespaces.
	//
	it('Insert namespace', function ()
	{
		//
		// Set local identifier.
		//
		const data = {};
		
		//
		// Iterate with and without transaction.
		//
		for( const trans of [ false, true ] )
		{
			//
			// Set namespace local identifier.
			//
			data[ Dict.descriptor.kLID ] = ( trans ) ? 'NS_TRANS' : 'NS';
			
			//
			// Set action.
			//
			action = ( trans ) ? "with transaction" : "without transaction";
			
			//
			// Instantiate test object.
			//
			message = "Instantiate namespace";
			func = function() {
				doc =
					new TestClass(
						params.request,
						data,
						collection
					);
			}
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			//
			// Insert.
			//
			message = "Insert document";
			func = function () {
				meta = doc.insertDocument( true, trans );
			};
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			//
			// Ensure object has metadata.
			//
			message = "Document metadata properties";
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_id' );
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_key' );
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_rev' );
		}
	});
	
	//
	// Insert namespace identifiers.
	//
	it('Insert identifier', function ()
	{
		//
		// Set local identifier.
		//
		const data = {};
		
		//
		// Iterate with and without transaction.
		//
		for( const trans of [ false, true ] )
		{
			//
			// Set action, namespace and local identifier.
			//
			action = ( trans ) ? "with transaction" : "without transaction";
			data[ Dict.descriptor.kNID ] = ( trans ) ? 'NS_TRANS' : 'NS';
			data[ Dict.descriptor.kLID ] = ( trans ) ? 'ID_TRANS' : 'ID';
			
			//
			// Add collection reference to _id.
			//
			data[ Dict.descriptor.kNID ] = `${collection}/${data[ Dict.descriptor.kNID ]}`;
			
			//
			// Instantiate test object.
			//
			message = "Instantiate identifier";
			func = function() {
				doc =
					new TestClass(
						params.request,
						data,
						collection
					);
			}
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			//
			// Insert.
			//
			message = "Insert document";
			func = function () {
				meta = doc.insertDocument( true, trans );
			};
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			//
			// Ensure object has metadata.
			//
			message = "Document metadata properties";
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_id' );
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_key' );
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_rev' );
		}
	});
	
	//
	// Validate inserted namespaces.
	//
	it('Check namespace instances', function ()
	{
		//
		// Set list of namespace keys.
		//
		const keys = [ 'NS', 'NS_TRANS' ];
		
		//
		// Iterate namespace keys.
		//
		for( const key of keys )
		{
			//
			// Read document.
			//
			message = `Locate document ${key}`;
			func = function() {
				doc =
					new TestClass(
						params.request,
						key,
						collection
					);
			}
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			//
			// Ensure instances are there.
			//
			message = `Check ${key} instance`;
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( Dict.descriptor.kInstances );
			
			//
			// Ensure namespace has namespace instance.
			//
			message = `Check ${key} instance elements`;
			expect( doc.document[ Dict.descriptor.kInstances ], `${message} - ${action}` )
				.to.include( Dict.term.kInstanceNamespace );
		}
	});
	
	//
	// Validate inserted namespace identifiers.
	//
	it('Check document instances', function ()
	{
		//
		// Set list of namespace identifier keys.
		//
		const keys = [ 'NS:ID', 'NS_TRANS:ID_TRANS' ];
		
		//
		// Iterate namespace identifier keys.
		//
		for( const key of keys )
		{
			//
			// Read document.
			//
			message = `Locate document ${key}`;
			func = function() {
				doc =
					new TestClass(
						params.request,
						key,
						collection
					);
			}
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			//
			// Ensure instances are not there.
			//
			message = `Check ${key} instance`;
			expect( doc.document, `${message} - ${action}` )
				.not.to.have.property( Dict.descriptor.kInstances );
		}
	});
});
