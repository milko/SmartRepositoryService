'use strict';

//
// Application.
//
const Dict = require( '../../dictionary/Dict' );

/**
 * Edge test parameters.
 *
 * The object implements the default parameters to the unit tests, it provides:
 *
 * 	- The request (request).
 * 	- The edge collection (collection_edge).
 * 	- The document collection (collection_document).
 *
 * 	- Required fields: var.
 * 	- Unique fields: gid.
 * 	- Locked fields: sym.
 * 	- Restricted fields: password.
 * 	- Constraint: the name field equals "CONSTRAINED".
 */
module.exports = {
	
	//
	// Test class identification.
	//
	class			: 'Edge',
	
	//
	// Test collections.
	//
	collection_edge		: 'test_Edge',
	collection_document	: 'test_Document',
	
	//
	// Example references.
	//
	example_id			: 'schemas/3e3d5e71d9654933b0454fb23fa14cb3',
	example_collection	: 'schemas',
	
	//
	// Other references.
	//
	other_id			: null,
	other_collection	: 'edges',
	
	//
	// Nodes.
	//
	nodes : [
		{
			_key: 'NODE0',
			var: 'FROM',
			name: "Origin node",
			order: 0
		},
		{
			_key: 'NODE1',
			var: 'TO',
			name: "Destination node",
			order: 1
		},
		{
			_key: 'NODE2',
			var: 'OTHER',
			name: "Other node",
			order: 2
		}
	],
	
	//
	// Document contents.
	//
	content : {
		_from: 'test_Document/NODE0',
		_to: 'test_Document/NODE1',
		predicate: `terms/${Dict.term.kPredicateEnumOf}`,
		sym: 'SYMBOL',
		var: 'VAR',
		password: 'XXX',
		name: "NAME",
		order: 0,
		passcheck: 'DCBA'
	},
	
	//
	// Replace contents.
	//
	replace : {
		_from: 'test_Document/NODE1',
		_to: 'test_Document/NODE2',
		predicate: `terms/${Dict.term.kPredicateManagedBy}`,
		sym: 'SYMBOL_replaced',
		var: 'VAR_REPLACED',
		password: 'XXX',
		name: "NAME",
		order: 1,
		username: "USERNAME",
		passcheck: 'ABCD'
	},
	
	//
	// Sample contents.
	//
	sample : {
		_from: 'test_Document/NODE0',
		_to: 'test_Document/NODE1',
		predicate: `terms/${Dict.term.kPredicateEnumOf}`,
		name: "PIPPO",
		var: "VARIABLE"
	},
	
	//
	// Intermediate parameters.
	// These are used in some tests to change the contents of objects in order for
	// them not to be considered duplicates.
	//
	insertWithContent: {
		_to: 'test_Document/NODE2',
		name: 'NAME FILLED',
		lid: 'LID_FILLED'
	},
	
	//
	// Intermediate parameters.
	// insertWithSameContent().
	// Values to change when testing for the second time.
	//
	insertWithSameContent: {
		first: {
			_from: 'test_Document/NODE2',
			_to: 'test_Document/NODE0'
		},
		second: {
			_from: 'test_Document/NODE1',
			_to: 'test_Document/NODE0',
			name: "NAME SAME CONTENTS"
		}
	},
	
	//
	// Intermediate parameters.
	// resolveSignificantField().
	// Parameters to the test.
	//
	resolveSignificant: {
		noSig: {
			name: 'NAME FILLED'
		},
		sigOne: {
			_from: 'test_Document/NODE0',
			_to: 'test_Document/NODE1',
			lid: 'LID_FILLED'
		},
		sigFind: {
			_from: 'test_Document/NODE0',
			_to: 'test_Document/NODE1',
			predicate: `terms/${Dict.term.kPredicateEnumOf}`,
			nid: 'terms/:id',
			lid: 'LID_FILLED'
		},
		sigNoFind: {
			_from: 'test_Document/NODE2',
			_to: 'test_Document/NODE1',
			predicate: `terms/${Dict.term.kPredicateEnumOf}`,
			nid: 'UNKNOWN',
			lid: 'LID'
		}
	},
	
	//
	// Intermediate parameters.
	// resolveReferenceField().
	// Parameters to the test.
	//
	resolveReference: {
		_from: 'test_Document/NODE2',
		_to: 'test_Document/NODE1',
		predicate: `terms/${Dict.term.kPredicateEnumOf}`
	},
	
	//
	// Intermediate parameters.
	// resolveNoException().
	// Parameters to the test.
	//
	resolveNoException: {
		correct: {
			_from: 'test_Document/NODE0',
			_to: 'test_Document/NODE1',
			predicate: `terms/${Dict.term.kPredicateEnumOf}`
		},
		incorrect: {
			_from: 'test_Document/NODE2',
			_to: 'test_Document/NODE1',
			predicate: `terms/${Dict.term.kPredicateEnumOf}`
		}
	},
	
	//
	// Intermediate parameters.
	// resolveChangeLockedField().
	// Parameters to the test.
	//
	changeLocked: "I_CHANGED_IT",
	
	//
	// Intermediate parameters.
	// resolveChangeSignificantField().
	// Parameters to the test.
	//
	changeSignificant: "I_CHANGED_IT",
	
	//
	// Intermediate parameters.
	// resolveChangeRequiredField().
	// Parameters to the test.
	//
	changeRequired: "I_CHANGED_IT",
	
	//
	// Intermediate parameters.
	// resolveChangeUniqueField().
	// Parameters to the test.
	//
	changeUnique: "I_CHANGED_IT",
	
	//
	// Intermediate parameters.
	// resolveChangeLocalField().
	// Parameters to the test.
	//
	changeLocal: "I_CHANGED_IT",
	
	//
	// Intermediate parameters.
	// resolveChangeStandardField().
	// Parameters to the test.
	//
	changeStandard: "I_CHANGED_IT",
	
	//
	// Default request.
	//
	request : {
		"_url": {
			"protocol": null,
			"slashes": null,
			"auth": null,
			"host": null,
			"port": null,
			"hostname": null,
			"hash": null,
			"search": null,
			"query": null,
			"pathname": "/new/test/Utils/echo/get",
			"path": "/new/test/Utils/echo/get",
			"href": "/new/test/Utils/echo/get"
		},
		"_raw": {
			"authorized": false,
			"user": null,
			"database": "smart",
			"url": "/new/test/Utils/echo/get",
			"protocol": "http",
			"server": {
				"address": "127.0.0.1",
				"port": 8529
			},
			"client": {
				"address": "127.0.0.1",
				"port": 50036,
				"id": "152862521345726"
			},
			"internals": {},
			"prefix": "/",
			"headers": {
				"host": "localhost:8529",
				"connection": "close",
				"user-agent": "Paw/3.1.7 (Macintosh; OS X/10.13.5) GCDHTTPRequest"
			},
			"requestType": "GET",
			"parameters": {},
			"cookies": {
				"FOXXSID": "bada141d08827b4898d13f8ad5dbeb2f17f4bd631c7c2ef3a5666a550444cd97",
				"FOXXSID.sig": "7d8a97a4a21e2cd6ced36fbcfce010fa2acd884be73a2a56a335a78c3e1d8283"
			},
			"suffix": [
				"test",
				"Utils",
				"echo",
				"get"
			],
			"rawSuffix": [
				"test",
				"Utils",
				"echo",
				"get"
			],
			"urlParameters": {}
		},
		"context": {
			"argv": [],
			"basePath": "/usr/local/var/lib/arangodb3-apps/_db/smart/new/APP",
			"baseUrl": "/_db/smart/new",
			"collectionPrefix": "new_",
			"configuration": {
				"adminCode": "admin",
				"defaultLanguage": "ISO:639:3:eng",
				"algorithm": "HS384",
				"page": 4096,
				"buffer": 819200
			},
			"dependencies": {},
			"isDevelopment": true,
			"isProduction": false,
			"manifest": {
				"name": "DatasetAggregator",
				"version": "0.0.0",
				"license": "Apache 2",
				"author": "Milko Skofic",
				"description": "Ontology wrapper for datasets",
				"engines": {
					"arangodb": "^3.0.0"
				},
				"main": "main.js",
				"configuration": {
					"adminCode": {
						"description": "Default administrator's user code.",
						"type": "string",
						"required": true,
						"default": "admin"
					},
					"defaultLanguage": {
						"description": "Default language ISO code.",
						"type": "string",
						"required": true,
						"default": "ISO:639:3:eng"
					},
					"algorithm": {
						"description": "Default encryption algorythm",
						"type": "string",
						"required": true,
						"default": "HS384"
					},
					"page": {
						"description": "Default page size",
						"type": "integer",
						"required": true,
						"default": 4096
					},
					"buffer": {
						"description": "Default buffer size",
						"type": "integer",
						"required": true,
						"default": 819200
					}
				},
				"dependencies": {},
				"scripts": {
					"setup": "scripts/setup.js",
					"teardown": "scripts/teardown.js"
				},
				"tests": [
					"test/**/test_*.js"
				]
			},
			"mount": "/new"
		},
		"suffix": "",
		"baseUrl": "/_db/smart",
		"path": "/test/Utils/echo/get",
		"pathParams": {},
		"queryParams": {},
		"body": null,
		"rawBody": [],
		"trustProxy": false,
		"protocol": "http",
		"hostname": "localhost",
		"port": 8529,
		"remoteAddress": "127.0.0.1",
		"remoteAddresses": [
			"127.0.0.1"
		],
		"remotePort": 50036,
		"sessionStorage": {},
		"session": {
			"uid": null,
			"created": 1528627940535,
			"data": {}
		},
		"application": {
			"user": null,
			"language": "ISO:639:3:eng",
			"status": {
				"application": "OK"
			}
		}
	}
};