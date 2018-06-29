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
 * EdgeBranch test class
 *
 * This class defines the classes used in tests and implements common test patterns.
 */
class EdgeBranchUnitTest extends EdgeUnitTest
{
	/****************************************************************************
	 * DEFAULT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
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
		// Test branch management in document.
		// Assert it succeeds.
		//
		this.customUnitSet(
			'customSetBranchInDocument',
			"Test managing branches in document:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Test modifiers management in document.
		// Assert it succeeds.
		//
		this.customUnitSet(
			'customSetModifierInDocument',
			"Test managing modifiers in document:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Test branch management in database.
		// Assert it succeeds.
		//
		this.customUnitSet(
			'customSetBranchInDatabase',
			"Test managing branches in database:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Test modifiers management in database.
		// Assert it succeeds.
		//
		this.customUnitSet(
			'customSetModifierInDatabase',
			"Test managing modifiers in database:",
			this.test_classes.base,
			null,
			true
		);
		
	}	// unitsInitCustom
	
	
	/****************************************************************************
	 * CUSTOM TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test branch management in document.
	 *
	 * Perform the following tests:
	 *
	 * 	- Instantiate an edge and add branches, as string and array.
	 * 	- Delete branches and assert the deleted branches are not there.
	 * 	- Assert that when all branches are deleted the branches member is deleted.
	 * 	- Assert that when replacing the edge it is deleted if no branches are there.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	customSetBranchInDocument( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testCustomSetBranchInDocument(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testCustomSetBranchInDocument(
				this.test_classes.custom, theParam );
		
	}	// customSetBranchInDocument
	
	/**
	 * Test modifiers management in document.
	 *
	 * Perform the following tests:
	 *
	 * 	- Instantiate an edge and add modifiers.
	 * 	- Delete modifiers and assert the deleted modifiers are not there.
	 * 	- Assert that when all modifiers are deleted the modifiers member is deleted.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	customSetModifierInDocument( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testCustomSetModifierInDocument(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testCustomSetModifierInDocument(
				this.test_classes.custom, theParam );
		
	}	// customSetModifierInDocument
	
	/**
	 * Test branch management in database.
	 *
	 * Perform the following tests:
	 *
	 * 	- Instantiate an edge and add branches, as string and array.
	 * 	- Delete branches and assert the deleted branches are not there.
	 * 	- Assert that when all branches are deleted the edge is deleted.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	customSetBranchInDatabase( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testCustomSetBranchInDatabase(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testCustomSetBranchInDatabase(
				this.test_classes.custom, theParam );
		
	}	// customSetBranchInDatabase
	
	/**
	 * Test modifiers management in database.
	 *
	 * Perform the following tests:
	 *
	 * 	- Add modifiers.
	 * 	- Delete modifiers and assert the deleted modifiers are not there.
	 * 	- Assert that when all modifiers are deleted the modifiers member is deleted.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	customSetModifierInDatabase( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testCustomSetModifierInDatabase(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testCustomSetModifierInDatabase(
				this.test_classes.custom, theParam );
		
	}	// customSetModifierInDatabase
	
	
	/****************************************************************************
	 * CUSTOM TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test branch management in document.
	 *
	 * Perform the following tests:
	 *
	 * 	- Instantiate an edge and add branches, as string and array.
	 * 	- Delete branches and assert the deleted branches are not there.
	 * 	- Assert that when all branches are deleted the branches member is deleted.
	 * 	- Assert that when replacing the edge it is deleted if no branches are there.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testCustomSetBranchInDocument( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		let func;
		let count;
		let branch;
		let result;
		let action;
		let message;
		let branches;
		
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
		expect( doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Save clone for later.
		//
		const clone = K.function.clone( doc.document );
		
		//
		// Add a string branch.
		//
		message = "Add a string branch";
		branch = "terms/:type:data";
		func = () => {
			branches = doc.branchSet( branch, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has added branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch );
		count = doc.document[ Dict.descriptor.kBranches ].length;
		
		//
		// Add the same string branch.
		//
		message = "Add the same string branch";
		func = () => {
			branches = doc.branchSet( branch, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has added same branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch );
		action = "Has not duplicate branch";
		expect( doc.document[ Dict.descriptor.kBranches ].length, `${message} - ${action}` )
			.to.equal( count );
		
		//
		// Add an array string branch.
		//
		message = "Add an array string branch";
		branch = [ "terms/:type:scalar", "terms/:type:container" ];
		func = () => {
			branches = doc.branchSet( branch, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has added branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch[ 0 ] );
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch[ 1 ] );
		count = doc.document[ Dict.descriptor.kBranches ].length;
		
		//
		// Add the same array string branch.
		//
		message = "Add the same array string branch";
		func = () => {
			branches = doc.branchSet( branch, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has added branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch[ 0 ] );
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch[ 1 ] );
		action = "Has not duplicate branch";
		expect( doc.document[ Dict.descriptor.kBranches ].length, `${message} - ${action}` )
			.to.equal( count );
		
		//
		// Delete a string branch.
		//
		message = "Delete a string branch";
		branch = "terms/:type:data";
		func = () => {
			branches = doc.branchSet( branch, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has deleted branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch );
		count = doc.document[ Dict.descriptor.kBranches ].length;
		
		//
		// Delete the same string branch.
		//
		message = "Delete the same string branch";
		func = () => {
			branches = doc.branchSet( branch, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has deleted branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch );
		action = "Has not deleted more";
		expect( doc.document[ Dict.descriptor.kBranches ].length, `${message} - ${action}` )
			.to.equal( count );
		
		//
		// Delete an array string branch.
		//
		message = "Delete an array string branch";
		branch = [ "terms/:type:scalar", "terms/:type:container" ];
		func = () => {
			branches = doc.branchSet( branch, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has deleted branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch[ 0 ] );
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch[ 1 ] );
		count = doc.document[ Dict.descriptor.kBranches ].length;
		
		//
		// Delete the same array string branch.
		//
		message = "Delete the same array string branch";
		func = () => {
			branches = doc.branchSet( branch, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has deleted branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch[ 0 ] );
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch[ 1 ] );
		action = "Has not deleted more";
		expect( doc.document[ Dict.descriptor.kBranches ].length, `${message} - ${action}` )
			.to.equal( count );
		
		//
		// Delete last branch.
		//
		message = "Delete last branch";
		branch = "terms/:type:domain";
		func = () => {
			branches = doc.branchSet( branch, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has deleted branches property";
		expect( doc.document, `${message} - ${action}` )
			.not.to.have.property( Dict.descriptor.kBranches );
		
		//
		// Add a branch to a non existing member.
		//
		message = "Add a branch to a non existing member";
		func = () => {
			branches = doc.branchSet( branch, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has branches";
		expect( doc.document, `${message} - ${action}` )
			.to.have.property( Dict.descriptor.kBranches );
		
		//
		// Delete last branch.
		//
		message = "Delete last branch";
		func = () => {
			branches = doc.branchSet( branch, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has deleted branches property";
		expect( doc.document, `${message} - ${action}` )
			.not.to.have.property( Dict.descriptor.kBranches );
		
		//
		// Delete a branch from non existing member.
		//
		message = "Delete a branch from non existing member";
		branch = "terms/:type:data";
		func = () => {
			branches = doc.branchSet( branch, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Operation result";
		expect( branches, `${message} - ${action}` ).to.be.null;
		
		//
		// Replace without branch.
		//
		message = "Replace with all branches deleted";
		func = () => {
			result = doc.replaceDocument( true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Was deleted";
		expect( db._exists( clone._id ), `${message} - ${action}` )
				.to.be.false;
		
		//
		// Restore edge.
		//
		message = "Restore edge";
		func = () => {
			db._collection(this.defaultTestCollection).insert(clone);
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testCustomSetBranchInDocument
	
	/**
	 * Test modifiers management in document.
	 *
	 * Perform the following tests:
	 *
	 * 	- Instantiate an edge and add modifiers.
	 * 	- Delete modifiers and assert the deleted modifiers are not there.
	 * 	- Assert that when all modifiers are deleted the modifiers member is deleted.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testCustomSetModifierInDocument( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		let func;
		let result;
		let action;
		let message;
		let modifier;
		let modifiers;
		
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
		expect( doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Save clone for later.
		//
		const clone = K.function.clone( doc.document );
		
		//
		// Add a modifier.
		//
		message = "Add a modifier";
		modifier = {
			"terms/:type:data" : {
				name: "added"
			}
		};
		func = () => {
			modifiers = doc.modifierSet( modifier, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has added modifier";
		expect( doc.document[ Dict.descriptor.kModifiers ], `${message} - ${action}` )
			.to.have.property( "terms/:type:data" );
		action = "Added modifier property";
		expect(
			doc.document[ Dict.descriptor.kModifiers ][ "terms/:type:data" ],
			`${message} - ${action}` )
			.to.have.property( "name" );
		action = "Added modifier property value";
		expect(
			doc.document[ Dict.descriptor.kModifiers ][ "terms/:type:data" ].name,
			`${message} - ${action}` )
			.to.equal( "added" );
		action = "Created branch";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( "terms/:type:data" );
		
		//
		// Change a modifier.
		//
		message = "Change a modifier";
		modifier = {
			"terms/:type:data" : {
				name: "changed"
			}
		};
		func = () => {
			modifiers = doc.modifierSet( modifier, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has changed modifier";
		expect( doc.document[ Dict.descriptor.kModifiers ], `${message} - ${action}` )
			.to.have.property( "terms/:type:data" );
		action = "Changed modifier property";
		expect(
			doc.document[ Dict.descriptor.kModifiers ][ "terms/:type:data" ],
			`${message} - ${action}` )
			.to.have.property( "name" );
		action = "Changed modifier property value";
		expect(
			doc.document[ Dict.descriptor.kModifiers ][ "terms/:type:data" ].name,
			`${message} - ${action}` )
			.to.equal( "changed" );
		
		//
		// Delete a modifier.
		//
		message = "Delete a modifier";
		modifier = {
			"terms/:type:data" : null
		};
		func = () => {
			modifiers = doc.modifierSet( modifier, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Has deleted modifier";
		expect( doc.document[ Dict.descriptor.kModifiers ], `${message} - ${action}` )
			.not.to.have.property( "terms/:type:data" );
		
		//
		// Delete last modifier.
		//
		message = "Delete last modifier";
		modifier = {
			"terms/:type:domain" : null
		};
		func = () => {
			modifiers = doc.modifierSet( modifier, false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Deleted modifiers property";
		expect( doc.document, `${message} - ${action}` )
			.not.to.have.property( Dict.descriptor.kModifiers );
		
		//
		// Expect branches still to be there.
		//
		message = "Expect branches to still be there.";
		expect( doc.document[ Dict.descriptor.kBranches ], `${message}` )
			.to.include( "terms/:type:data" );
		expect( doc.document[ Dict.descriptor.kBranches ], `${message}` )
			.to.include( "terms/:type:domain" );
		
		//
		// Delete edge.
		//
		message = "Delete edge";
		func = () => {
			db._remove(clone._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Restore edge.
		//
		message = "Restore edge";
		func = () => {
			db._collection(this.defaultTestCollection).insert(clone);
		};
		expect( func, `${message}` ).not.to.throw();
	
	}	// testCustomSetModifierInDocument
	
	/**
	 * Test branch management in database.
	 *
	 * Perform the following tests:
	 *
	 * 	- Instantiate an edge and add branches, as string and array.
	 * 	- Delete branches and assert the deleted branches are not there.
	 * 	- Assert that when all branches are deleted the edge is deleted.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testCustomSetBranchInDatabase( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		let func;
		let count;
		let branch;
		let result;
		let action;
		let message;
		let branches;
		let persistent;
		
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
		expect( doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Save clone for later.
		//
		const clone = K.function.clone( doc.document );
		
		//
		// Add a string branch.
		//
		message = "Add a string branch";
		branch = "terms/:type:data";
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					true						// Add.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has added branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch );
		count = persistent[ Dict.descriptor.kBranches ].length;
		
		//
		// Add the same string branch.
		//
		message = "Add the same string branch";
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					true						// Add.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has added same branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch );
		action = "Has not duplicate branch";
		expect( persistent[ Dict.descriptor.kBranches ].length, `${message} - ${action}` )
			.to.equal( count );
		
		//
		// Add an array branch.
		//
		message = "Add an array branch";
		branch = [ "terms/:type:scalar", "terms/:type:container" ];
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					true						// Add.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has added branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch[ 0 ] );
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch[ 1 ] );
		count = persistent[ Dict.descriptor.kBranches ].length;
		
		//
		// Add the same array string branch.
		//
		message = "Add the same array string branch";
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					true						// Add.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has added branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch[ 0 ] );
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( branch[ 1 ] );
		action = "Has not duplicate branch";
		expect( persistent[ Dict.descriptor.kBranches ].length, `${message} - ${action}` )
			.to.equal( count );
		
		//
		// Delete a string branch.
		//
		message = "Delete a string branch";
		branch = "terms/:type:data";
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					false						// Delete.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has deleted branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch );
		count = persistent[ Dict.descriptor.kBranches ].length;
		
		//
		// Delete the same string branch.
		//
		message = "Delete the same string branch";
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					false						// Delete.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has deleted branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch );
		action = "Has not deleted more";
		expect( persistent[ Dict.descriptor.kBranches ].length, `${message} - ${action}` )
			.to.equal( count );
		
		//
		// Delete an array string branch.
		//
		message = "Delete an array string branch";
		branch = [ "terms/:type:scalar", "terms/:type:container" ];
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					false						// Delete.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has deleted branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch[ 0 ] );
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch[ 1 ] );
		count = persistent[ Dict.descriptor.kBranches ].length;
		
		//
		// Delete the same array string branch.
		//
		message = "Delete the same array string branch";
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					false						// Delete.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has deleted branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch[ 0 ] );
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.not.to.include( branch[ 1 ] );
		action = "Has not deleted more";
		expect( persistent[ Dict.descriptor.kBranches ].length, `${message} - ${action}` )
			.to.equal( count );
		
		//
		// Delete last branch.
		//
		message = "Delete last branch";
		branch = "terms/:type:domain";
		func = () => {
			branches =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					branch,						// Branch.
					null,						// Modifier (unused).
					null,						// Collection (inferred).
					false						// Delete.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Check edge in database";
		func = () => {
			result = db._exists( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( db._exists( clone._id ), `${message} - ${action}` ).to.be.false;
		
		//
		// Restore edge.
		//
		message = "Restore edge";
		func = () => {
			db._collection(this.defaultTestCollection).insert(clone);
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testCustomSetBranchInDatabase
	
	/**
	 * Test modifiers management in database.
	 *
	 * Perform the following tests:
	 *
	 * 	- Add modifiers.
	 * 	- Delete modifiers and assert the deleted modifiers are not there.
	 * 	- Assert that when all modifiers are deleted the modifiers member is deleted.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testCustomSetModifierInDatabase( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		let func;
		let result;
		let action;
		let message;
		let modifier;
		let modifiers;
		let persistent;
		
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
		expect( doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Save clone for later.
		//
		const clone = K.function.clone( doc.document );
		
		//
		// Add a modifier.
		//
		message = "Add a modifier";
		modifier = {
			"terms/:type:data" : {
				name: "added"
			}
		};
		func = () => {
			modifiers =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					null,						// Branch (unused).
					modifier,					// Modifier.
					null,						// Collection (inferred).
					true						// Add.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has added modifier";
		expect( persistent[ Dict.descriptor.kModifiers ], `${message} - ${action}` )
			.to.have.property( "terms/:type:data" );
		action = "Added modifier property";
		expect(
			persistent[ Dict.descriptor.kModifiers ][ "terms/:type:data" ],
			`${message} - ${action}` )
			.to.have.property( "name" );
		action = "Added modifier property value";
		expect(
			persistent[ Dict.descriptor.kModifiers ][ "terms/:type:data" ].name,
			`${message} - ${action}` )
			.to.equal( "added" );
		action = "Created branch";
		expect( persistent[ Dict.descriptor.kBranches ], `${message} - ${action}` )
			.to.include( "terms/:type:data" );
		
		//
		// Change a modifier.
		//
		message = "Change a modifier";
		modifier = {
			"terms/:type:data" : {
				name: "changed"
			}
		};
		func = () => {
			modifiers =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					null,						// Branch (unused).
					modifier,					// Modifier.
					null,						// Collection (inferred).
					true						// Add.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has changed modifier";
		expect( persistent[ Dict.descriptor.kModifiers ], `${message} - ${action}` )
			.to.have.property( "terms/:type:data" );
		action = "Changed modifier property";
		expect(
			persistent[ Dict.descriptor.kModifiers ][ "terms/:type:data" ],
			`${message} - ${action}` )
			.to.have.property( "name" );
		action = "Changed modifier property value";
		expect(
			persistent[ Dict.descriptor.kModifiers ][ "terms/:type:data" ].name,
			`${message} - ${action}` )
			.to.equal( "changed" );
		
		//
		// Delete a modifier.
		//
		message = "Delete a modifier";
		modifier = {
			"terms/:type:data" : null
		};
		func = () => {
			modifiers =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					null,						// Branch (unused).
					modifier,					// Modifier.
					null,						// Collection (inferred).
					false						// Delete.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Has deleted modifier";
		expect( persistent[ Dict.descriptor.kModifiers ], `${message} - ${action}` )
			.not.to.have.property( "terms/:type:data" );
		
		//
		// Delete last modifier.
		//
		message = "Delete last modifier";
		modifier = {
			"terms/:type:domain" : null
		};
		func = () => {
			modifiers =
				theClass.BranchUpdate(
					this.parameters.request,	// Current request.
					clone._id,					// Edge reference.
					null,						// Branch (unused).
					modifier,					// Modifier.
					null,						// Collection (inferred).
					false						// Delete.
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Retrieve edge";
		func = () => {
			persistent = db._document( clone._id );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Deleted modifiers property";
		expect( persistent, `${message} - ${action}` )
			.not.to.have.property( Dict.descriptor.kModifiers );
		
		//
		// Expect branches still to be there.
		//
		message = "Expect branches to still be there.";
		expect( persistent[ Dict.descriptor.kBranches ], `${message}` )
			.to.include( "terms/:type:data" );
		expect( persistent[ Dict.descriptor.kBranches ], `${message}` )
			.to.include( "terms/:type:domain" );
		
		//
		// Delete edge.
		//
		message = "Delete edge";
		func = () => {
			db._remove(clone._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Restore edge.
		//
		message = "Restore edge";
		func = () => {
			db._collection(this.defaultTestCollection).insert(clone);
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testCustomSetModifierInDatabase

}	// EdgeBranchUnitTest.

/**
 * Module exports
 */
module.exports = EdgeBranchUnitTest;
