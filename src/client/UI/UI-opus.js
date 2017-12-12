// This UI is for finding if the client has Opus support, and if not, telling them as much.
//
// It should only be visible for more than a second if the client doesn't have Opus

function set_ui_opus() {
        clear_ui()

        ui_ractive = new Ractive({
                target: "#main",
                template: "#detect_opus",
                data: {text: "Checking to see if Opus is enabled for your machine..."}
        })

        var opus_status = get_opus_status()

        ui_ractive.set('text', opus_status.text)

        if (opus_status.can_play === true) {
		// TODO: set Opus Cookie so we don't need to check again
                // Continue after waiting 2 seconds for debug confirmation
                window.setTimeout(function(){
                                set_ui_disclaimer()
                        },
                        2000
                )
        } else {
                // Don't hand off to next UI, as they can't do anything here
		ui_ractive.set('text', ui_ractive.get('text') + "\n<br>\nOpus is NOT supported on your browser. You cannot continue without this support.")
        }
}

