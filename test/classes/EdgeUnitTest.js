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
		// Call parent method.
		//
		super.unitsInitResolve();
		
		//
		// Remove ambiguous document resolve.
		// Edges cannot have ambiguoug documents.
		//
		this.resolveUnitDel( 'resolveAmbiguousObject' );
		
		//
		// Set resolve significant fields.
		// We need to set the edge nodes in order to make this test..
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
		tmp = {
			noSig: {},
			sigOne: {},
			sigFind: {},
			sigNoFind: {}
		};
		
		tmp.noSig[ Dict.descriptor.kName ] = 'NAME FILLED';
		
		tmp.sigOne._from = 'test_Document/NODE0';
		tmp.sigOne._to = 'test_Document/NODE1';
		tmp.sigOne[ Dict.descriptor.kLID ] = 'LID_FILLED';
		
		tmp.sigFind._from = 'test_Document/NODE0';
		tmp.sigFind._to = 'test_Document/NODE1';
		tmp.sigFind[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateEnumOf}`;
		tmp.sigFind[ Dict.descriptor.kNID ] = 'terms/:id';
		tmp.sigFind[ Dict.descriptor.kLID ] = 'LID_FILLED';
		
		tmp.sigNoFind._from = 'test_Document/NODE2';
		tmp.sigNoFind._to = 'test_Document/NODE1';
		tmp.sigNoFind[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateEnumOf}`;
		tmp.sigNoFind[ Dict.descriptor.kNID ] = 'UNKNOWN';
		tmp.sigNoFind[ Dict.descriptor.kLID ] = 'LID';
		
		this.resolveUnitSet(
			'resolveSignificantField',
			"Resolve significant field",
			this.test_classes.base,
			{
				replace: this.parameters.replace,
				noSig: tmp.noSig,
				sigFind: tmp.sigFind,
				sigOne: tmp.sigOne,
				sigNoFind: tmp.sigNoFind
			},
			false
		);
		
		//
		// Resolve reference fields.
		// We change the provided parameters to provide a valid but nor matched selector.
		//
		tmp = {};
		tmp._from = 'test_Document/NODE2';
		tmp._to = 'test_Document/NODE1';
		tmp[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateEnumOf}`;
		this.resolveUnitSet(
			'resolveReferenceField',
			"Resolve reference fields",
			this.test_classes.base,
			tmp,
			false
		);
		
		//
		// Resolve without raising.
		// This test will assert that setting the doRaise flag to off prevents exceptions
		// from being raised only in case the document was not found.
		//
		tmp = { correct: {}, incorrect: {} };
		
		tmp.correct._from = 'test_Document/NODE0';
		tmp.correct._to = 'test_Document/NODE1';
		tmp.correct[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateEnumOf}`;
		
		tmp.incorrect._from = 'test_Document/NODE2';
		tmp.incorrect._to = 'test_Document/NODE1';
		tmp.incorrect[ Dict.descriptor.kPredicate ] = `terms/${Dict.term.kPredicateEnumOf}`;

		this.resolveUnitSet(
			'resolveNoException',
			"Resolve without raising",
			this.test_classes.base,
			tmp,
			false
		);
		
		//
		// Resolve changed significant fields.
		// We override this test because we need to set a document _id reference as value.
		//
		this.resolveUnitSet(
			'resolveChangeSignificantField',
			"Resolve changed significant fields",
			this.test_classes.base,
			`descriptors/${Dict.descriptor.kName}`,
			false
		);
	
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
	 * INSERT TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test inserting empty object
	 *
	 * We override this method to handle missing significant properties errors.
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
		// Check parameter.
		//
		expect( theParam, "Check parameter" ).to.be.an.array;
		
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
		// Handle significant fields.
		//
		if( K.function.flatten(doc.significantFields).length > 0 )
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
				/missing fields required to compute edge key/
			);
		}
		
		//
		// Handle no significant fields: call parent test.
		//
		else
			super.testInsertEmptyObject( theClass, theParam );
		
	}	// testInsertEmptyObject
	
	/**
	 * Test inserting document without significant fields
	 *
	 * We override this method to handle errors raised because of missing proprties
	 * required to compute key.
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
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// ToDo
		// Note: we need to instantiate the object first, because we need to get the
		// list of significant fields: should make the method static...
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
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Iterate significant fields.
		// We know edges have significant fields.
		//
		for( const field of K.function.flatten( doc.significantFields ) )
		{
			//
			// Remove from current document.
			//
			if( doc.document.hasOwnProperty( field ) ) {
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
				result = doc.insertDocument();
			};
			expect( func, `${message}`
			).to.throw(
				MyError,
				/missing fields required to compute edge key/
			);
			
			//
			// Restore the full object.
			//
			message = "Instantiate full object";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						param_contents,
						this.defaultTestCollection
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
		}	// Iterating significant fields.
		
	}	// testInsertWithoutSignificantFields
	
	/**
	 * Test inserting document with content
	 *
	 * We overload this method because we need to change the edge nodes, since edges
	 * cannot be duplicated.
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
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// Clone parameter.
		//
		const clone = K.function.clone( param_contents );
		
		//
		// Change node to create a unique edge.
		//
		if( this.intermediate_results.hasOwnProperty( 'key_insert_filled' ) )
		{
			clone._to = 'test_Document/NODE2';
			clone[ Dict.descriptor.kName ] = 'NAME FILLED';
			clone[ Dict.descriptor.kLID ] = 'LID_FILLED';
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
					this.parameters.request,
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
	 * We override this method because edges cannot be duplicate by definition, we
	 * should get an ambiguous document error instead.
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
					this.parameters.request,
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
			/_key field mismatch/
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
	
	/**
	 * Test inserting document with same content succeeds
	 *
	 * We override this method because we need to change the nodes in order to succeed.
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
	
	/**
	 * Test inserting without persisting
	 *
	 * We override this method because the _key will be computed..
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
	
	
	/****************************************************************************
	 * RESOLVE TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Resolve changed significant fields
	 *
	 * We overload this test because significant fields are by default locked fields,
	 * so we make specific tests here.
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
		// Iterate significant fields.
		//
		for( const field of K.function.flatten(doc.significantFields) )
		{
			// MILKO.
			
		}	// Iterating significant fields.
		
	}	// testResolveChangeSignificantField


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
