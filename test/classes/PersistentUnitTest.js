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
	 * Define insert tests
	 *
	 * We overload the parent method to add the modification time stamp in the local
	 * excluded fields for the following tests:
	 *
	 * 	- Insert empty object.
	 * 	- Insert object without required fields.
	 * 	- Insert object without significant fields.
	 * 	- Insert object with content.
	 * 	- Insert object with same content.
	 */
	unitsInitInsert()
	{
		//
		// Call parent method.
		//
		super.unitsInitInsert();
		
		//
		// Insert empty object.
		// Set modification time stamp in excluded local fields.
		//
		this.insertUnitSet(
			'insertEmptyObject',
			"Insert empty object",
			this.test_classes.base,
			[ Dict.descriptor.kMStamp ],
			false
		);
		
		//
		// Insert object without required fields.
		// Set modification time stamp in excluded local fields.
		//
		this.insertUnitSet(
			'insertWithoutRequiredFields',
			"Insert object without required fields",
			this.test_classes.base,
			{
				contents: this.parameters.content,
				excluded: [ Dict.descriptor.kMStamp ]
			},
			false
		);
		
		//
		// Insert object without significant fields.
		// Set modification time stamp in excluded local fields.
		//
		this.insertUnitSet(
			'insertWithoutSignificantFields',
			"Insert object without significant fields",
			this.test_classes.base,
			{
				contents: this.parameters.content,
				excluded: [ Dict.descriptor.kMStamp ]
			},
			false
		);
		
		//
		// Insert object with content.
		// Assert that inserting a document having contents will succeed.
		//
		this.insertUnitSet(
			'insertWithContent',
			"Insert object with content",
			this.test_classes.base,
			{
				contents: this.parameters.content,
				excluded: [ Dict.descriptor.kMStamp ]
			},
			false
		);
		
		//
		// Insert object with same content.
		// Assert that if _key is not required, inserting an object with same contents
		// as an existing one will not fail, because the database will assign a
		// different key.
		//
		this.insertUnitSet(
			'insertWithSameContent',
			"Insert object with same content",
			this.test_classes.base,
			{
				contents: this.parameters.content,
				excluded: [ Dict.descriptor.kMStamp ]
			},
			false
		);
	
	}	// unitsInitInsert
	
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
