'use strict';

//
// Global.
// describe, it
//

//
// Application.
//
const Dict = require( '../../dictionary/Dict' );

//
// Test parameters.
//
const param = require( '../parameters/EdgeBranch' );

//
// parent class.
//
const ParentClass = require( '../../classes/Edge' );

//
// Base class.
//
const TestClass = require( '../../classes/EdgeBranch' );

/**
 * Module exports
 *
 * base:	Base class.
 * custom:	Derived base class with optional features.
 */
module.exports = {
	base   : TestClass,
	custom : TestClass
};
