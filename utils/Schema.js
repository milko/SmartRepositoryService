'use strict';

//
// Frameworks.
//
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
const K = require( './Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( './MyError' );
const Dictionary = require( './Dictionary' );


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
	static isEnumerationChoice( theRequest, theTerm, theEnums = null )
	{
		//
		// Handle array.
		//
		if( Array.isArray( theTerm ) )
		{
			const result = {};
			for( const item of theTerm )
				result[ item ] = Schema.isEnumerationChoice( theRequest, item, theEnums );

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
		if( Array.isArray( theEnums )
		 && (theEnums.length > 0) )
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

	/**
	 * Check if the term is an enumeration branch.
	 *
	 * This method will check whether the provided term is an enumeration branch.
	 *
	 * The method expects the following parameters:
	 * 	- theRequest:	Current request.
	 * 	- theTerm:		The term to check as _id or _key field.
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
	 * @returns {Boolean}|{Object}				True or false.
	 */
	static isEnumerationBranch( theRequest, theTerm )
	{
		//
		// Handle array.
		//
		if( Array.isArray( theTerm ) )
		{
			const result = {};
			for( const item of theTerm )
				result[ item ] = this.isEnumerationBranch( theRequest, item );

			return result;															// ==>
		}

		//
		// Get term.
		//
		try
		{
			const term = db._collection( 'terms' ).document( theTerm );
			if( term.hasOwnProperty( Dict.descriptor.kInstances ) )
				return (
					term[ Dict.descriptor.kInstances ]
						.includes( Dict.term.kInstanceEnumeration )
				);																	// ==>

			return false;															// ==>
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

	}	// isEnumerationBranch

	/**
	 * Get enumeration path
	 *
	 * This method will perform an outbound traversal of the schemas graph following
	 * the enum-of and category-of predicates starting from 'theRoot' in 'theBranch'
	 * branch returning the list of traversed elements. This kind of traversal in
	 * enumerations should follow a path from the graph leaf element to its root.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					the term _id or _key.
	 * 	- theBranch:	Determines which branch to follow, it must be provided as the
	 * 					term _id or _key.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doChoices:	If this parameter is true, only enumeration choices, nodes
	 * 					pointed by the 'enum-of' predicate, will be included in the
	 * 					results.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: 'vertex' will contain the vertex and 'edge'
	 * 					will contain the edge.
	 *
	 * The method will return an array of path nodes.
	 * The method assumes the terms and schemas collections to exist.
	 * The method will raise an exception if the leaf cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{String}			Traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doChoices		{boolean}			Restrict to choices.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}							List of enumeration elements.
	 */
	static getEnumPath
	(
		theRequest,
		theRoot,
		theBranch,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doChoices = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Init local storage.
		//
		const terms_name = 'terms/';

		//
		// Get root and branch.
		//
		const branch = ( theBranch.startsWith( terms_name ) )
					 ? theBranch
					 : terms_name + theBranch;

		//
		// Get leaf.
		//
		try
		{
			//
			// Get traversal origin document.
			//
			const root = db._collection( 'terms' ).document( theRoot );

			//
			// Perform traversal.
			//
			return this.traverseEnum(
				theRequest,		// Current request.
				root,			// Traversal origin.
				branch,			// Graph branch.
				'out',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				false,			// Return tree.
				doChoices,		// Restrict to choices.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);																		// ==>
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
					theRoot,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}

	}	// getEnumPath

	/**
	 * Get enumeration list
	 *
	 * This method will perform an inbound traversal of the schemas graph following
	 * the enum-of and category-of predicates starting from 'theRoot' in 'theBranch'
	 * branch returning the siblings of the provided root. This kind of traversal in
	 * enumerations should follow a path from the enumeration root to the graph leaves.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					the term _id or _key.
	 * 	- theBranch:	Determines which branch to follow, it must be provided as the
	 * 					term _id or _key.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doChoices:	If this parameter is true, only enumeration choices, nodes
	 * 					pointed by the 'enum-of' predicate, will be included in the
	 * 					results.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method will return a flattened array of the provided root's siblings.
	 * The method assumes the terms and schemas collections to exist.
	 * The method will raise an exception if the root cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{String}			Traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doChoices		{boolean}			Restrict to choices.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}							List of enumeration elements.
	 */
	static getEnumList
	(
		theRequest,
		theRoot,
		theBranch = null,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doChoices = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Init local storage.
		//
		const terms_name = 'terms/';

		//
		// Get root and branch.
		//
		const branch = ( theBranch.startsWith( terms_name ) )
					   ? theBranch
					   : terms_name + theBranch;

		//
		// Get leaf.
		//
		try
		{
			//
			// Get traversal origin document.
			//
			const root = db._collection( 'terms' ).document( theRoot );

			//
			// Perform traversal.
			//
			return this.traverseEnum(
				theRequest,		// Current request.
				root,			// Traversal origin.
				branch,			// Graph branch.
				'in',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				false,			// Return tree.
				doChoices,		// Restrict to choices.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);																		// ==>
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
					theRoot,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}

	}	// getEnumList

	/**
	 * Get enumeration tree
	 *
	 * This method will perform an inbound traversal of the schemas graph following
	 * the enum-of and category-of predicates starting from 'theRoot' in 'theBranch'
	 * branch returning the siblings of the provided root. This kind of traversal in
	 * enumerations should follow a path from the enumeration root to the graph leaves.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					the term _id or _key.
	 * 	- theBranch:	Determines which branch to follow, it must be provided as the
	 * 					term _id or _key.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method will return an array of top level nodes containing a property called
	 * '_children' that is an array containing the node's children.
	 * The method assumes the terms and schemas collections to exist.
	 * The method will raise an exception if the root cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{String}			Traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}							List of enumeration elements.
	 */
	static getEnumTree
	(
		theRequest,
		theRoot,
		theBranch = null,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Init local storage.
		//
		const terms_name = 'terms/';

		//
		// Get root and branch.
		//
		const branch = ( theBranch.startsWith( terms_name ) )
					   ? theBranch
					   : terms_name + theBranch;

		//
		// Get leaf.
		//
		try
		{
			//
			// Get traversal origin document.
			//
			const root = db._collection( 'terms' ).document( theRoot );

			//
			// Perform traversal.
			//
			return this.traverseEnum(
				theRequest,		// Current request.
				root,			// Traversal origin.
				branch,			// Graph branch.
				'in',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				true,			// Return tree.
				false,			// Restrict to choices.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);																		// ==>
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
					theRoot,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}

	}	// getEnumTree
	
	/**
	 * Get type hierarchy list
	 *
	 * This method will perform an inbound traversal of the schemas graph following
	 * the type-of predicate starting from 'theOrigin' node, which represents the type
	 * to probe, until the root data type.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theOrigin:	Determines the traversal origin node, it must be provided as
	 * 					the term _id or _key.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method will return a flattened array of the provided origin's ancestors.
	 * The method assumes the terms and schemas collections to exist.
	 * The method will raise an exception if the root cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theOrigin		{String}			Traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doChoices		{boolean}			Restrict to choices.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}							List of enumeration elements.
	 */
	static getTypePath
	(
		theRequest,
		theOrigin,
		theBranch,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Init local storage.
		//
		const terms_name = 'terms/';
		
		//
		// Get root and branch.
		//
		const branch = ( theBranch.startsWith( terms_name ) )
					   ? theBranch
					   : terms_name + theBranch;
		
		//
		// Get leaf.
		//
		try
		{
			//
			// Get traversal origin document.
			//
			const root = db._collection( 'terms' ).document( theOrigin );
			
			//
			// Perform traversal.
			//
			return this.traverseType(
				theRequest,		// Current request.
				root,			// Traversal origin.
				branch,			// Graph branch.
				'in',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				false,			// Return tree.
				false,			// Restrict to choices.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);																		// ==>
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
					theOrigin,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}
		
	}	// getTypePath
	
	/**
	 * Get type hierarchy
	 *
	 * This method will return an array containing the type hierarchy corresponding to
	 * the provided data type. The list will start with the provided type and end with
	 * the root data type below the enumeration root, which means that the hierarchy
	 * will follow types starting from the most specific to the most general.
	 *
	 * The provided type reference must be the '_id', or the '_key' of the term, if
	 * the reference cannot be resolved, the method will raise an exception; it can also
	 * be an object, in which case it must have the _id , _key and 'var' fields. This last
	 * option is relevant when this method is called while creating descriptor
	 * validation records, since in that case type records are created by hand.
	 *
	 * Note: if the method returns an empty array, this means that the provided term
	 * reference is correct, but that it is not a data type, including if you provide
	 * the enumeration root: in this case the caller is responsible for taking action.
	 *
	 * @param theRequest	{Object}	The current request.
	 * @param theType		{String}	The type reference.
	 * @return {Array}					Type hierarchy.
	 */
	static getTypeHierarchy( theRequest, theType )
	{
		//
		// Resolve type.
		//
		let type = null;
		
		//
		// Handle term reference.
		//
		if( (typeof theType === 'string')
			|| (theType instanceof String) )
		{
			try
			{
				type = db._collection( 'terms' ).document( theType );
			}
			catch( error )
			{
				//
				// Handle exceptions.
				//
				if( (! error.isArangoError)
					|| (error.errorNum !== ARANGO_NOT_FOUND) )
					throw( error );												// !@! ==>
				
				//
				// Handle not found.
				//
				throw(
					new MyError(
						'BadTermReference',					// Error name.
						K.error.TermNotFound,				// Message code.
						theRequest.application.language,	// Language.
						theType,							// Error value.
						404									// HTTP error code.
					)
				);																// !@! ==>
			}
		}
		
		//
		// Handle provided object.
		//
		else
		{
			//
			// Check required fields.
			//
			if( ! theType.hasOwnProperty( '_id' ) )
				throw(
					new MyError(
						'BadParam',							// Error name.
						K.error.MissingId,					// Message code.
						theRequest.application.language,	// Language.
						theType,							// Error value.
						500									// HTTP error code.
					)
				);																// !@! ==>
			
			if( ! theType.hasOwnProperty( '_key' ) )
				throw(
					new MyError(
						'BadParam',							// Error name.
						K.error.MissingKey,					// Message code.
						theRequest.application.language,	// Language.
						theType,							// Error value.
						500									// HTTP error code.
					)
				);																// !@! ==>
			
			if( ! theType.hasOwnProperty( 'var' ) )
				throw(
					new MyError(
						'BadParam',							// Error name.
						K.error.MissingVar,					// Message code.
						theRequest.application.language,	// Language.
						theType,							// Error value.
						500									// HTTP error code.
					)
				);																// !@! ==>
			
			//
			// Set type.
			//
			type = theType;
		}
		
		//
		// Inir query parameters.
		//
		const identifier = type._id;
		const predicate = `terms/${Dict.term.kPredicateTypeOf}`;
		
		//
		// Query schemas.
		//
		const result =
			db._query( aql`
				FOR vertex, edge, path
					IN 0..10
					INBOUND ${identifier}
					schemas
					OPTIONS {
						"uniqueEdges"	 : "path",
						"uniqueVertices" : "path"
					}
					FILTER path.edges[*].predicate ALL == ${predicate}
					   AND ${identifier} IN edge.branches[*]
				RETURN vertex
			`).toArray();
		
		//
		// Prepend target type and remove root.
		//
		result.unshift( type );
		result.pop();
		
		return result;																// ==>
		
	}	// getTypeHierarchy
	
	/**
	 * Get form list
	 *
	 * This method will perform an inbound traversal of the schemas graph following
	 * the field-of and form-of predicates starting from 'theRoot' in 'theBranch'
	 * branch returning the siblings of the provided root. This kind of traversal in
	 * forms should follow a path from the form root to the graph leaves.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					the form _id or _key.
	 * 	- theBranch:	Determines which branch to follow, it must be provided as the
	 * 					form _id or _key.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doFields:		If this parameter is true, only form fields, nodes
	 * 					pointed by the 'field-of' predicate, will be included in the
	 * 					results.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method will return a flattened array of the provided root's siblings.
	 * The method assumes the terms and schemas collections to exist.
	 * The method will raise an exception if the root cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{String}			Traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doFields		{boolean}			Restrict to fields.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}							List of enumeration elements.
	 */
	static getFormList
	(
		theRequest,
		theRoot,
		theBranch = null,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doFields = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Init local storage.
		//
		const terms_name = 'terms/';
		
		//
		// Get root and branch.
		//
		const branch = ( theBranch.startsWith( terms_name ) )
					   ? theBranch
					   : terms_name + theBranch;
		
		//
		// Get leaf.
		//
		try
		{
			//
			// Get traversal origin document.
			//
			const root = db._collection( 'terms' ).document( theRoot );
			
			//
			// Perform traversal.
			//
			return this.traverseForm(
				theRequest,		// Current request.
				root,			// Traversal origin.
				branch,			// Graph branch.
				'in',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				false,			// Return tree.
				doFields,		// Restrict to fields.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);																		// ==>
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
					'BadFormReference',					// Error name.
					K.error.FormNotFound,				// Message code.
					theRequest.application.language,	// Language.
					theRoot,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}
		
	}	// getFormList
	
	/**
	 * Get form tree
	 *
	 * This method will perform an inbound traversal of the schemas graph following
	 * the field-of and form-of predicates starting from 'theRoot' in 'theBranch'
	 * branch returning the siblings of the provided root. This kind of traversal in
	 * enumerations should follow a path from the enumeration root to the graph leaves.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					the form _id or _key.
	 * 	- theBranch:	Determines which branch to follow, it must be provided as the
	 * 					form _id or _key.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method will return an array of top level nodes containing a property called
	 * '_children' that is an array containing the node's children.
	 * The method assumes the terms and schemas collections to exist.
	 * The method will raise an exception if the root cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{String}			Traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}							List of enumeration elements.
	 */
	static getFormTree
	(
		theRequest,
		theRoot,
		theBranch = null,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Init local storage.
		//
		const terms_name = 'terms/';
		
		//
		// Get root and branch.
		//
		const branch = ( theBranch.startsWith( terms_name ) )
					   ? theBranch
					   : terms_name + theBranch;
		
		//
		// Get leaf.
		//
		try
		{
			//
			// Get traversal origin document.
			//
			const root = db._collection( 'terms' ).document( theRoot );
			
			//
			// Perform traversal.
			//
			return this.traverseForm(
				theRequest,		// Current request.
				root,			// Traversal origin.
				branch,			// Graph branch.
				'in',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				true,			// Return tree.
				false,			// Restrict to choices.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);																		// ==>
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
					'BadFormReference',					// Error name.
					K.error.FormNotFound,				// Message code.
					theRequest.application.language,	// Language.
					theRoot,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}
		
	}	// getFormTree
	
	/**
	 * Get managed users path
	 *
	 * This method will perform an outbound traversal of the hierarchy graph following
	 * the managed-by predicate starting from 'theRoot' returning the list of
	 * traversed elements. This kind of traversal should follow a path from the graph
	 * leaf element to its root.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					the resolved user document.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: 'vertex' will contain the vertex and 'edge'
	 * 					will contain the edge.
	 * 	- doStrip:		If this parameter is true, the result nodes will be stripped
	 * 					from private properties, all elements will lack the standard
	 * 					private properties (Dictionary.listUserPrivateProperties()),
	 * 					the managers will also lack the roles property and edges will
	 * 					lack _from and _to.
	 *
	 * The method will return an array of path nodes.
	 * The method assumes the users and hierarchy collections to exist.
	 * The method will raise an exception if the leaf cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{Object}			Traversal origin.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @param doStrip		{Boolean}			True strips private fields (default).
	 * @returns {Array}							List of enumeration elements.
	 */
	static getManagedUsersHierarchy
	(
		theRequest,
		theRoot,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doLanguage = false,
		doEdge = false,
		doStrip = true
	)
	{
		//
		// Perform traversal.
		//
		let hierarchy =
			this.traverseManagedUsers
			(
				theRequest,		// Current request.
				theRoot,		// Traversal origin.
				'out',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				false,			// Return tree.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);
		
		//
		// Collect default hidden properties.
		//
		const properties =
			Dictionary.listUserPrivateProperties
				.concat([ '_from', '_to' ]);
		
		//
		// Strip private properties.
		//
		if( doStrip								// Wanna strip,
		 && (hierarchy.length > 0)				// and have clothes,
		 && (theVertexFld === null) )			// and got them all.
		{
			//
			// Pop current user.
			//
			let current = null;
			if( hierarchy[ 0 ][ Dict.descriptor.kUsername ]
				=== theRoot[ Dict.descriptor.kUsername ] )
				current = hierarchy.shift();
			
			//
			// Normalise managers.
			//
			Dictionary.stripDocumentProperties(
				hierarchy,
				properties.concat( Dict.descriptor.kRole )
			);
			
			//
			// Normalise current user.
			//
			if( current !== null )
				Dictionary.stripDocumentProperties(
					current,
					properties
				);
			
			//
			// Reconstitute hierarchy.
			//
			if( current !== null )
				hierarchy.unshift( current );
		}
		
		return hierarchy;															// ==>
		
	}	// getManagedUsersHierarchy
	
	/**
	 * Get managed list
	 *
	 * This method will perform an inbound traversal of the schemas graph following
	 * the managed-by predicate starting from 'theRoot', returning the siblings of the
	 * provided root. This kind of traversal in users should follow a path from the
	 * root to the graph leaves.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					the resolved user document.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 * 	- doStrip:		If this parameter is true, the result nodes will be stripped
	 * 					from private properties, all elements will lack the standard
	 * 					private properties (Dictionary.listUserPrivateProperties()).
	 *
	 * The method will return a flattened array of the provided root's siblings.
	 * The method assumes the users and schemas collections to exist.
	 * The method will raise an exception if the root cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{Object}			Traversal origin.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @param doStrip		{Boolean}			True strips private fields (default).
	 * @returns {Array}							List of enumeration elements.
	 */
	static getManagedUsersList
	(
		theRequest,
		theRoot,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doLanguage = false,
		doEdge = false,
		doStrip = true
	)
	{
		//
		// Perform traversal.
		//
		let hierarchy =
			this.traverseManagedUsers(
				theRequest,		// Current request.
				theRoot,		// Traversal origin.
				'in',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				false,			// Return tree.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);
		
		//
		// Collect default hidden properties.
		//
		const properties =
			Dictionary.listUserPrivateProperties
				.concat([ '_from', '_to' ]);
		
		//
		// Strip private properties.
		//
		if( doStrip								// Wanna strip,
		 && (hierarchy.length > 0)				// and have clothes,
		 && (theVertexFld === null) )			// and got them all.
		{
			//
			// Pop current user.
			//
			let current = null;
			if( hierarchy[ 0 ][ Dict.descriptor.kUsername ]
				=== theRoot[ Dict.descriptor.kUsername ] )
				current = hierarchy.shift();
			
			//
			// Normalise managed.
			//
			Dictionary.stripDocumentProperties(
				hierarchy,
				properties
			);
			
			//
			// Normalise current user.
			//
			if( current !== null )
				Dictionary.stripDocumentProperties(
					current,
					properties
				);
			
			//
			// Reconstitute hierarchy.
			//
			if( current !== null )
				hierarchy.unshift( current );
		}
		
		return hierarchy;															// ==>
		
	}	// getManagedUsersList
	
	/**
	 * Get managed users tree
	 *
	 * This method will perform an inbound traversal of the schemas graph following
	 * the managed-by predicate starting from 'theRoot' returning the siblings of the
	 * provided root. This kind of traversal in should follow a path from the
	 * enumeration root to the graph leaves.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					the resolved user document.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 * 	- doStrip:		If this parameter is true, the result nodes will be stripped
	 * 					from private properties, all elements will lack the standard
	 * 					private properties (Dictionary.listUserPrivateProperties()),
	 * 					the managers will also lack the roles property.
	 *
	 * The method will return an array of top level nodes containing a property called
	 * '_children' that is an array containing the node's children.
	 * The method assumes the users and schemas collections to exist.
	 * The method will raise an exception if the root cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{Object}			Traversal origin.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @param doStrip		{Boolean}			True strips private fields (default).
	 * @returns {Array}							List of enumeration elements.
	 */
	static getManagedUsersTree
	(
		theRequest,
		theRoot,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doLanguage = false,
		doEdge = false,
		doStrip = true
	)
	{
		//
		// Perform traversal.
		//
		let hierarchy =
			this.traverseManagedUsers(
				theRequest,		// Current request.
				theRoot,		// Traversal origin.
				'in',			// Outbound direction.
				theMinDepth,	// Search start depth.
				theMaxDepth,	// Search final depth.
				theVertexFld,	// Vertex fields.
				theEdgeFld,		// Edge fields.
				true,			// Return tree.
				doLanguage,		// Restrict to language.
				doEdge			// Include edges.
			);
		
		//
		// Collect default hidden properties.
		//
		const properties =
			Dictionary.listUserPrivateProperties
				.concat([ '_from', '_to' ]);
		
		//
		// Strip private properties.
		//
		if( doStrip								// Wanna strip
		 && (theVertexFld === null)				// and got all clothes
		 && (hierarchy.length > 0) )			// and found managed.
		{
			//
			// Pop current user.
			//
			let current = null;
			if( hierarchy[ 0 ][ Dict.descriptor.kUsername ]
				=== theRoot[ Dict.descriptor.kUsername ] )
				current = hierarchy.shift();
			
			//
			// Normalise managed.
			//
			Dictionary.stripDocumentProperties(
				hierarchy,
				properties
			);
			
			//
			// Normalise current user.
			//
			if( current !== null )
				Dictionary.stripDocumentProperties(
					current,
					properties
				);
			
			//
			// Reconstitute hierarchy.
			//
			if( current !== null )
				hierarchy.unshift( current );
		}
		
		return hierarchy;															// ==>
		
	}	// getManagedUsersTree

	/**
	 * Traverse enumeration
	 *
	 * This method will perform an inbound or outbound traversal of the schemas graph
	 * following the enum-of and category-of predicates starting from 'theRoot' in
	 * 'theBranch' branch returning either the flattened the list visited elements, or
	 * the list of root nodes with their children in the '_children' property.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					an object.
	 * 	- theBranch:	Determines which branch to follow, it must be provided as a
	 * 					term _id.
	 * 	- theDirection:	Determines the traversal direction: 'in' means inbound and
	 * 					'out' means outbound; inbound traversals will visit the tree
	 * 					from the root to the leaves, outbound traversals will visit
	 * 					the tree from the leaf to its root.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doTree:		If this parameter is true, the result will be a tree that
	 * 					represents the traversed paths: the node children will be set
	 * 					in the '_children' field.
	 * 	- doChoices:	If this parameter is true, only enumeration choices, nodes
	 * 					pointed by the 'enum-of' predicate, will be included in the
	 * 					results.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method assumes the terms and schemas collections to exist.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{Object}			Graph traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theDirection	{String}			Traversal direction: 'in' or 'out'.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doTree		{boolean}			Return a tree.
	 * @param doChoices		{boolean}			Restrict to choices.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}|{Object}				List or tree of enumeration elements.
	 */
	static traverseEnum
	(
		theRequest,
		theRoot,
		theBranch,
		theDirection,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doTree = false,
		doChoices = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Normalise parameters for tree.
		//
		if( doTree )
		{
			//
			// Prevent choices selection.
			//
			doChoices = false;

			//
			// Normalise vertex field selectors.
			//
			if( (! doEdge)								// Without edges
			 && (theVertexFld !== null)					// with vertex fields selector
			 && (! Array.isArray( theVertexFld )) )		// which is not an array:
				theVertexFld = [ theVertexFld ];		// make it into an array.
		}

		//
		// Init configuration.
		//
		const config =  {
			datasource	: traversal.collectionDatasourceFactory( 'schemas' ),
			strategy	: "depthfirst",
			expander	: ( theDirection === 'in' )
						? traversal.inboundExpander
						: traversal.outboundExpander,
			order		: "preorder-expander",
			uniqueness	: {
				edges		: 'path',
				vertices	: 'path'
			},

			visitor		: this.enumVisitor,
			filter		: this.enumFilter,
			expandFilter: this.enumExpandFilter,

			custom		: {
				dir			: theDirection,
				branch		: theBranch,
				predicates	: this.getEnumPredicates(),
				language	: theRequest.application.language,
				vField		: theVertexFld,
				eField		: theEdgeFld,
				doTree		: Boolean( doTree ),
				doEdge		: Boolean( doEdge ),
				doChoices	: Boolean( doChoices ),
				doLanguage	: Boolean( doLanguage )
			}
		};

		//
		// Set sort callback.
		// Inbound traversals are expected to be single element paths.
		//
		if( theDirection === 'in' )
			config.sort = this.enumSort;

		//
		// Set depth.
		//
		if( theMinDepth === null )
		{
			config.minDepth = 0;
			config.custom.doRoot = true;
		}
		else
		{
			config.minDepth = theMinDepth;
			config.custom.doRoot = ( config.minDepth <= 0 );
		}

		if( theMaxDepth !== null )
			config.maxDepth = theMaxDepth;

		//
		// Add nodes dictionary.
		//
		if( doTree )
			config.custom.dict = {};

		//
		// Init result.
		//
		const result = [];

		//
		// Traverse.
		//
		const traverser = new traversal.Traverser( config );
		traverser.traverse( result, theRoot );

		return result;																// ==>

	}	// traverseEnum
	
	/**
	 * Traverse type
	 *
	 * This method will perform an inbound or outbound traversal of the schemas graph
	 * following the type-of predicate starting from 'theRoot' in 'theBranch' branch
	 * returning either the flattened the list visited elements, or the list of root
	 * nodes with their children in the '_children' property.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					an object.
	 * 	- theBranch:	Determines which branch to follow, it must be provided as a
	 * 					term _id.
	 * 	- theDirection:	Determines the traversal direction: 'in' means inbound and
	 * 					'out' means outbound; inbound traversals will visit the tree
	 * 					from the root to the leaves, outbound traversals will visit
	 * 					the tree from the leaf to its root.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doTree:		If this parameter is true, the result will be a tree that
	 * 					represents the traversed paths: the node children will be set
	 * 					in the '_children' field.
	 * 	- doChoices:	If this parameter is true, only enumeration choices, nodes
	 * 					pointed by the 'enum-of' predicate, will be included in the
	 * 					results.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method assumes the terms and schemas collections to exist.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{Object}			Graph traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theDirection	{String}			Traversal direction: 'in' or 'out'.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doTree		{boolean}			Return a tree.
	 * @param doChoices		{boolean}			Restrict to choices.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}|{Object}				List or tree of enumeration elements.
	 */
	static traverseType
	(
		theRequest,
		theRoot,
		theBranch,
		theDirection,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doTree = false,
		doChoices = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Normalise parameters for tree.
		//
		if( doTree )
		{
			//
			// Prevent choices selection.
			//
			doChoices = false;
			
			//
			// Normalise vertex field selectors.
			//
			if( (! doEdge)								// Without edges
			 && (theVertexFld !== null)					// with vertex fields selector
			 && (! Array.isArray( theVertexFld )) )		// which is not an array:
				theVertexFld = [ theVertexFld ];		// make it into an array.
		}
		
		//
		// Init configuration.
		//
		const config =  {
			datasource	: traversal.collectionDatasourceFactory( 'schemas' ),
			strategy	: "depthfirst",
			expander	: ( theDirection === 'in' )
						  ? traversal.inboundExpander
						  : traversal.outboundExpander,
			order		: "preorder-expander",
			uniqueness	: {
				edges		: 'path',
				vertices	: 'path'
			},
			
			visitor		: this.enumVisitor,
			// filter		: this.enumFilter,
			expandFilter: this.enumExpandFilter,
			
			custom		: {
				dir			: theDirection,
				branch		: theBranch,
				predicates	: 'terms/' + Dict.term.kPredicateTypeOf,
				language	: theRequest.application.language,
				vField		: theVertexFld,
				eField		: theEdgeFld,
				doTree		: Boolean( doTree ),
				doEdge		: Boolean( doEdge ),
				doChoices	: Boolean( doChoices ),
				doLanguage	: Boolean( doLanguage )
			}
		};
		
		//
		// Set sort callback.
		// Inbound traversals are expected to be single element paths.
		//
		if( theDirection === 'in' )
			config.sort = this.enumSort;
		
		//
		// Set depth.
		//
		if( theMinDepth === null )
		{
			config.minDepth = 0;
			config.custom.doRoot = true;
		}
		else
		{
			config.minDepth = theMinDepth;
			config.custom.doRoot = ( config.minDepth <= 0 );
		}
		
		if( theMaxDepth !== null )
			config.maxDepth = theMaxDepth;
		
		//
		// Add nodes dictionary.
		//
		if( doTree )
			config.custom.dict = {};
		
		//
		// Init result.
		//
		const result = [];
		
		//
		// Traverse.
		//
		const traverser = new traversal.Traverser( config );
		traverser.traverse( result, theRoot );
		
		return result;																// ==>
		
	}	// traverseType
	
	/**
	 * Traverse form
	 *
	 * This method will perform an inbound or outbound traversal of the schemas graph
	 * following the field-of and form-of predicates starting from 'theRoot' in
	 * 'theBranch' branch returning either the flattened the list visited elements, or
	 * the list of root nodes with their children in the '_children' property.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					an object.
	 * 	- theBranch:	Determines which branch to follow, it must be provided as a
	 * 					term _id.
	 * 	- theDirection:	Determines the traversal direction: 'in' means inbound and
	 * 					'out' means outbound; inbound traversals will visit the tree
	 * 					from the root to the leaves, outbound traversals will visit
	 * 					the tree from the leaf to its root.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doTree:		If this parameter is true, the result will be a tree that
	 * 					represents the traversed paths: the node children will be set
	 * 					in the '_children' field.
	 * 	- doFields:		If this parameter is true, only enumeration choices, nodes
	 * 					pointed by the 'field-of' predicate, will be included in the
	 * 					results.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method assumes the terms and schemas collections to exist.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{Object}			Graph traversal origin.
	 * @param theBranch		{String}			Graph branch.
	 * @param theDirection	{String}			Traversal direction: 'in' or 'out'.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doTree		{boolean}			Return a tree.
	 * @param doFields		{boolean}			Restrict to fields.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}|{Object}				List or tree of enumeration elements.
	 */
	static traverseForm
	(
		theRequest,
		theRoot,
		theBranch,
		theDirection,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doTree = false,
		doFields = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Normalise parameters for tree.
		//
		if( doTree )
		{
			//
			// Prevent choices selection.
			//
			doFields = false;
			
			//
			// Normalise vertex field selectors.
			//
			if( (! doEdge)								// Without edges
			 && (theVertexFld !== null)					// with vertex fields selector
			 && (! Array.isArray( theVertexFld )) )		// which is not an array:
				theVertexFld = [ theVertexFld ];		// make it into an array.
		}
		
		//
		// Init configuration.
		//
		const config =  {
			datasource	: traversal.collectionDatasourceFactory( 'schemas' ),
			strategy	: "depthfirst",
			expander	: ( theDirection === 'in' )
						  ? traversal.inboundExpander
						  : traversal.outboundExpander,
			order		: "preorder-expander",
			uniqueness	: {
				edges		: 'path',
				vertices	: 'path'
			},
			
			visitor		: this.enumVisitor,
			filter		: this.enumFilter,
			expandFilter: this.enumExpandFilter,
			
			custom		: {
				dir			: theDirection,
				branch		: theBranch,
				predicates	: this.getFormPredicates(),
				language	: theRequest.application.language,
				vField		: theVertexFld,
				eField		: theEdgeFld,
				doTree		: Boolean( doTree ),
				doEdge		: Boolean( doEdge ),
				doChoices	: Boolean( doFields ),
				doLanguage	: Boolean( doLanguage )
			}
		};
		
		//
		// Set sort callback.
		// Inbound traversals are expected to be single element paths.
		//
		if( theDirection === 'in' )
			config.sort = this.enumSort;
		
		//
		// Set depth.
		//
		if( theMinDepth === null )
		{
			config.minDepth = 0;
			config.custom.doRoot = true;
		}
		else
		{
			config.minDepth = theMinDepth;
			config.custom.doRoot = ( config.minDepth <= 0 );
		}
		
		if( theMaxDepth !== null )
			config.maxDepth = theMaxDepth;
		
		//
		// Add nodes dictionary.
		//
		if( doTree )
			config.custom.dict = {};
		
		//
		// Init result.
		//
		const result = [];
		
		//
		// Traverse.
		//
		const traverser = new traversal.Traverser( config );
		traverser.traverse( result, theRoot );
		
		return result;																// ==>
		
	}	// traverseForm
	
	/**
	 * Traverse managed users
	 *
	 * This method will perform an inbound or outbound traversal of the hierarchy graph
	 * following the managed-by predicate starting from 'theRoot' returning either the
	 * flattened the list visited elements, or the list of root nodes with their
	 * children in the '_children' property.
	 *
	 * The method accepts the following parameters:
	 *
	 * 	- theRequest:	Used to retrieve the session language and to raise eventual
	 * 					exceptions.
	 * 	- theRoot:		Determines the traversal origin node, it must be provided as
	 * 					an object.
	 * 	- theDirection:	Determines the traversal direction: 'in' means inbound and
	 * 					'out' means outbound; inbound traversals will visit the tree
	 * 					from the root to the leaves, outbound traversals will visit
	 * 					the tree from the leaf to its root.
	 * 	- theMinDepth:	Represents the minimum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theMaxDepth:	Represents the maximum depth of the traversal, it must be
	 * 					provided as an integer, or can be null, to ignore it.
	 * 	- theVertexFld:	References the field(s) that should be included in the vertex.
	 * 					If the provided value is null, the vertex value will be the
	 * 					original document. If provided as a string, it must be the
	 * 					_key of a descriptor and the resulting vertex value will
	 * 					become the value of the vertex field matched by the provided
	 * 					reference; if the reference does not match a field in the
	 * 					document, the value will be null. If provided as an array, the
	 * 					elements must be strings representing descriptor _key values:
	 * 					the resulting vertex value will be the original document
	 * 					containing only the fields that match the provided references.
	 * 	- theEdgeFld:	References the field(s) that should be included in the edge.
	 * 					This parameter behaves exactly as the previous one, except
	 * 					that it refers to edges; this parameter is only relevant if
	 * 					the 'doEdge' parameter is true.
	 * 	- doTree:		If this parameter is true, the result will be a tree that
	 * 					represents the traversed paths: the node children will be set
	 * 					in the '_children' field.
	 * 	- doLanguage:	If this parameter is true, the label, definition, description,
	 * 					note and example of both the vertex and the edge, if
	 * 					requested, will be set to the current session language. This
	 * 					means that these fields, instead of being objects indexed by
	 * 					the language code, will hold the value matched by the session
	 * 					language code. I the session language doesn't match any
	 * 					element, the field will remain untouched.
	 * 	- doEdge:		If this parameter is true, the result nodes will be an object
	 * 					with two elements: '_vertex' will contain the vertex and '_edge'
	 * 					will contain the edge.
	 *
	 * The method assumes the terms and hierarchy collections to exist.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{Object}			Graph traversal origin.
	 * @param theDirection	{String}			Traversal direction: 'in' or 'out'.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doTree		{boolean}			Return a tree.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}|{Object}				List or tree of enumeration elements.
	 */
	static traverseManagedUsers
	(
		theRequest,
		theRoot,
		theDirection,
		theMinDepth = null,
		theMaxDepth = null,
		theVertexFld = null,
		theEdgeFld = null,
		doTree = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Normalise parameters for tree.
		//
		if( doTree )
		{
			//
			// Normalise vertex field selectors.
			//
			if( (! doEdge)								// Without edges
			 && (theVertexFld !== null)					// with vertex fields selector
			 && (! Array.isArray( theVertexFld )) )		// which is not an array:
				theVertexFld = [ theVertexFld ];		// make it into an array.
		}
		
		//
		// Init configuration.
		//
		const config =  {
			datasource	: traversal.collectionDatasourceFactory( 'hierarchy' ),
			strategy	: "depthfirst",
			expander	: ( theDirection === 'in' )
						  ? traversal.inboundExpander
						  : traversal.outboundExpander,
			order		: "preorder-expander",
			uniqueness	: {
				edges		: 'path',
				vertices	: 'path'
			},
			
			visitor		: this.edgeVisitor,
			expandFilter: this.edgeExpandFilter,
			
			custom		: {
				dir			: theDirection,
				predicates	: this.getManagementPredicates(),
				language	: theRequest.application.language,
				vField		: theVertexFld,
				eField		: theEdgeFld,
				doTree		: Boolean( doTree ),
				doEdge		: Boolean( doEdge ),
				doLanguage	: Boolean( doLanguage )
			}
		};
		
		//
		// Set sort callback.
		// Inbound traversals are expected to be single element paths.
		//
		if( theDirection === 'in' )
			config.sort = this.enumSort;
		
		//
		// Set depth.
		//
		if( theMinDepth === null )
		{
			config.minDepth = 0;
			config.custom.doRoot = true;
		}
		else
		{
			config.minDepth = theMinDepth;
			config.custom.doRoot = ( config.minDepth <= 0 );
		}
		
		if( theMaxDepth !== null )
			config.maxDepth = theMaxDepth;
		
		//
		// Add nodes dictionary.
		//
		if( doTree )
			config.custom.dict = {};
		
		//
		// Init result.
		//
		const result = [];
		
		//
		// Traverse.
		//
		const traverser = new traversal.Traverser( config );
		traverser.traverse( result, theRoot );
		
		return result;																// ==>
		
	}	// traverseManagedUsers

	/**
	 * Enumeration vertex filter
	 *
	 * This method will check whether the current vertex should be included
	 * in the traversal, it will return the following values that determine whether
	 * the vertex will be included and whether the edges will be traversed:
	 *
	 * 	- undefined:			Vertex INCLUDED and connected edges TRAVERSED.
	 * 	- 'exclude':			Vertex NOT included and connected edges TRAVERSED.
	 * 	- 'prune:				Vertex INCLUDED and connected edges NOT traversed.
	 * 	- ['prune:, 'exclude]:	Vertex NOT included and connected edges NOT returned.
	 *
	 * The method will test the following configuration parameters:
	 *
	 * 	- custom.doChoices:	If the flag is true, the method will only include elements
	 * 						that represent enumeration choices, this will be performed
	 * 						only for inbound traversals, outbound traversals are
	 * 						handled in the visitor callback.
	 *
	 * The other filtering conditions will be tested in the expandFilter.
	 *
	 * Note that the path will always be traversed.
	 *
	 * @param theConfig	{Object}	The configuration object.
	 * @param theVertex	{Object}	The current vertex.
	 * @param thePath	{Object}	The current path: { edges: [], vertices: [] }.
	 * @returns {*}					The filter command.
	 */
	static enumFilter( theConfig, theVertex, thePath )
	{
		//
		// Handle inbound choices.
		//
		if( theConfig.custom.doChoices						// Do choices
		 && (theConfig.custom.dir === 'in')					// and inbound
		 && (thePath.edges.length > 0)						// and not root
		 && (thePath.edges[ thePath.edges.length - 1 ]		// and not enum-of.
						  [ Dict.descriptor.kPredicate ]
				!== theConfig.custom.predicates[ 0 ]) )
			return 'exclude';														// ==>

		return undefined;															// ==>

	}	// enumFilter
	
	/**
	 * Edge expansion filter
	 *
	 * This method is used to determine whether to follow the current path if all of
	 * the following conditions are met:
	 *
	 * 	- predicate:	The predicate must be among the enumerations.
	 *
	 * True means follow path.
	 *
	 * @param theConfig	{Object}	The configuration object.
	 * @param theVertex	{Object}	The current vertex.
	 * @param theEdge	{Object}	The current edge.
	 * @param thePath	{Object}	The current path: { edges: [], vertices: [] }.
	 * @returns {boolean}
	 */
	static edgeExpandFilter( theConfig, theVertex, theEdge, thePath )
	{
		return (
			theConfig.custom.predicates.includes(
				theEdge[ Dict.descriptor.kPredicate ] )
		);																			// ==>
	
	}	// edgeExpandFilter

	/**
	 * Enumeration edge expansion filter
	 *
	 * This method is used to determine whether to follow the current path if all of
	 * the following conditions are met:
	 *
	 * 	- branch:		The branch must be among the edge's branches.
	 * 	- predicate:	The predicate must be among the enumerations.
	 *
	 * True means follow path.
	 *
	 * @param theConfig	{Object}	The configuration object.
	 * @param theVertex	{Object}	The current vertex.
	 * @param theEdge	{Object}	The current edge.
	 * @param thePath	{Object}	The current path: { edges: [], vertices: [] }.
	 * @returns {boolean}
	 */
	static enumExpandFilter( theConfig, theVertex, theEdge, thePath )
	{
		//
		// Check branch.
		//
		if( ! theEdge[ Dict.descriptor.kBranches ].includes( theConfig.custom.branch ) )
			return false;															// ==>

		//
		// Check predicate.
		//
		if( ! theConfig.custom.predicates.includes(
			theEdge[ Dict.descriptor.kPredicate ] ) )
			return false;															// ==>

		return true;																// ==>

	}	// enumExpandFilter
	
	/**
	 * Edge visitor function
	 *
	 * This method is used to add vertices and edges to the result, the method is
	 * called both for lists and paths which are both using a preorder-expander
	 * traversal order.
	 *
	 * The method will perform the following actions:
	 *
	 * - custom.doLanguage:	If this option is set, the vertex, and the edge if the
	 * 						custom.doEdge option is set, will have their label,
	 * 						definition, description, note and example fields set to
	 * 						the session language.
	 * 	- custom.vField:	If this parameter is not null, the vertex will be reduced
	 * 						to the fields provided in this parameter.
	 * 	- custom.eField:	If this parameter is not null, the edge will be reduced
	 * 						to the fields provided in this parameter; this only if the
	 * 						custom.doEdge option is set.
	 * 	- custom.doEdge:	If this option is set, the result node will be an ovject
	 * 						with 'vertex' equal to the vertex and 'edge' equal to the
	 * 						eventual edge.
	 *
	 * Note that the traversal must have a preorder-expander traversal order, since
	 * the method uses the edge parameter.
	 *
	 * @param theConfig	{Object}	The configuration object.
	 * @param theResult	{Object}	The result object (expects 'list').
	 * @param theVertex	{Object}	The current vertex.
	 * @param thePath	{Object}	The current path: { edges: [], vertices: [] }.
	 * @param theEdge	{Object}	{ edge: <current edge>, vertex: <current vertex> }.
	 */
	static edgeVisitor( theConfig, theResult, theVertex, thePath, theEdge )
	{
		//
		// Init local storage.
		//
		let edge = null;
		let vertex = theVertex;
		
		//
		// Restrict language.
		//
		if( theConfig.custom.doLanguage )
			Dictionary.restrictLanguage( vertex, theConfig.custom.language );
		
		//
		// Restrict fields.
		//
		vertex = Dictionary.restrictFields( vertex, theConfig.custom.vField );
		
		//
		// Set node.
		//
		let node = ( theConfig.custom.doEdge )
				   ? { _vertex : vertex }
				   : vertex;
		
		//
		// Handle edges.
		//
		if( theConfig.custom.doEdge )
		{
			//
			// Determine list edge.
			//
			if( theConfig.custom.dir === 'in' )
			{
				if( thePath.edges.length > 0 )
					edge = thePath.edges[ thePath.edges.length - 1 ];
			}
			
			//
			// Determine path edge.
			//
			else if( theEdge.length > 0 )
				edge = theEdge[ 0 ].edge;
			
			//
			// Process edge.
			//
			if( edge !== null )
			{
				//
				// Restrict to language.
				//
				if( theConfig.custom.doLanguage )
					Dictionary.restrictEdgeLanguage(
						edge,
						theConfig.custom.language
					);
				
				//
				// Restrict fields.
				//
				edge = Dictionary.restrictFields( edge, theConfig.custom.eField );
				
				//
				// Add edge to node.
				//
				node._edge = edge;
			}
			
		}	// Add edge.
		
		//
		// Handle tree.
		//
		if( theConfig.custom.doTree )
		{
			//
			// Get parent.
			//
			let parent = null;
			if( thePath.vertices.length > 1 )
				parent = thePath.vertices[ thePath.vertices.length - 2 ]._id;
			
			//
			// Handle root.
			//
			if( (parent === null)
			 || (! theConfig.custom.dict.hasOwnProperty( parent )) )
				theResult.push( node );
			
			//
			// Handle child.
			//
			else
			{
				//
				// Add children container.
				//
				if( ! theConfig.custom.dict[ parent ].hasOwnProperty( '_children' ) )
					theConfig.custom.dict[ parent ]._children = [];
				
				//
				// Append current node to parent.
				//
				theConfig.custom.dict[ parent ]._children.push( node );
			}
			
			//
			// Add to dictionary.
			//
			theConfig.custom.dict[ theVertex._id ] = node;
		}
		
		//
		// Handle list.
		//
		else
			theResult.push( node );
		
	}	// edgeVisitor
	
	/**
	 * Enumeration visitor function
	 *
	 * This method is used to add vertices and edges to the result, the method is
	 * called both for enumeration lists and paths which are both using a
	 * preorder-expander traversal order.
	 *
	 * The method will perform the following actions:
	 *
	 * - custom.doLanguage:	If this option is set, the vertex, and the edge if the
	 * 						custom.doEdge option is set, will have their label,
	 * 						definition, description, note and example fields set to
	 * 						the session language.
	 * 	- custom.vField:	If this parameter is not null, the vertex will be reduced
	 * 						to the fields provided in this parameter.
	 * 	- custom.eField:	If this parameter is not null, the edge will be reduced
	 * 						to the fields provided in this parameter; this only if the
	 * 						custom.doEdge option is set.
	 * 	- custom.doEdge:	If this option is set, the result node will be an ovject
	 * 						with 'vertex' equal to the vertex and 'edge' equal to the
	 * 						eventual edge.
	 * 	- custom.doChoice:	If this option is set and it is an outbound traversal, the
	 * 						method will filter only those elements that correspond to
	 * 						a vhoice element; for inbound traversals, this will be
	 * 						performed in the filter.
	 *
	 * Note that the traversal must have a preorder-expander traversal order, since
	 * the method uses the edge parameter.
	 *
	 * @param theConfig	{Object}	The configuration object.
	 * @param theResult	{Object}	The result object (expects 'list').
	 * @param theVertex	{Object}	The current vertex.
	 * @param thePath	{Object}	The current path: { edges: [], vertices: [] }.
	 * @param theEdge	{Object}	{ edge: <current edge>, vertex: <current vertex> }.
	 */
	static enumVisitor( theConfig, theResult, theVertex, thePath, theEdge )
	{
		//
		// Init local storage.
		//
		let doit = true;
		let edge = null;
		let vertex = theVertex;

		//
		// Filter choice elements for outbound traversals.
		//
		if( theConfig.custom.doChoices						// Select choices
		 && (theConfig.custom.dir === 'out')				// and outbound
		 && (theEdge.length > 0)							// and has edges
		 && (theEdge[ 0 ].edge[ Dict.descriptor.kOrder ]	// and not enum-of.
				!== theConfig.custom.predicates[ 0 ]) )
			doit = false;

		//
		// Process node.
		//
		if( doit )
		{
			//
			// Restrict language.
			//
			if( theConfig.custom.doLanguage )
				Dictionary.restrictLanguage( vertex, theConfig.custom.language );

			//
			// Restrict fields.
			//
			vertex = Dictionary.restrictFields( vertex, theConfig.custom.vField );

			//
			// Set node.
			//
			let node = ( theConfig.custom.doEdge )
					   ? { _vertex : vertex }
					   : vertex;

			//
			// Handle edges.
			//
			if( theConfig.custom.doEdge )
			{
				//
				// Determine list edge.
				//
				if( theConfig.custom.dir === 'in' )
				{
					if( thePath.edges.length > 0 )
						edge = thePath.edges[ thePath.edges.length - 1 ];
				}

				//
				// Determine path edge.
				//
				else if( theEdge.length > 0 )
					edge = theEdge[ 0 ].edge;

				//
				// Process edge.
				//
				if( edge !== null )
				{
					//
					// Restrict to language.
					//
					if( theConfig.custom.doLanguage )
						Dictionary.restrictEdgeLanguage(
							edge,
							theConfig.custom.language
						);

					//
					// Restrict fields.
					//
					edge = Dictionary.restrictFields( edge, theConfig.custom.eField );

					//
					// Add edge to node.
					//
					node._edge = edge;
				}

			}	// Add edge.

			//
			// Handle tree.
			//
			if( theConfig.custom.doTree )
			{
				//
				// Get parent.
				//
				let parent = null;
				if( thePath.vertices.length > 1 )
					parent = thePath.vertices[ thePath.vertices.length - 2 ]._id;

				//
				// Handle root.
				//
				if( (parent === null)
				 || (! theConfig.custom.dict.hasOwnProperty( parent )) )
					theResult.push( node );

				//
				// Handle child.
				//
				else
				{
					//
					// Add children container.
					//
					if( ! theConfig.custom.dict[ parent ].hasOwnProperty( '_children' ) )
						theConfig.custom.dict[ parent ]._children = [];

					//
					// Append current node to parent.
					//
					theConfig.custom.dict[ parent ]._children.push( node );
				}

				//
				// Add to dictionary.
				//
				theConfig.custom.dict[ theVertex._id ] = node;
			}

			//
			// Handle list.
			//
			else
				theResult.push( node );

		}	// Outbound traversal choices check.

	}	// enumVisitor
	
	/**
	 * Sort edges
	 *
	 * This method will sort edges according to the 'order' field; if this field does
	 * not exist, the method assumes terms equal.
	 *
	 * @param theLeft	{Object}	The left edge.
	 * @param theRight	{Object}	The right edge.
	 * @returns {number}			0: equal; 1: left > right; -1.
	 */
	static enumSort( theLeft, theRight )
	{
		//
		// Sort by order.
		//
		if( theLeft.hasOwnProperty( Dict.descriptor.kOrder )
		 && theRight.hasOwnProperty( Dict.descriptor.kOrder ) )
		{
			if( theLeft[ Dict.descriptor.kOrder ] < theRight[ Dict.descriptor.kOrder ] )
				return -1;															// ==>

			if( theLeft[ Dict.descriptor.kOrder ] > theRight[ Dict.descriptor.kOrder ] )
				return 1;															// ==>

			return 0;																// ==>
		}

		//
		// Assume equal.
		//
		return 0;																	// ==>

	}	// enumSort
	
	/**
	 * Return enumeration predicate _id list
	 *
	 * This method will return the enumeration predicate _id field names, the first
	 * element will be the predicate used to indicate enumeration choice, the other
	 * elements will be the categorical predicates.
	 *
	 * @return {Array}	List of predicate _id strings.
	 */
	static getEnumPredicates()
	{
		return [
			'terms/' + Dict.term.kPredicateEnumOf,
			'terms/' + Dict.term.kPredicateCategoryOf
		];																			// ==>
	
	}	// getEnumPredicates
	
	/**
	 * Return form predicate _id list
	 *
	 * This method will return the form predicate _id field names, the first
	 * element will be the predicate used to indicate form fields, the other
	 * elements will be the embedded form predicates.
	 *
	 * @return {Array}	List of predicate _id strings.
	 */
	static getFormPredicates()
	{
		return [
			'terms/' + Dict.term.kPredicateFieldOf,
			'terms/' + Dict.term.kPredicateFormOf
		];																			// ==>
		
	}	// getFormPredicates
	
	/**
	 * Return management predicate _id list
	 *
	 * This method will return the management predicate _id field names.
	 *
	 * @return {Array}	List of predicate _id strings.
	 */
	static getManagementPredicates()
	{
		return [
			'terms/' + Dict.term.kPredicateManagedBy
		];																			// ==>
		
	}	// getManagementPredicates

}	// Schema.

module.exports = Schema;
