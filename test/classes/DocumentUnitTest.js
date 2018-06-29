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
const UnitTest = require( './UnitTest' );


/**
 * Document test class
 *
 * This class defines the classes used in tests and implements common test patterns.
 */
class DocumentUnitTest extends UnitTest
{
	/****************************************************************************
	 * GROUP TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define unit tests
	 *
	 * We overload this method to load the Document unit test groups.
	 *
	 * Be aware that if the tests do not run, it may be because you are setting twice
	 * the same unit test: replace tests only in derived classes.
	 */
	unitsInit()
	{
		//
		// Call parent method.
		//
		super.unitsInit();
		
		//
		// Instantiation tests.
		//
		this.unitsInitInstantiation();
		
		//
		// Contents tests.
		//
		this.unitsInitContent();
		
		//
		// Insert tests.
		//
		this.unitsInitInsert();
		
		//
		// Resolve tests.
		//
		this.unitsInitResolve();
		
		//
		// Replace tests.
		//
		this.unitsInitReplace();
		
		//
		// Remove tests.
		//
		this.unitsInitRemove();
		
		//
		// Custom tests.
		//
		this.unitsInitCustom();
		
		//
		// Static tests.
		//
		this.unitsInitStatic();
		
	}	// unitsInit
	
	
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
			this.test_classes.base,
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
			this.test_classes.base,
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
			this.test_classes.base,
			'test',
			true
		);
		
		//
		// Instantiate with default collection.
		// Assert that it succeeds.
		//
		this.instantiationUnitSet(
			'instantiateDefaultCollection',
			"Instantiate with default collection:",
			this.test_classes.base,
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
			this.test_classes.base,
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
			this.test_classes.base,
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
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Instantiate with cross-collection reference.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateCrossCollectionReference',
			"Instantiate with cross-collection reference:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate with reserved contents.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateReservedContent',
			"Instantiate with reserved contents:",
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Instantiate with invalid _id reference.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateInvalidReferenceId',
			"Instantiate with invalid _id reference:",
			this.test_classes.base,
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
			this.test_classes.base,
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
			this.test_classes.base,
			this.parameters.sample,
			true
		);
		
		//
		// Instantiate with content.
		// Assert that it succeeds.
		//
		this.instantiationUnitSet(
			'instantiateWithContent',
			"Instantiate with content:",
			this.test_classes.base,
			this.parameters.content,
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
			this.test_classes.base,
			this.parameters.content,
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
			this.test_classes.base,
			{ base: this.parameters.content, replace: this.parameters.replace },
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
			this.test_classes.base,
			{ base: this.parameters.content, replace: this.parameters.replace },
			true
		);
		
		//
		// Check value matching.
		// Assert that matchPropertyValue works.
		//
		this.contentsUnitSet(
			'contentsMatchPropertyValue',
			"Match property values:",
			this.test_classes.base,
			null,
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
			this.test_classes.base,
			this.parameters.insertEmptyObject,
			true
		);
		
		//
		// Insert object without required fields.
		// Assert that inserting an object without required fields fails.
		//
		this.insertUnitSet(
			'insertWithoutRequiredFields',
			"Insert object without required fields",
			this.test_classes.base,
			this.parameters.insertWithoutRequired,
			true
		);
		
		//
		// Insert object without significant fields.
		// Assert that inserting a document without significant fields succeeds.
		//
		this.insertUnitSet(
			'insertWithoutSignificantFields',
			"Insert object without significant fields",
			this.test_classes.base,
			this.parameters.insertWithoutSignificant,
			true
		);
		
		//
		// Insert object with content.
		// Assert that inserting a document having contents will succeed.
		//
		this.insertUnitSet(
			'insertWithContent',
			"Insert object with content",
			this.test_classes.base,
			this.parameters.insertWithContent,
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
			this.test_classes.base,
			this.parameters.insertWithSameContent,
			true
		);
		
		//
		// Insert duplicate object.
		// Assert that inserting a duplicate document will fail.
		//
		this.insertUnitSet(
			'insertDuplicate',
			"Insert duplicate object",
			this.test_classes.base,
			this.parameters.content,
			true
		);

		//
		// Insert persistent object.
		// Assert that inserting a persistent document fails.
		//
		this.insertUnitSet(
			'insertPersistentObject',
			"Insert persistent object",
			this.test_classes.base,
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
			this.test_classes.base,
			this.parameters.insertWithoutPersist,
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
		let tmp;
		
		//
		// Resolve persistent document.
		// Assert that resolving an existing unique document succeeds.
		//
		this.resolveUnitSet(
			'resolvePersistent',
			"Resolve persistent document",
			this.test_classes.base,
			this.parameters.resolvePersistent,
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
			this.test_classes.base,
			this.parameters.resolveAmbiguous,
			true
		);
		
		//
		// Resolve null reference.
		// Assert that resolving a document with no content will raise an exception.
		//
		this.resolveUnitSet(
			'resolveNullReference',
			"Resolve null reference",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Resolve significant fields.
		// This test will assert that if the document has significant fields, these
		// will be required when resolving; if the document has no significant fields,
		// the document will be resolved using all its current contents.
		//
		// The provided elements are as follows:
		//	- noSig:		Has all significant fields missing.
		//	- sigOne:		Has one significant field missing.
		//	- sigFind:		Has all significant fields.
		//	- sigAmbig:		Should result in an ambiguous document.
		//	- sigNoFind:	Should not match any document.
		//
		// Properties 'replace' and 'sigFind' must be there.
		//
		this.resolveUnitSet(
			'resolveSignificantField',
			"Resolve significant field",
			this.test_classes.base,
			this.parameters.resolveSignificant,
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
			this.test_classes.base,
			this.parameters.resolveReference,
			true
		);
		
		//
		// Resolve without raising.
		// This test will assert that setting the doRaise flag to off prevents exceptions
		// from being raised only in case the document was not found.
		//
		// The provided elements are as follows:
		//	- correct:		Should succeed.
		//	- duplicate:	Should result in an duplicate resolve.
		//	- incorrect:	SHould result in a not found resolve.
		//
		// Property 'correct' and 'incorrect' must be there.
		//
		this.resolveUnitSet(
			'resolveNoException',
			"Resolve without raising",
			this.test_classes.base,
			this.parameters.resolveNoException,
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
			this.test_classes.base,
			this.parameters.changeLocked,
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
			this.test_classes.base,
			this.parameters.changeSignificant,
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
			this.test_classes.base,
			this.parameters.changeRequired,
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
			"Resolve changed unique fields",
			this.test_classes.base,
			this.parameters.changeUnique,
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
			this.test_classes.base,
			this.parameters.changeLocal,
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
			this.test_classes.base,
			this.parameters.changeStandard,
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
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Replace non existing document.
		// Assert that replacing a non existing document fails.
		//
		this.replaceUnitSet(
			'replaceNonExisting',
			"Replace non existing document",
			this.test_classes.base,
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
			this.test_classes.base,
			this.parameters.replacePersistentValue,
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
			this.test_classes.base,
			this.parameters.replaceContentValue,
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
			this.test_classes.base,
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
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Remove non existing document.
		// Assert that removing a non existing document fails.
		//
		this.removeUnitSet(
			'removeNonExisting',
			"Remove non existing document",
			this.test_classes.base,
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
			this.test_classes.base,
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
			this.test_classes.base,
			{
				edge: this.parameters.collection_edge,
				document: this.parameters.collection_document,
				request: this.request
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
			this.test_classes.base,
			{
				edge: this.parameters.collection_edge,
				document: this.parameters.collection_document,
				request: this.request
			},
			true
		);
		
	}	// unitsInitStatic
	
	
	/****************************************************************************
	 * INSTANTIATION TEST MODULES DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Instantiate class without selector and without collection
	 *
	 * Assert instantiating the class without the reference and collection.
	 *
	 * Should fail with base class and succeed with custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateNoSelectorNoCollection( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		this.testInstantiateNoSelectorNoCollection(
			this.test_classes.base, theParam );
		
		//
		// Should succeed, because the custom class implements default collection.
		//
		if( this.test_classes.custom )
			this.testInstantiateNoSelectorNoCollection(
				this.test_classes.custom, theParam );
		
	}	// instantiateNoSelectorNoCollection
	
	/**
	 * Instantiate with null selector and without collection.
	 *
	 * Assert instantiating the class with null reference and no collection.
	 *
	 * Should fail with base class and succeed with custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateNullSelectorNoCollection( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		this.testInstantiateNullSelectorNoCollection(
			this.test_classes.base, theParam );
		
		//
		// Should succeed with custom class: it implements the default collection.
		//
		if( this.test_classes.custom )
			this.testInstantiateNullSelectorNoCollection(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateNullSelectorNoCollection
	
	/**
	 * Instantiate with null selector and non existant collection.
	 *
	 * Assert that instantiating the class with null reference and a non existing
	 * collection parameters raises an exception.
	 *
	 * Should fail with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateNullSelectorMissingCollection( theClass, theParam = null )
	{
		//
		// Remove test collection.
		//
		const collection = db._collection( theParam );
		if( collection )
			db._drop( test_collection );
		
		//
		// Should fail.
		//
		this.testInstantiateNullSelectorMissingCollection(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateNullSelectorMissingCollection(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateNullSelectorMissingCollection
	
	/**
	 * Instantiate with default collection.
	 *
	 * In this class we test both the base class, that should raise an exception, and
	 * the custom class that should not: we use routines to perform these tests.
	 *
	 * In derived classes that do not declare a custom class you must overload this
	 * method.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateDefaultCollection( theClass, theParam = null )
	{
		//
		// Test class without default collection.
		//
		this.testDefaultCollection(
			this.test_classes.base, theParam );
		
		//
		// Test class with default collection.
		//
		if( this.test_classes.custom )
			this.testDefaultCollection(
				this.test_classes.custom, theParam );
		
	}	// instantiateDefaultCollection
	
	/**
	 * Instantiate with existing edge collection.
	 *
	 * For the base class it will succeed, for custom class it will raise an
	 * exception, because it implements a default document collection.
	 *
	 * In derived classes you should overload this method if the class expects
	 * collections of a specific type.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateEdgeCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateEdgeSucceed(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateEdgeFail(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateEdgeCollection
	
	/**
	 * Instantiate with existing document collection.
	 *
	 * The base class accepts both types, the custom class implements a document
	 * default collection, so both classes should succeed.
	 *
	 * In derived classes you should overload this method if the class expects
	 * collections of a specific type.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateDocumentCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateDocumentSucceed(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInstantiateDocumentSucceed(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateDocumentCollection
	
	/**
	 * Instantiate mutable/immutable document.
	 *
	 * Assert that the document data is immutable only when instantiated from an
	 * existing reference.
	 *
	 * This method expects both parameters to be provided.
	 *
	 * Should succeed for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateMutableImmutableDocument( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateMutableImmutable(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInstantiateMutableImmutable(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateMutableImmutableDocument
	
	/**
	 * Instantiate with cross-collection reference.
	 *
	 * Assert that it fails if the provided reference is not of the same collection as
	 * the provided one, or the default collection.
	 *
	 * Should fail for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateCrossCollectionReference( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testInstantiateCrossCollectionReference(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateCrossCollectionReference(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateCrossCollectionReference
	
	/**
	 * Instantiate with reserved content.
	 *
	 * Assert that instantiating a document with contents having reserved fields fails.
	 *
	 * Should fail for classes featuring reserved contents.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateReservedContent( theClass, theParam = null )
	{
		//
		// Should suceed.
		//
		this.testInstantiateReservedContent(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateReservedContent(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateReservedContent
	
	/**
	 * Instantiate with invalid _id reference.
	 *
	 * Assert that the provided _id reference is valid.
	 *
	 * Should fail for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateInvalidReferenceId( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testInstantiateInvalidId(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateInvalidId(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateInvalidReferenceId
	
	/**
	 * Instantiate with not found _id reference.
	 *
	 * Assert that it fails if the provided reference is not found in the collection.
	 *
	 * Should fail for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateNotFoundIdReference( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testInstantiateNotFoundIdReference(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateNotFoundIdReference(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateCrossCollectionReference
	
	/**
	 * Instantiate with found reference.
	 *
	 * Assert that it succeeds if the reference is found in the right collection.
	 *
	 * Should succeed for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateFoundReference( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateFoundReference(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateFoundReference(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateFoundReference
	
	/**
	 * Instantiate with content.
	 *
	 * Assert that it succeeds and double check collection constraints.
	 *
	 * Should succeed for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateWithContent( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateWithContent(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateWithContent(
				this.test_classes.custom, theParam
			);
	
	}	// instantiateWithContent
	
	
	/****************************************************************************
	 * CONTENTS TEST MODULES DEFINITIONS										*
	 ****************************************************************************/
	
	/**
	 * Load contents in empty object
	 *
	 * Will test loading contents in empty object with both replace flag values in
	 * both base and custom classes.
	 *
	 * Should succeed with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	contentsLoadEmptyObject( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testContentsLoadEmptyObject(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testContentsLoadEmptyObject(
				this.test_classes.custom, theParam );
		
	}	// contentsLoadEmptyObject
	
	/**
	 * Load filled and non persistent object
	 *
	 * Will test replacing contents of non persistent object with both replace flag
	 * values in both base and custom classes.
	 *
	 * Should succeed with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	contentsLoadFilledObject( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testContentsLoadFilledObject(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testContentsLoadFilledObject(
				this.test_classes.custom, theParam );
		
	}	// contentsLoadFilledObject
	
	/**
	 * Load persistent object
	 *
	 * Will test replacing contents of a persistent object with both replace flag
	 * values in both base and custom classes.
	 *
	 * Should succeed with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	contentsLoadPersistentObject( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testContentsLoadPersistentObject(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testContentsLoadPersistentObject(
				this.test_classes.custom, theParam );
		
	}	// contentsLoadPersistentObject
	
	/**
	 * Match property values
	 *
	 * Will test matching property values works.
	 *
	 * Should succeed with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	contentsMatchPropertyValue( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testContentsMatchPropertyValue(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testContentsMatchPropertyValue(
				this.test_classes.custom, theParam );
		
	}	// contentsMatchPropertyValue
	
	
	/****************************************************************************
	 * INSERT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Insert empty object
	 *
	 * Assert inserting an empty object.
	 *
	 * Should succeed with base class and fail with custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertEmptyObject( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testInsertEmptyObject(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testInsertEmptyObject(
				this.test_classes.custom, theParam );
		
	}	// insertEmptyObject
	
	/**
	 * Insert object without required field
	 *
	 * Assert inserting a document without required field.
	 *
	 * Should succeed with base class and fail with custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithoutRequiredFields( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		this.testInsertWithoutRequiredFields(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testInsertWithoutRequiredFields(
				this.test_classes.custom, theParam );
		
	}	// insertWithoutRequiredFields
	
	/**
	 * Insert object without significant field
	 *
	 * Assert inserting a document without significant field.
	 *
	 * Should succeed with both base and custom classes.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithoutSignificantFields( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		this.testInsertWithoutSignificantFields(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testInsertWithoutSignificantFields(
				this.test_classes.custom, theParam );
		
	}	// insertWithoutSignificantFields
	
	/**
	 * Insert object with content
	 *
	 * Assert inserting a document with content.
	 *
	 * Should succeed with both base and custom classes.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithContent( theClass, theParam = null )
	{
		//
		// Assert cleanup.
		//
		let message = "Cleanup";
		db._collection( this.defaultTestCollection ).truncate();
		expect( db._collection( this.defaultTestCollection ).count(), message )
			.to.equal( 0 );
		
		//
		// Should raise: Missing required parameter.
		//
		this.testInsertWithContent(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testInsertWithContent(
				this.test_classes.custom, theParam );
		
		//
		// Assert cleanup.
		//
		message = "Cleanup";
		expect( db._collection( this.defaultTestCollection ).count(), message )
			.to.equal( 2 );
		
	}	// insertWithContent
	
	/**
	 * Insert duplicate object
	 *
	 * Assert inserting a duplicate object fails.
	 *
	 * Should fail in all cases, note that we use the _key to make it fail, we don't
	 * have other unique keys.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertDuplicate( theClass, theParam = null )
	{
		//
		// Should raise: duplicate document in collection.
		//
		this.testInsertDuplicate(
			this.test_classes.base, theParam );
		
		//
		// Should raise: duplicate document in collection.
		//
		if( this.test_classes.custom )
			this.testInsertDuplicate(
				this.test_classes.custom, theParam );
		
	}	// insertDuplicate
	
	/**
	 * Insert object with same content
	 *
	 * Assert inserting a document with same content.
	 *
	 * Should succeed with objects in which the _key is database-set and fail in
	 * objects where the _key is computed from its contents.
	 *
	 * In this class and in the custom class it should succeed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithSameContent( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInsertWithSameContentSucceed(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInsertWithSameContentSucceed(
				this.test_classes.custom, theParam );
		
		//
		// Assert cleanup.
		//
		let message = "Cleanup";
		expect( db._collection( this.defaultTestCollection ).count(), message )
			.to.equal( 4 );
		
	}	// insertWithSameContent
	
	/**
	 * Insert persistent object
	 *
	 * Assert inserting a persistent object fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertPersistentObject( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInsertPersistentObject(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInsertPersistentObject(
				this.test_classes.custom, theParam );
		
		//
		// Assert cleanup.
		//
		let message = "Cleanup";
		expect( db._collection( this.defaultTestCollection ).count(), message )
			.to.equal( 4 );
		
	}	// insertPersistentObject
	
	/**
	 * Insert without persist
	 *
	 * Assert inserting without persisting succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithoutPersist( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInsertWithoutPersist(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInsertWithoutPersist(
				this.test_classes.custom, theParam );
		
	}	// insertWithoutPersist
	
	
	/****************************************************************************
	 * RESOLVE TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Resolve persistent document
	 *
	 * Assert resolving persistent document.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolvePersistent( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolvePersistent(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolvePersistent(
				this.test_classes.custom, theParam );
		
	}	// resolvePersistent
	
	/**
	 * Resolve ambiguous object
	 *
	 * Assert that resolving multiple documents raises an exception.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveAmbiguousObject( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testResolveAmbiguous(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testResolveAmbiguous(
				this.test_classes.custom, theParam );
		
	}	// resolveAmbiguousObject
	
	/**
	 * Resolve null reference
	 *
	 * Assert resolving null reference fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveNullReference( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveNullReference(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveNullReference(
				this.test_classes.custom, theParam );
		
	}	// resolveNullReference
	
	/**
	 * Resolve selector without significant field
	 *
	 * Assert resolving without significant field fails on document sthat feature
	 * significant fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveSignificantField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveSignificantField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveSignificantField(
				this.test_classes.custom, theParam );
		
	}	// resolveSignificantField
	
	/**
	 * Resolve reference fields
	 *
	 * Assert the correct choice when resolving from reference and significant fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveReferenceField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveReferenceField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveReferenceField(
				this.test_classes.custom, theParam );
		
	}	// resolveReferenceField
	
	/**
	 * Resolve without raising
	 *
	 * Assert that setting the doRaise flag to off doesn't raise exceptions.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveNoException( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveNoException(
			this.test_classes.base, theParam );
		
		//
		// Should not raise.
		//
		if( this.test_classes.custom )
			this.testResolveNoException(
				this.test_classes.custom, theParam );
		
	}	// resolveNoException
	
	/**
	 * Resolve changed locked fields
	 *
	 * Assert the correct behaviour when a locked field is updated in the background and a
	 * persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeLockedField( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testResolveChangeLockedField(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testResolveChangeLockedField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeLockedField
	
	/**
	 * Resolve changed significant fields
	 *
	 * Assert the correct behaviour when a significant field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeSignificantField( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testResolveChangeSignificantField(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testResolveChangeSignificantField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeSignificantField
	
	/**
	 * Resolve changed required fields
	 *
	 * Assert the correct behaviour when a required field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeRequiredField( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testResolveChangeRequiredField(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testResolveChangeRequiredField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeRequiredField
	
	/**
	 * Resolve changed unique fields
	 *
	 * Assert the correct behaviour when a unique field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeUniqueField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveChangeUniqueField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveChangeUniqueField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeUniqueField
	
	/**
	 * Resolve changed local fields
	 *
	 * Assert the correct behaviour when a local field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeLocalField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveChangeLocalField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveChangeLocalField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeLocalField
	
	/**
	 * Resolve changed standard fields
	 *
	 * Assert the correct behaviour when a standard field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeStandardField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveChangeStandardField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveChangeStandardField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeStandardField
	
	
	/****************************************************************************
	 * REPLACE TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Replace non persistent document
	 *
	 * Assert replacing non persistent document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	replaceNonPersistent( theClass, theParam = null )
	{
		//
		// Should raise.
		//
		this.testReplaceNonPersistent(
			this.test_classes.base, theParam );
		
		//
		// Should raise.
		//
		if( this.test_classes.custom )
			this.testReplaceNonPersistent(
				this.test_classes.custom, theParam );
		
	}	// replaceNonPersistent
	
	/**
	 * Replace non existing document
	 *
	 * Assert replacing non existing document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	replaceNonExisting( theClass, theParam = null )
	{
		//
		// Should raise.
		//
		this.testReplaceNonExisting(
			this.test_classes.base, theParam );
		
		//
		// Should raise.
		//
		if( this.test_classes.custom )
			this.testReplaceNonExisting(
				this.test_classes.custom, theParam );
		
	}	// replaceNonExisting
	
	/**
	 * Replace persistent values
	 *
	 * Assert replacing persistent locked values fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	replacePersistentValue( theClass, theParam = null )
	{
		//
		// Should raise for locked and not for others.
		//
		this.testReplacePersistentValue(
			this.test_classes.base, theParam );
		
		//
		// Should raise for locked and not for others.
		//
		if( this.test_classes.custom )
			this.testReplacePersistentValue(
				this.test_classes.custom, theParam );
		
	}	// replacePersistentValue
	
	/**
	 * Replace content values
	 *
	 * Assert replacing and deleting values without using the setDocumentProperties()
	 * method will catch errors when replacing the document.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	replaceContentValue( theClass, theParam = null )
	{
		//
		// Should raise changing locked and deleting required.
		//
		this.testReplaceContentValue(
			this.test_classes.base, theParam );
		
		//
		// Should raise changing locked and deleting required.
		//
		if( this.test_classes.custom )
			this.testReplaceContentValue(
				this.test_classes.custom, theParam );
		
	}	// replacePersistentValue
	
	
	/****************************************************************************
	 * REMOVE TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Remove document
	 *
	 * Assert removing a document succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	removeDocument( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testRemoveDocument(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testRemoveDocument(
				this.test_classes.custom, theParam );
		
	}	// removeDocument
	
	/**
	 * Remove non persistent document
	 *
	 * Assert removing non persistent document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	removeNonPersistent( theClass, theParam = null )
	{
		//
		// Should raise.
		//
		this.testRemoveNonPersistent(
			this.test_classes.base, theParam );
		
		//
		// Should raise.
		//
		if( this.test_classes.custom )
			this.testRemoveNonPersistent(
				this.test_classes.custom, theParam );
		
	}	// removeNonPersistent
	
	/**
	 * Remove non existing document
	 *
	 * Assert removing non existing document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	removeNonExisting( theClass, theParam = null )
	{
		//
		// Should raise.
		//
		this.testRemoveNonExisting(
			this.test_classes.base, theParam );
		
		//
		// Should raise.
		//
		if( this.test_classes.custom )
			this.testRemoveNonExisting(
				this.test_classes.custom, theParam );
		
	}	// removeNonExisting
	
	/**
	 * Remove constrained document
	 *
	 * Assert removing a constrained document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	removeConstrained( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testRemoveConstrained(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testRemoveConstrained(
				this.test_classes.custom, theParam );
		
	}	// removeConstrained
	
	
	/****************************************************************************
	 * STATIC TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Check edge collection
	 *
	 * Assert that it fails on document collection and succeeds on edge collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	staticEdgeCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testStaticEdgeCollection(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testStaticEdgeCollection(
				this.test_classes.custom, theParam );
		
	}	// staticEdgeCollection
	
	/**
	 * Check document collection
	 *
	 * Assert that it fails on edge collection and succeeds on document collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	staticDocumentCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testStaticDocumentCollection(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testStaticDocumentCollection(
				this.test_classes.custom, theParam );
		
	}	// staticDocumentCollection
	
	
	/****************************************************************************
	 * INSTANTIATION TEST ROUTINE DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Test instantiate class without selector and without collection
	 *
	 * Assert that instantiating the class without the reference and collection
	 * parameters raises an exception if class has no default collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNoSelectorNoCollection( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		
		//
		// Instantiate class.
		// ToDo:
		// Need to do it in order to ger default collection:
		// should make this static.
		//
		doc =
			new theClass(
				this.parameters.request,
				null,
				this.defaultTestCollection
			);
		
		//
		// Get default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Instantiate function.
		//
		const func = () => {
			doc =
				new theClass(
					this.parameters.request
				);
		};
		
		//
		// Should raise: Missing required parameter.
		//
		if( default_collection === null )
			expect( func
			).to.throw(
				MyError,
				/Missing required parameter/
			);
		
		//
		// Should not raise an exception.
		//
		else
			expect( func ).not.to.throw();
		
	}	// testInstantiateNoSelectorNoCollection
	
	/**
	 * Test instantiate with null selector and without collection.
	 *
	 * Assert that instantiating the class with null reference and no collection
	 * raises an exception if class has no default collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNullSelectorNoCollection( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		
		//
		// Instantiate class.
		// ToDo:
		// Need to do it in order to ger default collection:
		// should make this static.
		//
		doc =
			new theClass(
				this.parameters.request,
				null,
				this.defaultTestCollection
			);
		
		//
		// Get default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Instantiate function.
		//
		const func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null
				);
		};
		
		//
		// Should raise: Missing required parameter.
		//
		if( default_collection === null )
			expect( func
			).to.throw(
				MyError,
				/Missing required parameter/
			);
		
		//
		// Should not raise an exception.
		//
		else
			expect( func ).not.to.throw();
		
	}	// testInstantiateNullSelectorNoCollection
	
	/**
	 * Test with null selector and non existant collection.
	 *
	 * Assert that instantiating the class with null reference and a non existing
	 * collection parameters raises an exception in all cases.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNullSelectorMissingCollection( theClass, theParam = null )
	{
		//
		// Should raise: unknown or invalid collection name.
		//
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					theParam
				);
		}).to.throw(
			MyError,
			/unknown or invalid collection name/
		);
		
	}	// testInstantiateNullSelectorMissingCollection
	
	/**
	 * Test instantiation with missing default collection
	 *
	 * Perform tests for default collection with class that does not have default
	 * collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testDefaultCollection( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Instantiate class.
		// ToDo:
		// Need to do it in order to ger default collection:
		// should make this static.
		//
		doc =
			new theClass(
				this.parameters.request,
				null,
				this.defaultTestCollection
			);
		
		//
		// Get default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Instantiate without reference and collection.
		// Should fail if no default collection.
		//
		message = "Missing selector and missing collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request
				);
		};
		if( default_collection === null )
		{
			//
			// Should raise: Missing required parameter.
			//
			action = "Instantiation without default collection";
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/Missing required parameter/
			);
		}
		else
		{
			//
			// Should succeed.
			//
			action = "Instantiation with default collection";
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Collection name";
			expect( doc.collection, `${message} - ${action}` )
				.to.equal( doc.defaultCollection );
		}
		
		//
		// Instantiate with null selector and provided collection.
		// Collection should be the provided one.
		// Should succeed.
		//
		message = "Null selector and provided collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.other_collection
				);
		};
		
		//
		// Set action.
		//
		action = ( default_collection === null )
			   ? "Instantiation without default collection"
			   : "Instantiation with default collection";

		//
		// Should succeed regardless of default collection.
		//
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Collection name";
		
		//
		// Collection should match provided one.
		//
		expect( doc.collection, `${message} - ${action}` )
			.to.equal( this.parameters.other_collection );
		
		//
		// Instantiate with existing reference and missing collection.
		// Collection should be resolved from the reference.
		// Should succeed if no default collection, or if default collection is the
		// same as the reference collection.
		//
		message = "Existing reference and missing collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id
				);
		};
		
		//
		// Set action.
		//
		action = ( default_collection === null )
				 ? "Instantiation without default collection"
				 : "Instantiation with default collection";
		
		//
		// Handle no default collection.
		//
		if( default_collection === null )
		{
			//
			// Should succeed with any collection.
			//
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Collection name";
			expect( doc.collection, `${message} - ${action}` )
				.to.equal( this.parameters.example_id.split('/')[ 0 ] );
		}
		else
		{
			//
			// Should succeed only with reference in default collection.
			//
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/Invalid document reference: cross-collection reference/
			);
		}
		
	}	// testDefaultCollection
	
	/**
	 * Test unsuccessful instantiation with existing edge collection
	 *
	 * Assert instantiating with edge collection fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateEdgeFail( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.collection_edge
				);
		}).to.throw(
			MyError,
			/Invalid collection/
		);
		
	}	// testInstantiateEdgeFail
	
	/**
	 * Test successful instantiation with existing edge collection
	 *
	 * Assert instantiating with edge collection succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateEdgeSucceed( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.collection_edge
				);
		}).not.to.throw();
		
	}	// testInstantiateEdgeSucceed
	
	/**
	 * Test unsuccessful instantiation with existing document collection
	 *
	 * Assert instantiating with document collection fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateDocumentFail( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.collection_document
				);
		}).to.throw(
			MyError,
			/Invalid collection/
		);
		
	}	// testInstantiateDocumentFail
	
	/**
	 * Test successful instantiation with existing document collection
	 *
	 * Assert instantiating with document collection succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateDocumentSucceed( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.collection_document
				);
		}).not.to.throw();
		
	}	// testInstantiateDocumentSucceed
	
	/**
	 * Instantiate mutable/immutable document.
	 *
	 * Assert that the document data is immutable only when instantiated from an
	 * existing reference.
	 *
	 * You should always provide both parameters.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateMutableImmutable( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Check provided parameter.
		//
		expect( theParam, "Parameter not null").not.to.be.null;
		expect( theParam, "Parameter not an object").to.be.an.object;
		expect( theParam, `${message} - ${action}` ).not.to.be.empty;
		
		//
		// Empty mutable document.
		//
		message = "Empty mutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Empty immutable document.
		//
		message = "Empty immutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const no_reserved = K.function.clone( theParam );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
				delete no_reserved[ field ];
		}
		
		//
		// Filled mutable document.
		//
		message = "Filled mutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Filled immutable document.
		//
		message = "Filled immutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Referenced mutable document.
		//
		message = "Referenced mutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Referenced immutable document.
		//
		message = "Referenced immutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be immutable";
		expect( doc.document, `${message} - ${action}` ).to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
	}	// testInstantiateMutableImmutable
	
	/**
	 * Instantiate with cross-collection reference.
	 *
	 * Assert that the provided _id reference belongs to the same declared or implicit
	 * collection.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateCrossCollectionReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Fail with default collection.
		//
		if( default_collection !== null )
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						this.parameters.example_id
					);
			}).to.throw(
				MyError,
				/cross-collection reference/
			);
		
		//
		// Fail with provided collection.
		//
		else
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						this.parameters.example_id,
						this.defaultTestCollection
					);
			}).to.throw(
				MyError,
				/cross-collection reference/
			);
		
	}	// testInstantiateCrossCollectionReference
	
	/**
	 * Instantiate with reserved content.
	 *
	 * Assert that instantiating with reserved contents raises an exception.
	 *
	 * Should always fail if document features reserved content.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateReservedContent( theClass, theParam = null )
	{
		let doc;
		let func;
		let action;
		let message;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Handle reserved content.
		//
		const reserved_fields = doc.reservedFields;
		if( reserved_fields.length )
		{
			//
			// Strip reserved fields from parameter
			// and save their values.
			//
			const reserved_values = {};
			const no_reserved = K.function.clone( theParam );
			for( const field of reserved_fields )
			{
				if( no_reserved.hasOwnProperty( field ) )
				{
					reserved_values[ field ] = no_reserved[ field ];
					delete no_reserved[ field ];
				}
			}
			
			//
			// Iterate reserved fields.
			//
			for( const field in reserved_values )
			{
				const param = K.function.clone( no_reserved );
				param[ field ] = reserved_values[ field ];
				message = "Instantiate with reserved field";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							param,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} [${field}]`
				).to.throw(
					MyError,
					/Property is reserved/
				);
			}
		}
		
		//
		// Handle without reserved contents.
		//
		else
		{
			//
			// Instantiate document with full contents.
			//
			message = "Instantiate with full contents";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam,
						this.defaultTestCollection
					);
			};
			action = "Document has no reserved fields";
			expect( func, `${message} - ${action}` ).not.to.throw();
		}
		
	}	// nstantiatereservedContent
	
	/**
	 * Instantiate with invalid _id reference.
	 *
	 * Assert that the provided _id reference is invalid.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateInvalidId( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Fail with default collection.
		//
		if( default_collection !== null )
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`XXXXXXXX`
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		
		//
		// Fail with provided collection.
		//
		else
		{
			//
			// Expect an _id reference.
			//
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`XXXXXXXX`
					);
			}).to.throw(
				MyError,
				/invalid object reference handle/
			);
			
			//
			// Expect a _key reference.
			//
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`XXXXXXXX`,
						this.defaultTestCollection
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		}
		
	}	// testInstantiateInvalidId
	
	/**
	 * Instantiate with not found _id reference.
	 *
	 * Assert that the test raises an error of the not found type.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateNotFoundIdReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Fail with default collection.
		//
		if( default_collection !== null )
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`${this.defaultTestCollection}/XXXXXXXX`
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		
		//
		// Fail with provided collection.
		//
		else
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`${this.defaultTestCollection}/XXXXXXXX`,
						this.defaultTestCollection
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		
	}	// testInstantiateNotFoundIdReference
	
	/**
	 * Instantiate with found reference and default collection.
	 *
	 * Assert that the test raises an error only if the provided reference
	 * doesn't match the default collection.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateFoundReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let meta;
		let result;
		let action;
		let message;
		let collection;
		
		//
		// Check parameter.
		//
		message = "Check parameter";
		expect( theParam, message ).to.be.an.object;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Test instantiation with reference collection different than default collection.
		// Should fail: the provided _id is of a different collection than the default
		// collection.
		//
		message = "Reference collection different than default collection";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						this.parameters.example_id
					);
			};
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						this.parameters.example_id,
						this.defaultTestCollection
					);
			};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/cross-collection reference/
		);
		
		//
		// Test instantiation with reference collection different than provided collection.
		// Should fail: the provided _id is of a different collection than the provided
		// collection.
		//
		message = "Reference collection different than provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.other_collection
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/cross-collection reference/
		);
		
		//
		// Test instantiation with inferred collection same as provided collection.
		// Should succeed.
		//
		message = "Reference collection same as provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.parameters.example_collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Collect reserved fields.
		//
		const no_reserved = {};
		const reserved_values = {};
		for( const field in theParam )
		{
			if( doc.reservedFields.includes( field ) )
				reserved_values[ field ] = theParam[ field ];
			else
				no_reserved[ field ] = theParam[ field ];
		}
		
		//
		// Instantiate sample document.
		//
		message = "Reference sample document";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved
					);
			};
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved,
						this.defaultTestCollection
					);
			};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Prepare document for insert.
		//
		action = "Prepare for insert";
		func = () => {
			result = doc.insertDocument( false );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		//
		// Insert sample document.
		//
		action = "Insert in collection";
		collection = doc.collection;
		func = () => {
			meta =
				db._collection( collection )
					.insert( doc.document );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Test instantiation with reference inferred collection same as default
		// collection.
		// Should succeed.
		//
		message = "Reference by _id with inferred collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					meta._id
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Test instantiation with reference collection inferred and same as provided
		// collection.
		// Should succeed.
		//
		message = "Reference by _id with provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					meta._id,
					collection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Test instantiation with key reference and default collection.
		// Should succeed.
		//
		message = "Reference by _key";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						meta._key
					);
			};
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						meta._key,
						collection
					);
			};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Remove test document.
		//
		db._remove(meta._id);
		
	}	// testInstantiateFoundReference
	
	/**
	 * Instantiate with content and default collection.
	 *
	 * Assert that the test succeeds both with and without collection.
	 *
	 * Should always succeed.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateWithContent( theClass, theParam = null )
	{
		let doc;
		let func;
		let action;
		let invalid;
		let message;
		
		//
		// Check provided parameter.
		//
		expect( theParam, "Parameter not null").not.to.be.null;
		expect( theParam, "Parameter not an object").to.be.an.object;
		expect( theParam, `${message} - ${action}` ).not.to.be.empty;
		
		//
		// Instantiate example object to get default collection.
		//
		message = "Instantiate example document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		const default_collection = doc.defaultCollection;
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( theParam );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Handle default collection.
		//
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved
					);
			};
		
		//
		// Handle provided collection.
		//
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved,
						this.defaultTestCollection
					);
			};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		if( default_collection !== null )
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		else
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, no_reserved );
		
		//
		// Instantiate with default collection and invalid property.
		// Should not fail, it will be caught before persisting.
		//
		invalid = K.function.clone( no_reserved );
		invalid[ "UNKNOWN" ] = "Should not be there";
		message = "Instantiation with default collection and invalid property";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						invalid
					);
			};
		
		//
		// Handle provided collection.
		//
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						invalid,
						this.defaultTestCollection
					);
			};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		if( default_collection !== null )
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		else
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, invalid );
		
		//
		// Instantiate with provided collection.
		//
		message = "Instantiation with provided collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, no_reserved );
		
		//
		// Instantiate with provided collection and invalid property.
		// Should not fail, it will be caught before persisting.
		//
		message = "Instantiation with default collection and invalid property";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					invalid,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, invalid );
		
	}	// testInstantiateWithContent
	
	
	/****************************************************************************
	 * CONTENTS TEST ROUTINE DEFINITIONS										*
	 ****************************************************************************/
	
	/**
	 * Succeed loading contents in empty object
	 *
	 * Assert that loading contents in an empty object works for all fields except
	 * restricted fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testContentsLoadEmptyObject( theClass, theParam = null )
	{
		let doc;
		let data;
		let func;
		let action;
		let message;
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Handle reserved content.
		//
		let has_reserved = false;
		const reserved_values = {};
		const reserved_fields = doc.reservedFields;
		const no_reserved = K.function.clone( theParam );
		for( const field in no_reserved )
		{
			if( reserved_fields.includes( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
				has_reserved = true;
			}
		}
		
		//
		// Iterate replace flag values.
		//
		for( const flag of [ false, true ] )
		{
			//
			// Instantiate for false replace flag test.
			//
			message = `Replace flag is ${flag}`;
			action = "Instantiation";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						null,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object empty state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Load data.
			//
			action = "Set document properties filled";
			func = () => {
				doc.setDocumentProperties(
					no_reserved,
					flag
				);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check content.
			//
			this.assertAllProvidedDataInDocument( "Check contents", doc, no_reserved );
			
			//
			// Handle reserved fields.
			//
			if( has_reserved )
			{
				//
				// Instantiate for reserved test.
				//
				action = "Instantiation for reserved test";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							null,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Load data.
				//
				action = "Set document properties reserved";
				func = () => {
					doc.setDocumentProperties(
						theParam,
						flag
					);
				};
				expect( func, `${message} - ${action}`
				).to.throw(
					MyError,
					/Property is reserved/
				);
			}
			
			//
			// Instantiate for delete data test.
			//
			action = "Instantiation for delete test";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						null,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object empty state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Load data.
			//
			data = K.function.clone( no_reserved );
			for( const item in data )
				data[ item ] = null;
			action = "Delete document properties";
			func = () => {
				doc.setDocumentProperties(
					data,
					flag
				);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Handle reserved fields.
			//
			if( has_reserved )
			{
				//
				// Instantiate for false replace flag test.
				//
				action = "Instantiation for reserved test";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							null,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Load data.
				//
				data = K.function.clone( theParam );
				for( const item in data )
					data[ item ] = null;
				action = "Delete reserved document properties";
				func = () => {
					doc.setDocumentProperties(
						data,
						flag
					);
				};
				//
				// This should not fail, since the property will not be deleted,
				// because it is not there in the first place.
				//
				expect( func, `${message} - ${action}` ).not.to.throw();
			}
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Instantiate for false replace flag test.
			//
			action = "Instantiation for invalid property test";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						null,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object empty state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Load data.
			//
			action = "Set invalid document property";
			data = { "UNKNOWN" : "CONTENT" };
			func = () => {
				doc.setDocumentProperties(
					data,
					flag
				);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check content.
			//
			this.assertAllProvidedDataInDocument( "Check contents", doc, data );
			
		}	// Iterating replace flag values.
	
	}	// testContentsLoadEmptyObject
	
	/**
	 * Load contents in filled object
	 *
	 * Assert that loading contents in a filled non persistent object works for all fields
	 * except restricted fields, the following checks will be performed:
	 *
	 *	- Restricted fields are not copied.
	 *	- Modifying locked fields will not raise an exception.
	 *	- All other fields are copied.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testContentsLoadFilledObject( theClass, theParam = null )
	{
		let doc;
		let data;
		let func;
		let action;
		let message;
		
		//
		// Get base and replace contents.
		//
		message = "Unit test parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).to.have.property( 'base' );
		expect( theParam, message ).to.have.property( 'replace' );
		
		//
		// Get parameter data.
		//
		const base_data = theParam[ 'base' ];
		const replace_data = theParam[ 'replace' ];
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Handle reserved content.
		//
		let base_has_reserved = false;
		let replace_has_reserved = false;
		const base_reserved_values = {};
		const replace_reserved_values = {};
		const reserved_fields = doc.reservedFields;
		const base_no_reserved = K.function.clone( base_data );
		for( const field in base_no_reserved )
		{
			if( reserved_fields.includes( field ) )
			{
				base_reserved_values[ field ] = base_no_reserved[ field ];
				delete base_no_reserved[ field ];
				base_has_reserved = true;
			}
		}
		const replace_no_reserved = K.function.clone( replace_data );
		for( const field in replace_no_reserved )
		{
			if( reserved_fields.includes( field ) )
			{
				replace_reserved_values[ field ] = replace_no_reserved[ field ];
				delete replace_no_reserved[ field ];
				replace_has_reserved = true;
			}
		}
		
		//
		// Iterate by replace flag value.
		//
		for( const flag of [ false, true ] )
		{
			//
			// SET PROPERTIES
			//
			
			//
			// Instantiate for set test.
			//
			message = `Rplace flag is ${flag}`;
			action = "Instantiation for setting data";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						base_no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object empty state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Replace and check contents.
			//
			this.validateNonPersistentReplace(
				`${message} - replace with contents`,	// Error message.
				flag,									// Replace flag.
				doc,									// The document object.
				replace_data							// The replacement data.
			);
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			
			//
			// DELETE PROPERTIES
			//
			
			//
			// Instantiate for delete test.
			//
			action = "Instantiation for deleting data";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						base_no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object empty state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Delete and check contents.
			//
			data = K.function.clone( replace_data );
			for( const item in data )
				data[ item ] = null;
			this.validateNonPersistentReplace(
				`${message} - replace with delete contents`,	// Error message.
				flag,											// Replace flag.
				doc,											// The document object.
				data											// The replacement data.
			);
			
			//
			// Check object loaded state.
			//
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			
			//
			// SET INVALID PROPERTIES
			//
			
			//
			// Instantiate for false replace flag test.
			//
			action = "Instantiation for setting invalid contents";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						base_no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object empty state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Replace and check contents.
			//
			data = { "UNKNOWN" : "CONTENT" };
			this.validateNonPersistentReplace(
				`${message} - replace with invalid contents`,	// Error message.
				flag,											// Replace flag.
				doc,											// The document object.
				data											// The replacement data.
			);
			action = "Has invalid field";
			expect( doc.document, `${message} - ${action}` ).to.have.property( 'UNKNOWN' );
			expect( doc.document[ 'UNKNOWN'], `${message} - ${action}` ).to.equal( 'CONTENT' );
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
		}	// Iterating by flag value.
	
	}	// testContentsLoadFilledObject
	
	/**
	 * Load contents in persistent object
	 *
	 * Assert that loading contents in a persistent object works for all fields
	 * except restricted fields, the following checks will be performed:
	 *
	 *	- Restricted fields are not copied.
	 *	- Modifying locked fields will raise an exception.
	 *	- All other fields are copied.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testContentsLoadPersistentObject( theClass, theParam = null )
	{
		let id;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Get base and replace contents.
		//
		message = "Unit test parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).to.have.property( 'base' );
		expect( theParam, message ).to.have.property( 'replace' );
		
		//
		// Get parameter data.
		//
		const base_data = theParam[ 'base' ];
		const replace_data = theParam[ 'replace' ];
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Handle reserved content.
		//
		let base_has_reserved = false;
		let replace_has_reserved = false;
		const base_reserved_values = {};
		const replace_reserved_values = {};
		const reserved_fields = doc.reservedFields;
		const base_no_reserved = K.function.clone( base_data );
		for( const field in base_no_reserved )
		{
			if( reserved_fields.includes( field ) )
			{
				base_reserved_values[ field ] = base_no_reserved[ field ];
				delete base_no_reserved[ field ];
				base_has_reserved = true;
			}
		}
		const replace_no_reserved = K.function.clone( replace_data );
		for( const field in replace_no_reserved )
		{
			if( reserved_fields.includes( field ) )
			{
				replace_reserved_values[ field ] = replace_no_reserved[ field ];
				delete replace_no_reserved[ field ];
				replace_has_reserved = true;
			}
		}
		
		//
		// Instantiate object for inserting.
		//
		message = "Persistent copy";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					base_no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, base_reserved_values );
		
		//
		// Insert object.
		//
		action = "Insertion";
		func = () => {
			result = doc.insertDocument( true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object persistent state.
		//
		action = "Insertion result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		action = "Has _id";
		expect( doc.document, `${message} - ${action}` ).to.have.property( '_id' );
		
		//
		// Save ID.
		//
		id = doc.document._id;
		
		//
		// Iterate by replace flag value.
		//
		for( const flag of [ false, true ] )
		{
			//
			// SET PROPERTIES
			//
			
			//
			// Instantiate from reference.
			//
			message = `Replace flag is ${flag}`;
			action = "Instantiation from reference";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						id,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check content.
			//
			this.assertAllProvidedDataInDocument( "Check contents", doc, base_no_reserved );
			
			//
			// Replace and check contents.
			//
			this.validatePersistentReplace(
				`${message} - replace with contents`,	// Error message.
				flag,									// Replace flag.
				doc,									// The document object.
				replace_data							// The replacement data.
			);
			
			//
			// Check object replaced state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			
			//
			// DELETE PROPERTIES
			//
			
			//
			// Instantiate from reference.
			//
			action = "Instantiation from reference";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						id,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Delete and check contents.
			//
			data = K.function.clone( replace_data );
			for( const item in data )
				data[ item ] = null;
			this.validatePersistentReplace(
				`${message} - replace with delete contents`,	// Error message.
				flag,											// Replace flag.
				doc,											// The document object.
				data											// The replacement data.
			);
			
			//
			// Check object loaded state.
			//
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			
			//
			// SET INVALID PROPERTIES
			//
			
			//
			// Instantiate for false replace flag test.
			//
			action = "Instantiation from reference";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						id,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Replace and check contents.
			//
			data = { "UNKNOWN" : "CONTENT" };
			this.validatePersistentReplace(
				`${message} - replace with invalid contents`,	// Error message.
				flag,											// Replace flag.
				doc,											// The document object.
				data											// The replacement data.
			);
			action = "Has invalid field";
			expect( doc.document, `${message} - ${action}` ).to.have.property( 'UNKNOWN' );
			expect( doc.document[ 'UNKNOWN'], `${message} - ${action}` ).to.equal( 'CONTENT' );
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
		}	// Iterating by flag value.
		
		//
		// Remove document.
		//
		db._remove( id );

	}	// testContentsLoadPersistentObject
	
	/**
	 * Match property values
	 *
	 * Assert that matchPropertyValue() method works as needed.
	 *
	 * In derived classes call parent method and implement custom tests.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testContentsMatchPropertyValue( theClass, theParam = null )
	{
		let id;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		let property;
		
		//
		// Instantiate to get document instance.
		//
		message = "Instantiate to get instance";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Test set new value.
		//
		property = 'name';
		message = "Set new value";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], "A name" );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.false;
		
		//
		// Test delete missing.
		//
		message = "Delete missing";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], null );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.true;
		result = doc.matchPropertyValue( doc.document[ property ], undefined );
		expect( result, message ).to.be.true;
		
		//
		// Set value.
		//
		func = () => {
			doc.setDocumentProperties({ name: "pippo"}, true );
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Test set different value.
		//
		message = "Set new value";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], "A name" );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.false;
		
		//
		// Test delete value.
		//
		message = "Delete existing value";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], null );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.false;
		
		//
		// Test set same value.
		//
		message = "Set same value";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], "pippo" );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.true;
		
		//
		// Create test arrays.
		//
		const arr1 = [ 1, 2, 3 ];
		const arr2 = [ 3, 2, 1 ];
		const arr3 = [ 4, 5, 6 ];
		
		//
		// Test set new value.
		//
		property = 'array';
		message = "Set new value";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], arr1 );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.false;
		
		//
		// Test delete missing.
		//
		message = "Delete missing";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], null );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.true;
		result = doc.matchPropertyValue( doc.document[ property ], undefined );
		expect( result, message ).to.be.true;
		
		//
		// Set value.
		//
		func = () => {
			doc.setDocumentProperties({ array: arr1}, true );
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Test set different value.
		//
		message = "Set new value";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], arr3 );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.false;
		
		//
		// Test delete value.
		//
		message = "Delete existing value";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], null );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.false;
		
		//
		// Test set same value.
		//
		message = "Set same value";
		func = () => {
			result = doc.matchPropertyValue( doc.document[ property ], arr2 );
		};
		expect( func, `${message}` ).not.to.throw();
		expect( result, message ).to.be.true;
		
	}	// testContentsMatchPropertyValue
	
	
	/****************************************************************************
	 * INSERT TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test inserting empty object
	 *
	 * Assert that inserting an empty object fails if the object has required fields,
	 * or succeed if object does not have required fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertEmptyObject( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Handle required fields.
		//
		if( doc.requiredFields.length > 0 )
		{
			//
			// Insert object.
			//
			action = "Insertion";
			func = () => {
				result = doc.insertDocument( true );
			};
			
			//
			// Assert exception.
			//
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/missing required fields/
			);
		}
		
		//
		// Handle no required fields.
		//
		else
		{
			//
			// Insert object.
			//
			action = "Insertion";
			func = () => {
				result = doc.insertDocument( true );
			};
			
			//
			// Assert no exception.
			//
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Insertion result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				( Array.isArray(theParam) ) ? theParam : []
			);
			
			//
			// Remove document.
			//
			db._remove( doc.document._id );
		}
		
	}	// testInsertEmptyObject
	
	/**
	 * Test inserting document without required fields
	 *
	 * Assert that inserting an object without required fields fails and succeeds if
	 * the object has no required fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithoutRequiredFields( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		let reserved;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		
		//
		// Get parameter data.
		//
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							 ? theParam.excluded
							 : [];
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Collect required fields.
		//
		const required = doc.requiredFields;
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( param_contents );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate object with contents.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set reserved values.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Handle document with required fields.
		//
		if( required.length > 0 )
		{
			//
			// Iterate required fields.
			//
			for( const field of required )
			{
				//
				// Remove from current document.
				//
				reserved = false;
				if( doc.document.hasOwnProperty( field ) )
				{
					//
					// Remove field.
					//
					const data = {};
					data[ field ] = null;
					message = `Remove [${field}]`;
					func = () => {
						doc.setDocumentProperties( data, true );
					};
					
					//
					// Handle reserved.
					//
					if( doc.reservedFields.includes( field ) )
					{
						reserved = true;
						action = "Reserved";
						expect( func, `${message} - ${action}`
						).to.throw(
							MyError,
							/Property is reserved/
						);
					}
					
					//
					// Handle other types.
					//
					else
					{
						action = "Not reserved";
						expect( func, `${message}` ).not.to.throw();
						expect( doc.document, message ).not.to.have.property( field );
					}
					
				}	// Removed existing field.
				
				//
				// Insert.
				// Except if reserved field was deleted.
				//
				if( ! reserved )
				{
					message = `Insert without [${field}]`;
					func = () => {
						result = doc.insertDocument( true );
					};
					expect( func, `${message}`
					).to.throw(
						MyError,
						/missing required fields/
					);
				}
				
				//
				// Restore the full object.
				//
				message = "Instantiate full object";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							no_reserved,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				
				//
				// Set reserved values.
				//
				this.setReservedProperties( doc, reserved_values );
				
			}	// Iterating featured required fields.
			
		}	// Features required fields.
		
		//
		// Handle no required fields.
		//
		else
		{
			//
			// Insert object.
			//
			message = "Insertion without required fields";
			func = () => {
				result = doc.insertDocument( true );
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Insertion result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				param_excluded
			);
			
			//
			// Remove document.
			//
			db._remove( doc.document._id );
			
		} // Has no required fields.
		
	}	// testInsertWithoutRequiredFields
	
	/**
	 * Test inserting document without significant fields
	 *
	 * Assert that inserting an object without significant fields suceeds, the method
	 * will instantiate a document
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithoutSignificantFields( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		
		//
		// Get parameter data.
		//
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Collect significant fields.
		//
		const significant = K.function.flatten( doc.significantFields );
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( param_contents );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate object with contents.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set reserved values.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Handle document with significant fields.
		//
		if( significant.length > 0 )
		{
			//
			// Iterate significant fields.
			//
			for( const field of significant )
			{
				//
				// Remove from current document.
				//
				if( doc.document.hasOwnProperty( field ) )
				{
					//
					// Remove field.
					//
					const data = {};
					data[ field ] = null;
					message = `Remove [${field}]`;
					func = () => {
						doc.setDocumentProperties( data, true );
					};
					expect( func, `${message}` ).not.to.throw();
					expect( doc.document, message ).not.to.have.property( field );
					
				}	// Removed existing field.
				
				//
				// Insert function.
				//
				message = `Insert without [${field}]`;
				func = () => {
					result = doc.insertDocument( true );
				};
				
				//
				// Handle also required.
				// Should raise an exception.
				//
				if( doc.requiredFields.includes( field ) )
					expect( func, `${message}`
					).to.throw(
						MyError,
						/missing required fields/
					);
				
				//
				// Handle only significant.
				// Should not raise an exception.
				//
				else
				{
					//
					// Insert.
					//
					expect( func, `${message}` ).not.to.throw();
					
					//
					// Check object persistent state.
					//
					action = "Insertion result";
					expect( result, `${message} - ${action}` ).to.be.true;
					action = "Contents";
					expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
					action = "Collection";
					expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
					action = "Persistent";
					expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
					action = "Modified";
					expect( doc.modified, `${message} - ${action}` ).to.equal( true );
					
					//
					// Check local fields.
					//
					this.checkLocalProperties(
						message,
						doc,
						param_excluded
					);
					
					//
					// Remove document.
					//
					db._remove( doc.document._id );
					
				}	// Field is not required.
				
				//
				// Restore the full object.
				//
				message = "Instantiate full object";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							no_reserved,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				
				//
				// Set reserved values.
				//
				this.setReservedProperties( doc, reserved_values );
				
			}	// Iterating featured significant fields.
			
		}	// Features significant fields.
		
		//
		// Handle no significant fields.
		//
		else
		{
			//
			// Insert object.
			//
			message = "Insertion without significant fields";
			func = () => {
				result = doc.insertDocument( true );
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Insertion result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				param_excluded
			);
			
			//
			// Remove document.
			//
			db._remove( doc.document._id );
			
		} // Has no significant fields.
		
	}	// testInsertWithoutSignificantFields
	
	/**
	 * Test inserting document with content
	 *
	 * Assert that inserting an object with contents suceeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithContent( theClass, theParam = null )
	{
		let id;
		let key;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		expect( theParam, "Parameter contents" ).to.have.property( 'changed' );
		
		//
		// Get parameter data.
		//
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// Clone parameter.
		//
		const clone = K.function.clone( param_contents );
		
		//
		// Change name if already saved.
		// To ensure resolving by name doesn't raise an ambiguous document error.
		//
		if( this.intermediate_results.hasOwnProperty( 'key_insert_filled' ) )
		{
			for( const field in theParam.changed )
				clone[ field ] = theParam.changed[ field ];
		}
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( clone );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Set reserved values.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument( true );
		};
		expect( func, message ).not.to.throw();
		
		//
		// Assert document persistent state.
		//
		action = "Result";
		expect( result, `${message} - ${action}` ).to.equal( true );
		action = "Should not be empty";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Has local fields";
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal(false);
		
		//
		// Assert all data is in document.
		//
		this.assertAllProvidedDataInDocument( "Contents", doc, clone );
		
		//
		// Check local fields.
		//
		this.checkLocalProperties(
			message,
			doc,
			param_excluded
		);
		
		//
		// Get ID and clone data.
		//
		id = doc.document._id;
		key = doc.document._key;
		data = K.function.clone( doc.document );
		
		//
		// Save inserted ID in unit test object.
		//
		this.intermediate_results.key_insert_filled = key;
		expect(this.intermediate_results).to.have.property("key_insert_filled");
		expect(this.intermediate_results.key_insert_filled).to.equal(key);
		
		//
		// Retrieve.
		//
		message = "Retrieve";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Assert all data is in document.
		//
		this.assertAllProvidedDataInDocument( "Contents", doc, data );
		
	}	// testInsertWithContent
	
	/**
	 * Test inserting document with same content
	 *
	 * Assert that inserting an object with same contents succeeds, this should occur if
	 * the document _key is determined by the database.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertDuplicate( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let message;
		let selector;
		
		//
		// Check persistent document.
		//
		message = "Check parameter";
		expect(this, message).to.have.property('intermediate_results');
		expect(this.intermediate_results, message).to.have.property('key_insert_filled');
		expect(this.intermediate_results.key_insert_filled, message).to.be.a.string;
		db._collection( this.defaultTestCollection )
			.document( this.intermediate_results.key_insert_filled );
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( theParam );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Create selector.
		//
		selector = K.function.clone( no_reserved );
		selector._key = this.intermediate_results.key_insert_filled;
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument( true );
		};
		
		//
		// Here we test for two error types: classes that compute the _key and enforce
		// resolving by _key, such as the Edge, will raise an ambiguous document
		// error, other classes will raise the duplicate document error.
		//
		expect( func, message
		).to.throw(
			MyError,
			/duplicate document in collection|_key field mismatch/
		);
		
	}	// testInsertDuplicate
	
	/**
	 * Test inserting document with same content fails
	 *
	 * Assert that inserting an object with same contents fails, this should occur if
	 * the document _key is computed from the document contents.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithSameContentFail( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		const param_contents = theParam.contents;
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( param_contents );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument( true );
		};
		expect( func, message
		).to.throw(
			MyError,
			/duplicate document in collection/
		);
		
	}	// testInsertWithSameContentFail
	
	/**
	 * Test inserting document with same content succeeds
	 *
	 * Assert that inserting an object with same contents succeeds, this should occur if
	 * the document _key is assigned by the database.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithSameContentSucceed( theClass, theParam = null )
	{
		let id;
		let key;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		expect( theParam, "Parameter contents" ).to.have.property( 'first' );
		expect( theParam, "Parameter contents" ).to.have.property( 'second' );
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// Clone contents.
		//
		const clone = K.function.clone(param_contents);
		
		//
		// Change name if already saved.
		// To ensure resolving by name doesn't raise an ambiguous document error.
		//
		if( this.intermediate_results.hasOwnProperty( 'key_insert_same' ) )
		{
			for( const field in theParam.second )
				clone[ field ] = theParam.second[ field ];
		}
		else
		{
			for( const field in theParam.first )
				clone[ field ] = theParam.first[ field ];
		}
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( clone );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Perform test only if _key is not required.
		// If required, it means that the database cannot assign the key.
		//
		if( ! doc.requiredFields.includes( '_key' ) )
		{
			//
			// Insert.
			//
			message = "Insert";
			func = () => {
				result = doc.insertDocument( true );
			};
			expect( func, message ).not.to.throw();
			
			//
			// Assert persistent document state.
			//
			action = "Result";
			expect( result, `${message} - ${action}` ).to.equal( true );
			action = "Should not be empty";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Has local fields";
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal(false);
			
			//
			// Assert all provided data is there.
			//
			this.assertAllProvidedDataInDocument( "Contents", doc, clone );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				param_excluded
			);
			
			//
			// Get ID and clone data.
			//
			id = doc.document._id;
			key = doc.document._key;
			data = K.function.clone( doc.document );
			
			//
			// Save inserted ID in unit test object.
			//
			this.intermediate_results.key_insert_same = key;
			expect(this.intermediate_results).to.have.property("key_insert_same");
			expect(this.intermediate_results.key_insert_same).to.equal(key);
			
			//
			// Retrieve.
			//
			message = "Retrieve";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						id,
						this.defaultTestCollection
					);
			};
			expect( func, message ).not.to.throw();
			
			//
			// Assert all data is there.
			//
			this.assertAllProvidedDataInDocument( "Contents", doc, data );
			
		}	// _key is not required.
	
	}	// testInsertWithSameContentSucceed
	
	/**
	 * Test inserting persistent object
	 *
	 * Assert that inserting a persistent object fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertPersistentObject( theClass, theParam = null )
	{
		let id;
		let key;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		let selector;
		
		//
		// Check persistent document.
		//
		message = "Check parameter";
		expect(this, message).to.have.property('intermediate_results');
		expect(this.intermediate_results, message).to.have.property('key_insert_filled');
		expect(this.intermediate_results.key_insert_filled, message).to.be.a.string;
		db._collection( this.defaultTestCollection )
			.document( this.intermediate_results.key_insert_filled );
		
		//
		// Create selector.
		//
		id = `${this.defaultTestCollection}/${this.intermediate_results.key_insert_filled}`;
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument( true );
		};
		expect( func, message
		).to.throw(
			MyError,
			/document is persistent/
		);
		
	}	// testInsertPersistentObject
	
	/**
	 * Test inserting without persisting
	 *
	 * Assert that inserting with the persist flag off succeeds and that all required
	 * fields are set.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithoutPersist( theClass, theParam = null )
	{
		let id;
		let key;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		let selector;
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( theParam.contents );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument( false );
		};
		expect( func, message ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.equal( true );
		action = "Should not be empty";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Has reference fields";
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal(false);
		
		//
		// Assert reference fields are not there.
		//
		for( const field of [ '_id', '_key', '_rev' ] )
		{
			if( ! theParam.local.includes( field ) )
				expect(doc.document, `${message} - ${action}` ).not.to.have.property( field );
		}
		
		//
		// Assert all data is there.
		//
		this.assertAllProvidedDataInDocument( "Contents", doc, theParam.contents );
		
	}	// testInsertWithoutPersist
	
	
	/****************************************************************************
	 * RESOLVE TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test resolving persistent object
	 *
	 * Assert that resolving a persistent object succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolvePersistent( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		const param_excluded = ( Array.isArray( theParam ) ) ? theParam : [];
		
		//
		// Iterate replace flag values.
		//
		for( const flag of [ false, true ] )
		{
			//
			// Instantiate empty object.
			//
			message = "Instantiation";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						null,
						this.defaultTestCollection
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Set _id.
			//
			message = "Set _id";
			func = () => {
				doc.setDocumentProperties(
					{ _id: `${this.defaultTestCollection}/${this.intermediate_results.key_insert_filled}` },
					true
				);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Resolve object.
			//
			message = `Resolve by _id with replace flag ${flag}`;
			func = () => {
				result = doc.resolveDocument( flag, true );
			};
			expect( func, `${message}` ).not.to.throw();
			action = "Result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				param_excluded
			);
			
			//
			// Instantiate empty object.
			//
			message = "Instantiation";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						null,
						this.defaultTestCollection
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Set _key.
			//
			message = "Set _key";
			func = () => {
				doc.setDocumentProperties(
					{ _key: `${this.intermediate_results.key_insert_filled}` },
					true
				);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Resolve object.
			//
			message = `Resolve by _key with replace flag ${flag}`;
			func = () => {
				result = doc.resolveDocument( flag, true );
			};
			expect( func, `${message}` ).not.to.throw();
			action = "Result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				param_excluded
			);
			
		}	// Iterating replace flag values.
		
	}	// testResolvePersistent
	
	/**
	 * Test resolving null reference
	 *
	 * Assert that resolving a null reference raises an exception.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveNullReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve object.
		//
		message = "Resolve";
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/cannot locate document without selection data/
		);
		
	}	// testResolveNullReference
	
	/**
	 * Resolve ambiguous object
	 *
	 * Assert that resolving an object matches more than one document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveAmbiguous( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone and strip reserved fields from parameter.
		//
		const reserved_values = {};
		const no_reserved = K.function.clone( theParam );
		for( const field of doc.reservedFields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate object with selector.
		//
		message = "Instantiate object with selector";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Resolve document with replace flag off.
		//
		message = "Resolve with replace flag off";
		func = () => {
			result = doc.resolveDocument( false, true );
		};
		
		//
		// We test two types of errors:
		//
		//
		expect( func, `${message}`
		).to.throw(
			MyError,
			/combination of fields is not unique/
		);
		
		//
		// Resolve document with replace flag on.
		//
		message = "Resolve with replace flag on";
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/combination of fields is not unique/
		);
		
	}	// testResolveAmbiguous
	
	/**
	 * Resolve significant field selector
	 *
	 * This test will assert resolving a document with or without significant fields,
	 * it will perform the following checks:
	 *
	 * 	- Resolve with all significant fields:
	 * 		- Providing both significant fields should succeed for documents with and
	 * 		  without significant fields.
	 * 	- Resolve with one significant field missing:
	 * 		- Should fail if document features significant fields and succeed if not.
	 * 	- Resolve without significant fields:
	 * 		- Succeed if document does not feature significant fields and fail if it does.
	 * 	- Resolve with ambiguous significant fields:
	 * 		- Fails with or without featuring significant fields.
	 * 	- Resolve with not found significant fields:
	 * 		- Fails with or without featuring significant fields.
	 * 	- Resolve with matching significant fields and different content:
	 * 		- Should succeed, test with replace flag on and off.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveSignificantField( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		let original;
		let selector;
		let no_reserved;
		let reserved_values;
		
		//
		// Check parameter.
		//
		message = "Checking parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).to.have.property( 'sigFind' );
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Save reserved fields.
		//
		const reserved_fields = doc.reservedFields;
		
		//
		// Iterate by replace flag value.
		//
		for( const flag of [ false, true ] )
		{
			//
			// RESOLVE WITH SIGNIFICANT FIELDS.
			//
			
			//
			// Clone and strip reserved fields from parameter.
			//
			reserved_values = {};
			no_reserved = K.function.clone( theParam.sigFind );
			for( const field of reserved_fields )
			{
				if( no_reserved.hasOwnProperty( field ) )
				{
					reserved_values[ field ] = no_reserved[ field ];
					delete no_reserved[ field ];
				}
			}
			
			//
			// Instantiate object.
			//
			message = "Resolve with all significant fields and replace flag on";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Set reserved fields.
			//
			this.setReservedProperties( doc, reserved_values );
			
			//
			// Resolve.
			//
			action = "Resolve";
			func = () => {
				result = doc.resolveDocument( flag, true );
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Assert document state.
			//
			action = "Result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			
			//
			// Save persistent contents.
			//
			original = K.function.clone( doc.document );
			
			//
			// Match document contents.
			//
			this.validateResolvedContents(
				flag,				// Replace flag.
				message,			// Error message.
				doc,				// The object to test.
				original,			// The persistent contents.
				theParam.sigFind	// The selection contents.
			);
			
			//
			// RESOLVE WITH ONE SIGNIFICANT FIELD.
			//
			
			//
			// Instantiate with one significant field missing.
			//
			if( theParam.hasOwnProperty( 'sigOne' ) ) {
				//
				// Clone and strip reserved fields from parameter.
				//
				reserved_values = {};
				no_reserved = K.function.clone( theParam.sigOne );
				for( const field of reserved_fields ) {
					if( no_reserved.hasOwnProperty( field ) ) {
						reserved_values[ field ] = no_reserved[ field ];
						delete no_reserved[ field ];
					}
				}
				
				//
				// Instantiate with all significant fields.
				//
				message = `Resolve with one significant field missing and replace flag ${flag}`;
				action = "Instantiate";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							no_reserved,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Set reserved fields.
				//
				this.setReservedProperties( doc, reserved_values );
				
				//
				// Resolve function.
				//
				func = () => {
					result = doc.resolveDocument( flag, true );
				};
				
				//
				// Handle document with significant fields.
				//
				if( doc.significantFields.length > 0 )
				{
					action = "Resolve and has significant fields";
					expect( func, `${message} - ${action}`
					).to.throw(
						MyError,
						/missing required fields/
					);
				}
				
				//
				// Handle document without significant fields.
				// Should find the document matching the provided field.
				//
				else
				{
					//
					// Resolve.
					//
					action = "Resolve and has not significant fields";
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Assert document state.
					//
					action = "Result";
					expect( result, `${message} - ${action}` ).to.be.true;
					action = "Contents";
					expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
					action = "Collection";
					expect( doc.collection, `${message} - ${action}` ).to.equal(
						this.defaultTestCollection );
					action = "Persistent";
					expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
					action = "Modified";
					expect( doc.modified, `${message} - ${action}` ).to.equal( false );
					
					//
					// Match document contents.
					//
					this.validateResolvedContents(
						flag,				// Replace flag.
						message,			// Error message.
						doc,				// The object to test.
						original,			// The persistent contents.
						theParam.sigOne		// The selection contents.
					);
				}
			
			}	// Has sigOne.
			
			//
			// RESOLVE WITHOUT SIGNIFICANT FIELDS.
			//
			
			//
			// Instantiate with all significant fields missing.
			//
			if( theParam.hasOwnProperty( 'noSig' ) )
			{
				//
				// Clone and strip reserved fields from parameter.
				//
				reserved_values = {};
				no_reserved = K.function.clone( theParam.noSig );
				for( const field of reserved_fields )
				{
					if( no_reserved.hasOwnProperty( field ) )
					{
						reserved_values[ field ] = no_reserved[ field ];
						delete no_reserved[ field ];
					}
				}
				
				//
				// Instantiate without significant fields.
				//
				message = `Resolve with no significant fields and replace flag ${flag}`;
				action = "Instantiate";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							no_reserved,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Set reserved fields.
				//
				this.setReservedProperties( doc, reserved_values );
				
				//
				// Resolve function.
				//
				func = () => {
					result = doc.resolveDocument( flag, true );
				};
				
				//
				// Handle document with significant fields.
				//
				if( doc.significantFields.length > 0 )
				{
					action = "Resolve and has significant fields";
					expect( func, `${message} - ${action}`
					).to.throw(
						MyError,
						/missing required fields/
					);
				}
				
				//
				// Handle document without significant fields.
				// Should find the document matching the provided field.
				//
				else
				{
					//
					// Resolve.
					//
					action = "Resolve and has not significant fields";
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Assert document state.
					//
					action = "Result";
					expect( result, `${message} - ${action}` ).to.be.true;
					action = "Contents";
					expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
					action = "Collection";
					expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
					action = "Persistent";
					expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
					action = "Modified";
					expect( doc.modified, `${message} - ${action}` ).to.equal( false );
					
					//
					// Match document contents.
					//
					this.validateResolvedContents(
						flag,				// Replace flag.
						message,			// Error message.
						doc,				// The object to test.
						original,			// The persistent contents.
						theParam.noSig		// The selection contents.
					);
				}
				
			}	// Has noSig.
			
			//
			// RESOLVE WITH AMBIGUOUS SIGNIFICANT FIELDS.
			//
			
			//
			// Instantiate with ambiguous significant fields.
			//
			if( theParam.hasOwnProperty( 'sigAmbig' ) )
			{
				//
				// Clone and strip reserved fields from parameter.
				//
				reserved_values = {};
				no_reserved = K.function.clone( theParam.sigAmbig );
				for( const field of reserved_fields )
				{
					if( no_reserved.hasOwnProperty( field ) )
					{
						reserved_values[ field ] = no_reserved[ field ];
						delete no_reserved[ field ];
					}
				}
				
				//
				// Instantiate with ambiguous significant field.
				//
				message = `Resolve with ambiguous significant fields and replace flag ${flag}`;
				action = "Instantiate";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							no_reserved,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Set reserved fields.
				//
				this.setReservedProperties( doc, reserved_values );
				
				//
				// Resolve function.
				//
				action = "Resolve";
				func = () => {
					result = doc.resolveDocument( flag, true );
				};
				expect( func, `${message} - ${action}`
				).to.throw(
					MyError,
					/Ambiguous document reference/
				);
				
			}	// Has sigAmbig.
			
			//
			// RESOLVE WITH UNMATCHED SIGNIFICANT FIELD.
			//
			
			//
			// Instantiate with unmatches significant fields.
			//
			if( theParam.hasOwnProperty( 'sigNoFind' ) )
			{
				//
				// Clone and strip reserved fields from parameter.
				//
				reserved_values = {};
				no_reserved = K.function.clone( theParam.sigNoFind );
				for( const field of reserved_fields )
				{
					if( no_reserved.hasOwnProperty( field ) )
					{
						reserved_values[ field ] = no_reserved[ field ];
						delete no_reserved[ field ];
					}
				}
				
				//
				// Instantiate with unmatches significant field.
				//
				message = `Resolve with unmatched significant fields and replace flag ${flag}`;
				action = "Instantiate";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							no_reserved,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Set reserved fields.
				//
				this.setReservedProperties( doc, reserved_values );
				
				//
				// Resolve function.
				//
				action = "Resolve";
				func = () => {
					result = doc.resolveDocument( flag, true );
				};
				expect( func, `${message} - ${action}`
				).to.throw(
					MyError,
					/not found in collection/
				);
				
			}	// Has sigNoFind.
			
			//
			// RESOLVE WITH MATCHING SIGNIFICANT FIELD AND DIFFERENT CONTENT.
			//
			
			//
			// Change all fields except significant.
			//
			selector = K.function.clone( this.parameters.replace );
			for( const field in theParam.sigFind )
				selector[ field ] = theParam.sigFind[ field ];
			delete selector._id;
			delete selector._key;
			delete selector._rev;
			
			//
			// Clone and strip reserved fields from parameter.
			//
			reserved_values = {};
			no_reserved = K.function.clone( selector );
			for( const field of reserved_fields )
			{
				if( no_reserved.hasOwnProperty( field ) )
				{
					reserved_values[ field ] = no_reserved[ field ];
					delete no_reserved[ field ];
				}
			}
			
			//
			// Instantiate with matching significant field and changed content.
			//
			message = `Matching significant field, changed content and replace flag ${flag}`;
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Set reserved fields.
			//
			this.setReservedProperties( doc, reserved_values );
			
			//
			// Resolve.
			//
			func = () => {
				result = doc.resolveDocument( flag, true );
			};
			
			//
			// Handle document with significant fields.
			// Should succeed, because it will use significant fields first.
			//
			action = "Resolve";
			if( doc.significantFields.length > 0 )
			{
				//
				// Succeed.
				//
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Assert document state.
				//
				action = "Result";
				expect( result, `${message} - ${action}` ).to.be.true;
				action = "Contents";
				expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
				action = "Collection";
				expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
				action = "Persistent";
				expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
				
				//
				// Match document contents.
				//
				this.validateResolvedContents(
					flag,				// Replace flag.
					message,			// Error message.
					doc,				// The object to test.
					original,			// The persistent contents.
					selector			// The selection contents.
				);
				
			}	// Has significant fields.
			
			//
			// Handle document without significant fields.
			// Should fail, because it will use all contents.
			//
			else
			{
				//
				// Fail.
				//
				expect( func, `${message} - ${action}`
				).to.throw(
					MyError,
					/not found in collection/
				);
				
			}	// Has no significant fields.
			
		}	// Iterating by replace flag value.
		
	}	// testResolveSignificantField
	
	/**
	 * Resolve reference fields
	 *
	 * This test will assert that in the presence of references and significant
	 * fields, the resolve method will prefer the references, it will perform the
	 * following checks:
	 *
	 * 	- Resolve by _id:
	 * 		- Set valid _id, invalid _key and invalid significant fields: should resolve
	 * 		_id.
	 * 	- Resolve by _key:
	 * 		- Set valid _key and invalid significant fields: should resolve _key.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveReferenceField( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		let selector;
		let no_reserved;
		let reserved_values;
		
		//
		// Check parameter.
		//
		message = "Checking parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).not.to.be.empty;
		
		//
		// Resolve document by reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Save references.
		//
		const ref_id = doc.document._id;
		const ref_key = doc.document._key;
		const original = K.function.clone( doc.document );
		
		//
		// Iterate replace flag values.
		//
		for( const flag of [ false, true ] )
		{
			//
			// RESOLVE BY ID.
			//
			
			//
			// Make selector.
			//
			selector = K.function.clone( theParam );
			selector._id = ref_id;
			selector._key = "UNKNOWN";
			
			//
			// Clone and strip reserved fields from parameter.
			//
			reserved_values = {};
			no_reserved = K.function.clone( selector );
			for( const field of doc.reservedFields )
			{
				if( no_reserved.hasOwnProperty( field ) )
				{
					reserved_values[ field ] = no_reserved[ field ];
					delete no_reserved[ field ];
				}
			}
			
			//
			// Instantiate with ambiguous selector and reference ID.
			//
			message = `Use _id reference with replace flag ${flag}`;
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Set reserved fields.
			//
			this.setReservedProperties( doc, reserved_values );
			
			//
			// Resolve.
			//
			func = () => {
				result = doc.resolveDocument( flag, true );
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Assert document state.
			//
			action = "Result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( true );
			
			//
			// Match document contents.
			//
			this.validateResolvedContents(
				flag,				// Replace flag.
				message,			// Error message.
				doc,				// The object to test.
				original,			// The persistent contents.
				selector			// The selection contents.
			);
			
			//
			// RESOLVE BY KEY.
			//
			
			//
			// Make selector.
			//
			selector = K.function.clone( theParam );
			selector._key = ref_key;
			
			//
			// Clone and strip reserved fields from parameter.
			//
			reserved_values = {};
			no_reserved = K.function.clone( selector );
			for( const field of doc.reservedFields )
			{
				if( no_reserved.hasOwnProperty( field ) )
				{
					reserved_values[ field ] = no_reserved[ field ];
					delete no_reserved[ field ];
				}
			}
			
			//
			// Instantiate with ambiguous selector and reference ID.
			//
			message = "Use _key reference with replace flag off";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Set reserved fields.
			//
			this.setReservedProperties( doc, reserved_values );
			
			//
			// Resolve.
			//
			func = () => {
				result = doc.resolveDocument( flag, true );
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Assert document state.
			//
			action = "Result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			
			//
			// Match document contents.
			//
			this.validateResolvedContents(
				flag,				// Replace flag.
				message,			// Error message.
				doc,				// The object to test.
				original,			// The persistent contents.
				selector			// The selection contents.
			);
			
		}	// Iterating replace flag value.
	
	}	// testResolveReferenceField
	
	/**
	 * Resolve without raising
	 *
	 * This test will assert that setting the doRaise flag to off prevents exceptions
	 * from being raised only in case the document was not found.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveNoException( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		let no_reserved;
		let reserved_values;
		
		//
		// Check parameter.
		//
		message = "Checking parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).not.to.be.empty;
		expect( theParam, message ).to.have.property( 'correct' );
		expect( theParam, message ).to.have.property( 'incorrect' );
		// expect( theParam, message ).to.have.property( 'duplicate' );
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Save reserved fields.
		//
		const reserved_fields = doc.reservedFields;
		
		//
		// Iterate replace flag values.
		//
		for( const flag of [ false, true ] )
		{
			//
			// TEST SUCCESS.
			//
			
			//
			// Clone and strip reserved fields from parameter.
			//
			reserved_values = {};
			no_reserved = K.function.clone( theParam.correct );
			for( const field of reserved_fields )
			{
				if( no_reserved.hasOwnProperty( field ) )
				{
					reserved_values[ field ] = no_reserved[ field ];
					delete no_reserved[ field ];
				}
			}
			
			//
			// Set correct selector.
			//
			message = "Instantiate with correct selector";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Set reserved fields.
			//
			this.setReservedProperties( doc, reserved_values );
			
			//
			// Resolve and succeed.
			//
			message = "Resolve and succeed";
			action = "Expect combination to be found";
			func = () => {
				result = doc.resolveDocument( flag, true );
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// TEST FAIL WITH NOT FOUND AND NO RAISE.
			//
			
			//
			// Clone and strip reserved fields from parameter.
			//
			reserved_values = {};
			no_reserved = K.function.clone( theParam.incorrect );
			for( const field of reserved_fields )
			{
				if( no_reserved.hasOwnProperty( field ) )
				{
					reserved_values[ field ] = no_reserved[ field ];
					delete no_reserved[ field ];
				}
			}
			
			//
			// Set not found selector.
			//
			message = "Instantiate with not found selector";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						no_reserved,
						this.defaultTestCollection
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Set reserved fields.
			//
			this.setReservedProperties( doc, reserved_values );
			
			//
			// Resolve and fail.
			//
			message = "Resolve and fail";
			action = "Expect combination not to be found";
			func = () => {
				result = doc.resolveDocument( flag, false );
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Expect not found result to be false";
			expect( result,`${message} - ${action}` ).to.be.false;
			
			//
			// TEST FAIL WITH DUPLICATE.
			//
			
			//
			// Check for duplicate parameter.
			//
			if( theParam.hasOwnProperty( 'duplicate' ) )
			{
				//
				// Clone and strip reserved fields from parameter.
				//
				reserved_values = {};
				no_reserved = K.function.clone( theParam.duplicate );
				for( const field of reserved_fields )
				{
					if( no_reserved.hasOwnProperty( field ) )
					{
						reserved_values[ field ] = no_reserved[ field ];
						delete no_reserved[ field ];
					}
				}
				
				//
				// Set duplicate selector.
				//
				message = "Instantiate with duplicate selector";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							no_reserved,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				
				//
				// Set reserved fields.
				//
				this.setReservedProperties( doc, reserved_values );
				
				//
				// Resolve and fail.
				//
				message = "Resolve and fail";
				action = "Expect combination to be duplicate";
				func = () => {
					result = doc.resolveDocument( flag, false );
				};
				expect( func,`${message} - ${action}`
				).to.throw(
					MyError,
					/resulted in more than one document found/
				);
				
			}	// Has duplicate.
			
		}	// Iterating replace flag value.
		
	}	// testResolveNoException
	
	/**
	 * Resolve changed locked fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * locked fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * Note that the test will use only fields that are locked, if any of these fields
	 * are also significant, they will be removed from the test. This is to accomodate
	 * edges, where significat fields are locked by default.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeLockedField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone locked fields and remove significant fields.
		//
		const locked =
			doc.lockedFields.filter(
				x => (! K.function.flatten(doc.significantFields).includes( x ) )
			);
		
		//
		// Prepare replacement values.
		//
		const replace = {};
		for( const field of locked )
		{
			//
			// Provided specific values.
			//
			if( K.function.isObject( theParam ) )
			{
				//
				// Include only if provided.
				//
				if( theParam.hasOwnProperty( field ) )
					replace[ field ] = theParam[ field ];
			}
			
			//
			// Provided one value for all.
			//
			else
				replace[ field ] = theParam;
		}
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			replace											// Replace values.
		);
	
	}	// testResolveChangeLockedField
	
	/**
	 * Resolve changed significant fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * significant fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeSignificantField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Prepare replacement values.
		//
		const replace = {};
		for( const field of K.function.flatten(doc.significantFields) )
		{
			//
			// Provided specific values.
			//
			if( K.function.isObject( theParam ) )
			{
				//
				// Include only if provided.
				//
				if( theParam.hasOwnProperty( field ) )
					replace[ field ] = theParam[ field ];
			}
			
			//
			// Provided one value for all.
			//
			else
				replace[ field ] = theParam;
		}
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			replace											// Replace values.
		);
		
	}	// testResolveChangeSignificantField
	
	/**
	 * Resolve changed required fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * required fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeRequiredField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Prepare replacement values.
		//
		const replace = {};
		for( const field of doc.requiredFields )
		{
			//
			// Provided specific values.
			//
			if( K.function.isObject( theParam ) )
			{
				//
				// Include only if provided.
				//
				if( theParam.hasOwnProperty( field ) )
					replace[ field ] = theParam[ field ];
			}
			
			//
			// Provided one value for all.
			//
			else
				replace[ field ] = theParam;
		}
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			replace											// Replace values.
		);
		
	}	// testResolveChangeRequiredField
	
	/**
	 * Resolve changed unique fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * unique fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeUniqueField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Prepare replacement values.
		//
		const replace = {};
		for( const field of doc.uniqueFields )
		{
			//
			// Provided specific values.
			//
			if( K.function.isObject( theParam ) )
			{
				//
				// Include only if provided.
				//
				if( theParam.hasOwnProperty( field ) )
					replace[ field ] = theParam[ field ];
			}
			
			//
			// Provided one value for all.
			//
			else
				replace[ field ] = theParam;
		}
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			replace											// Replace values.
		);
		
	}	// testResolveChangeUniqueField
	
	/**
	 * Resolve changed local fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * local fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeLocalField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Prepare replacement values.
		//
		const replace = {};
		for( const field of doc.localFields )
		{
			//
			// Provided specific values.
			//
			if( K.function.isObject( theParam ) )
			{
				//
				// Include only if provided.
				//
				if( theParam.hasOwnProperty( field ) )
					replace[ field ] = theParam[ field ];
			}
			
			//
			// Provided one value for all.
			//
			else
				replace[ field ] = theParam;
		}
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			replace											// Replace values.
		);
		
	}	// testResolveChangeLocalField
	
	/**
	 * Resolve changed standard fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * standard fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeStandardField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Collect standard fields.
		//
		const fields = [];
		for( const field in doc.document )
		{
			if( (! doc.lockedFields.includes( field ))
			 && (! doc.significantFields.includes( field ))
			 && (! doc.requiredFields.includes( field ))
			 && (! doc.uniqueFields.includes( field ))
			 && (! doc.localFields.includes( field )) )
				fields.push( field );
		}
		
		//
		// Prepare replacement values.
		//
		const replace = {};
		for( const field of fields )
		{
			//
			// Provided specific values.
			//
			if( K.function.isObject( theParam ) )
			{
				//
				// Include only if provided.
				//
				if( theParam.hasOwnProperty( field ) )
					replace[ field ] = theParam[ field ];
			}
			
			//
			// Provided one value for all.
			//
			else
				replace[ field ] = theParam;
		}
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			replace											// Replace values.
		);
		
	}	// testResolveChangeStandardField
	
	
	/****************************************************************************
	 * REPLACE TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test replacing a non persistent object
	 *
	 * Assert that replacing a non persistent object fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testReplaceNonPersistent( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let message;
		let no_reserved;
		let reserved_values;
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		
		//
		// Clone and strip reserved fields from parameter.
		//
		reserved_values = {};
		const reserved_fields = doc.reservedFields;
		no_reserved = K.function.clone( theParam );
		for( const field of reserved_fields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate with content.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Replace.
		//
		message = "Replace";
		func = () => {
			result = doc.replaceDocument( true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/document is not persistent/
		);
		
	}	// testReplaceNonPersistent
	
	/**
	 * Test replacing a non existing object
	 *
	 * Assert that replacing a non existant object fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testReplaceNonExisting( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiation from existing reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Clone document.
		//
		const clone = K.function.clone(doc.document);
		
		//
		// Remove document.
		//
		message = "Removing existing document";
		func = () => {
			db._remove(doc.document._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Replace.
		//
		message = "Replace";
		func = () => {
			result = doc.replaceDocument( true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/not found in collection/
		);
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testReplaceNonExisting
	
	/**
	 * Test replacing persistent values
	 *
	 * Resolve document, update the value in the background and assert that replacing
	 * the document will fail when modifying locked fields and not for others.
	 *
	 * The parameter contains either null, or an array of fields to exclude from the test.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testReplacePersistentValue( theClass, theParam = null )
	{
		let tmp;
		let doc;
		let meta;
		let func;
		let result;
		let state;
		let status;
		let action;
		let message;
		let selector;
		const func_get = () => {
			tmp =
				db._collection(this.defaultTestCollection)
					.document(this.intermediate_results.key_insert_filled);
		};
		
		//
		// Normalise parameter.
		//
		const excluded = ( Array.isArray( theParam ) )
					   ? theParam
					   : [];
		
		//
		// Instantiate persistent document.
		//
		message = "Instantiate from reference";
		expect( func_get, `${message}` ).not.to.throw();
		
		//
		// Clone document and get needed fields.
		// We resolved an immutable document.
		//
		const replace = {};
		const clone = K.function.clone(tmp);
		
		//
		// Get fields and values to test.
		//
		for( const field in clone )
		{
			//
			// Select value from replace parameter.
			//
			if( this.parameters.replace.hasOwnProperty( field )
			 && (! [ '_id', '_key', '_rev' ].includes( field ))
			 && (! excluded.includes( field )) )
				replace[ field ] = this.parameters.replace[ field ];
		}
		
		//
		// Iterate replacement properties.
		//
		for( const field in replace )
		{
			//
			// Instantiate from existing reference.
			//
			message = "Resolve from reference";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						this.intermediate_results.key_insert_filled,
						this.defaultTestCollection,
						false
					);
			};
			expect( func, `${message}` ).not.to.throw();
			action = "Persistent";
			expect(doc.persistent, `${message} - ${action}`).to.equal(true);
			
			//
			// Set action.
			//
			if( doc.restrictedFields.includes( field ) )
			{
				status = 'R';
				state = `Restricted field [${field}]`;
			}
			else if( doc.lockedFields.includes( field ) )
			{
				status = 'L';
				state = `Locked field [${field}]`;
			}
			else if( K.function.flatten(doc.significantFields).includes( field ) )
			{
				status = 'S';
				state = `Significant field [${field}]`;
			}
			else if( doc.requiredFields.includes( field ) )
			{
				status = 'Q';
				state = `Required field [${field}]`;
			}
			else if( doc.uniqueFields.includes( field ) )
			{
				status = 'U';
				state = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				state = `Field [${field}]`;
			}
			action = state;
			
			//
			// Update field.
			//
			selector = {};
			selector[ field ] = replace[ field ];
			message = `Update persistent value`;
			func = () => {
				meta = db._collection(this.defaultTestCollection)
					.update(
						this.intermediate_results.key_insert_filled,
						selector,
						{waitForSync: true}
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Update revision.
			// Or it would always raise an exception.
			//
			if( doc.document._rev !== meta._rev )
				doc.document._rev = meta._rev;
			
			//
			// Replace.
			//
			message = "Replace";
			func = () => {
				result = doc.replaceDocument( true );
			};
			switch( status )
			{
				case 'R':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
					action = state + " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect( tmp, `${message} - ${action}` ).not.to.have.property( field );
					break;
				
				case 'L':
					expect( func, `${message}`
					).to.throw(
						MyError,
						/Constraint violation/
					);
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.false;
					break;
				
				case 'S':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
					break;
				
				case 'Q':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
					break;
				
				case 'U':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
					break;
				
				default:
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
					break;
			}
			
			//
			// Delete field.
			//
			selector = {};
			selector[ field ] = null;
			message = `Delete persistent value`;
			func = () => {
				meta = db._collection(this.defaultTestCollection)
					.update(
						this.intermediate_results.key_insert_filled,
						selector,
						{waitForSync: true, keepNull: false}
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Update revision.
			// Or it would always raise an exception.
			//
			if( doc.document._rev !== meta._rev )
				doc.document._rev = meta._rev;
			
			//
			// Replace.
			//
			message = "Replace";
			action = state;
			func = () => {
				result = doc.replaceDocument( true );
			};
			switch( status )
			{
				case 'R':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					break;
				
				case 'L':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
					break;
				
				case 'S':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
					break;
				
				case 'Q':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
					break;
				
				case 'U':
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
					break;
				
				default:
					expect( func, `${message} - ${action}` ).not.to.throw();
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							clone[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
					action += " is persistent";
					expect(doc.persistent, `${message} - ${action}`).to.equal(true);
					expect( func_get, "resolving persistent copy" ).not.to.throw();
					action = state + " matches persistent";
					expect(
						doc.matchPropertyValue(
							doc.document[ field ],
							tmp[ field ],
							field ),
						`${message} - ${action}` )
						.to.be.true;
					// expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
					break;
			}
			
		}	// Iterating document properties.
		
		//
		// Remove document.
		//
		message = "Remove";
		func = () => {
			db._remove(clone._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testReplacePersistentValue
	
	/**
	 * Test replacing content values
	 *
	 * Modify and delete document contents without using setDocumentProperties() and
	 * assert that when replacing the document errors are caught.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testReplaceContentValue( theClass, theParam = null )
	{
		let doc;
		let tmp;
		let meta;
		let func;
		let result;
		let state;
		let status;
		let action;
		let message;
		let selector;
		let no_reserved;
		let reserved_values;
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Get reserved fields.
		//
		const reserved = doc.reservedFields;
		
		//
		// Instantiate from existing reference.
		//
		const func_get = () => {
			tmp =
				db._collection(this.defaultTestCollection)
					.document(this.intermediate_results.key_insert_filled);
		};
		message = "Instantiate from reference";
		expect( func_get, `${message}` ).not.to.throw();
		
		//
		// Clone document.
		// We resolved an immutable document.
		//
		const clone = K.function.clone(tmp);
		
		//
		// Get excluded fields.
		//
		const excluded = ( Array.isArray( theParam ) ) ? theParam : [];
		
		//
		// Iterate document properties.
		//
		for( const field in clone )
		{
			//
			// Skip references, revision and excluded fields.
			//
			if( (field !== '_id')
			 && (field !== '_key')
			 && (field !== '_rev')
			 // && (field !== Dict.descriptor.kNID)
			 && (! excluded.includes( field )) )
			{
				//
				// Instantiate from existing reference.
				//
				message = "Resolve from reference";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							this.intermediate_results.key_insert_filled,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				action = "Persistent";
				expect(doc.persistent, `${message} - ${action}`).to.equal(true);
				
				//
				// Set action.
				//
				if( doc.restrictedFields.includes( field ) )
				{
					status = 'R';
					state = `Restricted field [${field}]`;
				}
				else if( doc.lockedFields.includes( field ) )
				{
					status = 'L';
					state = `Locked field [${field}]`;
				}
				else if( K.function.flatten(doc.significantFields).includes( field ) )
				{
					status = 'S';
					state = `Significant field [${field}]`;
				}
				else if( doc.requiredFields.includes( field ) )
				{
					status = 'Q';
					state = `Required field [${field}]`;
				}
				else if( doc.uniqueFields.includes( field ) )
				{
					status = 'U';
					state = `Unique field [${field}]`;
				}
				else
				{
					status = null;
					state = `Field [${field}]`;
				}
				action = state;
				
				//
				// Update field.
				//
				message = "Chenge value with setDocumentProperties()";
				selector = {};
				selector[ field ] = "1234";
				if( reserved.includes( field ) )
					func = () => {
						this.setReservedProperties( doc, selector );
					};
				else
					func = () => {
						doc.setDocumentProperties( selector, true );
					};

				//
				// Perform update.
				// Should only raise an exception for locked fields.
				//
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message}`
						).to.throw(
							MyError,
							/Property is locked/
						);
						expect( doc.document, `${message} - ${action}` ).to.have.property( field );
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
				}
				action = state;
				
				//
				// Update field changing contents.
				// Should only raise an exception for locked fields.
				//
				message = "Change value in contents";
				func = () => {
					doc.document[ field ] = "1234";
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'L':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
				}
				action = state;
				
				//
				// Replace.
				//
				message = "Replace changed value";
				func = () => {
					result = doc.replaceDocument( true );
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						action = state + " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( tmp, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message} - ${action}`
						).to.throw(
							MyError,
							/Constraint violation/
						);
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
				}
				action = state;
				
				//
				// Remove document.
				//
				message = "Remove";
				func = () => {
					db._remove(clone._id);
				};
				expect( func, `${message}` ).not.to.throw();
				
				//
				// Restore.
				//
				message = "Restore";
				func = () => {
					db._collection(this.defaultTestCollection).insert( clone );
				};
				expect( func, `${message}` ).not.to.throw();
				
				//
				// Instantiate from existing reference.
				//
				message = "Resolve from reference";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							this.intermediate_results.key_insert_filled,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				action = "Persistent";
				expect(doc.persistent, `${message} - ${action}`).to.equal(true);
				
				//
				// Update field.
				//
				message = "Delete value with setDocumentProperties()";
				selector = {};
				selector[ field ] = null;
				if( reserved.includes( field ) )
					func = () => {
						this.setReservedProperties( doc, selector );
					};
				else
					func = () => {
						doc.setDocumentProperties( selector, true );
					};
				
				//
				// Perform update.
				// Should only raise an exception for locked fields.
				//
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message}`
						).to.throw(
							MyError,
							/Property is locked/
						);
						expect( doc.document, `${message} - ${action}` ).to.have.property( field );
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
				}
				action = state;
				
				//
				// Delete field changing contents.
				// Should only raise an exception for locked fields.
				//
				message = "Delete value in contents";
				func = () => {
					delete doc.document[ field ];
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
				}
				action = state;
				
				//
				// Replace.
				//
				message = "Replace";
				func = () => {
					result = doc.replaceDocument( true );
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}`
						).to.throw(
							MyError,
							/missing required fields/
						);
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
				}
				action = state;
			
			}	// Not reference or revision.
			
		}	// Iterating document properties.
		
		//
		// Remove document.
		//
		message = "Remove";
		func = () => {
			db._remove(clone._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testReplaceContentValue
	
	
	/****************************************************************************
	 * REMOVE TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test removing an object
	 *
	 * Assert that removing an object succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testRemoveDocument( theClass, theParam = null )
	{
		let doc;
		let func;
		let clone;
		let result;
		let action;
		let message;
		let unconstrained;
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiate from reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Clone document.
		//
		clone = K.function.clone( doc.document );
		
		//
		// Remove with fail.
		//
		message = "Test remove constrained with fail flag on";
		func = () => {
			result = doc.removeDocument( true, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Result";
		expect(result, `${message} - ${action}`).to.equal(true);
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection)
				.insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiate from reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Remove without fail.
		//
		message = "Test remove constrained with fail flag off";
		func = () => {
			result = doc.removeDocument( true, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Result";
		expect(result, `${message} - ${action}`).to.equal(true);
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection)
				.insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testRemoveDocument
	
	/**
	 * Test removing a non persistent object
	 *
	 * Assert that removing a non persistent object raises with fail flag on or off.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testRemoveNonPersistent( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let message;
		let no_reserved;
		let reserved_values;
		
		//
		// Instantiate to get reserved fields.
		//
		message = "Instantiate to get reserved fields";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone and strip reserved fields from parameter.
		//
		reserved_values = {};
		const reserved_fields = doc.reservedFields;
		no_reserved = K.function.clone( theParam );
		for( const field of reserved_fields )
		{
			if( no_reserved.hasOwnProperty( field ) )
			{
				reserved_values[ field ] = no_reserved[ field ];
				delete no_reserved[ field ];
			}
		}
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					no_reserved,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set reserved fields.
		//
		this.setReservedProperties( doc, reserved_values );
		
		//
		// Remove.
		//
		message = "Remove with fail on";
		func = () => {
			result = doc.removeDocument( true, true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/document is not persistent/
		);
		
		//
		// Remove.
		//
		message = "Remove with fail off";
		func = () => {
			result = doc.removeDocument( true, false );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/document is not persistent/
		);
		
	}	// testRemoveNonPersistent
	
	/**
	 * Test removing a non existing object
	 *
	 * Assert that removing a non existing object raises with fail flag on and fails
	 * without raising with fail flag off.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testRemoveNonExisting( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiation from existing reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Clone document.
		//
		const clone = K.function.clone(doc.document);
		
		//
		// Remove document.
		//
		message = "Removing existing document";
		func = () => {
			db._remove(doc.document._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Remove with fail.
		//
		message = "Test remove non existing  with fail flag on";
		func = () => {
			result = doc.removeDocument( true, true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/not found in collection/
		);
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiation from existing reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Remove document.
		//
		message = "Removing existing document";
		func = () => {
			db._remove(doc.document._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Remove without fail.
		//
		message = "Test remove non existing  with fail flag off";
		func = () => {
			result = doc.removeDocument( true, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		action = "Result";
		expect(result, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testRemoveNonExisting
	
	/**
	 * Test removing a constrained object
	 *
	 * Assert that removing a constrained object raises with fail flag on or off.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testRemoveConstrained( theClass, theParam = null )
	{
		let doc;
		let func;
		let clone;
		let result;
		let action;
		let message;
		let unconstrained;
		
		//
		// Clone document.
		//
		message = "Cloning document";
		func = () => {
			clone =
				K.function.clone(
					db._collection(this.defaultTestCollection).document(
						this.intermediate_results.key_insert_same
					)
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set constrained state.
		//
		this.setDocumentConstrained( clone );
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiate from reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Get constrained status.
		//
		message = "Get constrained status";
		func = () => {
			unconstrained = doc.validateDocumentConstraints( false );
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Handle constrained.
		//
		if( unconstrained === false )
		{
			//
			// Remove with fail.
			//
			message = "Test remove constrained with fail flag on";
			func = () => {
				result = doc.removeDocument( true, true );
			};
			expect( func, `${message}`
			).to.throw(
				MyError,
				/has constraints that prevent it from being removed/
			);
			action = "Persistent";
			expect(doc.persistent, `${message} - ${action}`).to.equal(true);
			
			//
			// Remove without fail.
			//
			message = "Test remove constrained with fail flag off";
			func = () => {
				result = doc.removeDocument( true, false );
			};
			expect( func, `${message}`
			).to.throw(
				MyError,
				/has constraints that prevent it from being removed/
			);
			action = "Persistent";
			expect(doc.persistent, `${message} - ${action}`).to.equal(true);
			
		}	// Document is constrained.
		
		//
		// Remove document.
		//
		message = "Remove";
		func = () => {
			db._collection(this.defaultTestCollection)
				.remove(this.intermediate_results.key_insert_same);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection)
				.insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testRemoveConstrained
	
	
	/****************************************************************************
	 * COMMON TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Validate resolve changed contents
	 *
	 * This method expects a list of fields and for each field it will resolve the
	 * object, change the field in the background and resolve the object again: it
	 * expects the operation to fail, if the revision changed, or the field not to be
	 * changed if the revision is the same.
	 *
	 * Updates and test documents are expected to be found in the collection
	 * this.defaultTestCollection.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theReference	{String}	The test object _key.
	 * @param theReplace	{Object}	The list of fields to test.
	 */
	checkChangedContents( theClass, theReference, theReplace )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		let selector;
		let revision;
		
		//
		// Resolve document by reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theReference,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Assert document state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Save original contents and test fields list.
		//
		const original = K.function.clone( doc.document );
		
		//
		// Iterate by replace flag value.
		//
		for( const flag of [ false, true ] )
		{
			//
			// Iterate fields.
			//
			message = `Replace flag is ${flag}`;
			for( const field in theReplace )
			{
				//
				// Do test if the document has it.
				//
				if( doc.document.hasOwnProperty( field ) )
				{
					//
					// Resolve document by reference.
					//
					action = "Instantiate with reference";
					func = () => {
						doc =
							new theClass(
								this.parameters.request,
								theReference,
								this.defaultTestCollection
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Change field value.
					//
					action = `Change field [${field}] value`;
					selector = {};
					selector[ field ] = theReplace[ field ];
					func = () => {
						db._collection(this.defaultTestCollection)
							.update(
								theReference,
								selector,
								{waitForSync: true}
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Resolve document.
					//
					func = () => {
						result = doc.resolveDocument( flag, true );
					};
					
					//
					// Handle reference fields.
					//
					if( [ '_id', '_key' ].includes( field ) )
					{
						action = `Resolve with changed field [${field}]`;
						expect( func, `${message} - ${action}` ).not.to.throw();
						action = `Check field [${field}] value`;
						expect( doc.document[ field ], `${message} - ${action}` )
							.to.equal( original[ field ] );
					}
					
					//
					// Handle revision field.
					// We don't check for changes.
					//
					else if( field === '_rev' )
					{
						action = `Resolve with changed field [${field}]`;
						expect( func, `${message} - ${action}` ).not.to.throw();
						action = `Check field [${field}] value`;
					}
					
					//
					// Handle other persistent fields change.
					//
					else
					{
						action = `Catch persistent changed field [${field}]`;
						expect( func, `${message} - ${action}`
						).to.throw(
							MyError,
							/Ambiguous document reference/
						);
					}
					
					//
					// Check removing field if not reference.
					//
					if( (field !== '_id')
					 && (field !== '_key')
					 && (field !== '_rev') )
					{
						//
						// Restore field value.
						//
						action = `Restore field [${field}]`;
						selector = {};
						selector[ field ] = original[ field ];
						func = () => {
							db._collection(this.defaultTestCollection)
								.update(
									theReference,
									selector,
									{waitForSync: true}
								);
						};
						expect( func, `${message} - ${action}` ).not.to.throw();
						
						//
						// Resolve document by reference.
						//
						action = "Instantiate with reference";
						func = () => {
							doc =
								new theClass(
									this.parameters.request,
									theReference,
									this.defaultTestCollection
								);
						};
						expect( func, `${message} - ${action}` ).not.to.throw();
						
						//
						// Remove field.
						//
						action = `Remove field [${field}]`;
						selector = {};
						selector[ field ] = null;
						func = () => {
							db._collection(this.defaultTestCollection)
								.update(
									theReference,
									selector,
									{waitForSync: true, keepNull: false}
								);
						};
						expect( func, `${message} - ${action}` ).not.to.throw();
						
						//
						// Resolve document.
						//
						func = () => {
							result = doc.resolveDocument( flag, true );
						};
						
						//
						// Handle reference fields.
						//
						if( [ '_id', '_key', '_rev' ].includes( field ) )
						{
							action = `Resolve with changed field [${field}]`;
							expect( func, `${message} - ${action}` ).not.to.throw();
							action = `Check field [${field}] value`;
							expect( doc.document[ field ], `${message} - ${action}` )
								.to.equal( original[ field ] );
						}
						
						//
						// Handle other persistent fields change.
						//
						else
						{
							action = `Catch persistent changed field [${field}]`;
							expect( func, `${message} - ${action}`
							).to.throw(
								MyError,
								/Ambiguous document reference/
							);
						}
					
					}	// Not a reference field.
					
					//
					// Restore field value.
					//
					action = `Restore field [${field}]`;
					selector = {};
					selector[ field ] = original[ field ];
					func = () => {
						db._collection(this.defaultTestCollection)
							.update(
								theReference,
								selector,
								{waitForSync: true}
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
				}	// Document has property.
				
			}	// Iterating fields with replace flag off.
			
		}	// Iterating by replace flag value.
		
	}	// checkChangedContents
	
	/**
	 * Validate local properties
	 *
	 * This method can be used to validate the presence of local properties, it
	 * expects an array parameter, theExcluded, containing the list of excluded
	 * properties.
	 *
	 * The method will iterate through all local properties and assert the property is
	 * there and not empty. If the property is among the provided excluded properties,
	 * the method will assert that the property is not there.
	 *
	 * The theMessage parameter is used to provide the main error message part.
	 *
	 * @param theMessage	{String}	Main error message part.
	 * @param theObject		{Document}	The object to test.
	 * @param theExcluded	{Array}		List of excluded properties.
	 */
	checkLocalProperties( theMessage, theObject, theExcluded = [] )
	{
		let action;
		
		//
		// Iterate local fields.
		//
		for( const field of theObject.localFields )
		{
			//
			// Handle exclusions.
			//
			if( theExcluded.includes( field ) )
			{
				action = `Field [${field}] is not there`;
				expect( theObject.document, `${theMessage} - ${action}` ).not.to.have.property( field );
			}
			
			//
			// Handle inclusions.
			//
			else
			{
				action = `Field [${field}] exists`;
				expect( theObject.document, `${theMessage} - ${action}` ).to.have.property( field );
				action = `Field [${field}] is not empty`;
				expect( theObject.document[ field ], `${theMessage} - ${action}` ).not.to.be.empty;
			}
		}
		
	}	// checkLocalProperties
	
	
	/****************************************************************************
	 * STATIC TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test edge collection check
	 *
	 * Assert that it fails on document collection and succeeds on edge collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testStaticEdgeCollection( theClass, theParam = null )
	{
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter is object" ).to.be.an.object;
		expect( theParam, "Parameter has edge" ).to.have.property( 'edge' );
		expect( theParam, "Parameter has document" ).to.have.property( 'document' );
		expect( theParam, "Parameter has request" ).to.have.property( 'request' );
		
		//
		// Test with fail on.
		//
		message = "Test with fail on";
		action = "Edge collection";
		func = () => {
			result =
				theClass.isEdgeCollection(
					theParam.request,
					theParam.edge,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		action = "Document collection";
		func = () => {
			result =
				theClass.isEdgeCollection(
					theParam.request,
					theParam.document,
					true
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/to be an edge collection/
		);
		
		//
		// Test with fail off.
		//
		message = "Test with fail off";
		action = "Edge collection";
		func = () => {
			result =
				theClass.isEdgeCollection(
					theParam.request,
					theParam.edge,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		action = "Document collection";
		func = () => {
			result =
				theClass.isEdgeCollection(
					theParam.request,
					theParam.document,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.false;
		
	}	// testStaticEdgeCollection
	
	/**
	 * Test document collection check
	 *
	 * Assert that it fails on edge collection and succeeds on document collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testStaticDocumentCollection( theClass, theParam = null )
	{
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter is object" ).to.be.an.object;
		expect( theParam, "Parameter has edge" ).to.have.property( 'edge' );
		expect( theParam, "Parameter has document" ).to.have.property( 'document' );
		expect( theParam, "Parameter has request" ).to.have.property( 'request' );
		
		//
		// Test with fail on.
		//
		message = "Test with fail on";
		action = "Edge collection";
		func = () => {
			result =
				theClass.isDocumentCollection(
					theParam.request,
					theParam.edge,
					true
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/to be a document collection/
		);
		
		action = "Document collection";
		func = () => {
			result =
				theClass.isDocumentCollection(
					theParam.request,
					theParam.document,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		//
		// Test with fail off.
		//
		message = "Test with fail off";
		action = "Edge collection";
		func = () => {
			result =
				theClass.isDocumentCollection(
					theParam.request,
					theParam.edge,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.false;
		
		action = "Document collection";
		func = () => {
			result =
				theClass.isDocumentCollection(
					theParam.request,
					theParam.document,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
	}	// testStaticDocumentCollection
	
	
	/****************************************************************************
	 * MANIPULATION UTILITIES													*
	 ****************************************************************************/
	
	/**
	 * Set reserved fields.
	 *
	 * This method can be used to set reserved fields in the document, by default it
	 * will set the values directly in the document data, but derived classes should
	 * overload this method to use whatever custom interface they implement.
	 *
	 * @param theObject		{Document}	The object to manipulate.
	 * @param theProperties	{Object}	The reserved properties.
	 */
	setReservedProperties(
		theObject,		// The object to manipulate.
		theProperties	// The values to set.
	)
	{
		//
		// Iterate provided properties.
		//
		for( const field in theProperties )
			theObject.document[ field ] = theProperties[ field ];
		
	}	// setReservedProperties
	
	/**
	 * Constrain document.
	 *
	 * This method can be used to make a document constrained.
	 *
	 * In this class we implement the validateDocumentConstraints() by checking if the
	 * name property is "CONSTRAINED".
	 *
	 * @param theObject		{Object}	The document to constrain.
	 */
	setDocumentConstrained( theObject )
	{
		//
		// Set the name to "CONSTRAINED" in the database.
		//
		const message = "Setting constrained state";
		expect( () => {
			db._collection(this.defaultTestCollection).update(
				theObject._key,
				{ name: "CONSTRAINED" }
			);
		}, message ).not.to.throw();
		
	}	// setDocumentConstrained
	
	
	/****************************************************************************
	 * VALIDATION UTILITIES														*
	 ****************************************************************************/
	
	/**
	 * Validate the contents after inserting.
	 *
	 * This method can be used to assert that the provided contents can be found in
	 * the document, except for restricted properties.
	 *
	 * It will iterate through theNewData properties and compare the values of the
	 * updated object with the provided data and asserting that the object contains
	 * all provided data elements, except for restricted properties.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theMessage	{String}	The main error message part.
	 * @param theObject		{Document}	The tested class instance.
	 * @param theContents	{Object}	The data used for instantiation.
	 */
	assertAllProvidedDataInDocument(
		theMessage,		// Error message.
		theObject,		// The document object.
		theContents		// The instantiation contents data.
	)
	{
		//
		// Init local storage.
		//
		let status;
		let action;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
		//
		for( const field in theContents )
		{
			//
			// Set action.
			// Note: order is important:
			//
			// 1.) Restricted.
			// 2.) Locked.
			// 3.) Significant.
			// 4.) Required.
			// 5.) Unique.
			//
			if( theObject.restrictedFields.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( theObject.lockedFields.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( theObject.requiredFields.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( theObject.uniqueFields.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Handle provided value and not restricted.
			//
			if( (status !== 'R')					// Restricted field,
			 && (theContents[ field ] !== null) )	// or deleted field.
			{
				//
				// Adjust action.
				//
				action += ' set';
				
				//
				// Assert field is there.
				//
				expect( theObject.document, `${theMessage} - ${action}` ).to.have.property(field);
				if( theObject.document.hasOwnProperty( field ) )
				{
					//
					// Parse by descriptor status.
					//
					switch( status )
					{
						//
						// Locked fields are set.
						//
						case 'L':
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Significant fields are set.
						//
						case 'S':
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Required fields are set.
						//
						case 'Q':
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Unique fields are set.
						//
						case 'U':
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// All other fields are set.
						//
						default:
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
					}	// Parsing by descriptor status.
					
				}	// Has field.
				
			}	// Neither restricted nor deleted.
			
			//
			// Handle restricted or deleted fields.
			// Should not have been set, or should have been deleted.
			//
			else
			{
				//
				// Update action.
				//
				if( theContents[ field ] !== null )
					action += " deleted";
				
				//
				// Assert property is not there.
				//
				expect( theObject.document, `${theMessage} - ${action}` )
					.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replace properties.
		
	}	// assertAllProvidedDataInDocument
	
	/**
	 * Validate replacing data in persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theMessage	{String}	The main error message part.
	 * @param theFlag		{Boolean}	The setDocumentProperties() replace flag.
	 * @param theObject		{Document}	The tested class instance.
	 * @param theNewData	{Object}	The data used for replace.
	 */
	validatePersistentReplace(
		theMessage,		// Error message.
		theFlag,		// Replace flag.
		theObject,		// The document object.
		theNewData		// The replacement data.
	)
	{
		//
		// Init local storage.
		//
		let op;
		let func;
		let failed;
		let action;
		let replace;
		
		//
		// Assert the provided object is persistent.
		//
		expect(
			theObject.persistent,
			"validatePersistentReplace() theObject parameter persistent flag"
		).to.be.true;
		
		//
		// Clone existing and new data.
		// We clone new data, because if the replace raises an exception, we must
		// replace the replaced value with the original one, since the exception would
		// have prevented the replace.
		//
		const oldData = JSON.parse(JSON.stringify(theObject.document));
		const newData = JSON.parse(JSON.stringify(theNewData));
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
		// Note: order is important:
		//
		// 0.) Reserved.
		// 1.) Restricted.
		// 2.) Locked.
		// 3.) Significant.
		// 4.) Required.
		// 5.) Unique.
		//
		for( const field in newData )
		{
			//
			// Reset failed flag.
			//
			failed = false;
			
			//
			// Set operation.
			//
			op = ( newData[ field ] === null ) ? 'Delete' : 'Replace';
			op = ( theObject.document.hasOwnProperty( field ) )
				 ? `${op} existing`
				 : `${op} missing`;
			
			//
			// Replace field function.
			//
			replace = {};
			replace[ field ] = newData[ field ];
			func = () => {
				theObject.setDocumentProperties(
					replace,
					theFlag
				);
			};
			
			//
			// Set changed flag.
			//
			const different =
				theObject.matchPropertyValue(
					theObject.document[ field ],
					replace[ field ],
					field
				);
			
			//
			// Set considered flag.
			// This flag tests the conditions that are needed to have
			// setDocumentProperties() call setDocumentProperty().
			//
			const considered = theObject.willPropertySet( field, theFlag );
			
			//
			// Replace reserved or locked field:
			// 	- If locked it will always raise an exception.
			// 	- If reserved:
			//		- If the flag is on, it raises an exception.
			//		- If flag is off, it doesn't.
			//
			if( theObject.lockedFields.includes( field )
			 || theObject.reservedFields.includes( field ) )
			{
				//
				// Set type.
				//
				let type;
				if( theObject.lockedFields.includes( field )
				 && theObject.reservedFields.includes( field ) )
					type = `locked and reserved field [${field}]`;
				else if( theObject.lockedFields.includes( field ) )
					type = `locked field [${field}]`;
				else
					type = `reserved field [${field}]`;
				
				//
				// Handle locked.
				//
				if( theObject.lockedFields.includes( field ) )
				{
					failed = true;
					action = `${op} ${type}`;
					expect( func, `${theMessage} - ${action}`
					).to.throw(
						MyError,
						/Property is locked/
					);
				}
				
				//
				// Handle reserved field.
				//
				else
				{
					//
					// Handle replace flag on.
					//
					if( theFlag )
					{
						failed = true;
						action = `${op} different ${type}`;
						expect( func, `${theMessage} - ${action}`
						).to.throw(
							MyError,
							/is reserved and cannot be modified/
						);
					}
					
					//
					// Handle replace flag off.
					//
					else
					{
						action = `${op} same ${type}`;
						expect( func, `${theMessage} - ${action}`).not.to.throw();
					}
				}
			
			}	// Reserved or locked.
			
			//
			// Replace restricted field.
			//
			else if( theObject.restrictedFields.includes( field ) )
			{
				action = `${op} restricted [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace significant field.
			//
			else if( significant.includes( field ) )
			{
				action = `${op} significant [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace required field.
			//
			else if( theObject.requiredFields.includes( field ) )
			{
				action = `${op} required [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace unique field.
			//
			else if( theObject.uniqueFields.includes( field ) )
			{
				action = `${op} unique [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace field.
			//
			else
			{
				action = `${op} [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
		}	// Iterating replace properties.
		
		//
		// Check contents.
		//
		if( ! failed )
			this.validatePersistentContents
			(
				theFlag,						// Replace flag.
				theMessage,						// Error message.
				oldData,						// Data before replace.
				theObject.document,				// The object to test.
				replace,						// The replacement data.
				theObject.restrictedFields,		// Restricted fields.
				theObject.requiredFields,		// Required fields.
				theObject.lockedFields,			// Locked fields.
				theObject.uniqueFields,			// Unique fields.
				theObject.significantFields		// Significant fields.
			);
		
	}	// validatePersistentReplace
	
	/**
	 * Validate replacing data in non persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theMessage	{String}	The main error message part.
	 * @param theFlag		{Boolean}	The setDocumentProperties() replace flag.
	 * @param theObject		{Document}	The tested class instance.
	 * @param theNewData	{Object}	The data used for replace.
	 */
	validateNonPersistentReplace(
		theMessage,		// Error message.
		theFlag,		// Replace flag.
		theObject,		// The document object.
		theNewData		// The replacement data.
	)
	{
		//
		// Init local storage.
		//
		let op;
		let func;
		let action;
		let replace;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
		// Note: order is important:
		//
		// 0.) Reserved.
		// 1.) Restricted.
		// 2.) Locked.
		// 3.) Significant.
		// 4.) Required.
		// 5.) Unique.
		//
		for( const field in theNewData )
		{
			//
			// Set operation.
			//
			op = ( theNewData[ field ] === null ) ? 'Delete' : 'Replace';
			op = ( theObject.document.hasOwnProperty( field ) )
				 ? `${op} existing`
				 : `${op} missing`;
			
			//
			// Replace field function.
			//
			replace = {};
			replace[ field ] = theNewData[ field ];
			func = () => {
				theObject.setDocumentProperties(
					replace,
					theFlag
				);
			};
			
			//
			// Set changed flag.
			//
			const different =
				( ( (theNewData[field] === null)	// Deleting and there.
				 && theObject.document.hasOwnProperty(field) )
			   || ( (theNewData[field] !== null)	// Setting and not there
			     && (! theObject.document.hasOwnProperty(field)) )
			   || ( (theNewData[field] !== null) 	// Setting and different.
				 && theObject.document.hasOwnProperty(field)
			     && (theNewData[field] !== theObject.document[field]) ) );
			
			//
			// Replace reserved field.
			// Should fail.
			//
			if( theObject.reservedFields.includes( field ) )
			{
				//
				// Catch changed field.
				//
				if( different )
				{
					action = `${op} different reserved [${field}]`;
					expect( func, `${theMessage} - ${action}`
					).to.throw(
						MyError,
						/is reserved and cannot be modified/
					);
				}
				else
				{
					action = `${op} same reserved [${field}]`;
					expect( func, `${theMessage} - ${action}`).not.to.throw();
				}
			}
			
			//
			// Replace other types of fields.
			//
			else
			{
				//
				// Save original document contents.
				//
				const theOldData = K.function.clone( theObject.document );
				
				//
				// Replace restricted field.
				// Should succeed.
				//
				if( theObject.restrictedFields.includes( field ) )
				{
					action = `${op} restricted [${field}]`;
					expect( func, `${theMessage} - ${action}`).not.to.throw();
				}
				
				//
				// Replace locked field.
				// Should succeed.
				//
				else if( theObject.lockedFields.includes( field ) )
				{
					action = `${op} unique [${field}]`;
					expect( func, `${theMessage} - ${action}`).not.to.throw();
				}
				
				//
				// Replace significant field.
				// Should succeed.
				//
				else if( significant.includes( field ) )
				{
					action = `${op} significant [${field}]`;
					expect( func, `${theMessage} - ${action}`).not.to.throw();
				}
				
				//
				// Replace required field.
				// Should succeed.
				//
				else if( theObject.requiredFields.includes( field ) )
				{
					action = `${op} required [${field}]`;
					expect( func, `${theMessage} - ${action}`).not.to.throw();
				}
				
				//
				// Replace unique field.
				// Should succeed.
				//
				else if( theObject.uniqueFields.includes( field ) )
				{
					action = `${op} unique [${field}]`;
					expect( func, `${theMessage} - ${action}`).not.to.throw();
				}
				
				//
				// Replace field.
				// Should succeed.
				//
				else
				{
					action = `${op} [${field}]`;
					expect( func, `${theMessage} - ${action}`).not.to.throw();
				}
				
				//
				// Check contents.
				//
				this.validateNonPersistentContents
				(
					theFlag,								// Replace flag.
					theMessage,								// Error message.
					theOldData,								// Data before replace.
					theObject.document,						// The object to test.
					replace,								// The replacement data.
					theObject.restrictedFields,				// Restricted fields.
					theObject.requiredFields,				// Required fields.
					theObject.lockedFields,					// Locked fields.
					theObject.uniqueFields,					// Unique fields.
					theObject.significantFields				// Significant fields.
				);
			
			}	// Not a reserved field.
			
		}	// Iterating replace properties.
		
	}	// validateNonPersistentReplace
	
	/**
	 * Validate replaced data contents in persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theFlag			{Boolean}	The setDocumentProperties() replace flag.
	 * @param theMessage		{String}	The main error message part.
	 * @param theSource			{Object}	The original object.
	 * @param theDestination	{Object}	The replaced object.
	 * @param theReplaced		{Object}	The replacement data.
	 * @param theRestricted		{Array}		List of restricted fields.
	 * @param theRequired		{Array}		List of required fields.
	 * @param theLocked			{Array}		List of locked fields.
	 * @param theUnique			{Array}		List of unique fields.
	 * @param theSignificant	{Array}		List of significant fields.
	 */
	validatePersistentContents(
		theFlag,				// Replace flag.
		theMessage,				// Error message.
		theSource,				// Data before replace.
		theDestination,			// The object to test.
		theReplaced,			// The replacement data.
		theRestricted = [],		// Restricted fields.
		theRequired = [],		// Required fields.
		theLocked = [],			// Locked fields.
		theUnique = [],			// Unique fields.
		theSignificant = []		// Significant fields.
	)
	{
		let status;
		let action;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theSignificant.length > 0 )
			significant = K.function.flatten(theSignificant);
		
		//
		// Iterate provided replacement properties.
		// Note: order is important:
		//
		// 1.) Restricted.
		// 2.) Locked.
		// 3.) Significant.
		// 4.) Required.
		// 5.) Unique.
		//
		for( const field in theReplaced )
		{
			//
			// Set action.
			//
			if( theRestricted.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( theLocked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( theRequired.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( theUnique.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Handle provided value and not restricted.
			//
			if( (status !== 'R')					// Restricted field,
			 && (theReplaced[ field ] !== null) )	// or deleted field.
			{
				//
				// Assert field is there.
				//
				expect( theDestination, `${theMessage} - ${action}` ).to.have.property(field);
				if( theDestination.hasOwnProperty( field ) )
				{
					//
					// Check if setting or replacing.
					//
					const was_there = ( theSource.hasOwnProperty( field ) );
					
					//
					// Handle true replace flag.
					//
					if( theFlag )
					{
						//
						// Parse by descriptor status.
						// Note: order is important:
						//
						// 1.) Restricted.
						// 2.) Locked.
						// 3.) Significant.
						// 4.) Required.
						// 5.) Unique.
						//
						switch( status )
						{
							//
							// Locked fields cannot be replaced,
							// An exception will be thrown when replacing.
							//
							case 'L':
								this.compareValues(
									theSource[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are replaced.
							//
							case 'S':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are replaced.
							//
							case 'Q':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are replaced.
							//
							case 'U':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are replaced.
							//
							default:
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is true.
					
					//
					// Handle false replace flag.
					// Note: order is important:
					//
					// 1.) Restricted.
					// 2.) Locked.
					// 3.) Significant.
					// 4.) Required.
					// 5.) Unique.
					//
					else
					{
						//
						// Parse by descriptor status.
						//
						switch( status )
						{
							//
							// Locked fields cannot be replaced,
							// An exception will be thrown when replacing.
							//
							case 'L':
								this.compareValues(
									theSource[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are not replaced.
							//
							case 'S':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are not replaced.
							//
							case 'Q':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are not replaced.
							//
							case 'U':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are not replaced.
							//
							default:
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is false.
					
				}	// Has field.
				
			}	// Neither restricted nor deleted.
			
			//
			// Handle restricted or deleted fields.
			// Should not have been set, or should have been deleted.
			//
			else
			{
				//
				// Update action.
				//
				if( theReplaced[ field ] !== null )
					action += " deleted";
				
				//
				// Assert property is not there.
				// Note that locked properties cannot be modified.
				//
				if( theFlag				// Replace flag set
				 && (status !== 'L') )	// and property not locked.
					expect( theDestination, `${theMessage} - ${action}` )
						.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replaced properties.
		
	}	// validatePersistentContents
	
	/**
	 * Validate replaced data contents in non persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * Note: This method should not be called when replacing reserved fields, because the
	 * 		 operation should fail.
	 *
	 * @param theFlag			{Boolean}	The setDocumentProperties() replace flag.
	 * @param theMessage		{String}	The main error message part.
	 * @param theSource			{Object}	The original object.
	 * @param theDestination	{Object}	The replaced object.
	 * @param theReplaced		{Object}	The replacement data.
	 * @param theRestricted		{Array}		List of restricted fields.
	 * @param theRequired		{Array}		List of required fields.
	 * @param theLocked			{Array}		List of locked fields.
	 * @param theUnique			{Array}		List of unique fields.
	 * @param theSignificant	{Array}		List of significant fields.
	 */
	validateNonPersistentContents(
		theFlag,				// Replace flag.
		theMessage,				// Error message.
		theSource,				// Data before replace.
		theDestination,			// The object to test.
		theReplaced,			// The replacement data.
		theRestricted = [],		// Restricted fields.
		theRequired = [],		// Required fields.
		theLocked = [],			// Locked fields.
		theUnique = [],			// Unique fields.
		theSignificant = []		// Significant fields.
	)
	{
		let status;
		let action;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theSignificant.length > 0 )
			significant = K.function.flatten(theSignificant);
		
		//
		// Iterate provided replacement properties.
		// Note: order is important:
		//
		// 1.) Restricted.
		// 2.) Locked.
		// 3.) Significant.
		// 4.) Required.
		// 5.) Unique.
		//
		for( const field in theReplaced )
		{
			//
			// Set action.
			//
			if( theRestricted.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( theLocked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( theRequired.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( theUnique.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Save property prior presence flag.
			//
			const was_there = ( theSource.hasOwnProperty( field ) );
			
			//
			// Handle provided value and not restricted.
			//
			if( (status !== 'R')					// Restricted field,
			 && (theReplaced[ field ] !== null) )	// or deleted field.
			{
				//
				// Assert the field was set.
				// Conditions:
				//	- Replace flag is true,
				//	- or the property is locked,
				//	- or the property was not there.
				//
				// Replace flag is true or if property was not there it was set.
				//
				expect( theDestination, `${theMessage} - ${action} should be there` )
					.to.have.property( field );
				
				//
				// Handle true replace flag.
				//
				if( theFlag )
				{
					//
					// Parse by descriptor status.
					// Note: order is important:
					//
					// 1.) Restricted.
					// 2.) Locked.
					// 3.) Significant.
					// 4.) Required.
					// 5.) Unique.
					//
					switch( status )
					{
						//
						// Locked fields are replaced,
						//
						case 'L':
							this.compareValues(
								( was_there ) ? theReplaced[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Significant fields are replaced.
						//
						case 'S':
							this.compareValues(
								( was_there ) ? theReplaced[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Required fields are replaced.
						//
						case 'Q':
							this.compareValues(
								( was_there ) ? theReplaced[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Unique fields are replaced.
						//
						case 'U':
							this.compareValues(
								( was_there ) ? theReplaced[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// All other fields are replaced.
						//
						default:
							this.compareValues(
								( was_there ) ? theReplaced[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
					}	// Parsing by descriptor status.
					
				}	// Replace flag is true.
				
				//
				// Handle false replace flag.
				//
				else
				{
					//
					// Parse by descriptor status.
					// Note: order is important:
					//
					// 1.) Restricted.
					// 2.) Locked.
					// 3.) Significant.
					// 4.) Required.
					// 5.) Unique.
					//
					switch( status )
					{
						//
						// Locked fields are replaced in all cases.
						//
						case 'L':
							this.compareValues(
								theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Significant fields are replaced.
						//
						case 'S':
							this.compareValues(
								( was_there ) ? theSource[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Required fields are replaced.
						//
						case 'Q':
							this.compareValues(
								( was_there ) ? theSource[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Unique fields are replaced.
						//
						case 'U':
							this.compareValues(
								( was_there ) ? theSource[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// All other fields are replaced.
						//
						default:
							this.compareValues(
								( was_there ) ? theSource[ field ]
											  : theReplaced[ field ],
								theDestination[ field ],
								theMessage,
								action
							);
							break;
						
					}	// Parsing by descriptor status.
					
				}	// Replace flag is false.
				
			}	// Neither restricted nor deleted.
			
			//
			// Handle restricted or deleted fields.
			// Should not have been set, or should have been deleted.
			//
			else
			{
				//
				// Update action.
				//
				if( theReplaced[ field ] === null )
					action += " deleted";
				
				//
				// Assert property is not there,
				// only if the flag is true.
				//
				if( theFlag )
					expect( theDestination, `${theMessage} - ${action}` )
						.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replaced properties.
		
	}	// validateNonPersistentContents
	
	/**
	 * Validate replaced data contents in non persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theFlag			{Boolean}	The setDocumentProperties() replace flag.
	 * @param theMessage		{String}	The main error message part.
	 * @param theObject			{Document}	The resolved object.
	 * @param thePersistent		{Object}	The persistent contents.
	 * @param theSelection		{Object}	The selection contents.
	 */
	validateResolvedContents(
		theFlag,				// Replace flag.
		theMessage,				// Error message.
		theObject,				// The object to test.
		thePersistent,			// The persistent contents.
		theSelection			// The selection contents.
	)
	{
		let status;
		let action;
		
		//
		// Save document special fields.
		//
		const local = theObject.localFields;
		const locked = theObject.lockedFields;
		const unique = theObject.uniqueFields;
		const required = theObject.requiredFields;
		const restricted = theObject.restrictedFields;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Iterate object properties.
		// Note: order is important:
		//
		// 1.) Restricted.
		// 2.) Local.
		// 3.) Locked.
		// 4.) Significant.
		// 5.) Required.
		// 6.) Unique.
		//
		for( const field in theObject.document )
		{
			//
			// Set action.
			//
			if( restricted.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( local.includes( field ) )
			{
				status = 'C';
				action = `Local field [${field}]`;
			}
			else if( locked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( required.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( unique.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Check if there.
			//
			const in_selection = ( theSelection.hasOwnProperty( field ) );
			const in_persistent = ( thePersistent.hasOwnProperty( field ) );
			
			//
			// Parse by field type.
			// Note: order is important:
			//
			// 1.) Restricted.
			// 2.) Local.
			// 3.) Locked.
			// 4.) Significant.
			// 5.) Required.
			// 6.) Unique.
			//
			switch( status )
			{
				//
				// Handle restricted.
				// Should not be there.
				//
				case 'R':
					expect( theObject, `${theMessage} - ${action}` )
						.not.to.have.property( field );
					break;
				
				//
				// Handle local.
				// Always match persistent data.
				//
				case 'C':
					if( in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle locked.
				// Locked fields must match the persistent copy.
				//
				case 'L':
					if( in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle significant.
				// If flag is off, match selector contents;
				// if flag is on, match persistent data.
				//
				case 'S':
					if( theFlag
					 && in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					else if( (! theFlag)
					 && in_selection )
						this.compareValues(
							theObject.document[ field ],
							theSelection[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle required.
				// If flag is off, match selector contents;
				// if flag is on, match persistent data.
				//
				case 'Q':
					if( theFlag
					 && in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					else if( (! theFlag)
						  && in_selection )
						this.compareValues(
							theObject.document[ field ],
							theSelection[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle unique.
				// If flag is off, match selector contents;
				// if flag is on, match persistent data.
				//
				case 'U':
					if( theFlag
						&& in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					else if( (! theFlag)
						  && in_selection )
						this.compareValues(
							theObject.document[ field ],
							theSelection[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle other.
				// If flag is off, match selector contents;
				// if flag is on, match persistent data.
				//
				default:
					if( theFlag
					 && in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					else if( (! theFlag)
						  && in_selection )
						this.compareValues(
							theObject.document[ field ],
							theSelection[ field ],
							theMessage,
							action
						);
					break;
				
			}	// Parsing property type.
			
		}	// Iterating object properties.
		
	}	// validateResolvedContents
	
	
	/****************************************************************************
	 * TEST UNIT SUITES INTERFACE												*
	 ****************************************************************************/
	
	/**
	 * Set instantiation unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	instantiationUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_instantiation', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get instantiation unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	instantiationUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_instantiation', theUnit );						// ==>
	}
	
	/**
	 * Delete instantiation unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	instantiationUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_instantiation', theUnit );						// ==>
	}
	
	/**
	 * Set contents unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	contentsUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_contents', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get contents unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	contentsUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_contents', theUnit );							// ==>
	}
	
	/**
	 * Delete contents unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	contentsUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_contents', theUnit );							// ==>
	}
	
	/**
	 * Set insert unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	insertUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_insert', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get insert unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	insertUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_insert', theUnit );							// ==>
	}
	
	/**
	 * Delete insert unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	insertUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_insert', theUnit );							// ==>
	}
	
	/**
	 * Set resolve unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	resolveUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_resolve', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get resolve unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	resolveUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_resolve', theUnit );							// ==>
	}
	
	/**
	 * Delete resolve unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	resolveUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_resolve', theUnit );							// ==>
	}
	
	/**
	 * Set replace unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	replaceUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_replace', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get replace unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	replaceUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_replace', theUnit );							// ==>
	}
	
	/**
	 * Delete replace unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	replaceUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_replace', theUnit );							// ==>
	}
	
	/**
	 * Set remove unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	removeUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_remove', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get remove unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	removeUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_remove', theUnit );							// ==>
	}
	
	/**
	 * Delete remove unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	removeUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_remove', theUnit );							// ==>
	}
	
	/**
	 * Set custom unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	customUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_custom', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get custom unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	customUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_custom', theUnit );							// ==>
	}
	
	/**
	 * Delete custom unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	customUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_custom', theUnit );							// ==>
	}
	
	/**
	 * Set static unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	staticUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_static', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get static unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	staticUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_static', theUnit );							// ==>
	}
	
	/**
	 * Delete static unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	staticUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_static', theUnit );							// ==>
	}
	
	
	/****************************************************************************
	 * MEMBER GETTERS															*
	 ****************************************************************************/
	
	/**
	 * Return default test collection.
	 *
	 * @return {String}
	 */
	get defaultTestCollection()	{	return this.parameters.collection_document;	}
	
}	// DocumentUnitTest.

/**
 * Module exports
 */
module.exports = DocumentUnitTest;
