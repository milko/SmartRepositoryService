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
// Global tests.
//
const expect = require('chai').expect;

//
// Application and constants.
//
const K = require( '../utils/Constants' );
const MyError = require( '../utils/MyError' );

//
// Test classes.
//
const TestClass = require( '../classes/Transaction' );

//
// Test parameters.
//
const param = require( './parameters/Transaction' );



/********************************************************************************
 * FUNCTIONS																	*
 ********************************************************************************/

/**
 * Load transaction
 *
 * This function will load the transaction with insert, update, replace and delete
 * operations.
 *
 * @param theTransaction	{TestClass}	The transaction instance.
 * @param theParameters		{Object}	The transaction parameters.
 * @param theOperations		{Array}		The list of perations to perform.
 * @param doFail			{Boolean}	If true prepare fail scenario.
 */
function loadTransaction( theTransaction, theParameters, theOperations, doFail = false )
{
	let idx;
	let data;
	let func;
	let action;
	let message;
	let selector;
	
	//
	// Fill insert elements.
	//
	idx = 0;
	message = "Loading transaction";
	for( const doc of theParameters.documents )
	{
		//
		// Iterate operations.
		//
		for( const op of theOperations )
		{
			switch( op )
			{
				case 'I':
					action = "Insert document";
					func = () => {
						theTransaction.addOperation(
							op,									// Operation code.
							theParameters.collection_document,	// Collection name.
							null,								// Selector.
							doc,								// Data.
							false,								// waitForSync.
							true,								// Use result.
							false								// Stop after.
						);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					if( idx > 0 )
					{
						action = "Insert edge";
						func = () => {
							theTransaction.addOperation(
								op,									// Operation code.
								theParameters.collection_edge,		// Collection name.
								null,								// Selector.
								theParameters.edges[ idx - 1 ],		// Data.
								false,								// waitForSync.
								true,								// Use result.
								false								// Stop after.
							);
						};
						expect( func, `${message} - ${action}` ).not.to.throw();
					}
					break;
				
				case 'U':
					data = {
						var : `*${doc.var}`,
						name : `${doc.name} - Updated`
					};
					selector = {
						_key : doc._key
					};
					action = "Update document";
					func = () => {
						theTransaction.addOperation(
							op,									// Operation code.
							theParameters.collection_document,	// Collection name.
							selector,							// Selector.
							data,								// Data.
							false,								// waitForSync.
							true,								// Use result.
							false								// Stop after.
						);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					if( idx > 0 )
					{
						action = "Update edge";
						func = () => {
							theTransaction.addOperation(
								op,									// Operation code.
								theParameters.collection_edge,		// Collection name.
								{ _key : `EDGE${idx}` },			// Selector.
								{ name: "UPDATED" },				// Data.
								false,								// waitForSync.
								true,								// Use result.
								false								// Stop after.
							);
						};
						expect( func, `${message} - ${action}` ).not.to.throw();
					}
					break;
				
				case 'AS':
					action = "Add to set";
					selector = {
						_key : doc._key
					};
					for( let run = 1; run < 3; run++ )
					{
						for( let counter = 1; counter < 10; counter++ )
						{
							data = {
								set : `Element ${counter}`
							};
							
							func = () => {
								theTransaction.addOperation(
									op,									// Operation code.
									theParameters.collection_document,	// Collection name.
									selector,							// Selector.
									data,								// Data.
									false,								// waitForSync.
									false,								// Use result.
									false								// Stop after.
								);
							};
							expect( func, `${message} - ${action}` ).not.to.throw();
							
							if( idx > 0 )
							{
								action = "Update edge";
								func = () => {
									theTransaction.addOperation(
										op,									// Operation code.
										theParameters.collection_edge,		// Collection name.
										{ _key : `EDGE${idx}` },			// Selector.
										{ set: `New element ${counter}` },	// Data.
										false,								// waitForSync.
										false,								// Use result.
										false								// Stop after.
									);
								};
								expect( func, `${message} - ${action}` ).not.to.throw();
							}
						}
					}
					break;
				
				case 'R':
					data = {
						sym : `${idx}`
					};
					selector = {
						_key : doc._key
					};
					action = "Replace document";
					func = () => {
						theTransaction.addOperation(
							op,									// Operation code.
							theParameters.collection_document,	// Collection name.
							selector,							// Selector.
							data,								// Data.
							false,								// waitForSync.
							true,								// Use result.
							false								// Stop after.
						);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					if( doFail )
					{
						action = "Delete document to fail";
						func = () => {
							theTransaction.addOperation(
								'D',								// Operation code.
								theParameters.collection_document,	// Collection name.
								{ _key: 'NODE3' },					// Selector.
								null,								// Data.
								false,								// waitForSync.
								true,								// Use result.
								false								// Stop after.
							);
						};
						expect( func, `${message} - ${action}` ).not.to.throw();
					}
					break;
				
				case 'D':
					selector = {
						_key : doc._key
					};
					action = "Delete document";
					func = () => {
						theTransaction.addOperation(
							op,									// Operation code.
							theParameters.collection_document,	// Collection name.
							selector,							// Selector.
							null,								// Data.
							false,								// waitForSync.
							true,								// Use result.
							false								// Stop after.
						);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					if( idx > 0 )
					{
						action = "Delete edge";
						func = () => {
							theTransaction.addOperation(
								op,									// Operation code.
								theParameters.collection_edge,		// Collection name.
								{ _key : `EDGE${idx}` },			// Selector.
								null,								// Data.
								false,								// waitForSync.
								true,								// Use result.
								false								// Stop after.
							);
						};
						expect( func, `${message} - ${action}` ).not.to.throw();
					}
					break;
			}
		}
		
		idx++;
	
	}	// Iterating documents.
	
}	// Load transaction



/********************************************************************************
 * UNIT TESTS																	*
 ********************************************************************************/

/**
 * Document class tests
 *
 * We test the Document class.
 */
describe( "Document class tests:", function ()
{
	//
	// Check base class.
	//
	it( "Test class", function () {
		expect( K.function.className(TestClass), "Class" ).to.equal( 'Transaction' );
		expect( param.class, "Parameters" ).to.equal( 'Transaction' )
	});
	
	//
	// Prepare environment.
	//
	it( "Prepare environment", function ()
	{
		let name;
		let collection;
		
		//
		// Clear edges.
		//
		name = param.collection_edge;
		expect( function ()
		{
			collection = db._collection( name );
			if( ! collection )
			{
				db._createEdgeCollection( name, { waitForSync : true } );
				collection = db._collection( name );
			}
			else
				collection.truncate();
		}, "Clear Edges" ).not.to.throw();
		expect( collection.count(), "Edges count" ).to.equal( 0 );
		
		//
		// Clear documents.
		//
		name = param.collection_document;
		expect( function ()
		{
			collection = db._collection( name );
			if( ! collection )
			{
				db._createDocumentCollection( name, { waitForSync : true } );
				collection = db._collection( name );
			}
			else
				collection.truncate();
		}, "Clear Documents" ).not.to.throw();
		expect( collection.count(), "Documents count" ).to.equal( 0 );
	});
	
	//
	// Test transaction.
	//
	describe( "Test transaction:", function ()
	{
		//
		// Empty transaction.
		//
		it( "Empty transaction", function ()
		{
			let result;
			
			//
			// Instantiate ransaction.
			//
			const trans = new TestClass();
			
			//
			// Execute transaction.
			//
			const func = () => {
				result = trans.execute();
			};
			expect( func, "Execute transaction" ).not.to.throw();
			expect( result, "Transaction result" ).to.be.true;
		});
		
		//
		// Transaction without delete.
		//
		it( "Transaction without delete", function ()
		{
			let tmp;
			let func;
			let cursor;
			let result;
			let message;
			
			//
			// Instantiate ransaction.
			//
			const trans = new TestClass();
			
			//
			// Fill transaction.
			//
			loadTransaction( trans, param, [ 'I', 'U', 'AS', 'R' ] );
			
			//
			// Execute transaction.
			//
			message = "Executing transaction";
			func = () => {
				result = trans.execute();
			};
			expect( func, `${message}` ).not.to.throw();
			expect( result, `${message} - Result` ).to.be.an.object;
			
			//
			// Validate edge record count.
			//
			tmp = trans.record.collections.write[ 1 ];
			message = `Validating ${tmp} record count`;
			func = () => {
				result = db._collection( tmp ).count();
			};
			expect( func, `${message} - Counting records` ).not.to.throw();
			expect( result, `${message} - Record count` ).to.equal( 3 );
			
			//
			// Validate edge sets.
			//
			cursor = db._collection( tmp ).all();
			while( cursor.hasNext() )
			{
				const doc = cursor.next();
				if( doc.hasOwnProperty( 'set' ) )
					expect( doc.set.length, `${tmp} set elements for ${doc._key}` )
						.to.equal( 9 );
			}
			
			//
			// Validate document record count.
			//
			tmp = trans.record.collections.write[ 0 ];
			message = `Validating ${tmp} record count`;
			func = () => {
				result = db._collection( tmp ).count();
			};
			expect( func, `${message} - Counting records` ).not.to.throw();
			expect( result, `${message} - Record count` ).to.equal( 4 );
			
			//
			// Validate document sets.
			//
			cursor = db._collection( tmp ).all();
			while( cursor.hasNext() )
			{
				const doc = cursor.next();
				if( doc.hasOwnProperty( 'set' ) )
					expect( doc.set.length, `${tmp} set elements for ${doc._key}` )
						.to.equal( 9 );
			}
		});
		
		//
		// Clear collections.
		//
		it( "Clear collections", function ()
		{
			db._collection( param.collection_edge ).truncate();
			db._collection( param.collection_document ).truncate();
		});
		
		//
		// Transaction with delete.
		//
		it( "Transactions with delete", function ()
		{
			let tmp;
			let func;
			let result;
			let message;
			
			//
			// Instantiate ransaction.
			//
			const trans = new TestClass();
			
			//
			// Fill transaction.
			//
			loadTransaction( trans, param, [ 'I', 'U', 'AS', 'R', 'D' ] );
			
			//
			// Execute transaction.
			//
			message = "Executing transaction";
			func = () => {
				result = trans.execute();
			};
			expect( func, `${message}` ).not.to.throw();
			expect( result, `${message} - Result` ).to.be.an.object;
			
			//
			// Validate transaction.
			//
			tmp = trans.record.collections.write[ 0 ];
			message = `Validating ${tmp} record count`;
			func = () => {
				result = db._collection( tmp ).count();
			};
			expect( func, `${message} - Counting records` ).not.to.throw();
			expect( result, `${message} - Record count` ).to.equal( 0 );
		});
		
		//
		// Fail transaction.
		//
		it( "Fail transaction", function ()
		{
			let func;
			let result;
			let message;
			
			//
			// Instantiate ransaction.
			//
			const trans = new TestClass();
			
			//
			// Fill transaction.
			//
			loadTransaction( trans, param, [ 'I', 'U', 'AS', 'R', 'D' ], true );
			
			//
			// Execute transaction.
			//
			message = "Executing transaction";
			func = () => {
				result = trans.execute();
			};
			expect( func, `${message}` ).to.throw();
			
			//
			// Validate transaction.
			//
			message = "Validating transaction";
			func = () => {
				result = db._collection( trans.record.collections.write[ 0 ] ).count();
			};
			expect( func, `${message} - Counting records` ).not.to.throw();
			expect( result, `${message} - Record count` ).to.equal( 0 );
		});
	
	});
	
});
