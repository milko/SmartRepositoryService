'use strict';

//
// Global.
// describe, it
//

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;

//
// Tests.
//
const should = require('chai').should();
const expect = require('chai').expect;

//
// Test parameters.
//
const param = require( './paramDocument' );

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Set default collection names.
//
const wrong_collection   = param.collection_edge;
const default_collection = param.collection_document;
const compatible_collection = 'toponyms';

//
// Globals.
//
const example_id = 'descriptors/name';
const example_collection = 'descriptors';

//
// Base Document class.
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
		return default_collection;
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
}

//
// Function: replacePersistentProperties()
//
// This function will replace the values in the provided object and perform the
// required assertions and checks.
//
// The function will only make assertions, it will then call another function that
// will compare object contents.
//
// All replacements are done one property at the time.
//
function checkPersistentReplace
(
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
	checkPersistentReplacedContents
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
	
}	// checkPersistentReplace

//
// Function: checkPersistentReplacedContents()
//
// This function can be used to check the contents of a persistent document after
// replacing values, it will assert:
//	- If the replace flag is false:
//		- If the field is restricted, it will be ignored.
//		- The method will only raise an exception if you provide a locked field.
//		- In all other cases, the values are not replaced.
//
function checkPersistentReplacedContents
(
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
								theReplaced[ field ],
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
								theReplaced[ field ],
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
								theReplaced[ field ],
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
								theReplaced[ field ],
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
								( was_there ) ? theSource[ field ] : theReplaced[ field ],
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
								( was_there ) ? theSource[ field ] : theReplaced[ field ],
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
								( was_there ) ? theSource[ field ] : theReplaced[ field ],
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
								( was_there ) ? theSource[ field ] : theReplaced[ field ],
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
	
}	// checkPersistentReplacedContents

//
// Function: checkNonPersistentReplacedContents()
//
// This function can be used to check the contents of a non persistent document after
// replacing values, it will assert:
// 	- That restricted fields are not in the destination.
//	- That all other fields are in the destination.
//	- That locked fields are always replaced, regardless of replace flag.
//	- That no fields, except locked, are replaced if the flag is off.
//	- That all fields are replaced if the flag is on.
//
function checkNonPersistentReplacedContents(
	theFlag,
	theMessage,
	theSource,
	theDestination,
	theReplaced,
	theRestricted = [],
	theRequired = [],
	theLocked = [],
	theUnique = [],
	theSignificant = []
)
{
	let action;
	
	for( const field in theSource )
	{
		//
		// Handle restricted fields.
		//
		if( theRestricted.includes( field ) )
		{
			action = `Restricted field [${field}]`;
			expect( theDestination, `${theMessage} - ${action}` ).not.to.have.property(field);
		}
		
		//
		// Handle other fields.
		//
		else
		{
			//
			// Assert field is there.
			//
			action = `Has field [${field}]`;
			expect( theDestination, `${theMessage} - ${action}` ).to.have.property(field);
			if( theDestination.hasOwnProperty( field ) )
			{
				//
				// Check locked fields.
				//
				if( theLocked.includes( field ) )
					compareContents(
						theReplaced[ field ],
						theDestination[ field ],
						theMessage,
						`Field [${field}] contents`
					);
				
				//
				// Check other fields.
				//
				else
				{
					//
					// Handle true replace flag.
					// Everything should be replaced.
					//
					if( theFlag )
						compareContents(
							theReplaced[ field ],
							theDestination[ field ],
							theMessage,
							`Field [${field}] contents`
						);
					
					//
					// Handle true replace flag.
					// Nothing should be replaced.
					//
					else
						compareContents(
							theSource[ field ],
							theDestination[ field ],
							theMessage,
							`Field [${field}] contents`
						);
				}
			}
		}
	}
	
}	// checkNonPersistentReplacedContents

//
// Function: checkContents()
//
// This function can be used to check the contents of the document, it will assert:
// 	- That restricted fields are not in the destination.
//	- That all the source non restricted fields are in the destination.
//	- That all the source non restricted fields match the source.
//
function checkContents(
	theMessage,
	theSource,
	theDestination,
	theRestricted = []
)
{
	let action;
	
	for( const field in theSource )
	{
		//
		// Handle restricted fields.
		//
		if( theRestricted.includes( field ) )
		{
			action = `Restricted field [${field}]`;
			expect( theDestination, `${theMessage} - ${action}` ).not.to.have.property(field);
		}
		
		//
		// Handle other fields.
		//
		else
		{
			//
			// Assert field is there.
			//
			action = `Has field [${field}]`;
			expect( theDestination, `${theMessage} - ${action}` ).to.have.property(field);
			if( theDestination.hasOwnProperty( field ) )
			{
				//
				// Check contents.
				//
				compareContents(
					theSource[ field ],
					theDestination[ field ],
					theMessage,
					`Field [${field}] contents`
				);
			}
		}
	}
	
}	// checkContents

//
// Function: compareContents()
//
// This function can be used to compare the contents of two values.
//
function compareContents( theSource, theDestination, theMessage, theAction )
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
}

//
// Clear collections.
//
if( ! db._collection( param.collection_edge  ) )
	db._createEdgeCollection( param.collection_edge, { waitForSync : true } );
else
	db._collection( param.collection_edge ).truncate();
if( ! db._collection( param.collection_document ) )
	db._createDocumentCollection( param.collection_document, { waitForSync : true } );
else
	db._collection( param.collection_document ).truncate();


/**
 * Document class tests
 *
 * We test the Document class.
 */
describe( "Document class tests:", function ()
{
	//
	// Instantiation tests.
	//
	describe( "Instantiation:", function ()
	{
		//
		// Instantiate without selector and without collection.
		//
		// Should raise Missing required parameter.
		//
		it( "Instantiate without selector and without collection:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request
					);
			}).to.throw(
				MyError,
				/Missing required parameter/
			);
		});
		
		//
		// Instantiate with null selector and without collection.
		//
		// Should raise Missing required parameter.
		//
		it( "Instantiate with null selector and without collection:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request,
						null
					);
			}).to.throw(
				MyError,
				/Missing required parameter/
			);
		});
		
		//
		// Instantiate with null selector and non existant collection.
		//
		// Should raise unknown or invalid collection name.
		//
		it( "Instantiate with null selector and non existant collection:", function ()
		{
			//
			// Remove test collection.
			//
			const collection = db._collection( 'test' );
			if( collection )
				db._drop( 'test' );
			
			//
			// Test.
			//
			expect( () => {
				const tmp =
					new TestClass(
						param.request,
						null,
						'test'
					);
			}).to.throw(
				MyError,
				/unknown or invalid collection name/
			);
		});
		
		//
		// Instantiate with default collection.
		//
		// Should not raise: uses default collection.
		//
		it( "Instantiate with default collection:", function ()
		{
			let doc;
			let func;
			let message;
			let action;
			
			message = "Missing selector and missing collection";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Collection name";
			expect( doc.collection, `${message} - ${action}` )
				.to.equal(doc.defaultCollection);
			
			message = "Null selector and provided collection";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request,
						null,
						compatible_collection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Collection name";
			expect( doc.collection, `${message} - ${action}` )
				.to.equal(compatible_collection);
			
			message = "Existing reference and missing collection";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request,
						example_id
					);
			};
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/Invalid document reference: cross-collection reference/
			);
		});
		
		//
		// Instantiate with existing edge collection.
		//
		// Should not raise: the Document class accepts any collection type.
		//
		it( "Instantiate with existing edge collection:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request,
						null,
						param.collection_edge
					);
			}).not.to.throw();
		});
		
		//
		// Instantiate with existing document collection.
		//
		// Should not raise: the Document class accepts any collection type.
		//
		it( "Instantiate with existing document collection:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request,
						null,
						param.collection_document
					);
			}).not.to.throw();
		});
		
		//
		// Instantiate mutable/immutable document.
		//
		// Should return immutable only when instantiating from found reference.
		//
		it( "Instantiate mutable/immutable document:", function ()
		{
			let doc;
			let func;
			let message;
			let action;
			
			message = "Empty mutable document";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClass(
						param.request,
						null,
						default_collection,
						false
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Should be mutable";
			expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
			action = "Modified flag";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			message = "Empty immutable document";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClass(
						param.request,
						null,
						default_collection,
						true
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Should be mutable";
			expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
			action = "Modified flag";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			message = "Filled mutable document";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClass(
						param.request,
						param.content,
						default_collection,
						false
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Should be mutable";
			expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
			action = "Modified flag";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			message = "Filled immutable document";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClass(
						param.request,
						param.content,
						default_collection,
						true
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Should be mutable";
			expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
			action = "Modified flag";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			message = "Referenced mutable document";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClass(
						param.request,
						example_id,
						example_collection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Should be mutable";
			expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
			action = "Modified flag";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			message = "Referenced immutable document";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClass(
						param.request,
						example_id,
						example_collection,
						true
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Should be immutable";
			expect( doc.document, `${message} - ${action}` ).to.be.sealed;
			action = "Modified flag";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
		});
		
		//
		// Instantiate with invalid _id reference.
		//
		// Should raise not found in collection.
		//
		it( "Instantiate with invalid _id reference:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request,
						`XXXXXXXX`
					);
			}).to.throw(
				MyError,
				/invalid object reference handle/
			);
		});
		
		//
		// Instantiate with cross-collection reference.
		//
		// Should raise cross-collection reference.
		//
		it( "Instantiate with cross-collection reference:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request,
						example_id,
						default_collection
					);
			}).to.throw(
				MyError,
				/cross-collection reference/
			);
		});
		
		//
		// Instantiate with not found _id reference.
		//
		// Should raise not found in collection.
		//
		it( "Instantiate with not found reference:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request,
						`${default_collection}/XXXXXXXX`,
						default_collection
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		});
		
		//
		// Instantiate with found reference and no collection.
		//
		// Should resolve collection from _id, or raise illegal document handle.
		//
		it( "Instantiate with found reference and no collection:", function ()
		{
			let doc;
			let func;
			let message;
			let action;
			
			message = "Found _id reference";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClass(
						param.request,
						example_id
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(example_collection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.true;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
		});
		
		//
		// Instantiate with content.
		//
		// The document should contain all the provided data, except restricted fields.
		//
		it( "Instantiate with content:", function ()
		{
			let doc;
			let func;
			let message;
			let action;
			
			//
			// Instantiate.
			//
			message = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request,
						param.content
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Check object state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(default_collection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			//
			// Check content.
			//
			checkContents( "Check contents", param.content, doc.document, doc.restrictedFields );
		});
		
	});	// Instantiation.
	
	//
	// Content tests.
	//
	describe( "Content:", function ()
	{
		//
		// Load empty object.
		//
		//
		//
		it( "Load empty object:", function ()
		{
			let doc;
			let func;
			let message;
			let action;
			
			//
			// Instantiate.
			//
			message = "Replace flag is false";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object empty state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			//
			// Load data.
			//
			action = "Set document properties";
			func = () => {
				doc.setDocumentProperties(
					param.content,
					false
				);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			//
			// Check content.
			//
			checkContents( message, param.content, doc.document, doc.restrictedFields );
			
			//
			// Instantiate.
			//
			message = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Check object empty state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			//
			// Load data.
			//
			message = "Set document properties";
			action = "Replace flag is true";
			func = () => {
				doc.setDocumentProperties(
					param.content,
					true
				);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			//
			// Check content.
			//
			checkContents( message, param.content, doc.document, doc.restrictedFields );
		});
		
		//
		// Load filled and non persistent object.
		//
		// Besides no errors and environment checks, the contents are validated as
		// follows:
		//
		// 	- Restricted fields are not copied.
		//	- All other fields are copied.
		//	- Locked fields are always replaced, regardless of replace flag.
		//	- No fields, except locked, are replaced if the flag is off.
		//	- All fields are replaced if the flag is on.
		//
		it( "Load filled non persistent object:", function ()
		{
			let doc;
			let func;
			let message;
			let action;
			
			//
			// Instantiate.
			//
			message = "Provided original content";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request,
						param.content
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object original state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			//
			// Check content.
			//
			checkContents( message, param.content, doc.document, doc.restrictedFields );
			
			//
			// Load data.
			//
			message = "Replace flag is false";
			action = "Set document properties";
			func = () => {
				doc.setDocumentProperties(
					param.replace,
					false
				);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.true;
			
			//
			// Check content.
			//
			checkNonPersistentReplacedContents(
				false,
				message,
				param.content,
				doc.document,
				param.replace,
				doc.restrictedFields,
				doc.requiredFields,
				doc.lockedFields,
				doc.uniqueFields,
				doc.significantFields
			);
			
			//
			// Instantiate.
			//
			message = "Provided original content";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request,
						param.content
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object original state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			//
			// Check content.
			//
			checkContents( message, param.content, doc.document, doc.restrictedFields );
			
			//
			// Load data.
			//
			message = "Replace flag is true";
			action = "Set document properties";
			func = () => {
				doc.setDocumentProperties(
					param.replace,
					true
				);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object loaded state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.false;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.true;
			
			//
			// Check content.
			//
			checkNonPersistentReplacedContents(
				true,
				message,
				param.content,
				doc.document,
				param.replace,
				doc.restrictedFields,
				doc.requiredFields,
				doc.lockedFields,
				doc.uniqueFields,
				doc.significantFields
			);
		});
		
		//
		// Load persistent object.
		//
		// Besides no errors and environment checks, the contents are validated as
		// follows:
		//
		// 	- Restricted fields are not copied.
		//	- All other fields are copied.
		//	- Locked fields are always replaced, regardless of replace flag.
		//	- No fields, except locked, are replaced if the flag is off.
		//	- All fields are replaced if the flag is on.
		//
		it( "Load persistent object:", function ()
		{
			let id;
			let doc;
			let data;
			let func;
			let result;
			let action;
			let message;
			let replace;
			let original;
			
			//
			// Instantiate.
			//
			message = "Persistent copy";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request,
						param.content
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Insert object.
			//
			action = "Insertion";
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Insertion result";
			expect( result, `${message} - ${action}` ).to.be.true;
			
			//
			// Save ID.
			//
			id = doc.document._id;
			
			//
			// Instantiate.
			//
			message = "Resolving from reference";
			action = "Instantiation";
			func = () => {
				doc =
					new TestClassCustom(
						param.request,
						id
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.true;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			//
			// Check content.
			//
			checkContents( message, param.content, doc.document, doc.restrictedFields );
			
			//
			// Replace values.
			//
			message = "Replace value and flag is off";
			checkPersistentReplace(
				message,			// Error message.
				false,				// Replace flag.
				doc,				// The document object.
				param.replace		// The replacement data.
			);
			
			//
			// Check object replaced state.
			//
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.be.true;
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.be.false;
			
			/*
			 //
			 // Flatten significant fields.
			 //
			 let significant = [];
			 if( doc.significantFields.length > 0 )
			 significant = K.function.flatten(doc.significantFields);
			 
			 //
			 // Replace properties.
			 //
			 message = "Replace value and flag is off";
			 for( const field in param.replace )
			 {
			 //
			 // Replace field function.
			 //
			 replace = {};
			 replace[ field ] = param.replace[ field ];
			 func = () => {
			 doc.setDocumentProperties(
			 replace,
			 false
			 );
			 };
			 
			 //
			 // Replace restricted field.
			 //
			 if( doc.restrictedFields.includes( field ) )
			 {
			 action = `Replace restricted [${field}]`;
			 expect( func, `${message} - ${action}`).not.to.throw();
			 }
			 
			 //
			 // Replace significant field.
			 //
			 else if( significant.includes( field ) )
			 {
			 action = `Replace significant [${field}]`;
			 expect( func, `${message} - ${action}`).not.to.throw();
			 }
			 
			 //
			 // Replace required field.
			 //
			 else if( doc.requiredFields.includes( field ) )
			 {
			 action = `Replace required [${field}]`;
			 expect( func, `${message} - ${action}`).not.to.throw();
			 }
			 
			 //
			 // Replace unique field.
			 //
			 else if( doc.uniqueFields.includes( field ) )
			 {
			 action = `Replace unique [${field}]`;
			 expect( func, `${message} - ${action}`).not.to.throw();
			 }
			 
			 //
			 // Replace locked field.
			 //
			 else if( doc.lockedFields.includes( field ) )
			 {
			 action = `Replace locked [${field}]`;
			 expect( func, `${message} - ${action}`
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
			 action = `Replace [${field}]`;
			 expect( func, `${message} - ${action}`).not.to.throw();
			 }
			 
			 }	// Iterating replace properties.
			 
			 //
			 // Check object replace state.
			 //
			 action = "Contents";
			 expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			 action = "Collection";
			 expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			 action = "Persistent";
			 expect( doc.persistent, `${message} - ${action}` ).to.be.true;
			 action = "Modified";
			 expect( doc.modified, `${message} - ${action}` ).to.be.false;
			 
			 //
			 // Check contents.
			 //
			 checkPersistentReplacedContents
			 (
			 false,						// Replace flag.
			 message,					// Error message.
			 param.content,				// Data before replace.
			 doc.document,				// The object to test.
			 param.replace,				// The replacement data.
			 doc.restrictedFields,		// Restricted fields.
			 doc.requiredFields,			// Required fields.
			 doc.lockedFields,			// Locked fields.
			 doc.uniqueFields,			// Unique fields.
			 doc.significantFields		// Significant fields.
			 );
			 */
			
			/*
			 //
			 // Replace with same values.
			 //
			 message = "Replace same value and flag is off";
			 replace = JSON.parse(JSON.stringify(doc.document));
			 func = () => {
			 doc.setDocumentProperties(
			 replace,
			 false
			 );
			 };
			 expect( func, `${message} - ${action}`).not.to.throw();
			 
			 //
			 // Check object replace state.
			 //
			 action = "Contents";
			 expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			 action = "Collection";
			 expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
			 action = "Persistent";
			 expect( doc.persistent, `${message} - ${action}` ).to.be.true;
			 action = "Modified";
			 expect( doc.modified, `${message} - ${action}` ).to.be.false;
			 
			 //
			 // Check contents.
			 //
			 checkPersistentReplacedContents
			 (
			 false,						// Replace flag.
			 message,					// Error message.
			 replace,					// Data before replace.
			 doc.document,				// The object to test.
			 replace,					// The replacement data.
			 doc.restrictedFields,		// Restricted fields.
			 doc.requiredFields,			// Required fields.
			 doc.lockedFields,			// Locked fields.
			 doc.uniqueFields,			// Unique fields.
			 doc.significantFields		// Significant fields.
			 );
			 */
		});
		
		/*
		 //
		 // Replace persistent object locked field.
		 //
		 // Should raise an exception regardless of replace flag.
		 //
		 it( "Replace persistent object locked field:", function ()
		 {
		 let doc;
		 let func;
		 
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request, example_id, example_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 
		 const locked = doc.lockedFields;
		 if( locked.length > 0 )
		 {
		 func = () => {
		 doc.setDocumentProperties( param.replace, true );
		 };
		 expect( func, "Load" ).to.throw( MyError, /Property is locked/ );
		 expect(doc.modified, "Modified flag").to.equal(false);
		 
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request, example_id, example_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 
		 func = () => {
		 doc.setDocumentProperties( param.replace, false );
		 };
		 expect( func, "Load" ).to.throw( MyError, /Property is locked/ );
		 expect(doc.modified, "Modified flag").to.equal(false);
		 }
		 });
		 */
		
	});	// Contents.
	
	//
	// Persistence globals.
	//
	let key_insert_empty;
	let key_insert_filled;
	let key_insert_same;
	
	//
	// Insert tests.
	//
	describe( "Insert:", function ()
	{
		/*
		 //
		 // Insert empty object.
		 //
		 // Should not fail.
		 //
		 it( "Insert empty object:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, null, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.insertDocument();
		 };
		 expect( func, "Insert" ).not.to.throw();
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 for( const field of doc.localFields )
		 expect(doc.document, "Has local fields").to.have.property(field);
		 expect( result, "Insert result" ).to.equal( true );
		 expect( doc.persistent, "Persistent flag").to.equal(true);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 key_insert_empty = doc.document._key;
		 });
		 
		 //
		 // Insert object without required field.
		 //
		 // Should fail.
		 //
		 it( "Insert object without required field:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request, param.content, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 doc.setDocumentProperties({ var: null, name: "pippo" });
		 func = () => {
		 result = doc.insertDocument();
		 };
		 expect( func, "Insert" )
		 .to.throw( MyError, /missing required field/ );
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 expect( doc.document, "Should have the field").to.have.property('name');
		 expect( result, "Insert result" ).to.equal( undefined );
		 expect( doc.persistent, "Persistent flag").to.equal(false);
		 expect( doc.modified, "Modified flag").to.equal(true);
		 });
		 
		 //
		 // Insert object without significant field.
		 //
		 // Should not fail.
		 //
		 it( "Insert object without significant field:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassSignificant(
		 param.request, {name : "No Significant"}, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.insertDocument();
		 };
		 expect( func, "Insert" ).not.to.throw();
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 expect( result, "Insert result" ).to.equal( true );
		 expect( doc.persistent, "Persistent flag").to.equal(true);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 });
		 
		 //
		 // Insert object with content.
		 //
		 // Should not fail.
		 //
		 it( "Insert object with content:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request, param.content, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.insertDocument();
		 };
		 expect( func, "Insert" ).not.to.throw();
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 for( const field of doc.localFields )
		 expect(doc.document, "Has local fields").to.have.property(field);
		 expect( result, "Insert result" ).to.equal( true );
		 expect( doc.persistent, "Persistent flag").to.equal(true);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 key_insert_filled = doc.document._key;
		 });
		 
		 //
		 // Insert duplicate object.
		 //
		 // Should fail.
		 //
		 it( "Insert duplicate object:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, {_key: key_insert_filled}, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.insertDocument();
		 };
		 expect( func, "Insert" )
		 .to.throw( MyError, /duplicate document in collection/ );
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 for( const field of doc.localFields )
		 {
		 if( field !== '_key' )
		 expect(doc.document, "Has local fields").not.to.have.property(field);
		 }
		 expect( result, "Insert result" ).to.equal( undefined );
		 expect( doc.persistent, "Persistent flag").to.equal(false);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 });
		 
		 //
		 // Insert object with same content.
		 //
		 // Should not fail: _key is unique, other unique fields will fail.
		 //
		 it( "Insert object with same content:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassRestricted(
		 param.request, param.content, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.insertDocument();
		 };
		 expect( func, "Insert" ).not.to.throw();
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 for( const field of doc.localFields )
		 expect(doc.document, "Has local fields").to.have.property(field);
		 expect( result, "Insert result" ).to.equal( true );
		 expect( doc.persistent, "Persistent flag").to.equal(true);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 key_insert_same = doc.document._key;
		 });
		 
		 //
		 // Insert persistent object.
		 //
		 // Should fail.
		 //
		 it( "Insert persistent object:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassRestricted(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.insertDocument();
		 };
		 expect( func, "Insert" )
		 .to.throw( MyError, /document is persistent/ );
		 expect( doc.document, "Should not be empty").not.to.be.empty;
		 for( const field of doc.localFields )
		 expect(doc.document, "Has local fields").to.have.property(field);
		 expect( result, "Insert result" ).to.equal( undefined );
		 expect( doc.persistent, "Persistent flag").to.equal(true);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 key_insert_same = doc.document._key;
		 });
		 */
		
	});	// Insert.
	
	//
	// Resolve tests.
	//
	describe( "Resolve:", function ()
	{
		/*
		 //
		 // Resolve persistent document.
		 //
		 // Should not fail.
		 //
		 it( "Resolve persistent document:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 const copy = JSON.parse(JSON.stringify(doc.document));
		 
		 func = () => {
		 result = doc.resolveDocument(true, true);
		 };
		 expect( func, "Resolve and replace" ).not.to.throw();
		 expect( result, "Resolve and replace result" ).to.equal( true );
		 expect( doc.modified, "Resolve and replace modified flag").to.equal(false);
		 for( const field in copy )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 expect( doc.document[ field ], `Locked property mismatch [${field}]` )
		 .to.equal( copy[ field ] );
		 }
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.resolveDocument(false, true);
		 };
		 expect( func, "Resolve and no replace" ).not.to.throw();
		 expect( result, "Resolve and no replace result" ).to.equal( true );
		 expect( doc.modified, "Resolve and no replace modified flag").to.equal(false);
		 for( const field in copy )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 expect( doc.document[ field ], `Locked property mismatch [${field}]` )
		 .to.equal( copy[ field ] );
		 }
		 });
		 
		 //
		 // Resolve null reference.
		 //
		 // Should fail.
		 //
		 it( "Resolve null reference:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, null, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.resolveDocument(true, true);
		 };
		 expect( func, "Resolve" )
		 .to.throw( MyError, /cannot locate document without selection data/ );
		 expect( doc.document, "Should be empty").to.be.empty;
		 expect( result, "Resolve result" ).to.equal( undefined );
		 expect( doc.persistent, "Persistent flag").to.equal(false);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 });
		 
		 //
		 // Resolve selector without significant field.
		 //
		 // Should fail.
		 //
		 it( "Resolve selector without significant field:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassSignificant(
		 param.request, {name: "pippo"}, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.resolveDocument(true, true);
		 };
		 expect( func, "Resolve" )
		 .to.throw( MyError, /missing required fields to resolve object/ );
		 expect( doc.document, "Should be empty").not.to.be.empty;
		 expect( result, "Resolve result" ).to.equal( undefined );
		 expect( doc.persistent, "Persistent flag").to.equal(false);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 });
		 
		 //
		 // Resolve with not found selector.
		 //
		 // Should fail, or return false.
		 //
		 it( "Resolve with not found selector:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, {_id: 'test_Document/UNKNOWN'}, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.resolveDocument(true, true);
		 };
		 expect( func, "Resolve and raise" )
		 .to.throw( MyError, /not found in collection/ );
		 expect( doc.document, "Should be empty").not.to.be.empty;
		 expect( result, "Resolve result" ).to.equal( undefined );
		 expect( doc.persistent, "Persistent flag").to.equal(false);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 
		 func = () => {
		 result = doc.resolveDocument(true, false);
		 };
		 expect( func, "Resolve and not raise" ).not.to.throw();
		 expect( doc.document, "Should be empty").not.to.be.empty;
		 expect( result, "Resolve result" ).to.equal( false );
		 expect( doc.persistent, "Persistent flag").to.equal(false);
		 expect( doc.modified, "Modified flag").to.equal(false);
		 });
		 
		 //
		 // Resolve with replace.
		 //
		 // Existing contents should be overwritten by persistent contents;
		 // added contents should not be deleted.
		 //
		 it( "Resolve with replace:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 const selector = JSON.parse(JSON.stringify(param.replace));
		 selector._key = key_insert_filled;
		 selector.username = "USERNAME";
		 func = () => {
		 doc =
		 new TestClass(
		 param.request,
		 selector,
		 default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.resolveDocument(true, true);
		 };
		 expect( func, "Resolve and raise" ).not.to.throw();
		 for( const field in selector )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 {
		 if( field === '_key' )
		 expect( doc.document[ field ], `Property mismatch [${field}]` )
		 .to.equal( selector[ field ] );
		 else if( field === 'username' )
		 expect( doc.document[ field ], `Property mismatch [${field}]` )
		 .to.equal( "USERNAME" );
		 else
		 expect( doc.document[ field ], `Property mismatch [${field}]` )
		 .to.equal( param.content[ field ] );
		 }
		 }
		 expect( doc.document, `Missing added property` ).to.have.property('username');
		 expect(doc.modified, "Modified flag").to.equal(true);
		 });
		 
		 //
		 // Resolve without replace.
		 //
		 // Existing fields should not be replaced by persistent fields;
		 // including added properties
		 //
		 it( "Resolve without replace:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 const selector = JSON.parse(JSON.stringify(param.replace));
		 selector._key = key_insert_filled;
		 selector.var = "SHOULD_CHANGE";
		 selector.username = "USERNAME";
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request,
		 selector,
		 default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.resolveDocument(false, true);
		 };
		 expect( func, "Resolve and raise" ).not.to.throw();
		 for( const field in selector )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 {
		 if( field === '_key' )
		 expect( doc.document[ field ], `Property mismatch [${field}]` )
		 .to.equal( selector[ field ] );
		 else if( doc.lockedFields.includes( field ) )
		 expect( doc.document[ field ], `Property mismatch [${field}]` )
		 .to.equal( param.content[ field ] );
		 else if( field === 'username' )
		 expect( doc.document[ field ], `Property mismatch [${field}]` )
		 .to.equal( selector[ field ] );
		 else
		 expect( doc.document[ field ], `Property mismatch [${field}]` )
		 .to.equal( param.replace[ field ] );
		 }
		 }
		 expect( doc.document, `Missing added property` ).to.have.property('username');
		 expect(doc.modified, "Modified flag").to.equal(true);
		 });
		 
		 //
		 // Resolve with locked field.
		 //
		 // With replace to off, only the locked field is replaced;
		 // with replace to on, all fields are replaced.
		 //
		 it( "Resolve with locked field:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 const selector = JSON.parse(JSON.stringify(param.replace));
		 selector._key = key_insert_filled;
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request,
		 selector,
		 default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.resolveDocument(false, true);
		 };
		 expect( func, "Resolve and raise" ).not.to.throw();
		 for( const field in param.replace )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 {
		 if( doc.lockedFields.includes( field ) )
		 expect( doc.document[ field ], `Locked property mismatch [${field}]` )
		 .to.equal( param.content[ field ] );
		 else
		 expect( doc.document[ field ], `Property mismatch [${field}]` )
		 .to.equal( param.replace[ field ] );
		 }
		 }
		 expect(doc.modified, "Modified flag").to.equal(true);
		 
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request,
		 selector,
		 default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 
		 func = () => {
		 result = doc.resolveDocument(true, true);
		 };
		 expect( func, "Resolve and raise" ).not.to.throw();
		 for( const field in param.replace )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 expect( doc.document[ field ], `Locked property mismatch [${field}]` )
		 .to.equal( param.content[ field ] );
		 }
		 expect(doc.modified, "Modified flag").to.equal(true);
		 });
		 
		 //
		 // Resolve with changed locked field.
		 //
		 // Regardless of the doReplace flag, it must raise an exception.
		 //
		 it( "Resolve with changed locked field:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request,
		 key_insert_filled,
		 default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 expect(doc.modified, "Instantiation modified flag").to.equal(false);
		 
		 db._collection(default_collection)
		 .update(
		 key_insert_filled,
		 {var: "VAR_CHANGED"},
		 {waitForSync: true}
		 );
		 
		 func = () => {
		 result = doc.resolveDocument(false, true);
		 };
		 expect( func, "Resolve and raise" )
		 .to.throw( MyError, /Ambiguous document reference/ );
		 expect(doc.persistent, "Persistent flag").to.equal(true);
		 for( const field in param.content )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 expect( doc.document[ field ], `Locked property mismatch [${field}]` )
		 .to.equal( param.content[ field ] );
		 }
		 expect(doc.modified, "Modified flag").to.equal(false);
		 
		 func = () => {
		 doc =
		 new TestClassPersistNoSignificant(
		 param.request,
		 key_insert_filled,
		 default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 expect(doc.modified, "Instantiation modified flag").to.equal(false);
		 
		 db._collection(default_collection)
		 .update(
		 key_insert_filled,
		 {var: "VAR_CHANGED_AGAIN"},
		 {waitForSync: true}
		 );
		 
		 func = () => {
		 result = doc.resolveDocument(true, true);
		 };
		 expect( func, "Resolve and raise" )
		 .to.throw( MyError, /Ambiguous document reference/ );
		 expect(doc.persistent, "Persistent flag").to.equal(true);
		 for( const field in param.content )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 {
		 if( field === 'var' )
		 expect( doc.document[ field ], `Locked property mismatch [${field}]` )
		 .to.equal( "VAR_CHANGED" );
		 else
		 expect( doc.document[ field ], `Locked property mismatch [${field}]` )
		 .to.equal( param.content[ field ] );
		 }
		 }
		 
		 db._remove( doc.document._id, {waitForSync: true} );
		 const tmp = new TestClass(param.request, param.content, default_collection);
		 tmp.insertDocument();
		 key_insert_filled = tmp.document._key;
		 });
		 
		 //
		 // Resolve multiple documents.
		 //
		 // Should always raise an exception.
		 //
		 it( "Resolve multiple documents:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 const selector = { var: 'VAR'};
		 func = () => {
		 doc =
		 new TestClassRestricted(
		 param.request,
		 selector,
		 default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Persistent flag").to.equal(false);
		 
		 func = () => {
		 result = doc.resolveDocument(false, true);
		 };
		 expect( func, "Resolve no replace do raise" )
		 .to.throw( MyError, /combination of fields is not unique/ );
		 expect( result, "Resolve no replace do raise result" ).to.equal( undefined );
		 expect(doc.persistent, "Resolve no replace do raise persistent flag").to.equal(false);
		 func = () => {
		 result = doc.resolveDocument(false, false);
		 };
		 expect( func, "Resolve no replace no raise" )
		 .to.throw( MyError, /combination of fields is not unique/ );
		 expect( result, "Resolve no replace no raise result" ).to.equal( undefined );
		 expect(doc.persistent, "Resolve no replace no raise persistent flag").to.equal(false);
		 
		 func = () => {
		 result = doc.resolveDocument(true, true);
		 };
		 expect( func, "Resolve do replace do raise" )
		 .to.throw( MyError, /combination of fields is not unique/ );
		 expect( result, "Resolve do replace do raise result" ).to.equal( undefined );
		 expect(doc.persistent, "Resolve do replace do raise persistent flag").to.equal(false);
		 func = () => {
		 result = doc.resolveDocument(true, false);
		 };
		 expect( func, "Resolve do replace no raise" )
		 .to.throw( MyError, /combination of fields is not unique/ );
		 expect( result, "Resolve do replace no raise result" ).to.equal( undefined );
		 expect(doc.persistent, "Resolve do replace no raise persistent flag").to.equal(false);
		 });
		 */
		
	});	// Resolve.
	
	//
	// Replace tests.
	//
	describe( "Replace:", function ()
	{
		/*
		 //
		 // Replace non persistent document.
		 //
		 // Should fail.
		 //
		 it( "Replace non persistent document:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, null, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(false);
		 
		 func = () => {
		 result = doc.replaceDocument();
		 };
		 expect( func, "Replace" )
		 .to.throw( MyError, /document is not persistent/ );
		 expect(doc.persistent, "Replace persistent flag").to.equal(false);
		 });
		 
		 //
		 // Replace non existing document.
		 //
		 // Should fail.
		 //
		 it( "Replace non existing document:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 const copy = doc.document;
		 
		 db._remove(doc.document._id);
		 const func_replace = () => {
		 result = doc.replaceDocument();
		 };
		 expect( func_replace, "Replace" )
		 .to.throw( MyError, /not found in collection/ );
		 expect(doc.persistent, "Replace persistent flag").to.equal(false);
		 const meta = db._collection(default_collection).insert( copy, {waitForSync: true} );
		 key_insert_filled = meta._key;
		 });
		 
		 //
		 // Replace value.
		 //
		 // Should not fail.
		 //
		 it( "Replace value:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 
		 const data = {name: "New name"};
		 func = () => {
		 doc.setDocumentProperties(data, true);
		 };
		 expect( func, "Setting data" ).not.to.throw();
		 expect(doc.persistent, "Setting data persistent flag").to.equal(true);
		 
		 func = () => {
		 result = doc.replaceDocument();
		 };
		 expect( func, "Replace" ).not.to.throw();
		 expect(result, "Replace result").to.equal(true);
		 expect(doc.persistent, "Replace persistent flag").to.equal(true);
		 const copy = doc.document;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Re-instantiation" ).not.to.throw();
		 expect(doc.persistent, "Re-instantiation persistent flag").to.equal(true);
		 for( const field in copy )
		 {
		 expect( doc.document, `Missing property` ).to.have.property(field);
		 if( doc.document.hasOwnProperty( field ) )
		 expect( doc.document[ field ], `Locked property mismatch [${field}]` )
		 .to.equal( copy[ field ] );
		 }
		 });
		 
		 //
		 // Replace locked field.
		 //
		 // Should fail.
		 //
		 it( "Replace locked field:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassRestricted(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 const old_value = doc.document.var;
		 
		 db._collection(default_collection)
		 .update(
		 key_insert_filled,
		 {var: "WAS_CHANGED"},
		 {waitForSync: true}
		 );
		 
		 func = () => {
		 result = doc.replaceDocument();
		 };
		 expect( func, "Replace" )
		 .to.throw( MyError, /Constraint violation/ );
		 expect( result, "Replace result" ).to.equal( undefined );
		 expect(doc.persistent, "Resolve persistent flag").to.equal(true);
		 expect( doc.document.var, "Replaced property" ).to.equal(old_value);
		 });
		 
		 //
		 // Replace with missing required field.
		 //
		 // Should fail.
		 //
		 it( "Replace with missing required field:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassRestricted(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 
		 delete doc.document.var;
		 func = () => {
		 result = doc.replaceDocument();
		 };
		 expect( func, "Replace" )
		 .to.throw( MyError, /missing required field/ );
		 expect(doc.persistent, "Replace persistent flag").to.equal(true);
		 expect( result, "Replace result" ).to.equal( undefined );
		 });
		 */
		
	});	// Replace.
	
	//
	// Remove tests.
	//
	describe( "Remove:", function ()
	{
		/*
		 //
		 // Remove non persistent document.
		 //
		 // Should fail.
		 //
		 it( "Remove non persistent document:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, null, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(false);
		 
		 func = () => {
		 result = doc.removeDocument( true );
		 };
		 expect( func, "Remove" )
		 .to.throw( MyError, /document is not persistent/ );
		 expect(doc.persistent, "Remove persistent flag").to.equal(false);
		 
		 func = () => {
		 result = doc.removeDocument( false );
		 };
		 expect( func, "Remove" )
		 .to.throw( MyError, /document is not persistent/ );
		 expect(doc.persistent, "Remove persistent flag").to.equal(false);
		 });
		 
		 //
		 // Remove non existing document.
		 //
		 // Should fail according to doFail flag.
		 //
		 it( "Remove non existing document:", function ()
		 {
		 let doc;
		 let func;
		 let result1;
		 let result2;
		 let meta;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 const copy = doc.document;
		 
		 db._remove(doc.document._id);
		 func = () => {
		 result1 = doc.removeDocument( false );
		 };
		 expect( func, "Remove" ).not.to.throw();
		 expect(result1, "Remove result").to.equal(false);
		 expect(doc.persistent, "Remove persistent flag").to.equal(false);
		 meta = db._collection(default_collection).insert( copy, {waitForSync: true} );
		 key_insert_filled = meta._key;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 
		 db._collection(default_collection).remove(doc.document._id);
		 func = () => {
		 result2 = doc.removeDocument( true );
		 };
		 expect( func, "Remove" )
		 .to.throw( MyError, /not found in collection/ );
		 expect(result2, "Remove result").to.equal(undefined);
		 expect(doc.persistent, "Remove persistent flag").to.equal(false);
		 meta = db._collection(default_collection).insert( copy, {waitForSync: true} );
		 key_insert_filled = meta._key;
		 });
		 
		 //
		 // Remove constrained document.
		 //
		 // Should fail.
		 //
		 it( "Remove constrained document:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClassConstrained(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 
		 doc.document.name = "CONSTRAINED";
		 func = () => {
		 doc.replaceDocument();
		 };
		 expect( func, "Replacing document" ).not.to.throw();
		 
		 func = () => {
		 doc =
		 new TestClassConstrained(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 
		 func = () => {
		 result = doc.removeDocument( false );
		 };
		 expect( func, "Remove" )
		 .to.throw( MyError, /has constraints that prevent it from being removed/ );
		 expect(result, "Remove result").to.equal(undefined);
		 expect(doc.persistent, "Remove persistent flag").to.equal(true);
		 
		 doc.document.name = "NOT CONSTRAINED";
		 func = () => {
		 doc.replaceDocument();
		 };
		 expect( func, "Replacing document" ).not.to.throw();
		 });
		 
		 //
		 // Remove document.
		 //
		 // Should not fail.
		 //
		 it( "Remove document:", function ()
		 {
		 let doc;
		 let func;
		 let result;
		 
		 func = () => {
		 doc =
		 new TestClass(
		 param.request, key_insert_filled, default_collection
		 );
		 };
		 expect( func, "Instantiation" ).not.to.throw();
		 expect(doc.persistent, "Instantiation persistent flag").to.equal(true);
		 const id = doc.document._id;
		 
		 func = () => {
		 doc.removeDocument( true );
		 };
		 expect( func, "Remove" ).not.to.throw();
		 expect(doc.persistent, "Remove persistent flag").to.equal(false);
		 expect(db._exists(id), "Still exists").to.equal(false);
		 });
		 */
		
	});	// Remove.
	
	//
	// Static tests.
	//
	describe( "Static:", function ()
	{
		/*
		 //
		 // Check edge collection type.
		 //
		 // Should fail on document collection.
		 //
		 it( "Check edge collection type:", function ()
		 {
		 let func;
		 let result;
		 let failed;
		 const good = param.collection_edge;
		 const bad = param.collection_document;
		 const method = TestClass.isEdgeCollection;
		 
		 func = () => {
		 result = method(param.request, good, false);
		 };
		 expect(func, "Method call").not.to.throw();
		 expect(result).to.equal(true);
		 
		 func = () => {
		 result = method(param.request, good, true);
		 };
		 expect(func, "Method call").not.to.throw();
		 expect(result).to.equal(true);
		 
		 func = () => {
		 result = method(param.request, bad, false);
		 };
		 expect(func, "Method call").not.to.throw();
		 expect(result).to.equal(false);
		 
		 func = () => {
		 failed = method(param.request, bad, true);
		 };
		 expect(func, "Method call")
		 .to.throw( MyError, /to be an edge collection/ );
		 expect(failed).to.equal(undefined);
		 });
		 
		 //
		 // Check document collection type.
		 //
		 // Should fail on edge collection.
		 //
		 it( "Check document collection type:", function ()
		 {
		 let func;
		 let result;
		 let failed;
		 const bad = param.collection_edge;
		 const good = param.collection_document;
		 const method = TestClass.isDocumentCollection;
		 
		 func = () => {
		 result = method(param.request, good, false);
		 };
		 expect(func, "Method call").not.to.throw();
		 expect(result).to.equal(true);
		 
		 func = () => {
		 result = method(param.request, good, true);
		 };
		 expect(func, "Method call").not.to.throw();
		 expect(result).to.equal(true);
		 
		 func = () => {
		 result = method(param.request, bad, false);
		 };
		 expect(func, "Method call").not.to.throw();
		 expect(result).to.equal(false);
		 
		 func = () => {
		 failed = method(param.request, bad, true);
		 };
		 expect(func, "Method call")
		 .to.throw( MyError, /to be a document collection/ );
		 expect(failed).to.equal(undefined);
		 });
		 */
		
	});	// Static.
	
});
