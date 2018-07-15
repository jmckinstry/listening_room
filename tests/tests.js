// This file contains the testing framework for doing tests
//
// Individual test files should be named "test-<function_name>[-optional_descriptor].js"
// Individual test files should be of the following form:
// tests.push({name:"<name>", func:<function>, inputs:Array(inputs, ...), eval:<test_eval_function>, expected:<expected_eval_function_result>, (opt)message:<message during failure>)
//
// test_eval_function should take a single input, the return value of the function
// expected_eval_function_result will be strictly compared (===)
//
// Calling do_tests will call each entry in tests with given inputs, compare using eval function, then ensure the function matches the expected results.
// do_tests returns an array of the form [{name:"<name>", result:"<result>"}, ...]
// Successful tests return "OK", failures returen "FAIL"

var tests = new Array()

function add_test(test) {
	try {
		throw("add_test not yet implemented")
	}
	catch (e) {
		tests.push({name:test.name, func:null, inputs:null, eval:function () {return false}, expected:true, message:"Error when adding test: " + e})
	}
}

function do_tests() {
	var res = new Array()
	console.log("Tests: ")
	console.log(tests)

	for (var x = 0; x < tests.length; x++) {
		var test = tests[x]
		console.log("Test:")
		console.log(test)
		try {
			if (test.eval(test.func.apply(null, test.inputs)) === test.expected) {
				res.push({name:test.name, result:test.message || "OK"})
			} else {
				res.push({name:test.name, result:test.message || "FAIL"})
			}
		}
		catch (e) {
			res.push({name:test.name, result: "ERROR: " + e})
		}
	}

	return res
}

