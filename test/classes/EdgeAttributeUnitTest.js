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
	/****************************************************************************
	 * DEFAULT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define resolve tests
	 *
	 * We overload this method to make the following changes:
	 *
	 * 	- Remove resolveAmbiguousObject().
	 * 	- Change resolveSignificantField() parameters.
	 * 	- Change resolveReferenceField() parameters.
	 * 	- Change resolveNoException() parameters.
	 * 	- Remove resolveChangeSignificantField().
	 */
	unitsInitResolve()
	{
		let tmp;
		let params;
		
		//
		// Call parent method.
		//
		super.unitsInitResolve();
		
		//
		// Set resolve significant fields.
		// We need to add the attributes to the significant fields.
		//
		// Properties 'replace' and 'sigFind' must be there.
		//
		tmp = this.resolveUnitGet( 'resolveSignificantField' );
		params = K.function.clone( tmp.parm );
		params.sigOne[ Dict.descriptor.kAttributes ] =
			[
				':class:descriptor:iaddr',
				':class:descriptor:any',
				':class:descriptor:txt'
			];
		params.sigFind[ Dict.descriptor.kAttributes ] =
			[
				':class:descriptor:iaddr',
				':class:descriptor:any',
				':class:descriptor:txt'
			];
		params.sigNoFind[ Dict.descriptor.kAttributes ] =
			[
				':class:descriptor:iaddr',
				':class:descriptor:any',
				':class:descriptor:txt'
			];
		
		this.resolveUnitSet(
			'resolveSignificantField',
			"Resolve significant field",
			this.test_classes.base,
			params,
			false
		);
		
		//
		// Resolve reference fields.
		// We need to add the attributes to the significant fields.
		//
		tmp = this.resolveUnitGet( 'resolveReferenceField' );
		params = K.function.clone( tmp.parm );
		params[ Dict.descriptor.kAttributes ] =
			[
				':class:descriptor:iaddr',
				':class:descriptor:any',
				':class:descriptor:txt'
			];

		this.resolveUnitSet(
			'resolveReferenceField',
			"Resolve reference fields",
			this.test_classes.base,
			params,
			false
		);
		
		//
		// Resolve without raising.
		// We need to add the attributes to the significant fields.
		//
		tmp = this.resolveUnitGet( 'resolveNoException' );
		params = K.function.clone( tmp.parm );
		params.correct[ Dict.descriptor.kAttributes ] =
			[
				':class:descriptor:iaddr',
				':class:descriptor:any',
				':class:descriptor:txt'
			];
		params.incorrect[ Dict.descriptor.kAttributes ] =
			[
				':class:descriptor:iaddr',
				':class:descriptor:any',
				':class:descriptor:txt'
			];
		
		this.resolveUnitSet(
			'resolveNoException',
			"Resolve without raising",
			this.test_classes.base,
			params,
			false
		);
		
	}	// unitsInitResolve
	
}	// EdgeAttributeUnitTest.

/**
 * Module exports
 */
module.exports = EdgeAttributeUnitTest;
