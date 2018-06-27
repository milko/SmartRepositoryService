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
