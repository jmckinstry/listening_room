// tests.push({name:"<name>", func:<function>, inputs:Array(inputs, ...), eval:<test_eval_function>, expected:<expected_eval_function_result>)
tests.push({
	name: "get_opus_status: All values filled",
	func: get_opus_status,
	inputs: null,
	eval: function(res) {
		return res.length = 3
			&& res.can_play !== null
			&& res.can_play_value !== null
			&& res.text !== null
	},
	expected: true
})

console.log("Test pushed in...")
console.log(tests)
