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
db._collection(param.collection_edge).truncate();
db._collection(param.collection_document).truncate();

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
		// Instantiate without selector and collection.
		//
		it( "Instantiate without selector and collection:", function ()
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
		// Instantiate without selector with edge collection.
		//
		it( "Instantiate without selector with edge collection:", function ()
		{
			expect( () => {
				const tmp = new Document( param.request, null, param.collection_edge );
			}).not.to.throw();
		});
		
		//
		// Instantiate without selector with document collection.
		//
		it( "Instantiate without selector with document collection:", function ()
		{
			expect( () => {
				const tmp = new Document( param.request, null, param.collection_document );
			}).not.to.throw();
		});
		
		//
		// Instantiate without selector with non existant collection.
		//
		it( "Instantiate without selector with non existant collection:", function ()
		{
			expect( () => {
				const tmp = new Document( param.request, null, 'test' );
			}).not.to.throw();
		});
		
		//
		// Instantiate default collection with null selector and no collection.
		//
		it( "Instantiate default collection with null selector and no collection:",
			function ()
		{
			expect( () => {
				const tmp = new TestClassCollection( param.request, null );
			}).not.to.throw();
		});
		
		//
		// Instantiate without selector and wrong collection.
		//
		it( "Instantiate without selector and wrong collection:", function ()
		{
			expect( () => {
				const tmp =
					new TestClassCollection(
						param.request, null, param.collection_edge );
			}).to.throw(
				MyError,
				/Invalid collection/
			);
		});
		
		//
		// Instantiate immutable document.
		//
		it( "Instantiate immutable document:", function ()
		{
			const func = () => {
				return new Document(
					param.request, null, param.collection_document, true
				);
			}
			expect( func, "Instantiation" )
				.not.to.throw();
			const tmp =
				new Document(
					param.request, null, param.collection_document, true
				);
			expect( tmp.document, "Should be mutable" )
				.not.to.be.sealed;
			expect(tmp.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Instantiate with cross-collection reference.
		//
		it( "Instantiate with cross-collection reference:", function ()
		{
			expect( () => {
				const tmp =
					new Document(
						param.request, 'descriptors/order', param.collection_document );
			}).to.throw(
				MyError,
				/cross-collection reference/
			);
		});
		
		//
		// Instantiate with not found reference.
		//
		it( "Instantiate with not found reference:", function ()
		{
			expect( () => {
				const tmp =
					new Document(
						param.request, 'test_Document/MISSING', param.collection_document );
			}).to.throw(
				MyError,
				/not found in collection/
			);
		});
		
		//
		// Instantiate with found reference and no collection.
		//
		it( "Instantiate with found reference and no collection:", function ()
		{
			const func = () => {
				return new Document(
					param.request, 'descriptors/order'
				);
			}
			expect( func, "Instantiation" )
				.not.to.throw();
			const tmp = func();
			expect( tmp.document, "Should be mutable" )
				.not.to.be.sealed;
			expect(tmp.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Instantiate with found selector.
		//
		it( "Instantiate with found selector:", function ()
		{
			const func = () => {
				return new Document(
					param.request, {var: 'kOrder'}, 'descriptors' );
			};
			expect(func).not.to.throw();
			const tmp = func();
			expect(tmp.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Instantiate with content.
		//
		it( "Instantiate with content:", function ()
		{
			const func = function () {
				return new Document(
					param.request, param.content, param.collection_document );
			};
			expect( func, "Instantiation" ).not.to.throw();
			const doc = func();
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
		// Instantiate with restricted content.
		//
		it( "Instantiate with restricted content:", function ()
		{
			const func = () => {
				return new TestClassPersistSignificant(
					param.request, param.content, param.collection_document
				);
			};
			expect( func, "Instantiation" ).not.to.throw();
			const doc = func();
			const restricted = doc.restrictedFields[ 0 ];
			expect(doc.document, `Restricted field`)
				.not.to.have.property(restricted);
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
			const func_instantiate = () => {
				return new Document(
					param.request, null, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			expect(doc.document, "Should be empty").to.be.empty;
			const func_load = () => {
				doc.setDocumentProperties( param.content, false )
			};
			expect( func_load, "Load" ).not.to.throw();
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
		// Load non empty object without replace.
		//
		it( "Load non empty object without replace:", function ()
		{
			const func_instantiate = () => {
				return new Document(
					param.request, param.content, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			const func_load = () => {
				doc.setDocumentProperties( param.replace, false )
			};
			expect( func_load, "Load" ).not.to.throw();
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
			const func_instantiate = () => {
				return new Document(
					param.request, param.content, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			const func_load = () => {
				doc.setDocumentProperties( param.replace, true )
			};
			expect( func_load, "Load" ).not.to.throw();
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
		// Replace non persistent object locked field.
		//
		it( "Replace non persistent object locked field:", function ()
		{
			const func_instantiate = () => {
				return new TestClassPersistNoSignificant(
					param.request, param.content, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			const func_load = () => {
				doc.setDocumentProperties( param.replace, true )
			};
			expect( func_load, "Load" ).not.to.throw();
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
			const func_instantiate = () => {
				return new TestClassPersistNoSignificant(
					param.request, 'descriptors/name', 'descriptors'
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			const func_load = () => {
				doc.setDocumentProperties( param.replace, true )
			};
			expect( func_load, "Load" ).to.throw( MyError, /Property is locked/ );
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
			const func_instantiate = () => {
				return new Document(
					param.request, null, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_insert = function () {
				result = doc.insertDocument();
			};
			expect( func_insert, "Insert" ).not.to.throw();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			expect( doc.document, "Has _id" ).to.have.property( '_id' );
			expect( doc.document, "Has _key" ).to.have.property( '_key' );
			expect( doc.document, "Has _rev" ).to.have.property( '_rev' );
			expect( result, "Insert result" ).to.equal( true );
			expect(doc.persistent, "Persistent flag").to.equal(true);
			expect(doc.modified, "Modified flag").to.equal(false);
			key_insert_empty = doc.document._key;
		});
		
		//
		// Insert duplicate object.
		//
		it( "Insert duplicate object:", function ()
		{
			const func_instantiate = () => {
				return new Document(
					param.request, {_key: key_insert_empty}, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_insert = function () {
				result = doc.insertDocument();
			};
			expect( func_insert, "Insert" )
				.to.throw( MyError, /duplicate document in collection/ );
			expect(doc.document, "Should not be empty").not.to.be.empty;
			expect( doc.document, "Has _id" ).not.to.have.property( '_id' );
			expect( doc.document, "Has _key" ).to.have.property( '_key' );
			expect( doc.document, "Has _rev" ).not.to.have.property( '_rev' );
			expect( result, "Insert result" ).to.equal( undefined );
			expect(doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Insert object without required field.
		//
		it( "Insert object without required field:", function ()
		{
			const func_instantiate = () => {
				return new TestClassPersistNoSignificant(
					param.request, null, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_insert = function () {
				result = doc.insertDocument();
			};
			expect( func_insert, "Insert" )
				.to.throw( MyError, /missing required field/ );
			expect(doc.document, "Should be empty").to.be.empty;
			expect( result, "Insert result" ).to.equal( undefined );
			expect(doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Insert object without significant field.
		//
		it( "Insert object without significant field:", function ()
		{
			const func_instantiate = () => {
				return new TestClassPersistNoRequired(
					param.request, null, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_insert = function () {
				result = doc.insertDocument();
			};
			expect( func_insert, "Insert" ).not.to.throw();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			expect( result, "Insert result" ).to.equal( true );
			expect(doc.persistent, "Persistent flag").to.equal(true);
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Insert object with content.
		//
		it( "Insert object with content:", function ()
		{
			const func_instantiate = () => {
				return new TestClassPersistNoSignificant(
					param.request, param.content, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_insert = function () {
				result = doc.insertDocument();
			};
			expect( func_insert, "Insert" ).not.to.throw();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			expect( doc.document, "Has _id" ).to.have.property( '_id' );
			expect( doc.document, "Has _key" ).to.have.property( '_key' );
			expect( doc.document, "Has _rev" ).to.have.property( '_rev' );
			expect( result, "Insert result" ).to.equal( true );
			expect(doc.persistent, "Persistent flag").to.equal(true);
			expect(doc.modified, "Modified flag").to.equal(false);
			key_insert_filled = doc.document._key;
		});
		
		//
		// Insert object with same content.
		//
		it( "Insert object with same content:", function ()
		{
			const func_instantiate = () => {
				return new TestClassPersistNoSignificant(
					param.request, param.content, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_insert = function () {
				result = doc.insertDocument();
			};
			expect( func_insert, "Insert" ).not.to.throw();
			expect(doc.document, "Should not be empty").not.to.be.empty;
			expect( doc.document, "Has _id" ).to.have.property( '_id' );
			expect( doc.document, "Has _key" ).to.have.property( '_key' );
			expect( doc.document, "Has _rev" ).to.have.property( '_rev' );
			expect( result, "Insert result" ).to.equal( true );
			expect(doc.persistent, "Persistent flag").to.equal(true);
			expect(doc.modified, "Modified flag").to.equal(false);
			key_insert_same = doc.document._key;
		});
		
	});	// Insert.
	
	//
	// Resolve tests.
	//
	describe( "Resolve:", function ()
	{
		//
		// Resolve empty object.
		//
		it( "Resolve empty object:", function ()
		{
			const func_instantiate = () => {
				return new Document(
					param.request, null, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(true, true);
			};
			expect( func_resolve, "Resolve" )
				.to.throw( MyError, /cannot locate document without selection data/ );
			expect(doc.document, "Should be empty").to.be.empty;
			expect( result, "Resolve result" ).to.equal( undefined );
			expect(doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Resolve without significant field.
		//
		it( "Resolve without significant field:", function ()
		{
			const func_instantiate = () => {
				return new TestClassPersistNoRequired(
					param.request, {name: "pippo"}, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(true, true);
			};
			expect( func_resolve, "Resolve" )
				.to.throw( MyError, /missing required fields to resolve object/ );
			expect(doc.document, "Should be empty").not.to.be.empty;
			expect( result, "Resolve result" ).to.equal( undefined );
			expect(doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
		});
		
		//
		// Resolve with not found selector.
		//
		it( "Resolve with not found selector:", function ()
		{
			const func_instantiate = () => {
				return new Document(
					param.request,
					{_id: 'test_Document/UNKNOWN'},
					param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			let result;
			const func_resolve = () => {
				result = doc.resolveDocument(true, true);
			};
			expect( func_resolve, "Resolve and raise" )
				.to.throw( MyError, /not found in collection/ );
			expect(doc.document, "Should be empty").not.to.be.empty;
			expect( result, "Resolve result" ).to.equal( undefined );
			expect(doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
			expect( func_resolve, "Resolve" )
				.to.throw( MyError, /not found in collection/ );
			const func_resolve_no_exception = () => {
				result = doc.resolveDocument(true, false);
			};
			expect( func_resolve_no_exception, "Resolve and not raise" )
				.not.to.throw();
			expect(doc.document, "Should be empty").not.to.be.empty;
			expect( result, "Resolve result" ).to.equal( false );
			expect(doc.persistent, "Persistent flag").to.equal(false);
			expect(doc.modified, "Modified flag").to.equal(false);
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
					param.collection_document
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
					param.collection_document
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
					param.collection_document
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
					param.collection_document
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
					param.collection_document
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
					param.request, key_insert_filled, param.collection_document
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
					param.request, selector, param.collection_document
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
					param.request, selector, param.collection_document
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
					param.request, null, param.collection_document
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
					param.request, key_insert_filled, param.collection_document
				);
			};
			expect( func_instantiate, "Instantiation" ).not.to.throw();
			const doc = func_instantiate();
			const func_resolve = () => {
				doc.resolveDocument(false, true);
			};
			expect( func_resolve, "Resolve" ).not.to.throw();
			db._collection(param.collection_document).update(
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
