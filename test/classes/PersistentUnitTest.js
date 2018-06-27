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
	/****************************************************************************
	 * DEFAULT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define resolve tests
	 *
	 * We overload the parent method to add the modification time stamp in the local
	 * excluded fields for the following tests:
	 *
	 * 	- Resolve persistent document.
	 */
	unitsInitResolve()
	{
		//
		// Call parent method.
		//
		super.unitsInitResolve();
		
		//
		// Resolve persistent document.
		// Set modification time stamp in excluded local fields.
		//
		this.resolveUnitSet(
			'resolvePersistent',
			"Resolve persistent document",
			this.test_classes.base,
			[ Dict.descriptor.kMStamp ],
			false
		);
	
	}	// unitsInitResolve

}	// PersistentUnitTest.

/**
 * Module exports
 */
module.exports = PersistentUnitTest;
