'use strict';

//
// Timestamp.
//
const stamp = Date.now();

//
// Routes.
//
module.context.use('/users', require('./routes/users'), 'users');

//
// Test routes.
//
module.context.use('/test/Log', require('./routes/test/Log'), 'testLog');
module.context.use('/test/Utils', require('./routes/test/Utils'), 'testUtils');
module.context.use('/test/Errors', require('./routes/test/MyError'), 'testErrors');
module.context.use('/test/Application', require('./routes/test/Application'), 'testApplication');

//
// Frameworks.
//
const db = require('@arangodb').db;
const sessionsMiddleware = require( '@arangodb/foxx/sessions' );
const cookieTransport = require('@arangodb/foxx/sessions/transports/cookie');

//
// Application.
//
const K = require( './utils/Constants' );
const Log = require( './utils/Log' );
const MyError = require( './utils/MyError' );
const Application = require( './utils/Application' );

//
// Globals.
//
const secret = module.context.configuration.cookieSecret;	// Cookie secret.
const timeout = 60 * 60 * 24 * 7;							// One week.
const algo = 'sha256';										// Algorythm.

//
// Set sessions middleware.
// Note: you should expect a session property in the request.
//
const sessions = sessionsMiddleware({						// Middleware.
	storage	  : db._collection( 'sessions' ),				// Collection.
	transport : cookieTransport({							// Transport.
		name: 'FOXXSID',									// Name.
		ttl:  timeout,										// Timeout.
		algorithm: algo,									// Algorythm.
		secret:	   secret									// Secret.
	})
});

module.context.use( sessions );


/**
 * Main middleware
 *
 * Middleware function applied to all service calls.
 */
module.context.use(

	/**
	 * Main middleware
	 *
	 * This middleware function will initialise all required elements before calling
	 * the service handler.
	 *
	 * The whole call sequence is enclosed in a try block so that a finally may be
	 * called where the eventual exception will be logged.
	 *
	 * @param theRequest	{Object}	The request.
	 * @param theResponse	{Object}	The response.
	 * @param theHandler	{function}	The handler.
	 */
	function( theRequest, theResponse, theHandler )
	{
		//
		// Execute preliminary middleware and handler.
		//
		try
		{
			//
			// Init request session application data.
			// Note: must not fail.
			//
			Application.createRequestSessionData( theRequest );

			//
			// Init request session.
			//
			try
			{
				Application.initRequestSessionData( theRequest );
				Application.initApplicationStatus( theRequest );
			}
			catch( error )
			{
				theResponse.throw( 500, error );								// !@! ==>
			}

			//
			// Check status.
			//
			switch( theRequest.application.status.application )
			{
				case K.setting.status.app.state.ddict:
					theResponse.throw(
						500,
						new MyError(
							'NoDataDictionary',
							K.error.CannotUseApp,
							theRequest.application.language
						)
					);															// !@! ==>
					break;

				case K.setting.status.app.state.busy:
					theResponse.throw(
						503,
						new MyError(
							'ApplicationInUse',
							K.error.ApplicationBusy,
							theRequest.application.language
						)
					);															// !@! ==>
					break;

				case K.setting.status.app.state.error:
					theResponse.throw(
						500,
						new MyError(
							'ApplicationInUse',
							K.error.ApplicationError,
							theRequest.application.language
						)
					);															// !@! ==>
					break;
			}

			//
			// Handle logout.
			// Need to call it here, because logs
			// are only written against a current session user.
			//
			if( theRequest.path === "/users/logout" )
				Log.writeEvent( stamp, Date.now(), theRequest, theResponse );

			//
			// Execute handler.
			//
			theHandler();
		}

		//
		// Execute final steps.
		//
		finally
		{
			//
			// Write log entry.
			//
			Log.writeEvent( stamp, Date.now(), theRequest, theResponse );
		}
	}
);
