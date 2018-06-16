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
		this.instantiationUnitsInit();
		
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
	 */
	instantiationUnitsInit()
	{
		//
		// Instantiate class without selector and without collection.
		//
		this.instantiationUnitSet(
			'instantiateNoSelectorNoCollection',
			"Instantiate class without selector and without collection",
			TestClass
		);
		
		//
		// Instantiate with null selector and without collection.
		//
		this.instantiationUnitSet(
			'instantiateNullSelectorNoCollection',
			"Instantiate with null selector and without collection:",
			TestClass
		);
		
		//
		// Instantiate with null selector and non existant collection.
		//
		this.instantiationUnitSet(
			'instantiateNullSelectorMissingCollection',
			"Instantiate with null selector and non existant collection:",
			TestClass
		);
		
		//
		// Instantiate with default collection.
		//
		this.instantiationUnitSet(
			'instantiateDefaultCollection',
			"Instantiate with default collection:",
			TestClass
		);
		
		//
		// Instantiate with existing edge collection.
		//
		this.instantiationUnitSet(
			'instantiateEdgeCollection',
			"Instantiate with existing edge collection:",
			TestClass
		);
		
		//
		// Instantiate with existing document collection.
		//
		this.instantiationUnitSet(
			'instantiateDocumentCollection',
			"Instantiate with existing document collection:",
			TestClass
		);
		
		//
		// Instantiate mutable/immutable document.
		//
		this.instantiationUnitSet(
			'instantiateMutableImmutableDocument',
			"Instantiate mutable/immutable document:",
			TestClass,
			param.content
		);
		
		//
		// Instantiate with invalid _id reference.
		//
		this.instantiationUnitSet(
			'instantiateInvalidReferenceId',
			"Instantiate with invalid _id reference:",
			TestClass
		);
		
		//
		// Instantiate with cross-collection reference.
		//
		this.instantiationUnitSet(
			'instantiateCrossCollectionReference',
			"Instantiate with cross-collection reference:",
			TestClass
		);
		
		//
		// Instantiate with not found _id reference.
		//
		this.instantiationUnitSet(
			'instantiateNotFoundIdReference',
			"Instantiate with not found reference:",
			TestClass
		);
		
		//
		// Instantiate with found reference.
		//
		this.instantiationUnitSet(
			'instantiateFoundReference',
			"Instantiate with found reference:",
			TestClass
		);
		
		//
		// Instantiate with content.
		//
		this.instantiationUnitSet(
			'instantiateWithContent',
			"Instantiate with content:",
			TestClass,
			param.content
		);
		
	}	// instantiationUnitsInit
	
	
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
		this.testInstantiateNoSelectorNoCollectionFail( TestClass );
		
		//
		// Should succeed, because the custom class implements default collection.
		//
		if( TestClassCustom !== null )
			this.testInstantiateNoSelectorNoCollectionSucceed( TestClassCustom );
		
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
		this.testInstantiateNullSelectorNoCollectionFail( TestClass, theParam );
		
		//
		// Should succeed with custom class: it implements the default collection.
		//
		if( TestClassCustom !== null )
			this.testInstantiateNullSelectorNoCollectionSucceed(
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
		this.testInstantiateNullSelectorMissingCollectionFail(
			TestClass, test_collection
		);
		this.testInstantiateNullSelectorMissingCollectionFail(
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
		this.testDefaultCollectionFail( TestClass, theParam );
		
		//
		// Test class with default collection.
		//
		if( TestClassCustom !== null )
			this.testDefaultCollectionSucceed(
				TestClassCustom, theParam
			);
		
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
	 * INSTANTIATION TEST ROUTINE DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Fail instantiate class without selector and without collection
	 *
	 * Assert that instantiating the class without the reference and collection
	 * parameters raises an exception.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNoSelectorNoCollectionFail( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		expect( () => {
			const tmp =
				new theClass(
					this.request
				);
		}).to.throw(
			MyError,
			/Missing required parameter/
		);
		
	}	// testInstantiateNoSelectorNoCollectionFail
	
	/**
	 * Fail instantiate class without selector and without collection
	 *
	 * Assert that instantiating the class without the reference and collection
	 * parameters succeeds: this should only occur if the class implements default
	 * collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNoSelectorNoCollectionSucceed( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		expect( () => {
			const tmp =
				new theClass(
					this.request
				);
		}).not.to.throw();
		
	}	// testInstantiateNoSelectorNoCollectionSucceed
	
	/**
	 * Fail instantiate with null selector and without collection.
	 *
	 * Assert that instantiating the class with null reference and no collection
	 * parameters raises an exception.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNullSelectorNoCollectionFail( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					null
				);
		}).to.throw(
			MyError,
			/Missing required parameter/
		);
		
	}	// testInstantiateNullSelectorNoCollectionFail
	
	/**
	 * Succeed instantiate with null selector and without collection.
	 *
	 * Assert that instantiating the class with null reference and no collection
	 * parameters succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNullSelectorNoCollectionSucceed( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					null
				);
		}).not.to.throw();
		
	}	// testInstantiateNullSelectorNoCollectionSucceed
	
	/**
	 * Fail with null selector and non existant collection.
	 *
	 * Assert that instantiating the class with null reference and a non existing
	 * collection parameters raises an exception.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNullSelectorMissingCollectionFail( theClass, theParam = null )
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
		
	}	// testInstantiateNullSelectorMissingCollectionFail
	
	/**
	 * Succeed with null selector and non existant collection.
	 *
	 * Assert that instantiating the class with null reference and a non existing
	 * collection parameters succeeds: this should only be vaild for classes that have
	 * a default collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNullSelectorMissingCollectionSucceed( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		expect( () => {
			const tmp =
				new theClass(
					this.request,
					null,
					theParam
				);
		}).not.to.throw();
		
	}	// testInstantiateNullSelectorMissingCollectionSucceed
	
	/**
	 * Test instantiation with missing default collection
	 *
	 * Perform tests for default collection with class that does not have default
	 * collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testDefaultCollectionFail( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Instantiate without collection.
		// Should raise: Missing required parameter.
		//
		message = "Missing selector and missing collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/Missing required parameter/
		);
		
		//
		// Instantiate with null selector and provided collection.
		// Collection should be the provided one.
		//
		message = "Null selector and provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					null,
					this.compatibleCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Collection name";
		expect( doc.collection, `${message} - ${action}` )
			.to.equal( this.compatibleCollection );
		
		//
		// Instantiate with existing _id reference and missing collection.
		// Collection should be the extracted from the reference.
		//
		message = "Existing reference and missing collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					this.exampleId
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Collection name";
		expect( doc.collection, `${message} - ${action}` )
			.to.equal( this.exampleId.split('/')[ 0 ] );
		
	}	// testDefaultCollectionFail
	
	/**
	 * Test instantiation with existing default collection
	 *
	 * Perform tests for default collection with class that has default collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testDefaultCollectionSucceed( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Instantiate without collection.
		// Should raise: Missing required parameter.
		//
		message = "Missing selector and missing collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Collection name";
		expect( doc.collection, `${message} - ${action}` )
			.to.equal( doc.defaultCollection );
		
		//
		// Instantiate with null selector and provided collection.
		// Collection should be the provided one.
		//
		message = "Null selector and provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.request,
					null,
					this.compatibleCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Collection name";
		expect( doc.collection, `${message} - ${action}` )
			.to.equal( this.compatibleCollection );
		
		//
		// Instantiate with existing _id reference and missing collection.
		// Collection should be the extracted from the reference.
		// Should raise an exception.
		//
		message = "Existing reference and missing collection";
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
			/Invalid document reference: cross-collection reference/
		);
		
	}	// testDefaultCollectionSucceed
	
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.true;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.false;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Check content.
		//
		this.validateInstantiateContents( "Check contents", doc, theParam );
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.false;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Check content.
		//
		this.validateInstantiateContents( "Check contents", doc, theParam );
		
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
		expect( doc.persistent, `${message} - ${action}` ).to.be.false;
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Check content.
		//
		this.validateInstantiateContents( "Check contents", doc, theParam );
		
	}	// testInstantiateWithContentProvidedCollection
	
	
	/****************************************************************************
	 * VALIDATION UTILITIES														*
	 ****************************************************************************/
	
	/**
	 * Validate the contents after inserting.
	 *
	 * This method can be used to assert that the provided contents can be found in
	 * the document, except for restricted properties.
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
	 * @param theObject		{Object}	The tested class instance.
	 * @param theContents	{Object}	The data used for instantiation.
	 */
	validateInstantiateContents(
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
		
	}	// validateInstantiateContents
	
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
			// Replace locked field.
			//
			else if( theObject.lockedFields.includes( field ) )
			{
				action = `${op} locked [${field}]`;
				expect( func, `${theMessage} - ${action}`
				).to.throw(
					MyError,
					/Property is locked/
				);
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
			theOldData,						// Data before replace.
			theObject.document,				// The object to test.
			theNewData,						// The replacement data.
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
				//
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
							// Locked fields are replaced,
							//
							case 'L':
								this.compareValues(
									( was_there ) ? theSource[ field ]
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
				// Assert property is not there.
				//
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
	 */
	instantiationUnitSet( theUnit, theName, theClass, theParam = null ) {
		this.unitSet( 'unit_instantiation', theUnit, theName, theClass, theParam );
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