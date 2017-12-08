// This file is for determining what state the UI's supposed to be in
//
// 1: Never been here before (check compatabilities and then offer login)
// 2: Logged in, but no room selected
// 3: Room
//
// start() will be called when the document is finished loading

function start() {
	clear_screen()

	// 1: Check that they've been here before and cleared the init screen
	if (Cookies.get("Opus") !== true) {
		// They already tried loading the page but Opus wasn't enabled, or it's their first visit. Check and inform
		set_ui_opus()
	}
	else if (Cookies.get("disclaimer") !== "accepted") {
		// They haven't accepted the bandwidth (and others) disclaimer yet, and they must
		set_ui_disclaimer()
	}
	else {
		// Everything else looks good, send them to login
		set_ui_login()
	}
}

window.onload = start()

