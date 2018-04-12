'use strict';

//
// Frameworks.
//
const db = require('@arangodb').db;

//
// Application.
//
const K = require( './Constants' );
const Log = require( './Log' );


/**
 * MyError
 *
 * This class implements a custom error instance that builds its message from two sources:
 * 	- the error name, that identifies the generic error type, and
 * 	- the error code, that identifies the specific error.
 *
 * 	The error name indicates WHICH error occurred, the error code indicates WHAT was
 * 	the cause of the error.
 *
 * The provided error name is an alphabetic code matching an entry in the 'errors'
 * collection and the provided error code is a numeric code matching an entry in the
 * 'messages' collection: the final error message fed to the parent constructor is the
 * concatenation of the name and code matches.
 *
 * The class features the following members:
 * 	- name:			The error name code.
 * 	- message:		The inherited message composed by concatenating the name and code
 * 					matches.
 *	- param_mess:	The error code.
 *	- param_lang:	The messages language code.
 *	- param_data:	The eventual error argument.
 *	- param_http:	The eventual HTTP error code.
 *
 * If any error occurs internally, no exception will be raised (obviously!), the error
 * will be logged. The logs, errors and messages collections are expected to exist.
 */
class MyError extends Error
{
	/**
	 * constructor
	 *
	 * The constructor expects the following parameters:
	 * 	- theName:		The error name or class, it represents the error base class
	 * 					whose specifics will be completed by the message.
	 * 	- theMessage:	If it is a string, it will represent the error message, if it
	 * 					is a number, the message will be retrieved from the messages
	 * 					collection in the provided language. This message will be
	 * 					appended to the message corresponding to the error name.
	 * 	- theLanguage:	The language in which the error message should be retrieved.
	 *	- theArgument:	A string containing the data related to the error.
	 *	- theHttpErr:	The eventual HTTP error code to be used when informing the caller.
	 *
	 * @param theName		{String}			The error name.
	 * @param theMessage	{String}|{Number}	The error message or code.
	 * @param theLanguage	{String}			The message language.
	 * @param theArgument	{String}			The error data.
	 * @param theHttpError	{Number}			The HTTP error code.
	 */
	constructor(
		theName,
		theMessage,
		theLanguage = null,
		theArgument = null,
		theHttpError = null )
	{
		//
		// Normalise data.
		//
		if( theArgument !== null )
			theArgument = theArgument.toString();
		else
			theArgument = "N/A";
		if( theLanguage === null )
			theLanguage = module.context.configuration.defaultLanguage;

		//
		// Get messages.
		//
		const mess_name = MyError.nameMessage( theName, theLanguage, theArgument );
		const mess_code = MyError.codeMessage( theMessage, theLanguage, theArgument );

		//
		// Parent constructor.
		//
		super( mess_name + mess_code );

		//
		// Save parameters.
		//
		this.name		= theName;
		this.param_mess = theMessage;
		this.param_lang = theLanguage;
		this.param_data = theArgument;
		this.param_http = theHttpError;

	}	// constructor.

	/**
	 * Get name message
	 *
	 * This method will retrieve the name message in the provided language and
	 * replace the '@arg' occurrences with the eventual 'argument' member string.
	 *
	 * If the name or language are not available, the message will be the name.
	 *
	 * @param theName		{String}	The error name.
	 * @param theLanguage	{String}	The error message language.
	 * @param theData		{String}	The error data.
	 * @returns {String}				The error message.
	 */
	static nameMessage( theName, theLanguage = null, theData = null )
	{
		//
		// Normalise data.
		//
		if( theLanguage === null )
			theLanguage = module.context.configuration.defaultLanguage;

		//
		// Init message.
		//
		let message = theName;

		//
		// Get errors collection.
		//
		const collection = db._collection( 'errors' );
		if( collection )
		{
			//
			// Retrieve message.
			//
			try
			{
				//
				// Get document.
				//
				const doc = collection.document( theName );

				//
				// Set message.
				//
				if( doc.label.hasOwnProperty( theLanguage ) )
					message = doc.label[ theLanguage ];

				//
				// Set error data.
				//
				if( theData !== null )
					message = this.replaceArguments( message, theData );
			}
			catch( error )
			{
				//
				// Log error.
				//
				const err = {};
				err.e_clas = 'MyError';
				err.e_proc = 'nameMessage';
				err.e_lang = theLanguage;
				err.e_name = 'Cannot retrieve error name';
				err.e_mess = "Unable to match name code";
				err.e_data = theName;
				err.e_exch = error;
				Log.writeError( err, error );
			}
		}
		else
		{
			const error = {};
			error.e_clas = 'MyError';
			error.e_proc = 'nameMessage';
			error.e_lang = theLanguage;
			error.e_name = 'Cannot retrieve error name';
			error.e_mess = "Missing required collection";
			error.e_data = 'errors';
			Log.writeError( error );
		}

		return message;																// ==>

	}	// nameMessage.

	/**
	 * Get code message
	 *
	 * This method will retrieve the code message in the provided language and
	 * replace the '@arg' occurrences with the eventual 'argument' member string.
	 *
	 * If the code or language are not available, the message will be 'N/A'.
	 *
	 * The code argument can either be a number, in which case it will
	 * constitute the messages collection key by prepending an 'e' to the code;
	 * if the parameter ain't a string, it will be considered the message.
	 *
	 * @param theCode		{Number}|{String}	The error code or message.
	 * @param theLanguage	{String}			The error message language.
	 * @param theData		{String}	The error data.
	 * @returns {String}						The error message.
	 */
	static codeMessage( theCode, theLanguage = null, theData = null )
	{
		//
		// Normalise data.
		//
		if( theLanguage === null )
			theLanguage = module.context.configuration.defaultLanguage;

		//
		// Init message.
		//
		let message = "N/A";

		//
		// Handle numeric message.
		//
		if( isFinite( theCode )
		 && (! isNaN( parseInt( theCode ) )) )
		{
			//
			// Get messages collection.
			//
			const collection = db._collection( 'messages' );
			if( collection )
			{
				//
				// Retrieve message.
				//
				try
				{
					//
					// Get document.
					//
					const doc = collection.document( 'e' + theCode );

					//
					// Check code.
					//
					if( doc.label.hasOwnProperty( theLanguage ) )
						message = doc.label[ theLanguage ];
				}
				catch( error )
				{
					//
					// Log error.
					//
					const err = {};
					err.e_clas = 'MyError';
					err.e_proc = 'codeMessage';
					err.e_lang = theLanguage;
					err.e_name = 'Cannot retrieve error message';
					err.e_mess = "Unable to match message code";
					err.e_data = theCode;
					err.e_exch = error;
					Log.writeError( err, error );
				}
			}
			else
			{
				const error = {};
				error.e_clas = 'MyError';
				error.e_proc = 'codeMessage';
				error.e_lang = theLanguage;
				error.e_name = 'Cannot retrieve error message';
				error.e_mess = "Missing required collection";
				error.e_data = 'messages';
				Log.writeError( error );
			}
		}

		//
		// Handle string message.
		//
		else
			message = theCode;

		//
		// Handle error data.
		//
		if( theData !== null )
			message = this.replaceArguments( message, theData );

		return message;																// ==>

	}	// codeMessage.

	/**
	 * Replace arguments in string
	 *
	 * This method will replace the placeholders found in the provided string
	 * with the provided values.
	 *
	 * The placeholders are in the format @Narg@ where N stands for an
	 * ascending numeric sequence, such as 1, 2, 3, etc.
	 *
	 * The values should be an array of replacement values corresponding to the
	 * order of the N part of the placeholder, for instance:
	 * if the string is "This @2arg@ is @1arg@." and the replacement values are
	 * [ "A", "B" ], the resulting string will be: "This B is A.".
	 *
	 * If you provide a scalar as the replacement, all occurrences of @arg@ will
	 * be replaced by the provided value.
	 *
	 * @param theString	{String}			The string to process.
	 * @param theValues	{Array}|{String}	The replacement value(s).
	 * @returns {String}					The processed string.
	 */
	static replaceArguments( theString, theValues )
	{
		//
		// Handle list of replacements.
		//
		if( Array.isArray( theValues ) )
		{
			//
			// Check placeholders.
			//
			const matched = /(@[0-9]+arg@)/g[Symbol.match](strings);
			if( matched !== null )
			{
				//
				// Get unique placeholders and sort by sequence.
				//
				const matches =
					matched.filter(
						(item, index, array) => array.indexOf(item) === index
					).sort();

				//
				// Check if placeholders and values count matches
				// and make replacements.
				//
				if( matches.length === theValues.length ) {
					theValues.forEach( (item, index) => {
						const regx = new RegExp( matches[ index ], 'g' );
						theString = theString.replace( regx, theValues[ index ] );
					});
				}
			}

			return theString;														// ==>
		}

		return theString.replace( /@arg@/g, theValues );							// ==>
	}

	/**
	 * Return name string
	 *
	 * This method will return the error name message for the current object.
	 *
	 * @returns {String}
	 */
	getNameMessage()
	{
		return MyError.nameMessage(
			this.name,
			this.param_lang,
			this.param_data
		);																			// ==>

	}	// getNameMessage

	/**
	 * Return code string
	 *
	 * This method will return the error code message for the current object.
	 *
	 * @returns {String}
	 */
	getCodeMessage()
	{
		return MyError.codeMessage(
			this.param_mess,
			this.param_lang,
			this.param_data
		);																			// ==>

	}	// getNameMessage

}	// MyError

module.exports = MyError;
