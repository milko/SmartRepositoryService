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
const param = require( './paramEdge' );

//
// Application.
//
const K = require( '../../utils/Constants' );
const Dict = require( '../../dictionary/Dict' );
const MyError = require( '../../utils/MyError' );

//
// Base Document class.
//
const Edge = require( '../../classes/Edge' );

//
// Test class.
//
class TestClass extends Edge
{
	get lockedFields()
	{
		return super.localFields
			.concat([
				Dict.descriptor.kVariable
			]);
	}
	
	get requiredFields()
	{
		return super.requiredFields
			.concat([
				Dict.descriptor.kVariable
			]);
	}
	
	validateDocumentConstraints( doAssert = true )
	{
		const result = super.validateDocumentConstraints(doAssert);
		if( result === true )
			return (! ( this._document.hasOwnProperty('name')
					 && (this._document.name === "CONSTRAINED") ));
		return result;
	}
}

//
// Node class.
//
const NodeClass = require( '../../classes/Document' );

//
// Set default collection names.
//
const wrong_collection   = param.collection_document;
const default_collection = param.collection_edge;
const compatible_collection = 'edges';

//
// Globals.
//
const example_id = 'schemas/3e3d5e71d9654933b0454fb23fa14cb3';
const example_collection = 'schemas';

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

//
// Set environment.
//
for( const node of param.nodes )
{
	let doc;
	let func;
	let result;
	
	doc = new NodeClass( param.request, node, param.collection_document );
	result = doc.insertDocument();
}


/**
 * Edge class tests
 *
 * We test the Edge class.
 */
describe( "Edge class tests:", function ()
{
	//
	// Instantiation tests.
	//
	describe( "Instantiation:", function ()
	{
		//
		// Instantiate with only request.
		//
		// Should raise Missing required parameter.
		//
		it( "Instantiate with only request:", function ()
		{
			expect( () => {
				const tmp = new TestClass( param.request );
			}).to.throw(
				MyError,
				/Missing required parameter/
			);
		});
		
		//
		// Instantiate with null selector and no collection.
		//
		// Should raise Missing required parameter.
		//
		it( "Instantiate with null selector and no collection:", function ()
		{
			expect( () => {
				const tmp = new TestClass( param.request, null );
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
			const collection = db._collection( 'test' );
			if( collection )
				db._drop( 'test' );
			
			expect( () => {
				const tmp = new TestClass( param.request, null, 'test' );
			}).to.throw( MyError, /unknown or invalid collection name/ );
		});
		
		//
		// Instantiate with null selector and wrong collection type.
		//
		// Should raise an exception.
		//
		it( "Instantiate with null selector and wrong collection type:", function ()
		{
			expect( () => {
				const tmp = new TestClass( param.request, null, wrong_collection );
			}).to.throw( MyError, /Invalid collection/ );
		});
		
		//
		// Instantiate with null selector and existing edge collection.
		//
		// Should not raise: the Document class accepts any collection type.
		//
		it( "Instantiate with null selector and existing edge collection:", function ()
		{
			expect( () => {
				const tmp = new TestClass( param.request, null, default_collection );
			}).not.to.throw();
		});
		
		//
		// Instantiate with null selector and default or provided collection.
		//
		// Should raise an exception, because it doesn't have a default collection;
		// should accept any edge collection argument.
		//
		it( "Instantiate with null selector and default or provided collection:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc = new TestClass( param.request, null );
			};
			expect(func, "Collection not provided instantiation")
				.to.throw( MyError, /missing collection reference/ );
			
			func = () => {
				doc = new TestClass( param.request, null, compatible_collection );
			};
			expect(func, "Collection provided instantiation").not.to.throw();
			expect(doc.collection, "Collection provided name").to.equal(compatible_collection);
		});
		
		//
		// Instantiate without selector and wrong collection.
		//
		// Should raise Invalid collection.
		//
		it( "Instantiate without selector and wrong collection:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request, null, wrong_collection );
			}).to.throw(
				MyError,
				/Invalid collection/
			);
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
			
			func = () => {
				doc = new TestClass( param.request, null, default_collection );
			};
			expect( func, "Instantiation empty mutable document" ).not.to.throw();
			expect( doc.document, "Empty mutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Empty mutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClass( param.request, null, default_collection, true );
			};
			expect( func, "Instantiation empty immutable document" ).not.to.throw();
			expect( doc.document, "Empty immutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Empty immutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClass( param.request, param.content, default_collection );
			};
			expect( func, "Instantiation filled mutable document" ).not.to.throw();
			expect( doc.document, "Filled mutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Filled mutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClass( param.request, param.content, default_collection, true );
			};
			expect( func, "Instantiation filled immutable document" ).not.to.throw();
			expect( doc.document, "Filled immutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Filled immutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClass( param.request, example_id, example_collection );
			};
			expect( func, "Instantiation referenced mutable document" ).not.to.throw();
			expect( doc.document, "Referenced mutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Referenced mutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClass( param.request, example_id, example_collection, true );
			};
			expect( func, "Instantiation referenced immutable document" ).not.to.throw();
			expect( doc.document, "Referenced immutable document should be immutable" ).to.be.sealed;
			expect( doc.modified, "Referenced immutable document modified flag" ).to.equal(false);
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
						param.request, example_id, default_collection );
			}).to.throw(
				MyError,
				/cross-collection reference/
			);
		});
		
		//
		// Instantiate with not found reference.
		//
		// Should raise not found in collection.
		//
		it( "Instantiate with not found reference:", function ()
		{
			expect( () => {
				const tmp =
					new TestClass(
						param.request, 'test_Edge/3e3d5e71d9654933b0454fb23fa14cb3', default_collection );
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
			
			func = () => {
				doc = new TestClass( param.request, example_id );
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should be mutable" ).not.to.be.sealed;
			expect( doc.persistent, "Persistent flag").to.equal(true);
			expect( doc.modified, "Modified flag").to.equal(false);
			
			func = () => {
				doc = new TestClass( param.request, 'order' );
			};
			expect( func, "Instantiation" )
				.to.throw( MyError, /invalid object reference handle/ );
			expect( doc.document, "Should be mutable" ).not.to.be.sealed;
			expect( doc.persistent, "Persistent flag").to.equal(true);
			expect( doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Instantiate with content.
		//
		// The document should contain all the provided data.
		//
		it( "Instantiate with content:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc = new TestClass( param.request, param.content, default_collection );
			};
			expect( func, "Instantiation" ).not.to.throw();
			for( const field in param.content )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
				{
					if( Array.isArray(doc.document[field]) )
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.have.members( param.content[ field ] );
					else
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.equal( param.content[ field ] );
				}
			}
			expect( doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Instantiate with restricted content.
		//
		// The document should contain all the provided data except restricted fields.
		//
		it( "Instantiate with restricted content:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new TestClass(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			
			if( doc.restrictedFields.length > 0 )
			{
				const restricted = doc.restrictedFields[ 0 ];
				expect(doc.document, `Restricted field`).not.to.have.property(restricted);
				for( const field in param.content )
				{
					if( field !== restricted )
					{
						expect( doc.document, `Missing property` ).to.have.property(field);
						if( doc.document.hasOwnProperty( field ) )
						{
							if( Array.isArray(doc.document[field]) )
								expect( doc.document[ field ], `Property mismatch [${field}]` )
									.to.have.members( param.content[ field ] );
							else
								expect( doc.document[ field ], `Property mismatch [${field}]` )
									.to.equal( param.content[ field ] );
						}
					}
				}
				expect( doc.persistent, "Persistent flag").to.equal(false);
				expect(doc.modified, "Modified flag").to.equal(false);
			}
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
		it( "Load empty object:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new TestClass(
						param.request, null, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should be empty").to.be.empty;
			
			func = () => {
				doc.setDocumentProperties( param.content, false );
			};
			expect( func, "Load" ).not.to.throw();
			for( const field in param.content )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
				{
					if( Array.isArray(doc.document[field]) )
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.have.members( param.content[ field ] );
					else
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.equal( param.content[ field ] );
				}
			}
			expect( doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Load non empty object without replace.
		//
		// Should replace locked fields and not replace other fields.
		//
		it( "Load non empty object without replace:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new TestClass(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should not be empty").not.to.be.empty;
			
			const data = JSON.parse(JSON.stringify(param.replace));
			data[ Dict.descriptor.kUsername ] = "USERNAME";
			func = () => {
				doc.setDocumentProperties( data, false );
			};
			expect( func, "Load" ).not.to.throw();
			for( const field in param.content )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
				{
					if( doc.lockedFields.includes( field ) )
					{
						if( Array.isArray(doc.document[field]) )
							expect( doc.document[ field ], `Property mismatch [${field}]` )
								.to.have.members( param.replace[ field ] );
						else
							expect( doc.document[ field ], `Property mismatch [${field}]` )
								.to.equal( param.replace[ field ] );
					}
					else
					{
						if( Array.isArray(doc.document[field]) )
							expect( doc.document[ field ], `Property mismatch [${field}]` )
								.to.have.members( param.content[ field ] );
						else
							expect( doc.document[ field ], `Property mismatch [${field}]` )
								.to.equal( param.content[ field ] );
					}
				}
			}
			expect( doc.document[ Dict.descriptor.kUsername ], "Added property" )
				.to.equal(data[ Dict.descriptor.kUsername ]);
			expect(doc.modified, "Modified flag").to.equal(true);
		});
		
		//
		// Load non empty object with replace.
		//
		// Provided data should replace all data.
		//
		it( "Load non empty object with replace:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new TestClass(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should not be empty").not.to.be.empty;
			
			const data = JSON.parse(JSON.stringify(param.replace));
			data.order = null;
			func = () => {
				doc.setDocumentProperties( data, true );
			};
			expect( func, "Load" ).not.to.throw();
			for( const field in param.content )
			{
				if( field === 'order' )
					expect( doc.document, `Missing property` ).not.to.have.property(field);
				else
					expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.to.equal( param.replace[ field ] );
			}
			expect( doc.modified, "Modified flag").to.equal(true);
		});
		
		//
		// Replace non persistent object locked field.
		//
		// Should not care if it is locked.
		//
		it( "Replace non persistent object locked field:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new TestClass(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should not be empty").not.to.be.empty;
			
			func = () => {
				doc.setDocumentProperties( param.replace, true );
			};
			expect( func, "Load" ).not.to.throw();
			for( const field in param.replace )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.to.equal( param.replace[ field ] );
			}
			expect(doc.modified, "Modified flag").to.equal(true);
		});
		
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
					new TestClass(
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
						new TestClass(
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

	});	// Contents.
	
	//
	// Persistence globals.
	//
	let key_insert_filled;
	let key_insert_same;
	
	//
	// Insert tests.
	//
	describe( "Insert:", function ()
	{
		//
		// Insert empty object.
		//
		// Should raise an exception.
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
			expect( func, "Insert" )
				.to.throw( MyError, /missing fields required to compute edge key / );
			expect( doc.document, "Should not be empty").to.be.empty;
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
					new TestClass(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			
			doc.setDocumentProperties({ predicate: null, name: "pippo" });
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, "Insert" )
				.to.throw( MyError, /missing fields required to compute edge key/ );
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
					new TestClass(
						param.request, {name : "No Significant"}, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, "Insert" )
				.to.throw( MyError, /missing fields required to compute edge key/ );
			expect( doc.document, "Should not be empty").not.to.be.empty;
			expect( result, "Insert result" ).to.equal( undefined );
			expect( doc.persistent, "Persistent flag").to.equal(false);
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
					new TestClass(
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
			{
				if( field !== Dict.descriptor.kMStamp )
					expect(doc.document, "Has local fields").to.have.property(field);
			}
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
			const selector = {};
			selector._from = param.content._from;
			selector._to = param.content._to;
			selector.predicate = param.content.predicate;
			selector.var = "EDGE";
			
			func = () => {
				doc =
					new TestClass(
						param.request, selector, default_collection
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
				switch( field )
				{
					case '_id':
					case '_rev':
					case Dict.descriptor.kMStamp:
						expect(doc.document, `Has local field [${field}]`).not.to.have.property(field);
						break;
					
					case Dict.descriptor.kCStamp:
						expect(doc.document, `Has local field [${field}]`).to.have.property(field);
						break;
					
					case '_key':
						expect(doc.document, `Has local field [${field}]`).to.have.property(field);
						expect(doc.document[ field ], `Value of [${field}]`)
							.to.equal(key_insert_filled);
						break;
					
					default:
						expect(doc.document, `Has local field [${field}]`).to.have.property(field);
						expect(doc.document[ field ], `Value of [${field}]`)
							.to.equal(selector[ field ]);
						break;
				}
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
					new TestClass(
						param.request, param.content, default_collection
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
				switch( field )
				{
					case '_id':
					case '_rev':
					case Dict.descriptor.kMStamp:
						expect(doc.document, `Has local field [${field}]`).not.to.have.property(field);
						break;
					
					case Dict.descriptor.kCStamp:
						expect(doc.document, `Has local field [${field}]`).to.have.property(field);
						break;
					
					case '_key':
						expect(doc.document, `Has local field [${field}]`).to.have.property(field);
						expect(doc.document[ field ], `Value of [${field}]`)
							.to.equal(key_insert_filled);
						break;
					
					default:
						expect(doc.document, `Has local field [${field}]`).to.have.property(field);
						expect(doc.document[ field ], `Value of [${field}]`)
							.to.equal(param.content[ field ]);
						break;
				}
			}
			expect( result, "Insert result" ).to.equal( undefined );
			expect( doc.persistent, "Persistent flag").to.equal(false);
			expect( doc.modified, "Modified flag").to.equal(false);
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
					new TestClass(
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
			{
				if( field !== Dict.descriptor.kMStamp )
					expect(doc.document, "Has local fields").to.have.property(field);
			}
			expect( result, "Insert result" ).to.equal( undefined );
			expect( doc.persistent, "Persistent flag").to.equal(true);
			expect( doc.modified, "Modified flag").to.equal(false);
			key_insert_same = doc.document._key;
		});
	
	});	// Insert.
	
	//
	// Resolve tests.
	//
	describe( "Resolve:", function ()
	{
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
			const selector = {};
			selector._from = param.content._from;
			selector._to = param.content._to;
			
			func = () => {
				doc =
					new TestClass(
						param.request, selector, default_collection
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
			const selector = {};
			selector._from = param.content._from;
			selector._to = param.content._to;
			selector.predicate = 'terms/:predicate:managed-by';
			
			func = () => {
				doc =
					new TestClass(
						param.request, selector, default_collection
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
				result = doc.resolveDocument(false, true);
			};
			expect( func, "Resolve and raise" ).not.to.throw();
			expect( doc.document, "Should have key" ).to.have.property('_key');
			expect( doc.document._key, "Selector and document keys should match" ).to.equal(selector._key);
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
					new TestClass(
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
					new TestClass(
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
					new TestClass(
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
		// Edges cannot have multiple documents, the key is computed and the only
		// unique combination is the _from, _to and predicate: edges require those
		// parameter to be in the selector, but then they cmopute the key and resolve
		// the edge by reference.
		//
		// This means that we simply test instantiation and resolve.
		//
		it( "Resolve multiple documents:", function ()
		{
			let doc;
			let func;
			let result;
			const selector = {
				_from: param.content._from,
				_to: param.content._to,
				predicate: param.content.predicate,
				var: 'VAR'
			};

			func = () => {
				doc =
					new TestClass(
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
			expect( func, "Resolve no replace do raise" ).not.to.throw();
			expect( result, "Resolve no replace do raise result" ).to.equal( true );
			expect(doc.persistent, "Resolve no replace do raise persistent flag").to.equal(true);
			func = () => {
				result = doc.resolveDocument(false, false);
			};
			expect( func, "Resolve no replace do raise" ).not.to.throw();
			expect( result, "Resolve no replace do raise result" ).to.equal( true );
			expect(doc.persistent, "Resolve no replace do raise persistent flag").to.equal(true);
			
			func = () => {
				result = doc.resolveDocument(true, true);
			};
			expect( func, "Resolve do replace do raise" ).not.to.throw();
			expect( result, "Resolve do replace do raise result" ).to.equal( true );
			expect(doc.persistent, "Resolve do replace do raise persistent flag").to.equal(true);
			func = () => {
				result = doc.resolveDocument(true, false);
			};
			expect( func, "Resolve do replace no raise" ).not.to.throw();
			expect( result, "Resolve do replace no raise result" ).to.equal( true );
			expect(doc.persistent, "Resolve do replace no raise persistent flag").to.equal(true);
		});
	
	});	// Resolve.
	
	//
	// Replace tests.
	//
	describe( "Replace:", function ()
	{
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
					new TestClass(
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
					new TestClass(
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
	
	});	// Replace.
	
	//
	// Remove tests.
	//
	describe( "Remove:", function ()
	{
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
					new TestClass(
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
					new TestClass(
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
	
	});	// Remove.
	
	//
	// Static tests.
	//
	describe( "Static:", function ()
	{
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
		
	});	// Static.
	
});