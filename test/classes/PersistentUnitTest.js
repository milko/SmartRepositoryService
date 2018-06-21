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
	/****************************************************************************
	 * DEFAULT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define instantiation tests
	 *
	 * This method will load the instantiation tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate instantiating the object in different ways and
	 * environments, particularily, it will do the following checks:
	 *
	 * 	- Instantiate class without selector and without collection.
	 * 	- Instantiate with null selector and without collection.
	 * 	- Instantiate with null selector and non existant collection.
	 * 	- Instantiate with default collection.
	 * 	- Instantiate with existing edge collection.
	 * 	- Instantiate with existing document collection.
	 * 	- Instantiate mutable/immutable document.
	 * 	- Instantiate with cross-collection reference.
	 * 	- Instantiate with invalid _id reference.
	 * 	- Instantiate with not found _id reference.
	 * 	- Instantiate with found reference.
	 * 	- Instantiate with content.
	 */
	unitsInitInstantiation()
	{
		//
		// Instantiate class without selector and without collection.
		// Assert it fails.
		//
		this.instantiationUnitSet(
			'instantiateNoSelectorNoCollection',
			"Instantiate class without selector and without collection",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with null selector and without collection.
		// Assert it fails if class does not feature default collection.
		//
		this.instantiationUnitSet(
			'instantiateNullSelectorNoCollection',
			"Instantiate with null selector and without collection:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with null selector and non existant collection.
		// Assert it fails.
		//
		this.instantiationUnitSet(
			'instantiateNullSelectorMissingCollection',
			"Instantiate with null selector and non existant collection:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with default collection.
		// Assert that it succeeds.
		//
		this.instantiationUnitSet(
			'instantiateDefaultCollection',
			"Instantiate with default collection:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with existing edge collection.
		// Assert that it succeeds for edge collection classes.
		//
		this.instantiationUnitSet(
			'instantiateEdgeCollection',
			"Instantiate with existing edge collection:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with existing document collection.
		// Assert that it succeeds for document collection classes.
		//
		this.instantiationUnitSet(
			'instantiateDocumentCollection',
			"Instantiate with existing document collection:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate mutable/immutable document.
		// Assert that an immutable document is only returned when instantiating from a
		// reference, in all other cases a mutable document is returned.
		//
		this.instantiationUnitSet(
			'instantiateMutableImmutableDocument',
			"Instantiate mutable/immutable document:",
			TestClass,
			param.content,
			true
		);
		
		//
		// Instantiate with cross-collection reference.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateCrossCollectionReference',
			"Instantiate with cross-collection reference:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with invalid _id reference.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateInvalidReferenceId',
			"Instantiate with invalid _id reference:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with not found _id reference.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateNotFoundIdReference',
			"Instantiate with not found reference:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with found reference.
		// Assert that it succeeds.
		//
		this.instantiationUnitSet(
			'instantiateFoundReference',
			"Instantiate with found reference:",
			TestClass,
			null,
			true
		);
		
		//
		// Instantiate with content.
		// Assert that it succeeds.
		//
		this.instantiationUnitSet(
			'instantiateWithContent',
			"Instantiate with content:",
			TestClass,
			param.content,
			true
		);
		
	}	// unitsInitInstantiation
	
	/**
	 * Define contents tests
	 *
	 * This method will load the contents tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving udating the object
	 * contents, it will do the following checks:
	 *
	 * 	- Load contents in empty object.
	 * 	- Load filled non persistent object.
	 * 	- Load persistent object.
	 */
	unitsInitContent()
	{
		//
		// Load empty object.
		// Assert that all field types are copied, except for restricted fields.
		//
		this.contentsUnitSet(
			'contentsLoadEmptyObject',
			"Load contents in empty object",
			TestClass,
			param.content,
			true
		);
		
		//
		// Load filled and non persistent object.
		// Assert that modifying the contents of a filled non persistent object works as
		// follows:
		//	- Restricted fields are not copied.
		//	- Modifying locked fields will is allowed.
		//	- All other fields are copied.
		//
		this.contentsUnitSet(
			'contentsLoadFilledObject',
			"Load filled non persistent object:",
			TestClass,
			{ base: param.content, replace: param.replace },
			true
		);
		
		//
		// Load persistent object.
		// Assert that modifying the contents of a persistent object works as follows:
		//	- Restricted fields are not copied.
		//	- Modifying locked fields will raise an exception.
		//	- All other fields are copied.
		//
		this.contentsUnitSet(
			'contentsLoadPersistentObject',
			"Load persistent object:",
			TestClass,
			{ base: param.content, replace: param.replace },
			true
		);
		
	}	// unitsInitContent
	
	/**
	 * Define insert tests
	 *
	 * This method will load the insert tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving inserting the object,
	 * it will do the following checks:
	 *
	 * 	- Insert empty object.
	 * 	- Insert object without required fields.
	 * 	- Insert object without significant fields.
	 * 	- Insert object with content.
	 * 	- Insert duplicate object.
	 * 	- Insert object with same content.
	 * 	- Insert persistent object.
	 * 	- Insert without persist.
	 */
	unitsInitInsert()
	{
		//
		// Insert empty object.
		// Assert that inserting an empty object succeeds if it has no required fields.
		//
		this.insertUnitSet(
			'insertEmptyObject',
			"Insert empty object",
			TestClass,
			null,
			true
		);
		
		//
		// Insert object without required fields.
		// Assert that inserting an object without required fields fails.
		//
		this.insertUnitSet(
			'insertWithoutRequiredFields',
			"Insert object without required fields",
			TestClass,
			param.content,
			true
		);
		
		//
		// Insert object without significant fields.
		// Assert that inserting a document without significant fields succeeds.
		//
		this.insertUnitSet(
			'insertWithoutSignificantFields',
			"Insert object without significant fields",
			TestClass,
			param.content,
			true
		);
		
		//
		// Insert object with content.
		// Assert that inserting a document having contents will succeed.
		//
		this.insertUnitSet(
			'insertWithContent',
			"Insert object with content",
			TestClass,
			param.content,
			true
		);
		
		//
		// Insert duplicate object.
		// Assert that inserting a duplicate document will fail.
		//
		this.insertUnitSet(
			'insertDuplicate',
			"Insert duplicate object",
			TestClass,
			param.content,
			true
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
			TestClass,
			param.content,
			true
		);
		
		//
		// Insert persistent object.
		// Assert that inserting a persistent document fails.
		//
		this.insertUnitSet(
			'insertPersistentObject',
			"Insert persistent object",
			TestClass,
			null,
			true
		);
		
		//
		// Insert without persist.
		// Assert that inserting a document with the persist flag off, succeeds, if
		// all validations pass and that the document is not actually saved in the
		// collection.
		//
		this.insertUnitSet(
			'insertWithoutPersist',
			"Insert without persist",
			TestClass,
			param.replace,
			true
		);
		
	}	// unitsInitInsert
	
	/**
	 * Define resolve tests
	 *
	 * This method will load the resolve tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving resolving the object,
	 * it will do the following checks:
	 *
	 * 	- Resolve persistent document.
	 * 	- Resolve ambiguous document.
	 * 	- Resolve null reference.
	 * 	- Resolve significant fields.
	 * 	- Resolve reference fields.
	 * 	- Resolve without raising.
	 * 	- Resolve changed locked fields.
	 * 	- Resolve changed significant fields.
	 * 	- Resolve changed required fields.
	 * 	- Resolve changed unique fields.
	 * 	- Resolve changed local fields.
	 * 	- Resolve changed standard fields.
	 */
	unitsInitResolve()
	{
		//
		// Resolve persistent document.
		// Assert that resolving an existing unique document succeeds.
		//
		this.resolveUnitSet(
			'resolvePersistent',
			"Resolve persistent document",
			TestClass,
			null,
			true
		);
		
		//
		// Resolve ambiguous object.
		// Assert that resolving a document with more than one match will raise an
		// exception.
		//
		this.resolveUnitSet(
			'resolveAmbiguousObject',
			"Resolve ambiguous document",
			TestClass,
			{
				nid: 'terms/:id',
				lid: 'LID'
			},
			true
		);
		
		//
		// Resolve null reference.
		// Assert that resolving a document with no content will raise an exception.
		//
		this.resolveUnitSet(
			'resolveNullReference',
			"Resolve null reference",
			TestClass,
			null,
			true
		);
		
		//
		// Resolve significant fields.
		// This test will assert that if the document has significant fields, these
		// will be required when resolving; if the document has no significant fields,
		// the document will be resolved using all its current contents.
		//
		this.resolveUnitSet(
			'resolveSignificantField',
			"Resolve significant field",
			TestClass,
			{
				replace: param.replace,
				noSig: { name: 'NAME FILLED' },
				sigFind: {
					nid: 'terms/:id',
					lid: 'LID_FILLED'
				},
				sigOne: {
					lid: 'LID_FILLED'
				},
				sigAmbig: {
					nid: 'terms/:id',
					lid: 'LID'
				},
				sigNoFind: {
					nid: 'UNKNOWN',
					lid: 'LID'
				}
			},
			true
		);
		
		//
		// Resolve reference fields.
		// The test will assert that, when resolving a document, if the selector
		// contains a reference, this will take precedence over significant field
		// combunations.
		//
		this.resolveUnitSet(
			'resolveReferenceField',
			"Resolve reference fields",
			TestClass,
			{
				nid: 'BAD_NID',
				lid: 'BAD_LID'
			},
			true
		);
		
		//
		// Resolve without raising.
		// This test will assert that setting the doRaise flag to off prevents exceptions
		// from being raised only in case the document was not found.
		//
		this.resolveUnitSet(
			'resolveNoException',
			"Resolve without raising",
			TestClass,
			{
				correct: {
					nid: 'terms/:id',
					lid: 'LID_FILLED'
				},
				duplicate: {
					nid: 'terms/:id',
					lid: 'LID'
				},
				incorrect: {
					nid: 'UNKNOWN',
					lid: 'UNKNOWN'
				}
			},
			true
		);
		
		//
		// Resolve changed locked fields.
		// This test asserts that if a persistent object is resolved after a locked
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeLockedField',
			"Resolve changed locked fields",
			TestClass,
			null,
			true
		);
		
		//
		// Resolve changed significant fields.
		// This test asserts that if a persistent object is resolved after a significant
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeSignificantField',
			"Resolve changed significant fields",
			TestClass,
			null,
			true
		);
		
		//
		// Resolve changed required fields.
		// This test asserts that if a persistent object is resolved after a required
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeRequiredField',
			"Resolve changed required fields",
			TestClass,
			null,
			true
		);
		
		//
		// Resolve changed unique fields.
		// This test asserts that if a persistent object is resolved after a unique
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeUniqueField',
			"Resolve changed required fields",
			TestClass,
			null,
			true
		);
		
		//
		// Resolve changed local fields.
		// This test asserts that if a persistent object is resolved after a local
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeLocalField',
			"Resolve changed local fields",
			TestClass,
			null,
			true
		);
		
		//
		// Resolve changed standard fields.
		// This test asserts that if a persistent object is resolved after a standard
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeStandardField',
			"Resolve changed standard fields",
			TestClass,
			null,
			true
		);
		
	}	// unitsInitResolve
	
	/**
	 * Define replace tests
	 *
	 * This method will load the replace tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving resolving the object,
	 * it will do the following checks:
	 *
	 * 	- Replace non persistent document.
	 * 	- Replace non existing document.
	 * 	- Replace persistent values.
	 * 	- Replace content values.
	 */
	unitsInitReplace()
	{
		//
		// Replace non persistent document.
		// Assert that replacing a non persistent document fails.
		//
		this.replaceUnitSet(
			'replaceNonPersistent',
			"Replace non persistent document",
			TestClass,
			param.content,
			true
		);
		
		//
		// Replace non existing document.
		// Assert that replacing a non existing document fails.
		//
		this.replaceUnitSet(
			'replaceNonExisting',
			"Replace non existing document",
			TestClass,
			null,
			true
		);
		
		//
		// Replace persistent values.
		// Assert that replacing a document whose persistent locked field value is
		// different raises an exception, in all other cases assert it succeeds.
		//
		this.replaceUnitSet(
			'replacePersistentValue',
			"Replace persistent values",
			TestClass,
			null,
			true
		);
		
		//
		// Replace content values.
		// Assert that changing locked values and deleting required values in the
		// document content, not using the setDocumentProperties(), then replacing the
		// document will catch errors.
		//
		this.replaceUnitSet(
			'replaceContentValue',
			"Replace content values",
			TestClass,
			null,
			true
		);
		
	}	// unitsInitReplace
	
	/**
	 * Define remove tests
	 *
	 * This method will load the remove tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving removing the object,
	 * it will do the following checks:
	 *
	 * 	- Remove document.
	 * 	- Remove non persistent document.
	 * 	- Remove non existing document.
	 * 	- Remove constrained document.
	 */
	unitsInitRemove()
	{
		//
		// Remove document.
		// Assert that removing a document succeeds.
		//
		this.removeUnitSet(
			'removeDocument',
			"Remove document",
			TestClass,
			null,
			true
		);
		
		//
		// Remove non persistent document.
		// Assert that removing a non persistent document fails.
		//
		this.removeUnitSet(
			'removeNonPersistent',
			"Remove non persistent document",
			TestClass,
			param.content,
			true
		);
		
		//
		// Remove non existing document.
		// Assert that removing a non existing document fails.
		//
		this.removeUnitSet(
			'removeNonExisting',
			"Remove non existing document",
			TestClass,
			null,
			true
		);
		
		//
		// Remove constrained document.
		// Assert that removing a constrained document fails.
		//
		this.removeUnitSet(
			'removeConstrained',
			"Remove constrained document",
			TestClass,
			null,
			true
		);
		
	}	// unitsInitRemove
	
	/**
	 * Define custom tests
	 *
	 * This method will load the custom tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving custom object
	 * operations.
	 *
	 * By default there are no custom operations.
	 */
	unitsInitCustom()
	{
		//
		// No custom operations.
		//
		
	}	// unitsInitCustom
	
	/**
	 * Define static tests
	 *
	 * This method will load the static tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all static methods of the object,
	 * it will do the following checks:
	 *
	 * 	- Check edge collection.
	 */
	unitsInitStatic()
	{
		//
		// Check edge collection.
		// Assert that it fails on document collection and succeeds on edge collection.
		//
		this.staticUnitSet(
			'staticEdgeCollection',
			"Check edge collection",
			TestClass,
			{
				edge: param.collection_edge,
				document: param.collection_document,
				request: param.request
			},
			true
		);
		
		//
		// Check document collection.
		// Assert that it fails on edge collection and succeeds on document collection.
		//
		this.staticUnitSet(
			'staticDocumentCollection',
			"Check document collection",
			TestClass,
			{
				edge: param.collection_edge,
				document: param.collection_document,
				request: param.request
			},
			true
		);
		
	}	// unitsInitStatic
	
}	// PersistentUnitTest.

/**
 * Module exports
 */
module.exports = PersistentUnitTest;
