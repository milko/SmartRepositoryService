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
class EdgeBranchUnitTest extends EdgeUnitTest
{
	/****************************************************************************
	 * INSTANTIATION TEST MODULES DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Instantiate mutable/immutable document.
	 *
	 * We overload this method to strip the provided content from the reserved
	 * branches and modifiers properties, we let the parent class handle it.
	 *
	 * Should succeed for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateMutableImmutableDocument( theClass, theParam = null )
	{
		//
		// Clone parameter.
		//
		const param = K.function.clone( theParam );
		if( param.hasOwnProperty( Dict.descriptor.kBranches ) )
			delete param[ Dict.descriptor.kBranches ];
		if( param.hasOwnProperty( Dict.descriptor.kModifiers ) )
			delete param[ Dict.descriptor.kModifiers ];
		
		//
		// Should succeed.
		//
		this.testInstantiateMutableImmutable(
			this.test_classes.base, param );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInstantiateMutableImmutable(
				this.test_classes.custom, param
			);
		
	}	// instantiateMutableImmutableDocument
	
	
	/****************************************************************************
	 * INSTANTIATION TEST ROUTINE DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Instantiate with found reference and default collection.
	 *
	 * We overload this method to handle the reserved branches and modifiers fields
	 * which can only be set through a dedicated interface.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateFoundReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let meta;
		let result;
		let action;
		let message;
		let collection;
		
		//
		// Check parameter.
		//
		message = "Check parameter";
		expect( theParam, message ).to.be.an.object;
		
		//
		// Clone parameter.
		//
		const param = K.function.clone(theParam);
		
		//
		// Save branches and modifiers from parameter,
		// and remove them from the parameter.
		//
		const branches = param[ Dict.descriptor.kBranches ];
		delete param[ Dict.descriptor.kBranches ];
		const modifiers = ( param.hasOwnProperty( Dict.descriptor.kModifiers ) )
						? K.function.clone(param[ Dict.descriptor.kModifiers ])
						: null;
		if( modifiers !== null )
			delete param[ Dict.descriptor.kModifiers ];

		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
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
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Test instantiation with reference collection different than default collection.
		// Should fail: the provided _id is of a different collection than the default
		// collection.
		//
		message = "Reference collection different than default collection";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						this.parameters.example_id
					);
			};
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						this.parameters.example_id,
						this.defaultTestCollection
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
					this.parameters.example_id,
					this.parameters.other_collection
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/cross-collection reference/
		);
		
		//
		// Test instantiation with inferred collection same as provided collection.
		// Should succeed.
		//
		message = "Reference collection same as provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.parameters.example_collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate sample document.
		//
		message = "Instantiate sample document";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						param
					);
			};
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						param,
						this.defaultTestCollection
					);
			};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( db._collection(doc.collection).count(), `${message} - ${action} collection` )
			.to.equal(0);
		
		//
		// Load branches.
		//
		action = "Add branches";
		func = () => {
			result = doc.branchSet( branches, true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.an.array;
		expect( result, `${message} - ${action} result` ).not.to.be.empty;
		expect( doc.document, `${message} - ${action} branches` )
			.to.have.property( Dict.descriptor.kBranches );
		action = "Check branches";
		for( const branch of doc.document[ Dict.descriptor.kBranches ] )
			expect( branch, `${message} - ${action} branch value` ).to.be.a.string;
		
		//
		// Load modifiers.
		//
		if( modifiers !== null )
		{
			action = "Add modifiers";
			func = () => {
				result = doc.modifierSet( modifiers, true );
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			expect( result, `${message} - ${action} result` ).to.be.an.object;
			expect( doc.document, `${message} - ${action} modifiers` )
				.to.have.property( Dict.descriptor.kModifiers );
			action = "Check modifiers";
			for( const modifier in doc.document[ Dict.descriptor.kModifiers ] )
			{
				expect( modifier, `${message} - ${action} modifier property` ).to.be.a.string;
				expect( modifier, `${message} - ${action} modifier value` ).to.be.an.object;
			}
		}
		
		//
		// Prepare document for insert.
		//
		action = "Prepare for insert";
		func = () => {
			result = doc.insertDocument( false );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		expect( doc.document, `${message} - ${action} _id` ).not.to.have.property('_id');
		expect( doc.document, `${message} - ${action} _key` ).to.have.property('_key');
		
		//
		// Insert sample document.
		//
		action = "Insert in collection";
		collection = doc.collection;
		func = () => {
			meta =
				db._collection( collection )
					.insert( doc.document );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();

		//
		// Test instantiation with reference inferred collection same as default
		// collection.
		// Should succeed.
		//
		message = "Reference by _id with inferred collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					meta._id
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
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
		message = "Reference by _id with provided collection";
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
		// Test instantiation with key reference and default collection.
		// Should succeed.
		//
		message = "Reference by _key";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						meta._key
					);
			};
		else
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
	
	}	// testInstantiateFoundReference
	
	/**
	 * Instantiate with content and default collection.
	 *
	 * We overload this method to handle the reserved branches and modifiers fields
	 * which can only be set through a dedicated interface.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateWithContent( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check provided parameter.
		//
		expect( theParam, "Parameter not null").not.to.be.null;
		expect( theParam, "Parameter not an object").to.be.an.object;
		expect( theParam, `${message} - ${action}` ).not.to.be.empty;
		
		//
		// Instantiate example object to get default collection.
		//
		message = "Instantiate example document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		const default_collection = doc.defaultCollection;
		
		//
		// Clone parameter.
		//
		const param = K.function.clone(theParam);
		
		//
		// Save branches and modifiers from parameter,
		// and remove them from the parameter.
		//
		const branches = param[ Dict.descriptor.kBranches ];
		delete param[ Dict.descriptor.kBranches ];
		const modifiers = ( param.hasOwnProperty( Dict.descriptor.kModifiers ) )
						  ? K.function.clone(param[ Dict.descriptor.kModifiers ])
						  : null;
		if( modifiers !== null )
			delete param[ Dict.descriptor.kModifiers ];
		
		//
		// Handle default collection.
		//
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						param
					);
			};
		
		//
		// Handle provided collection.
		//
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						param,
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
		if( default_collection !== null )
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		else
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Load modifiers.
		//
		if( modifiers !== null )
		{
			action = "Add modifiers";
			func = () => {
				result = doc.modifierSet( modifiers, true );
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			expect( result, `${message} - ${action} result` ).to.be.an.object;
			expect( doc.document, `${message} - ${action} modifiers` )
				.to.have.property( Dict.descriptor.kModifiers );
			action = "Check modifiers";
			for( const modifier in doc.document[ Dict.descriptor.kModifiers ] )
			{
				expect( modifier, `${message} - ${action} modifier property` ).to.be.a.string;
				expect( modifier, `${message} - ${action} modifier value` ).to.be.an.object;
			}
		}
		
		//
		// Prepare document for insert.
		//
		action = "Prepare for insert";
		func = () => {
			result = doc.insertDocument( false );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		expect( doc.document, `${message} - ${action} _id` ).not.to.have.property('_id');
		expect( doc.document, `${message} - ${action} _key` ).to.have.property('_key');
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// MILKO
		//
		
		//
		// Instantiate with default collection and invalid property.
		// Should not fail, it will be caught before persisting.
		//
		const contents = K.function.clone( theParam );
		contents[ "UNKNOWN" ] = "Should not be there";
		message = "Instantiation with default collection and invalid property";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						contents
					);
			};
		
		//
		// Handle provided collection.
		//
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
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
		if( default_collection !== null )
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		else
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, contents );
		
		//
		// Instantiate with provided collection.
		//
		message = "Instantiation with provided collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
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
					this.parameters.request,
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
		
	}	// testInstantiateWithContent

}	// EdgeBranchUnitTest.

/**
 * Module exports
 */
module.exports = EdgeBranchUnitTest;
