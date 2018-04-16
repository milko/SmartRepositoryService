'use strict';


//
// Frameworks.
//
const db = require('@arangodb').db;

//
// Application.
//
const K = require( './Constants' );

//
// Globals.
//
const kCollection = db._collection( 'logs' );


/**
 * Log class
 *
 * This class features a series of static methods that can be used to write log entries.
 *
 * The class handles event log objects structured as follows:
 *
 * 	start:		Creation time stamp (request.stamp.start).
 * 	end:		Termination time stamp (request.stamp.end).
 * 	time:		Service duration in milliseconds.
 * 	status:		Status code (response.statusCode).
 * 	session:	Session reference (session _key).
 * 	user:		User reference (request.session.uid).
 * 	rank:		User rank, at event time.
 * 	role:		User role, at event time.
 * 	url:		Service path (request.path).
 * 	ip:			Caller IP address (request.remoteAddress).
 * 	port:		Caller port (request.port).
 *
 * The logs may also contain uncaught errors, these are structured as follows:
 *
 * 	- e_clas:	The class raising the error.
 * 	- e_proc:	The function raising the error.
 * 	- e_lang:	The current language code.
 * 	- e_name:	The error name.
 * 	- e_mess:	The error message.
 * 	- e_data:	The error data.
 * 	- e_exch:	The exception object.
 */
class Log
{
	/**
	 * Log event
	 *
	 * This method will write an event entry into the log, it will do so only if there
	 * is a current session and the session contains a logged user.
	 *
	 * Entries are structured as follows:
	 *
	 * 	start:		Creation time stamp (request.stamp.start).
	 * 	end:		Termination time stamp (request.stamp.end).
	 * 	time:		Service duration in milliseconds.
	 * 	status:		Status code (response.statusCode).
	 * 	session:	Session reference (session _key).
	 * 	user:		User reference (request.session.uid).
	 * 	rank:		User rank, at event time.
	 * 	role:		User role, at event time.
	 * 	url:		Service path (request.path).
	 * 	ip:			Caller IP address (request.remoteAddress).
	 * 	port:		Caller port (request.port).
	 *
	 * Note: this method expects the Dict.js file to exist.
	 *
	 * @param theStart		{Number}	The start timestamp.
	 * @param theEnd		{Number}	The end timestamp.
	 * @param theDuration	{Number}	The duration in milliseconds.
	 * @param theRequest	{Object}	The request.
	 * @param theResponse	{Object}	The response.
	 * @returns {String}|{null}         The log _id or null if not written.
	 */
	static writeEvent( theStart, theEnd, theDuration, theRequest, theResponse )
	{
		//
		// Check collection.
		//
		if( kCollection )
		{
			//
			// Check user.
			//
			if( theRequest.session.uid )
			{
				//
				// Init local storage.
				//
				const Dict = require( '../dictionary/Dict' );
				const doc = { type : 'event' };

				//
				// Set timestamps and response status code.
				//
				doc.start	= theStart;
				doc.end		= theEnd;
				doc.time	= theDuration;
				doc.status	= theResponse.statusCode;

				//
				// Set user info.
				//
				doc.user 	= theRequest.session.uid;
				doc.rank 	= theRequest.application.user[ Dict.descriptor.kRank ];
				doc.role 	= theRequest.application.user[ Dict.descriptor.kRole ];

				//
				// Set cookie key.
				//
				if( theRequest.session.hasOwnProperty( '_key' ) )
					doc.session = theRequest.session._key;

				//
				// Set path and remote address info.
				//
				doc.url 	= theRequest.path;
				doc.ip	  	= theRequest.remoteAddress;
				doc.port 	= theRequest.port;

				//
				// Save log entry.
				//
				try
				{
					const result = kCollection.insert( doc );

					return result;                                                  // ==>
				}
				catch( error )
				{
					// Ignore.
				}
			}
		}

		return null;                                                                // ==>

	}	// writeEvent

	/**
	 * Log error
	 *
	 * This type of log entry is used to record uncaught errors, these are errors that
	 * could not be returned to the caller as errors in the error classes.
	 *
	 * 'theError' parameter contains an object that will be recorded in the log, it is
	 * structured as follows:
	 *
	 * 	- e_clas:	The class raising the error.
	 * 	- e_proc:	The function raising the error.
	 * 	- e_lang:	The current language code.
	 * 	- e_name:	The error name.
	 * 	- e_mess:	The error message.
	 * 	- e_data:	The error data.
	 * 	- e_exch:	The exception object.
	 *
	 * 'theException' contains the eventual exception that triggered the error, it
	 * will be recorded in the 'e_exch' field.
	 *
	 * @param theError		{Object}	The error object.
	 * @param theException	{Object}	The eventual exception object.
	 */
	static writeError( theError, theException = null )
	{
		//
		// Check collection.
		//
		if( kCollection )
		{
			//
			// Init local storage.
			//
			const members = [
				'e_clas',
				'e_proc',
				'e_lang',
				'e_name',
				'e_mess',
				'e_data'
			];

			//
			// Set document.
			//
			const doc = { type : 'error' };

			//
			// Set error parameters.
			//
			for( const prop of members )
			{
				if( theError.hasOwnProperty( prop ) )
					doc[ prop ]	= theError[ prop ];
			}

			//
			// Set exception message.
			//
			if( theException !== null )
				doc.e_exch = theException;

			//
			// Save log entry.
			//
			try
			{
				kCollection.insert( doc );
			}
			catch( error )
			{
				// Ignore.
			}
		}

	}	// writeError

}	// Log.

module.exports = Log;
