'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;

//
// Application.
//
const K = require( '../utils/Constants' );
const MyError = require( '../utils/MyError' );


/**
 * Transaction class
 *
 * This class implements a transaction, the steps to execute a transaction are as follows:
 *
 * 	- Instantiate a transaction object.
 * 	- Collect data and operations to be executed in order and pass the information to
 * 	  the addOperation() method, this will take care of updating the read and write
 * 	  collections and add the insert, update, replace and remove operations.
 * 	- Call the execute() method to commit the transaction.
 *
 * The execute() method either succeeds, or raises an exception.
 *
 * The transaction should receive all the necessary data, there will be no database
 * reads, the sequence of operations should involve storing or deleting data, all
 * other needed data should be collected beforehand.
 *
 * The ArangoDB transaction parameters are structured as an array of structures shaped
 * as follows:
 *
 * 	- op:			The operation, it can be:
 * 		- I:		Insert: waitForSync on.
 * 		- U:		Update: waitForSync on, keepNull off and mergeObjects off.
 * 		- AS:		Append to set: appends an element to a set.
 * 		- R:		Replace: waitForSync on and overwrite off.
 * 		- D:		Remove.
 *
 * 	- collection:	The collection name.
 *
 * 	- selector:		The selector according to the operation:
 * 		- I:		Not used for inserting.
 * 		- U:		The update target selector.
 * 		- AS:		The document _id.
 * 		- R:		The replacement selector.
 * 		- D:		The selector for the removed object.
 *
 * 	- data:			The operation data, this represents, according to the operation:
 * 		- I:		The data to be inserted.
 * 		- U:		The update data.
 * 		- AS:		The element to append as { field : element }.
 * 		- R:		The replacement data.
 * 		- D:		Not used when removing.
 *
 * 	- sync:			A boolean indicating whether to set the waitForSync option on.
 * 	- result:		A boolean indicating whether the resut should be taken from the
 * 					current operation.
 * 	- abort:		A boolean indicating whether to abort the transaction after the
 * 					current operation. Note that this doesn't mean a failure, it only
 * 					terminates successfully the transaction: errors must be thrown.
 *
 * The execute() method will return the result of the operation in which the result
 * parameter is true, this means that it will be the result of the last operation with
 * that parameter true.
 *
 * The transaction does not raise custom exceptions, it will forward whatever
 * exception it encounters.
 *
 * Note: all operations in which options are supported, will set the waitForSync to
 * true if not indicated explicitly.
 */
class Transaction
{
	/**
	 * Constructor
	 *
	 * The constructor will initialise the the ArangoDB transaction record.
	 */
	constructor()
	{
		//
		// Init transaction record.
		//
		this.record = {};
		
		//
		// Init collections element.
		//
		this.record.collections = {};
		
		//
		// Init action function.
		//
		this.record.action = () => {};
		
		//
		// Init parameters element.
		//
		this.record.params = [];
		
	}	// constructor
	
	/**
	 * Append an operation to the transaction
	 *
	 * This method will append an operation to the transaction, see the class
	 * description for a definition of the parameters.
	 *
	 * @param theOp			{String}	Operation code [I, U, R, D].
	 * @param theCollection	{String}	Collection name.
	 * @param theSelector	{Object}	Object selector or query.
	 * @param theData		{Object)	Object data.
	 * @param doSync		{Boolean}	If false don't waitForSync (defaults to true).
	 * @param doResult		{Boolean}	If true, use operation result for transaction.
	 * @param doAbort		{Boolean}	If true, end transaction after operation.
	 * @returns {Number}				The operation index.
	 */
	addOperation
	(
		theOp,				// Operation code [I, U, AS, R, D].
		theCollection,		// Collection name.
		theSelector,		// Object selector.
		theData,			// Object data.
		doSync = true,		// waitForSync.
		doResult = false,	// Use for result.
		doAbort = false		// End transaction.
	)
	{
		//
		// Init local storage.
		//
		const record = {};
		
		//
		// Parse operation.
		//
		switch( theOp )
		{
			//
			// Insert.
			//
			case 'I':
				record.op = theOp;
				record.collection = theCollection;
				record.data = theData;
				record.sync = doSync;
				record.result = doResult;
				record.abort = doAbort;
				
				this.addWriteCollection( theCollection );
				break;
			
			//
			// Update.
			//
			case 'U':
				record.op = theOp;
				record.collection = theCollection;
				record.data = theData;
				record.selector = theSelector;
				record.sync = doSync;
				record.result = doResult;
				record.abort = doAbort;
				
				this.addReadCollection( theCollection );
				this.addWriteCollection( theCollection );
				break;
			
			//
			// Append to set.
			//
			case 'AS':
				record.op = theOp;
				record.collection = theCollection;
				record.data = theData;
				record.selector = theSelector;
				record.sync = doSync;
				record.result = doResult;
				record.abort = doAbort;
				
				this.addReadCollection( theCollection );
				this.addWriteCollection( theCollection );
				break;
			
			//
			// Replace.
			//
			case 'R':
				record.op = theOp;
				record.collection = theCollection;
				record.data = theData;
				record.selector = theSelector;
				record.sync = doSync;
				record.result = doResult;
				record.abort = doAbort;
				
				this.addReadCollection( theCollection );
				this.addWriteCollection( theCollection );
				break;
			
			//
			// Remove.
			//
			case 'D':
				record.op = theOp;
				record.collection = theCollection;
				record.selector = theSelector;
				record.sync = doSync;
				record.result = doResult;
				record.abort = doAbort;
				
				this.addReadCollection( theCollection );
				this.addWriteCollection( theCollection );
				break;
			
			default:
				throw(
					new MyError(
						'BadParam',								// Error name.
						K.error.BadTransOpCode,					// Message code.
						this._request.application.language,		// Language.
						theOp,									// Arguments.
						500										// HTTP error code.
					)
				);																// !@! ==>
		}
		
		//
		// Get index.
		//
		const index = this.record.params.length;
		
		//
		// Add operation.
		//
		this.record.params.push( record );
		
		return index;																// ==>
		
	}	// addOperation
	
	/**
	 * This method will execute the transaction
	 *
	 * The method will add the 'action' element to the Arangodb transaction record and
	 * pass the record to the db._executeTransaction() method.
	 *
	 * The default result value is true.
	 */
	execute()
	{
		//
		// Define default transaction action.
		//
		this.record.action = function ( theParameters )
		{
			//
			// Init local storage.
			//
			let result = true;
			
			//
			// Iterate operations.
			//
			for( const record of theParameters )
			{
				//
				// Set waitForSync flag.
				//
				let waitForSync = true;
				if( record.hasOwnProperty( 'sync' )
				 && (record.sync === false) )
					waitForSync = false;
				
				//
				// Check collection.
				//
				if( ! record.hasOwnProperty( 'collection' ) )
					throw new Error(
						"Missing collection parameter in transaction record."
					);															// !@! ==>
				
				//
				// Set collection.
				//
				const collection = db._collection( record.collection );
				if( ! collection )
					throw new Error(
						`Invalid collection [${record.collection}] in transaction record.`
					);															// !@! ==>
				
				//
				// Check operation.
				//
				if( ! record.hasOwnProperty( 'op' ) )
					throw new Error(
						"Missing operation parameter in transaction record."
					);															// !@! ==>
				
				//
				// Parse by operation.
				//
				let meta;
				switch( record.op )
				{
					//
					// Insert.
					//
					case 'I':
						//
						// Assert data.
						//
						if( ! record.hasOwnProperty( 'data' ) )
							throw new Error(
								"Missing data parameter in insert transaction record."
							);													// !@! ==>
						
						meta = collection.insert(
							record.data,
							{ waitForSync: waitForSync }
						);
						break;
					
					//
					// Update.
					//
					case 'U':
						//
						// Assert data.
						//
						if( ! record.hasOwnProperty( 'data' ) )
							throw new Error(
								"Missing data parameter in update transaction record."
							);													// !@! ==>
						
						//
						// Assert selector.
						//
						if( ! record.hasOwnProperty( 'selector' ) )
							throw new Error(
								"Missing selector parameter in update transaction record."
							);													// !@! ==>
						
						meta = collection.update(
							record.selector,
							record.data,
							{
								waitForSync : waitForSync,
								keepNull	: false,
								mergeObjects: false
							}
						);
						break;
					
					//
					// Add to set.
					//
					case 'AS':
						//
						// Assert data.
						//
						if( ! record.hasOwnProperty( 'data' ) )
							throw new Error(
								"Missing data parameter in add to set transaction record."
							);													// !@! ==>
						
						//
						// Assert selector.
						//
						if( ! record.hasOwnProperty( 'selector' ) )
							throw new Error(
								"Missing selector parameter in add to set transaction record."
							);													// !@! ==>
						
						//
						// Extract field and element to append.
						//
						let descriptor;
						let element;
						for( const field in record.data )
						{
							descriptor = field;
							element = record.data[ field ];
						}
						
						db._query( aql`
							FOR doc IN ${collection}
								FILTER ${record.selector}
							UPDATE doc WITH { ${descriptor} : APPEND( doc.${descriptor}, ${[ element ]}, true ) }
							IN ${collection}
						`);
						break;
					
					//
					// Replace.
					//
					case 'R':
						//
						// Assert data.
						//
						if( ! record.hasOwnProperty( 'data' ) )
							throw new Error(
								"Missing data parameter in replace transaction record."
							);													// !@! ==>
						
						//
						// Assert selector.
						//
						if( ! record.hasOwnProperty( 'selector' ) )
							throw new Error(
								"Missing selector parameter in replace transaction record."
							);													// !@! ==>
						
						meta = collection.replace(
							record.selector,
							record.data,
							{
								waitForSync : waitForSync,
								overwrite	: false
							}
						);
						break;
					
					//
					// Remove.
					//
					case 'D':
						//
						// Assert selector.
						//
						if( ! record.hasOwnProperty( 'selector' ) )
							throw new Error(
								"Missing selector parameter in remove transaction record."
							);													// !@! ==>
						
						meta = collection.remove(
							record.selector,
							{
								waitForSync : waitForSync,
								overwrite	: false
							}
						);
						break;
					
					default:
						throw new Error(
							`Unknown operation code [${this.record.op}] in transaction.`
						);														// !@! ==>
				}
				
				//
				// Set result.
				//
				if( record.hasOwnProperty( 'result' )
				 && (record.result === true) )
					result = JSON.parse(JSON.stringify(meta));
				
				//
				// Terminate transaction.
				//
				if( record.hasOwnProperty( 'abort' )
				 && (record.abort === true) )
					break;														// =>
				
			}	// Iterating transaction operations.
			
			return result;															// ==>
		
		};	// Transaction default action.
		
		return db._executeTransaction( this.record );								// ==>
	
	}	// execute
	
	/**
	 * Add read collection
	 *
	 * This method will add the provided collection to the read collections.
	 *
	 * @param theCollection
	 */
	addReadCollection( theCollection )
	{
		//
		// Create list.
		//
		if( ! this.record.collections.hasOwnProperty( 'read' ) )
			this.record.collections.read = [];
		
		//
		// Add collection.
		//
		if( ! this.record.collections.read.includes( theCollection ) )
			this.record.collections.read.push( theCollection );
		
	}	// addReadCollection
	
	/**
	 * Add write collection
	 *
	 * This method will add the provided collection to the write collections.
	 *
	 * @param theCollection
	 */
	addWriteCollection( theCollection )
	{
		//
		// Create list.
		//
		if( ! this.record.collections.hasOwnProperty( 'write' ) )
			this.record.collections.write = [];
		
		//
		// Add collection.
		//
		if( ! this.record.collections.write.includes( theCollection ) )
			this.record.collections.write.push( theCollection );
		
	}	// addWriteCollection
	
}	// Transaction.

module.exports = Transaction;
