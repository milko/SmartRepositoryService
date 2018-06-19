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
const param = require( '../parameters/Document' );

//
// Test classes.
//
const TestClass = require( './DocumentUnitTestClass' ).base;
const TestClassCustom = require( './DocumentUnitTestClass' ).custom;

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
	 * This method will load the contents tests queue with the desired test
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
	 */
	unitsInitInsert()
	{
		//
		// Insert empty object.
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
		//
		this.insertUnitSet(
			'insertPersistentObject',
			"Insert persistent object",
			TestClass,
			null,
			true
		);
		
	}	// unitsInitInsert
	
	
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
		this.testInstantiateNoSelectorNoCollection( TestClass );
		
		//
		// Should succeed, because the custom class implements default collection.
		//
		if( TestClassCustom !== null )
			this.testInstantiateNoSelectorNoCollection( TestClassCustom );
		
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
		this.testInstantiateNullSelectorNoCollection( TestClass, theParam );
		
		//
		// Should succeed with custom class: it implements the default collection.
		//
		if( TestClassCustom !== null )
			this.testInstantiateNullSelectorNoCollection(
				TestClassCustom, theParam
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
		// Init local storage.
		//
		const test_collection = 'test';
		
		//
		// Remove test collection.
		//
		const collection = db._collection( test_collection );
		if( collection )
			db._drop( test_collection );
		
		//
		// Should fail with both classes.
		//
		this.testInstantiateNullSelectorMissingCollection(
			TestClass, test_collection
		);
		this.testInstantiateNullSelectorMissingCollection(
			TestClassCustom, test_collection
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
		this.testDefaultCollection( TestClass, theParam );
		
		//
		// Test class with default collection.
		//
		if( TestClassCustom !== null )
			this.testDefaultCollection( TestClassCustom, theParam );
		
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
		this.testInstantiateEdgeSucceed( TestClass, theParam );
		
		//
		// Should fail.
		//
		if( TestClassCustom !== null )
			this.testInstantiateEdgeFail(
				TestClassCustom, theParam
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
		this.testInstantiateDocumentSucceed( TestClass, theParam );
		
		//
		// Should succeed.
		//
		if( TestClassCustom !== null )
			this.testInstantiateDocumentSucceed(
				TestClassCustom, theParam
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
		this.testInstantiateMutableImmutable( TestClass, theParam );
		
		//
		// Should succeed.
		//
		if( TestClassCustom !== null )
			this.testInstantiateMutableImmutable(
				TestClassCustom, theParam
			);
		
	}	// instantiateMutableImmutableDocument
	
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
		this.testInstantiateInvalidIdNoDefaultCollection( TestClass, theParam );
		
		//
		// Should fail.
		//
		if( TestClassCustom !== null )
			this.testInstantiateInvalidIdDefaultCollection(
				TestClassCustom, theParam
			);
		
	}	// instantiateInvalidReferenceId
	
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
		this.testInstantiateCrossCollectionReferenceProvidedCollection(
			TestClass, theParam
		);
		
		//
		// Should fail.
		//
		if( TestClassCustom !== null )
			this.testInstantiateCrossCollectionReferenceDefaultCollection(
				TestClassCustom, theParam
			);
		
	}	// instantiateCrossCollectionReference
	
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
		this.testInstantiateNotFoundIdReferenceProvidedCollection(
			TestClass, theParam
		);
		
		//
		// Should fail.
		//
		if( TestClassCustom !== null )
			this.testInstantiateNotFoundIdReferenceDefaultCollection(
				TestClassCustom, theParam
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
		this.testInstantiateFoundReferenceProvidedCollection(
			TestClass, theParam
		);
		
		//
		// Should fail.
		//
		if( TestClassCustom !== null )
			this.testInstantiateFoundReferenceDefaultCollection(
				TestClassCustom, theParam
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
		this.testInstantiateWithContentProvidedCollection(
			TestClass, theParam
		);
		
		//
		// Should fail.
		//
		if( TestClassCustom !== null )
			this.testInstantiateWithContentDefaultCollection(
				TestClassCustom, theParam
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
		this.testContentsLoadEmptyObject( TestClass, theParam );
		
		//
		// Should succeed.
		//
		if( TestClassCustom !== null )
			this.testContentsLoadEmptyObject( TestClassCustom, theParam );
		
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
		this.testContentsLoadFilledObject( TestClass, theParam );
		
		//
		// Should succeed.
		//
		if( TestClassCustom !== null )
			this.testContentsLoadFilledObject( TestClassCustom, theParam );
		
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
		this.testContentsLoadPersistentObject( TestClass, theParam );
		
		//
		// Should succeed.
		//
		if( TestClassCustom !== null )
			this.testContentsLoadPersistentObject( TestClassCustom, theParam );
		
	}	// contentsLoadPersistentObject
	
	
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
		this.testInsertEmptyObject( TestClass );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( TestClassCustom !== null )
			this.testInsertEmptyObject( TestClassCustom );
		
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
		this.testInsertWithoutRequiredFields( TestClass, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( TestClassCustom !== null )
			this.testInsertWithoutRequiredFields( TestClassCustom, theParam );
		
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
		this.testInsertWithoutSignificantFields( TestClass, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( TestClassCustom !== null )
			this.testInsertWithoutSignificantFields( TestClassCustom, theParam );
		
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
		// Should raise: Missing required parameter.
		//
		this.testInsertWithContent( TestClass, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( TestClassCustom !== null )
			this.testInsertWithContent( TestClassCustom, theParam );
		
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
		this.testInsertDuplicate( TestClass, theParam );
		
		//
		// Should raise: duplicate document in collection.
		//
		if( TestClassCustom !== null )
			this.testInsertDuplicate( TestClassCustom, theParam );
		
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
		this.testInsertWithSameContentSucceed( TestClass, theParam );
		
		//
		// Should succeed.
		//
		if( TestClassCustom !== null )
			this.testInsertWithSameContentSucceed( TestClassCustom, theParam );
		
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
		this.testInsertPersistentObject( TestClass, theParam );
		
		//
		// Should succeed.
		//
		if( TestClassCustom !== null )
			this.testInsertPersistentObject( TestClassCustom, theParam );
		
	}	// insertPersistentObject
	
	
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
				this.request,
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
					this.request
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
				this.request,
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
					this.request,
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
					this.request,
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
				this.request,
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
					this.request
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
					this.request,
					null,
					this.compatibleCollection
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
			.to.equal( this.compatibleCollection );
		
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
					this.request,
					this.exampleId
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
				.to.equal( this.exampleId.split('/')[ 0 ] );
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
					this.request,
					null,
					this.edgeCollection
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
					this.request,
					null,
					this.edgeCollection
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
					this.request,
					null,
					this.documentCollection
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
					this.request,
					null,
					this.documentCollection
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
					this.request,
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
					this.request,
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
		// Filled mutable document.
		//
		message = "Filled mutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam,
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
					this.request,
					theParam,
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
					this.request,
					this.exampleId,
					this.exampleCollection,
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
					this.request,
					this.exampleId,
					this.exampleCollection,
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
	 * Instantiate with invalid _id reference and default collection.
	 *
	 * Assert that the provided _id reference is invalid. This test assumes that the
	 * class implements a default collection: the test will assert that the error is
	 * of the correct type.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateInvalidIdDefaultCollection( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					`XXXXXXXX`
				);
		}).to.throw(
			MyError,
			/not found in collection/
		);
		
	}	// testInstantiateInvalidIdDefaultCollection
	
	/**
	 * Instantiate with invalid _id reference.
	 *
	 * Assert that the provided _id reference is invalid. This test assumes that the
	 * class does not implement a default collection: the test will assert that the
	 * error is of the correct type.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateInvalidIdNoDefaultCollection( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					`XXXXXXXX`
				);
		}).to.throw(
			MyError,
			/invalid object reference handle/
		);
		
	}	// testInstantiateInvalidIdNoDefaultCollection
	
	/**
	 * Instantiate with cross-collection reference and default collection.
	 *
	 * Assert that the provided _id reference belongs to the same declared or implicit
	 * collection.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateCrossCollectionReferenceDefaultCollection( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					this.exampleId
				);
		}).to.throw(
			MyError,
			/cross-collection reference/
		);
		
	}	// testInstantiateCrossCollectionReferenceDefaultCollection
	
	/**
	 * Instantiate with cross-collection reference and provided collection.
	 *
	 * Assert that the provided _id reference belongs to the same declared or implicit
	 * collection.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateCrossCollectionReferenceProvidedCollection( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					this.exampleId,
					this.defaultTestCollection
				);
		}).to.throw(
			MyError,
			/cross-collection reference/
		);
		
	}	// testInstantiateCrossCollectionReferenceProvidedCollection
	
	/**
	 * Instantiate with not found _id reference and default collection.
	 *
	 * Assert that the test raises an error of the not found type.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateNotFoundIdReferenceDefaultCollection( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					`${this.defaultTestCollection}/XXXXXXXX`
				);
		}).to.throw(
			MyError,
			/not found in collection/
		);
		
	}	// testInstantiateNotFoundIdReferenceDefaultCollection
	
	/**
	 * Instantiate with not found _id reference and provided collection.
	 *
	 * Assert that the test raises an error of the not found type.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateNotFoundIdReferenceProvidedCollection( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					`${this.defaultTestCollection}/XXXXXXXX`,
					this.defaultTestCollection
				);
		}).to.throw(
			MyError,
			/not found in collection/
		);
		
	}	// testInstantiateNotFoundIdReferenceProvidedCollection
	
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
	testInstantiateFoundReferenceDefaultCollection( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Test instantiation with reference collection different than default collection.
		// Should fail: the provided _id is of a different collection than the default
		// collection.
		//
		message = "Reference collection different than default collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					this.exampleId
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
					this.request,
					this.exampleId,
					this.compatibleCollection
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/cross-collection reference/
		);
		
		//
		// Test instantiation with reference collection same as provided collection.
		// Should succeed.
		//
		message = "Reference collection same as provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					this.exampleId,
					this.exampleCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.exampleCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Insert test document.
		//
		const collection = doc.defaultCollection;
		const meta =
			db._collection( collection )
				.insert({
					name: "PIPPO"
				});
		
		//
		// Test instantiation with reference inferred collection same as default
		// collection.
		// Should succeed.
		//
		message = "Reference collection inferred and same as default collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					meta._id
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Test instantiation with reference collection inferred and same as provided
		// collection.
		// Should succeed.
		//
		message = "Reference collection inferred and same as provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
		expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Test instantiation with key reference and default collection.
		// Should succeed.
		//
		message = "Key reference and default collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					meta._key
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Test instantiation with key reference and provided collection.
		// Should succeed.
		//
		message = "Key reference and default collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
		expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Remove test document.
		//
		db._remove(meta._id);
		
	}	// testInstantiateFoundReferenceDefaultCollection
	
	/**
	 * Instantiate with found reference and provided collection.
	 *
	 * Assert that the test raises an error only if the provided reference doesn't
	 * match the provided collection.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateFoundReferenceProvidedCollection( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
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
					this.request,
					this.exampleId,
					this.compatibleCollection
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/cross-collection reference/
		);
		
		//
		// Test instantiation with reference collection same as provided collection.
		// Should succeed.
		//
		message = "Reference collection same as provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					this.exampleId,
					this.exampleCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.exampleCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Insert test document.
		//
		const collection = this.defaultTestCollection;
		const meta =
			db._collection( collection )
				.insert({
					name: "PIPPO"
				});
		
		//
		// Test instantiation with reference inferred collection.
		// Should succeed.
		//
		message = "Reference infers collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					meta._id
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
		// Test instantiation with reference collection inferred and same as provided
		// collection.
		// Should succeed.
		//
		message = "Reference collection inferred and same as provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
		// Test instantiation with key reference and provided collection.
		// Should succeed.
		//
		message = "Key reference and default collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
		
	}	// testInstantiateFoundReferenceProvidedCollection
	
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
	testInstantiateWithContentDefaultCollection( theClass, theParam = null )
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
		// Instantiate with default collection.
		//
		message = "Instantiation with default collection";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// Instantiate with default collection and invalid property.
		// Should not fail, it will be caught before persisting.
		//
		const contents = K.function.clone( theParam );
		contents[ "UNKNOWN" ] = "Should not be there";
			message = "Instantiation with default collection and invalid property";
		func = () => {
			doc =
				new theClass(
					this.request,
					contents
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, contents );
		
		//
		// Instantiate with provided.
		//
		message = "Instantiation with provided collection";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam,
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
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// Instantiate with provided collection and invalid property.
		// Should not fail, it will be caught before persisting.
		//
		message = "Instantiation with default collection and invalid property";
		func = () => {
			doc =
				new theClass(
					this.request,
					contents,
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
		this.assertAllProvidedDataInDocument( "Check contents", doc, contents );
		
	}	// testInstantiateWithContentDefaultCollection
	
	/**
	 * Instantiate with content and provided collection.
	 *
	 * Assert that the test succeeds with collection.
	 *
	 * Should always succeed.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateWithContentProvidedCollection( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Instantiate with provided.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam,
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
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
	}	// testInstantiateWithContentProvidedCollection
	
	
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
		// REPLACE FLAG FALSE
		//
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
				theParam,
				false
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
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
		data = K.function.clone( theParam );
		for( const item in data )
			data[ item ] = null;
		action = "Set document properties delete";
		func = () => {
			doc.setDocumentProperties(
				data,
				false
			);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
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
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
				false
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
		
		//
		// REPLACE FLAG TRUE
		//
		
		//
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
				theParam,
				true
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
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
		data = K.function.clone( theParam );
		for( const item in data )
			data[ item ] = null;
		action = "Set document properties delete";
		func = () => {
			doc.setDocumentProperties(
				data,
				true
			);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
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
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
				true
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
	
	}	// testContentsLoadEmptyObject
	
	/**
	 * Succeed loading contents in filled object
	 *
	 * Assert that loading contents in a filled non persistent object works for all fields
	 * except restricted fields, the following checks will be performed:
	 *
	 * 	- Restricted fields are not copied.
	 * 	- All other fields are copied.
	 * 	- Locked fields are always replaced, regardless of replace flag.
	 * 	- No fields, except locked, are replaced if the flag is off.
	 * 	- All fields are replaced if the flag is on.
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
		
		const base_data = theParam[ 'base' ];
		const replace_data = theParam[ 'replace' ];
		
		//
		// REPLACE FLAG FALSE
		//
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					base_data,
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
			false,									// Replace flag.
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
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					base_data,
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
		data = K.function.clone( replace_data );
		for( const item in data )
			data[ item ] = null;
		this.validateNonPersistentReplace(
			`${message} - replace with delete contents`,	// Error message.
			false,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
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
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					base_data,
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
			false,											// Replace flag.
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
		
		//
		// REPLACE FLAG TRUE
		//
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					base_data,
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
			true,									// Replace flag.
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
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					base_data,
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
		data = K.function.clone( replace_data );
		for( const item in data )
			data[ item ] = null;
		this.validateNonPersistentReplace(
			`${message} - replace with delete contents`,	// Error message.
			true,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		
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
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					base_data,
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
			true,											// Replace flag.
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
	
	}	// testContentsLoadFilledObject
	
	/**
	 * Succeed loading contents in persistent object
	 *
	 * Assert that loading contents in a persistent object works for all fields
	 * except restricted fields, the following checks will be performed:
	 *
	 * 	- Restricted fields are not copied.
	 * 	- All other fields are copied.
	 * 	- Locked fields are always replaced, regardless of replace flag.
	 * 	- No fields, except locked, are replaced if the flag is off.
	 * 	- All fields are replaced if the flag is on.
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
		
		const base_data = theParam[ 'base' ];
		const replace_data = theParam[ 'replace' ];
		
		//
		// Instantiate object for inserting.
		//
		message = "Persistent copy";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					base_data,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Insert object.
		//
		action = "Insertion";
		func = () => {
			result = doc.insertDocument();
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
		// REPLACE FLAG FALSE
		//
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
		this.assertAllProvidedDataInDocument( "Check contents", doc, base_data );
		
		//
		// Replace and check contents.
		//
		message = "Replace value and flag is off";
		this.validatePersistentReplace(
			message,								// Error message.
			false,									// Replace flag.
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
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Replace and check contents.
		//
		data = K.function.clone( replace_data );
		for( const item in data )
			data[ item ] = null;
		message = "Replace value and flag is off";
		this.validatePersistentReplace(
			`${message} - replace with delete contents`,	// Error message.
			false,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		
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
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Replace and check contents.
		//
		data = { "UNKNOWN" : "CONTENT" };
		message = "Replace value and flag is off";
		this.validatePersistentReplace(
			`${message} - replace with invalid contents`,	// Error message.
			false,											// Replace flag.
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
		
		//
		// REPLACE FLAG TRUE
		//
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
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
		this.assertAllProvidedDataInDocument( "Check contents", doc, base_data );
		
		//
		// Replace and check contents.
		//
		message = "Replace value and flag is on";
		this.validatePersistentReplace(
			message,								// Error message.
			true,									// Replace flag.
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
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Replace and check contents.
		//
		data = K.function.clone( replace_data );
		for( const item in data )
			data[ item ] = null;
		message = "Replace value and flag is on";
		this.validatePersistentReplace(
			`${message} - replace with delete contents`,	// Error message.
			true,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		
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
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Replace and check contents.
		//
		data = { "UNKNOWN" : "CONTENT" };
		message = "Replace value and flag is on";
		this.validatePersistentReplace(
			`${message} - replace with invalid contents`,	// Error message.
			true,											// Replace flag.
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
		
		//
		// Remove document.
		//
		db._remove( id );
	
	}	// testContentsLoadPersistentObject
	
	
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
					this.request,
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
				result = doc.insertDocument();
			};
			
			//
			// Assert exception.
			//
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/missing required field/
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
				result = doc.insertDocument();
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
			for( const field of doc.localFields )
			{
				action = `Has field [${field}]`;
				expect( doc.document, `${message} - ${action}` ).to.have.property( field );
				action = `Field [${field}] not empty`;
				expect( doc.document[ field ], `${message} - ${action}` ).not.to.be.empty;
			}
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
		
		//
		// Instantiate object with contents.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// ToDo
		// Note: we need to instantiate the object first, because we need to get the
		// list of reqauired fields: should make the method static...
		//
		
		//
		// Handle required field.
		//
		const required = doc.requiredFields;
		if( required.length > 0 )
		{
			//
			// Iterate required fields.
			//
			for( const field of required )
			{
				//
				// Match in current object.
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
					
					//
					// Insert object.
					//
					message = `Insert without [${field}]`;
					func = () => {
						result = doc.insertDocument();
					};
					expect( func, `${message}`
					).to.throw(
						MyError,
						/missing required field/
					);
				}
				
				//
				// Insert document.
				//
				else
				{
					//
					// Insert object.
					//
					message = "Insertion";
					func = () => {
						result = doc.insertDocument();
					};
					
					//
					// Assert no exception.
					//
					expect( func, `${message}` ).not.to.throw();
					expect( doc.document, message ).not.to.have.property( field );
					
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
					for( const field of doc.localFields )
					{
						action = `Has field [${field}]`;
						expect( doc.document, `${message} - ${action}` ).to.have.property( field );
						action = `Field [${field}] not empty`;
						expect( doc.document[ field ], `${message} - ${action}` ).not.to.be.empty;
					}
				}
				
				//
				// Instantiate object with contents.
				//
				message = "Instantiation";
				func = () => {
					doc =
						new theClass(
							this.request,
							theParam,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
			
			}	// Iterating required fields.
		
		}	// Has required fields.
		
		//
		// Handle no required fields.
		//
		else
		{
			//
			// Insert object.
			//
			message = "Insertion";
			func = () => {
				result = doc.insertDocument();
			};
			
			//
			// Assert no exception.
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
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			for( const field of doc.localFields )
			{
				action = `Has field [${field}]`;
				expect( doc.document, `${message} - ${action}` ).to.have.property( field );
				action = `Field [${field}] not empty`;
				expect( doc.document[ field ], `${message} - ${action}` ).not.to.be.empty;
			}
		
		} // Has no required fields.
		
	}	// testInsertWithoutRequiredFields
	
	/**
	 * Test inserting document without significant fields
	 *
	 * Assert that inserting an object without significant fields suceeds.
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
		// Instantiate object with contents.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// ToDo
		// Note: we need to instantiate the object first, because we need to get the
		// list of significant fields: should make the method static...
		//
		
		//
		// Handle required field.
		//
		const significant = doc.significantFields;
		if( significant.length > 0 )
		{
			//
			// Iterate significant fields.
			//
			for( const field of significant )
			{
				//
				// Match in current object.
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
					
					//
					// Insert object.
					//
					message = `Insert without [${field}]`;
					func = () => {
						result = doc.insertDocument();
					};
					
					//
					// Check if also required.
					//
					if( doc.requiredFields.includes( field ) )
						expect( func, `${message}`
						).to.throw(
							MyError,
							/missing required field/
						);
					else
						expect( func, `${message}` ).not.to.throw();
				}
				
				//
				// Insert document.
				//
				else
				{
					//
					// Insert object.
					//
					message = "Insertion";
					func = () => {
						result = doc.insertDocument();
					};
					
					//
					// Assert no exception.
					//
					expect( func, `${message}` ).not.to.throw();
					expect( doc.document, message ).not.to.have.property( field );
					
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
					for( const field of doc.localFields )
					{
						action = `Has field [${field}]`;
						expect( doc.document, `${message} - ${action}` ).to.have.property( field );
						action = `Field [${field}] not empty`;
						expect( doc.document[ field ], `${message} - ${action}` ).not.to.be.empty;
					}
				}
				
				//
				// Instantiate object with contents.
				//
				message = "Instantiation";
				func = () => {
					doc =
						new theClass(
							this.request,
							theParam,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				
			}	// Iterating significant fields.
			
		}	// Has significant fields.
		
		//
		// Handle no significant fields.
		//
		else
		{
			//
			// Insert object.
			//
			message = "Insertion";
			func = () => {
				result = doc.insertDocument();
			};
			
			//
			// Assert no exception.
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
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			for( const field of doc.localFields )
			{
				action = `Has field [${field}]`;
				expect( doc.document, `${message} - ${action}` ).to.have.property( field );
				action = `Field [${field}] not empty`;
				expect( doc.document[ field ], `${message} - ${action}` ).not.to.be.empty;
			}
			
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
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, message ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.equal( true );
		action = "Should not be empty";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Has local fields";
		for( const field of doc.localFields )
			expect(doc.document, `${message} - ${action}` ).to.have.property(field);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal(false);
		
		//
		// Get ID and clone data.
		//
		id = doc.document._id;
		key = doc.document._key;
		data = K.function.clone( doc.document );
		
		//
		// Save inserted ID in current object.
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
					this.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
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
		// Create selector.
		//
		selector = K.function.clone( theParam );
		selector._key = this.intermediate_results.key_insert_filled;
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, message
		).to.throw(
			MyError,
			/duplicate document in collection/
		);
		
	}	// testInsertDuplicate
	
	/**
	 * Test inserting document with same content
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
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, message
		).to.throw(
			MyError,
			/duplicate document in collection/
		);
		
	}	// testInsertWithSameContentFail
	
	/**
	 * Test inserting document with content
	 *
	 * Assert that inserting an object with contents suceeds.
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
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, message ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.equal( true );
		action = "Should not be empty";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Has local fields";
		for( const field of doc.localFields )
			expect(doc.document, `${message} - ${action}` ).to.have.property(field);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal(false);
		this.assertAllProvidedDataInDocument( "Contents", doc, theParam );
		
		//
		// Get ID and clone data.
		//
		id = doc.document._id;
		key = doc.document._key;
		data = K.function.clone( doc.document );
		
		//
		// Save inserted ID in current object.
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
					this.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		this.assertAllProvidedDataInDocument( "Contents", doc, data );
		
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
					this.request,
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
			result = doc.insertDocument();
		};
		expect( func, message
		).to.throw(
			MyError,
			/document is persistent/
		);
		
	}	// testInsertPersistentObject
	
	
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
	 * @param theObject		{Object}	The tested class instance.
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
			//
			if( theObject.restrictedFields.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
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
			else if( theObject.lockedFields.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
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
	 * @param theObject		{Object}	The tested class instance.
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
		let action;
		let replace;
		
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
		//
		for( const field in newData )
		{
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
			// Replace restricted field.
			//
			if( theObject.restrictedFields.includes( field ) )
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
			// Replace locked field,
			// and set new data to original data if the replace raises an exception.
			//
			else if( theObject.lockedFields.includes( field ) )
			{
				action = `${op} locked [${field}]`;
				expect( func, `${theMessage} - ${action}`
				).to.throw(
					MyError,
					/Property is locked/
				);
				
				if( oldData.hasOwnProperty( field ) )
					newData[ field ] = oldData[ field ];
				else
					delete newData[ field ];
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
		this.validatePersistentContents
		(
			theFlag,						// Replace flag.
			theMessage,						// Error message.
			oldData,						// Data before replace.
			theObject.document,				// The object to test.
			newData,						// The replacement data.
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
	 * @param theObject		{Object}	The tested class instance.
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
		const theOldData = JSON.parse(JSON.stringify(theObject.document));
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
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
			// Replace restricted field.
			// Should succeed.
			//
			if( theObject.restrictedFields.includes( field ) )
			{
				action = `${op} restricted [${field}]`;
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
			// Replace locked field.
			// Should succeed.
			//
			else if( theObject.lockedFields.includes( field ) )
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
			
		}	// Iterating replace properties.
		
		//
		// Check contents.
		//
		this.validateNonPersistentContents
		(
			theFlag,						// Replace flag.
			theMessage,						// Error message.
			theOldData,						// Data before replace.
			theObject.document,				// The object to test.
			theNewData,						// The replacement data.
			theObject.restrictedFields,		// Restricted fields.
			theObject.requiredFields,		// Required fields.
			theObject.lockedFields,			// Locked fields.
			theObject.uniqueFields,			// Unique fields.
			theObject.significantFields		// Significant fields.
		);
		
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
			else if( theLocked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
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
			else if( theLocked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
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
				// Assert property is not there,
				// only if the flag is true.
				//
				if( theFlag )
					expect( theDestination, `${theMessage} - ${action}` )
						.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replaced properties.
		
	}	// validateNonPersistentContents
	
	
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
	
	
	/****************************************************************************
	 * MEMBER GETTERS															*
	 ****************************************************************************/
	
	/**
	 * Return default test collection.
	 *
	 * @return {String}
	 */
	get defaultTestCollection()	{	return this.document_collection;	}
	
}	// DocumentUnitTest.

/**
 * Module exports
 */
module.exports = DocumentUnitTest;
