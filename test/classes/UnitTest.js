'use strict';

//
// Global.
// describe, it
//

//
// Tests.
//
const should = require('chai').should();
const expect = require('chai').expect;

//
// Application.
//
const K = require( '../../utils/Constants' );


/**
 * Document test class
 *
 * This class defines the classes used in tests and implements common test patterns.
 */
class UnitTest
{
	/**
	 * Constructor
	 *
	 * We instantiate the class by providing the example references, the default edge
	 * and document collections, and the compatible collection.
	 *
	 * @param theRequest				{Object}	The current request.
	 * @param theExampleId				{String}	The example document _id.
	 * @param theExampleCollection		{String}	The example document collection.
	 * @param theEdgeCollection			{String}	The default edge collection.
	 * @param theDocumentCollection		{String}	The default document collection.
	 * @param theCompatibleCollection	{String}	The compatible collection.
	 */
	constructor(
		theRequest,
		theExampleId,
		theExampleCollection,
		theEdgeCollection,
		theDocumentCollection,
		theCompatibleCollection
	)
	{
		//
		// Set data members.
		//
		this.current_request = theRequest;
		
		this.edge_collection = theEdgeCollection;
		this.document_collection = theDocumentCollection;
		
		this.example_id = theExampleId;
		this.example_collection = theExampleCollection;
		
		this.compatible_collection = theCompatibleCollection;
		
		//
		// Set instantiation test queue.
		//
		this.unitsInit();
		
	}	// constructor
	
	
	/****************************************************************************
	 * GROUP TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define unit tests
	 *
	 * This method should initialise all unit tests, derived concrete classes must
	 * implement this method by loading each unit test group. Each group contains an
	 * object that defines all the unit tests of the group, the object property names
	 * are the unit test method name and their value is an object structured as follows:
	 *
	 * 	- name:	The test title used in the 'describe'.
	 * 	- clas:	The class to be used in the tests.
	 * 	- parm: Eventual parameters to pass to the unit test method.
	 *
	 * Derived classes should implement a set of methods, named XXXUnitsInit where the
	 * XXX indicates the group, these methods should initialise the unit test records
	 * that can be executed for each group.
	 *
	 * This class is abstract, so this method will do nothing.
	 */
	unitsInit()
	{
		// Do nothing.
		
	}	// unitsInit
	
	
	/****************************************************************************
	 * VALIDATION UTILITIES														*
	 ****************************************************************************/
	
	/**
	 * Compare values
	 *
	 * This method can be used to compare values, it will assert that the destination
	 * has the value and that it is equal to the source value.
	 *
	 * The method can be invoked also with two objects, in that case it will recurse
	 * with all properties.
	 *
	 * @param theSource			{*}|{Object}	Scalar or object.
	 * @param theDestination	{*}|{Object}	Scalar or object.
	 * @param theMessage		{String}		Main error message.
	 * @param theAction			{String}		Secondary error message.
	 */
	compareValues(
		theSource,			// The provided value or object values.
		theDestination,		// The existing value.
		theMessage,			// The main error message.
		theAction			// The secondary error message.
	)
	{
		//
		// Handle objects.
		//
		if( K.function.isObject( theSource ) )
		{
			//
			// Iterate members.
			//
			for( const member in theSource )
			{
				//
				// Check if there.
				//
				expect(
					theDestination,
					`${theMessage} - Field [${field}] - Has property [${member}]`
				).to.have.property(member);
				
				//
				// Check contents.
				//
				compareContents(
					theSource[ member ],
					theDestination[ member ],
					theMessage,
					`Field [${field}] - With property [${member}]`
				);
			}
		}
		
		//
		// Handle other types.
		//
		else
		{
			//
			// Handle arrays.
			//
			if( Array.isArray( theSource ) )
				expect( theDestination, `${theMessage} - ${theAction}` )
					.to.have.members( theSource );
			
			//
			// Handle scalars.
			//
			else
				expect( theDestination, `${theMessage} - ${theAction}` ).to.equal( theSource );
		}
		
	}	// compareContents
	
	
	/****************************************************************************
	 * TEST UNIT SUITES LOCAL INTERFACE											*
	 ****************************************************************************/
	
	/**
	 * Set unit test.
	 *
	 * This method can be used to set a unit test record, these records are stored as
	 * an object whose properties represent the method name of the unit test and their
	 * value is an object structured as follows:
	 *
	 * 	- name:	The unit test title, will be used for the 'describe'.
	 * 	- clas:	The class to test, if omitted, the default TestClass will be set.
	 *
	 * The method expects the following parameters:
	 *
	 * 	- theGroup:	The name of the data member that holds the unit tests of that group.
	 * 	- theUnit:	The unit test method name.
	 * 	- theName:	The unit test title, used in the 'it'.
	 * 	- theClass:	The class to test in the unit.
	 *
	 * @param theGroup		{String}		Unit test group data member name.
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 */
	unitSet( theGroup, theUnit, theName, theClass, theParam = null )
	{
		//
		// Init data member.
		//
		if( ! this.hasOwnProperty( theGroup ) )
			this[ theGroup ] = {};
		
		//
		// Init record.
		//
		if( ! this[ theGroup ].hasOwnProperty( theUnit ) )
			this[ theGroup ][ theUnit ] = {};
		
		//
		// Load record.
		//
		this[ theGroup ][ theUnit ].name = theName;
		this[ theGroup ][ theUnit ].clas = theClass;
		this[ theGroup ][ theUnit ].parm = theParam;
		
	}	// unitSet
	
	/**
	 * Get unit test(s).
	 *
	 * This method can be used to retrieve the unit tests, provide a string to
	 * retrieve the unit test record corresponding to the string, or provide null or
	 * omit the parameter to retrieve all the instantiation tests.
	 *
	 * The instantiation unit test records are structured as follors:
	 *
	 * 	- unit:	The method name of the test, it contains an object:
	 * 		- name:	The unit test title, will be used for the 'describe'.
	 * 		- clas:	The class to test.
	 *
	 * If you provide a string, the method will return the matching unit object which
	 * contains the name and class; if you omit the parameter, the method will return
	 * all unit tests.
	 *
	 * If the current object does not have the unit tests data member, the method will
	 * return false; if the provided string doesn't match any unit test, the method
	 * will return null.
	 *
	 * The method expects the following parameters:
	 *
	 * 	- theGroup:	The name of the data member that holds the unit tests of that group.
	 * 	- theUnit:	The unit test method name.
	 *
	 * Note that the returned objects are not sealed, so modify them at your own risk.
	 *
	 * @param theGroup		{String}		Unit test group data member name.
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	unitGet( theGroup, theUnit = null )
	{
		//
		// Check data member.
		//
		if( ! this.hasOwnProperty( theGroup ) )
			return false;															// ==>
		
		//
		// Return all unit tests.
		//
		if( theUnit === null )
			return this[ theGroup ];												// ==>
		
		//
		// Handle unit record.
		//
		if( this[ theGroup ].hasOwnProperty( theUnit ) )
			return this[ theGroup ][ theUnit ];										// ==>
		
		return null;																// ==>
		
	}	// unitGet
	
	/**
	 * Delete unit test(s).
	 *
	 * This method can be used to remove the instantiation unit matching the provided
	 * string, the method will return the following values:
	 *
	 * 	- false:	If the current object does not have the instantiation unit test
	 * 				records data member.
	 * 	- null:		If the provided string doesn't match any record.
	 * 	- object:	The deleted record(s) if matched.
	 *
	 * If you omit the parameter, or pass null, the method will delete all the
	 * records, but keep the data member: be careful when calling this method.
	 *
	 * The unit test records are structured as follors:
	 *
	 * 	- unit:	The method name of the test, it contains an object:
	 * 		- name:	The unit test title, will be used for the 'describe'.
	 * 		- clas:	The class to test.
	 *
	 * The method expects the following parameters:
	 *
	 * 	- theGroup:	The name of the data member that holds the unit tests of that group.
	 * 	- theUnit:	The unit test method name.
	 *
	 * @param theGroup		{String}		Unit test group data member name.
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	unitDel( theGroup, theUnit = null )
	{
		//
		// Check data member.
		//
		if( ! this.hasOwnProperty( theGroup ) )
			return false;															// ==>
		
		//
		// Delete all unit tests.
		//
		if( theUnit === null )
		{
			//
			// Clone records.
			//
			const clone = K.function.clone(this[ theGroup ]);
			
			//
			// Delete records.
			//
			this[ theGroup ] = [];
			
			return clone;															// ==>
		}
		
		//
		// Handle unit record.
		//
		if( this[ theGroup ].hasOwnProperty( theUnit ) )
		{
			//
			// Clone record.
			//
			const clone = K.function.clone(this[ theGroup ][theUnit]);
			
			//
			// Delete records.
			//
			delete this[ theGroup ][theUnit];
			
			return clone;															// ==>
		}
		
		return null;																// ==>
		
	}	// unitDel
	
	
	/****************************************************************************
	 * MEMBER GETTERS															*
	 ****************************************************************************/
	
	/**
	 * Return current request.
	 *
	 * @return {Object}
	 */
	get request()				{	return this.current_request;	}
	
	/**
	 * Return default edge collection.
	 *
	 * @return {String}
	 */
	get edgeCollection()		{	return this.edge_collection;	}
	
	/**
	 * Return default document collection.
	 *
	 * @return {String}
	 */
	get documentCollection()	{	return this.document_collection;	}
	
	/**
	 * Return default compatible collection.
	 *
	 * @return {String}
	 */
	get compatibleCollection()	{	return this.compatible_collection;	}
	
	/**
	 * Return example document _id.
	 *
	 * @return {String}
	 */
	get exampleId()				{	return this.example_id;	}
	
	/**
	 * Return example document collection.
	 *
	 * @return {String}
	 */
	get exampleCollection()		{	return this.example_collection;	}
	
}	// UnitTest.

/**
 * Module exports
 */
module.exports = UnitTest;