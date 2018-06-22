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
	 * INSERT TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test inserting empty object
	 *
	 * We override this method to handle errors raised because of missing proprties
	 * required to compute key.
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
				/missing fields required to compute edge key/
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
			this.validateLocalProperties(
				message,
				doc,
				( Array.isArray( theParam ) ) ? theParam : []
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
	 * We override this method to handle errors raised because of missing proprties
	 * required to compute key and to handle the _key which is re-computed before the
	 * document is persisted.
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
		// list of required fields: should make the method static...
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
		// Collect required fields.
		//
		const required = doc.requiredFields;
		
		//
		// Handle document with required fields.
		//
		if( required.length > 0 )
		{
			//
			// Init local storage.
			//
			const significant = K.function.flatten( doc.significantFields );
			
			//
			// Iterate required fields.
			//
			for( const field of required )
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
				// Insert.
				//
				message = `Insert without [${field}]`;
				func = () => {
					result = doc.insertDocument();
				};
				
				//
				// Handle significant field.
				// Edges have one significant field combination that returns all
				// fields required for computing the key, in that case the error will
				// be that a field required for computing the key is missing.
				//
				if( significant.includes( field ) )
					expect( func, `${message}`
					).to.throw(
						MyError,
						/missing fields required to compute edge key/
					);
				
				//
				// Handle all other required fields.
				// Other required fields behave in a standaqrd way.
				//
				else
					expect( func, `${message}`
					).to.throw(
						MyError,
						/missing required field/
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
				result = doc.insertDocument();
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
			this.validateLocalProperties(
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
		// Collect significant fields.
		//
		const significant = K.function.flatten( doc.significantFields );
		
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
				result = doc.insertDocument();
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
			this.validateLocalProperties(
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
