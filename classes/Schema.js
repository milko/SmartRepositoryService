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
	 * the enum-of and category-of predicates starting from 'theLeaf' to 'theRoot' in
	 * 'theBranch' branch returning the list of traversed elements.
	 *
	 * 'theLeaf' determines which element will represent the origin of the traversal,
	 * 'theRoot' determines where the traversal will end and 'theBranch' determines
	 * the graph branch to traverse.
	 *
	 * If you omit 'theRoot', it will be set to the value of 'theBranch'.
	 *
	 * The leaf, root and branch must be provided as term _key or _id.
	 *
	 * 'theVertexFld' references the field(s) that should be included in the vertex: if
	 * null, all fields will be included, if a string is provided, it will be
	 * interpreted as a descriptor_key and the vertex will be replaced by the value
	 * related to that field reference; if the document doesn't contain that field,
	 * the value will be null. If an array is provided, the document will only contain
	 * the values related to the provided list of fields.
	 *
	 * 'theEdgeFld' is the same as 'theVertexFld', except that it relates to the edge;
	 * this parameter will only be considered if 'doEdge' is true.
	 *
	 * The above two parameters must be provided as descriptor _key values.
	 *
	 * If 'doRoot' is false, the root will be omitted.
	 *
	 * If 'doChoices' is true, only the enumeration choices will be returned.
	 *
	 * If 'doLanguage' is true, label, definition, description, note and example will
	 * contain the string in the provided language.
	 *
	 * If 'doEdge' is true, the result elements will be an object with two fields:
	 * 'term' will contain the verted and 'edge' will contain the edge; if
	 * 'doLanguage' was set to true, also the corresponding fields in the edge will be
	 * processed.
	 *
	 * The method assumes the terms and schemas collections to exist.
	 * The method will raise an exception if the leaf cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theLeaf		{String}			Graph leaf element.
	 * @param theBranch		{String}			Graph branch.
	 * @param theRoot		{String}|{null}		Graph root element.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doRoot		{boolean}			Include root.
	 * @param doChoices		{boolean}			Restrict to choices.
	 * @param doLanguage	{boolean}			Restrict labels to current language.
	 * @param doEdge		{boolean}			Include edge.
	 * @returns {Array}							List of enumeration elements.
	 */
	static getEnumPath
	(
		theRequest,
		theLeaf,
		theBranch,
		theRoot = null,
		theVertexFld = null,
		theEdgeFld = null,
		doRoot = true,
		doChoices = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Init local storage.
		//
		let leaf = null;
		const terms_name = 'terms/';

		//
		// Get root and branch.
		//
		const branch = ( theBranch.startsWith( terms_name ) )
					 ? theBranch
					 : terms_name + theBranch;
		const root	 = ( theRoot === null )
					 ? branch
					 : ( ( theBranch.startsWith( terms_name ) )
					   ? theBranch
					   : terms_name + theBranch );

		//
		// Get leaf.
		//
		try
		{
			leaf = db._collection( 'terms' ).document( theLeaf );
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
					theLeaf,							// Error value.
					404									// HTTP error code.
				)
			);																	// !@! ==>
		}

		//
		// Get predicates.
		//
		const predicates = [
			Dict.term.kPredicateEnumOf,
			Dict.term.kPredicateCategoryOf
		].map( x => 'terms/' + x );

		//
		// Init result.
		//
		const result = { list : [] };

		//
		// Init configuration.
		//
		const config =  {
			datasource	: traversal.collectionDatasourceFactory( 'schemas' ),
			strategy	: "depthfirst",
			expander	: traversal.outboundExpander,
			order		: "preorder-expander",
			uniqueness	: {
				edges		: 'path',
				vertices	: 'path'
			},

			visitor		: this.enumPathVisitor,
			expandFilter: this.enumListExpandFilter,

			custom		: {
				dir			: 'out',
				root		: root,
				branch		: branch,
				predicates	: predicates,
				language	: theRequest.application.language,
				vField		: theVertexFld,
				eField		: theEdgeFld,
				doEdge		: Boolean( doEdge ),
				doLanguage	: Boolean( doLanguage ),
				doChoices	: Boolean( doChoices ),
				doRoot		: Boolean( doRoot )
			}
		};

		//
		// Traverse.
		//
		const traverser = new traversal.Traverser( config );
		traverser.traverse( result, leaf );

		return result.list;															// ==>

	}	// getEnumPath

	/**
	 * Get enumeration list
	 *
	 * This method will perform an inbound traversal of the schemas graph following
	 * the enum-of and category-of predicates starting from 'theRoot' in 'theBranch'
	 * branch returning the list of traversed elements.
	 *
	 * 'theRoot' determines which element will be the graph root and 'theBranch'
	 * determines which branch to follow; if the latter is omitted, it will be set to
	 * the value of the root.
	 *
	 * Both l'theRoot' and 'theBranch' must be provided as term _key or _id.
	 *
	 * 'theMinDepth' represents the minimum depth of the traversal, it must be
	 * provided as an integer, or can be null, to ignore it.
	 *
	 * 'theMaxDepth' represents the maximum depth of the traversal, it must be
	 * provided as an integer, or can be null, to ignore it.
	 *
	 * 'theVertexFld' references the field(s) that should be included in the vertex: if
	 * null, all fields will be included, if a string is provided, it will be
	 * interpreted as a descriptor_key and the vertex will be replaced by the value
	 * related to that field reference; if the document doesn't contain that field,
	 * the value will be null. If an array is provided, the document will only contain
	 * the values related to the provided list of fields.
	 *
	 * 'theEdgeFld' is the same as 'theVertexFld', except that it relates to the edge;
	 * this parameter will only be considered if 'doEdge' is true.
	 *
	 * The above two parameters must be provided as descriptor _key values.
	 *
	 * If 'doRoot' is false, the root will be omitted.
	 *
	 * If 'doChoices' is true, only the enumeration choices will be returned.
	 *
	 * If 'doLanguage' is true, label, definition, description, note and example will
	 * contain the string in the provided language.
	 *
	 * If 'doEdge' is true, the result elements will be an object with two fields:
	 * 'term' will contain the verted and 'edge' will contain the edge; if
	 * 'doLanguage' was set to true, also the corresponding fields in the edge will be
	 * processed.
	 *
	 * The method assumes the terms and schemas collections to exist.
	 * The method will raise an exception if the root cannot be found.
	 *
	 * @param theRequest	{Object}			The current service request.
	 * @param theRoot		{String}			Graph leaf element.
	 * @param theBranch		{String}|{null}		Graph branch.
	 * @param theMinDepth	{Number}|{null}		Minimum traversal depth.
	 * @param theMaxDepth	{Number}|{null}		Maximum traversal depth.
	 * @param theVertexFld	{String}|{null}		Vertex property name.
	 * @param theEdgeFld	{String}|{null}		Edge property name.
	 * @param doRoot		{boolean}			Include root.
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
		doRoot = true,
		doChoices = false,
		doLanguage = false,
		doEdge = false
	)
	{
		//
		// Init local storage.
		//
		let root = null;
		const terms_name = 'terms/';

		//
		// Get root and branch.
		//
		const branch = ( theBranch === null )
					 ? root
					 : ( ( theBranch.startsWith( terms_name ) )
						 ? theBranch
						 : terms_name + theBranch );

		//
		// Get leaf.
		//
		try
		{
			root = db._collection( 'terms' ).document( theRoot );
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
		// Get predicates.
		//
		const predicates = [
			Dict.term.kPredicateEnumOf,
			Dict.term.kPredicateCategoryOf
		].map( x => 'terms/' + x );

		//
		// Init result.
		//
		const result = { list : [] };
		result.edges = [];

		//
		// Init configuration.
		//
		const config =  {
			datasource	: traversal.collectionDatasourceFactory( 'schemas' ),
			strategy	: "depthfirst",
			expander	: traversal.inboundExpander,
			order		: "preorder-expander",
			uniqueness	: {
				edges		: 'path',
				vertices	: 'path'
			},

			visitor		: this.enumListVisitor,
			filter		: this.enumListFilter,
			expandFilter: this.enumListExpandFilter,
			sort		: this.enumListSort,

			custom		: {
				dir			: 'in',
				branch		: branch,
				predicates	: predicates,
				language	: theRequest.application.language,
				vField		: theVertexFld,
				eField		: theEdgeFld,
				doEdge		: Boolean( doEdge ),
				doLanguage	: Boolean( doLanguage ),
				doChoices	: Boolean( doChoices ),
				doRoot		: Boolean( doRoot )
			}
		};

		//
		// Set depth.
		//
		if( theMinDepth !== null )
			config.minDepth = theMinDepth;
		if( theMaxDepth !== null )
			config.maxDepth = theMaxDepth;

		//
		// Traverse.
		//
		const traverser = new traversal.Traverser( config );
		traverser.traverse( result, root );

		return result.list;															// ==>

	}	// getEnumList

	/**
	 * Enumeration path visitor function
	 *
	 * This method is used to filter vertices by the getEnumPath() method, it will
	 * perform the following functions:
	 *
	 * 	- Add the root vertex: if this option is set and if the vertex is the root,
	 * 	  the method will add the root to the result.
	 * 	- Restrict to choices: if this option is set, the method will not include
	 * 	  category entries.
	 * 	- Restrict to language: if this option is set, the method will restrict all
	 * 	  properties from Dictionary.restrictLanguage() to the selected language, if
	 * 	  matched.
	 * 	- Add predicate: if this option is set, the method will add the predicate to
	 * 	  the vertex.
	 *
	 * @param theConfig	{Object}	The configuration object.
	 * @param theResult	{Object}	The result object (expects 'list').
	 * @param theVertex	{Object}	The current vertex.
	 * @param thePath	{Object}	The current path: { edges: [], vertices: [] }.
	 * @param theEdge	{Object}	{ edge: <current edge>, vertex: <current vertex> }.
	 */
	static enumPathVisitor( theConfig, theResult, theVertex, thePath, theEdge )
	{
		//
		// Init local storage.
		//
		let edge = null;
		let vertex = null;

		//
		// Get root.
		// No edge means root.
		//
		if( theEdge.length === 0 )
		{
			//
			// Check root inclusion.
			//
			if( theConfig.custom.doRoot )
				vertex = theVertex;
		}

		//
		// Handle other elements.
		//
		else
		{
			//
			// Filter enumeration choices:
			// if not restricted to choices
			// or predicate is enum-of.
			//
			if( (! theConfig.custom.doChoices)
			 || (theEdge[ 0 ].edge.predicate === theConfig.custom.predicates[ 0 ]) )
			{
				edge = theEdge[ 0 ].edge;
				vertex = theVertex;
			}
		}

		//
		// Check vertex.
		//
		if( vertex !== null )
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
			// Handle edges.
			//
			if( theConfig.custom.doEdge )
			{
				//
				// Set node.
				//
				const node = { term : vertex };

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

				//
				// Push node.
				//
				theResult.list.push( node );

			}	// Add edge.

			//
			// Handle vertex.
			//
			else
				theResult.list.push( vertex );

		}	// We have a vertex.

	}	// enumPathVisitor

	/**
	 * Enumeration list visitor function
	 *
	 * This method is used to add the current node to the result set, the node will be
	 * the vertex, or the vertex and edge if the doEdge option was set in the traverser.
	 *
	 * No filtering is performed in this function, but nodes are processed here.
	 *
	 * @param theConfig	{Object}	The configuration object.
	 * @param theResult	{Object}	The result object (expects 'list').
	 * @param theVertex	{Object}	The current vertex.
	 * @param thePath	{Object}	The current path: { edges: [], vertices: [] }.
	 */
	static enumListVisitor( theConfig, theResult, theVertex, thePath )
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
		// Handle edges.
		//
		if( theConfig.custom.doEdge )
		{
			//
			// Set node.
			//
			const node = { term : vertex };

			//
			// Process edge.
			//
			if( thePath.edges.length > 0 )
			{
				//
				// Save edge.
				//
				edge = thePath.edges[ thePath.edges.length - 1 ];

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

			//
			// Push node.
			//
			theResult.list.push( node );

		}	// Add edge.

		//
		// Handle vertex.
		//
		else
			theResult.list.push( vertex );

	}	// enumListVisitor

	/**
	 * Enumeration list vertex filter
	 *
	 * This method will check whether the current vertex should be included
	 * in the traversal, it will return the following values that determine whether
	 * the vertex will be included and whether the edges will be traversed:
	 * 	- undefined:			Vertex INCLUDED and connected edges TRAVERSED.
	 * 	- 'exclude':			Vertex NOT included and connected edges TRAVERSED.
	 * 	- 'prune:				Vertex NOT included and connected edges NOT traversed.
	 * 	- ['prune:, 'exclude]:	Vertex NOT included and connected edges NOT returned.
	 *
	 * @param theConfig	{Object}	The configuration object.
	 * @param theVertex	{Object}	The current vertex.
	 * @param thePath	{Object}	The current path: { edges: [], vertices: [] }.
	 * @returns {*}					The filter command.
	 */
	static enumListFilter( theConfig, theVertex, thePath )
	{
		//
		// Handle root.
		//
		if( thePath.edges.length === 0 )
		{
			if( theConfig.custom.doRoot )
				return undefined;													// ==>

			return 'exclude';														// ==>
		}

		//
		// Handle choice.
		//
		if( theConfig.custom.doChoices )
		{
			if( thePath.edges[ thePath.edges.length - 1 ].predicate
			 !== theConfig.custom.predicates[ 0 ] )
				return 'exclude';													// ==>
		}

		return undefined;															// ==>

	}	// enumListFilter

	/**
	 * Enumeration list edge filter
	 *
	 * This method is used to determine whether to follow the current path if all of
	 * the following conditions are met:
	 *
	 * 	- branch:		If the branch does not match it will return false.
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
	static enumListExpandFilter( theConfig, theVertex, theEdge, thePath )
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

	}	// enumListExpandFilter

	/**
	 * Sort edges
	 *
	 * This method will sort edges according to the '_sort' field.
	 *
	 * @param theLeft	{Object}	The left edge.
	 * @param theRight	{Object}	The right edge.
	 * @returns {number}			0: equal; 1: left > right; -1.
	 */
	static enumListSort( theLeft, theRight )
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

	}	// enumListSort

}	// Schema.

module.exports = Schema;
