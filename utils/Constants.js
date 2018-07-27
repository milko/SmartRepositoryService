'use strict';

//
// Frameworks.
//
const fs = require('fs');

/**
 * Constants
 *
 * This object contains all global constants.
 *
 * @type {Readonly<{Object}>}
 */
module.exports = Object.freeze(
	{
		//
		// Default document collections
		//
		// The object key represents the collection name and the value is an array
		// containing the collection index definitions.
		//
		defaultDocumentCollections : {
			//
			// System.
			//
			logs		: [],
			errors		: [],
			messages	: [],
			settings	: [],
			sessions	: [],

			//
			// User.
			//
			users		: [
				{
					fields:	[ 'username' ],
					type:	'hash',
					unique:	true,
					sparse:	false
				},
				{
					fields:	[ 'email' ],
					type:	'hash',
					unique:	true,
					sparse:	false
				}
			],
			groups		: [],

			//
			// Dictionary.
			//
			terms		: [
				{
					fields:	[ 'nid' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'lid' ],
					type:	'hash',
					unique:	false,
					sparse:	false
				},
				{
					fields:	[ 'gid' ],
					type:	'skiplist',
					unique:	true,
					sparse:	false
				},
				{
					fields:	[ 'var' ],
					type:	'skiplist',
					unique:	true,
					sparse:	true
				},
				{
					fields:	[ 'syn[*]' ],
					type:	'skiplist',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'keyword[*]' ],
					type:	'skiplist',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'instances[*]' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				}
			],
			descriptors	: [
				{
					fields:	[ 'nid' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'gid' ],
					type:	'skiplist',
					unique:	true,
					sparse:	false
				},
				{
					fields:	[ 'var' ],
					type:	'skiplist',
					unique:	true,
					sparse:	false
				},
				{
					fields:	[ 'kind' ],
					type:	'hash',
					unique:	false,
					sparse:	false
				},
				{
					fields:	[ 'type' ],
					type:	'hash',
					unique:	false,
					sparse:	false
				},
				{
					fields:	[ 'format' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'unit' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'syn[*]' ],
					type:	'skiplist',
					unique:	false,
					sparse:	false
				},
				{
					fields:	[ 'keyword[*]' ],
					type:	'skiplist',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'terms[*]' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'fields[*]' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				}
			],

			//
			// Data.
			//
			studies		: [],
			annexes		: [],
			smart		: [],

			//
			// Toponymia.
			//
			toponyms	: [],
			shapes		: []
		},

		//
		// Default edge collections
		//
		// The object key represents the collection name and the value is an array
		// containing the collection index definitions.
		//
		defaultEdgeCollections : {
			//
			// User.
			//
			hierarchy	: [
				{
					fields:	[ '_from', '_to', 'predicate' ],
					type:	'hash',
					unique:	true,
					sparse:	false
				},
				{
					fields:	[ 'branches[*]' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				}
			],

			//
			// Dictionary.
			//
			schemas		: [
				{
					fields:	[ 'predicate' ],
					type:	'hash',
					unique:	false,
					sparse:	false
				},
				{
					fields:	[ 'branches[*]' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				}
			],

			//
			// Toponymia.
			//
			edges		: [
				{
					fields:	[ 'predicate' ],
					type:	'hash',
					unique:	false,
					sparse:	false
				},
				{
					fields:	[ 'branches[*]' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				},
				{
					fields:	[ 'attributes[*]' ],
					type:	'hash',
					unique:	false,
					sparse:	true
				}
			]
		},

		//
		// Default directories.
		//
		// The object key represents the directory identifier, the value represents
		// the directory path.
		//
		defaultDirectories : {
			kData		: module.context.basePath + fs.pathSeparator + 'data',
			kDictionary : module.context.basePath + fs.pathSeparator + 'dictionary'
		},

		//
		// Errors.
		//
		error: {
			MissingReqCollection:   1,
			MissingSession		:   2,
			UserNotFound		:   3,
			BadPassword			:   4,
			BadToken			:   5,
			AdminFirstUser		:   6,
			UserMustBeManaged	:   7,
			CannotManageUsers	:   8,
			CannotCreateAdmin	:   9,
			CannotUseApp		:  10,
			InvalidInputFormat	:  11,
			InvalidOutputFormat	:  12,
			InvalidDataType		:  13,
			InvalidRootDataType	:  14,
			UnknownValTypeField	:  15,
			UnknownValDescField	:  16,
			UnknownFormatType	:  17,
			UnknownGraphSense	:  18,
			BadValidationRec	:  19,
			UnknownDictTerm		:  20,
			EmptyTypeHierarchy	:  21,
			NotNumber			:  22,
			BadDateFormat		:  23,
			InvalidDate			:  24,
			InvalidMonth		:  25,
			InvalidObjReference	:  26,
			InvalidColReference	:  27,
			InvalidColName		:  28,
			NoCollectionInRec	:  29,
			NoEnumsInRec		:  30,
			NotInEnumsList		:  31,
			NotEnumeration		:  32,
			BadDocumentHandle	:  33,
			NotFoundGID			:  34,
			BadMapTerm			:  35,
			NoDataType			:  36,
			UnknownDataType		:  37,
			NoAuthRank			:  38,
			NoAuthRole			:  39,
			TermNotFound		:  40,
			NoDataDictionary	:  41,
			ApplicationBusy		:  42,
			NoSessionUID        :  43,
			ApplicationError    :  44,
			NotDataType			:  45,
			NotBaseDataType		:  46,
			MissingId			:  47,
			MissingKey			:  48,
			MissingVar			:  49,
			MissinObjectKeyType	:  50,
			KeyMustBeText		:  51,
			ValueMustBeNumeric	:  52,
			NotInstanceOf		:  53,
			NoInstanceRefInRec	:  54,
			MustBeObject		:  55,
			DescriptorNotFound	:  56,
			UnknownCastFunc		:  57,
			MustBeArray			:  58,
			UnknownCustomFunc	:  59,
			MustBeScalar		:  60,
			CannotRegisterUser	:  61,
			NoCurrentUser		:  62,
			UserExists			:  63,
			EdgeExists			:  64,
			DocumentNotFound	:  65,
			AmbiguousEdge		:  66,
			IdMismatch			:  67,
			KeyMismatch			:  68,
			MissingField		:  69,
			ExpectingEdgeColl	:  70,
			EdgeAttrExists		:  71,
			DuplicateDocument	:  72,
			ExpectingDocColl	:  73,
			AmbiguousAttrEdge	:  74,
			EdgeAttrNotFound	:  75,
			AmbiguousDocument	:  76,
			PropertyLocked		:  77,
			ResolveMismatch		:  78,
			UserManagerConflict	:  79,
			MissingUserManager	:  80,
			DuplicateEdge		:  81,
			NoManager			:  82,
			UserGroupConflict	:  83,
			ManagesUsers		:  84,
			LockedFields		:  85,
			FormNotFound		:  86,
			NoManagerManages	:  87,
			NoLocalIdentifier	:  88,
			NoGlobalIdentifier	:  89,
			DescriptorEmbedded	:  90,
			DescriptorDefault	:  91,
			DescriptorStandard	:  92,
			MissingToResolve	:  93,
			NoCollection		:  94,
			BadGroupReference	:  95,
			BadManagerReference	:  96,
			CannotManageUser	:  97,
			CannotMakeEdgeKey	:  98,
			FieldIsReserved		:  99,
			NotBranchedEdge		: 100,
			IsPersistent		: 101,
			IsNotPersistent		: 102,
			NotAttributeEdge	: 103,
			ExpectingDocRef		: 104,
			ExpectingButGot		: 105,
			CrossCollectionRef	: 106,
			NoSelectionData		: 107,
			HasConstraints		: 108,
			ObjectIsImmutable	: 109,
			BadTransOpCode		: 110,
			SessionUserChanged	: 111,
			CannotUpload		: 112,
			OnlySysAdmAllowed	: 113,
			CannotMetadata		: 114
		},

		//
		// Settings.
		//
		setting : {
			status : {
				key				: 'status',			// Status key.
				app : {								// Application:
					key			: 'application',	// key.
					state : {						// Status:
						ok		: 'OK',				// application is usable,
						error	: 'ERROR',			// application is in error,
						setting	: 'SETTINGS',		// missing settings collection,
						busy	: 'BUSY',			// application is busy,
						ddict	: 'DDICT'			// missing data dictionary data.
					}
				}
			}
		},

		//
		// Regular expressions.
		//
		pattern: {
			key			: "/^[a-zA-Z0-9_\\-+=$:;,.@()!*’%\\\\]+$/"
		},
		
		//
		// Tokens.
		//
		token: {
			idSeparator	: ':'
		},

		//
		// Function snippets.
		//
		function: {
			clone		: (obj) => {
				return JSON.parse(JSON.stringify(obj));
			},
			flatten		: (arr) => {
				return [].concat(...arr);
			},
			className	: (cls) => {
				if( typeof(cls) === 'function' )
					return cls.prototype.constructor.name;
				return null;
			},
			isObject	: (obj) => {
				if( (obj === null)
					|| Array.isArray(obj)
					|| (typeof obj === 'function') )
					return false;
				return (typeof obj === 'object');
			},
		}
	}
);
