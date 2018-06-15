'use strict';

//
// Global.
// describe, it
//

//
// Tests.
//
const should = require('chai').should();
const expect = require('chai').expect;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Test parameters.
//
const param = require( './paramDocument' );

//
// Base class.
//
const TestClass = require( '../classes/Document' );

//
// Base class with restrictions.
//
class TestClassCustom extends TestClass
{
	validateCollectionType( theCollection, doAssert = true )
	{
		return TestClass.isDocumentCollection(
			this._request,
			theCollection,
			doAssert
		);
	}
	
	validateDocumentConstraints( doAssert = true )
	{
		const result = super.validateDocumentConstraints(doAssert);
		if( result === true )
			return (! ( this._document.hasOwnProperty('name')
				&& (this._document.name === "CONSTRAINED") ));
		return result;
	}
	
	get defaultCollection()	{
		return param.collection_document;
	}
	
	get significantFields()	{
		return super.significantFields.concat([ ['nid', 'lid'] ]);
	}
	
	get requiredFields() {
		return super.requiredFields.concat(['var']);
	}
	
	get uniqueFields() {
		return super.uniqueFields.concat(['gid']);
	}
	
	get lockedFields() {
		return super.lockedFields.concat(['sym']);
	}
	
	get restrictedFields() {
		return super.restrictedFields.concat(['password']);
	}

}	// TestClassCustom


/**
 * Document test class
 *
 * This class defines the classes used in tests and implements common test patterns.
 */
class ClassTest
{
	/**
	 * Constructor
	 *
	 * We instantiate the class by providing the example references, the default edge
	 * and document collections, and the compatible collection.
	 *
	 * @param theRequest				{Object}	The current request.
	 * @param theExampleId				{String}	The example document _id.
	 * @param theExampleCollection		{String}	The example document collection.
	 * @param theEdgeCollection			{String}	The default edge collection.
	 * @param theDocumentCollection		{String}	The default document collection.
	 * @param theCompatibleCollection	{String}	The compatible collection.
	 */
	constructor(
		theRequest,
		theExampleId,
		theExampleCollection,
		theEdgeCollection,
		theDocumentCollection,
		theCompatibleCollection
	)
	{
		//
		// Set data members.
		//
		this.current_request = theRequest;

		this.edge_collection = theEdgeCollection;
		this.document_collection = theDocumentCollection;

		this.example_id = theExampleId;
		this.example_collection = theExampleCollection;

		this.compatible_collection = theCompatibleCollection;
		
		//
		// Set instantiation test queue.
		//
/*
		this.unit_instantiation = [];
		this.unit_instantiation.push({
			name: "Instantiate class without selector and without collection",
			unit: 'instantiateNoSelectorNoCollection',
			clas: TestClass
		});
*/
		this.unit_instantiation = {};
		this.unit_instantiation[ 'instantiateNoSelectorNoCollection' ] = {
			name: "Instantiate class without selector and without collection",
			clas: TestClass
		};
		
	}	// constructor
	

	/****************************************************************************
	 * TEST SUITES INITIALISERS													*
	 ****************************************************************************/
	
	/**
	 * Define instantiation tests
	 *
	 * This method will load the instantiation tests queue with the desired test
	 * records, each record is structured as follows:
	 *
	 * 	- name:	The test title used in the 'describe'.
	 * 	- unit:	The name of the method that runs all the 'it' tests.
	 * 	- clas:	The class to be used in the tests.
	 */
	testInstantiation()
	{
		//
		// Set instantiation test queue.
		//
/*
		this.unit_instantiation = [];
		this.unit_instantiation.push({
			name: "Instantiate class without selector and without collection",
			unit: 'instantiateNoSelectorNoCollection',
			clas: TestClass
		});
*/
	
	}	// testInstantiation
	

	/****************************************************************************
	 * INSTANTIATION TEST MODULES DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Instantiate class without selector and without collection
	 *
	 * Assert that instantiating the class without the reference and collection
	 * parameters raises an exception.
	 *
	 * @param theClass	{Function}	The class to test.
	 */
	instantiateNoSelectorNoCollection( theClass = TestClass )
	{
		//
		// Instantiate without selector and without collection
		//
		// Should raise Missing required parameter.
		//
		expect( () => {
			const tmp =
				new theClass(
					this.request
				);
		}).to.throw(
			MyError,
			/Missing required parameter/
		);
		
	}	// inst_selNo_colNo
	
	
	/****************************************************************************
	 * VALIDATION UTILITIES														*
	 ****************************************************************************/
	
	/**
	 * Validate replacing data in persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theMessage	{String}	The main error message part.
	 * @param theFlag		{Boolean}	The setDocumentProperties() replace flag.
	 * @param theObject		{Object}	The tested class instance.
	 * @param theNewData	{Object}	The data used for replace.
	 */
	validatePersistentReplace(
		theMessage,		// Error message.
		theFlag,		// Replace flag.
		theObject,		// The document object.
		theNewData		// The replacement data.
	)
	{
		//
		// Init local storage.
		//
		let op;
		let func;
		let action;
		let replace;
		const theOldData = JSON.parse(JSON.stringify(theObject.document));
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
		//
		for( const field in theNewData )
		{
			//
			// Set operation.
			//
			op = ( theNewData[ field ] === null ) ? 'Delete' : 'Replace';
			op = ( theObject.document.hasOwnProperty( field ) )
				 ? `${op} existing`
				 : `${op} missing`;
			
			//
			// Replace field function.
			//
			replace = {};
			replace[ field ] = theNewData[ field ];
			func = () => {
				theObject.setDocumentProperties(
					replace,
					theFlag
				);
			};
			
			//
			// Replace restricted field.
			//
			if( theObject.restrictedFields.includes( field ) )
			{
				action = `${op} restricted [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace significant field.
			//
			else if( significant.includes( field ) )
			{
				action = `${op} significant [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace required field.
			//
			else if( theObject.requiredFields.includes( field ) )
			{
				action = `${op} required [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace unique field.
			//
			else if( theObject.uniqueFields.includes( field ) )
			{
				action = `${op} unique [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace locked field.
			//
			else if( theObject.lockedFields.includes( field ) )
			{
				action = `${op} locked [${field}]`;
				expect( func, `${theMessage} - ${action}`
				).to.throw(
					MyError,
					/Property is locked/
				);
			}
			
			//
			// Replace field.
			//
			else
			{
				action = `${op} [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
		}	// Iterating replace properties.
		
		//
		// Check contents.
		//
		this.validatePersistentContents
		(
			theFlag,						// Replace flag.
			theMessage,						// Error message.
			theOldData,						// Data before replace.
			theObject.document,				// The object to test.
			theNewData,						// The replacement data.
			theObject.restrictedFields,		// Restricted fields.
			theObject.requiredFields,		// Required fields.
			theObject.lockedFields,			// Locked fields.
			theObject.uniqueFields,			// Unique fields.
			theObject.significantFields		// Significant fields.
		);
		
	}	// validatePersistentReplace

	/**
	 * Validate replacing data in non persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theMessage	{String}	The main error message part.
	 * @param theFlag		{Boolean}	The setDocumentProperties() replace flag.
	 * @param theObject		{Object}	The tested class instance.
	 * @param theNewData	{Object}	The data used for replace.
	 */
	validateNonPersistentReplace(
		theMessage,		// Error message.
		theFlag,		// Replace flag.
		theObject,		// The document object.
		theNewData		// The replacement data.
	)
	{
		//
		// Init local storage.
		//
		let op;
		let func;
		let action;
		let replace;
		const theOldData = JSON.parse(JSON.stringify(theObject.document));
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
		//
		for( const field in theNewData )
		{
			//
			// Set operation.
			//
			op = ( theNewData[ field ] === null ) ? 'Delete' : 'Replace';
			op = ( theObject.document.hasOwnProperty( field ) )
				 ? `${op} existing`
				 : `${op} missing`;
			
			//
			// Replace field function.
			//
			replace = {};
			replace[ field ] = theNewData[ field ];
			func = () => {
				theObject.setDocumentProperties(
					replace,
					theFlag
				);
			};
			
			//
			// Replace restricted field.
			// Should succeed.
			//
			if( theObject.restrictedFields.includes( field ) )
			{
				action = `${op} restricted [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace significant field.
			// Should succeed.
			//
			else if( significant.includes( field ) )
			{
				action = `${op} significant [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace required field.
			// Should succeed.
			//
			else if( theObject.requiredFields.includes( field ) )
			{
				action = `${op} required [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace unique field.
			// Should succeed.
			//
			else if( theObject.uniqueFields.includes( field ) )
			{
				action = `${op} unique [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace locked field.
			// Should succeed.
			//
			else if( theObject.lockedFields.includes( field ) )
			{
				action = `${op} unique [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace field.
			// Should succeed.
			//
			else
			{
				action = `${op} [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
		}	// Iterating replace properties.
		
		//
		// Check contents.
		//
		this.validateNonPersistentContents
		(
			theFlag,						// Replace flag.
			theMessage,						// Error message.
			theOldData,						// Data before replace.
			theObject.document,				// The object to test.
			theNewData,						// The replacement data.
			theObject.restrictedFields,		// Restricted fields.
			theObject.requiredFields,		// Required fields.
			theObject.lockedFields,			// Locked fields.
			theObject.uniqueFields,			// Unique fields.
			theObject.significantFields		// Significant fields.
		);
		
	}	// validateNonPersistentReplace

	/**
	 * Validate replaced data contents in persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theFlag			{Boolean}	The setDocumentProperties() replace flag.
	 * @param theMessage		{String}	The main error message part.
	 * @param theSource			{Object}	The original object.
	 * @param theDestination	{Object}	The replaced object.
	 * @param theReplaced		{Object}	The replacement data.
	 * @param theRestricted		{Array}		List of restricted fields.
	 * @param theRequired		{Array}		List of required fields.
	 * @param theLocked			{Array}		List of locked fields.
	 * @param theUnique			{Array}		List of unique fields.
	 * @param theSignificant	{Array}		List of significant fields.
	 */
	validatePersistentContents(
		theFlag,				// Replace flag.
		theMessage,				// Error message.
		theSource,				// Data before replace.
		theDestination,			// The object to test.
		theReplaced,			// The replacement data.
		theRestricted = [],		// Restricted fields.
		theRequired = [],		// Required fields.
		theLocked = [],			// Locked fields.
		theUnique = [],			// Unique fields.
		theSignificant = []		// Significant fields.
	)
	{
		let status;
		let action;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theSignificant.length > 0 )
			significant = K.function.flatten(theSignificant);
		
		//
		// Iterate provided replacement properties.
		//
		for( const field in theReplaced )
		{
			//
			// Set action.
			//
			if( theRestricted.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( theRequired.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( theUnique.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else if( theLocked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Handle provided value and not restricted.
			//
			if( (status !== 'R')					// Restricted field,
			 && (theReplaced[ field ] !== null) )	// or deleted field.
			{
				//
				// Assert field is there.
				//
				expect( theDestination, `${theMessage} - ${action}` ).to.have.property(field);
				if( theDestination.hasOwnProperty( field ) )
				{
					//
					// Check if setting or replacing.
					//
					const was_there = ( theSource.hasOwnProperty( field ) );
					
					//
					// Handle true replace flag.
					//
					if( theFlag )
					{
						//
						// Parse by descriptor status.
						//
						switch( status )
						{
							//
							// Locked fields cannot be replaced,
							// An exception will be thrown when replacing.
							//
							case 'L':
								compareContents(
									theSource[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are replaced.
							//
							case 'S':
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are replaced.
							//
							case 'Q':
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are replaced.
							//
							case 'U':
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are replaced.
							//
							default:
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is true.
					
					//
					// Handle false replace flag.
					//
					else
					{
						//
						// Parse by descriptor status.
						//
						switch( status )
						{
							//
							// Locked fields cannot be replaced,
							// An exception will be thrown when replacing.
							//
							case 'L':
								compareContents(
									theSource[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are not replaced.
							//
							case 'S':
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are not replaced.
							//
							case 'Q':
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are not replaced.
							//
							case 'U':
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are not replaced.
							//
							default:
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is false.
					
				}	// Has field.
				
			}	// Neither restricted nor deleted.
			
			//
			// Handle restricted or deleted fields.
			// Should not have been set, or should have been deleted.
			//
			else
			{
				//
				// Update action.
				//
				if( theReplaced[ field ] !== null )
					action += " deleted";
				
				//
				// Assert property is not there.
				//
				expect( theDestination, `${theMessage} - ${action}` )
					.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replaced properties.
	
	}	// validatePersistentContents

	/**
	 * Validate replaced data contents in non persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theFlag			{Boolean}	The setDocumentProperties() replace flag.
	 * @param theMessage		{String}	The main error message part.
	 * @param theSource			{Object}	The original object.
	 * @param theDestination	{Object}	The replaced object.
	 * @param theReplaced		{Object}	The replacement data.
	 * @param theRestricted		{Array}		List of restricted fields.
	 * @param theRequired		{Array}		List of required fields.
	 * @param theLocked			{Array}		List of locked fields.
	 * @param theUnique			{Array}		List of unique fields.
	 * @param theSignificant	{Array}		List of significant fields.
	 */
	validateNonPersistentContents(
		theFlag,				// Replace flag.
		theMessage,				// Error message.
		theSource,				// Data before replace.
		theDestination,			// The object to test.
		theReplaced,			// The replacement data.
		theRestricted = [],		// Restricted fields.
		theRequired = [],		// Required fields.
		theLocked = [],			// Locked fields.
		theUnique = [],			// Unique fields.
		theSignificant = []		// Significant fields.
	)
	{
		let status;
		let action;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theSignificant.length > 0 )
			significant = K.function.flatten(theSignificant);
		
		//
		// Iterate provided replacement properties.
		//
		for( const field in theReplaced )
		{
			//
			// Set action.
			//
			if( theRestricted.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( theRequired.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( theUnique.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else if( theLocked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Handle provided value and not restricted.
			//
			if( (status !== 'R')					// Restricted field,
			 && (theReplaced[ field ] !== null) )	// or deleted field.
			{
				//
				// Assert field is there.
				//
				expect( theDestination, `${theMessage} - ${action}` ).to.have.property(field);
				if( theDestination.hasOwnProperty( field ) )
				{
					//
					// Check if setting or replacing.
					//
					const was_there = ( theSource.hasOwnProperty( field ) );
					
					//
					// Handle true replace flag.
					//
					if( theFlag )
					{
						//
						// Parse by descriptor status.
						//
						switch( status )
						{
							//
							// Locked fields are replaced,
							//
							case 'L':
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are replaced.
							//
							case 'S':
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are replaced.
							//
							case 'Q':
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are replaced.
							//
							case 'U':
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are replaced.
							//
							default:
								compareContents(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is true.
					
					//
					// Handle false replace flag.
					//
					else
					{
						//
						// Parse by descriptor status.
						//
						switch( status )
						{
							//
							// Locked fields are replaced,
							//
							case 'L':
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are replaced.
							//
							case 'S':
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are replaced.
							//
							case 'Q':
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are replaced.
							//
							case 'U':
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are replaced.
							//
							default:
								compareContents(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is false.
					
				}	// Has field.
				
			}	// Neither restricted nor deleted.
			
			//
			// Handle restricted or deleted fields.
			// Should not have been set, or should have been deleted.
			//
			else
			{
				//
				// Update action.
				//
				if( theReplaced[ field ] !== null )
					action += " deleted";
				
				//
				// Assert property is not there.
				//
				expect( theDestination, `${theMessage} - ${action}` )
					.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replaced properties.
		
	}	// validateNonPersistentContents

	/**
	 * Compare values
	 *
	 * This method can be used to compare values, it will assert that the destination
	 * has the value and that it is equal to the source value.
	 *
	 * The method can be invoked also with two objects, in that case it will recurse
	 * with all properties.
	 *
	 * @param theSource			{*}|{Object}	Scalar or object.
	 * @param theDestination	{*}|{Object}	Scalar or object.
	 * @param theMessage		{String}		Main error message.
	 * @param theAction			{String}		Secondary error message.
	 */
	compareValues(
		theSource,			// The provided value or object values.
		theDestination,		// The existing value.
		theMessage,			// The main error message.
		theAction			// The secondary error message.
	)
	{
		//
		// Handle objects.
		//
		if( K.function.isObject( theSource ) )
		{
			//
			// Iterate members.
			//
			for( const member in theSource )
			{
				//
				// Check if there.
				//
				expect(
					theDestination,
					`${theMessage} - Field [${field}] - Has property [${member}]`
				).to.have.property(member);
				
				//
				// Check contents.
				//
				compareContents(
					theSource[ member ],
					theDestination[ member ],
					theMessage,
					`Field [${field}] - With property [${member}]`
				);
			}
		}
		
		//
		// Handle other types.
		//
		else
		{
			//
			// Handle arrays.
			//
			if( Array.isArray( theSource ) )
				expect( theDestination, `${theMessage} - ${theAction}` )
					.to.have.members( theSource );
			
			//
			// Handle scalars.
			//
			else
				expect( theDestination, `${theMessage} - ${theAction}` ).to.equal( theSource );
		}
	
	}	// compareContents
	
	
	/****************************************************************************
	 * MEMBER GETTERS															*
	 ****************************************************************************/
	
	/**
	 * Return current request.
	 *
	 * @return {Object}
	 */
	get request()				{	return this.current_request;	}
	
	/**
	 * Return default edge collection.
	 *
	 * @return {String}
	 */
	get edgeCollection()		{	return this.edge_collection;	}
	
	/**
	 * Return default document collection.
	 *
	 * @return {String}
	 */
	get documentCollection()	{	return this.document_collection;	}
	
	/**
	 * Return default compatible collection.
	 *
	 * @return {String}
	 */
	get compatibleCollection()	{	return this.compatible_collection;	}
	
	/**
	 * Return example document _id.
	 *
	 * @return {String}
	 */
	get exampleId()				{	return this.example_id;	}
	
	/**
	 * Return example document collection.
	 *
	 * @return {String}
	 */
	get exampleCollection()		{	return this.example_collection;	}
	
	
	/****************************************************************************
	 * UNIT TEST GETTERS														*
	 ****************************************************************************/
	
	get instantiationUnit()		{	return this.unit_instantiation;	}
	
}	// ClassTest.

/**
 * Module exports
 */
module.exports = {
	class_base: TestClass,
	class_custom: TestClassCustom,
	class_test: ClassTest
};
