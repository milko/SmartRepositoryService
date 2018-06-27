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
const TestClass = require( './classes/EdgeUnitTestClass' ).base;
const TestClassCustom = require( './classes/EdgeUnitTestClass' ).custom;
const TestClassOther = require( '../classes/EdgeAttribute' );

//
// Node class.
//
const NodeClass = require( '../classes/Persistent' );

//
// Unit test class.
//
const UnitTestClass = require( './classes/EdgeUnitTest' );

//
// Test parameters.
//
const param = require( './parameters/Edge' );


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
			custom: TestClassCustom,
			other: TestClassOther
		}
	);

//
// Clear collections.
//
if( ! db._collection( param.collection_edge  ) )
	db._createEdgeCollection( param.collection_edge, { waitForSync : true } );
else
	db._collection( param.collection_edge ).truncate();
if( ! db._collection( param.collection_document ) )
	db._createDocumentCollection( param.collection_document, { waitForSync : true } );
else
	db._collection( param.collection_document ).truncate();


/********************************************************************************
 * UNIT TESTS																	*
 ********************************************************************************/

/**
 * Edge class tests
 *
 * We test the Edge class.
 */
describe( "Edge class tests:", function ()
{
	//
	// Create test nodes.
	//
	it( "Create test nodes", function ()
	{
		let doc;
		let func;
		let result;
		
		//
		// Iterate nodes in parameters.
		//
		for( const node of param.nodes )
		{
			//
			// Instantiate node.
			//
			func = () => {
				doc =
					new NodeClass(
						param.request,
						node,
						param.collection_document
					);
			};
			expect( func, `Instantiate node` ).not.to.throw();
			
			//
			// Insert node.
			//
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, `Insert node` ).not.to.throw();
			expect( result, "Insert result" ).to.be.true;
		}
	});

	//
	// Check base class.
	//
	it( "Test class", function () {
		expect( unitTest.getClassName( 'base' ), "Class" ).to.equal( 'Edge' );
		expect( unitTest.currentClass, "Parameters" ).to.equal( 'Edge' );
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
