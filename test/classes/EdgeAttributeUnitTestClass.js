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
const param = require( '../parameters/EdgeAttribute' );

//
// Base class.
//
const TestClass = require( '../../classes/EdgeAttribute' );

/**
 * Module exports
 *
 * base:	Base class.
 * custom:	Derived base class with optional features.
 */
module.exports = {
	base   : TestClass,
	custom : null
};
