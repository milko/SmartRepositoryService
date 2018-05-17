'use strict';

//
// Frameworks.
//
const _ = require('lodash');
const Joi = require('joi');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const traversal = require("@arangodb/graph/traversal");
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const Schema = require( './Schema' );
const MyError = require( '../utils/MyError' );
const Dictionary = require( '../utils/Dictionary' );
const Validation = require( '../utils/Validation' );


/**
 * Structure class
 *
 * This class implements structure helpers.
 *
 * The class expects all required collections to exist.
 */
class Structure
{
	/**
	 * Instantiate structure
	 *
	 * The constructor expects a single parameter that represents a structure reference,
	 * provided as its '_id' or '_key'.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theStructure	{String}	The structure reference.
	 */
	constructor( theRequest, theStructure )
	{
		// Nothing yet.
		
	}	// constructor
	
}	// Structure.

module.exports = Structure;
