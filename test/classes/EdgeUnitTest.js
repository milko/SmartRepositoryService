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
	 * DEFAULT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define resolve tests
	 *
	 * We overload this method to make the following changes:
	 *
	 * 	- Remove resolveAmbiguousObject().
	 * 	- Remove resolveChangeSignificantField().
	 */
	unitsInitResolve()
	{
		//
		// Call parent method.
		//
		super.unitsInitResolve();
		
		//
		// Remove ambiguous document resolve.
		// Edges cannot have ambiguoug documents.
		//
		this.resolveUnitDel( 'resolveAmbiguousObject' );
		
		//
		// Remove changed significant fields.
		// Edges have one set of significant fields which are also locked, in
		// addition, these fields automatically determine the value of the key, so
		// changing any of them would generate a new key, making this test redundant.
		//
		this.resolveUnitDel( 'resolveChangeSignificantField' );
	
	}	// unitsInitResolve
	
	/**
	 * Define custom tests
	 *
	 * We overload this method to add the following tests:
	 *
	 * 	- Validate edge key behaviour.
	 */
	unitsInitCustom()
	{
		//
		// Call parent method.
		//
		super.unitsInitCustom();
		
		//
		// Instantiate with wrong type of edge.
		// Assert it fails.
		//
		this.customUnitSet(
			'instantiateWrongEdgeType',
			"Instantiate class with wrong edge type selector:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Validate edge key.
		// Assert that removing a constrained document fails.
		//
		this.customUnitSet(
			'customEdgeKey',
			"Validate edge key",
			this.test_classes.base,
			null,
			true
		);
		
	}	// unitsInitCustom
	
	
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
		// Should succeed.
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
		// Should fail.
		//
		this.testInstantiateDocumentFail(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateDocumentFail(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateDocumentCollection
	
	
	/****************************************************************************
	 * CUSTOM TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Instantiate class with wrong edge type selector
	 *
	 * Assert instantiating the class with a resolved selector that is not an
	 * EdgeAttribute instance raises an exception.
	 *
	 * Should fail with base class and custom classes.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateWrongEdgeType( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testInstantiateWrongEdgeType(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateWrongEdgeType(
				this.test_classes.custom, theParam );
		
	}	// instantiateNoSelectorNoCollection
	
	/**
	 * Validate edge key.
	 *
	 * This test will check that the key getter returns a string if all required
	 * fields are there and null if not.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	customEdgeKey( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testCustomEdgeKey(
			this.test_classes.base,
			this.parameters.customEdgeKey
		);
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testCustomEdgeKey(
				this.test_classes.custom,
				this.parameters.customEdgeKey
			);
		
	}	// customEdgeKey
	
	
	/****************************************************************************
	 * CUSTOM TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test instantiate class with wrong edge type selector
	 *
	 * Assert instantiating the class with a resolved selector that is not an
	 * EdgeAttribute instance raises an exception.
	 *
	 * Perform test with _id reference and content selector.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateWrongEdgeType( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		let func;
		let message;
		
		//
		// Instantiate other class.
		//
		message = "Instantiate test edge with parent class";
		func = () => {
			doc =
				new this.test_classes.other(
					this.parameters.request,
					this.parameters.other_id
				);
		};
		expect( func, `${message}` ).not.to.throw();
		expect( doc.persistent, `${message}` ).be.true;
		expect( doc.document, `${message}` ).not.be.empty;
		
		//
		// Save other edge references.
		//
		const id = doc.document._id;
		const key = doc.document._key;
		const selector = {};
		for( const field of K.function.flatten(doc.significantFields) )
			selector[ field ] = doc.document[ field ];
		message = "Other class selector";
		expect(selector, message).not.to.be.empty;
		
		//
		// Instantiate with _id.
		//
		message = "Instantiate with _id";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id
				);
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/Constraint violation|Ambiguous document reference|Invalid document reference/
		);
		
		//
		// Instantioate with _key.
		//
		message = "Instantiate with _key";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					key,
					this.parameters.other_collection
				);
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/Constraint violation|Ambiguous document reference/
		);
		
		//
		// Instantioate with selector.
		//
		message = "Instantiate with selector";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.parameters.other_collection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		func = () => {
			doc.resolveDocument();
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/missing required fields|Invalid document reference/
		);
		
	}	// testInstantiateWrongEdgeType
	
	/**
	 * Test removing an object
	 *
	 * Assert that the key getter returns a string if all required fields are set and
	 * null if not.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testCustomEdgeKey( theClass, theParam = null )
	{
		let doc;
		let func;
		let clone;
		let result;
		let action;
		let message;
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiate from reference";
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
		// Test correct key.
		//
		message = "Check valid key";
		func = () => {
			result = doc.key;
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Contents";
		expect(result, `${message} - ${action}`).not.to.be.empty;
		action = "Value";
		expect(result, `${message} - ${action}`).to.equal( doc.document._key );
		
		//
		// Test removing required fields.
		//
		for( const field of theParam )
		{
			//
			// Clone full object data.
			//
			clone = K.function.clone( doc.document );
			
			//
			// Remove field.
			//
			delete doc.document[ field ];
			
			//
			// Test incorrect key.
			//
			message = "Check invalid key";
			func = () => {
				result = doc.key;
			};
			expect( func, `${message}` ).not.to.throw();
			action = "Contents";
			expect(result, `${message} - ${action}`).to.be.null;
			action = "Value";
			expect(result, `${message} - ${action}`).not.to.equal( doc.document._key );
			
			//
			// Restore field.
			//
			doc.document[ field ] = clone[ field ];
			
		}	// Iterating required fields.
		
	}	// testCustomEdgeKey


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
