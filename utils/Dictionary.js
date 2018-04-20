'use strict';

//
// Frameworks.
//
const fs = require('fs');
const _ = require('lodash');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;

//
// Application.
//
const K = require( './Constants' );					// Application constants.
const MyError = require( './MyError' );				// Custom errors.
const Dict = require( '../dictionary/Dict' );		// Data dictionary.

/**
 * Data dictionary class
 *
 * This class implements data dictionary helpers.
 */
class Dictionary
{
	/**
	 * Restrict to field(s)
	 *
	 * This method will restrict the provided document to the provided field names, it
	 * expects the document to process and the fields to be selected.
	 *
	 * If you provide a scalar string, this will be interpreted as a descriptor _key, the
	 * method will return the provided document's value corresponding to that field,
	 * or null, if the field doesn't exist in the document.
	 *
	 * If you provide an array, the document will be stripped of all properties that
	 * do not correspond to the provided list of field references.
	 *
	 * If you provide null, the document will be returned unchanged.
	 *
	 * Note that the processing is done on the object, so clone it if you want changes
	 * to be local. Also, the fields may only reference top level properties, nested
	 * documents cannot be handled.
	 *
	 * @param theDocument	{Object}				The document to process.
	 * @param theFields		{String}|{Array}|{null}	The fields to select.
	 * @returns {*}			The processed document or the selected field's value.
	 */
	static restrictFields( theDocument, theFields )
	{
		//
		// Handle no changes.
		//
		if( theFields === null )
			return theDocument;														// ==>

		//
		// Handle single field.
		//
		if( ! Array.isArray( theFields ) )
			return ( theDocument.hasOwnProperty( theFields ) )
				 ? theDocument[ theFields ]
				 : null;															// ==>

		return _.pick( theDocument, theFields );									// ==>

	}	// restrictFields

	/**
	 * Restrict to language
	 *
	 * This method will reduce label, definition, description, notes and example of the
	 * provided document to the provided language: instead of an object indexed by
	 * language code, these properties will be the string corresponding to the
	 * provided language; if the language is not matched, the properties will not be
	 * touched.
	 *
	 * @param theDocument	{Object}	The document to process.
	 * @param theLanguage	{String}	The desired language.
	 */
	static restrictLanguage( theDocument, theLanguage )
	{
		//
		// Iterate properties.
		//
		for( const property of this.listLanguageFields() )
		{
			//
			// Handle property.
			//
			if( theDocument.hasOwnProperty( property )
			 && theDocument[ property ].hasOwnProperty( theLanguage ) )
				theDocument[ property ] = theDocument[ property ][ theLanguage ];
		}

	}	// restrictLanguage

	/**
	 * Restrict edge to language
	 *
	 * This method will reduce label, definition, description, notes and example of the
	 * provided edge to the provided language, this method applies the
	 * restrictLanguage() methpd to the edge top fields and to the eventual edge
	 * modifier fields.
	 *
	 * @param theDocument	{Object}	The edge to process.
	 * @param theLanguage	{String}	The desired language.
	 */
	static restrictEdgeLanguage( theDocument, theLanguage )
	{
		//
		// Process top level properties.
		//
		this.restrictLanguage( theDocument, theLanguage );

		//
		// Process modifier properties.
		//
		if( theDocument.hasOwnProperty( Dict.descriptor.kModifiers ) )
			this.restrictLanguage(
				theDocument[ Dict.descriptor.kModifiers ],
				theLanguage
			);

	}	// restrictEdgeLanguage

	/**
	 * List language description fields.
	 *
	 * This method will return the descriptor _key names of all description
	 * fields which have a language component.
	 *
	 * These will be the fields that will be processed when restricting
	 * contents to athe selected language.
	 *
	 * @returns {string[]}	List of language string field _keys.
	 */
	static listLanguageFields()
	{
		return [
			Dict.descriptor.kLabel,			// Label.
			Dict.descriptor.kDefinition,	// Definition.
			Dict.descriptor.kDescription,	// Description.
			Dict.descriptor.kNote,			// Notes.
			Dict.descriptor.kExample		// Examples.
		];																			// ==>

	}	// listLanguageFields
}

module.exports = Dictionary;
