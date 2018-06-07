'use strict';

//
// Application procedures.
//
const Application = require( '../utils/Application' );


//
// Init local storage.
//
let result = null;
module.exports = {};

//
// Initialise required directories.
//
module.exports.createDirectories =
	Application.createDirectories();

//
// Initialise authentication file.
//
module.exports.createAuthFile =
	Application.createAuthFile();

//
// Initialise document collections.
//
module.exports.createDocumentCollections =
	Application.createDocumentCollections();

//
// Initialise edge collections.
//
module.exports.createEdgeCollections =
	Application.createEdgeCollections();

//
// Initialise data dictionary.
//
module.exports.createDataDictionary =
	Application.createDataDictionary( false );
/*
result = Application.createDataDictionary( false );
if( result === true )
	console.debug(
		`Created the data dictionary.`
	);
else if( result === null )
	console.debug(
		`Data dictionary exists.`
	);
else
	console.debug(
		`Unable to create data dictionary.`
	);
*/
