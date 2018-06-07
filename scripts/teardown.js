'use strict';

//
// Application procedures.
//
const Application = require( '../utils/Application' );


//
// Init local storage.
//
module.exports = {};

//
// Drop document collections.
//
module.exports.dropDocumentCollections =
	Application.dropDocumentCollections();

//
// Drop edge collections.
//
module.exports.dropEdgeCollections =
	Application.dropEdgeCollections();
