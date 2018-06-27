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
// Test classes.
//
const TestClass = require( './classes/PersistentUnitTestClass' ).base;
const TestClassCustom = require( './classes/PersistentUnitTestClass' ).custom;

//
// Unit test class.
//
const UnitTestClass = require( './classes/PersistentUnitTest' );

//
// Test parameters.
//
const param = require( './parameters/Persistent' );


/********************************************************************************
 * ENVIRONMENT INITIALISATION													*
 ********************************************************************************/

//
// Instantiate test class.
//
const unitTest =
	new UnitTestClass(
		param,
		{
			base: TestClass,
			custom: TestClassCustom
		}
	);


/********************************************************************************
 * UNIT TESTS																	*
 ********************************************************************************/

/**
 * Persistent class tests
 *
 * We test the Persistent class.
 */
describe( "Persistent class tests:", function ()
{
	//
	// Check base class.
	//
	it( "Test class", function () {
		expect( unitTest.getClassName( 'base' ), "Class" ).to.equal( 'Persistent' );
		expect( unitTest.currentClass, "Parameters" ).to.equal( 'Persistent' );
	});
	
	//
	// Prepare environment.
	//
	it( "Prepare environment", function ()
	{
		let name;
		let collection;
		
		//
		// Clear edges.
		//
		name = param.collection_edge;
		expect( function ()
		{
			collection = db._collection( name );
			if( ! collection )
			{
				db._createEdgeCollection( name, { waitForSync : true } );
				collection = db._collection( name );
			}
			else
				collection.truncate();
		}, "Clear Edges" ).not.to.throw();
		expect( collection.count(), "Edges count" ).to.equal( 0 );
		
		//
		// Clear documents.
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
	// Instantiation unit tests.
	//
	describe( "Instantiation:", function () {
		UnitTestClass.unitTestRun(unitTest, 'instantiation' );
	});
	
	//
	// Contents unit tests.
	//
	describe( "Contents:", function () {
		UnitTestClass.unitTestRun(unitTest, 'contents' );
	});
	
	//
	// Insert unit tests.
	//
	describe( "Insert:", function () {
		UnitTestClass.unitTestRun(unitTest, 'insert' );
	});
	
	//
	// Resolve unit tests.
	//
	describe( "Resolve:", function () {
		UnitTestClass.unitTestRun(unitTest, 'resolve' );
	});
	
	//
	// Replace unit tests.
	//
	describe( "Replace:", function () {
		UnitTestClass.unitTestRun(unitTest, 'replace' );
	});
	
	//
	// Remove unit tests.
	//
	describe( "Remove:", function () {
		UnitTestClass.unitTestRun(unitTest, 'remove' );
	});
	
	//
	// Custom unit tests.
	//
	describe( "Custom:", function () {
		UnitTestClass.unitTestRun(unitTest, 'custom' );
	});
	
	//
	// Static unit tests.
	//
	describe( "Static:", function () {
		UnitTestClass.unitTestRun(unitTest, 'static' );
	});
	
});
