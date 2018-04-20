'use strict';

//
// Frameworks.
//
const fs = require('fs');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const crypto = require('@arangodb/crypto');
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
		for( const path of Object.values( K.defaultDirectories ) )
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
				created.push( path );
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
				created.push( name );

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
				created.push( name );

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
	 * contains a variable to key dictionary of terms and descriptors that are instances or
	 * the default type, instance ":state:application:default".
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
		const terms = db._collection( 'terms' );
		if( terms && (terms.count() > 0) )
		{
			//
			// Check descriptors.
			//
			const descriptors = db._collection( 'descriptors' );
			if( descriptors && (descriptors.count() > 0) )
			{
				//
				// Handle existing dictionary.
				//
				if( fs.isFile( file )
				 && (! doRefresh) )
					return null;                                                    // ==>

				//
				// Init dictionary.
				//
				const ddict = { term : {}, descriptor : {}, termInv : {}, descriptorInv : {} };

				//
				// Load terms.
				//
				for( const item of
					db._query( aql`
							FOR item IN ${terms}
								FILTER
									item.deploy == ":state:application:default"
								RETURN { var : item.var, key : item._key }
							`).toArray() )
				{
					ddict.term[ item.var ] = item.key;
					ddict.termInv[ item.key ] = item.var;
				}

				//
				// Load descriptors.
				//
				for( const item of
					db._query( aql`
							FOR item IN ${descriptors}
								FILTER
									item.deploy == ":state:application:default"
								RETURN { var : item.var, key : item._key }
							`).toArray() )
				{
					ddict.descriptor[ item.var ] = item.key;
					ddict.descriptorInv[ item.key ] = item.var;
				}

				//
				// Write file.
				//
				fs.write(
					file,
					`'use strict';module.exports=Object.freeze(${JSON.stringify(ddict)});`
				);

				return true;													    // ==>

			} // Has descriptors.

		} // Has terms.

		//
		// Delete file if collections are missing.
		//
		if( fs.isFile( file ) )
			fs.remove( file );

		return false;																    // ==>

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
	static createSessionData( theRequest )
	{
		//
		// Set application data property.
		//
		theRequest.application = {
			user : null,
			language : module.context.configuration.defaultLanguage
		};

	}	// createSessionData

	/**
	 * Create authentication file
	 *
	 * This method will create and initialise the authentication file, which resides
	 * in the data directory. If the file exists the method will return false; if it
	 * doesn't exist, the method will create it, initialise the administrator, user
	 * and cookies authentication data.
	 *
	 * The contained object is structured as follows:
	 *
	 * 	admin:	An object containing the system administrator codes.
	 * 		key:	The token key.
	 * 		code:	The code.
	 * 		pass:	The password.
	 * 	user:	An object containing the user codes.
	 * 		key:	The token key.
	 * 		code:	The code.
	 * 		pass:	The password.
	 * 	cookie:	An object containing the cookie codes.
	 * 		key:	The cookie secret.
	 *
	 * The user codes are all 16 character long, the cookie secret is 48 characters.
	 *
	 * The method will return an object indexed by the authentication data key with as
	 * value a boolean indicating whether the element was created.
	 *
	 * Note: the method must not throw or fail.
	 *
	 * @returns {Object}	The operation status.
	 */
	static createAuthFile()
	{
		//
		// Init local storage.
		//
		const result = { admin : false, user : false, cookie : false };

		//
		// Ensure directory.
		//
		if( ! fs.isDirectory( K.defaultDirectories.kData ) )
			fs.makeDirectory( K.defaultDirectories.kData );

		//
		// Set file path.
		//
		const file = K.defaultDirectories.kData
				   + fs.pathSeparator
				   + 'auth.json';

		//
		// Get file contents.
		//
		let auth = {};
		if( fs.isFile( file ) )
		{
			const contents = fs.read( file );
			auth = JSON.parse( contents );
		}

		//
		// Handle admin authentication.
		//
		if( ! auth.hasOwnProperty( 'admin' ) )
		{
			auth.admin = {};
			auth.admin.key = crypto.genRandomAlphaNumbers( 16 );
			auth.admin.code = crypto.genRandomAlphaNumbers( 16 );
			auth.admin.pass = crypto.genRandomAlphaNumbers( 16 );
			result.admin = true;
		}

		//
		// Handle user authentication.
		//
		if( ! auth.hasOwnProperty( 'user' ) )
		{
			auth.user = {};
			auth.user.key = crypto.genRandomAlphaNumbers( 16 );
			auth.user.code = crypto.genRandomAlphaNumbers( 16 );
			auth.user.pass = crypto.genRandomAlphaNumbers( 16 );
			result.user = true;
		}

		//
		// Handle cookie authentication.
		//
		if( ! auth.hasOwnProperty( 'cookie' ) )
		{
			auth.cookie = {};
			auth.cookie.key = crypto.genRandomAlphaNumbers( 48 );
			result.cookie = true;
		}

		//
		// Refresh/create file.
		//
		if( result.admin || result.user || result.cookie )
			fs.write( file, JSON.stringify( auth ) );

		return result;																// ==>

	}	// createAuthFile

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
	 * If the session does not exist, the method will raise an exception, by default
	 * the HTTP error will be set to 500.
	 *
	 * @param theRequest	{Object}	The request, will receive the status.
	 */
	static initSessionData( theRequest )
	{
		//
		// Check session.
		// Should be there.
		//
		if( theRequest.hasOwnProperty( 'session' ) )
		{
			//
			// Check user.
			//
			if( theRequest.session.hasOwnProperty( 'uid' ) )
			{
				//
				// Handle user.
				//
				if( theRequest.session.uid !== null )
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
						//
						if( ! theRequest.session.data )
							theRequest.session.data = {};

						//
						// Refresh session data.
						//
						theRequest.sessionStorage.save( theRequest.session );
					}
					catch( error )
					{
						//
						// Handle exception.
						//
						if( (!error.isArangoError)
						 || (error.errorNum !== ARANGO_NOT_FOUND) ) {
							throw( error );										// !@! ==>
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
			// Missing UID.
			//
			else
				throw(
					new MyError(
						'NoSession',						// Error name.
						K.error.NoSessionUID,				// Error code.
						theRequest.application.language		// Error language.
					)
				);																// !@! ==>
		}

		//
		// Missing session.
		//
		else
			throw(
				new MyError(
					'BadSession',						// Error name.
					K.error.MissingSession,				// Error code.
					theRequest.application.language		// Error language.
				)
			);																	// !@! ==>

	}	// initSessionData

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
	 * 	- ERROR:	The application is in an error setting.
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
		const kStatusERROR = K.setting.status.app.state.error;
		const kStatusSETTING = K.setting.status.app.state.setting;

		//
		// Init local storage.
		//
		let status_doc = null;

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

				//
				// Error status.
				//
				case kStatusERROR:

					theRequest.application.status = {
						application : kStatusERROR
					};

					return kStatusERROR;											// ==>
			}
		}

		//
		// Check data dictionary.
		//
		const status_value = ( this.createDataDictionary( false ) === false )
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
			else
			{
				if( status_doc.application !== status_value )
					collection.update(
						status_doc,
						{ application : status_value }
					);
			}
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

	/**
	 * Get admin authentication data
	 *
	 * This method will return the system adinistrator's authentication record, the
	 * method expects both the directory and file to exists (must have called
	 * createAuthFile() before; see that method for information on the data format,
	 * the method will return the 'admin' record element.
	 *
	 * If the doRefresh flag is true, the method will refresh the record before
	 * returning it.
	 *
	 * @param doRefresh	{boolean}	If true, the function will refresh the file.
	 * @returns {Object}			The System administrator's authentication record.
	 */
	static adminAuthentication( doRefresh )
	{
		//
		// Get authentication data.
		// MUST NOT FAIL.
		//
		const file = K.defaultDirectories.kData + fs.pathSeparator + 'auth.json';
		const auth = JSON.parse( fs.read( file ) );

		//
		// Refresh data.
		//
		if( doRefresh )
		{
			//
			// Refresh data.
			//
			auth.admin.key = crypto.genRandomAlphaNumbers( 16 );
			auth.admin.code = crypto.genRandomAlphaNumbers( 16 );
			auth.admin.pass = crypto.genRandomAlphaNumbers( 16 );

			//
			// Refresh file.
			//
			fs.write( file, JSON.stringify( auth ) );
		}

		return auth.admin;															// ==>

	}	// adminAuthentication

	/**
	 * Get user authentication data
	 *
	 * This method will return the user's authentication record, the method expects
	 * both the directory and file to exists (must have called createAuthFile()
	 * before; see that method for information on the data format, the method will
	 * return the 'user' record element.
	 *
	 * If the doRefresh flag is true, the method will refresh the record before
	 * returning it.
	 *
	 * @param doRefresh	{boolean}	If true, the function will refresh the file.
	 * @returns {Object}			The System user's authentication record.
	 */
	static userAuthentication( doRefresh )
	{
		//
		// Get authentication data.
		// MUST NOT FAIL.
		//
		const file = K.defaultDirectories.kData + fs.pathSeparator + 'auth.json';
		const auth = JSON.parse( fs.read( file ) );

		//
		// Refresh data.
		//
		if( doRefresh )
		{
			//
			// Refresh data.
			//
			auth.user.key = crypto.genRandomAlphaNumbers( 16 );
			auth.user.code = crypto.genRandomAlphaNumbers( 16 );
			auth.user.pass = crypto.genRandomAlphaNumbers( 16 );

			//
			// Refresh file.
			//
			fs.write( file, JSON.stringify( auth ) );
		}

		return auth.user;															// ==>

	}	// userAuthentication

	/**
	 * Get cookie secret
	 *
	 * This method will return the cookie secret, the method expects both the
	 * directory and file to exists (must have called createAuthFile() before; see
	 * that method for information on the data format, the method will return the
	 * the cookie secret string.
	 *
	 * If the doRefresh flag is true, the method will refresh the record before
	 * returning it.
	 *
	 * @param doRefresh	{boolean}	If true, the function will refresh the file.
	 * @returns {String}			The cookie secret.
	 */
	static cookieSecret( doRefresh )
	{
		//
		// Get authentication data.
		// MUST NOT FAIL.
		//
		const file = K.defaultDirectories.kData + fs.pathSeparator + 'auth.json';
		const auth = JSON.parse( fs.read( file ) );

		//
		// Refresh data.
		//
		if( doRefresh )
		{
			//
			// Refresh data.
			//
			auth.cookie.key = crypto.genRandomAlphaNumbers( 48 );

			//
			// Refresh file.
			//
			fs.write( file, JSON.stringify( auth ) );
		}

		return auth.cookie.key;														// ==>

	}	// cookieSecret

	/**
	 * Get service description
	 *
	 * This method can be used to retrieve the descriptions associated with a specific
	 * service module, service, service part and language.
	 *
	 * 'theModule' indicates the service module to check, it should be the source code
	 * file name in the 'routes' directory; this element is used to disambiguate
	 * synonym service names.
	 *
	 * 'theService' indicates the service tag in the module.
	 *
	 * 'thePart' indicates which part of the service to retrieve:
	 *
	 * 	- description:	The service description.
	 * 	- response:		The service response.
	 * 	- body:			The service body parameters.
	 *
	 * 'theLanguage' indicates in which language the message should be retrieved.
	 *
	 * The descriptions are found in the 'messages' collection, their key is composed
	 * by prefixing an 's', followed by the module and followed by the part, all
	 * separated by a colon.
	 *
	 * If the message cannot be found, or the part or language cannot be matched, the
	 * method will return 'N/A'.
	 *
	 * @param theModule		{string}	The service module.
	 * @param theService	{string}	The service name.
	 * @param thePart		{string}	The service part.
	 * @param theLanguage	{string}	The language.
	 * @return {string}					The description.
	 */
	static getServiceDescription( theModule, theService, thePart, theLanguage )
	{
		//
		// Get description.
		//
		try
		{
			const message =
				db._collection( 'messages' )
					.document( `s:${theModule}:${theService}` );

			if( message.hasOwnProperty( thePart )
			 && message[ thePart ].hasOwnProperty( theLanguage ) )
				return message[ thePart ][ theLanguage ];							// ==>
		}
		catch( error )
		{
			//
			// Handle exception.
			//
			if( (!error.isArangoError)
			 || (error.errorNum !== ARANGO_NOT_FOUND) )
				throw( error );													// !@! ==>
		}

		return "N/A";																// ==>

	}	// getServiceDescription

}	// Application.

module.exports = Application;
