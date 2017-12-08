// Base js file for moving things around in the UI.
//
// Assumes:
// - jquery is loaded
// - jquery UI is loaded

// Need a default place for templates
// New templates go in src/client/templates/*.js
// templates["<template_name>"] = "<ractive_compatible_string>"
var templates = new Array()

// Wipes out all UI so we can put up a new layout
function clear_screen() {
	$("#main").empty()
}

function set_ui_opus() {
	clear_screen()

	var ui_main = new Ractive({
		target: "#main",
		template: templates["ui_detect"],
		data: {text: "Checking to see if Opus is enabled for your machine..."}
	})

	var opus_status = get_opus_status()

	ui_main.set('text', opus_status.text)

	if (opus_status.can_play === true) {
		// Continue after waiting 2 seconds for debug confirmation
		window.setTimeout(function(){
				set_ui_disclaimer()
			},
			2000
		)
	} else {
		// Don't hand off to next UI, as they can't do anything here
	}
}

// Used to determine if the browser supports Opus codec
// Note: Return values for play types are {'' (not playable), 'maybe' (must check / depends on file), 'probably' (seems playable)}
function get_opus_status() {
	var res = {can_play:null, can_play_value:null, text:null}

	var audio = document.createElement('audio')
	res.can_play_value = audio.canPlayType('audio/ogg; codecs="opus"')

	if(res.can_play_value == "maybe" || res.can_play_value == "probably") {
		res.can_play = true
	        res.text = "Opus codec is" + (res.can_play_value == "maybe" ? " partially" : "") + " supported in your browser."
	} else {
		res.can_play = false
	        res.text = "Opus codec is not supported enough for this site to work. A different browser is likely to work)"
	}

	delete audio
	return res
}
