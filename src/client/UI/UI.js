// Base js file for moving things around in the UI.
//
// Assumes:
// - jquery is loaded
// - jquery UI is loaded

var ui_ractive = null

// Wipes out all UI so we can put up a new layout
function clear_ui() {
	$("#main").empty()
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
