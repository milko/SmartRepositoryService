'use strict';

//
// Application procedures.
//
const Application = require( '../utils/Application' );


//
// Init local storage.
//
let result = null;

//
// Initialise required directories.
//
result = Application.createDirectories();
if( result.length )
	console.debug(
		`Created the following directories: ${result.toString()}.`
	);
else
	console.debug(
		`All required directories exist.`
	);

//
// Initialise authentication file.
//
result = Application.createAuthFile();
if( result.length )
	console.debug(
		`Created the following directories: ${result.toString()}.`
	);
else
	console.debug(
		`All required directories exist.`
	);

//
// Initialise document collections.
//
result = Application.createDocumentCollections();
if( result.length )
	console.debug(
		`Created the following document collections: ${result.toString()}.`
	);
else
	console.debug(
		`All required document collections exist.`
	);

//
// Initialise edge collections.
//
result = Application.createEdgeCollections();
if( result.length )
	console.debug(
		`Created the following edge collections: ${result.toString()}.`
	);
else
	console.debug(
		`All required edge collections exist.`
	);

//
// Initialise data dictionary.
//
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
