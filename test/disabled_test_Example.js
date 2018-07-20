'use strict';

const should = require('chai').should();
const expect = require('chai').expect;


describe('test', function ()
{
	it('works', function ()
	{
		expect(true, "Test 1").not.to.equal(false);
		expect(true, "Test 2").not.to.equal(false);
	});
});
