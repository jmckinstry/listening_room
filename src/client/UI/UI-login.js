// This allows the client to log in via raw (name/pass) or Oauth.

function set_ui_login() {
	clear_ui()

        ui_ractive = new Ractive({
                target: "#main",
                template: "#login",
                data: {
                        next: "ui_do_login()"
                }
	})
}

function ui_do_login() {
	do_login($('#username').val(), $('#password').val());
}
