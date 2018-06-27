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
// Application.
//
const Dict = require( '../../dictionary/Dict' );

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
	// Like parent.

}	// PersistentUnitTest.

/**
 * Module exports
 */
module.exports = PersistentUnitTest;
