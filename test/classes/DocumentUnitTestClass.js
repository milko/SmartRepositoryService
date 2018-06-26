'use strict';

//
// Global.
// describe, it
//

//
// Application.
//
const Dict = require( '../../dictionary/Dict' );

//
// Test parameters.
//
const param = require( '../parameters/Document' );

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
			return (! ( this._document.hasOwnProperty(Dict.descriptor.kName)
				&& (this._document[ Dict.descriptor.kName ] === "CONSTRAINED") ));
		return result;
	}
	
	get defaultCollection()	{
		return param.collection_document;
	}
	
	get significantFields()	{
		return super.significantFields.concat([
			[
				Dict.descriptor.kNID,
				Dict.descriptor.kLID
			]
		]);
	}
	
	get requiredFields() {
		return super.requiredFields.concat([Dict.descriptor.kVariable]);
	}
	
	get uniqueFields() {
		return super.uniqueFields.concat([Dict.descriptor.kGID]);
	}
	
	get lockedFields() {
		return super.lockedFields.concat([Dict.descriptor.kSymbol]);
	}
	
	get restrictedFields() {
		return super.restrictedFields.concat([Dict.descriptor.kPassword]);
	}
	
	get reservedFields() {
		return super.reservedFields.concat([Dict.descriptor.kEmail]);
	}
	
}	// TestClassCustom

/**
 * Module exports
 *
 * base:	Base class.
 * custom:	Derived base class with optional features.
 */
module.exports = {
	base   : TestClass,
	custom : TestClassCustom
};
