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
const PersistentUnitTest = require( './PersistentUnitTest' );


/**
 * Document test class
 *
 * This class defines the classes used in tests and implements common test patterns.
 */
class EdgeUnitTest extends PersistentUnitTest
{
	/****************************************************************************
	 * INSTANTIATION TEST MODULES DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Instantiate with existing edge collection.
	 *
	 * We overload this method to succeed with edge collections.
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
			this.testInstantiateEdgeSucceed(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateEdgeCollection
	
	/**
	 * Instantiate with existing document collection.
	 *
	 * We overload this method to fail with document collections.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateDocumentCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateDocumentFail(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInstantiateDocumentFail(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateDocumentCollection
	
	
	/****************************************************************************
	 * INSTANTIATION TEST ROUTINE DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Instantiate with found reference and default collection.
	 *
	 * We override this test because edges enforce computed key, so we need to
	 * instantiate the sample object with the class to have the correct key; we also
	 * check that resolving an incorrect reference raises an exception..
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateFoundReferenceDefaultCollection( theClass, theParam = null )
	{
		let doc;
		let func;
		let meta;
		let result;
		let message;
		let action;
		
		//
		// Check parameter.
		//
		message = "Check parameter";
		expect( theParam, message ).to.be.an.object;
		
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
					this.parameters.request,
					this.example_id
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
					this.example_id,
					this.compatible_collection
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
					this.parameters.request,
					this.example_id,
					this.example_collection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.example_collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Insert sample document with non computed key.
		//
		const collection = this.defaultTestCollection;
		meta =
			db._collection( collection )
				.insert( theParam );
		
		//
		// Test instantiation with reference inferred collection.
		// Should fail, because edges enforce computed key references.
		//
		message = "Reference is not computed key";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					meta._id
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/_key field mismatch/
		);
		
		//
		// Instantiate with sample contents.
		//
		message = "Reference is computed key";
		action = "Instantiate with sample contents";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Insert without saving.
		//
		action = "Insert without saving";
		func = () => {
			result = doc.insertDocument( false );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		//
		// Insert sample document with computed key.
		//
		meta =
			db._collection( collection )
				.insert( doc.document );
		
		//
		// Test instantiation with reference inferred collection.
		// Should fail, because key in edges is computed.
		//
		message = "Reference infers collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
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
					this.parameters.request,
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
		let meta;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		message = "Check parameter";
		expect( theParam, message ).to.be.an.object;
		
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
					this.example_id,
					this.compatible_collection
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
					this.parameters.request,
					this.example_id,
					this.example_collection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.example_collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Insert sample document with non computed key.
		//
		const collection = this.defaultTestCollection;
		meta =
			db._collection( collection )
				.insert( theParam );
		
		//
		// Test instantiation with reference inferred collection.
		// Should fail, because edges enforce computed key references.
		//
		message = "Reference is not computed key";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					meta._id
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/_key field mismatch/
		);
		
		//
		// Instantiate with sample contents.
		//
		message = "Reference is computed key";
		action = "Instantiate with sample contents";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam,
					collection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Insert without saving.
		//
		action = "Insert without saving";
		func = () => {
			result = doc.insertDocument( false );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		//
		// Insert sample document with computed key.
		//
		meta =
			db._collection( collection )
				.insert( doc.document );
		
		//
		// Test instantiation with reference inferred collection.
		// Should fail, because key in edges is computed.
		//
		message = "Reference infers collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
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
		// Test instantiation with key reference and provided collection.
		// Should succeed.
		//
		message = "Key reference and default collection";
		action = "Instantiation";
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
		
	}	// testInstantiateFoundReferenceProvidedCollection


	/****************************************************************************
	 * MEMBER GETTERS															*
	 ****************************************************************************/
	
	/**
	 * Return default test collection.
	 *
	 * We override the method to return the edge collection.
	 *
	 * @return {String}
	 */
	get defaultTestCollection()	{	return this.parameters.collection_edge;	}
	
}	// EdgeUnitTest.

/**
 * Module exports
 */
module.exports = EdgeUnitTest;
