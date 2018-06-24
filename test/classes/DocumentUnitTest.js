'use strict';

//
// Global.
// describe, it
//

//
// Frameworks.
//
const db = require('@arangodb').db;

//
// Tests.
//
const expect = require('chai').expect;

//
// Application.
//
const K = require( '../../utils/Constants' );
const Dict = require( '../../dictionary/Dict' );
const MyError = require( '../../utils/MyError' );

//
// Parent class.
//
const UnitTest = require( './UnitTest' );


/**
 * Document test class
 *
 * This class defines the classes used in tests and implements common test patterns.
 */
class DocumentUnitTest extends UnitTest
{
	/****************************************************************************
	 * GROUP TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define unit tests
	 *
	 * We overload this method to load the Document unit test groups.
	 *
	 * Be aware that if the tests do not run, it may be because you are setting twice
	 * the same unit test: replace tests only in derived classes.
	 */
	unitsInit()
	{
		//
		// Call parent method.
		//
		super.unitsInit();
		
		//
		// Instantiation tests.
		//
		this.unitsInitInstantiation();
		
		//
		// Contents tests.
		//
		this.unitsInitContent();
		
		//
		// Insert tests.
		//
		this.unitsInitInsert();
		
		//
		// Resolve tests.
		//
		this.unitsInitResolve();
		
		//
		// Replace tests.
		//
		this.unitsInitReplace();
		
		//
		// Remove tests.
		//
		this.unitsInitRemove();
		
		//
		// Custom tests.
		//
		this.unitsInitCustom();
		
		//
		// Static tests.
		//
		this.unitsInitStatic();
		
	}	// unitsInit
	
	
	/****************************************************************************
	 * DEFAULT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Define instantiation tests
	 *
	 * This method will load the instantiation tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate instantiating the object in different ways and
	 * environments, particularily, it will do the following checks:
	 *
	 * 	- Instantiate class without selector and without collection.
	 * 	- Instantiate with null selector and without collection.
	 * 	- Instantiate with null selector and non existant collection.
	 * 	- Instantiate with default collection.
	 * 	- Instantiate with existing edge collection.
	 * 	- Instantiate with existing document collection.
	 * 	- Instantiate mutable/immutable document.
	 * 	- Instantiate with cross-collection reference.
	 * 	- Instantiate with invalid _id reference.
	 * 	- Instantiate with not found _id reference.
	 * 	- Instantiate with found reference.
	 * 	- Instantiate with content.
	 */
	unitsInitInstantiation()
	{
		//
		// Instantiate class without selector and without collection.
		// Assert it fails.
		//
		this.instantiationUnitSet(
			'instantiateNoSelectorNoCollection',
			"Instantiate class without selector and without collection",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate with null selector and without collection.
		// Assert it fails if class does not feature default collection.
		//
		this.instantiationUnitSet(
			'instantiateNullSelectorNoCollection',
			"Instantiate with null selector and without collection:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate with null selector and non existant collection.
		// Assert it fails.
		//
		this.instantiationUnitSet(
			'instantiateNullSelectorMissingCollection',
			"Instantiate with null selector and non existant collection:",
			this.test_classes.base,
			'test',
			true
		);
		
		//
		// Instantiate with default collection.
		// Assert that it succeeds.
		//
		this.instantiationUnitSet(
			'instantiateDefaultCollection',
			"Instantiate with default collection:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate with existing edge collection.
		// Assert that it succeeds for edge collection classes.
		//
		this.instantiationUnitSet(
			'instantiateEdgeCollection',
			"Instantiate with existing edge collection:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate with existing document collection.
		// Assert that it succeeds for document collection classes.
		//
		this.instantiationUnitSet(
			'instantiateDocumentCollection',
			"Instantiate with existing document collection:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate mutable/immutable document.
		// Assert that an immutable document is only returned when instantiating from a
		// reference, in all other cases a mutable document is returned.
		//
		this.instantiationUnitSet(
			'instantiateMutableImmutableDocument',
			"Instantiate mutable/immutable document:",
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Instantiate with cross-collection reference.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateCrossCollectionReference',
			"Instantiate with cross-collection reference:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate with invalid _id reference.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateInvalidReferenceId',
			"Instantiate with invalid _id reference:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate with not found _id reference.
		// Assert that it fails.
		//
		this.instantiationUnitSet(
			'instantiateNotFoundIdReference',
			"Instantiate with not found reference:",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Instantiate with found reference.
		// Assert that it succeeds.
		//
		this.instantiationUnitSet(
			'instantiateFoundReference',
			"Instantiate with found reference:",
			this.test_classes.base,
			this.parameters.sample,
			true
		);
		
		//
		// Instantiate with content.
		// Assert that it succeeds.
		//
		this.instantiationUnitSet(
			'instantiateWithContent',
			"Instantiate with content:",
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
	}	// unitsInitInstantiation
	
	/**
	 * Define contents tests
	 *
	 * This method will load the contents tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving udating the object
	 * contents, it will do the following checks:
	 *
	 * 	- Load contents in empty object.
	 * 	- Load filled non persistent object.
	 * 	- Load persistent object.
	 */
	unitsInitContent()
	{
		//
		// Load empty object.
		// Assert that all field types are copied, except for restricted fields.
		//
		this.contentsUnitSet(
			'contentsLoadEmptyObject',
			"Load contents in empty object",
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Load filled and non persistent object.
		// Assert that modifying the contents of a filled non persistent object works as
		// follows:
		//	- Restricted fields are not copied.
		//	- Modifying locked fields will is allowed.
		//	- All other fields are copied.
		//
		this.contentsUnitSet(
			'contentsLoadFilledObject',
			"Load filled non persistent object:",
			this.test_classes.base,
			{ base: this.parameters.content, replace: this.parameters.replace },
			true
		);
		
		//
		// Load persistent object.
		// Assert that modifying the contents of a persistent object works as follows:
		//	- Restricted fields are not copied.
		//	- Modifying locked fields will raise an exception.
		//	- All other fields are copied.
		//
		this.contentsUnitSet(
			'contentsLoadPersistentObject',
			"Load persistent object:",
			this.test_classes.base,
			{ base: this.parameters.content, replace: this.parameters.replace },
			true
		);
		
	}	// unitsInitContent
	
	/**
	 * Define insert tests
	 *
	 * This method will load the insert tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving inserting the object,
	 * it will do the following checks:
	 *
	 * 	- Insert empty object.
	 * 	- Insert object without required fields.
	 * 	- Insert object without significant fields.
	 * 	- Insert object with content.
	 * 	- Insert duplicate object.
	 * 	- Insert object with same content.
	 * 	- Insert persistent object.
	 * 	- Insert without persist.
	 */
	unitsInitInsert()
	{
		//
		// Insert empty object.
		// Assert that inserting an empty object succeeds if it has no required fields.
		//
		this.insertUnitSet(
			'insertEmptyObject',
			"Insert empty object",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Insert object without required fields.
		// Assert that inserting an object without required fields fails.
		//
		this.insertUnitSet(
			'insertWithoutRequiredFields',
			"Insert object without required fields",
			this.test_classes.base,
			{
				contents: this.parameters.content,
				excluded: null
			},
			true
		);
		
		//
		// Insert object without significant fields.
		// Assert that inserting a document without significant fields succeeds.
		//
		this.insertUnitSet(
			'insertWithoutSignificantFields',
			"Insert object without significant fields",
			this.test_classes.base,
			{
				contents: this.parameters.content,
				excluded: null
			},
			true
		);
		
		//
		// Insert object with content.
		// Assert that inserting a document having contents will succeed.
		//
		this.insertUnitSet(
			'insertWithContent',
			"Insert object with content",
			this.test_classes.base,
			{
				contents: this.parameters.content,
				excluded: null
			},
			true
		);
		
		//
		// Insert duplicate object.
		// Assert that inserting a duplicate document will fail.
		//
		this.insertUnitSet(
			'insertDuplicate',
			"Insert duplicate object",
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Insert object with same content.
		// Assert that if _key is not required, inserting an object with same contents
		// as an existing one will not fail, because the database will assign a
		// different key.
		//
		this.insertUnitSet(
			'insertWithSameContent',
			"Insert object with same content",
			this.test_classes.base,
			{
				contents: this.parameters.content,
				excluded: null
			},
			true
		);

		//
		// Insert persistent object.
		// Assert that inserting a persistent document fails.
		//
		this.insertUnitSet(
			'insertPersistentObject',
			"Insert persistent object",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Insert without persist.
		// Assert that inserting a document with the persist flag off, succeeds, if
		// all validations pass and that the document is not actually saved in the
		// collection.
		//
		this.insertUnitSet(
			'insertWithoutPersist',
			"Insert without persist",
			this.test_classes.base,
			this.parameters.replace,
			true
		);
	
	}	// unitsInitInsert
	
	/**
	 * Define resolve tests
	 *
	 * This method will load the resolve tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving resolving the object,
	 * it will do the following checks:
	 *
	 * 	- Resolve persistent document.
	 * 	- Resolve ambiguous document.
	 * 	- Resolve null reference.
	 * 	- Resolve significant fields.
	 * 	- Resolve reference fields.
	 * 	- Resolve without raising.
	 * 	- Resolve changed locked fields.
	 * 	- Resolve changed significant fields.
	 * 	- Resolve changed required fields.
	 * 	- Resolve changed unique fields.
	 * 	- Resolve changed local fields.
	 * 	- Resolve changed standard fields.
	 */
	unitsInitResolve()
	{
		let tmp;
		
		//
		// Resolve persistent document.
		// Assert that resolving an existing unique document succeeds.
		//
		this.resolveUnitSet(
			'resolvePersistent',
			"Resolve persistent document",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Resolve ambiguous object.
		// Assert that resolving a document with more than one match will raise an
		// exception.
		//
		tmp = {};
		tmp[ Dict.descriptor.kNID ] = 'terms/:id';
		tmp[ Dict.descriptor.kLID ] = 'LID';
		this.resolveUnitSet(
			'resolveAmbiguousObject',
			"Resolve ambiguous document",
			this.test_classes.base,
			tmp,
			true
		);
		
		//
		// Resolve null reference.
		// Assert that resolving a document with no content will raise an exception.
		//
		this.resolveUnitSet(
			'resolveNullReference',
			"Resolve null reference",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Resolve significant fields.
		// This test will assert that if the document has significant fields, these
		// will be required when resolving; if the document has no significant fields,
		// the document will be resolved using all its current contents.
		//
		// The provided elements are as follows:
		//	- noSig:		Has all significant fields missing.
		//	- sigOne:		Has one significant field missing.
		//	- sigFind:		Has all significant fields.
		//	- sigAmbig:		Should result in an ambiguous document.
		//	- sigNoFind:	Should not match any document.
		//
		// Properties 'replace' and 'sigFind' must be there.
		//
		tmp = {
			noSig: {},
			sigOne: {},
			sigFind: {},
			sigAmbig: {},
			sigNoFind: {}
		};
		
		tmp.noSig[ Dict.descriptor.kName ] = 'NAME FILLED';
		
		tmp.sigOne[ Dict.descriptor.kLID ] = 'LID_FILLED';
		
		tmp.sigFind[ Dict.descriptor.kNID ] = 'terms/:id';
		tmp.sigFind[ Dict.descriptor.kLID ] = 'LID_FILLED';
		
		tmp.sigAmbig[ Dict.descriptor.kNID ] = 'terms/:id';
		tmp.sigAmbig[ Dict.descriptor.kLID ] = 'LID';
		
		tmp.sigNoFind[ Dict.descriptor.kNID ] = 'UNKNOWN';
		tmp.sigNoFind[ Dict.descriptor.kLID ] = 'LID';
		
		this.resolveUnitSet(
			'resolveSignificantField',
			"Resolve significant field",
			this.test_classes.base,
			{
				replace: this.parameters.replace,
				noSig: tmp.noSig,
				sigFind: tmp.sigFind,
				sigOne: tmp.sigOne,
				sigAmbig: tmp.sigAmbig,
				sigNoFind: tmp.sigNoFind
			},
			true
		);
		
		//
		// Resolve reference fields.
		// The test will assert that, when resolving a document, if the selector
		// contains a reference, this will take precedence over significant field
		// combunations.
		//
		tmp = {};
		tmp[ Dict.descriptor.kNID ] = 'BAD_NID';
		tmp[ Dict.descriptor.kLID ] = 'BAD_LID';
		this.resolveUnitSet(
			'resolveReferenceField',
			"Resolve reference fields",
			this.test_classes.base,
			tmp,
			true
		);
		
		//
		// Resolve without raising.
		// This test will assert that setting the doRaise flag to off prevents exceptions
		// from being raised only in case the document was not found.
		//
		// The provided elements are as follows:
		//	- correct:		Should succeed.
		//	- duplicate:	Should result in an duplicate resolve.
		//	- incorrect:	SHould result in a not found resolve.
		//
		// Property 'correct' and 'incorrect' must be there.
		//
		tmp = { correct: {}, duplicate: {}, incorrect: {} };
		tmp.correct[ Dict.descriptor.kNID ] = 'terms/:id';
		tmp.correct[ Dict.descriptor.kLID ] = 'LID_FILLED';
		tmp.duplicate[ Dict.descriptor.kNID ] = 'terms/:id';
		tmp.duplicate[ Dict.descriptor.kLID ] = 'LID';
		tmp.incorrect[ Dict.descriptor.kNID ] = 'UNKNOWN';
		tmp.incorrect[ Dict.descriptor.kLID ] = 'UNKNOWN';
		this.resolveUnitSet(
			'resolveNoException',
			"Resolve without raising",
			this.test_classes.base,
			tmp,
			true
		);
		
		//
		// Resolve changed locked fields.
		// This test asserts that if a persistent object is resolved after a locked
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeLockedField',
			"Resolve changed locked fields",
			this.test_classes.base,
			"I_CHANGED_IT",
			true
		);
		
		//
		// Resolve changed significant fields.
		// This test asserts that if a persistent object is resolved after a significant
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeSignificantField',
			"Resolve changed significant fields",
			this.test_classes.base,
			"I_CHANGED_IT",
			true
		);
		
		//
		// Resolve changed required fields.
		// This test asserts that if a persistent object is resolved after a required
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeRequiredField',
			"Resolve changed required fields",
			this.test_classes.base,
			"I_CHANGED_IT",
			true
		);
		
		//
		// Resolve changed unique fields.
		// This test asserts that if a persistent object is resolved after a unique
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeUniqueField',
			"Resolve changed required fields",
			this.test_classes.base,
			"I_CHANGED_IT",
			true
		);
		
		//
		// Resolve changed local fields.
		// This test asserts that if a persistent object is resolved after a local
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeLocalField',
			"Resolve changed local fields",
			this.test_classes.base,
			"I_CHANGED_IT",
			true
		);
		
		//
		// Resolve changed standard fields.
		// This test asserts that if a persistent object is resolved after a standard
		// field is changed in the background, will result in the field not being
		// replaced, and that if there is a revision change the resolve will fail.
		//
		this.resolveUnitSet(
			'resolveChangeStandardField',
			"Resolve changed standard fields",
			this.test_classes.base,
			"I_CHANGED_IT",
			true
		);
	
	}	// unitsInitResolve
	
	/**
	 * Define replace tests
	 *
	 * This method will load the replace tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving resolving the object,
	 * it will do the following checks:
	 *
	 * 	- Replace non persistent document.
	 * 	- Replace non existing document.
	 * 	- Replace persistent values.
	 * 	- Replace content values.
	 */
	unitsInitReplace()
	{
		//
		// Replace non persistent document.
		// Assert that replacing a non persistent document fails.
		//
		this.replaceUnitSet(
			'replaceNonPersistent',
			"Replace non persistent document",
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Replace non existing document.
		// Assert that replacing a non existing document fails.
		//
		this.replaceUnitSet(
			'replaceNonExisting',
			"Replace non existing document",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Replace persistent values.
		// Assert that replacing a document whose persistent locked field value is
		// different raises an exception, in all other cases assert it succeeds.
		//
		this.replaceUnitSet(
			'replacePersistentValue',
			"Replace persistent values",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Replace content values.
		// Assert that changing locked values and deleting required values in the
		// document content, not using the setDocumentProperties(), then replacing the
		// document will catch errors.
		//
		this.replaceUnitSet(
			'replaceContentValue',
			"Replace content values",
			this.test_classes.base,
			null,
			true
		);
		
	}	// unitsInitReplace
	
	/**
	 * Define remove tests
	 *
	 * This method will load the remove tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving removing the object,
	 * it will do the following checks:
	 *
	 * 	- Remove document.
	 * 	- Remove non persistent document.
	 * 	- Remove non existing document.
	 * 	- Remove constrained document.
	 */
	unitsInitRemove()
	{
		//
		// Remove document.
		// Assert that removing a document succeeds.
		//
		this.removeUnitSet(
			'removeDocument',
			"Remove document",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Remove non persistent document.
		// Assert that removing a non persistent document fails.
		//
		this.removeUnitSet(
			'removeNonPersistent',
			"Remove non persistent document",
			this.test_classes.base,
			this.parameters.content,
			true
		);
		
		//
		// Remove non existing document.
		// Assert that removing a non existing document fails.
		//
		this.removeUnitSet(
			'removeNonExisting',
			"Remove non existing document",
			this.test_classes.base,
			null,
			true
		);
		
		//
		// Remove constrained document.
		// Assert that removing a constrained document fails.
		//
		this.removeUnitSet(
			'removeConstrained',
			"Remove constrained document",
			this.test_classes.base,
			null,
			true
		);
		
	}	// unitsInitRemove
	
	/**
	 * Define custom tests
	 *
	 * This method will load the custom tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all operations involving custom object
	 * operations.
	 *
	 * By default there are no custom operations.
	 */
	unitsInitCustom()
	{
		//
		// No custom operations.
		//
		
	}	// unitsInitCustom
	
	/**
	 * Define static tests
	 *
	 * This method will load the static tests queue with the desired test
	 * records, each record has a property:
	 *
	 * 	- The name of the method that runs all the 'it' tests, whose value is an
	 * 	  object structured as follows:
	 * 		- name:	The test title used in the 'describe'.
	 * 		- clas:	The class to be used in the tests.
	 * 		- parm:	The eventual parameters for the test.
	 *
	 * This set of tests will validate all static methods of the object,
	 * it will do the following checks:
	 *
	 * 	- Check edge collection.
	 */
	unitsInitStatic()
	{
		//
		// Check edge collection.
		// Assert that it fails on document collection and succeeds on edge collection.
		//
		this.staticUnitSet(
			'staticEdgeCollection',
			"Check edge collection",
			this.test_classes.base,
			{
				edge: this.parameters.collection_edge,
				document: this.parameters.collection_document,
				request: this.request
			},
			true
		);
		
		//
		// Check document collection.
		// Assert that it fails on edge collection and succeeds on document collection.
		//
		this.staticUnitSet(
			'staticDocumentCollection',
			"Check document collection",
			this.test_classes.base,
			{
				edge: this.parameters.collection_edge,
				document: this.parameters.collection_document,
				request: this.request
			},
			true
		);
		
	}	// unitsInitStatic
	
	
	/****************************************************************************
	 * INSTANTIATION TEST MODULES DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Instantiate class without selector and without collection
	 *
	 * Assert instantiating the class without the reference and collection.
	 *
	 * Should fail with base class and succeed with custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateNoSelectorNoCollection( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		this.testInstantiateNoSelectorNoCollection(
			this.test_classes.base, theParam );
		
		//
		// Should succeed, because the custom class implements default collection.
		//
		if( this.test_classes.custom )
			this.testInstantiateNoSelectorNoCollection(
				this.test_classes.custom, theParam );
		
	}	// instantiateNoSelectorNoCollection
	
	/**
	 * Instantiate with null selector and without collection.
	 *
	 * Assert instantiating the class with null reference and no collection.
	 *
	 * Should fail with base class and succeed with custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateNullSelectorNoCollection( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		this.testInstantiateNullSelectorNoCollection(
			this.test_classes.base, theParam );
		
		//
		// Should succeed with custom class: it implements the default collection.
		//
		if( this.test_classes.custom )
			this.testInstantiateNullSelectorNoCollection(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateNullSelectorNoCollection
	
	/**
	 * Instantiate with null selector and non existant collection.
	 *
	 * Assert that instantiating the class with null reference and a non existing
	 * collection parameters raises an exception.
	 *
	 * Should fail with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateNullSelectorMissingCollection( theClass, theParam = null )
	{
		//
		// Remove test collection.
		//
		const collection = db._collection( theParam );
		if( collection )
			db._drop( test_collection );
		
		//
		// Should fail.
		//
		this.testInstantiateNullSelectorMissingCollection(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateNullSelectorMissingCollection(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateNullSelectorMissingCollection
	
	/**
	 * Instantiate with default collection.
	 *
	 * In this class we test both the base class, that should raise an exception, and
	 * the custom class that should not: we use routines to perform these tests.
	 *
	 * In derived classes that do not declare a custom class you must overload this
	 * method.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateDefaultCollection( theClass, theParam = null )
	{
		//
		// Test class without default collection.
		//
		this.testDefaultCollection(
			this.test_classes.base, theParam );
		
		//
		// Test class with default collection.
		//
		if( this.test_classes.custom )
			this.testDefaultCollection(
				this.test_classes.custom, theParam );
		
	}	// instantiateDefaultCollection
	
	/**
	 * Instantiate with existing edge collection.
	 *
	 * For the base class it will succeed, for custom class it will raise an
	 * exception, because it implements a default document collection.
	 *
	 * In derived classes you should overload this method if the class expects
	 * collections of a specific type.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateEdgeCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateEdgeSucceed(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateEdgeFail(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateEdgeCollection
	
	/**
	 * Instantiate with existing document collection.
	 *
	 * The base class accepts both types, the custom class implements a document
	 * default collection, so both classes should succeed.
	 *
	 * In derived classes you should overload this method if the class expects
	 * collections of a specific type.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	instantiateDocumentCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateDocumentSucceed(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInstantiateDocumentSucceed(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateDocumentCollection
	
	/**
	 * Instantiate mutable/immutable document.
	 *
	 * Assert that the document data is immutable only when instantiated from an
	 * existing reference.
	 *
	 * This method expects both parameters to be provided.
	 *
	 * Should succeed for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateMutableImmutableDocument( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateMutableImmutable(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInstantiateMutableImmutable(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateMutableImmutableDocument
	
	/**
	 * Instantiate with invalid _id reference.
	 *
	 * Assert that the provided _id reference is valid.
	 *
	 * Should fail for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateInvalidReferenceId( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testInstantiateInvalidId(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateInvalidId(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateInvalidReferenceId
	
	/**
	 * Instantiate with cross-collection reference.
	 *
	 * Assert that it fails if the provided reference is not of the same collection as
	 * the provided one, or the default collection.
	 *
	 * Should fail for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateCrossCollectionReference( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testInstantiateCrossCollectionReference(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateCrossCollectionReference(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateCrossCollectionReference
	
	/**
	 * Instantiate with not found _id reference.
	 *
	 * Assert that it fails if the provided reference is not found in the collection.
	 *
	 * Should fail for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateNotFoundIdReference( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testInstantiateNotFoundIdReference(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateNotFoundIdReference(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateCrossCollectionReference
	
	/**
	 * Instantiate with found reference.
	 *
	 * Assert that it succeeds if the reference is found in the right collection.
	 *
	 * Should succeed for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateFoundReference( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateFoundReference(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateFoundReference(
				this.test_classes.custom, theParam
			);
		
	}	// instantiateFoundReference
	
	/**
	 * Instantiate with content.
	 *
	 * Assert that it succeeds and double check collection constraints.
	 *
	 * Should succeed for both the base and custom classes.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	instantiateWithContent( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInstantiateWithContent(
			this.test_classes.base, theParam
		);
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testInstantiateWithContent(
				this.test_classes.custom, theParam
			);
	
	}	// instantiateWithContent
	
	
	/****************************************************************************
	 * CONTENTS TEST MODULES DEFINITIONS										*
	 ****************************************************************************/
	
	/**
	 * Load contents in empty object
	 *
	 * Will test loading contents in empty object with both replace flag values in
	 * both base and custom classes.
	 *
	 * Should succeed with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	contentsLoadEmptyObject( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testContentsLoadEmptyObject(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testContentsLoadEmptyObject(
				this.test_classes.custom, theParam );
		
	}	// contentsLoadEmptyObject
	
	/**
	 * Load filled and non persistent object
	 *
	 * Will test replacing contents of non persistent object with both replace flag
	 * values in both base and custom classes.
	 *
	 * Should succeed with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	contentsLoadFilledObject( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testContentsLoadFilledObject(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testContentsLoadFilledObject(
				this.test_classes.custom, theParam );
		
	}	// contentsLoadFilledObject
	
	/**
	 * Load persistent object
	 *
	 * Will test replacing contents of a persistent object with both replace flag
	 * values in both base and custom classes.
	 *
	 * Should succeed with both base and custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	contentsLoadPersistentObject( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testContentsLoadPersistentObject(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testContentsLoadPersistentObject(
				this.test_classes.custom, theParam );
		
	}	// contentsLoadPersistentObject
	
	
	/****************************************************************************
	 * INSERT TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Insert empty object
	 *
	 * Assert inserting an empty object.
	 *
	 * Should succeed with base class and fail with custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertEmptyObject( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testInsertEmptyObject(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testInsertEmptyObject(
				this.test_classes.custom, theParam );
		
	}	// insertEmptyObject
	
	/**
	 * Insert object without required field
	 *
	 * Assert inserting a document without required field.
	 *
	 * Should succeed with base class and fail with custom class.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithoutRequiredFields( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		this.testInsertWithoutRequiredFields(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testInsertWithoutRequiredFields(
				this.test_classes.custom, theParam );
		
	}	// insertWithoutRequiredFields
	
	/**
	 * Insert object without significant field
	 *
	 * Assert inserting a document without significant field.
	 *
	 * Should succeed with both base and custom classes.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithoutSignificantFields( theClass, theParam = null )
	{
		//
		// Should raise: Missing required parameter.
		//
		this.testInsertWithoutSignificantFields(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testInsertWithoutSignificantFields(
				this.test_classes.custom, theParam );
		
	}	// insertWithoutSignificantFields
	
	/**
	 * Insert object with content
	 *
	 * Assert inserting a document with content.
	 *
	 * Should succeed with both base and custom classes.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithContent( theClass, theParam = null )
	{
		//
		// Assert cleanup.
		//
		let message = "Cleanup";
		db._collection( this.defaultTestCollection ).truncate();
		expect( db._collection( this.defaultTestCollection ).count(), message )
			.to.equal( 0 );
		
		//
		// Should raise: Missing required parameter.
		//
		this.testInsertWithContent(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testInsertWithContent(
				this.test_classes.custom, theParam );
		
		//
		// Assert cleanup.
		//
		message = "Cleanup";
		expect( db._collection( this.defaultTestCollection ).count(), message )
			.to.equal( 2 );
		
	}	// insertWithContent
	
	/**
	 * Insert duplicate object
	 *
	 * Assert inserting a duplicate object fails.
	 *
	 * Should fail in all cases, note that we use the _key to make it fail, we don't
	 * have other unique keys.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertDuplicate( theClass, theParam = null )
	{
		//
		// Should raise: duplicate document in collection.
		//
		this.testInsertDuplicate(
			this.test_classes.base, theParam );
		
		//
		// Should raise: duplicate document in collection.
		//
		if( this.test_classes.custom )
			this.testInsertDuplicate(
				this.test_classes.custom, theParam );
		
	}	// insertDuplicate
	
	/**
	 * Insert object with same content
	 *
	 * Assert inserting a document with same content.
	 *
	 * Should succeed with objects in which the _key is database-set and fail in
	 * objects where the _key is computed from its contents.
	 *
	 * In this class and in the custom class it should succeed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithSameContent( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInsertWithSameContentSucceed(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInsertWithSameContentSucceed(
				this.test_classes.custom, theParam );
		
		//
		// Assert cleanup.
		//
		let message = "Cleanup";
		expect( db._collection( this.defaultTestCollection ).count(), message )
			.to.equal( 4 );
		
	}	// insertWithSameContent
	
	/**
	 * Insert persistent object
	 *
	 * Assert inserting a persistent object fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertPersistentObject( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInsertPersistentObject(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInsertPersistentObject(
				this.test_classes.custom, theParam );
		
		//
		// Assert cleanup.
		//
		let message = "Cleanup";
		expect( db._collection( this.defaultTestCollection ).count(), message )
			.to.equal( 4 );
		
	}	// insertPersistentObject
	
	/**
	 * Insert without persist
	 *
	 * Assert inserting without persisting succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	insertWithoutPersist( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testInsertWithoutPersist(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testInsertWithoutPersist(
				this.test_classes.custom, theParam );
		
	}	// insertWithoutPersist
	
	
	/****************************************************************************
	 * RESOLVE TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Resolve persistent document
	 *
	 * Assert resolving persistent document.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolvePersistent( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolvePersistent(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolvePersistent(
				this.test_classes.custom, theParam );
		
	}	// resolvePersistent
	
	/**
	 * Resolve ambiguous object
	 *
	 * Assert that resolving multiple documents raises an exception.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveAmbiguousObject( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testResolveAmbiguous(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testResolveAmbiguous(
				this.test_classes.custom, theParam );
		
	}	// resolveAmbiguousObject
	
	/**
	 * Resolve null reference
	 *
	 * Assert resolving null reference fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveNullReference( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveNullReference(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveNullReference(
				this.test_classes.custom, theParam );
		
	}	// resolveNullReference
	
	/**
	 * Resolve selector without significant field
	 *
	 * Assert resolving without significant field fails on document sthat feature
	 * significant fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveSignificantField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveSignificantField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveSignificantField(
				this.test_classes.custom, theParam );
		
	}	// resolveSignificantField
	
	/**
	 * Resolve reference fields
	 *
	 * Assert the correct choice when resolving from reference and significant fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveReferenceField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveReferenceField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveReferenceField(
				this.test_classes.custom, theParam );
		
	}	// resolveReferenceField
	
	/**
	 * Resolve without raising
	 *
	 * Assert that setting the doRaise flag to off doesn't raise exceptions.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveNoException( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveNoException(
			this.test_classes.base, theParam );
		
		//
		// Should not raise.
		//
		if( this.test_classes.custom )
			this.testResolveNoException(
				this.test_classes.custom, theParam );
		
	}	// resolveNoException
	
	/**
	 * Resolve changed locked fields
	 *
	 * Assert the correct behaviour when a locked field is updated in the background and a
	 * persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeLockedField( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testResolveChangeLockedField(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testResolveChangeLockedField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeLockedField
	
	/**
	 * Resolve changed significant fields
	 *
	 * Assert the correct behaviour when a significant field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeSignificantField( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testResolveChangeSignificantField(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testResolveChangeSignificantField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeSignificantField
	
	/**
	 * Resolve changed required fields
	 *
	 * Assert the correct behaviour when a required field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeRequiredField( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testResolveChangeRequiredField(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testResolveChangeRequiredField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeRequiredField
	
	/**
	 * Resolve changed unique fields
	 *
	 * Assert the correct behaviour when a unique field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeUniqueField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveChangeUniqueField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveChangeUniqueField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeUniqueField
	
	/**
	 * Resolve changed local fields
	 *
	 * Assert the correct behaviour when a local field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeLocalField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveChangeLocalField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveChangeLocalField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeLocalField
	
	/**
	 * Resolve changed standard fields
	 *
	 * Assert the correct behaviour when a standard field is updated in the background
	 * and a persistent object is resolved.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	resolveChangeStandardField( theClass, theParam = null )
	{
		//
		// Should not raise.
		//
		this.testResolveChangeStandardField(
			this.test_classes.base, theParam );
		
		//
		// Should fail, because the custom class has required fields.
		//
		if( this.test_classes.custom )
			this.testResolveChangeStandardField(
				this.test_classes.custom, theParam );
		
	}	// resolveChangeStandardField
	
	
	/****************************************************************************
	 * REPLACE TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Replace non persistent document
	 *
	 * Assert replacing non persistent document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	replaceNonPersistent( theClass, theParam = null )
	{
		//
		// Should raise.
		//
		this.testReplaceNonPersistent(
			this.test_classes.base, theParam );
		
		//
		// Should raise.
		//
		if( this.test_classes.custom )
			this.testReplaceNonPersistent(
				this.test_classes.custom, theParam );
		
	}	// replaceNonPersistent
	
	/**
	 * Replace non existing document
	 *
	 * Assert replacing non existing document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	replaceNonExisting( theClass, theParam = null )
	{
		//
		// Should raise.
		//
		this.testReplaceNonExisting(
			this.test_classes.base, theParam );
		
		//
		// Should raise.
		//
		if( this.test_classes.custom )
			this.testReplaceNonExisting(
				this.test_classes.custom, theParam );
		
	}	// replaceNonExisting
	
	/**
	 * Replace persistent values
	 *
	 * Assert replacing persistent locked values fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	replacePersistentValue( theClass, theParam = null )
	{
		//
		// Should raise for locked and not for others.
		//
		this.testReplacePersistentValue(
			this.test_classes.base, theParam );
		
		//
		// Should raise for locked and not for others.
		//
		if( this.test_classes.custom )
			this.testReplacePersistentValue(
				this.test_classes.custom, theParam );
		
	}	// replacePersistentValue
	
	/**
	 * Replace content values
	 *
	 * Assert replacing and deleting values without using the setDocumentProperties()
	 * method will catch errors when replacing the document.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	replaceContentValue( theClass, theParam = null )
	{
		//
		// Should raise changing locked and deleting required.
		//
		this.testReplaceContentValue(
			this.test_classes.base, theParam );
		
		//
		// Should raise changing locked and deleting required.
		//
		if( this.test_classes.custom )
			this.testReplaceContentValue(
				this.test_classes.custom, theParam );
		
	}	// replacePersistentValue
	
	
	/****************************************************************************
	 * REMOVE TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Remove document
	 *
	 * Assert removing a document succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	removeDocument( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testRemoveDocument(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testRemoveDocument(
				this.test_classes.custom, theParam );
		
	}	// removeDocument
	
	/**
	 * Remove non persistent document
	 *
	 * Assert removing non persistent document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	removeNonPersistent( theClass, theParam = null )
	{
		//
		// Should raise.
		//
		this.testRemoveNonPersistent(
			this.test_classes.base, theParam );
		
		//
		// Should raise.
		//
		if( this.test_classes.custom )
			this.testRemoveNonPersistent(
				this.test_classes.custom, theParam );
		
	}	// removeNonPersistent
	
	/**
	 * Remove non existing document
	 *
	 * Assert removing non existing document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	removeNonExisting( theClass, theParam = null )
	{
		//
		// Should raise.
		//
		this.testRemoveNonExisting(
			this.test_classes.base, theParam );
		
		//
		// Should raise.
		//
		if( this.test_classes.custom )
			this.testRemoveNonExisting(
				this.test_classes.custom, theParam );
		
	}	// removeNonExisting
	
	/**
	 * Remove constrained document
	 *
	 * Assert removing a constrained document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	removeConstrained( theClass, theParam = null )
	{
		//
		// Should fail.
		//
		this.testRemoveConstrained(
			this.test_classes.base, theParam );
		
		//
		// Should fail.
		//
		if( this.test_classes.custom )
			this.testRemoveConstrained(
				this.test_classes.custom, theParam );
		
	}	// removeConstrained
	
	
	/****************************************************************************
	 * STATIC TEST MODULES DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Check edge collection
	 *
	 * Assert that it fails on document collection and succeeds on edge collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	staticEdgeCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testStaticEdgeCollection(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testStaticEdgeCollection(
				this.test_classes.custom, theParam );
		
	}	// staticEdgeCollection
	
	/**
	 * Check document collection
	 *
	 * Assert that it fails on edge collection and succeeds on document collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	staticDocumentCollection( theClass, theParam = null )
	{
		//
		// Should succeed.
		//
		this.testStaticDocumentCollection(
			this.test_classes.base, theParam );
		
		//
		// Should succeed.
		//
		if( this.test_classes.custom )
			this.testStaticDocumentCollection(
				this.test_classes.custom, theParam );
		
	}	// staticDocumentCollection
	
	
	/****************************************************************************
	 * INSTANTIATION TEST ROUTINE DEFINITIONS									*
	 ****************************************************************************/
	
	/**
	 * Test instantiate class without selector and without collection
	 *
	 * Assert that instantiating the class without the reference and collection
	 * parameters raises an exception if class has no default collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNoSelectorNoCollection( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		
		//
		// Instantiate class.
		// ToDo:
		// Need to do it in order to ger default collection:
		// should make this static.
		//
		doc =
			new theClass(
				this.parameters.request,
				null,
				this.defaultTestCollection
			);
		
		//
		// Get default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Instantiate function.
		//
		const func = () => {
			doc =
				new theClass(
					this.parameters.request
				);
		};
		
		//
		// Should raise: Missing required parameter.
		//
		if( default_collection === null )
			expect( func
			).to.throw(
				MyError,
				/Missing required parameter/
			);
		
		//
		// Should not raise an exception.
		//
		else
			expect( func ).not.to.throw();
		
	}	// testInstantiateNoSelectorNoCollection
	
	/**
	 * Test instantiate with null selector and without collection.
	 *
	 * Assert that instantiating the class with null reference and no collection
	 * raises an exception if class has no default collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNullSelectorNoCollection( theClass, theParam = null )
	{
		//
		// Init local storage.
		//
		let doc;
		
		//
		// Instantiate class.
		// ToDo:
		// Need to do it in order to ger default collection:
		// should make this static.
		//
		doc =
			new theClass(
				this.parameters.request,
				null,
				this.defaultTestCollection
			);
		
		//
		// Get default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Instantiate function.
		//
		const func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null
				);
		};
		
		//
		// Should raise: Missing required parameter.
		//
		if( default_collection === null )
			expect( func
			).to.throw(
				MyError,
				/Missing required parameter/
			);
		
		//
		// Should not raise an exception.
		//
		else
			expect( func ).not.to.throw();
		
	}	// testInstantiateNullSelectorNoCollection
	
	/**
	 * Test with null selector and non existant collection.
	 *
	 * Assert that instantiating the class with null reference and a non existing
	 * collection parameters raises an exception in all cases.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateNullSelectorMissingCollection( theClass, theParam = null )
	{
		//
		// Should raise: unknown or invalid collection name.
		//
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					theParam
				);
		}).to.throw(
			MyError,
			/unknown or invalid collection name/
		);
		
	}	// testInstantiateNullSelectorMissingCollection
	
	/**
	 * Test instantiation with missing default collection
	 *
	 * Perform tests for default collection with class that does not have default
	 * collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testDefaultCollection( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Instantiate class.
		// ToDo:
		// Need to do it in order to ger default collection:
		// should make this static.
		//
		doc =
			new theClass(
				this.parameters.request,
				null,
				this.defaultTestCollection
			);
		
		//
		// Get default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Instantiate without reference and collection.
		// Should fail if no default collection.
		//
		message = "Missing selector and missing collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request
				);
		};
		if( default_collection === null )
		{
			//
			// Should raise: Missing required parameter.
			//
			action = "Instantiation without default collection";
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/Missing required parameter/
			);
		}
		else
		{
			//
			// Should succeed.
			//
			action = "Instantiation with default collection";
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Collection name";
			expect( doc.collection, `${message} - ${action}` )
				.to.equal( doc.defaultCollection );
		}
		
		//
		// Instantiate with null selector and provided collection.
		// Collection should be the provided one.
		// Should succeed.
		//
		message = "Null selector and provided collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.other_collection
				);
		};
		
		//
		// Set action.
		//
		action = ( default_collection === null )
			   ? "Instantiation without default collection"
			   : "Instantiation with default collection";

		//
		// Should succeed regardless of default collection.
		//
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Collection name";
		
		//
		// Collection should match provided one.
		//
		expect( doc.collection, `${message} - ${action}` )
			.to.equal( this.parameters.other_collection );
		
		//
		// Instantiate with existing reference and missing collection.
		// Collection should be resolved from the reference.
		// Should succeed if no default collection, or if default collection is the
		// same as the reference collection.
		//
		message = "Existing reference and missing collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id
				);
		};
		
		//
		// Set action.
		//
		action = ( default_collection === null )
				 ? "Instantiation without default collection"
				 : "Instantiation with default collection";
		
		//
		// Handle no default collection.
		//
		if( default_collection === null )
		{
			//
			// Should succeed with any collection.
			//
			expect( func, `${message} - ${action}` ).not.to.throw();
			action = "Collection name";
			expect( doc.collection, `${message} - ${action}` )
				.to.equal( this.parameters.example_id.split('/')[ 0 ] );
		}
		else
		{
			//
			// Should succeed only with reference in default collection.
			//
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/Invalid document reference: cross-collection reference/
			);
		}
		
	}	// testDefaultCollection
	
	/**
	 * Test unsuccessful instantiation with existing edge collection
	 *
	 * Assert instantiating with edge collection fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateEdgeFail( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.collection_edge
				);
		}).to.throw(
			MyError,
			/Invalid collection/
		);
		
	}	// testInstantiateEdgeFail
	
	/**
	 * Test successful instantiation with existing edge collection
	 *
	 * Assert instantiating with edge collection succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateEdgeSucceed( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.collection_edge
				);
		}).not.to.throw();
		
	}	// testInstantiateEdgeSucceed
	
	/**
	 * Test unsuccessful instantiation with existing document collection
	 *
	 * Assert instantiating with document collection fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateDocumentFail( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.collection_document
				);
		}).to.throw(
			MyError,
			/Invalid collection/
		);
		
	}	// testInstantiateDocumentFail
	
	/**
	 * Test successful instantiation with existing document collection
	 *
	 * Assert instantiating with document collection succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInstantiateDocumentSucceed( theClass, theParam = null )
	{
		expect( () => {
			const tmp =
				new theClass(
					this.parameters.request,
					null,
					this.parameters.collection_document
				);
		}).not.to.throw();
		
	}	// testInstantiateDocumentSucceed
	
	/**
	 * Instantiate mutable/immutable document.
	 *
	 * Assert that the document data is immutable only when instantiated from an
	 * existing reference.
	 *
	 * You should always provide both parameters.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateMutableImmutable( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Check provided parameter.
		//
		expect( theParam, "Parameter not null").not.to.be.null;
		expect( theParam, "Parameter not an object").to.be.an.object;
		expect( theParam, `${message} - ${action}` ).not.to.be.empty;
		
		//
		// Empty mutable document.
		//
		message = "Empty mutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Empty immutable document.
		//
		message = "Empty immutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Filled mutable document.
		//
		message = "Filled mutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam,
					this.defaultTestCollection,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Filled immutable document.
		//
		message = "Filled immutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam,
					this.defaultTestCollection,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Referenced mutable document.
		//
		message = "Referenced mutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be mutable";
		expect( doc.document, `${message} - ${action}` ).not.to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
		//
		// Referenced immutable document.
		//
		message = "Referenced immutable document";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Should be immutable";
		expect( doc.document, `${message} - ${action}` ).to.be.sealed;
		action = "Modified flag";
		expect( doc.modified, `${message} - ${action}` ).to.be.false;
		
	}	// testInstantiateMutableImmutable
	
	/**
	 * Instantiate with invalid _id reference.
	 *
	 * Assert that the provided _id reference is invalid.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateInvalidId( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Fail with default collection.
		//
		if( default_collection !== null )
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`XXXXXXXX`
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		
		//
		// Fail with provided collection.
		//
		else
		{
			//
			// Expect an _id reference.
			//
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`XXXXXXXX`
					);
			}).to.throw(
				MyError,
				/invalid object reference handle/
			);
			
			//
			// Expect a _key reference.
			//
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`XXXXXXXX`,
						this.defaultTestCollection
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		}
		
	}	// testInstantiateInvalidId
	
	/**
	 * Instantiate with cross-collection reference.
	 *
	 * Assert that the provided _id reference belongs to the same declared or implicit
	 * collection.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateCrossCollectionReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Fail with default collection.
		//
		if( default_collection !== null )
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						this.parameters.example_id
					);
			}).to.throw(
				MyError,
				/cross-collection reference/
			);
		
		//
		// Fail with provided collection.
		//
		else
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						this.parameters.example_id,
						this.defaultTestCollection
					);
			}).to.throw(
				MyError,
				/cross-collection reference/
			);
		
	}	// testInstantiateCrossCollectionReference
	
	/**
	 * Instantiate with not found _id reference.
	 *
	 * Assert that the test raises an error of the not found type.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateNotFoundIdReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Fail with default collection.
		//
		if( default_collection !== null )
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`${this.defaultTestCollection}/XXXXXXXX`
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		
		//
		// Fail with provided collection.
		//
		else
			expect( () => {
				const tmp =
					new theClass(
						this.parameters.request,
						`${this.defaultTestCollection}/XXXXXXXX`,
						this.defaultTestCollection
					);
			}).to.throw(
				MyError,
				/not found in collection/
			);
		
	}	// testInstantiateNotFoundIdReference
	
	/**
	 * Instantiate with found reference and default collection.
	 *
	 * Assert that the test raises an error only if the provided reference
	 * doesn't match the default collection.
	 *
	 * Should always fail.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateFoundReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let meta;
		let result;
		let action;
		let message;
		let collection;
		
		//
		// Check parameter.
		//
		message = "Check parameter";
		expect( theParam, message ).to.be.an.object;
		
		//
		// Instantiate a document.
		// ToDo.
		// Need to implement defaultCollection() call as static.
		//
		message = "Instantiate document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Determine whether it has a default collection.
		//
		const default_collection = doc.defaultCollection;
		
		//
		// Test instantiation with reference collection different than default collection.
		// Should fail: the provided _id is of a different collection than the default
		// collection.
		//
		message = "Reference collection different than default collection";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						this.parameters.example_id
					);
			};
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						this.parameters.example_id,
						this.defaultTestCollection
					);
			};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/cross-collection reference/
		);
		
		//
		// Test instantiation with reference collection different than provided collection.
		// Should fail: the provided _id is of a different collection than the provided
		// collection.
		//
		message = "Reference collection different than provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.other_collection
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/cross-collection reference/
		);
		
		//
		// Test instantiation with inferred collection same as provided collection.
		// Should succeed.
		//
		message = "Reference collection same as provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.parameters.example_collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate sample document.
		//
		message = "Reference sample document";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam
					);
			};
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam,
						this.defaultTestCollection
					);
			};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Prepare document for insert.
		//
		action = "Prepare for insert";
		func = () => {
			result = doc.insertDocument( false );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		//
		// Insert sample document.
		//
		action = "Insert in collection";
		collection = doc.collection;
		func = () => {
			meta =
				db._collection( collection )
					.insert( doc.document );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Test instantiation with reference inferred collection same as default
		// collection.
		// Should succeed.
		//
		message = "Reference by _id with inferred collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					meta._id
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Test instantiation with reference collection inferred and same as provided
		// collection.
		// Should succeed.
		//
		message = "Reference by _id with provided collection";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					meta._id,
					collection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Test instantiation with key reference and default collection.
		// Should succeed.
		//
		message = "Reference by _key";
		action = "Instantiation";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						meta._key
					);
			};
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						meta._key,
						collection
					);
			};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object status.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(collection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Remove test document.
		//
		db._remove(meta._id);
		
	}	// testInstantiateFoundReference
	
	/**
	 * Instantiate with content and default collection.
	 *
	 * Assert that the test succeeds both with and without collection.
	 *
	 * Should always succeed.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theParam		{Object}	The object contents.
	 */
	testInstantiateWithContent( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		let action;
		
		//
		// Check provided parameter.
		//
		expect( theParam, "Parameter not null").not.to.be.null;
		expect( theParam, "Parameter not an object").to.be.an.object;
		expect( theParam, `${message} - ${action}` ).not.to.be.empty;
		
		//
		// Instantiate example object to get default collection.
		//
		message = "Instantiate example document";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.parameters.example_id,
					this.parameters.example_collection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		const default_collection = doc.defaultCollection;
		
		//
		// Handle default collection.
		//
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam
					);
			};
		
		//
		// Handle provided collection.
		//
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam,
						this.defaultTestCollection
					);
			};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		if( default_collection !== null )
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		else
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// Instantiate with default collection and invalid property.
		// Should not fail, it will be caught before persisting.
		//
		const contents = K.function.clone( theParam );
		contents[ "UNKNOWN" ] = "Should not be there";
		message = "Instantiation with default collection and invalid property";
		if( default_collection !== null )
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						contents
					);
			};
		
		//
		// Handle provided collection.
		//
		else
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						contents,
						this.defaultTestCollection
					);
			};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		if( default_collection !== null )
			expect( doc.collection, `${message} - ${action}` ).to.equal(doc.defaultCollection);
		else
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, contents );
		
		//
		// Instantiate with provided collection.
		//
		message = "Instantiation with provided collection";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// Instantiate with provided collection and invalid property.
		// Should not fail, it will be caught before persisting.
		//
		message = "Instantiation with default collection and invalid property";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					contents,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Check object state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, contents );
		
	}	// testInstantiateWithContent
	
	
	/****************************************************************************
	 * CONTENTS TEST ROUTINE DEFINITIONS										*
	 ****************************************************************************/
	
	/**
	 * Succeed loading contents in empty object
	 *
	 * Assert that loading contents in an empty object works for all fields except
	 * restricted fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testContentsLoadEmptyObject( theClass, theParam = null )
	{
		let doc;
		let data;
		let func;
		let action;
		let message;
		
		//
		// REPLACE FLAG FALSE
		//
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Load data.
		//
		action = "Set document properties filled";
		func = () => {
			doc.setDocumentProperties(
				theParam,
				false
			);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Load data.
		//
		data = K.function.clone( theParam );
		for( const item in data )
			data[ item ] = null;
		action = "Set document properties delete";
		func = () => {
			doc.setDocumentProperties(
				data,
				false
			);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Load data.
		//
		action = "Set invalid document property";
		data = { "UNKNOWN" : "CONTENT" };
		func = () => {
			doc.setDocumentProperties(
				data,
				false
			);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, data );
		
		//
		// REPLACE FLAG TRUE
		//
		
		//
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Load data.
		//
		action = "Set document properties filled";
		func = () => {
			doc.setDocumentProperties(
				theParam,
				true
			);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, theParam );
		
		//
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Load data.
		//
		data = K.function.clone( theParam );
		for( const item in data )
			data[ item ] = null;
		action = "Set document properties delete";
		func = () => {
			doc.setDocumentProperties(
				data,
				true
			);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Load data.
		//
		action = "Set invalid document property";
		data = { "UNKNOWN" : "CONTENT" };
		func = () => {
			doc.setDocumentProperties(
				data,
				true
			);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, data );
	
	}	// testContentsLoadEmptyObject
	
	/**
	 * Load contents in filled object
	 *
	 * Assert that loading contents in a filled non persistent object works for all fields
	 * except restricted fields, the following checks will be performed:
	 *
	 *	- Restricted fields are not copied.
	 *	- Modifying locked fields will not raise an exception.
	 *	- All other fields are copied.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testContentsLoadFilledObject( theClass, theParam = null )
	{
		let doc;
		let data;
		let func;
		let action;
		let message;
		
		//
		// Get base and replace contents.
		//
		message = "Unit test parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).to.have.property( 'base' );
		expect( theParam, message ).to.have.property( 'replace' );
		
		const base_data = theParam[ 'base' ];
		const replace_data = theParam[ 'replace' ];
		
		//
		// REPLACE FLAG FALSE
		//
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					base_data,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Replace and check contents.
		//
		this.validateNonPersistentReplace(
			`${message} - replace with contents`,	// Error message.
			false,									// Replace flag.
			doc,									// The document object.
			replace_data							// The replacement data.
		);
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					base_data,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Replace and check contents.
		//
		data = K.function.clone( replace_data );
		for( const item in data )
			data[ item ] = null;
		this.validateNonPersistentReplace(
			`${message} - replace with delete contents`,	// Error message.
			false,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is false";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					base_data,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Replace and check contents.
		//
		data = { "UNKNOWN" : "CONTENT" };
		this.validateNonPersistentReplace(
			`${message} - replace with invalid contents`,	// Error message.
			false,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		action = "Has invalid field";
		expect( doc.document, `${message} - ${action}` ).to.have.property( 'UNKNOWN' );
		expect( doc.document[ 'UNKNOWN'], `${message} - ${action}` ).to.equal( 'CONTENT' );
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// REPLACE FLAG TRUE
		//
		
		//
		// Instantiate for false replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					base_data,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Replace and check contents.
		//
		this.validateNonPersistentReplace(
			`${message} - replace with contents`,	// Error message.
			true,									// Replace flag.
			doc,									// The document object.
			replace_data							// The replacement data.
		);
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					base_data,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Replace and check contents.
		//
		data = K.function.clone( replace_data );
		for( const item in data )
			data[ item ] = null;
		this.validateNonPersistentReplace(
			`${message} - replace with delete contents`,	// Error message.
			true,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		
		//
		// Check deleted contents.
		//
		for( const item in data )
		{
			action = `Has field [${item}]`;
			expect( doc.document, `${message} - ${action}` ).not.to.have.property( item );
		}
		
		//
		// Check object loaded state.
		//
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate for true replace flag test.
		//
		message = "Replace flag is true";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					base_data,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object empty state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Replace and check contents.
		//
		data = { "UNKNOWN" : "CONTENT" };
		this.validateNonPersistentReplace(
			`${message} - replace with invalid contents`,	// Error message.
			true,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		action = "Has invalid field";
		expect( doc.document, `${message} - ${action}` ).to.have.property( 'UNKNOWN' );
		expect( doc.document[ 'UNKNOWN'], `${message} - ${action}` ).to.equal( 'CONTENT' );
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( false );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
	}	// testContentsLoadFilledObject
	
	/**
	 * Load contents in persistent object
	 *
	 * Assert that loading contents in a persistent object works for all fields
	 * except restricted fields, the following checks will be performed:
	 *
	 *	- Restricted fields are not copied.
	 *	- Modifying locked fields will raise an exception.
	 *	- All other fields are copied.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testContentsLoadPersistentObject( theClass, theParam = null )
	{
		let id;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Get base and replace contents.
		//
		message = "Unit test parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).to.have.property( 'base' );
		expect( theParam, message ).to.have.property( 'replace' );
		
		const base_data = theParam[ 'base' ];
		const replace_data = theParam[ 'replace' ];
		
		//
		// Instantiate object for inserting.
		//
		message = "Persistent copy";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					base_data,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Insert object.
		//
		action = "Insertion";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object persistent state.
		//
		action = "Insertion result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		action = "Has _id";
		expect( doc.document, `${message} - ${action}` ).to.have.property( '_id' );
		
		//
		// Save ID.
		//
		id = doc.document._id;
		
		//
		// REPLACE FLAG FALSE
		//
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object persistent state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, base_data );
		
		//
		// Replace and check contents.
		//
		message = "Replace value and flag is off";
		this.validatePersistentReplace(
			message,								// Error message.
			false,									// Replace flag.
			doc,									// The document object.
			replace_data							// The replacement data.
		);
		
		//
		// Check object replaced state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Replace and check contents.
		//
		data = K.function.clone( replace_data );
		for( const item in data )
			data[ item ] = null;
		message = "Replace value and flag is off";
		this.validatePersistentReplace(
			`${message} - replace with delete contents`,	// Error message.
			false,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Replace and check contents.
		//
		data = { "UNKNOWN" : "CONTENT" };
		message = "Replace value and flag is off";
		this.validatePersistentReplace(
			`${message} - replace with invalid contents`,	// Error message.
			false,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		action = "Has invalid field";
		expect( doc.document, `${message} - ${action}` ).to.have.property( 'UNKNOWN' );
		expect( doc.document[ 'UNKNOWN'], `${message} - ${action}` ).to.equal( 'CONTENT' );
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// REPLACE FLAG TRUE
		//
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Check object persistent state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check content.
		//
		this.assertAllProvidedDataInDocument( "Check contents", doc, base_data );
		
		//
		// Replace and check contents.
		//
		message = "Replace value and flag is on";
		this.validatePersistentReplace(
			message,								// Error message.
			true,									// Replace flag.
			doc,									// The document object.
			replace_data							// The replacement data.
		);
		
		//
		// Check object replaced state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Replace and check contents.
		//
		data = K.function.clone( replace_data );
		for( const item in data )
			data[ item ] = null;
		message = "Replace value and flag is on";
		this.validatePersistentReplace(
			`${message} - replace with delete contents`,	// Error message.
			true,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Instantiate from reference.
		//
		message = "Resolving from reference";
		action = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Replace and check contents.
		//
		data = { "UNKNOWN" : "CONTENT" };
		message = "Replace value and flag is on";
		this.validatePersistentReplace(
			`${message} - replace with invalid contents`,	// Error message.
			true,											// Replace flag.
			doc,											// The document object.
			data											// The replacement data.
		);
		action = "Has invalid field";
		expect( doc.document, `${message} - ${action}` ).to.have.property( 'UNKNOWN' );
		expect( doc.document[ 'UNKNOWN'], `${message} - ${action}` ).to.equal( 'CONTENT' );
		
		//
		// Check object loaded state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Remove document.
		//
		db._remove( id );
	
	}	// testContentsLoadPersistentObject
	
	
	/****************************************************************************
	 * INSERT TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test inserting empty object
	 *
	 * Assert that inserting an empty object fails if the object has required fields,
	 * or succeed if object does not have required fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertEmptyObject( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Check parameter" ).to.be.an.array;
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Handle required fields.
		//
		if( doc.requiredFields.length > 0 )
		{
			//
			// Insert object.
			//
			action = "Insertion";
			func = () => {
				result = doc.insertDocument();
			};
			
			//
			// Assert exception.
			//
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/missing required field/
			);
		}
		
		//
		// Handle no required fields.
		//
		else
		{
			//
			// Insert object.
			//
			action = "Insertion";
			func = () => {
				result = doc.insertDocument();
			};
			
			//
			// Assert no exception.
			//
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Insertion result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				( Array.isArray( theParam ) ) ? theParam : []
			);
			
			//
			// Remove document.
			//
			db._remove( doc.document._id );
		}
		
	}	// testInsertEmptyObject
	
	/**
	 * Test inserting document without required fields
	 *
	 * Assert that inserting an object without required fields fails and succeeds if
	 * the object has no required fields.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithoutRequiredFields( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							 ? theParam.excluded
							 : [];
		
		//
		// ToDo
		// Note: we need to instantiate the object first, because we need to get the
		// list of required fields: should make the method static...
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					param_contents,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Collect required fields.
		//
		const required = doc.requiredFields;
		
		//
		// Handle document with required fields.
		//
		if( required.length > 0 )
		{
			//
			// Iterate required fields.
			//
			for( const field of required )
			{
				//
				// Remove from current document.
				//
				if( doc.document.hasOwnProperty( field ) )
				{
					//
					// Remove field.
					//
					const data = {};
					data[ field ] = null;
					message = `Remove [${field}]`;
					func = () => {
						doc.setDocumentProperties( data, true );
					};
					expect( func, `${message}` ).not.to.throw();
					expect( doc.document, message ).not.to.have.property( field );
					
				}	// Removed existing field.
				
				//
				// Insert.
				//
				message = `Insert without [${field}]`;
				func = () => {
					result = doc.insertDocument();
				};
				expect( func, `${message}`
				).to.throw(
					MyError,
					/missing required field/
				);
				
				//
				// Restore the full object.
				//
				message = "Instantiate full object";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							param_contents,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				
			}	// Iterating featured required fields.
			
		}	// Features required fields.
		
		//
		// Handle no required fields.
		//
		else
		{
			//
			// Insert object.
			//
			message = "Insertion without required fields";
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Insertion result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				param_excluded
			);
			
			//
			// Remove document.
			//
			db._remove( doc.document._id );
			
		} // Has no required fields.
		
	}	// testInsertWithoutRequiredFields
	
	/**
	 * Test inserting document without significant fields
	 *
	 * Assert that inserting an object without significant fields suceeds, the method
	 * will instantiate a document
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithoutSignificantFields( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// ToDo
		// Note: we need to instantiate the object first, because we need to get the
		// list of significant fields: should make the method static...
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					param_contents,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Collect significant fields.
		//
		const significant = K.function.flatten( doc.significantFields );
		
		//
		// Handle document with significant fields.
		//
		if( significant.length > 0 )
		{
			//
			// Iterate significant fields.
			//
			for( const field of significant )
			{
				//
				// Remove from current document.
				//
				if( doc.document.hasOwnProperty( field ) ) {
					//
					// Remove field.
					//
					const data = {};
					data[ field ] = null;
					message = `Remove [${field}]`;
					func = () => {
						doc.setDocumentProperties( data, true );
					};
					expect( func, `${message}` ).not.to.throw();
					expect( doc.document, message ).not.to.have.property( field );
					
				}	// Removed existing field.
				
				//
				// Insert function.
				//
				message = `Insert without [${field}]`;
				func = () => {
					result = doc.insertDocument();
				};
				
				//
				// Handle also required.
				// Should raise an exception.
				//
				if( doc.requiredFields.includes( field ) )
					expect( func, `${message}`
					).to.throw(
						MyError,
						/missing required field/
					);
				
				//
				// Handle only significant.
				// Should not raise an exception.
				//
				else
				{
					//
					// Insert.
					//
					expect( func, `${message}` ).not.to.throw();
					
					//
					// Check object persistent state.
					//
					action = "Insertion result";
					expect( result, `${message} - ${action}` ).to.be.true;
					action = "Contents";
					expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
					action = "Collection";
					expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
					action = "Persistent";
					expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
					action = "Modified";
					expect( doc.modified, `${message} - ${action}` ).to.equal( true );
					
					//
					// Check local fields.
					//
					this.checkLocalProperties(
						message,
						doc,
						param_excluded
					);
					
					//
					// Remove document.
					//
					db._remove( doc.document._id );
					
				}	// Field is not required.
				
				//
				// Restore the full object.
				//
				message = "Instantiate full object";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							param_contents,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				
			}	// Iterating featured significant fields.
			
		}	// Features significant fields.
		
		//
		// Handle no significant fields.
		//
		else
		{
			//
			// Insert object.
			//
			message = "Insertion without significant fields";
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Check object persistent state.
			//
			action = "Insertion result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				param_excluded
			);
			
			//
			// Remove document.
			//
			db._remove( doc.document._id );
			
		} // Has no significant fields.
		
	}	// testInsertWithoutSignificantFields
	
	/**
	 * Test inserting document with content
	 *
	 * Assert that inserting an object with contents suceeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithContent( theClass, theParam = null )
	{
		let id;
		let key;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// Clone parameter.
		//
		const clone = K.function.clone( param_contents );
		
		//
		// Change name if already saved.
		// To ensure resolving by name doesn't raise an ambiguous document error.
		//
		if( this.intermediate_results.hasOwnProperty( 'key_insert_filled' ) )
		{
			clone[ Dict.descriptor.kName ] = 'NAME FILLED';
			clone[ Dict.descriptor.kLID ] = 'LID_FILLED';
		}
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					clone,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, message ).not.to.throw();
		
		//
		// Assert document persistent state.
		//
		action = "Result";
		expect( result, `${message} - ${action}` ).to.equal( true );
		action = "Should not be empty";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Has local fields";
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal(false);
		this.assertAllProvidedDataInDocument( "Contents", doc, clone );
		
		//
		// Check local fields.
		//
		this.checkLocalProperties(
			message,
			doc,
			param_excluded
		);
		
		//
		// Get ID and clone data.
		//
		id = doc.document._id;
		key = doc.document._key;
		data = K.function.clone( doc.document );
		
		//
		// Save inserted ID in current object.
		//
		this.intermediate_results.key_insert_filled = key;
		expect(this.intermediate_results).to.have.property("key_insert_filled");
		expect(this.intermediate_results.key_insert_filled).to.equal(key);
		
		//
		// Retrieve.
		//
		message = "Retrieve";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		this.assertAllProvidedDataInDocument( "Contents", doc, data );
		
	}	// testInsertWithContent
	
	/**
	 * Test inserting document with same content
	 *
	 * Assert that inserting an object with same contents succeeds, this should occur if
	 * the document _key is determined by the database.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertDuplicate( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let message;
		let selector;
		
		//
		// Check persistent document.
		//
		message = "Check parameter";
		expect(this, message).to.have.property('intermediate_results');
		expect(this.intermediate_results, message).to.have.property('key_insert_filled');
		expect(this.intermediate_results.key_insert_filled, message).to.be.a.string;
		db._collection( this.defaultTestCollection )
			.document( this.intermediate_results.key_insert_filled );
		
		//
		// Create selector.
		//
		selector = K.function.clone( theParam );
		selector._key = this.intermediate_results.key_insert_filled;
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, message
		).to.throw(
			MyError,
			/duplicate document in collection/
		);
		
	}	// testInsertDuplicate
	
	/**
	 * Test inserting document with same content fails
	 *
	 * Assert that inserting an object with same contents fails, this should occur if
	 * the document _key is computed from the document contents.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithSameContentFail( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		const param_contents = theParam.contents;
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					param_contents,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, message
		).to.throw(
			MyError,
			/duplicate document in collection/
		);
		
	}	// testInsertWithSameContentFail
	
	/**
	 * Test inserting document with same content succeeds
	 *
	 * Assert that inserting an object with same contents succeeds, this should occur if
	 * the document _key is assigned by the database.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithSameContentSucceed( theClass, theParam = null )
	{
		let id;
		let key;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter type" ).to.be.an.object;
		expect( theParam, "Parameter contents" ).to.have.property( 'contents' );
		expect( theParam, "Parameter contents" ).to.have.property( 'excluded' );
		const param_contents = theParam.contents;
		const param_excluded = ( Array.isArray( theParam.excluded ) )
							   ? theParam.excluded
							   : [];
		
		//
		// Clone contents.
		//
		const clone = K.function.clone(param_contents);
		
		//
		// Change name if already saved.
		// To ensure resolving by name doesn't raise an ambiguous document error.
		//
		if( this.intermediate_results.hasOwnProperty( 'key_insert_same' ) )
			clone[ Dict.descriptor.kName ] = "NAME SAME CONTENTS";
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					clone,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Perform test only if _key is not required.
		// If required, it means that the database cannot assign the key.
		//
		if( ! doc.requiredFields.includes( '_key' ) )
		{
			//
			// Insert.
			//
			message = "Insert";
			func = () => {
				result = doc.insertDocument();
			};
			expect( func, message ).not.to.throw();
			
			//
			// Assert persistent document state.
			//
			action = "Result";
			expect( result, `${message} - ${action}` ).to.equal( true );
			action = "Should not be empty";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Has local fields";
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
			action = "Modified";
			expect( doc.modified, `${message} - ${action}` ).to.equal(false);
			this.assertAllProvidedDataInDocument( "Contents", doc, clone );
			
			//
			// Check local fields.
			//
			this.checkLocalProperties(
				message,
				doc,
				param_excluded
			);
			
			//
			// Get ID and clone data.
			//
			id = doc.document._id;
			key = doc.document._key;
			data = K.function.clone( doc.document );
			
			//
			// Save inserted ID in current object.
			//
			this.intermediate_results.key_insert_same = key;
			expect(this.intermediate_results).to.have.property("key_insert_same");
			expect(this.intermediate_results.key_insert_same).to.equal(key);
			
			//
			// Retrieve.
			//
			message = "Retrieve";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						id,
						this.defaultTestCollection
					);
			};
			expect( func, message ).not.to.throw();
			this.assertAllProvidedDataInDocument( "Contents", doc, data );
			
		}	// _key is not required.
	
	}	// testInsertWithSameContentSucceed
	
	/**
	 * Test inserting persistent object
	 *
	 * Assert that inserting a persistent object fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertPersistentObject( theClass, theParam = null )
	{
		let id;
		let key;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		let selector;
		
		//
		// Check persistent document.
		//
		message = "Check parameter";
		expect(this, message).to.have.property('intermediate_results');
		expect(this.intermediate_results, message).to.have.property('key_insert_filled');
		expect(this.intermediate_results.key_insert_filled, message).to.be.a.string;
		db._collection( this.defaultTestCollection )
			.document( this.intermediate_results.key_insert_filled );
		
		//
		// Create selector.
		//
		id = `${this.defaultTestCollection}/${this.intermediate_results.key_insert_filled}`;
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					id,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument();
		};
		expect( func, message
		).to.throw(
			MyError,
			/document is persistent/
		);
		
	}	// testInsertPersistentObject
	
	/**
	 * Test inserting without persisting
	 *
	 * Assert that inserting with the persist flag off succeeds and that all required
	 * fields are set.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testInsertWithoutPersist( theClass, theParam = null )
	{
		let id;
		let key;
		let doc;
		let data;
		let func;
		let result;
		let action;
		let message;
		let selector;
		
		//
		// Instantiate.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, message ).not.to.throw();
		
		//
		// Insert.
		//
		message = "Insert";
		func = () => {
			result = doc.insertDocument( false );
		};
		expect( func, message ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.equal( true );
		action = "Should not be empty";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Has reference fields";
		expect(doc.document, `${message} - ${action}` ).not.to.have.property('_id');
		expect(doc.document, `${message} - ${action}` ).not.to.have.property('_key');
		expect(doc.document, `${message} - ${action}` ).not.to.have.property('_rev');
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal(true);
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal(false);
		this.assertAllProvidedDataInDocument( "Contents", doc, theParam );
		
	}	// testInsertWithoutPersist
	
	
	/****************************************************************************
	 * RESOLVE TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test resolving persistent object
	 *
	 * Assert that resolving a persistent object succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolvePersistent( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		const param_excluded = ( Array.isArray( theParam ) ) ? theParam : [];
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set _id.
		//
		message = "Set _id";
		func = () => {
			doc.setDocumentProperties(
				{ _id: `${this.defaultTestCollection}/${this.intermediate_results.key_insert_filled}` },
				true
			);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve object.
		//
		message = "Resolve by _id with replace flag off";
		func = () => {
			result = doc.resolveDocument( false, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check local fields.
		//
		this.checkLocalProperties(
			message,
			doc,
			param_excluded
		);
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set _id.
		//
		message = "Set _id";
		func = () => {
			doc.setDocumentProperties(
				{ _id: `${this.defaultTestCollection}/${this.intermediate_results.key_insert_filled}` },
				true
			);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve object.
		//
		message = "Resolve by _id with replace flag on";
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check local fields.
		//
		this.checkLocalProperties(
			message,
			doc,
			param_excluded
		);
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set _key.
		//
		message = "Set _key";
		func = () => {
			doc.setDocumentProperties(
				{ _key: `${this.intermediate_results.key_insert_filled}` },
				true
			);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve object.
		//
		message = "Resolve by _key with replace flag off";
		func = () => {
			result = doc.resolveDocument( false, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check local fields.
		//
		this.checkLocalProperties(
			message,
			doc,
			param_excluded
		);
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set _key.
		//
		message = "Set _key";
		func = () => {
			doc.setDocumentProperties(
				{ _key: `${this.intermediate_results.key_insert_filled}` },
				true
			);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve object.
		//
		message = "Resolve by _key with replace flag on";
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Check local fields.
		//
		this.checkLocalProperties(
			message,
			doc,
			param_excluded
		);
		
	}	// testResolvePersistent
	
	/**
	 * Test resolving null reference
	 *
	 * Assert that resolving a null reference raises an exception.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveNullReference( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					null,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve object.
		//
		message = "Resolve";
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/cannot locate document without selection data/
		);
		
	}	// testResolveNullReference
	
	/**
	 * Resolve ambiguous object
	 *
	 * Assert that resolving an object matches more than one document fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveAmbiguous( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate object with selector.
		//
		message = "Instantiate object with selector";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve document with replace flag off.
		//
		message = "Resolve with replace flag off";
		func = () => {
			result = doc.resolveDocument( false, true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/combination of fields is not unique/
		);
		
		//
		// Resolve document with replace flag on.
		//
		message = "Resolve with replace flag on";
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/combination of fields is not unique/
		);
		
	}	// testResolveAmbiguous
	
	/**
	 * Resolve significant field selector
	 *
	 * This test will assert resolving a document with or without significant fields,
	 * it will perform the following checks:
	 *
	 * 	- Resolve with all significant fields:
	 * 		- Providing both significant fields should succeed for documents with and
	 * 		  without significant fields.
	 * 	- Resolve with one significant field missing:
	 * 		- Should fail if document features significant fields and succeed if not.
	 * 	- Resolve without significant fields:
	 * 		- Succeed if document does not feature significant fields and fail if it does.
	 * 	- Resolve with ambiguous significant fields:
	 * 		- Fails with or without featuring significant fields.
	 * 	- Resolve with not found significant fields:
	 * 		- Fails with or without featuring significant fields.
	 * 	- Resolve with matching significant fields and different content:
	 * 		- Should succeed, test with replace flag on and off.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveSignificantField( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		let original;
		let selector;
		
		//
		// Check parameter.
		//
		message = "Checking parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).to.have.property( 'replace' );
		expect( theParam, message ).to.have.property( 'sigFind' );
		
		//
		// RESOLVE WITH SIGNIFICANT FIELDS AND REPLACE FLAG ON.
		//
		
		//
		// Resolve object.
		//
		message = "Resolve with all significant fields and replace flag on";
		action = "Instantiate";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam.sigFind,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Resolve.
		//
		action = "Resolve";
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Assert document state.
		//
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Save persistent contents.
		//
		original = K.function.clone( doc.document );
		
		//
		// Match document contents.
		//
		this.validateResolvedContents(
			true,				// Replace flag.
			message,			// Error message.
			doc,				// The object to test.
			original,			// The persistent contents.
			theParam.sigFind	// The selection contents.
		);
		
		//
		// RESOLVE WITH SIGNIFICANT FIELDS AND REPLACE FLAG OFF.
		//
		
		//
		// Instantiate with all significant fields.
		//
		message = "Resolve with all significant fields and replace flag off";
		action = "Instantiate";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam.sigFind,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Resolve.
		//
		action = "Resolve";
		func = () => {
			result = doc.resolveDocument( false, true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Assert document state.
		//
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Match document contents.
		//
		this.validateResolvedContents(
			false,				// Replace flag.
			message,			// Error message.
			doc,				// The object to test.
			original,			// The persistent contents.
			theParam.sigFind	// The selection contents.
		);
		
		//
		// Instantiate with one significant field missing.
		//
		if( theParam.hasOwnProperty( 'sigOne' ) )
		{
			//
			// RESOLVE WITH ONE SIGNIFICANT FIELD MISSING AND REPLACE FLAG ON.
			//
			
			//
			// Instantiate with all significant fields.
			//
			message = "Resolve with one significant field missing and replace flag on";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.sigOne,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Resolve function.
			//
			func = () => {
				result = doc.resolveDocument( true, true );
			};
			
			//
			// Handle document with significant fields.
			//
			if( doc.significantFields.length > 0 )
			{
				action = "Resolve and has significant fields";
				expect( func, `${message} - ${action}`
				).to.throw(
					MyError,
					/missing required fields to resolve object/
				);
			}
			
			//
			// Handle document without significant fields.
			// Should find the document matching the provided field.
			//
			else
			{
				//
				// Resolve.
				//
				action = "Resolve and has not significant fields";
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Assert document state.
				//
				action = "Result";
				expect( result, `${message} - ${action}` ).to.be.true;
				action = "Contents";
				expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
				action = "Collection";
				expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
				action = "Persistent";
				expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
				action = "Modified";
				expect( doc.modified, `${message} - ${action}` ).to.equal( false );
				
				//
				// Match document contents.
				//
				this.validateResolvedContents(
					false,				// Replace flag.
					message,			// Error message.
					doc,				// The object to test.
					original,			// The persistent contents.
					theParam.sigOne		// The selection contents.
				);
			}
			
			//
			// RESOLVE WITH ONE SIGNIFICANT FIELD MISSING AND REPLACE FLAG OFF.
			//
			
			//
			// Instantiate with all significant fields.
			//
			message = "Resolve with one significant field missing and replace flag off";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.sigOne,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Resolve function.
			//
			func = () => {
				result = doc.resolveDocument( false, true );
			};
			
			//
			// Handle document with significant fields.
			//
			if( doc.significantFields.length > 0 )
			{
				action = "Resolve and has significant fields";
				expect( func, `${message} - ${action}`
				).to.throw(
					MyError,
					/missing required fields to resolve object/
				);
			}
			
			//
			// Handle document without significant fields.
			// Should find the document matching the provided field.
			//
			else
			{
				//
				// Resolve.
				//
				action = "Resolve and has not significant fields"
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Assert document state.
				//
				action = "Result";
				expect( result, `${message} - ${action}` ).to.be.true;
				action = "Contents";
				expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
				action = "Collection";
				expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
				action = "Persistent";
				expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
				action = "Modified";
				expect( doc.modified, `${message} - ${action}` ).to.equal( false );
				
				//
				// Match document contents.
				//
				this.validateResolvedContents(
					false,				// Replace flag.
					message,			// Error message.
					doc,				// The object to test.
					original,			// The persistent contents.
					theParam.sigOne		// The selection contents.
				);
			}
			
		}	// Has sigOne.
		
		//
		// Instantiate with one significant field missing.
		//
		if( theParam.hasOwnProperty( 'noSig' ) )
		{
			//
			// RESOLVE WITHOUT SIGNIFICANT FIELD AND REPLACE FLAG ON.
			//
			
			//
			// Instantiate without significant fields.
			//
			message = "Resolve with no significant fields and replace flag on";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.noSig,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Resolve function.
			//
			func = () => {
				result = doc.resolveDocument( true, true );
			};
			
			//
			// Handle document with significant fields.
			//
			if( doc.significantFields.length > 0 )
			{
				action = "Resolve and has significant fields";
				expect( func, `${message} - ${action}`
				).to.throw(
					MyError,
					/missing required fields to resolve object/
				);
			}
			
			//
			// Handle document without significant fields.
			// Should find the document matching the provided field.
			//
			else
			{
				//
				// Resolve.
				//
				action = "Resolve and has not significant fields";
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Assert document state.
				//
				action = "Result";
				expect( result, `${message} - ${action}` ).to.be.true;
				action = "Contents";
				expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
				action = "Collection";
				expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
				action = "Persistent";
				expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
				action = "Modified";
				expect( doc.modified, `${message} - ${action}` ).to.equal( false );
				
				//
				// Match document contents.
				//
				this.validateResolvedContents(
					false,				// Replace flag.
					message,			// Error message.
					doc,				// The object to test.
					original,			// The persistent contents.
					theParam.noSig		// The selection contents.
				);
			}
			
			//
			// RESOLVE WITHOUT SIGNIFICANT FIELD AND REPLACE FLAG OFF.
			//
			
			//
			// Instantiate without significant fields.
			//
			message = "Resolve with no significant fields and replace flag off";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.noSig,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Resolve function.
			//
			func = () => {
				result = doc.resolveDocument( false, true );
			};
			
			//
			// Handle document with significant fields.
			//
			if( doc.significantFields.length > 0 )
			{
				action = "Resolve and has significant fields";
				expect( func, `${message} - ${action}`
				).to.throw(
					MyError,
					/missing required fields to resolve object/
				);
			}
			
			//
			// Handle document without significant fields.
			// Should find the document matching the provided field.
			//
			else
			{
				//
				// Resolve.
				//
				action = "Resolve and has not significant fields";
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Assert document state.
				//
				action = "Result";
				expect( result, `${message} - ${action}` ).to.be.true;
				action = "Contents";
				expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
				action = "Collection";
				expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
				action = "Persistent";
				expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
				action = "Modified";
				expect( doc.modified, `${message} - ${action}` ).to.equal( false );
				
				//
				// Match document contents.
				//
				this.validateResolvedContents(
					false,				// Replace flag.
					message,			// Error message.
					doc,				// The object to test.
					original,			// The persistent contents.
					theParam.noSig		// The selection contents.
				);
			}
			
		}	// Has noSig.
		
		//
		// Instantiate with ambiguous significant fields.
		//
		if( theParam.hasOwnProperty( 'sigAmbig' ) )
		{
			//
			// RESOLVE WITH AMBIGUOUS SIGNIFICANT FIELD AND REPLACE FLAG ON.
			//
			
			//
			// Instantiate with ambiguous significant field.
			//
			message = "Resolve with ambiguous significant fields and replace flag on";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.sigAmbig,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Resolve function.
			//
			action = "Resolve";
			func = () => {
				result = doc.resolveDocument( true, true );
			};
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/Ambiguous document reference/
			);
			
			//
			// RESOLVE WITH AMBIGUOUS SIGNIFICANT FIELD AND REPLACE FLAG OFF.
			//
			
			//
			// Instantiate with ambiguous significant field.
			//
			message = "Resolve with ambiguous significant fields and replace flag off";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.sigAmbig,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Resolve function.
			//
			action = "Resolve";
			func = () => {
				result = doc.resolveDocument( false, true );
			};
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/Ambiguous document reference/
			);
			
		}	// Has sigAmbig.
		
		//
		// Instantiate with unmatches significant fields.
		//
		if( theParam.hasOwnProperty( 'sigNoFind' ) )
		{
			//
			// RESOLVE WITH UNMATCHED SIGNIFICANT FIELD AND REPLACE FLAG ON.
			//
			
			//
			// Instantiate with unmatches significant field.
			//
			message = "Resolve with unmatched significant field and replace flag on";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.sigNoFind,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Resolve function.
			//
			action = "Resolve";
			func = () => {
				result = doc.resolveDocument( true, true );
			};
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/not found in collection/
			);
			
			//
			// RESOLVE WITH UNMATCHED SIGNIFICANT FIELD AND REPLACE FLAG OFF.
			//
			
			//
			// Instantiate with unmatches significant field.
			//
			message = "Resolve with unmatched significant field and replace flag off";
			action = "Instantiate";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.sigNoFind,
						this.defaultTestCollection
					);
			};
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Resolve function.
			//
			action = "Resolve";
			func = () => {
				result = doc.resolveDocument( true, true );
			};
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/not found in collection/
			);
			
		}	// Has sigNoFind.
		
		//
		// Change all fields except significant.
		//
		selector = K.function.clone( theParam.replace );
		for( const field in theParam.sigFind )
			selector[ field ] = theParam.sigFind[ field ];
		delete selector._id;
		delete selector._key;
		delete selector._rev;
		
		//
		// RESOLVE WITH MATCHING SIGNIFICANT FIELD AND DIFFERENT CONTENT.
		// REPLACE FLAG OFF.
		//
		
		//
		// Instantiate with matching significant field and changed content.
		//
		message = "Matching significant field, changed content and replace flag off";
		action = "Instantiate";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Resolve.
		//
		func = () => {
			result = doc.resolveDocument( false, true );
		};
		
		//
		// Handle document with significant fields.
		// Should succeed, because it will use significant fields first.
		//
		action = "Resolve";
		if( doc.significantFields.length > 0 )
		{
			//
			// Succeed.
			//
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Assert document state.
			//
			action = "Result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			
			//
			// Match document contents.
			//
			this.validateResolvedContents(
				false,				// Replace flag.
				message,			// Error message.
				doc,				// The object to test.
				original,			// The persistent contents.
				selector			// The selection contents.
			);
		
		}	// Has significant fields.
		
		//
		// Handle document without significant fields.
		// Should fail, because it will use all contents.
		//
		else
		{
			//
			// Fail.
			//
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/not found in collection/
			);
		
		}	// Has no significant fields.
		
		//
		// RESOLVE WITH MATCHING SIGNIFICANT FIELD AND DIFFERENT CONTENT.
		// REPLACE FLAG ON.
		//
		
		//
		// Instantiate with matching significant field and changed content.
		//
		message = "Matching significant field, changed content and replace flag on";
		action = "Instantiate";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Resolve.
		//
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		
		//
		// Handle document with significant fields.
		// Should succeed, because it will use significant fields first.
		//
		action = "Resolve";
		if( doc.significantFields.length > 0 )
		{
			//
			// Succeed.
			//
			expect( func, `${message} - ${action}` ).not.to.throw();
			
			//
			// Assert document state.
			//
			action = "Result";
			expect( result, `${message} - ${action}` ).to.be.true;
			action = "Contents";
			expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
			action = "Collection";
			expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
			action = "Persistent";
			expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
			
			//
			// Handle modified.
			//
			action = "Modified";
			if( doc.lockedFields.length > 0 )
				expect( doc.modified, `${message} - ${action}` ).to.equal( true );
			else
				expect( doc.modified, `${message} - ${action}` ).to.equal( false );
			
			//
			// Match document contents.
			//
			this.validateResolvedContents(
				true,				// Replace flag.
				message,			// Error message.
				doc,				// The object to test.
				original,			// The persistent contents.
				selector			// The selection contents.
			);
			
		}	// Has significant fields.
		
		//
		// Handle document without significant fields.
		// Should fail, because it will use all contents.
		//
		else
		{
			//
			// Fail.
			//
			expect( func, `${message} - ${action}`
			).to.throw(
				MyError,
				/not found in collection/
			);
			
		}	// Has no significant fields.
		
	}	// testResolveSignificantField
	
	/**
	 * Resolve reference fields
	 *
	 * This test will assert that in the presence of references and significant
	 * fields, the resolve method will prefer the references, it will perform the
	 * following checks:
	 *
	 * 	- Resolve by _id:
	 * 		- Set valid _id, invalid _key and invalid significant fields: should resolve
	 * 		_id.
	 * 	- Resolve by _key:
	 * 		- Set valid _key and invalid significant fields: should resolve _key.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveReferenceField( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		let selector;
		
		//
		// Check parameter.
		//
		message = "Checking parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).not.to.be.empty;
		
		//
		// Resolve document by reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Save references.
		//
		const ref_id = doc.document._id;
		const ref_key = doc.document._key;
		const original = K.function.clone( doc.document );
		
		//
		// Make selector.
		//
		selector = K.function.clone( theParam );
		selector._id = ref_id;
		selector._key = "UNKNOWN";
		
		//
		// RESOLVE BY ID WITH REPLACE FLAG FALSE.
		//
		
		//
		// Instantiate with ambiguous selector and reference ID.
		//
		message = "Use _id reference with replace flag off";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve.
		//
		func = () => {
			result = doc.resolveDocument( false, true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Assert document state.
		//
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( true );
		
		//
		// Match document contents.
		//
		this.validateResolvedContents(
			false,				// Replace flag.
			message,			// Error message.
			doc,				// The object to test.
			original,			// The persistent contents.
			selector			// The selection contents.
		);
		
		//
		// RESOLVE BY ID WITH REPLACE FLAG TRUE.
		//
		
		//
		// Instantiate with ambiguous selector and reference ID.
		//
		message = "Use _id reference with replace flag on";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve.
		//
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Assert document state.
		//
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( true );
		
		//
		// Match document contents.
		//
		this.validateResolvedContents(
			true,				// Replace flag.
			message,			// Error message.
			doc,				// The object to test.
			original,			// The persistent contents.
			selector			// The selection contents.
		);
		
		//
		// Make selector.
		//
		selector = K.function.clone( theParam );
		selector._key = ref_key;
		
		//
		// RESOLVE BY KEY WITH REPLACE FLAG FALSE.
		//
		
		//
		// Instantiate with ambiguous selector and reference ID.
		//
		message = "Use _key reference with replace flag off";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve.
		//
		func = () => {
			result = doc.resolveDocument( false, true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Assert document state.
		//
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		
		//
		// Match document contents.
		//
		this.validateResolvedContents(
			false,				// Replace flag.
			message,			// Error message.
			doc,				// The object to test.
			original,			// The persistent contents.
			selector			// The selection contents.
		);
		
		//
		// RESOLVE BY KEY WITH REPLACE FLAG TRUE.
		//
		
		//
		// Instantiate with ambiguous selector and reference ID.
		//
		message = "Use _id reference with replace flag on";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					selector,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve.
		//
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// Assert document state.
		//
		action = "Result";
		expect( result, `${message} - ${action}` ).to.be.true;
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( true );
		
		//
		// Match document contents.
		//
		this.validateResolvedContents(
			true,				// Replace flag.
			message,			// Error message.
			doc,				// The object to test.
			original,			// The persistent contents.
			selector			// The selection contents.
		);
	
	}	// testResolveReferenceField
	
	/**
	 * Resolve without raising
	 *
	 * This test will assert that setting the doRaise flag to off prevents exceptions
	 * from being raised only in case the document was not found.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveNoException( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		message = "Checking parameter";
		expect( theParam, message ).to.be.an.object;
		expect( theParam, message ).not.to.be.empty;
		expect( theParam, message ).to.have.property( 'correct' );
		expect( theParam, message ).to.have.property( 'incorrect' );
		// expect( theParam, message ).to.have.property( 'duplicate' );
		
		//
		// TEST SUCCESS.
		//
		
		//
		// Set correct selector.
		//
		message = "Instantiate with correct selector";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam.correct,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve and succeed.
		//
		message = "Resolve and succeed";
		action = "Expect combination to be found";
		func = () => {
			result = doc.resolveDocument( true, true );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		
		//
		// TEST FAIL WITH NOT FOUND.
		//
		
		//
		// Set not found selector.
		//
		message = "Instantiate with not found selector";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam.incorrect,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Resolve and fail.
		//
		message = "Resolve and fail";
		action = "Expect combination not to be found";
		func = () => {
			result = doc.resolveDocument( true, false );
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		action = "Expect not found result to be false";
		expect( result,`${message} - ${action}` ).to.be.false;
		
		//
		// TEST FAIL WITH DUPLICATE.
		//
		if( theParam.hasOwnProperty( 'duplicate' ) )
		{
			//
			// Set duplicate selector.
			//
			message = "Instantiate with duplicate selector";
			func = () => {
				doc =
					new theClass(
						this.parameters.request,
						theParam.duplicate,
						this.defaultTestCollection
					);
			};
			expect( func, `${message}` ).not.to.throw();
			
			//
			// Resolve and fail.
			//
			message = "Resolve and fail";
			action = "Expect combination to be duplicate";
			func = () => {
				result = doc.resolveDocument( true, false );
			};
			expect( func,`${message} - ${action}`
			).to.throw(
				MyError,
				/resulted in more than one document found/
			);
			
		}	// Has duplicate.
		
	}	// testResolveNoException
	
	/**
	 * Resolve changed locked fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * locked fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * Note that the test will use only fields that are locked, if any of these fields
	 * are also significant, they will be removed from the test. This is to accomodate
	 * edges, where significat fields are locked by default.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeLockedField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Clone locked fields and remove significant fields.
		//
		const locked =
			doc.lockedFields.filter(
				x => (! K.function.flatten(doc.significantFields).includes( x ) )
			);
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			locked,											// List of test fields.
			theParam										// Changed value.
		);
	
	}	// testResolveChangeLockedField
	
	/**
	 * Resolve changed significant fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * significant fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeSignificantField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			K.function.flatten(doc.significantFields),		// List of test fields.
			theParam										// Changed value.
		);
		
	}	// testResolveChangeSignificantField
	
	/**
	 * Resolve changed required fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * required fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeRequiredField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			doc.requiredFields,								// List of test fields.
			theParam										// Changed value.
		);
		
	}	// testResolveChangeRequiredField
	
	/**
	 * Resolve changed unique fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * unique fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeUniqueField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			doc.uniqueFields,								// List of test fields.
			theParam										// Changed value.
		);
		
	}	// testResolveChangeUniqueField
	
	/**
	 * Resolve changed local fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * local fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeLocalField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			doc.localFields,								// List of test fields.
			theParam										// Changed value.
		);
		
	}	// testResolveChangeLocalField
	
	/**
	 * Resolve changed standard fields
	 *
	 * This test will validate the behaviour of a persistent document when its
	 * standard fields are changed in the background and the document is resolved, it
	 * will perform the following checks:
	 *
	 * 	- If revision change does not raise an exception:
	 * 		- With replace flag off:
	 * 			- Reference fields are not changed.
	 * 		- With replace flag on:
	 * 			- Reference fields are not changed.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testResolveChangeStandardField( theClass, theParam = null )
	{
		let doc;
		let func;
		let message;
		
		//
		// ToDo:
		// Should make special fields list a static method.
		//
		// Instantiate from reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_filled,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Collect standard fields.
		//
		const fields = [];
		for( const field in doc.document )
		{
			if( (! doc.lockedFields.includes( field ))
			 && (! doc.significantFields.includes( field ))
			 && (! doc.requiredFields.includes( field ))
			 && (! doc.uniqueFields.includes( field ))
			 && (! doc.localFields.includes( field )) )
				fields.push( field );
		}
		
		//
		// Perforn test.
		//
		this.checkChangedContents(
			theClass,										// Class to test.
			this.intermediate_results.key_insert_filled,	// Test object reference.
			fields,											// List of test fields.
			theParam										// Changed value.
		);
		
	}	// testResolveChangeStandardField
	
	
	/****************************************************************************
	 * REPLACE TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test replacing a non persistent object
	 *
	 * Assert that replacing a non persistent object fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testReplaceNonPersistent( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let message;
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Replace.
		//
		message = "Replace";
		func = () => {
			result = doc.replaceDocument();
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/document is not persistent/
		);
		
	}	// testReplaceNonPersistent
	
	/**
	 * Test replacing a non existing object
	 *
	 * Assert that replacing a non existant object fails.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testReplaceNonExisting( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiation from existing reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Clone document.
		//
		const clone = K.function.clone(doc.document);
		
		//
		// Remove document.
		//
		message = "Removing existing document";
		func = () => {
			db._remove(doc.document._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Replace.
		//
		message = "Replace";
		func = () => {
			result = doc.replaceDocument();
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/not found in collection/
		);
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testReplaceNonExisting
	
	/**
	 * Test replacing persistent values
	 *
	 * Resolve document, update the value in the background and assert that replacing
	 * the document will fail when modifying locked fields and not for others.
	 *
	 * The parameter contains either null, or an array of fields to exclude from the test.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testReplacePersistentValue( theClass, theParam = null )
	{
		let doc;
		let tmp;
		let meta;
		let func;
		let result;
		let state;
		let status;
		let action;
		let message;
		let selector;
		
		//
		// Instantiate from existing reference.
		//
		const func_get = () => {
			tmp =
				db._collection(this.defaultTestCollection)
					.document(this.intermediate_results.key_insert_filled);
		};
		message = "Instantiate from reference";
		expect( func_get, `${message}` ).not.to.throw();
		
		//
		// Clone document.
		// We resolved an immutable document.
		//
		const clone = K.function.clone(tmp);
		
		//
		// Get excluded fields.
		//
		const excluded = ( Array.isArray( theParam ) ) ? theParam : [];
		
		//
		// Iterate document properties.
		//
		for( const field in clone )
		{
			//
			// Skip references and revision.
			//
			if( (field !== '_id')
			 && (field !== '_key')
			 && (field !== '_rev')
			 && (! excluded.includes( field )) )
			{
				//
				// Instantiate from existing reference.
				//
				message = "Resolve from reference";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							this.intermediate_results.key_insert_filled,
							this.defaultTestCollection,
							false
						);
				};
				expect( func, `${message}` ).not.to.throw();
				action = "Persistent";
				expect(doc.persistent, `${message} - ${action}`).to.equal(true);

				//
				// Set action.
				//
				if( doc.restrictedFields.includes( field ) )
				{
					status = 'R';
					state = `Restricted field [${field}]`;
				}
				else if( doc.lockedFields.includes( field ) )
				{
					status = 'L';
					state = `Locked field [${field}]`;
				}
				else if( K.function.flatten(doc.significantFields).includes( field ) )
				{
					status = 'S';
					state = `Significant field [${field}]`;
				}
				else if( doc.requiredFields.includes( field ) )
				{
					status = 'Q';
					state = `Required field [${field}]`;
				}
				else if( doc.uniqueFields.includes( field ) )
				{
					status = 'U';
					state = `Unique field [${field}]`;
				}
				else
				{
					status = null;
					state = `Field [${field}]`;
				}
				action = state;
				
				//
				// Update field.
				//
				selector = {};
				selector[ field ] = "THIS_WAS_CHANGED";
				message = `Update persistent value`;
				func = () => {
					meta = db._collection(this.defaultTestCollection)
						.update(
							this.intermediate_results.key_insert_filled,
							selector,
							{waitForSync: true}
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Update revision.
				// Or it would always raise an exception.
				//
				if( doc.document._rev !== meta._rev )
					doc.document._rev = meta._rev;
				
				//
				// Replace.
				//
				message = "Replace";
				func = () => {
					result = doc.replaceDocument();
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						action = state + " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( tmp, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message}`
						).to.throw(
							MyError,
							/Constraint violation/
						);
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).not.to.equal( tmp[ field ] );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
				}
				
				//
				// Delete field.
				//
				selector = {};
				selector[ field ] = null;
				message = `Delete persistent value`;
				func = () => {
					meta = db._collection(this.defaultTestCollection)
						.update(
							this.intermediate_results.key_insert_filled,
							selector,
							{waitForSync: true, keepNull: false}
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Update revision.
				// Or it would always raise an exception.
				//
				if( doc.document._rev !== meta._rev )
					doc.document._rev = meta._rev;
				
				//
				// Replace.
				//
				message = "Replace";
				action = state;
				func = () => {
					result = doc.replaceDocument();
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						break;
					
					case 'L':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( tmp[ field ], `${message} - ${action}` ).to.equal( doc.document[ field ] );
						break;
				}
				
			}	// Not reference or revision.
			
		}	// Iterating document properties.
		
		//
		// Remove document.
		//
		message = "Remove";
		func = () => {
			db._remove(clone._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testReplacePersistentValue
	
	/**
	 * Test replacing content values
	 *
	 * Modify and delete document contents without using setDocumentProperties() and
	 * assert that when replacing the document errors are caught.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testReplaceContentValue( theClass, theParam = null )
	{
		let doc;
		let tmp;
		let meta;
		let func;
		let result;
		let state;
		let status;
		let action;
		let message;
		let selector;
		
		//
		// Instantiate from existing reference.
		//
		const func_get = () => {
			tmp =
				db._collection(this.defaultTestCollection)
					.document(this.intermediate_results.key_insert_filled);
		};
		message = "Instantiate from reference";
		expect( func_get, `${message}` ).not.to.throw();
		
		//
		// Clone document.
		// We resolved an immutable document.
		//
		const clone = K.function.clone(tmp);
		
		//
		// Get excluded fields.
		//
		const excluded = ( Array.isArray( theParam ) ) ? theParam : [];
		
		//
		// Iterate document properties.
		//
		for( const field in clone )
		{
			//
			// Skip references, revision and excluded fields.
			//
			if( (field !== '_id')
			 && (field !== '_key')
			 && (field !== '_rev')
			 && (field !== Dict.descriptor.kNID)
			 && (! excluded.includes( field )) )
			{
				//
				// Instantiate from existing reference.
				//
				message = "Resolve from reference";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							this.intermediate_results.key_insert_filled,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				action = "Persistent";
				expect(doc.persistent, `${message} - ${action}`).to.equal(true);
				
				//
				// Set action.
				//
				if( doc.restrictedFields.includes( field ) )
				{
					status = 'R';
					state = `Restricted field [${field}]`;
				}
				else if( doc.lockedFields.includes( field ) )
				{
					status = 'L';
					state = `Locked field [${field}]`;
				}
				else if( K.function.flatten(doc.significantFields).includes( field ) )
				{
					status = 'S';
					state = `Significant field [${field}]`;
				}
				else if( doc.requiredFields.includes( field ) )
				{
					status = 'Q';
					state = `Required field [${field}]`;
				}
				else if( doc.uniqueFields.includes( field ) )
				{
					status = 'U';
					state = `Unique field [${field}]`;
				}
				else
				{
					status = null;
					state = `Field [${field}]`;
				}
				action = state;
				
				//
				// Update field using default method.
				// Should only raise an exception for locked fields.
				//
				message = "Chenge value with setDocumentProperties()";
				selector = {};
				selector[ field ] = "1234";
				func = () => {
					doc.setDocumentProperties( selector, true );
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message}`
						).to.throw(
							MyError,
							/Property is locked/
						);
						expect( doc.document, `${message} - ${action}` ).to.have.property( field );
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
				}
				action = state;
				
				//
				// Update field changing contents.
				// Should only raise an exception for locked fields.
				//
				message = "Change value in contents";
				func = () => {
					doc.document[ field ] = "1234";
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'L':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( "1234" );
						break;
				}
				action = state;
				
				//
				// Replace.
				//
				message = "Replace changed value";
				func = () => {
					result = doc.replaceDocument();
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						action = state + " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( tmp, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message} - ${action}`
						).to.throw(
							MyError,
							/Constraint violation/
						);
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document[ field ].toString(), `${message} - ${action}` ).to.equal( "1234" );
						action += " is persistent";
						expect(doc.persistent, `${message} - ${action}`).to.equal(true);
						expect( func_get, "resolving persistent copy" ).not.to.throw();
						action = state + " matches persistent";
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( tmp[ field ] );
						break;
				}
				action = state;
				
				//
				// Remove document.
				//
				message = "Remove";
				func = () => {
					db._remove(clone._id);
				};
				expect( func, `${message}` ).not.to.throw();
				
				//
				// Restore.
				//
				message = "Restore";
				func = () => {
					db._collection(this.defaultTestCollection).insert( clone );
				};
				expect( func, `${message}` ).not.to.throw();
				
				//
				// Instantiate from existing reference.
				//
				message = "Resolve from reference";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							this.intermediate_results.key_insert_filled,
							this.defaultTestCollection
						);
				};
				expect( func, `${message}` ).not.to.throw();
				action = "Persistent";
				expect(doc.persistent, `${message} - ${action}`).to.equal(true);
				
				//
				// Delete field using default method.
				// Should only raise an exception for locked fields.
				//
				message = "Delete value with setDocumentProperties()";
				selector = {};
				selector[ field ] = null;
				func = () => {
					doc.setDocumentProperties( selector, true );
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message}`
						).to.throw(
							MyError,
							/Property is locked/
						);
						expect( doc.document, `${message} - ${action}` ).to.have.property( field );
						expect( doc.document[ field ], `${message} - ${action}` ).to.equal( clone[ field ] );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
				}
				action = state;
				
				//
				// Delete field changing contents.
				// Should only raise an exception for locked fields.
				//
				message = "Delete value in contents";
				func = () => {
					delete doc.document[ field ];
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
				}
				action = state;
				
				//
				// Replace.
				//
				message = "Replace";
				func = () => {
					result = doc.replaceDocument();
				};
				switch( status )
				{
					case 'R':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'L':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'S':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'Q':
						expect( func, `${message} - ${action}`
						).to.throw(
							MyError,
							/missing required field/
						);
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					case 'U':
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
					
					default:
						expect( func, `${message} - ${action}` ).not.to.throw();
						expect( doc.document, `${message} - ${action}` ).not.to.have.property( field );
						break;
				}
				action = state;
			
			}	// Not reference or revision.
			
		}	// Iterating document properties.
		
		//
		// Remove document.
		//
		message = "Remove";
		func = () => {
			db._remove(clone._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testReplaceContentValue
	
	
	/****************************************************************************
	 * REMOVE TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test removing an object
	 *
	 * Assert that removing an object succeeds.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testRemoveDocument( theClass, theParam = null )
	{
		let doc;
		let func;
		let clone;
		let result;
		let action;
		let message;
		let unconstrained;
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiate from reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Clone document.
		//
		clone = K.function.clone( doc.document );
		
		//
		// Remove with fail.
		//
		message = "Test remove constrained with fail flag on";
		func = () => {
			result = doc.removeDocument( true );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Result";
		expect(result, `${message} - ${action}`).to.equal(true);
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection)
				.insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiate from reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Remove without fail.
		//
		message = "Test remove constrained with fail flag off";
		func = () => {
			result = doc.removeDocument( false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Result";
		expect(result, `${message} - ${action}`).to.equal(true);
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection)
				.insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testRemoveDocument
	
	/**
	 * Test removing a non persistent object
	 *
	 * Assert that removing a non persistent object raises with fail flag on or off.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testRemoveNonPersistent( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let message;
		
		//
		// Instantiate empty object.
		//
		message = "Instantiation";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theParam,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Remove.
		//
		message = "Remove with fail on";
		func = () => {
			result = doc.removeDocument( true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/document is not persistent/
		);
		
		//
		// Remove.
		//
		message = "Remove with fail off";
		func = () => {
			result = doc.removeDocument( false );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/document is not persistent/
		);
		
	}	// testRemoveNonPersistent
	
	/**
	 * Test removing a non existing object
	 *
	 * Assert that removing a non existing object raises with fail flag on and fails
	 * without raising with fail flag off.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testRemoveNonExisting( theClass, theParam = null )
	{
		let doc;
		let func;
		let result;
		let action;
		let message;
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiation from existing reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Clone document.
		//
		const clone = K.function.clone(doc.document);
		
		//
		// Remove document.
		//
		message = "Removing existing document";
		func = () => {
			db._remove(doc.document._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Remove with fail.
		//
		message = "Test remove non existing  with fail flag on";
		func = () => {
			result = doc.removeDocument( true );
		};
		expect( func, `${message}`
		).to.throw(
			MyError,
			/not found in collection/
		);
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiation from existing reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Remove document.
		//
		message = "Removing existing document";
		func = () => {
			db._remove(doc.document._id);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Remove without fail.
		//
		message = "Test remove non existing  with fail flag off";
		func = () => {
			result = doc.removeDocument( false );
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(false);
		action = "Result";
		expect(result, `${message} - ${action}`).to.equal(false);
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection).insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testRemoveNonExisting
	
	/**
	 * Test removing a constrained object
	 *
	 * Assert that removing a constrained object raises with fail flag on or off.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testRemoveConstrained( theClass, theParam = null )
	{
		let doc;
		let func;
		let clone;
		let result;
		let action;
		let message;
		let unconstrained;
		
		//
		// Clone document.
		//
		message = "Cloning document";
		func = () => {
			clone =
				K.function.clone(
					db._collection(this.defaultTestCollection).document(
						this.intermediate_results.key_insert_same
					)
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Set constrained state.
		//
		message = "Setting constrained state";
		func = () => {
			db._collection(this.defaultTestCollection).update(
				this.intermediate_results.key_insert_same,
				{ name: "CONSTRAINED" }
			);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Instantiate from existing reference.
		//
		message = "Instantiate from reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					this.intermediate_results.key_insert_same,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		action = "Persistent";
		expect(doc.persistent, `${message} - ${action}`).to.equal(true);
		
		//
		// Get constrained status.
		//
		message = "Get constrained status";
		func = () => {
			unconstrained = doc.validateDocumentConstraints( false );
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Handle constrained.
		//
		if( unconstrained === false )
		{
			//
			// Remove with fail.
			//
			message = "Test remove constrained with fail flag on";
			func = () => {
				result = doc.removeDocument( true );
			};
			expect( func, `${message}`
			).to.throw(
				MyError,
				/has constraints that prevent it from being removed/
			);
			action = "Persistent";
			expect(doc.persistent, `${message} - ${action}`).to.equal(true);
			
			//
			// Remove without fail.
			//
			message = "Test remove constrained with fail flag off";
			func = () => {
				result = doc.removeDocument( false );
			};
			expect( func, `${message}`
			).to.throw(
				MyError,
				/has constraints that prevent it from being removed/
			);
			action = "Persistent";
			expect(doc.persistent, `${message} - ${action}`).to.equal(true);
			
		}	// Document is constrained.
		
		//
		// Remove document.
		//
		message = "Remove";
		func = () => {
			db._collection(this.defaultTestCollection)
				.remove(this.intermediate_results.key_insert_same);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Restore.
		//
		message = "Restore";
		func = () => {
			db._collection(this.defaultTestCollection)
				.insert( clone );
		};
		expect( func, `${message}` ).not.to.throw();
		
	}	// testRemoveConstrained
	
	
	/****************************************************************************
	 * COMMON TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Validate resolve changed contents
	 *
	 * This method expects a list of fields and for each field it will resolve the
	 * object, change the field in the background and resolve the object again: it
	 * expects the operation to fail, if the revision changed, or the field not to be
	 * changed if the revision is the same.
	 *
	 * Updates and test documents are expected to be found in the collection
	 * this.defaultTestCollection.
	 *
	 * @param theClass		{Function}	The class to test.
	 * @param theReference	{String}	The test object _key.
	 * @param theFields		{Array}		The list of fields to test.
	 * @param theValue		{*}			The changed value.
	 */
	checkChangedContents( theClass, theReference, theFields, theValue )
	{
		let doc;
		let tmp;
		let func;
		let result;
		let action;
		let message;
		let selector;
		let revision;
		
		//
		// Resolve document by reference.
		//
		message = "Instantiate with saved reference";
		func = () => {
			doc =
				new theClass(
					this.parameters.request,
					theReference,
					this.defaultTestCollection
				);
		};
		expect( func, `${message}` ).not.to.throw();
		
		//
		// Assert document state.
		//
		action = "Contents";
		expect( doc.document, `${message} - ${action}` ).not.to.be.empty;
		action = "Collection";
		expect( doc.collection, `${message} - ${action}` ).to.equal(this.defaultTestCollection);
		action = "Persistent";
		expect( doc.persistent, `${message} - ${action}` ).to.equal( true );
		action = "Modified";
		expect( doc.modified, `${message} - ${action}` ).to.equal( false );
		
		//
		// Save original contents and test fields list.
		//
		const original = K.function.clone( doc.document );
		
		//
		// Try fields with replace flag off.
		//
		message = "Replace flag off";
		for( const field of theFields )
		{
			//
			// Do test if the document has it.
			//
			if( doc.document.hasOwnProperty( field ) )
			{
				//
				// Resolve document by reference.
				//
				action = "Instantiate with reference";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							theReference,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Save current revision.
				//
				revision = doc.document._rev;
				
				//
				// Change field value.
				//
				action = `Change field [${field}] value`;
				selector = {};
				selector[ field ] = theValue;
				func = () => {
					db._collection(this.defaultTestCollection)
						.update(
							theReference,
							selector,
							{waitForSync: true}
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Catch revision change.
				//
				func = () => {
					tmp = db._collection(this.defaultTestCollection)
						.document(theReference);
				};
				action = `Getting revision with changed field [${field}]`;
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Resolve document.
				//
				func = () => {
					result = doc.resolveDocument( false, true );
				};
				if( revision !== tmp._rev )
				{
					action = `Catch revision change with changed field [${field}]`;
					expect( func, `${message} - ${action}`
					).to.throw(
						MyError,
						/Ambiguous document reference/
					);
				}
				else
				{
					action = `Resolve with changed field [${field}]`;
					expect( func, `${message} - ${action}` ).not.to.throw();
					action = `Check field [${field}] value`;
					expect( doc.document[ field ], `${message} - ${action}` )
						.to.equal( original[ field ] );
				}
				
				//
				// Check removing field if not reference.
				//
				if( (field !== '_id')
				 && (field !== '_key')
				 && (field !== '_rev') )
				{
					//
					// Restore field value.
					//
					action = `Restore field [${field}]`;
					selector = {};
					selector[ field ] = original[ field ];
					func = () => {
						db._collection(this.defaultTestCollection)
							.update(
								theReference,
								selector,
								{waitForSync: true}
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Resolve document by reference.
					//
					action = "Instantiate with reference";
					func = () => {
						doc =
							new theClass(
								this.parameters.request,
								theReference,
								this.defaultTestCollection
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Save current revision.
					//
					revision = doc.document._rev;
					
					//
					// Remove field.
					//
					action = `Remove field [${field}]`;
					selector = {};
					selector[ field ] = null;
					func = () => {
						db._collection(this.defaultTestCollection)
							.update(
								theReference,
								selector,
								{waitForSync: true, keepNull: false}
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Catch revision change.
					//
					func = () => {
						tmp = db._collection(this.defaultTestCollection)
							.document(theReference);
					};
					action = `Getting revision with deleted field [${field}]`;
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Resolve document.
					//
					func = () => {
						result = doc.resolveDocument( false, true );
					};
					if( revision !== tmp._rev )
					{
						action = `Catch revision change with deleted field [${field}]`;
						expect( func, `${message} - ${action}`
						).to.throw(
							MyError,
							/Ambiguous document reference/
						);
					}
					else
					{
						action = `Resolve with deleted field [${field}]`;
						expect( func, `${message} - ${action}` ).not.to.throw();
						action = `Check field [${field}] value`;
						expect( doc.document[ field ], `${message} - ${action}` )
							.to.equal( original[ field ] );
					}
					
				}	// Not a reference field.
				
				//
				// Restore field value.
				//
				action = `Restore field [${field}]`;
				selector = {};
				selector[ field ] = original[ field ];
				func = () => {
					db._collection(this.defaultTestCollection)
						.update(
							theReference,
							selector,
							{waitForSync: true}
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
			}	// Document has property.
			
		}	// Iterating fields with replace flag off.
		
		//
		// Try fields with replace flag off.
		//
		message = "Replace flag on";
		for( const field of theFields )
		{
			//
			// Do test if the document has it.
			//
			if( doc.document.hasOwnProperty( field ) )
			{
				//
				// Resolve document by reference.
				//
				action = "Instantiate with reference";
				func = () => {
					doc =
						new theClass(
							this.parameters.request,
							theReference,
							this.defaultTestCollection
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Save current revision.
				//
				revision = doc.document._rev;
				
				//
				// Change field value.
				//
				action = "Change value";
				selector = {};
				selector[ field ] = theValue;
				func = () => {
					db._collection(this.defaultTestCollection)
						.update(
							theReference,
							selector,
							{waitForSync: true}
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Catch revision change.
				//
				func = () => {
					tmp = db._collection(this.defaultTestCollection)
						.document(theReference);
				};
				action = `Getting revision with changed field [${field}]`;
				expect( func, `${message} - ${action}` ).not.to.throw();
				
				//
				// Resolve document.
				//
				func = () => {
					result = doc.resolveDocument( true, true );
				};
				if( revision !== tmp._rev )
				{
					action = `Catch revision change with changed field [${field}]`;
					expect( func, `${message} - ${action}`
					).to.throw(
						MyError,
						/Ambiguous document reference/
					);
				}
				else
				{
					action = `Resolve with changed field [${field}]`;
					expect( func, `${message} - ${action}` ).not.to.throw();
					action = `Check field [${field}] value`;
					if( field === '_rev')
						expect( doc.document[ field ], `${message} - ${action}` )
							.to.equal( revision );
					else
						expect( doc.document[ field ], `${message} - ${action}` )
							.to.equal( original[ field ] );
				}
				
				//
				// Check removing field if not reference.
				//
				if( (field !== '_id')
					&& (field !== '_key')
					&& (field !== '_rev') )
				{
					//
					// Restore field value.
					//
					action = `Restore field [${field}]`;
					selector = {};
					selector[ field ] = original[ field ];
					func = () => {
						db._collection(this.defaultTestCollection)
							.update(
								theReference,
								selector,
								{waitForSync: true}
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Resolve document by reference.
					//
					action = "Instantiate with reference";
					func = () => {
						doc =
							new theClass(
								this.parameters.request,
								theReference,
								this.defaultTestCollection
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Save current revision.
					//
					revision = doc.document._rev;
					
					//
					// Remove field.
					//
					action = `Remove field [${field}]`;
					selector = {};
					selector[ field ] = null;
					func = () => {
						db._collection(this.defaultTestCollection)
							.update(
								theReference,
								selector,
								{waitForSync: true, keepNull: false}
							);
					};
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Catch revision change.
					//
					func = () => {
						tmp = db._collection(this.defaultTestCollection)
							.document(theReference);
					};
					action = `Getting revision with changed field [${field}]`;
					expect( func, `${message} - ${action}` ).not.to.throw();
					
					//
					// Resolve document.
					//
					func = () => {
						result = doc.resolveDocument( false, true );
					};
					if( revision !== tmp._rev )
					{
						action = `Catch revision change with changed field [${field}]`;
						expect( func, `${message} - ${action}`
						).to.throw(
							MyError,
							/Ambiguous document reference/
						);
					}
					else
					{
						action = `Resolve with changed field [${field}]`;
						expect( func, `${message} - ${action}` ).not.to.throw();
						action = `Check field [${field}] value`;
						expect( doc.document[ field ], `${message} - ${action}` )
							.to.equal( original[ field ] );
					}
					
				}	// Not a reference field.
				
				//
				// Restore field value.
				//
				action = `Restore field [${field}]`;
				selector = {};
				selector[ field ] = original[ field ];
				func = () => {
					db._collection(this.defaultTestCollection)
						.update(
							theReference,
							selector,
							{waitForSync: true}
						);
				};
				expect( func, `${message} - ${action}` ).not.to.throw();
				
			}	// Document has property.
			
		}	// Iterating fields with replace flag on.
		
	}	// checkChangedContents
	
	/**
	 * Validate local properties
	 *
	 * This method can be used to validate the presence of local properties, it
	 * expects an array parameter, theExcluded, containing the list of excluded
	 * properties.
	 *
	 * The method will iterate through all local properties and assert the property is
	 * there and not empty. If the property is among the provided excluded properties,
	 * the method will assert that the property is not there.
	 *
	 * The theMessage parameter is used to provide the main error message part.
	 *
	 * @param theMessage	{String}	Main error message part.
	 * @param theObject		{Document}	The object to test.
	 * @param theExcluded	{Array}		List of excluded properties.
	 */
	checkLocalProperties( theMessage, theObject, theExcluded = [] )
	{
		let action;
		
		//
		// Iterate local fields.
		//
		for( const field of theObject.localFields )
		{
			//
			// Handle exclusions.
			//
			if( theExcluded.includes( field ) )
			{
				action = `Field [${field}] is not there`;
				expect( theObject.document, `${theMessage} - ${action}` ).not.to.have.property( field );
			}
			
			//
			// Handle inclusions.
			//
			else
			{
				action = `Field [${field}] exists`;
				expect( theObject.document, `${theMessage} - ${action}` ).to.have.property( field );
				action = `Field [${field}] is not empty`;
				expect( theObject.document[ field ], `${theMessage} - ${action}` ).not.to.be.empty;
			}
		}
		
	}	// checkLocalProperties
	
	
	/****************************************************************************
	 * STATIC TEST ROUTINE DEFINITIONS											*
	 ****************************************************************************/
	
	/**
	 * Test edge collection check
	 *
	 * Assert that it fails on document collection and succeeds on edge collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testStaticEdgeCollection( theClass, theParam = null )
	{
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter is object" ).to.be.an.object;
		expect( theParam, "Parameter has edge" ).to.have.property( 'edge' );
		expect( theParam, "Parameter has document" ).to.have.property( 'document' );
		expect( theParam, "Parameter has request" ).to.have.property( 'request' );
		
		//
		// Test with fail on.
		//
		message = "Test with fail on";
		action = "Edge collection";
		func = () => {
			result =
				theClass.isEdgeCollection(
					theParam.request,
					theParam.edge,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		action = "Document collection";
		func = () => {
			result =
				theClass.isEdgeCollection(
					theParam.request,
					theParam.document,
					true
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/to be an edge collection/
		);
		
		//
		// Test with fail off.
		//
		message = "Test with fail off";
		action = "Edge collection";
		func = () => {
			result =
				theClass.isEdgeCollection(
					theParam.request,
					theParam.edge,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		action = "Document collection";
		func = () => {
			result =
				theClass.isEdgeCollection(
					theParam.request,
					theParam.document,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.false;
		
	}	// testStaticEdgeCollection
	
	/**
	 * Test document collection check
	 *
	 * Assert that it fails on edge collection and succeeds on document collection.
	 *
	 * @param theClass	{Function}	The class to test.
	 * @param theParam	{*}			Eventual parameters for the method.
	 */
	testStaticDocumentCollection( theClass, theParam = null )
	{
		let func;
		let result;
		let action;
		let message;
		
		//
		// Check parameter.
		//
		expect( theParam, "Parameter is object" ).to.be.an.object;
		expect( theParam, "Parameter has edge" ).to.have.property( 'edge' );
		expect( theParam, "Parameter has document" ).to.have.property( 'document' );
		expect( theParam, "Parameter has request" ).to.have.property( 'request' );
		
		//
		// Test with fail on.
		//
		message = "Test with fail on";
		action = "Edge collection";
		func = () => {
			result =
				theClass.isDocumentCollection(
					theParam.request,
					theParam.edge,
					true
				);
		};
		expect( func, `${message} - ${action}`
		).to.throw(
			MyError,
			/to be a document collection/
		);
		
		action = "Document collection";
		func = () => {
			result =
				theClass.isDocumentCollection(
					theParam.request,
					theParam.document,
					true
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
		//
		// Test with fail off.
		//
		message = "Test with fail off";
		action = "Edge collection";
		func = () => {
			result =
				theClass.isDocumentCollection(
					theParam.request,
					theParam.edge,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.false;
		
		action = "Document collection";
		func = () => {
			result =
				theClass.isDocumentCollection(
					theParam.request,
					theParam.document,
					false
				);
		};
		expect( func, `${message} - ${action}` ).not.to.throw();
		expect( result, `${message} - ${action} result` ).to.be.true;
		
	}	// testStaticDocumentCollection
	
	
	/****************************************************************************
	 * VALIDATION UTILITIES														*
	 ****************************************************************************/
	
	/**
	 * Validate the contents after inserting.
	 *
	 * This method can be used to assert that the provided contents can be found in
	 * the document, except for restricted properties.
	 *
	 * It will iterate through theNewData properties and compare the values of the
	 * updated object with the provided data and asserting that the object contains
	 * all provided data elements, except for restricted properties.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theMessage	{String}	The main error message part.
	 * @param theObject		{Document}	The tested class instance.
	 * @param theContents	{Object}	The data used for instantiation.
	 */
	assertAllProvidedDataInDocument(
		theMessage,		// Error message.
		theObject,		// The document object.
		theContents		// The instantiation contents data.
	)
	{
		//
		// Init local storage.
		//
		let status;
		let action;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
		//
		for( const field in theContents )
		{
			//
			// Set action.
			// Note: order is important:
			//
			// 1.) Restricted.
			// 2.) Locked.
			// 3.) Significant.
			// 4.) Required.
			// 5.) Unique.
			//
			if( theObject.restrictedFields.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( theObject.lockedFields.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( theObject.requiredFields.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( theObject.uniqueFields.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Handle provided value and not restricted.
			//
			if( (status !== 'R')					// Restricted field,
			 && (theContents[ field ] !== null) )	// or deleted field.
			{
				//
				// Adjust action.
				//
				action += ' set';
				
				//
				// Assert field is there.
				//
				expect( theObject.document, `${theMessage} - ${action}` ).to.have.property(field);
				if( theObject.document.hasOwnProperty( field ) )
				{
					//
					// Parse by descriptor status.
					//
					switch( status )
					{
						//
						// Locked fields are set.
						//
						case 'L':
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Significant fields are set.
						//
						case 'S':
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Required fields are set.
						//
						case 'Q':
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// Unique fields are set.
						//
						case 'U':
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
						//
						// All other fields are set.
						//
						default:
							this.compareValues(
								theContents[ field ],
								theObject.document[ field ],
								theMessage,
								action
							);
							break;
						
					}	// Parsing by descriptor status.
					
				}	// Has field.
				
			}	// Neither restricted nor deleted.
			
			//
			// Handle restricted or deleted fields.
			// Should not have been set, or should have been deleted.
			//
			else
			{
				//
				// Update action.
				//
				if( theContents[ field ] !== null )
					action += " deleted";
				
				//
				// Assert property is not there.
				//
				expect( theObject.document, `${theMessage} - ${action}` )
					.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replace properties.
		
	}	// assertAllProvidedDataInDocument
	
	/**
	 * Validate replacing data in persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theMessage	{String}	The main error message part.
	 * @param theFlag		{Boolean}	The setDocumentProperties() replace flag.
	 * @param theObject		{Document}	The tested class instance.
	 * @param theNewData	{Object}	The data used for replace.
	 */
	validatePersistentReplace(
		theMessage,		// Error message.
		theFlag,		// Replace flag.
		theObject,		// The document object.
		theNewData		// The replacement data.
	)
	{
		//
		// Init local storage.
		//
		let op;
		let func;
		let action;
		let replace;
		
		//
		// Clone existing and new data.
		// We clone new data, because if the replace raises an exception, we must
		// replace the replaced value with the original one, since the exception would
		// have prevented the replace.
		//
		const oldData = JSON.parse(JSON.stringify(theObject.document));
		const newData = JSON.parse(JSON.stringify(theNewData));
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
		// Note: order is important:
		//
		// 1.) Restricted.
		// 2.) Locked.
		// 3.) Significant.
		// 4.) Required.
		// 5.) Unique.
		//
		for( const field in newData )
		{
			//
			// Set operation.
			//
			op = ( newData[ field ] === null ) ? 'Delete' : 'Replace';
			op = ( theObject.document.hasOwnProperty( field ) )
				 ? `${op} existing`
				 : `${op} missing`;
			
			//
			// Replace field function.
			//
			replace = {};
			replace[ field ] = newData[ field ];
			func = () => {
				theObject.setDocumentProperties(
					replace,
					theFlag
				);
			};
			
			//
			// Replace restricted field.
			//
			if( theObject.restrictedFields.includes( field ) )
			{
				action = `${op} restricted [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace locked field,
			// and set new data to original data if the replace raises an exception.
			//
			else if( theObject.lockedFields.includes( field ) )
			{
				action = `${op} locked [${field}]`;
				expect( func, `${theMessage} - ${action}`
				).to.throw(
					MyError,
					/Property is locked/
				);
				
				if( oldData.hasOwnProperty( field ) )
					newData[ field ] = oldData[ field ];
				else
					delete newData[ field ];
			}
			
			//
			// Replace significant field.
			//
			else if( significant.includes( field ) )
			{
				action = `${op} significant [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace required field.
			//
			else if( theObject.requiredFields.includes( field ) )
			{
				action = `${op} required [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace unique field.
			//
			else if( theObject.uniqueFields.includes( field ) )
			{
				action = `${op} unique [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace field.
			//
			else
			{
				action = `${op} [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
		}	// Iterating replace properties.
		
		//
		// Check contents.
		//
		this.validatePersistentContents
		(
			theFlag,						// Replace flag.
			theMessage,						// Error message.
			oldData,						// Data before replace.
			theObject.document,				// The object to test.
			newData,						// The replacement data.
			theObject.restrictedFields,		// Restricted fields.
			theObject.requiredFields,		// Required fields.
			theObject.lockedFields,			// Locked fields.
			theObject.uniqueFields,			// Unique fields.
			theObject.significantFields		// Significant fields.
		);
		
	}	// validatePersistentReplace
	
	/**
	 * Validate replacing data in non persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theMessage	{String}	The main error message part.
	 * @param theFlag		{Boolean}	The setDocumentProperties() replace flag.
	 * @param theObject		{Document}	The tested class instance.
	 * @param theNewData	{Object}	The data used for replace.
	 */
	validateNonPersistentReplace(
		theMessage,		// Error message.
		theFlag,		// Replace flag.
		theObject,		// The document object.
		theNewData		// The replacement data.
	)
	{
		//
		// Init local storage.
		//
		let op;
		let func;
		let action;
		let replace;
		const theOldData = JSON.parse(JSON.stringify(theObject.document));
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Replace properties.
		// Note: order is important:
		//
		// 1.) Restricted.
		// 2.) Locked.
		// 3.) Significant.
		// 4.) Required.
		// 5.) Unique.
		//
		for( const field in theNewData )
		{
			//
			// Set operation.
			//
			op = ( theNewData[ field ] === null ) ? 'Delete' : 'Replace';
			op = ( theObject.document.hasOwnProperty( field ) )
				 ? `${op} existing`
				 : `${op} missing`;
			
			//
			// Replace field function.
			//
			replace = {};
			replace[ field ] = theNewData[ field ];
			func = () => {
				theObject.setDocumentProperties(
					replace,
					theFlag
				);
			};
			
			//
			// Replace restricted field.
			// Should succeed.
			//
			if( theObject.restrictedFields.includes( field ) )
			{
				action = `${op} restricted [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace locked field.
			// Should succeed.
			//
			else if( theObject.lockedFields.includes( field ) )
			{
				action = `${op} unique [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace significant field.
			// Should succeed.
			//
			else if( significant.includes( field ) )
			{
				action = `${op} significant [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace required field.
			// Should succeed.
			//
			else if( theObject.requiredFields.includes( field ) )
			{
				action = `${op} required [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace unique field.
			// Should succeed.
			//
			else if( theObject.uniqueFields.includes( field ) )
			{
				action = `${op} unique [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
			//
			// Replace field.
			// Should succeed.
			//
			else
			{
				action = `${op} [${field}]`;
				expect( func, `${theMessage} - ${action}`).not.to.throw();
			}
			
		}	// Iterating replace properties.
		
		//
		// Check contents.
		//
		this.validateNonPersistentContents
		(
			theFlag,						// Replace flag.
			theMessage,						// Error message.
			theOldData,						// Data before replace.
			theObject.document,				// The object to test.
			theNewData,						// The replacement data.
			theObject.restrictedFields,		// Restricted fields.
			theObject.requiredFields,		// Required fields.
			theObject.lockedFields,			// Locked fields.
			theObject.uniqueFields,			// Unique fields.
			theObject.significantFields		// Significant fields.
		);
		
	}	// validateNonPersistentReplace
	
	/**
	 * Validate replaced data contents in persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theFlag			{Boolean}	The setDocumentProperties() replace flag.
	 * @param theMessage		{String}	The main error message part.
	 * @param theSource			{Object}	The original object.
	 * @param theDestination	{Object}	The replaced object.
	 * @param theReplaced		{Object}	The replacement data.
	 * @param theRestricted		{Array}		List of restricted fields.
	 * @param theRequired		{Array}		List of required fields.
	 * @param theLocked			{Array}		List of locked fields.
	 * @param theUnique			{Array}		List of unique fields.
	 * @param theSignificant	{Array}		List of significant fields.
	 */
	validatePersistentContents(
		theFlag,				// Replace flag.
		theMessage,				// Error message.
		theSource,				// Data before replace.
		theDestination,			// The object to test.
		theReplaced,			// The replacement data.
		theRestricted = [],		// Restricted fields.
		theRequired = [],		// Required fields.
		theLocked = [],			// Locked fields.
		theUnique = [],			// Unique fields.
		theSignificant = []		// Significant fields.
	)
	{
		let status;
		let action;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theSignificant.length > 0 )
			significant = K.function.flatten(theSignificant);
		
		//
		// Iterate provided replacement properties.
		// Note: order is important:
		//
		// 1.) Restricted.
		// 2.) Locked.
		// 3.) Significant.
		// 4.) Required.
		// 5.) Unique.
		//
		for( const field in theReplaced )
		{
			//
			// Set action.
			//
			if( theRestricted.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( theLocked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( theRequired.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( theUnique.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Handle provided value and not restricted.
			//
			if( (status !== 'R')					// Restricted field,
			 && (theReplaced[ field ] !== null) )	// or deleted field.
			{
				//
				// Assert field is there.
				//
				expect( theDestination, `${theMessage} - ${action}` ).to.have.property(field);
				if( theDestination.hasOwnProperty( field ) )
				{
					//
					// Check if setting or replacing.
					//
					const was_there = ( theSource.hasOwnProperty( field ) );
					
					//
					// Handle true replace flag.
					//
					if( theFlag )
					{
						//
						// Parse by descriptor status.
						// Note: order is important:
						//
						// 1.) Restricted.
						// 2.) Locked.
						// 3.) Significant.
						// 4.) Required.
						// 5.) Unique.
						//
						switch( status )
						{
							//
							// Locked fields cannot be replaced,
							// An exception will be thrown when replacing.
							//
							case 'L':
								this.compareValues(
									theSource[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are replaced.
							//
							case 'S':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are replaced.
							//
							case 'Q':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are replaced.
							//
							case 'U':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are replaced.
							//
							default:
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is true.
					
					//
					// Handle false replace flag.
					// Note: order is important:
					//
					// 1.) Restricted.
					// 2.) Locked.
					// 3.) Significant.
					// 4.) Required.
					// 5.) Unique.
					//
					else
					{
						//
						// Parse by descriptor status.
						//
						switch( status )
						{
							//
							// Locked fields cannot be replaced,
							// An exception will be thrown when replacing.
							//
							case 'L':
								this.compareValues(
									theSource[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are not replaced.
							//
							case 'S':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are not replaced.
							//
							case 'Q':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are not replaced.
							//
							case 'U':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are not replaced.
							//
							default:
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is false.
					
				}	// Has field.
				
			}	// Neither restricted nor deleted.
			
			//
			// Handle restricted or deleted fields.
			// Should not have been set, or should have been deleted.
			//
			else
			{
				//
				// Update action.
				//
				if( theReplaced[ field ] !== null )
					action += " deleted";
				
				//
				// Assert property is not there.
				// Note that locked properties cannot be modified.
				//
				if( theFlag				// Replace flag set
				 && (status !== 'L') )	// and property not locked.
					expect( theDestination, `${theMessage} - ${action}` )
						.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replaced properties.
		
	}	// validatePersistentContents
	
	/**
	 * Validate replaced data contents in non persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theFlag			{Boolean}	The setDocumentProperties() replace flag.
	 * @param theMessage		{String}	The main error message part.
	 * @param theSource			{Object}	The original object.
	 * @param theDestination	{Object}	The replaced object.
	 * @param theReplaced		{Object}	The replacement data.
	 * @param theRestricted		{Array}		List of restricted fields.
	 * @param theRequired		{Array}		List of required fields.
	 * @param theLocked			{Array}		List of locked fields.
	 * @param theUnique			{Array}		List of unique fields.
	 * @param theSignificant	{Array}		List of significant fields.
	 */
	validateNonPersistentContents(
		theFlag,				// Replace flag.
		theMessage,				// Error message.
		theSource,				// Data before replace.
		theDestination,			// The object to test.
		theReplaced,			// The replacement data.
		theRestricted = [],		// Restricted fields.
		theRequired = [],		// Required fields.
		theLocked = [],			// Locked fields.
		theUnique = [],			// Unique fields.
		theSignificant = []		// Significant fields.
	)
	{
		let status;
		let action;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theSignificant.length > 0 )
			significant = K.function.flatten(theSignificant);
		
		//
		// Iterate provided replacement properties.
		// Note: order is important:
		//
		// 1.) Restricted.
		// 2.) Locked.
		// 3.) Significant.
		// 4.) Required.
		// 5.) Unique.
		//
		for( const field in theReplaced )
		{
			//
			// Set action.
			//
			if( theRestricted.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( theLocked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( theRequired.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( theUnique.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Handle provided value and not restricted.
			//
			if( (status !== 'R')					// Restricted field,
			 && (theReplaced[ field ] !== null) )	// or deleted field.
			{
				//
				// Assert field is there.
				//
				expect( theDestination, `${theMessage} - ${action}` ).to.have.property(field);
				if( theDestination.hasOwnProperty( field ) )
				{
					//
					// Check if setting or replacing.
					//
					const was_there = ( theSource.hasOwnProperty( field ) );
					
					//
					// Handle true replace flag.
					//
					if( theFlag )
					{
						//
						// Parse by descriptor status.
						// Note: order is important:
						//
						// 1.) Restricted.
						// 2.) Locked.
						// 3.) Significant.
						// 4.) Required.
						// 5.) Unique.
						//
						switch( status )
						{
							//
							// Locked fields are replaced,
							//
							case 'L':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are replaced.
							//
							case 'S':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are replaced.
							//
							case 'Q':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are replaced.
							//
							case 'U':
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are replaced.
							//
							default:
								this.compareValues(
									( was_there ) ? theReplaced[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is true.
					
					//
					// Handle false replace flag.
					//
					else
					{
						//
						// Parse by descriptor status.
						// Note: order is important:
						//
						// 1.) Restricted.
						// 2.) Locked.
						// 3.) Significant.
						// 4.) Required.
						// 5.) Unique.
						//
						switch( status )
						{
							//
							// Locked fields are replaced in all cases.
							//
							case 'L':
								this.compareValues(
									theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Significant fields are replaced.
							//
							case 'S':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Required fields are replaced.
							//
							case 'Q':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// Unique fields are replaced.
							//
							case 'U':
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
							//
							// All other fields are replaced.
							//
							default:
								this.compareValues(
									( was_there ) ? theSource[ field ]
												  : theReplaced[ field ],
									theDestination[ field ],
									theMessage,
									action
								);
								break;
							
						}	// Parsing by descriptor status.
						
					}	// Replace flag is false.
					
				}	// Has field.
				
			}	// Neither restricted nor deleted.
			
			//
			// Handle restricted or deleted fields.
			// Should not have been set, or should have been deleted.
			//
			else
			{
				//
				// Update action.
				//
				if( theReplaced[ field ] !== null )
					action += " deleted";
				
				//
				// Assert property is not there,
				// only if the flag is true.
				//
				if( theFlag )
					expect( theDestination, `${theMessage} - ${action}` )
						.not.to.have.property(field);
				
			}	// Restricted or deleted.
			
		}	// Iterating replaced properties.
		
	}	// validateNonPersistentContents
	
	/**
	 * Validate replaced data contents in non persistent object
	 *
	 * This method will replace the properties of theObject with the properties in
	 * theNewData.
	 *
	 * It will iterate through theNewData properties and set them one by one,
	 * asserting that the operation succeeds or raises an exception. Once this process
	 * is finished it will compare the values of the updated object with the provided
	 * data and assert that the object contents are as required.
	 *
	 * The method does not return any status, errors are expected to be posted during
	 * the unit tests.
	 *
	 * @param theFlag			{Boolean}	The setDocumentProperties() replace flag.
	 * @param theMessage		{String}	The main error message part.
	 * @param theObject			{Document}	The resolved object.
	 * @param thePersistent		{Object}	The persistent contents.
	 * @param theSelection		{Object}	The selection contents.
	 */
	validateResolvedContents(
		theFlag,				// Replace flag.
		theMessage,				// Error message.
		theObject,				// The object to test.
		thePersistent,			// The persistent contents.
		theSelection			// The selection contents.
	)
	{
		let status;
		let action;
		
		//
		// Save document special fields.
		//
		const local = theObject.localFields;
		const locked = theObject.lockedFields;
		const unique = theObject.uniqueFields;
		const required = theObject.requiredFields;
		const restricted = theObject.restrictedFields;
		
		//
		// Flatten significant fields.
		//
		let significant = [];
		if( theObject.significantFields.length > 0 )
			significant = K.function.flatten(theObject.significantFields);
		
		//
		// Iterate object properties.
		// Note: order is important:
		//
		// 1.) Restricted.
		// 2.) Local.
		// 3.) Locked.
		// 4.) Significant.
		// 5.) Required.
		// 6.) Unique.
		//
		for( const field in theObject.document )
		{
			//
			// Set action.
			//
			if( restricted.includes( field ) )
			{
				status = 'R';
				action = `Restricted field [${field}]`;
			}
			else if( local.includes( field ) )
			{
				status = 'C';
				action = `Local field [${field}]`;
			}
			else if( locked.includes( field ) )
			{
				status = 'L';
				action = `Locked field [${field}]`;
			}
			else if( significant.includes( field ) )
			{
				status = 'S';
				action = `Significant field [${field}]`;
			}
			else if( required.includes( field ) )
			{
				status = 'Q';
				action = `Required field [${field}]`;
			}
			else if( unique.includes( field ) )
			{
				status = 'U';
				action = `Unique field [${field}]`;
			}
			else
			{
				status = null;
				action = `Field [${field}]`;
			}
			
			//
			// Check if there.
			//
			const in_selection = ( theSelection.hasOwnProperty( field ) );
			const in_persistent = ( thePersistent.hasOwnProperty( field ) );
			
			//
			// Parse by field type.
			// Note: order is important:
			//
			// 1.) Restricted.
			// 2.) Local.
			// 3.) Locked.
			// 4.) Significant.
			// 5.) Required.
			// 6.) Unique.
			//
			switch( status )
			{
				//
				// Handle restricted.
				// Should not be there.
				//
				case 'R':
					expect( theObject, `${theMessage} - ${action}` )
						.not.to.have.property( field );
					break;
				
				//
				// Handle local.
				// Always match persistent data.
				//
				case 'C':
					if( in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle locked.
				// Locked fields must match the persistent copy.
				//
				case 'L':
					if( in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle significant.
				// If flag is off, match selector contents;
				// if flag is on, match persistent data.
				//
				case 'S':
					if( theFlag
					 && in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					else if( (! theFlag)
					 && in_selection )
						this.compareValues(
							theObject.document[ field ],
							theSelection[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle required.
				// If flag is off, match selector contents;
				// if flag is on, match persistent data.
				//
				case 'Q':
					if( theFlag
					 && in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					else if( (! theFlag)
						  && in_selection )
						this.compareValues(
							theObject.document[ field ],
							theSelection[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle unique.
				// If flag is off, match selector contents;
				// if flag is on, match persistent data.
				//
				case 'U':
					if( theFlag
						&& in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					else if( (! theFlag)
						  && in_selection )
						this.compareValues(
							theObject.document[ field ],
							theSelection[ field ],
							theMessage,
							action
						);
					break;
				
				//
				// Handle other.
				// If flag is off, match selector contents;
				// if flag is on, match persistent data.
				//
				default:
					if( theFlag
					 && in_persistent )
						this.compareValues(
							theObject.document[ field ],
							thePersistent[ field ],
							theMessage,
							action
						);
					else if( (! theFlag)
						  && in_selection )
						this.compareValues(
							theObject.document[ field ],
							theSelection[ field ],
							theMessage,
							action
						);
					break;
				
			}	// Parsing property type.
			
		}	// Iterating object properties.
		
	}	// validateResolvedContents
	
	
	/****************************************************************************
	 * TEST UNIT SUITES INTERFACE												*
	 ****************************************************************************/
	
	/**
	 * Set instantiation unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	instantiationUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_instantiation', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get instantiation unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	instantiationUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_instantiation', theUnit );						// ==>
	}
	
	/**
	 * Delete instantiation unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	instantiationUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_instantiation', theUnit );						// ==>
	}
	
	/**
	 * Set contents unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	contentsUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_contents', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get contents unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	contentsUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_contents', theUnit );							// ==>
	}
	
	/**
	 * Delete contents unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	contentsUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_contents', theUnit );							// ==>
	}
	
	/**
	 * Set insert unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	insertUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_insert', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get insert unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	insertUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_insert', theUnit );							// ==>
	}
	
	/**
	 * Delete insert unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	insertUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_insert', theUnit );							// ==>
	}
	
	/**
	 * Set resolve unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	resolveUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_resolve', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get resolve unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	resolveUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_resolve', theUnit );							// ==>
	}
	
	/**
	 * Delete resolve unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	resolveUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_resolve', theUnit );							// ==>
	}
	
	/**
	 * Set replace unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	replaceUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_replace', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get replace unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	replaceUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_replace', theUnit );							// ==>
	}
	
	/**
	 * Delete replace unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	replaceUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_replace', theUnit );							// ==>
	}
	
	/**
	 * Set remove unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	removeUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_remove', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get remove unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	removeUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_remove', theUnit );							// ==>
	}
	
	/**
	 * Delete remove unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	removeUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_remove', theUnit );							// ==>
	}
	
	/**
	 * Set custom unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	customUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_custom', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get custom unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	customUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_custom', theUnit );							// ==>
	}
	
	/**
	 * Delete custom unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	customUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_custom', theUnit );							// ==>
	}
	
	/**
	 * Set static unit test.
	 *
	 * See the unitSet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @param theName		{String}		Unit test title.
	 * @param theClass		{String}		Unit test class, defaults to TestClass.
	 * @param theParam		{*}				Eventual parameters for the method.
	 * @param doNew			{Boolean}		If true, assert the unit doesn't exist.
	 */
	staticUnitSet( theUnit, theName, theClass, theParam = null, doNew = false ) {
		this.unitSet( 'unit_static', theUnit, theName, theClass, theParam, doNew );
	}
	
	/**
	 * Get static unit test(s).
	 *
	 * See the unitGet() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The record or false /null.
	 */
	staticUnitGet( theUnit = null ) {
		return this.unitGet( 'unit_static', theUnit );							// ==>
	}
	
	/**
	 * Delete static unit test(s).
	 *
	 * See the unitDel() method for a description.
	 *
	 * @param theUnit		{String}		Unit test method name.
	 * @returns {Object}|{false}|{null}		The deleted record or false /null.
	 */
	staticUnitDel( theUnit = null ) {
		return this.unitDel( 'unit_static', theUnit );							// ==>
	}
	
	
	/****************************************************************************
	 * MEMBER GETTERS															*
	 ****************************************************************************/
	
	/**
	 * Return default test collection.
	 *
	 * @return {String}
	 */
	get defaultTestCollection()	{	return this.parameters.collection_document;	}
	
}	// DocumentUnitTest.

/**
 * Module exports
 */
module.exports = DocumentUnitTest;
