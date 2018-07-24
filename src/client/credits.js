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
var dialog_credits

// print_credits () returns string(html)
function print_credits() { 
	if ($("#credits-accordion")[0] == null) {
		$("#credits-dialog").append("<div id=\"credits-accordion\"></div>")

		for (var x = 0; x < credits.length; x++) {
			var credit = credits[x]

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
		dialog_credits = $("#credits-dialog")
		dialog_credits.dialog({
			open: function(event, ui) {
				$(this).position({
					of: $("#credits-location"),
					my: "left bottom",
					at: "center center",
					collision: "flip flip"
				})
			}
		})
	}
	else if (dialog_credits.is(":visible")) {
		dialog_credits.hide()
	}
	else { // dialog_credits.is(":hidden")
		dialog_credits.show()
	}
/*
	dialog_credits.position({
		of: $("#credits-location"),
		my: "left bottom",
		at: "center center",
		collision: "flip flip"
		})
*/
}
