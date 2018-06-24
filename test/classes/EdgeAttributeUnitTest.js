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
const expect = require('chai').expect;

//
// Application.
//
const K = require( '../../utils/Constants' );
const Dict = require( '../../dictionary/Dict' );
const MyError = require( '../../utils/MyError' );

//
// Parent class.
//
const EdgeUnitTest = require( './EdgeUnitTest' );


/**
 * Document test class
 *
 * This class defines the classes used in tests and implements common test patterns.
 */
class EdgeAttributeUnitTest extends EdgeUnitTest
{
	// NOTHING YET.
	
}	// EdgeUnitTest.

/**
 * Module exports
 */
module.exports = EdgeAttributeUnitTest;
