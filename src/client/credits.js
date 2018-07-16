// This file contains the objects for listing credits and how to render them
//
// Requires:
// - Additional files in this directory of the following form:
// - 	credits.push({
// 		name:"<name>", 
// 		version:"<version>",
// 		link:"<link_to_website>",
// 		blurb:"<description_of_library>"
// 		})

var credits = new Array()

// print_credits () returns string(html)
function print_credits() { 
	$("#credits-dialog").dialog()

	if ($("#credits-dialog").text().length === 0) {
		$("#credits-dialog").append("<div id=\"credits-accordion\"></div>")

		for (var x = 0; x < credits.length; x++) {
			var credit = credits[x]
			console.log(credit)
			$("#credits-accordion").append(
				"<h3>" + credit.name + "</h3>"
				+ "<div>"
				+ "<p><a href=\"" + credit.link + "\">Website: " + credit.link + "</a></p>"
				+ "<p>Version: " + credit.version + "</p>"
				+ "<p>" + credit.blurb + "</p>"
				+ "</div>"
			)
		}
		$("#credits-accordion").accordion()
	}
}
