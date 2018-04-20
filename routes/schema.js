'use strict';

/**
 * Schema services
 *
 * This path is used to handle schema services.
 */

//
// Frameworks.
//
const dd = require('dedent');							// For multiline text.
const Joi = require('joi');								// Validation framework.
const createRouter = require('@arangodb/foxx/router');	// Router class.

//
// Application.
//
const Schema = require( '../classes/Schema' );			// Schema class.
const Application = require( '../utils/Application' );	// Application.

//
// Handlers.
//
const Handlers = require( '../handlers/Schema' );		// Schema handlers.

//
// Instantiate router.
//
const router = createRouter();
module.exports = router;

//
// Set router tags.
//
router.tag( 'schema' );


/**
 * Check if term is an enumeration choice
 *
 * The service will check whether the provided term is an enumeration choice,
 * it expects two parameters in the post body:
 *
 * 	- term:	The term reference _id or _key, it can be a scalar or an array of references.
 *	- enum:	An array of _id or _key term references representing the list of
 *			enumerations to which the provided term should belong: if the term belongs
 *			to at least one of the provided enumerations, the check will be
 *			successful. The parameter may also be an empty array or null, in which
 *			case the service will only check if the provided term is a choice of any
 *			enumeration.
 *
 * The service will return an object with the 'result' field as a boolean, true means
 * the term is a choice.
 *
 * The service may raise an exceprion, the HTTP code depends on the exception
 * class: if MyError and it contains the HTTP code, this will be used, in all
 * other cases, the code will be 500.
 *
 * @path		/enum/isChoice
 * @verb		post
 * @request		{Object}	Term reference(s) and optional enumerations list.
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/isChoice',

	//
	// Handler.
	//
	Handlers.isEnumChoice,

	//
	// Name.
	//
	'enumIsChoice'
)
	.body(
		require( '../models/schema/SchemaIsEnumChoice' ),
<<<<<<< Updated upstream
		Application.
`
<p>The service expects two parameters from the request body:</p>
<ul>
	<li>
		<strong>term</strong>: The reference(s) to the term to test as its
		<code>_id</code> or <code>_key</code>: it can be provided as a <em>string</em>,
		or as an <em>array</em> of strings.
	</li>
	<li>
		<strong>enum</strong>: An array of term <code>_id</code> or <code>_key</code>
		values which represent the set of enumerations to which the term should belong.
		To ignore enumeration membership, provide either an <em>empty array</em> or
		<code>null</code>, which is the default choice.
	</li>
</ul>
`
=======
		Application.getServiceDescription(
			'schema', 'enumIsChoice', 'body', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.response(
		200,
		require( '../models/schema/SchemaIsEnumChoice' ),
<<<<<<< Updated upstream
`
<p>
	The service will return an object as such, <code>{ result : &lt;value&gt; }</code>,
	where <em>value</em> depends on the format in which you provided the term parameter:
</p>
<ul>
	<li>
		If <strong>term</strong> was provided as a <em>scalar</em>, <em>value</em>
		will be a <em>boolean</em>.
	</li>
	<li>
		If <strong>term</strong> was provided as an <em>array</em>, <em>value</em>
		will be an <em>object</em> indexed by the elements of the provided array with as
		value a <em>boolean</em>.
	</li>
</ul>
<p>
	A value of <code>true</code> means the term <em>is</em> an enumeration choice,
	either of any enumeration, or of at least one of the provided enumeration references.
</p>
`
=======
		Application.getServiceDescription(
			'schema', 'enumIsChoice', 'response', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.summary(
		"Check if term(s) are an enumeration selection."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumIsChoice', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Check if term is an enumeration branch
 *
 * The service will check whether the provided term is an enumeration choice,
 * it expects one parameter in the post body:
 * 	- term:		The term reference _key, it can be a scalar or an array of
 * 				references.
 *
 * The service will return an object with the 'result' field:
 * 	- If the term reference was provided as a scalar, the value will be a boolean.
 * 	- If an array of term references was provided, the value will be an object with
 * 	  key the provided teference element and as value the boolean result.
 *
 * @path		/enum/isBranch
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/isBranch',

	//
	// Handler.
	//
	Handlers.isEnumBranch,

	//
	// Name.
	//
	'enumIsBranch'
)
	.body(
		require( '../models/schema/SchemaIsEnumBranch' ),
<<<<<<< Updated upstream
		`
<p>The service expects one parameter from the request body:</p>
<ul>
	<li>
		<strong>term</strong>: The reference(s) to the term to test as its
		<code>_id</code> or <code>_key</code>: it can be provided as a <em>string</em>,
		or as an <em>array</em> of strings.
	</li>
</ul>
`
=======
		Application.getServiceDescription(
			'schema', 'enumIsBranch', 'body', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.response(
		200,
		require( '../models/schema/SchemaIsEnumBranch' ),
<<<<<<< Updated upstream
`
<p>
	The service will return an object as such, <code>{ result : &lt;value&gt; }</code>,
	where <em>value</em> depends on the format in which you provided the term parameter:
</p>
<ul>
	<li>
		If <strong>term</strong> was provided as a <em>scalar</em>, <em>value</em>
		will be a <em>boolean</em>.
	</li>
	<li>
		If <strong>term</strong> was provided as an <em>array</em>, <em>value</em>
		will be an <em>object</em> indexed by the elements of the provided array with as
		value a <em>boolean</em>.
	</li>
</ul>
<p>
	A value of <code>true</code> means the term <em>is</em> an enumeration,
	or the root of a controlled vocabulary.
</p>
`
=======
		Application.getServiceDescription(
			'schema', 'enumIsBranch', 'response', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.summary(
		"Check if a term(s) are an enumeration definition."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumIsBranch', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get enumeration path
 *
 * The service will return the enumeration path starting from the provided leaf node,
 * ending with the provided root node of the provided graph branch.
 *
 * The service expects the following parameters from the body:
 *
 * 	- root:			The root vertex of the graph, provided as a term _key or _id.
 * 	- branch:		The graph branch to traverse, provided as a term _key or _id.
 * 	- vField:		The vertex property field name(s) to be returned. The value
 * 					may be provided as a descriptor _key, in which case the vertex
 * 					will be the value referenced by that field, or null, if the
 * 					field does not exist. An array of field references may also be
 * 					provided, in which case, the vertex properties will be
 * 					restricted to the provided list. The value may also be null,
 * 					in which case the vertex will remain untouched.
 * 	- eField:		The edge property field name(s) to be returned, please refer to
 * 					the previous parameter explanations.
 * 	- doTree:		A boolean flag, if true, the the result will be a hierarchy of
 * 					nodes, if false, the result will be an array of nodes.
 * 	- doChoice:		A boolean flag, if true, only enumeration choice elements will be
 * 					included in the result, this means that categories will not be
 * 					included.
 * 	- doLanguage:	A boolean flag, if true, the label, definition, description,
 * 					notes and examples fields will be restricted to the current
 * 					session's user preferred language, this means that the
 * 					properties, instead of being objects indexed by the language
 * 					code, they will be the value corresponding to the session's
 * 					language; if the language cannot be matched, the field will
 * 					remain untouched.
 * 	- doEdge:		A boolean flag, if true, the result elements will include the
 * 					related edge.
 *
 * The service will return an array of elements which depend on the provided
 * parameters:
 *
 * 	- doEdge:		If true, each element will be an object with two fields,
 * 					'term' will contain the vertex and 'edge' will contain the
 * 					edge. If false, the element will be the vertex.
 * 	- vField:		If the parameter is a scalar, the vertex will be the vertex
 * 					value referenced by the parameter, if the parameter is an
 * 					array, the vertex will only contain the referenced fields from
 * 					the parameter.
 * 	- eField:		This parameter is only relevant if 'doEdge' is true and
 * 					behaves like the 'vField' parameter.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/enum/path
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/path',

	//
	// Handler.
	//
	Handlers.getEnumPath,

	//
	// Name.
	//
	'enumGetPath'
)
	.body(
		require( '../models/schema/schemaEnumList' ),
<<<<<<< Updated upstream
`
<p>The service expects the following parameters from the body:</p>
<ul>
	<li>
		<strong>origin</strong>: the <em>leaf vertex</em> of the tree, provided as a term
		<code>_key</code> or <code>_id</code>.
	</li>
	<li>
		<strong>branch</strong>: the <em>root node</em> of the tree, provided as a term
		<code>_key</code> or <code>_id</code>.
	</li>
	<li>
		<strong>minDepth</strong>: an <em>integer</em> indicating the
		<em>minimum depth</em> of the traversal, it determines at what level the traversal
		will <em>start</em>.<br />
		<em>Defaults to <code>0</code></em>.
	</li>
	<li>
		<strong>maxDepth</strong>: an <em>integer</em> indicating the <em>maximum depth</em>
		of the traversal, it determines at what level the traversal will <em>stop</em>;
		a level of <code>0</code> means no level limit.<br />
		<em>Defaults to <code>0</code></em>.
	</li>
	<li>
		<strong>vField</strong>: the vertex field name(s) to be returned in the result,
		provided as a term <code>_key</code> or <code>_id</code>.<br />
		The value may be provided as a <em>string</em>, as an <em>array</em>, or it can be
		<code>null</code>.<br />
		<em>Defaults to <code>null</code>.</em>
	</li>
	<li>
		<strong>eField</strong>: the <em>edge field name(s)</em> to be returned in the result,
		provided as a term <code>_key</code> or <code>_id</code>. This parameter behaves
		exactly as the previous <strong>vField</strong> parameter, except that it applies to
		returned <em>edges</em>; this parameter is only relevant if the <strong>doEdge</strong>
		parameter is set.<br />
		<em>Defaults to <code>null</code>.</em>
	</li>
	<li>
		<strong>doChoice</strong>: this is a <em>boolean</em> flag that indicates whether to
		filter <em>enumeration choice elements</em>: if <code>true</code>, only enumeration
		choice elements will be included in the result.<br />
		Please refer to the <code>/enum/isChoice</code> service for a description.<br />
		<em>Defaults to <code>false</code>.</em>
	</li>
	<li>
		<strong>doLanguage</strong>: this is a <em>boolean</em> flag that indicates whether
		to restrict description fields to the <em>current session language</em>, it applies to
		the <code>label</code>, <code>definition</code>, <code>description</code>,
		<code>note</code> and <code>example</code> fields.<br />
		If <code>true</code>, the above-mentioned fields will contain the value matching
		the session language code; if the field does not have an entry corresponding to the
		session language, it will remain untouched.<br />
		<em>Defaults to <code>false</code>.</em>
	</li>
	<li>
		<strong>doEdge</strong>: this is a <em>boolean</em> flag that indicates whether to
		<em>include the edge in the result</em>. If <code>true</code>, the elements of the
		result array will contain the <em>vertex</em> and the <em>edge</em>.<br />
		<em>Defaults to <code>false</code>.</em>
	</li>
</ul>
`
=======
		Application.getServiceDescription(
			'schema', 'enumGetPath', 'body', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.response(
		200,
		require( '../models/schema/schemaEnumList' ),
<<<<<<< Updated upstream
`
<p>
	The service will return an <em>array</em> of elements whose structure depends on the
	provided parameters:
</p>
<ul>
	<li>
		<strong>doEdge</strong>:
		<ul>
			<li>
				if this parameter is <code>false</code>:
				<ul>
					<li>
						The element will contain the <em>path vertices</em> formatted according
						to the <strong>vField</strong> parameter:
						<ul>
							<li>
								If <code>null</code> or omitted the <em>vertex</em> will be the
								<em>original document</em>.
							</li>
							<li>
								If a <em>string</em>, the element will contain the <em>value</em>
								of the <em>vertex document field</em> whose
								<em>name matches the string</em>; if no field matches, the value
								will be <code>null</code>.
							</li>
							<li>
								If an <em>array</em>, the element will contain the
								<em>vertex document</em> comprised of only those <em>fields</em>
								that <em>march the provided array elements</em>.
							</li>
						</ul>
					</li>
				</ul>
			</li>
			<li>
				if the parameter is <code>true</code>:
				<ul>
					<li>
						The element will contain an <em>object</em> with the following properties:
						<ul>
							<li>
								<strong>term</strong>: will contain the <em>vertex</em> formatted
								according to the <strong>vField</strong> parameter
								<em>(see above)</em>.
							</li>
							<li>
								<strong>edge</strong>: will contain the <em>edge</em> formatted
								according to the <strong>eField</strong> parameter
								<em>(refer to vField)</em>; if there is no edge, this will occur
								for the tree root, this property will not be included.
							</li>
						</ul>
					</li>
				</ul>
			</li>
		</ul>
	</li>
</ul>
`
=======
		Application.getServiceDescription(
			'schema', 'enumGetPath', 'response', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.summary(
		"Return the enumeration hierarchy from the provided origin to its root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumGetPath', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get enumeration list
 *
 * The service will return the flattened array of siblings of the provided root node,
 * the service will traverse the tree identified by the provided branch from the root
 * to the leaf nodes.
 *
 * The service expects the following parameters from the body:
 *
 * 	- root:			The root vertex of the graph, provided as a term _key or _id.
 * 	- branch:		The graph branch to traverse, provided as a term _key or _id.
 * 	- vField:		The vertex property field name(s) to be returned. The value
 * 					may be provided as a descriptor _key, in which case the vertex
 * 					will be the value referenced by that field, or null, if the
 * 					field does not exist. An array of field references may also be
 * 					provided, in which case, the vertex properties will be
 * 					restricted to the provided list. The value may also be null,
 * 					in which case the vertex will remain untouched.
 * 	- eField:		The edge property field name(s) to be returned, please refer to
 * 					the previous parameter explanations.
 * 	- doChoice:		A boolean flag, if true, only enumeration choice elements will be
 * 					included in the result, this means that categories will not be
 * 					included.
 * 	- doLanguage:	A boolean flag, if true, the label, definition, description,
 * 					notes and examples fields will be restricted to the current
 * 					session's user preferred language, this means that the
 * 					properties, instead of being objects indexed by the language
 * 					code, they will be the value corresponding to the session's
 * 					language; if the language cannot be matched, the field will
 * 					remain untouched.
 * 	- doEdge:		A boolean flag, if true, the result elements will include the
 * 					related edge.
 *
 * The service will return an array of elements which depend on the provided
 * parameters:
 *
 * 	- doEdge:		If true, each element will be an object with two fields,
 * 					'vertex' will contain the vertex and 'edge' will contain the
 * 					edge. If false, the element will be the vertex.
 * 	- vField:		If the parameter is a scalar, the vertex will be the vertex
 * 					value referenced by the parameter, if the parameter is an
 * 					array, the vertex will only contain the referenced fields from
 * 					the parameter.
 * 	- eField:		This parameter is only relevant if 'doEdge' is true and
 * 					behaves like the 'vField' parameter.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/enum/list
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/list',

	//
	// Handler.
	//
	Handlers.getEnumList,

	//
	// Name.
	//
	'enumGetList'
)
	.body(
		require( '../models/schema/schemaEnumList' ),
<<<<<<< Updated upstream
		`
<p>The service expects the following parameters from the body:</p>
<ul>
	<li>
		<strong>origin</strong>: the <em>vertex</em> of the tree whose siblings are to be
		returned, provided as a term <code>_key</code> or <code>_id</code>.
	</li>
	<li>
		<strong>branch</strong>: the <em>root node</em> of the tree, provided as a term
		<code>_key</code> or <code>_id</code>.
	</li>
	<li>
		<strong>minDepth</strong>: an <em>integer</em> indicating the
		<em>minimum depth</em> of the traversal, it determines at what level the traversal
		will <em>start</em>.<br />
		<em>Defaults to <code>0</code></em>.
	</li>
	<li>
		<strong>maxDepth</strong>: an <em>integer</em> indicating the <em>maximum depth</em>
		of the traversal, it determines at what level the traversal will <em>stop</em>;
		a level of <code>0</code> means no level limit.<br />
		<em>Defaults to <code>0</code></em>.
	</li>
	<li>
		<strong>vField</strong>: the vertex field name(s) to be returned in the result,
		provided as a term <code>_key</code> or <code>_id</code>.<br />
		The value may be provided as a <em>string</em>, as an <em>array</em>, or it can be
		<code>null</code>.<br />
		<em>Defaults to <code>null</code>.</em>
	</li>
	<li>
		<strong>eField</strong>: the <em>edge field name(s)</em> to be returned in the result,
		provided as a term <code>_key</code> or <code>_id</code>. This parameter behaves
		exactly as the previous <strong>vField</strong> parameter, except that it applies to
		returned <em>edges</em>; this parameter is only relevant if the <strong>doEdge</strong>
		parameter is set.<br />
		<em>Defaults to <code>null</code>.</em>
	</li>
	<li>
		<strong>doChoice</strong>: this is a <em>boolean</em> flag that indicates whether to
		filter <em>enumeration choice elements</em>: if <code>true</code>, only enumeration
		choice elements will be included in the result.<br />
		Please refer to the <code>/enum/isChoice</code> service for a description.<br />
		<em>Defaults to <code>false</code>.</em>
	</li>
	<li>
		<strong>doLanguage</strong>: this is a <em>boolean</em> flag that indicates whether
		to restrict description fields to the <em>current session language</em>, it applies to
		the <code>label</code>, <code>definition</code>, <code>description</code>,
		<code>note</code> and <code>example</code> fields.<br />
		If <code>true</code>, the above-mentioned fields will contain the value matching
		the session language code; if the field does not have an entry corresponding to the
		session language, it will remain untouched.<br />
		<em>Defaults to <code>false</code>.</em>
	</li>
	<li>
		<strong>doEdge</strong>: this is a <em>boolean</em> flag that indicates whether to
		<em>include the edge in the result</em>. If <code>true</code>, the elements of the
		result array will contain the <em>vertex</em> and the <em>edge</em>.<br />
		<em>Defaults to <code>false</code>.</em>
	</li>
</ul>
`
=======
		Application.getServiceDescription(
			'schema', 'enumGetList', 'body', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.response(
		200,
		require( '../models/schema/schemaEnumList' ),
<<<<<<< Updated upstream
		`
<p>
	The service will return the flattened <em>array</em> of siblings of the provided 
	root node in the provided branch of the graph; the nodes structure depends on the 
	following parameters:
</p>
<ul>
	<li>
		<strong>doEdge</strong>:
		<ul>
			<li>
				if this parameter is <code>false</code>:
				<ul>
					<li>
						The element will contain the <em>path vertices</em> formatted according
						to the <strong>vField</strong> parameter:
						<ul>
							<li>
								If <code>null</code> or omitted the <em>vertex</em> will be the
								<em>original document</em>.
							</li>
							<li>
								If a <em>string</em>, the element will contain the <em>value</em>
								of the <em>vertex document field</em> whose
								<em>name matches the string</em>; if no field matches, the value
								will be <code>null</code>.
							</li>
							<li>
								If an <em>array</em>, the element will contain the
								<em>vertex document</em> comprised of only those <em>fields</em>
								that <em>march the provided array elements</em>.
							</li>
						</ul>
					</li>
				</ul>
			</li>
			<li>
				if the parameter is <code>true</code>:
				<ul>
					<li>
						The element will contain an <em>object</em> with the following properties:
						<ul>
							<li>
								<strong>term</strong>: will contain the <em>vertex</em> formatted
								according to the <strong>vField</strong> parameter
								<em>(see above)</em>.
							</li>
							<li>
								<strong>edge</strong>: will contain the <em>edge</em> formatted
								according to the <strong>eField</strong> parameter
								<em>(refer to vField)</em>; if there is no edge, this will occur
								for the tree root, this property will not be included.
							</li>
						</ul>
					</li>
				</ul>
			</li>
		</ul>
	</li>
</ul>
`
=======
		Application.getServiceDescription(
			'schema', 'enumGetList', 'response', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.summary(
		"Return all the enumeration siblings of the provided root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumGetList', 'description', module.context.configuration.defaultLanguage )
	);


/**
 * Get enumeration tree
 *
 * The service will return the hierarchy of siblings of the provided root node,
 * the service will traverse the tree identified by the provided branch from the root
 * to the leaf nodes.
 *
 * The service expects the following parameters from the body:
 *
 * 	- root:			The root vertex of the graph, provided as a term _key or _id.
 * 	- branch:		The graph branch to traverse, provided as a term _key or _id.
 * 	- vField:		The vertex property field name(s) to be returned. The value
 * 					may be provided as a descriptor _key, in which case the vertex
 * 					will be the value referenced by that field, or null, if the
 * 					field does not exist. An array of field references may also be
 * 					provided, in which case, the vertex properties will be
 * 					restricted to the provided list. The value may also be null,
 * 					in which case the vertex will remain untouched.
 * 	- eField:		The edge property field name(s) to be returned, please refer to
 * 					the previous parameter explanations.
 * 	- doLanguage:	A boolean flag, if true, the label, definition, description,
 * 					notes and examples fields will be restricted to the current
 * 					session's user preferred language, this means that the
 * 					properties, instead of being objects indexed by the language
 * 					code, they will be the value corresponding to the session's
 * 					language; if the language cannot be matched, the field will
 * 					remain untouched.
 * 	- doEdge:		A boolean flag, if true, the result elements will include the
 * 					related edge.
 *
 * The service will return an array of elements which depend on the provided
 * parameters:
 *
 * 	- doEdge:		If true, each element will be an object with two fields,
 * 					'vertex' will contain the vertex and 'edge' will contain the
 * 					edge. If false, the element will be the vertex.
 * 	- vField:		If the parameter is a scalar, the vertex will be the vertex
 * 					value referenced by the parameter, if the parameter is an
 * 					array, the vertex will only contain the referenced fields from
 * 					the parameter.
 * 	- eField:		This parameter is only relevant if 'doEdge' is true and
 * 					behaves like the 'vField' parameter.
 *
 * If the method raises an exception, the service will forward it using the
 * HTTP code if the exception is of class MyError.
 *
 * @path		/enum/tree
 * @verb		post
 * @request		{Object}	Term reference(s).
 * @response	{Object}	The result.
 */
router.post(

	//
	// Path.
	//
	'/enum/tree',

	//
	// Handler.
	//
	Handlers.getEnumTree,

	//
	// Name.
	//
	'enumGetTree'
)
	.body(
		require( '../models/schema/schemaEnumTree' ),
<<<<<<< Updated upstream
		`
<p>The service expects the following parameters from the body:</p>
<ul>
	<li>
		<strong>origin</strong>: the <em>vertex</em> of the tree whose siblings are to be
		returned, provided as a term <code>_key</code> or <code>_id</code>.
	</li>
	<li>
		<strong>branch</strong>: the <em>root node</em> of the tree, provided as a term
		<code>_key</code> or <code>_id</code>.
	</li>
	<li>
		<strong>minDepth</strong>: an <em>integer</em> indicating the
		<em>minimum depth</em> of the traversal, it determines at what level the traversal
		will <em>start</em>.<br />
		<em>Defaults to <code>0</code></em>.
	</li>
	<li>
		<strong>maxDepth</strong>: an <em>integer</em> indicating the <em>maximum depth</em>
		of the traversal, it determines at what level the traversal will <em>stop</em>;
		a level of <code>0</code> means no level limit.<br />
		<em>Defaults to <code>0</code></em>.
	</li>
	<li>
		<strong>vField</strong>: the vertex field name(s) to be returned in the result,
		provided as a term <code>_key</code> or <code>_id</code>.<br />
		The value may be provided as a <em>string</em>, as an <em>array</em>, or it can be
		<code>null</code>.<br />
		<em>Defaults to <code>null</code>.</em>
	</li>
	<li>
		<strong>eField</strong>: the <em>edge field name(s)</em> to be returned in the result,
		provided as a term <code>_key</code> or <code>_id</code>. This parameter behaves
		exactly as the previous <strong>vField</strong> parameter, except that it applies to
		returned <em>edges</em>; this parameter is only relevant if the <strong>doEdge</strong>
		parameter is set.<br />
		<em>Defaults to <code>null</code>.</em>
	</li>
	<li>
		<strong>doLanguage</strong>: this is a <em>boolean</em> flag that indicates whether
		to restrict description fields to the <em>current session language</em>, it applies to
		the <code>label</code>, <code>definition</code>, <code>description</code>,
		<code>note</code> and <code>example</code> fields.<br />
		If <code>true</code>, the above-mentioned fields will contain the value matching
		the session language code; if the field does not have an entry corresponding to the
		session language, it will remain untouched.<br />
		<em>Defaults to <code>false</code>.</em>
	</li>
	<li>
		<strong>doEdge</strong>: this is a <em>boolean</em> flag that indicates whether to
		<em>include the edge in the result</em>. If <code>true</code>, the elements of the
		result array will contain the <em>vertex</em> and the <em>edge</em>.<br />
		<em>Defaults to <code>false</code>.</em>
	</li>
</ul>
`
=======
		Application.getServiceDescription(
			'schema', 'enumGetTree', 'body', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.response(
		200,
		require( '../models/schema/schemaEnumTree' ),
<<<<<<< Updated upstream
		`
<p>
	The service will return the hierarchy of the provided root <em>siblings</em>, the 
	top nodes will have a property, <code>_children</code>, which is an array that will
	contain the list of the node's children. If the minimum depth level is <code>0</code>,
	the result will be an array with a single node: the root. If the level is greater than
	<code>0</code>, the result will be an array of nodes from which the traversal started.
	The format of the nodes depends on the following parameters:
</p>
<ul>
	<li>
		<strong>doEdge</strong>:
		<ul>
			<li>
				if this parameter is <code>false</code>:
				<ul>
					<li>
						The element will contain the <em>path vertices</em> formatted according
						to the <strong>vField</strong> parameter:
						<ul>
							<li>
								If <code>null</code> or omitted the <em>vertex</em> will be the
								<em>original document</em>.
							</li>
							<li>
								If a <em>string</em>, the element will contain the <em>value</em>
								of the <em>vertex document field</em> whose
								<em>name matches the string</em>; if no field matches, the value
								will be <code>null</code>.
							</li>
							<li>
								If an <em>array</em>, the element will contain the
								<em>vertex document</em> comprised of only those <em>fields</em>
								that <em>march the provided array elements</em>.
							</li>
						</ul>
					</li>
				</ul>
			</li>
			<li>
				if the parameter is <code>true</code>:
				<ul>
					<li>
						The element will contain an <em>object</em> with the following properties:
						<ul>
							<li>
								<strong>term</strong>: will contain the <em>vertex</em> formatted
								according to the <strong>vField</strong> parameter
								<em>(see above)</em>.
							</li>
							<li>
								<strong>edge</strong>: will contain the <em>edge</em> formatted
								according to the <strong>eField</strong> parameter
								<em>(refer to vField)</em>; if there is no edge, this will occur
								for the tree root, this property will not be included.
							</li>
						</ul>
					</li>
				</ul>
			</li>
		</ul>
	</li>
</ul>
`
=======
		Application.getServiceDescription(
			'schema', 'enumGetTree', 'response', module.context.configuration.defaultLanguage )
>>>>>>> Stashed changes
	)
	.summary(
		"Return the hierarchy of the enumeration siblings of the provided root."
	)
	.description(
		Application.getServiceDescription(
			'schema', 'enumGetTree', 'description', module.context.configuration.defaultLanguage )
	);
