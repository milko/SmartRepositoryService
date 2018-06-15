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
const K = require( '../../utils/Constants' );
const Dict = require( '../../dictionary/Dict' );
const MyError = require( '../../utils/MyError' );

//
// Test parameters.
//
const param = require( './paramDocument' );

//
// Base class.
//
const TestClass = require( '../../classes/Document' );

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
		this.instantiationUnitsInit();
/*
		this.unit_instantiation = [];
		this.unit_instantiation.push({
			name: "Instantiate class without selector and without collection",
			unit: 'instantiateNoSelectorNoCollection',
			clas: TestClass
		});
*/
/*
		this.unit_instantiation = {};
		this.unit_instantiation[ 'instantiateNoSelectorNoCollection' ] = {
			name: "Instantiate class without selector and without collection",
			clas: TestClass
		};
*/
	
	}	// constructor
	

	/****************************************************************************
	 * DEFAULT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define instantiation tests
	 *
	 * This method will load the instantiation tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 */
	instantiationUnitsInit()
	{
		//
		// Set instantiation test queue.
		//
		this.instantiationUnitSet(
			'instantiateNoSelectorNoCollection',
			"Instantiate class without selector and without collection",
			TestClass
		);
/*
		this.unit_instantiation = [];
		this.unit_instantiation.push({
			name: "Instantiate class without selector and without collection",
			unit: 'instantiateNoSelectorNoCollection',
			clas: TestClass
		});
*/
	
	}	// instantiationUnitsInit
	

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
	 * TEST UNIT SUITES INTERFACE												*
	 ****************************************************************************/
	
	/**
	 * Set instantiation unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 */
	instantiationUnitSet( theUnit, theName, theClass = TestClass ) {
		this.unitSet( 'unit_instantiation', theUnit, theName, theClass );
	}
	
	/**
	 * Get instantiation unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	instantiationUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_instantiation', theUnit );						// ==>
	}
	
	/**
	 * Delete instantiation unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	instantiationUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_instantiation', theUnit );						// ==>
	}
	
	
	/****************************************************************************
	 * TEST UNIT SUITES LOCAL INTERFACE											*
	 ****************************************************************************/
	
	/**
	 * Set unit test.
	 *
	 * This method can be used to set a unit test record, these records are stored as
	 * an object whose properties represent the method name of the unit test and their
	 * value is an object structured as follows:
	 *
	 * 	- name:	The unit test title, will be used for the 'describe'.
	 * 	- clas:	The class to test, if omitted, the default TestClass will be set.
	 *
	 * The method expects the following parameters:
	 *
	 * 	- theGroup:	The name of the data member that holds the unit tests of that group.
	 * 	- theUnit:	The unit test method name.
	 * 	- theName:	The unit test title, used in the 'it'.
	 * 	- theClass:	The class to test in the unit.
	 *
	 * @param theGroup		{String}		Unit test group data member name.
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 */
	unitSet( theGroup, theUnit, theName, theClass )
	{
		//
		// Init data member.
		//
		if( ! this.hasOwnProperty( theGroup ) )
			this[ theGroup ] = {};
		
		//
		// Init record.
		//
		if( ! this[ theGroup ].hasOwnProperty( theUnit ) )
			this[ theGroup ][ theUnit ] = {};
		
		//
		// Load record.
		//
		this[ theGroup ][ theUnit ].name = theName;
		this[ theGroup ][ theUnit ].clas = theClass;
		
	}	// unitSet
	
	/**
	 * Get unit test(s).
	 *
	 * This method can be used to retrieve the unit tests, provide a string to
	 * retrieve the unit test record corresponding to the string, or provide null or
	 * omit the parameter to retrieve all the instantiation tests.
	 *
	 * The instantiation unit test records are structured as follors:
	 *
	 * 	- unit:	The method name of the test, it contains an object:
	 * 		- name:	The unit test title, will be used for the 'describe'.
	 * 		- clas:	The class to test.
	 *
	 * If you provide a string, the method will return the matching unit object which
	 * contains the name and class; if you omit the parameter, the method will return
	 * all unit tests.
	 *
	 * If the current object does not have the unit tests data member, the method will
	 * return false; if the provided string doesn't match any unit test, the method
	 * will return null.
	 *
	 * The method expects the following parameters:
	 *
	 * 	- theGroup:	The name of the data member that holds the unit tests of that group.
	 * 	- theUnit:	The unit test method name.
	 *
	 * Note that the returned objects are not sealed, so modify them at your own risk.
	 *
	 * @param theGroup		{String}		Unit test group data member name.
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	unitGet( theGroup, theUnit = null )
	{
		//
		// Check data member.
		//
		if( ! this.hasOwnProperty( theGroup ) )
			return false;															// ==>
		
		//
		// Return all unit tests.
		//
		if( theUnit === null )
			return this[ theGroup ];												// ==>
		
		//
		// Handle unit record.
		//
		if( this[ theGroup ].hasOwnProperty( theUnit ) )
			return this[ theGroup ][ theUnit ];										// ==>
		
		return null;																// ==>
		
	}	// unitGet
	
	/**
	 * Delete unit test(s).
	 *
	 * This method can be used to remove the instantiation unit matching the provided
	 * string, the method will return the following values:
	 *
	 * 	- false:	If the current object does not have the instantiation unit test
	 * 				records data member.
	 * 	- null:		If the provided string doesn't match any record.
	 * 	- object:	The deleted record(s) if matched.
	 *
	 * If you omit the parameter, or pass null, the method will delete all the
	 * records, but keep the data member: be careful when calling this method.
	 *
	 * The unit test records are structured as follors:
	 *
	 * 	- unit:	The method name of the test, it contains an object:
	 * 		- name:	The unit test title, will be used for the 'describe'.
	 * 		- clas:	The class to test.
	 *
	 * The method expects the following parameters:
	 *
	 * 	- theGroup:	The name of the data member that holds the unit tests of that group.
	 * 	- theUnit:	The unit test method name.
	 *
	 * @param theGroup		{String}		Unit test group data member name.
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	unitDel( theGroup, theUnit = null )
	{
		//
		// Check data member.
		//
		if( ! this.hasOwnProperty( theGroup ) )
			return false;															// ==>
		
		//
		// Delete all unit tests.
		//
		if( theUnit === null )
		{
			//
			// Clone records.
			//
			const clone = K.function.clone(this[ theGroup ]);
			
			//
			// Delete records.
			//
			this[ theGroup ] = [];
			
			return clone;															// ==>
		}
		
		//
		// Handle unit record.
		//
		if( this[ theGroup ].hasOwnProperty( theUnit ) )
		{
			//
			// Clone record.
			//
			const clone = K.function.clone(this[ theGroup ][theUnit]);
			
			//
			// Delete records.
			//
			delete this[ theGroup ][theUnit];
			
			return clone;															// ==>
		}
		
		return null;																// ==>
		
	}	// unitDel
	
	
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
	
}	// ClassTest.

/**
 * Module exports
 */
module.exports = {
	class_base: TestClass,
	class_custom: TestClassCustom,
	class_test: ClassTest
};
