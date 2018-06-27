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
	 * REPLACE TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Replace persistent values
	 *
	 * We overload this method to exclude significant fields from the test.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
/*
	replacePersistentValue( theClass, theParam = null )
	{
		//
		// Instantiate object to get significant fields.
		//
		const tmp = new this.test_classes.base(
			this.parameters.request,
			this.intermediate_results.key_insert_filled,
			this.defaultTestCollection
		);
		
		//
		// Should raise for locked and not for others.
		//
		this.testReplacePersistentValue(
			this.test_classes.base, K.function.flatten(tmp.significantFields) );
		
		//
		// Should raise for locked and not for others.
		//
		if( this.test_classes.custom )
		{
			const tmp = new this.test_classes.base(
				this.parameters.request,
				this.intermediate_results.key_insert_filled,
				this.defaultTestCollection
			);
			
			this.testReplacePersistentValue(
				this.test_classes.custom, K.function.flatten(tmp.significantFields) );
		}
		
	}	// replacePersistentValue
*/
	
	/**
	 * Replace content values
	 *
	 * We overload this method to exclude significant fields from the test.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
/*
	replaceContentValue( theClass, theParam = null )
	{
		//
		// Instantiate object to get significant fields.
		//
		const tmp = new this.test_classes.base(
			this.parameters.request,
			this.intermediate_results.key_insert_filled,
			this.defaultTestCollection
		);
		
		//
		// Should raise changing locked and deleting required.
		//
		this.testReplaceContentValue(
			this.test_classes.base, K.function.flatten(tmp.significantFields) );
		
		//
		// Should raise changing locked and deleting required.
		//
		if( this.test_classes.custom )
		{
			const tmp = new this.test_classes.base(
				this.parameters.request,
				this.intermediate_results.key_insert_filled,
				this.defaultTestCollection
			);
			
			this.testReplaceContentValue(
				this.test_classes.custom, K.function.flatten(tmp.significantFields) );
		}
		
	}	// replacePersistentValue
*/
	
	
	/****************************************************************************
	 * INSERT TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test inserting document with same content fails
	 *
	 * Assert that inserting an object with same contents fails, this should occur if
	 * the document _key is computed from the document contents.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
/*
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
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		const param_contents = theParam.contents;
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					param_contents,
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
*/
	
	/**
	 * Test inserting document with same content succeeds
	 *
	 * We override this method because we need to change the nodes in order to succeed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
/*
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
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// Clone contents.
		//
		const clone = K.function.clone(param_contents);
		
		//
		// Change nodes.
		//
		if( this.intermediate_results.hasOwnProperty( 'key_insert_same' ) )
		{
			clone._from  = 'test_Document/NODE1';
			clone._to  = 'test_Document/NODE0';
			clone[ Dict.descriptor.kName ] = "NAME SAME CONTENTS";
		}
		else
		{
			clone._from  = 'test_Document/NODE2';
			clone._to  = 'test_Document/NODE0';
		}
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					clone,
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
		// Save inserted ID in current object.
		//
		this.intermediate_results.key_insert_same = doc.document._key;
		
	}	// testInsertWithSameContentSucceed
*/
	
	/**
	 * Test inserting without persisting
	 *
	 * We override this method because the _key will be computed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
/*
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
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
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
			result = doc.insertDocument( false );
		};
		expect( func, message ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.equal( true );
		action = "Should not be empty";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Has reference fields";
		expect(doc.document, `${message} - ${action}` ).not.to.have.property('_id');
		// expect(doc.document, `${message} - ${action}` ).not.to.have.property('_key');
		expect(doc.document, `${message} - ${action}` ).not.to.have.property('_rev');
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal(false);
		this.assertAllProvidedDataInDocument( "Contents", doc, theParam );
		
	}	// testInsertWithoutPersist
*/


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
