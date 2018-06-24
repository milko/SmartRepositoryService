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
	 * Define instantiation tests
	 *
	 * We overload this method to add a test where we instantiate an edge of the
	 * incorrect type:
	 *
	 * 	- Instantiate with wrong type of edge.
	 */
	unitsInitInstantiation()
	{
		//
		// Call parent method.
		//
		super.unitsInitInstantiation();
		
		//
		// Instantiate with wrong type of edge.
		// Assert it fails.
		//
		this.instantiationUnitSet(
			'instantiateWrongEdgeType',
			"Instantiate class with wrong edge type selector:",
			this.test_classes.base,
			null,
			true
		);
		
	}	// unitsInitInstantiation
	
	
	/****************************************************************************
	 * INSTANTIATION TEST MODULES DEFINITIONS									*
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
	
	
	/****************************************************************************
	 * INSTANTIATION TEST ROUTINE DEFINITIONS									*
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
		let action;
		let message;
		
		//
		// Instantiate class with parent class.
		//
		message = "Instantiate test edge with parent class";
		func = () => {
			doc =
				new this.test_classes.parent(
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
		message = "Parent class selector";
		expect(selector, message).not.to.be.empty;
		
		//
		// Instantioate with _id.
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
			/Constraint violation/
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
			/Constraint violation/
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
			/missing required fields to resolve object/
		);
	
	}	// testInstantiateWrongEdgeType
	
}	// EdgeUnitTest.

/**
 * Module exports
 */
module.exports = EdgeAttributeUnitTest;
