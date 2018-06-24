'use strict';

//
// Global.
// describe, it
//

//
// Tests.
//
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
	 * We instantiate the class by providing the test parameters and the test classes
	 * that should be an object structured as follows:
	 *
	 * 	- 'base':	This property must contain the default test class.
	 * 	- 'custom':	This property should contain the customised test class, if
	 * 				available, or be null if not.
	 *
	 * Other property names can be set and used in a custom way.
	 *
	 * @param theParameters				{Object}	The test parameters.
	 * @param theTestClasses			{Object}	The test classes.
	 */
	constructor(
		theParameters,
		theTestClasses
	)
	{
		//
		// Set parameters.
		//
		this.parameters = theParameters;
		
		//
		// Set test classes.
		//
		this.test_classes = theTestClasses;
		
		//
		// Init intermediate results collector.
		//
		this.intermediate_results = {};
		
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
	 * Get class name
	 *
	 * This method can be used to retrieve tha class name corresponding to the
	 * provided selector, the method will return the following:
	 *
	 * 	- The classes member doesn't exist: undefined.
	 * 	- The classes member is not an object: undefined.
	 * 	- The the selector is not found in member: false.
	 * 	- The selector is found but the value is not a class: null.
	 * 	- The selector is found and the value is a class: the class name.
	 *
	 * @param theSelector	{String}	Class selector.
	 * @returns {Boolean}|{null}		null bad selector, false not right, true ok.
	 */
	getClassName( theSelector )
	{
		//
		// Check selector.
		//
		if( this.hasOwnProperty( 'test_classes' ) )
		{
			//
			// Assert it is an object.
			//
			if( K.function.isObject( this.test_classes ) )
			{
				//
				// Assert selector is found.
				//
				if( this.test_classes.hasOwnProperty( theSelector ) )
				{
					//
					// Assert value is a function.
					//
					if( typeof( this.test_classes[ theSelector ] ) === 'function' )
						return this.test_classes[ theSelector ]
									.prototype.constructor.name;					// ==>
					
					return null;													// ==>
					
				}	// Has selector.
				
				return false;														// ==>
				
			}	// Member is an object.
			
		}	// Has member.
		
		return undefined;															// ==>
		
	}	// getClassName
	
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
	 * 	- clas:	The class to test.
	 * 	- parm:	The test parameter.
	 *
	 * The method expects the following parameters:
	 *
	 * 	- theGroup:	The name of the data member that holds the unit tests of that group.
	 * 	- theUnit:	The unit test method name.
	 * 	- theName:	The unit test title, used in the 'it'.
	 * 	- theClass:	The class to test in the unit.
	 * 	- theParam:	Eventual parameters for the test.
	 * 	- doNew:	A flag that if true will raise an exception if the unit exists.
	 *
	 * @param theGroup		{String}		Unit test group data member name.
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 *
	 */
	unitSet( theGroup, theUnit, theName, theClass, theParam = null, doNew = false )
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
		else if( doNew )
			throw new Error( `Group [${theGroup}] has already the unit [${theUnit}]` );
		
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
	 * 		- parm:	The test parameter.
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
	 * The unit test records are structured as follows:
	 *
	 * 	- unit:	The method name of the test, it contains an object:
	 * 		- name:	The unit test title, will be used for the 'describe'.
	 * 		- clas:	The class to test.
	 * 		- parm:	The test parameter.
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
	 * INSTANTIATION TEST ROUTINE DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Validate unit test record
	 *
	 * This method can be used to validate the contents of a unit test record, it will
	 * assert that the record has all the required elements and that the unit test tag
	 * is a method of the current object.
	 *
	 * Call this method within an it block.
	 *
	 * @param theRecords	{Object}	Unit test records.
	 * @param theUnitMethod	{String}	Unit test method name.
	 */
	testUnit( theRecords, theUnitMethod )
	{
		//
		// Init local storage.
		//
		let message =  `Unit test [${theUnitMethod}]`;
		let action;
		
		//
		// Validate unit test method.
		//
		action = `Test function`;
		expect( this, `${message} - ${action}` ).to.have.property( theUnitMethod );
		expect( this[ theUnitMethod ], `${message} - ${action}` ).to.be.a.function;
		
		//
		// Validate unit test record.
		//
		action = `Test record`;
		expect( theRecords, `${message} - ${action}` ).to.be.object;
		expect( theRecords, `${message} - ${action}` ).to.have.property( theUnitMethod );
		expect( theRecords[ theUnitMethod ], `${message} - ${action}` ).to.be.object;
		expect( theRecords[ theUnitMethod ], `${message} - ${action}` ).to.have.property( 'name' );
		expect( theRecords[ theUnitMethod ], `${message} - ${action}` ).to.have.property( 'clas' );
		expect( theRecords[ theUnitMethod ], `${message} - ${action}` ).to.have.property( 'parm' );
		
	}	// testUnit
	
	
	/****************************************************************************
	 * MEMBER GETTERS															*
	 ****************************************************************************/
	
	/**
	 * Return current request.
	 *
	 * @return {Object}
	 */
	get request()				{	return this.parameters.request;	}
	
	/**
	 * Return current class name.
	 *
	 * @return {String}
	 */
	get currentClass()			{	return this.parameters.class;	}
	
	/**
	 * Return default edge collection.
	 *
	 * @return {String}
	 */
	get edgeCollection()		{	return this.parameters.collection_edge;	}
	
	/**
	 * Return default document collection.
	 *
	 * @return {String}
	 */
	get documentCollection()	{	return this.parameters.collection_document;	}
	
	/**
	 * Return example document _id.
	 *
	 * @return {String}
	 */
	get exampleId()				{	return this.parameters.example_id;	}
	
	/**
	 * Return example document collection.
	 *
	 * @return {String}
	 */
	get exampleCollection()		{	return this.parameters.example_collection;	}
	
	/**
	 * Return other document _id.
	 *
	 * @return {String}
	 */
	get otherId()				{	return this.parameters.other_id;	}
	
	/**
	 * Return default other collection.
	 *
	 * @return {String}
	 */
	get otherCollection()	{	return this.parameters.other_collection;	}
	
	/**
	 * Return test classes.
	 *
	 * @return {Object}
	 */
	get testClasses()			{	return this.test_classes;	}
	
	
	/****************************************************************************
	 * STATIC GROUP TEST MODULES EXECUTION										*
	 ****************************************************************************/
	
	/**
	 * Run unit test group
	 *
	 * This method can be used to run the set of unit tests belonging to a group, the
	 * method must be called statically by providing the unit test object and the
	 * prefix of the unit tests records getter method.
	 *
	 * The method must be called within a describe block and will only run it blocks.
	 * It will first assert that a group unit test records getter method exists with
	 * the provided prefix, if that is not the case, it will raise an error and stop.
	 * It will then iterate through each of the group's unit tests and first assert
	 * the record has all the required elements, if that is not the case it will raise
	 * an error, if the element is valid, it will run the tests of that section.
	 *
	 * @param theUnitTest		{Object}	The unit tests instance.
	 * @param theGroupPrefix	{String}	The unit test records getter prefix.
	 */
	static unitTestRun( theUnitTest, theGroupPrefix )
	{
		//
		// Init local storage.
		//
		let message;
		const getter = `${theGroupPrefix}UnitGet`;
		
		//
		// Check getter method.
		//
		it( "Unit test group environment", function ()
		{
			//
			// Check unit test getter.
			//
			message = `Getter method [${getter}]`;
			expect( theUnitTest, message ).to.have.property( getter );
			expect( theUnitTest[ getter ], message ).to.be.a.function;
		});
		
		//
		// Check unit tests queue.
		//
		it( "Unit test queue", function ()
		{
			//
			// Check unit tests queue.
			//
			message = `Getter queue [${getter}]`;
			expect( theUnitTest[ getter ](), message ).to.be.an.object;
			// expect( theUnitTest[ getter ](), message ).not.to.be.empty;
		});
		
		//
		// Run tests.
		//
		const tests = theUnitTest[ getter ]();
		for( const item in tests )
		{
			//
			// Set parameters.
			//
			const title = tests[ item ].name;
			const test_class = tests[ item ].clas;
			const test_param = tests[ item ].parm;
			
			//
			// Run unit test.
			//
			it( title, function () {
				theUnitTest.testUnit( tests,  item );
				theUnitTest[ item ]( test_class, test_param );
			});
		}
		
	}	// unitTestRun
	
}	// UnitTest.

/**
 * Module exports
 */
module.exports = UnitTest;
