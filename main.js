'use strict';

//
// Routes.
//
module.context.use( "/init", require( './routes/init'), 'init');
module.context.use( "/session", require( './routes/session'), 'session');
module.context.use( "/schema", require( './routes/schema'), 'schema');
module.context.use( "/user", require( './routes/user'), 'user');
module.context.use( "/descriptor", require( './routes/descriptor'), 'descriptor');
module.context.use( "/study", require( './routes/study'), 'study');
module.context.use( "/utils", require( './routes/utils'), 'utils');

//
// Test routes.
//
module.context.use('/test/Log', require('./routes/test/Log'), 'testLog');
module.context.use('/test/Utils', require('./routes/test/Utils'), 'testUtils');
module.context.use('/test/Errors', require('./routes/test/MyError'), 'testErrors');
module.context.use('/test/Form', require('./routes/test/Form'), 'testForm');
module.context.use('/test/User', require('./routes/test/User'), 'testUser');
module.context.use('/test/Schema', require('./routes/test/Schema'), 'testSchema');
module.context.use('/test/Descriptor', require('./routes/test/Descriptor'),
'testDescriptor');
module.context.use('/test/Validation', require('./routes/test/Validation'),
'testValidation');
module.context.use('/test/Application', require('./routes/test/Application'),
'testApplication');

//
// Frameworks.
//
const db = require('@arangodb').db;
const time = require('@arangodb').time;
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
// Timestamps.
//
const start = time();
const stamp = Date.now();

//
// Globals.
//
const secret = Application.cookieSecret();					// Cookie secret.
const timeout = 60 * 60 * 24 * 7;							// One week.
const algo = module.context.configuration.algorythm;		// Algorythm.

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
			Application.createSessionData( theRequest );

			//
			// Init request session.
			//
			try
			{
				Application.initSessionData( theRequest );
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
			// are only written with a current session user.
			//
			if( theRequest.path === "/session/logout" )
				Log.writeEvent(
					stamp,				// Start timestamp.
					Date.now(),			// End timestamp.
					time() - start,		// Duration in milliseconds.
					theRequest,			// Request.
					theResponse			// Response.
				);

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
			// Will write only if there is a current user.
			//
			Log.writeEvent(
				stamp,				// Start timestamp.
				Date.now(),			// End timestamp.
				time() - start,		// Duration in milliseconds.
				theRequest,			// Request.
				theResponse			// Response.
			);
		}
	}
);
