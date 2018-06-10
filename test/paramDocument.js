'use strint';

/**
 * Document test parameters.
 */
module.exports = {
	
	//
	// Test collection.
	//
	collection: 'test_Document',
	
	//
	// Document contents.
	//
	content_01 : {
		var: 'VAR1',
		name: "Document 1",
		attributes: [
			':type:unit:length:km',
			':type:unit:area:km',
			':type:unit:time:h'
		]
	},
	
	content_02 : {
		var: 'VAR2',
		name: "Document 1",
		attributes: [
			':type:unit:length:km',
			':type:unit:area:km',
			':type:unit:time:h'
		]
	},
	
	content_03 : {
		name: "Document 1"
	},
	
	content_04 : {
		attributes: [
			':type:unit:length:km',
			':type:unit:area:km',
			':type:unit:time:h'
		]
	},
	
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