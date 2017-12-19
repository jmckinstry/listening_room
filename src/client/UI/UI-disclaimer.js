// The disclaimer tells the user that this site will use their bandwidth via Torrents, and shouldn't be used over mobile/rated connections.

function set_ui_disclaimer() {
	clear_ui()

	ui_ractive = new Ractive({
		target: "#main",
		template: "#disclaimer",
		data: {
			attention: "Hey You!",
			disclaimer: "This site uses <a href=\"https://webtorrent.io/intro\">WebTorrent</a> to send and receive sound files."
				+ "<br>"
				+ "Only continue if you're okay with using steady upload and download bandwidth. Definitely don't use a metered connection",
			next: "Cookies.set(\"disclaimer\", \"accepted\")"
				+ "\n"
				+ "set_ui_login()"
		}
	})
}
