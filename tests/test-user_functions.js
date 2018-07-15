// tests.push({name:"<name>", func:<function>, inputs:Array(inputs, ...), eval:<test_eval_function>, expected:<expected_eval_function_result>)
tests.push({
	name: "user: exists",
	func: function() {return user},
	inputs: null,
	eval: function(res) {
		return res !== null
			&& res.hasOwnProperty("name")
			&& res.hasOwnProperty("loginid")
			&& res.hasOwnProperty("token")
			&& res.hasOwnProperty("type")
	},
	expected: true
})

tests.push({
	name: "user: reset_user",
	func: function() {user = {
			name:"name",
			loginid:"loginid",
			token:"token",
			type:"type"
		}
		reset_user()
		return user},
	inputs: null,
	eval: function(res) {
		return res !== null
			&& res.hasOwnProperty("name")
                        && res.hasOwnProperty("loginid")
                        && res.hasOwnProperty("token")
                        && res.hasOwnProperty("type")
			&& res.name == null
			&& res.loginid == null
			&& res.token == null
			&& res.type == null
	},
	expected: true
})

