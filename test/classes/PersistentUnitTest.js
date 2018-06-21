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
// Tests.
//
const should = require('chai').should();
const expect = require('chai').expect;

//
// Application.
//
const K = require( '../../utils/Constants' );
const Dict = require( '../../dictionary/Dict' );
const MyError = require( '../../utils/MyError' );

//
// Test parameters.
//
const param = require( '../parameters/Persistent' );

//
// Test classes.
//
const TestClass = require( './PersistentUnitTestClass' ).base;
const TestClassCustom = require( './PersistentUnitTestClass' ).custom;

//
// Parent class.
//
const DocumentUnitTest = require( './DocumentUnitTest' );


/**
 * Document test class
 *
 * This class defines the classes used in tests and implements common test patterns.
 */
class PersistentUnitTest extends DocumentUnitTest
{
	// NOTHING YET.
	
}	// PersistentUnitTest.

/**
 * Module exports
 */
module.exports = PersistentUnitTest;
