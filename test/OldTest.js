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
// Support.
//
const param = require( './disabled/paramDocument' );

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );

//
// Test class.
//
const TestClass = require( '../classes/Document' );

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
		// Test provide invalid reference.
		//
		it( "Instantiate with invalid reference:", function ()
		{
			expect(function () {
				return new TestClass(
					param.request,				// Request.
					[],							// Contents or selector.
					param.collection,			// Collection.
					true						// Immutable object
				);
			}).to.throw(MyError, /expecting document contents, selector or reference/ );
		});
		
		//
		// Test omit collection.
		//
		it( "Instantiate without collection:", function ()
		{
			expect(function () {
				return new TestClass(
					param.request,				// Request.
					null,						// Contents or selector.
					null,						// Collection.
					true						// Immutable object
				);
			}).to.throw(MyError, /missing collection reference/ );
		});
		
		//
		// Test provide null in reference.
		//
		it( "Instantiate with null reference:", function ()
		{
			//
			// Create instantiation function.
			//
			const instantiate = function () {
				return new TestClass(
					param.request,				// Request.
					null,						// Contents or selector.
					param.collection,			// Collection.
					true						// Immutable object
				);
			};
			
			//
			// Constructor test.
			//
			expect(instantiate, "Instantiate object")
				.not.to.throw();
			
			//
			// Instantiate class.
			//
			const test = instantiate();
			
			//
			// Test immutable.
			//
			expect(test.document, "Is mutable")
				.not.to.be.sealed;
			
			//
			// Test collection() getter.
			//
			expect(test.collection, "Getter collection() type")
				.to.be.a('string' );
			expect(test.collection, "Getter collection() content")
				.to.equal(param.collection, "Collection name changed" );
			
			//
			// Test instance() getter.
			//
			expect(test.instance, "Getter instance() type")
				.to.be.undefined;
			
			//
			// Test persistent() getter.
			//
			expect(test.persistent, "Getter persistent() type")
				.to.be.a('boolean' );
			expect(test.persistent, "Getter persistent() content")
				.to.equal(false, "Should not be persistent" );
			
			//
			// Test revised() getter.
			//
			expect(test.revised, "Getter revised() type")
				.to.be.a('boolean' );
			expect(test.revised, "Getter revised() content")
				.to.equal(false, "Should not have a revision change" );
			
			//
			// Test document() getter.
			//
			expect(test.document, "Getter document() type")
				.to.be.an('object' );
			expect(test.document, "Getter document() content")
				.to.be.empty;
			
		});	// Provide null in reference.
		
		//
		// Test provide object in reference.
		//
		it( "Provide object in reference", function () {
			
			//
			// Create instantiation function.
			//
			const content = param.content_01;
			const instantiate = function () {
				return new TestClass(
					param.request,				// Request.
					content,					// Contents or selector.
					param.collection,			// Collection.
					true						// Immutable object
				);
			};
			
			//
			// Constructor test.
			//
			expect( instantiate, "Instantiate object" )
				.not.to.throw();
			
			//
			// Instantiate class.
			//
			const test = instantiate();
			
			//
			// Test immutable.
			//
			expect(test.document, "Is mutable")
				.not.to.be.sealed;
			
			//
			// Test collection() getter.
			//
			expect(test.collection, "Getter collection() type")
				.to.be.a('string' );
			expect(test.collection, "Getter collection() content")
				.to.equal(param.collection, "Collection name changed" );
			
			//
			// Test instance() getter.
			//
			expect(test.instance, "Getter instance() type")
				.to.be.undefined;
			
			//
			// Test persistent() getter.
			//
			expect(test.persistent, "Getter persistent() type")
				.to.be.a('boolean' );
			expect(test.persistent, "Getter persistent() content")
				.to.equal(false, "Should not be persistent" );
			
			//
			// Test revised() getter.
			//
			expect(test.revised, "Getter revised() type")
				.to.be.a('boolean' );
			expect(test.revised, "Getter revised() content")
				.to.equal(false, "Should not have a revision change" );
			
			//
			// Test document() getter.
			//
			expect(test.document, "Getter document() type")
				.to.be.an('object' );
			expect(test.document, "Getter document() content")
				.not.to.be.empty;
			expect(test.document, "Getter document() keys")
				.to.have.all.keys(content);
			
		});	// Provide object in reference.
		
	});	// Instantiation.
	
	//
	// Modification tests.
	//
	describe( "Modify contents:", function () {
		
		//
		// Modify data.
		//
		const add_data = {};
		add_data[ Dict.descriptor.kUnit ] = Dict.term.kTypeUnitLengthKm;
		add_data[ Dict.descriptor.kVariable ] = 'VarName';
		const mod_data = {};
		mod_data[ Dict.descriptor.kUnit ] = Dict.term.kTypeUnitLengthM;
		mod_data[ Dict.descriptor.kVariable ] = 'VarNameMod';
		mod_data[ Dict.descriptor.kOrder ] = 1;
		const rep_data = {};
		rep_data[ Dict.descriptor.kUnit ] = Dict.term.kTypeUnitLengthCm;
		rep_data[ Dict.descriptor.kVariable ] = 'VarNameRep';
		const del_data = {};
		del_data[ Dict.descriptor.kUnit ] = null;
		del_data[ Dict.descriptor.kVariable ] = null;
		
		//
		// Set function.
		//
		const add = function () {
			test.setDocumentProperties( add_data, false );
		};
		const mod = function () {
			test.setDocumentProperties( mod_data, false );
		};
		const rep = function () {
			test.setDocumentProperties( rep_data, true );
		};
		const del = function () {
			test.setDocumentProperties( del_data, true );
		};
		
		//
		// Instantiate class.
		//
		const content = param.content_01;
		const test =
			new TestClass(
				param.request,				// Request.
				content,					// Contents or selector.
				param.collection,			// Collection.
				true						// Immutable object
			);
		
		//
		// Add data.
		//
		it( "Set data", function () {
			
			//
			// Add data.
			//
			expect( add, "setDocumentProperties() append" )
				.not.to.throw();
			expect( test.document,
				"setDocumentProperties() append - has unit" )
				.to.have.property( Dict.descriptor.kUnit )
				.equal( add_data[ Dict.descriptor.kUnit ] );
			expect( test.document,
				"setDocumentProperties() append - has variable" )
				.to.have.property( Dict.descriptor.kVariable )
				.equal( param.content_01[ Dict.descriptor.kVariable ] );
			
		});	// Set data.
		
		//
		// Modify data.
		//
		it( "Modify data", function () {
			
			//
			// Modify without replacing.
			//
			expect(mod, "setDocumentProperties() modify" )
				.not.to.throw();
			expect(test.document,
				"setDocumentProperties() modify - has unit")
				.to.have.property(Dict.descriptor.kUnit)
				.equal(add_data[ Dict.descriptor.kUnit ]);
			expect(test.document,
				"setDocumentProperties() modify - has variable")
				.to.have.property(Dict.descriptor.kVariable)
				.equal(param.content_01[ Dict.descriptor.kVariable ]);
			expect(test.document,
				"setDocumentProperties() modify - has order")
				.to.have.property(Dict.descriptor.kOrder)
				.equal(mod_data[ Dict.descriptor.kOrder ]);
			
			//
			// Replace data.
			//
			expect(rep, "setDocumentProperties() replace" )
				.not.to.throw();
			expect(test.document,
				"setDocumentProperties() replace - has unit")
				.to.have.property(Dict.descriptor.kUnit)
				.equal(rep_data[ Dict.descriptor.kUnit ]);
			expect(test.document,
				"setDocumentProperties() replace - has variable")
				.to.have.property(Dict.descriptor.kVariable)
				.equal(rep_data[ Dict.descriptor.kVariable ]);
			
		});	// Modify data.
		
		//
		// Remove data.
		//
		it( "Remove data", function () {
			
			//
			// Remove data.
			//
			expect(del, "setDocumentProperties() remove" )
				.not.to.throw();
			expect(test.document,
				"setDocumentProperties() remove - deleted unit")
				.not.to.have.property(Dict.descriptor.kUnit);
			expect(test.document,
				"setDocumentProperties() remove - deleted variable")
				.not.to.have.property(Dict.descriptor.kVariable);
			
		});	// Remove data.
		
	});	// Modify contents.
	
	//
	// Add persistent constraints.
	//
	class TestClassPersist extends TestClass
	{
		// get significantFields()	{	return [ [Dict.descriptor.kVariable] ]; }
		get requiredFields()	{	return [ Dict.descriptor.kVariable ]; }
		get uniqueFields()		{	return [ Dict.descriptor.kVariable ]; }
		get lockedFields()		{	return [ Dict.descriptor.kVariable ]; }
		get defaultCollection()	{	return param.collection; }
	}
	
	//
	// Truncate collection.
	//
	db._collection(param.collection).truncate();
	
	//
	// Insert document.
	//
	describe( "Persistence:", function () {
		
		//
		// Create instantiation function.
		//
		const instantiate = function () {
			return new TestClassPersist(
				param.request,				// Request.
				param.content_01,			// Contents or selector.
				null,						// Collection.
				true						// Immutable object
			);
		};
		
		//
		// Instantiate document.
		//
		it( "Instantiate", function () {
			
			//
			// Constructor test.
			//
			expect( instantiate, "Instantiate object without collection" )
				.not.to.throw();
			
		});	// Instantiate.
		
		//
		// Instantiate class.
		//
		const test1 =
			new TestClassPersist(
				param.request,				// Request.
				param.content_01,			// Contents or selector.
				null,						// Collection.
				true						// Immutable object
			);
		const test2 =
			new TestClassPersist(
				param.request,				// Request.
				param.content_02,			// Contents or selector.
				null,						// Collection.
				true						// Immutable object
			);
		
		//
		// Insert results.
		//
		let insert1 = null;
		let insert2 = null;
		
		//
		// Insert functions.
		//
		const ins1 = function () {
			insert1 = test1.insertDocument();
		};
		const ins2 = function () {
			insert2 = test2.insertDocument();
		};
		
		//
		// Current revision.
		//
		let id;
		let revision;
		
		//
		// Instantiate document.
		//
		it( "Insert", function () {
			
			//
			// Insert test.
			//
			let tmpx = test1.document[Dict.descriptor.kVariable];
			delete test1.document[Dict.descriptor.kVariable];
			expect( ins1, "Insert document 1 - insert with missing field" )
				.to.throw(MyError, /missing required field/);
			test1.document[Dict.descriptor.kVariable] = tmpx;
			
			//
			// Insert test.
			//
			expect( ins1, "Insert document 1 - insert complete object" )
				.not.to.throw();
			expect( insert1, "Insert document 1 - result" )
				.to.equal( true );
			
			//
			// Test immutable.
			//
			expect(test1.document, "Insert document 1 - Is mutable")
				.not.to.be.sealed;
			
			//
			// Test collection() getter.
			//
			expect(test1.collection, "Insert document 1 - collection type")
				.to.be.a('string' );
			expect(test1.collection, "Insert document 1 - collection name")
				.to.equal(param.collection, "Collection name changed" );
			
			//
			// Test persistent() getter.
			//
			expect(test1.persistent, "Insert document 1 - persistent() type")
				.to.be.a('boolean' );
			expect(test1.persistent, "Insert document 1 - persistent() content")
				.to.equal(true, "Should be persistent" );
			
			//
			// Test revised() getter.
			//
			expect(test1.revised, "Insert document 1 - revised() type")
				.to.be.a('boolean' );
			expect(test1.revised, "Insert document 1 - revised() content")
				.to.equal(false, "Should not have a revision change" );
			
			//
			// Test document() getter.
			//
			expect(test1.document, "Insert document 1 - document() type")
				.to.be.an('object' );
			expect(test1.document, "Insert document 1 - document() content")
				.not.to.be.empty;
			expect(test1.document,
				"Insert document 1 - has _id")
				.to.have.property('_id');
			expect(test1.document,
				"Insert document 1 - has _key")
				.to.have.property('_key');
			expect(test1.document,
				"Insert document 1 - has _rev")
				.to.have.property('_rev');
			
			//
			// Test exists.
			//
			expect(db._collection(param.collection).exists(test1.document),
				"Insert document 1 - exists")
				.not.to.be.false;
			
			//
			// Instantiate copy.
			//
			const tmp =
				new TestClassPersist(
					param.request,				// Request.
					param.content_01,			// Contents or selector.
					null,						// Collection.
					true						// Immutable object
				);
			const insTmp = function () {
				tmp.insertDocument();
			};
			
			//
			// Test duplicate.
			//
			tmp.document._key = test1.document._key;
			expect(insTmp, "Insert document 1 - test duplicate")
				.to.throw(MyError, /duplicate document/);
			
			//
			// Set ID and revision.
			//
			id = test1.document._id;
			revision = test1.document._rev;
			
		});	// Insert.
		
		//
		// Resolve document.
		//
		it( "Resolve", function () {
			
			//
			// Init local storage.
			//
			let doc;
			let func;
			let modif;
			let result;
			
			//
			// Instantiate by object with wrong _id.
			//
			modif = {};
			modif._id = `test_Document/12345678`;
			func = function () {
				doc = new TestClassPersist(param.request, modif);
			};
			expect( func, "Resolve document 1 - Instantiate by object with wrong _id" )
				.not.to.throw();
			
			//
			// Instantiate by reference with wrong _id.
			//
			func = function () {
				doc = new TestClassPersist(param.request, modif._id);
			};
			expect( func, "Resolve document 1 - Instantiate by reference with wrong _id" )
				.to.throw(MyError, /Invalid document reference/);
			
			//
			// Instantiate by reference with correct _id.
			//
			func = function () {
				doc = new TestClassPersist(param.request, id);
			};
			expect(
				func,
				"Resolve document 1 - Instantiate by reference with correct _id" )
				.not.to.throw();
			
			//
			// Resolve by _id in object selector.
			//
			modif = {};
			modif._id = id;
			func = function () {
				doc = new TestClassPersist(param.request, modif);
				doc.resolveDocument(true, true);
			};
			expect( func, "Resolve document 1 - Resolve by _id in object selector" )
				.not.to.throw();
			
			//
			// Resolve by var in object selector.
			//
			modif = {};
			modif[ Dict.descriptor.kVariable ] = param.content_01[ Dict.descriptor.kVariable ];
			func = function () {
				doc = new TestClassPersist(param.request, modif);
				doc.resolveDocument(true, true);
			};
			expect( func, "Resolve document 1 - Resolve by var in object selector" )
				.not.to.throw();
			
			//
			// Resolve by name in object selector.
			//
			modif = {};
			modif[ Dict.descriptor.kName ] = param.content_01[ Dict.descriptor.kName ];
			func = function () {
				doc = new TestClassPersist(param.request, modif);
				doc.resolveDocument(true, true);
			};
			expect( func, "Resolve document 1 - Resolve by name in object selector" )
				.not.to.throw();
			
			//
			// Resolve more than one document.
			//
			func = function () {
				doc = new TestClassPersist(param.request, param.content_05);
				doc.insertDocument();
				modif = {};
				modif[ Dict.descriptor.kVariable ] = param.content_01[ Dict.descriptor.kVariable ];
				doc = new TestClassPersist(param.request, modif);
				doc.resolveDocument(true, true);
			};
			expect( func, "Resolve document 1 - Resolve by name in object selector" )
				.not.to.throw();
			
		});	// Resolve.
		
		/*
		 //
		 // Instantiate document.
		 //
		 it( "Replace", function () {
		 
		 //
		 // Init local storage.
		 //
		 let func;
		 let modif;
		 let result;
		 
		 //
		 // Test persistent document modifications.
		 //
		 modif = {};
		 modif[ Dict.descriptor.kVariable ] = "BADVAR";
		 func = function () {
		 test1.setDocumentProperties(modif);
		 };
		 expect( func, "Replace document 1 - Setting locked property" )
		 .to.throw(MyError, /Property is locked/);
		 modif = {};
		 modif[ Dict.descriptor.kOrder ] = 0;
		 func = function () {
		 test1.setDocumentProperties(modif);
		 };
		 expect( func, "Replace document 1 - Setting unlocked property" )
		 .not.to.throw();
		 
		 //
		 // Test replace.
		 //
		 func = function () {
		 result = test1.replaceDocument();
		 }
		 expect( func, "Replace document 1 - Replace" )
		 .not.to.throw();
		 expect( result, "Replace document 1 - result" )
		 .to.equal( true );
		 expect( revision, "Replace document 1 - revision" )
		 .not.to.equal( test1.document._rev );
		 
		 });	// Replace.
		 */
		
	});	// Persistence.
	
});
