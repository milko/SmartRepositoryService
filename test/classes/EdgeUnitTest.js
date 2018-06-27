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
	 * REMOVE TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
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
