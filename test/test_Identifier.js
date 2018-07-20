'use strict';

const should = require('chai').should();
const expect = require('chai').expect;

const db = require('@arangodb').db;
const Dict = require( '../dictionary/Dict' );
const Identifier = require( '../classes/Identifier' );

const params = require( './parameters/Document' );

describe('Identifier class tests:', function ()
{
	const collection = 'test_Document';
	
	let doc;
	let func;
	let meta;
	let action;
	let message;

	it('Clear collections', function ()
	{
		func = function() {
			db._collection( collection ).truncate();
		};
		expect( func, "Clearing test document collection" )
			.not.to.throw();
	});
	
	it('Insert namespace', function ()
	{
		const data = {};
		data[ Dict.descriptor.kLID ] = 'NAMESPACE';
		
		for( const trans of [ false, true ] )
		{
			action = ( trans ) ? "with transaction" : "without transaction";
			data._key = ( trans ) ? 'NS_TRANS' : 'NS';
			
			message = "Instantiate namespace";
			func = function() {
				doc =
					new Identifier(
						params.request,
						data,
						collection
					);
			}
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			message = "Insert document";
			func = function () {
				meta = doc.insertDocument( true, trans );
			};
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			message = "Document metadata properties";
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_id' );
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_key' );
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_rev' );
			
			message = "Document metadata contents";
			expect( doc.document._key, `${message} - ${action}` )
				.to.equal( data._key );
		}
	});
	
	it('Insert identifier', function ()
	{
		const data = {};
		data[ Dict.descriptor.kLID ] = 'IDENTIFIER';
		
		for( const trans of [ false, true ] )
		{
			action = ( trans ) ? "with transaction" : "without transaction";
			data._key = ( trans ) ? 'ID_TRANS' : 'ID';
			data[ Dict.descriptor.kNID ] = ( trans )
										   ? `${collection}/NS_TRANS`
										   : `${collection}/NS`;
			
			message = "Instantiate identifier";
			func = function() {
				doc =
					new Identifier(
						params.request,
						data,
						collection
					);
			}
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			message = "Insert document";
			func = function () {
				meta = doc.insertDocument( true, trans );
			};
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			message = "Document metadata properties";
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_id' );
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_key' );
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( '_rev' );
			
			message = "Document metadata contents";
			expect( doc.document._key, `${message} - ${action}` )
				.to.equal( data._key );
		}
	});
	
	it('Check document instances', function ()
	{
		const keys = [ 'ID', 'ID_TRANS' ];
		
		for( const key of keys )
		{
			message = `Locate document ${key}`;
			func = function() {
				doc =
					new Identifier(
						params.request,
						key,
						collection
					);
			}
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			message = `Check ${key} instance`;
			expect( doc.document, `${message} - ${action}` )
				.not.to.have.property( Dict.descriptor.kInstances );
		}
	});
	
	it('Check namespace instances', function ()
	{
		const keys = [ 'NS', 'NS_TRANS' ];
		
		for( const key of keys )
		{
			message = `Locate document ${key}`;
			func = function() {
				doc =
					new Identifier(
						params.request,
						key,
						collection
					);
			}
			expect( func, `${message} - ${action}` )
				.not.to.throw();
			
			message = `Check ${key} instance`;
			expect( doc.document, `${message} - ${action}` )
				.to.have.property( Dict.descriptor.kInstances );
			
			message = `Check ${key} instance elements`;
			expect( doc.document[ Dict.descriptor.kInstances ], `${message} - ${action}` )
				.to.include( Dict.term.kInstanceNamespace );
		}
	});
});
