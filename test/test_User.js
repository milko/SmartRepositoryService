'use strict';

//
// Global.
// describe, it
//

//
// Frameworks.
//
const db = require('@arangodb').db;

//
// Global tests.
//
const expect = require('chai').expect;

//
// Application and constants.
//
const K = require( '../utils/Constants' );
const MyError = require( '../utils/MyError' );

//
// Test classes.
//
const User = require( '../classes/User' );
class TestClass extends User
{
	get defaultCollection()	{	return 'test_User';		}
}

//
// Test parameters.
//
const param = require( './parameters/User' );



/********************************************************************************
 * UNIT TESTS																	*
 ********************************************************************************/

/**
 * User class tests
 *
 * We test the Document class.
 */
describe( "User class tests:", function ()
{
	//
	// Check base class.
	//
	it( "Test class", function () {
		expect( K.function.className(TestClass), "Class" ).to.equal( 'User' );
		expect( param.class, "Parameters" ).to.equal( 'User' )
	});
	
	//
	// Prepare environment.
	//
	it( "Prepare environment", function ()
	{
		let name;
		let collection;
		
		//
		// Clear users.
		//
		name = param.collection_document;
		expect( function ()
		{
			collection = db._collection( name );
			if( ! collection )
			{
				db._createDocumentCollection( name, { waitForSync : true } );
				collection = db._collection( name );
			}
			else
				collection.truncate();
		}, "Clear Documents" ).not.to.throw();
		expect( collection.count(), "Documents count" ).to.equal( 0 );
	});
	
	//
	// Test transaction.
	//
	describe( "Test user:", function ()
	{
		//
		// Empty transaction.
		//
		it( "Insert user without manager", function ()
		{
			//
			//
		
		});
		
	});
	
});
