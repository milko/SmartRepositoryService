/*global describe, it */
'use strict';
// const expect = require('chai').expect;
const should = require('chai').should();

const Document = require( '../classes/Document' );

/*
describe('science', function () {
	it('works', function () {
		expect(true).not.to.equal(false);
	});
});
*/

describe( 'Document', function () {
	const doc = new Document({}, {name: "chai test"}, "test");
	it('type', function () {
		doc.should.be.an('object');
	});
	it('has', function () {
		doc.should.be.an('object');
	});
	it('err', function () {
		doc.should.be.a('string');
	});
	it('another', function () {
		doc.should.be.an('object');
	});
	it('another', function () {
		doc.should.be.an('object');
	});
	const persistent = doc.persistent;
	it('persistent', function () {
		persistent.should.equal(false);
	});
});
