'use strict';

//
// Frameworks.
//
const _ = require('lodash');							// WTF?
const Joi = require('joi');								// Validation framework.

//
// Application.
//
const K = require( '../utils/Constants' );				// Application constants.
const Dict = require( '../dictionary/Dict' );			// Dictionary.

//
// Build validation chain.
//
const schema = {};
schema[ Dict.descriptor.kUsername ] = Joi.string().required();
schema[ Dict.descriptor.kEmail ] = Joi.string().email().required();
schema[ Dict.descriptor.kName ] = Joi.string().required();
schema[ Dict.descriptor.kLanguage ] = Joi.string().required();
schema[ Dict.descriptor.kRank ] = Joi.string().required();
schema[ Dict.descriptor.kRole ] = Joi.string().required();
schema[ Dict.descriptor.kStatus ] = Joi.string();

module.exports = {
	schema: schema,

	forClient( obj ) {
		// Implement outgoing transformations here
		obj = _.omit( obj, [ '_id', '_key', '_rev', '_oldRev', Dict.descriptor.kAuthData ] );
		return obj;
	},

	fromClient( obj ) {
		// Implement incoming transformations here
		return obj;
	}
};
