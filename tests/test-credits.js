// tests.push({name:"<name>", func:<function>, inputs:Array(inputs, ...), eval:<test_eval_function>, expected:<expected_eval_function_result>)
tests.push({
	name: "credits: Credits exist",
	func: function() {},
	inputs: null,
	eval: function(res) {
		return credits !== null
			&& Array.isArray(credits)
			&& credits.length > 0
	},
	expected: true
})

