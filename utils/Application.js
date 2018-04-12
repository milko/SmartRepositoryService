'use strict';

//
// Frameworks.
//
const fs = require('fs');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;

//
// Application.
//
const K = require( './Constants' );


/**
 * Application class
 *
 * This class contains a series of static methods that manage application level
 * settings and procedures.
 */
class Application
{
	/**
	 * Initialise directories
	 *
	 * This method will create all required directories if not there, the method will
	 * handle the following directories:
	 * 	- dictionary:	This directory contains data dictionary definition objects.
	 *
	 * @returns {Array}	The list of created collections.
	 */
	static createDirectories()
	{
		//
		// Init local storage.
		//
		const created = [];

		//
		// Iterate directories.
		//
		for( const path of K.defaultDirectories )
		{
			//
			// Check directory.
			//
			if( ! fs.isDirectory( path ) )
			{
				//
				// Create directory.
				//
				fs.makeDirectory( path );
				result.push( path );
			}
		}

		return created;																// ==>

	}	// createDirectories

	/**
	 * Initialise document collections
	 *
	 * This method will create all required document collections if these do not exist,
	 * the method will return the list of created collections.
	 *
	 * @returns {Array}	The list of created collections.
	 */
	static createDocumentCollections()
	{
		//
		// Init local storage.
		//
		const created = [];
		const collections = K.defaultDocumentCollections;

		//
		// Iterate collections.
		//
		for( const name of Object.keys( collections ) )
		{
			//
			// Check collection.
			//
			if( ! db._collection( name ) )
			{
				//
				// Create collection.
				//
				db._createDocumentCollection( name );
				result.push( name );

				//
				// Set indexes.
				//
				for( const index of collections[ name ] )
					db._collection( name ).ensureIndex( index );
			}
		}

		return created;																// ==>

	}	// createDocumentCollections

	/**
	 * Initialise edge collections
	 *
	 * This method will create all required edge collections if these do not exist, the
	 * method will return the list of created collections.
	 *
	 * @returns {Array}	The list of created collections.
	 */
	static createEdgeCollections()
	{
		//
		// Init local storage.
		//
		const created = [];
		const collections = K.defaultEdgeCollections;

		//
		// Iterate collections.
		//
		for( const name of Object.keys( collections ) )
		{
			//
			// Check collection.
			//
			if( ! db._collection( name ) )
			{
				//
				// Create collection.
				//
				db._createEdgeCollection( name );
				result.push( name );

				//
				// Set indexes.
				//
				for( const index of collections[ name ] )
					db._collection( name ).ensureIndex( index );
			}
		}

		return created;																// ==>

	}	// createEdgeCollections

	/**
	 * Create data dictionary
	 *
	 * This function will initialise the Dict.js file if not already there, this file
	 * contains a variable to key dictionary of default and standard terms and
	 * descriptors that is used by the application scripts.
	 *
	 * The function will first check if the terms and descriptors collections exist
	 * and have data, if that is the case, it will check if the Dict.js file exists in
	 * the ddict directory, if that is not the case, it will load and create the file.
	 * If the abovementioned collections do not exist and the file exists, it will be
	 * deleted.
	 *
	 * If you provide true in doRefresh, the existing file will be overwritten.
	 *
	 * The function returns true if the file was created, null if the file exists and
	 * false if the terms or descriptors collections are empty.
	 *
	 * Note that this method expects terms and descriptors collections to exist.
	 *
	 * @param doRefresh	{boolean}	If true, the function will refresh the file.
	 * @returns {boolean}|{null}	True, false or null.
	 */
	static createDataDictionary( doRefresh = false )
	{
		//
		// Set file path.
		//
		const file = K.defaultDirectories.kDictionary
				   + fs.pathSeparator
				   + 'Dict.js';

		//
		// Check terms.
		//
		if( db._collection( 'terms' ).count() > 0 )
		{
			//
			// Check descriptors.
			//
			if( db._collection( 'descriptors' ).count() > 0 )
			{
				//
				// Check file.
				//
				if( fs.isFile( file ) )
				{
					//
					// Done if no refresh.
					//
					if( ! doRefresh )
						return null;												// ==>

					//
					// Get dictionary.
					//
					const data = Dictionary.getDictionary();

					//
					// Write file.
					//
					fs.write(
						file,
						`'use strict';module.exports=Object.freeze(${JSON.stringify(data)});`
					);

					return true;													// ==>
				}

			} // Has descriptors.

		} // Has terms.

		//
		// Delete file if collections are missing.
		//
		if( fs.isFile( file ) )
			fs.remove( file );

		return false;																// ==>

	}	// createDataDictionary

	/**
	 * Create request session data field
	 *
	 * This method will initialise the application data field, this is a property in the
	 * request, named 'application', that will receive all global data needed by the
	 * service.
	 *
	 * Note: the method must not throw or fail.
	 *
	 * @param theRequest	{Object}	The request.
	 */
	static createRequestSessionData( theRequest )
	{
		//
		// Set application data property.
		//
		theRequest.application = {
			user : null,
			language : module.context.configuration.defaultLanguage
		};

	}	// createRequestSessionData

	/**
	 * Init request session data
	 *
	 * This function will initialise the application session.
	 *
	 * It will first check if the current session has an active user, if that is not
	 * the case it will exit without any action.
	 *
	 * If there is a current session user, it will retrieve its record and set the
	 * user property of the request's application data to that user.
	 *
	 * In the process, it will also initialise the session data if necessary.
	 *
	 * @param theRequest	{Object}	The request, will receive the status.
	 */
	static initRequestSessionData( theRequest )
	{
		//
		// Check session.
		// Should be there.
		//
		if( theRequest.hasOwnProperty( 'session' ) )
		{
			//
			// Handle user.
			// We assume here there is a session,
			// and that the session contains the uid.
			//
			if( theRequest.session.uid )
			{
				try
				{
					//
					// Read current user.
					//
					const user = db._document( theRequest.session.uid );

					delete user._id;
					delete user._key;
					delete user._rev;
					delete user.auth;

					theRequest.application.user = user;
					theRequest.application.language = user.language;

					//
					// Init session data.
					// We assume session data is there by default.
					//
					if( ! theRequest.session.data )
					{
						theRequest.session.data = {};
						theRequest.sessionStorage.save( theRequest.session );
					}
				}
				catch( error )
				{
					//
					// Handle exception.
					//
					if( (!error.isArangoError)
						|| (error.errorNum !== ARANGO_NOT_FOUND) ) {
						throw( error );											// !@! ==>
					}

					//
					// Reset session.
					//
					theRequest.session.uid = null;
					theRequest.session.data = {};
					theRequest.sessionStorage.save( theRequest.session );
				}
			}

			//
			// Reset session data.
			//
			else
				theRequest.session.data = {};
		}

		//
		// Missing session.
		//
		else
			throw(
				new MyError(
					'NoSession',						// Error name.
					K.error.CannotSession,				// Error code.
					theRequest.application.language		// Error language.
				)
			);																	// !@! ==>

	}	// initRequestSessionData

	/**
	 * Init application status
	 *
	 * This function will initialise the application status.
	 *
	 * The status is stored in the settings collection under the 'status' key and in
	 * the 'application' field, these are the possible states:
	 *
	 * 	- OK:		The application is idle.
	 * 	- BUSY:		The application is busy.
	 * 	- SETTINGS:	The settings collection is missing.
	 * 	- DDICT:	The data dictionary is not initialised.
	 *
	 * The method will follow these steps:
	 *
	 * 	- Check settings collection:	if the collection doesn't exist, the method
	 * 									will set the current status and exit.
	 * 	- Get current status:	 		the existing status will be retrieved.
	 * 	- Check data dictionary:		check if data dictionary is initialised.
	 * 	- Update current status: 		if current is OK and data dictionary is missing.
	 *
	 * The method will return the current status.
	 *
	 * @param theRequest	{Object}	The request, will receive the status.
	 * @returns {String}				The current status.
	 */
	static initApplicationStatus( theRequest )
	{
		//
		// Init constants.
		//
		const kKey = K.setting.status.key;
		const kAppKey = K.setting.status.app.key;
		const kStatusOK = K.setting.status.app.state.ok;
		const kStatusBUSY = K.setting.status.app.state.busy;
		const kStatusDDICT = K.setting.status.app.state.ddict;
		const kStatusSETTING = K.setting.status.app.state.setting;

		//
		// Init local storage.
		//
		let status_doc = null;
		let status_value = null;

		//
		// Check settings collection.
		//
		const collection = db._collection( 'settings' );
		if( ! collection )
		{
			//
			// Update session status.
			//
			theRequest.application.status = {
				application : kStatusSETTING
			};

			return theRequest.application.status.application;						// ==>
		}

		//
		// Get current status.
		//
		try
		{
			status_doc = collection.document( kKey );
		}
		catch( error )
		{
			//
			// Handle errors.
			//
			if( (! error.isArangoError)
			 || (error.errorNum !== ARANGO_NOT_FOUND) ) {
				throw( error );													// !@! ==>
			}
		}

		//
		// Handle current status.
		//
		if( status_doc !== null )
		{
			//
			// Handle blocking and overriding statuses.
			//
			switch( status_doc.application )
			{
				//
				// Busy status.
				//
				case kStatusBUSY:

					theRequest.application.status = {
						application : kStatusBUSY
					};

					return kStatusBUSY;												// ==>
			}
		}

		//
		// Check data dictionary.
		//
		status_value = ( this.createDataDictionary( false ) === false )
					 ? kStatusDDICT
					 : kStatusOK;

		//
		// Update settings.
		//
		try
		{
			//
			// Insert.
			//
			if( status_doc === null )
				collection.insert({
					_key		: kKey,
					application	: status_value
				});

			//
			// Update.
			//
			if( status_doc.application !== status_value )
				collection.update(
					status_doc,
					{ application : status_value }
				);
		}
		catch( error )
		{
			throw( error );														// !@! ==>
		}

		//
		// Set status in session.
		//
		theRequest.application.status = {
			application : status_value
		};

		return status_value;														// ==>

	}	// initApplicationStatus

}	// Application.

module.exports = Application;
