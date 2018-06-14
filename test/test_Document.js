'use strict';

//
// Global.
// describe, it
//

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;

//
// Tests.
//
const should = require('chai').should();
const expect = require('chai').expect;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Test classes.
//
const TestClass = require( './classDocument' ).class_base;
const TestClassCustom = require( './classDocument' ).class_custom;
const ClassTest = require( './classDocument' ).class_test;

//
// Test parameters.
//
const param = require( './paramDocument' );

//
// Instantiate test class.
//
const myTest = new ClassTest(
	param.request,
	'descriptors/name',
	'toponyms',
	param.collection_edge,
	param.collection_document,
	'toponyms'
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


/**
 * Document class tests
 *
 * We test the Document class.
 */
describe( "Document class tests:", function ()
{
	//
	// Instantiation unit tests.
	//
	describe( "Instantiation:", function () {
		for( const test of myTest.instantiationUnit ) {
			it( test.name, function () {
				myTest[ test.unit ];
			});
		}
	});

});
