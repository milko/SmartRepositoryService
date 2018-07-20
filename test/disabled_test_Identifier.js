'use strict';

const should = require('chai').should();
const expect = require('chai').expect;

const db = require('@arangodb').db;
const Dict = require( '../dictionary/Dict' );
const Identifier = require( '../classes/Document' );

const params = require( './parameters/Document' );

describe('Identifier class tests:', function ()
{
	const collection = 'test_Document';
	
	let doc;
	let func;

	it('Clear collections', function ()
	{
		func = function() {
			db._collection( collection ).truncate();
		};
		expect( func, "Clearing test document collection" )
			.not.to.throw();
	});
	
	it('Instantiate namespace', function ()
	{
		const data = {};
		data[ Dict.descriptor.kLID ] = 'NAMESPACE';
		
		func = function() {
			doc =
				new Identifier( params.request );
		}
		expect( func, "Instantiate empty document" )
			.not.to.throw();
	
	});
});
