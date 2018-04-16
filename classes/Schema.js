'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;

//
// Application.
//
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );


/**
 * Data dictionary schema class
 *
 * This class implements schema helpers.
 *
 * The class expects all required collections to exist.
 */
class Schema
{
	/**
	 * Check if the term is an enumeration choice.
	 *
	 * This method will check whether the provided term belongs to at least one
	 * of the provided enumerations as a choice element.
	 *
	 * The method expects the following parameters:
	 * 	- theRequest:	Current request.
	 * 	- theTerm:		The term to check as _id or _key field.
	 * 	- theEnums:		The list of enumerations as _id or _key fields.
	 *
	 * If you omit the list of enumerations, the method will check whether the
	 * provided term is an instance of an enumeration choice.
	 *
	 * The method will return a boolean, true if successful or false if not; if
	 * yu provide an array in 'theTerm', the method will return an object
	 * indexed by the array element and with the result as value.
	 *
	 * The method will raise an exception if the provided term reference is not
	 * found.
	 *
	 * The class expects the data dictionary to be initialised, this must be
	 * checked beforehand by the caller.
	 *
	 * @param theRequest	{Object}			The current request.
	 * @param theTerm		{String}|{Array}	The enumeration _key.
	 * @param theEnums		{Array}				The list of enumeration _key elements.
	 * @returns {Boolean}|{Object}				True or false.
	 */
	static isEnumerationChoice( theRequest, theTerm, theEnums = [] )
	{
		//
		// Handle array.
		//
		if( Array.isArray( theTerm ) )
		{
			const result = {};
			for( const item of theTerm )
				result[ item ] = this.isEnumerationChoice( theRequest, item, theEnums );

			return result;															// ==>
		}

		//
		// Get term.
		//
		let term = null;
		try
		{
			term = db._collection( 'terms' ).document( theTerm );
		}
		catch( error )
		{
			//
			// Handle exceptions.
			//
			if( (! error.isArangoError)
			 || (error.errorNum !== ARANGO_NOT_FOUND) )
				throw( error );													// !@! ==>

			//
			// Handle not found.
			//
			throw(
				new MyError(
					'BadTermReference',					// Error name.
					K.error.TermNotFound,				// Message code.
					theRequest.application.language,	// Language.
					theTerm,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}

		//
		// Handle enumerations.
		//
		if( theEnums.length > 0 )
		{
			//
			// Get collection and predicate.
			//
			const term_name = 'terms/';

			//
			// Normalise enumeration references.
			//
			theEnums = theEnums.map( (item) => {
				if( item.startsWith( term_name ) )
					return item;
				return term_name + item;
			});

			//
			// Query schemas.
			//
			const predicate = term_name + Dict.term.kPredicateEnumOf;
			const result =
				db._query( aql`
					FOR item IN ${db._collection('schemas')}
						FILTER item._from == ${term._id}
						   AND item.predicate == ${predicate}
						   AND ${theEnums} ANY IN item.branches
						LIMIT 1
						RETURN item._key
					`);

			return( result.count() > 0 );											// ==>
		}

		//
		// Handle instance.
		//
		if( term.hasOwnProperty( Dict.descriptor.kInstances ) )
			return term[ Dict.descriptor.kInstances ]
				.includes( Dict.term.kInstanceSelection );							// ==>

		return false;																// ==>

	}	// isEnumerationChoice

}	// Schema.

module.exports = Schema;
