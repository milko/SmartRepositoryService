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
// Base Document class.
//
const Document = require( '../classes/Document' );

//
// Base Document class with default collection.
//
class TestClassCollection extends Document
{
	get defaultCollection()	{	return param.collection_document; }
	validateCollectionType( theCollection, doAssert = true )
	{
		return Document.isDocumentCollection(
			this._request,
			theCollection,
			doAssert
		);
	}
}

//
// Base persistent class without significant fields.
//
class TestClassPersistNoSignificant extends TestClassCollection
{
	get requiredFields()	{	return [ Dict.descriptor.kVariable ]; }
	get uniqueFields()		{	return [ Dict.descriptor.kVariable ]; }
	get lockedFields()		{	return [ Dict.descriptor.kVariable ]; }
}

//
// Base persistent class With significant fields and no required.
//
class TestClassPersistNoRequired extends TestClassCollection
{
	get significantFields()	{	return [ [Dict.descriptor.kVariable] ]; }
	get uniqueFields()		{	return [ Dict.descriptor.kVariable ]; }
	get lockedFields()		{	return [ Dict.descriptor.kVariable ]; }
}

//
// Base persistent class with significant and restricted fields.
//
class TestClassPersistSignificant extends TestClassPersistNoSignificant
{
	get significantFields()	{	return [ [Dict.descriptor.kVariable] ]; }
	get restrictedFields()	{	return [ Dict.descriptor.kOrder ] }
}

//
// Clear collections.
//
let collection;
collection = db._collection( param.collection_edge );
if( ! collection )
	db._createEdgeCollection( param.collection_edge, { waitForSync : true } );
else
	collection.truncate();
collection = db._collection( param.collection_document );
if( ! collection )
	db._createDocumentCollection( param.collection_document, { waitForSync : true } );
else
	collection.truncate();

//
// Set default collection names.
//
const wrong_collection   = param.collection_edge;
const default_collection = param.collection_document;
const compatible_collection = 'toponyms';

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
		// Instantiate with only request.
		//
		// Should raise Missing required parameter.
		//
		it( "Instantiate with only request:", function ()
		{
			expect( () => {
				const tmp = new Document( param.request );
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
				const tmp = new Document( param.request, null );
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
			expect( () => {
				const tmp = new Document( param.request, null, 'test' );
			}).to.throw( MyError, /unknown or invalid collection name/ );
		});
		
		//
		// Instantiate with null selector and existing edge collection.
		//
		// Should not raise: the Document class accepts any collection type.
		//
		it( "Instantiate with null selector and existing edge collection:", function ()
		{
			expect( () => {
				const tmp = new Document( param.request, null, wrong_collection );
			}).not.to.throw();
		});
		
		//
		// Instantiate with null selector and existing document collection.
		//
		// Should not raise: the Document class accepts any collection type.
		//
		it( "Instantiate with null selector and existing document collection:", function ()
		{
			expect( () => {
				const tmp = new Document( param.request, null, default_collection );
			}).not.to.throw();
		});
		
		//
		// Instantiate with null selector and default collection.
		//
		// Should not raise: the Document class accepts any collection type.
		//
		it( "Instantiate with null selector and default collection:", function ()
		{
			let doc;
			const func_default = () => {
				doc = new TestClassCollection( param.request, null );
			};
			expect(func_default, "Collection not provided instantiation").not.to.throw();
			expect(doc.collection, "Collection not provided name").to.equal(doc.defaultCollection);
			const func_provided = () => {
				doc = new TestClassCollection( param.request, null, compatible_collection );
			};
			expect(func_provided, "Collection provided instantiation").not.to.throw();
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
					new TestClassCollection(
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
				doc = new TestClassCollection( param.request, null );
			};
			expect( func, "Instantiation empty mutable document" ).not.to.throw();
			expect( doc.document, "Empty mutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Empty mutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClassCollection( param.request, null, null, true );
			};
			expect( func, "Instantiation empty immutable document" ).not.to.throw();
			expect( doc.document, "Empty immutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Empty immutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClassCollection( param.request, param.content );
			};
			expect( func, "Instantiation filled mutable document" ).not.to.throw();
			expect( doc.document, "Filled mutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Filled mutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClassCollection( param.request, param.content, null, true );
			};
			expect( func, "Instantiation filled immutable document" ).not.to.throw();
			expect( doc.document, "Filled immutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Filled immutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClassCollection( param.request, 'descriptors/order', 'descriptors' );
			};
			expect( func, "Instantiation referenced mutable document" ).not.to.throw();
			expect( doc.document, "Referenced mutable document should be mutable" ).not.to.be.sealed;
			expect( doc.modified, "Referenced mutable document modified flag" ).to.equal(false);
			
			func = () => {
				doc = new TestClassCollection( param.request, 'descriptors/order', 'descriptors', true );
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
					new Document(
						param.request, 'descriptors/order', default_collection );
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
					new Document(
						param.request, 'test_Document/MISSING', default_collection );
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
				doc = new Document( param.request, 'descriptors/order' );
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should be mutable" ).not.to.be.sealed;
			expect( doc.persistent, "Persistent flag").to.equal(true);
			expect( doc.modified, "Modified flag").to.equal(false);
			
			func = () => {
				doc = new Document( param.request, 'order' );
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
		it( "Instantiate with content:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc = new Document( param.request, param.content, default_collection );
			};
			expect( func, "Instantiation" ).not.to.throw();
			for( const field in param.content )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.to.equal( param.content[ field ] );
			}
			expect( doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Instantiate with restricted content.
		//
		it( "Instantiate with restricted content:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new TestClassPersistSignificant(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			const restricted = doc.restrictedFields[ 0 ];
			expect(doc.document, `Restricted field`).not.to.have.property(restricted);
			for( const field in param.content )
			{
				if( field !== restricted )
				{
					expect( doc.document, `Missing property` ).to.have.property(field);
					if( doc.document.hasOwnProperty( field ) )
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.equal( param.content[ field ] );
				}
			}
			expect( doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
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
					new Document(
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
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.to.equal( param.content[ field ] );
			}
			expect( doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Load non empty object without replace.
		//
		it( "Load non empty object without replace:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new Document(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should not be empty").not.to.be.empty;
			
			func = () => {
				doc.setDocumentProperties( param.replace, false );
			};
			expect( func, "Load" ).not.to.throw();
			for( const field in param.content )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.to.equal( param.content[ field ] );
			}
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Load non empty object with replace.
		//
		it( "Load non empty object with replace:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new Document(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should not be empty").not.to.be.empty;
			
			func = () => {
				doc.setDocumentProperties( param.replace, true );
			};
			expect( func, "Load" ).not.to.throw();
			for( const field in param.content )
			{
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
		it( "Replace non persistent object locked field:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new TestClassPersistNoSignificant(
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
		it( "Replace persistent object locked field:", function ()
		{
			let doc;
			let func;
			
			func = () => {
				doc =
					new TestClassPersistNoSignificant(
						param.request, 'descriptors/name', 'descriptors'
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			expect( doc.document, "Should not be empty").not.to.be.empty;
			
			func = () => {
				doc.setDocumentProperties( param.replace, true );
			};
			expect( func, "Load" ).to.throw( MyError, /Property is locked/ );
			for( const field in param.replace )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
				{
					if( field === doc.lockedFields[ 0 ] )
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.not.to.equal( param.replace[ field ] );
					else
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.equal( param.replace[ field ] );
				}
			}
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
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
		//
		// Insert empty object.
		//
		it( "Insert empty object:", function ()
		{
			let doc;
			let func;
			let result;
			
			func = () => {
				doc =
					new Document(
						param.request, null, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, "Insert" ).not.to.throw();
			expect( doc.document, "Should not be empty").not.to.be.empty;
			expect( doc.document, "Has _id" ).to.have.property( '_id' );
			expect( doc.document, "Has _key" ).to.have.property( '_key' );
			expect( doc.document, "Has _rev" ).to.have.property( '_rev' );
			expect( result, "Insert result" ).to.equal( true );
			expect( doc.persistent, "Persistent flag").to.equal(true);
			expect( doc.modified, "Modified flag").to.equal(false);
			key_insert_empty = doc.document._key;
		});
		
		//
		// Insert duplicate object.
		//
		it( "Insert duplicate object:", function ()
		{
			let doc;
			let func;
			let result;
			
			func = () => {
				doc =
					new Document(
						param.request, {_key: key_insert_empty}, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, "Insert" )
				.to.throw( MyError, /duplicate document in collection/ );
			expect( doc.document, "Should not be empty").not.to.be.empty;
			expect( doc.document, "Has _id" ).not.to.have.property( '_id' );
			expect( doc.document, "Has _key" ).to.have.property( '_key' );
			expect( doc.document, "Has _rev" ).not.to.have.property( '_rev' );
			expect( result, "Insert result" ).to.equal( undefined );
			expect( doc.persistent, "Persistent flag").to.equal(false);
			expect( doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Insert object without required field.
		//
		it( "Insert object without required field:", function ()
		{
			let doc;
			let func;
			let result;
			
			func = () => {
				doc =
					new TestClassPersistNoSignificant(
						param.request, null, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, "Insert" )
				.to.throw( MyError, /missing required field/ );
			expect( doc.document, "Should be empty").to.be.empty;
			expect( result, "Insert result" ).to.equal( undefined );
			expect( doc.persistent, "Persistent flag").to.equal(false);
			expect( doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Insert object without significant field.
		//
		it( "Insert object without significant field:", function ()
		{
			let doc;
			let func;
			let result;
			
			func = () => {
				doc =
					new TestClassPersistNoRequired(
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
			expect( doc.document, "Has _id" ).to.have.property( '_id' );
			expect( doc.document, "Has _key" ).to.have.property( '_key' );
			expect( doc.document, "Has _rev" ).to.have.property( '_rev' );
			expect( result, "Insert result" ).to.equal( true );
			expect( doc.persistent, "Persistent flag").to.equal(true);
			expect( doc.modified, "Modified flag").to.equal(false);
			key_insert_filled = doc.document._key;
		});
		
		//
		// Insert object with same content.
		//
		it( "Insert object with same content:", function ()
		{
			let doc;
			let func;
			let result;
			
			func = () => {
				doc =
					new TestClassPersistSignificant(
						param.request, param.content, default_collection
					);
			};
			expect( func, "Instantiation" ).not.to.throw();
			
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, "Insert" ).not.to.throw();
			expect( doc.document, "Should not be empty").not.to.be.empty;
			expect( doc.document, "Has _id" ).to.have.property( '_id' );
			expect( doc.document, "Has _key" ).to.have.property( '_key' );
			expect( doc.document, "Has _rev" ).to.have.property( '_rev' );
			expect( result, "Insert result" ).to.equal( true );
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
		// Resolve null reference.
		//
		it( "Resolve null reference:", function ()
		{
			let doc;
			let func;
			let result;
			
			func = () => {
				doc =
					new Document(
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
		it( "Resolve selector without significant field:", function ()
		{
			let doc;
			let func;
			let result;
			
			func = () => {
				doc =
					new TestClassPersistNoRequired(
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
		it( "Resolve with not found selector:", function ()
		{
			let doc;
			let func;
			let result;
			
			func = () => {
				doc =
					new Document(
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
		it( "Resolve with replace:", function ()
		{
			const selector = JSON.parse(JSON.stringify(param.replace));
			selector._key = key_insert_filled;
			const func_instantiate = () => {
				return new Document(
					param.request,
					selector,
					default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(true, true);
			};
			expect( func_resolve, "Resolve and raise" ).not.to.throw();
			for( const field in param.replace )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
				{
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.not.to.equal( param.replace[ field ] );
				}
			}
			expect(doc.modified, "Modified flag").to.equal(true);
		});
		
		//
		// Resolve without replace.
		//
		it( "Resolve without replace:", function ()
		{
			const selector = JSON.parse(JSON.stringify(param.replace));
			selector._key = key_insert_filled;
			const func_instantiate = () => {
				return new Document(
					param.request,
					selector,
					default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(false, true);
			};
			expect( func_resolve, "Resolve and raise" ).not.to.throw();
			for( const field in param.replace )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
				{
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.to.equal( param.replace[ field ] );
				}
			}
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Resolve without replace but locked.
		//
		it( "Resolve without replace but locked:", function ()
		{
			const selector = JSON.parse(JSON.stringify(param.replace));
			selector._key = key_insert_filled;
			const func_instantiate = () => {
				return new TestClassPersistNoSignificant(
					param.request,
					selector,
					default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(false, true);
			};
			expect( func_resolve, "Resolve and raise" ).not.to.throw();
			for( const field in param.replace )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
				{
					if( field === doc.lockedFields[ 0 ] )
						expect( doc.document[ field ], `Locked property mismatch [${field}]` )
							.to.equal( param.content[ field ] );
					else
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.equal( param.replace[ field ] );
				}
			}
			expect(doc.modified, "Modified flag").to.equal(true);
		});
		
		//
		// Change locked field.
		//
		it( "Change locked field:", function ()
		{
			const func_instantiate = () => {
				return new TestClassPersistNoSignificant(
					param.request,
					key_insert_filled,
					default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			const func_load = () => {
				doc.setDocumentProperties( {var:"PIPPO"}, true )
			};
			expect( func_load, "Load with modify" )
				.to.throw( MyError, /Property is locked/ );
			const func_load_bis = () => {
				doc.setDocumentProperties( {var:"PIPPO"}, false )
			};
			expect( func_load, "Load without modify" )
				.to.throw( MyError, /Property is locked/ );
		});
		
		//
		// Resolve multiple documents.
		//
		it( "Resolve multiple documents:", function ()
		{
			const selector = { var: 'VAR'};
			const func_instantiate = () => {
				return new TestClassPersistSignificant(
					param.request,
					selector,
					default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(false, true);
			};
			expect( func_resolve, "Resolve and raise explicit" )
				.to.throw( MyError, /combination of fields is not unique/ );
			const func_resolve_bis = () => {
				result = doc.resolveDocument(false, false);
			};
			expect( func_resolve, "Resolve and raise not explicit" )
				.to.throw( MyError, /combination of fields is not unique/ );
			expect( result, "Resolve result" ).to.equal( undefined );
		});
		
	});	// Resolve.
	
	//
	// Replace tests.
	//
	describe( "Replace:", function ()
	{
		//
		// Resolve and replace by reference.
		//
		it( "Resolve and replace by reference:", function ()
		{
			const func_instantiate = () => {
				return new Document(
					param.request, key_insert_filled, default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(false, true);
			};
			expect( func_resolve, "Resolve" ).not.to.throw();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			expect( result, "Resolve result" ).to.equal( true );
			expect(doc.persistent, "Persistent flag").to.equal(true);
			expect(doc.modified, "Modified flag").to.equal(false);
			for( const field in param.content )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.to.equal( param.content[ field ] );
			}
			doc.document.var = "NEW_VAR";
			const func_replace = () => {
				result = doc.replaceDocument();
			};
			expect( func_replace, "Replace" ).not.to.throw();
			expect( result, "Resolve result" ).to.equal( true );
			expect( doc.document.var, "Replaced property" ).to.equal("NEW_VAR");
		});
		
		//
		// Resolve and replace by selector.
		//
		it( "Resolve and replace by selector:", function ()
		{
			const selector = {var: "NEW_VAR"};
			const func_instantiate = () => {
				return new Document(
					param.request, selector, default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(false, true);
			};
			expect( func_resolve, "Resolve" ).not.to.throw();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			expect( result, "Resolve result" ).to.equal( true );
			expect(doc.persistent, "Persistent flag").to.equal(true);
			expect(doc.modified, "Modified flag").to.equal(false);
			for( const field in param.content )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
				{
					if( field === 'var' )
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.equal(selector.var);
					else
						expect( doc.document[ field ], `Property mismatch [${field}]` )
							.to.equal( param.content[ field ] );
				}
			}
			doc.document.var = "REPLACED_VAR";
			const func_replace = () => {
				result = doc.replaceDocument();
			};
			expect( func_replace, "Replace" ).not.to.throw();
			expect( result, "Resolve result" ).to.equal( true );
			expect( doc.document.var, "Replaced property" ).to.equal("REPLACED_VAR");
		});
		
		//
		// Replace non existing document.
		//
		it( "Replace non existing document:", function ()
		{
			const selector = {var: "VAR"};
			const func_instantiate = () => {
				return new Document(
					param.request, selector, default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(false, true);
			};
			expect( func_resolve, "Resolve" ).not.to.throw();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			expect( result, "Resolve result" ).to.equal( true );
			expect(doc.persistent, "Persistent flag").to.equal(true);
			expect(doc.modified, "Modified flag").to.equal(false);
			for( const field in param.content )
			{
				expect( doc.document, `Missing property` ).to.have.property(field);
				if( doc.document.hasOwnProperty( field ) )
					expect( doc.document[ field ], `Property mismatch [${field}]` )
						.to.equal( param.content[ field ] );
			}
			db._remove(doc.document._id);
			doc.document.var = "NEW_VAR";
			const func_replace = () => {
				result = doc.replaceDocument();
			};
			expect( func_replace, "Replace" )
				.to.throw( MyError, /not found in collection/ );
		});
		
		//
		// Replace non persistent document.
		//
		it( "Replace non persistent document:", function ()
		{
			const func_instantiate = () => {
				return new Document(
					param.request, null, default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_replace = () => {
				result = doc.replaceDocument();
			};
			expect( func_replace, "Replace" )
				.to.throw( MyError, /document is not persistent/ );
		});
		
		//
		// Replace locked field.
		//
		it( "Replace locked field:", function ()
		{
			const func_instantiate = () => {
				return new TestClassPersistSignificant(
					param.request, key_insert_filled, default_collection
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			const func_resolve = () => {
				doc.resolveDocument(false, true);
			};
			expect( func_resolve, "Resolve" ).not.to.throw();
			db._collection(default_collection).update(
				key_insert_filled,
				{var: "WAS_CHANGED"},
				{waitForSync: true}
			);
			let result;
			const func_replace = () => {
				result = doc.replaceDocument();
			};
			expect( func_replace, "Replace" )
				.to.throw( MyError, /Constraint violation/ );
			expect( result, "Resolve result" ).to.equal( undefined );
			expect( doc.document.var, "Replaced property" ).to.equal("REPLACED_VAR");
		});
	
	});	// Replace.
	
});
