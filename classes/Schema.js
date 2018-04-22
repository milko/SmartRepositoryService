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
const K = require( '../utils/Constants' );
const Dict = require( '../dictionary/Dict' );
const MyError = require( '../utils/MyError' );
const Dictionary = require( '../utils/Dictionary' );


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
	 * 					with two elements: 'vertex' will contain the vertex and 'edge'
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
	 * 					with two elements: 'vertex' will contain the vertex and 'edge'
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
	 * Get type hierarchy
	 *
	 * This method will return an array of terms documents corresponding to the type
	 * hierarchy provided in 'theType'.
	 *
	 * 'theType' must be provided as a term _id or _key.
	 *
	 * If the provided type cannot be resolved, the method will raise an exception.
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
		try
		{
			type =
				db._collection( 'terms' )
					.document( theType );
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

		//
		// Inir query parameters.
		//
		const identifier = type._id;
		const predicate = 'terms/' + Dict.term.kPredicateTypeOf;

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
					   AND ${identifier} IN path.edges[*].branches[**]
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
	 * Traverse enumeration
	 *
	 * This method will perform an inbound or outbound traversal of the schemas graph
	 * following the enum-of and category-of predicates starting from 'theRoot' in
	 * 'theBranch' branch returning either the flattened the list visited elements, or
	 * the list of root nodes with their children in the '_children' property.
	 *
	 * The method accepts the following parameters:
	 *
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
	 * 					with two elements: 'vertex' will contain the vertex and 'edge'
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
			config.custom.doRoot = ( config.minDepth > 0 ) ? false : true;
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
		if( theConfig.custom.doChoices								// Do choices
		 && (theConfig.custom.dir === 'in')							// and inbound
		 && (thePath.edges.length > 0)								// and not root
		 && (thePath.edges[ thePath.edges.length - 1 ].predicate	// and not enum-of.
				!== theConfig.custom.predicates[ 0 ]) )
			return 'exclude';														// ==>

		return undefined;															// ==>

	}	// enumFilter

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
		if( ! theEdge.branches.includes( theConfig.custom.branch ) )
			return false;															// ==>

		//
		// Check predicate.
		//
		if( ! theConfig.custom.predicates.includes( theEdge.predicate ) )
			return false;															// ==>

		return true;																// ==>

	}	// enumExpandFilter

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
		if( theConfig.custom.doChoices					// Select choices
		 && (theConfig.custom.dir === 'out')			// and outbound
		 && (theEdge.length > 0)						// and has edges
		 && (theEdge[ 0 ].edge.predicate				// and not enum-of.
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
					   ? { vertex : vertex }
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
					node.edge = edge;
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
		if( theLeft.hasOwnProperty( 'order' )
			&& theRight.hasOwnProperty( 'order' ) )
		{
			if( theLeft.order < theRight.order )
				return -1;															// ==>

			if( theLeft.order > theRight.order )
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
	}

}	// Schema.

module.exports = Schema;
