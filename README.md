# listening_room
A replacement for the now-defunct Listening Room. Share songs privately with your friends without the need to upload them anywhere.

# About
Long ago, friends that I worked with would share our music via a page calling itself Listening Room. We'd each queue up some of our songs and they'd play round-robin until we were done. It was a great way to share genres and interests without having to muck about with files.

That site is long since gone (so much so that I am having difficulty finding it to cite its original owner by name), but the desire for sharing music over the network instead of out loud where it can disturb folks working is the same. So this is my attempt at bringing the idea back.

As the original source explained before going dark, server-client streaming of high-quality audio is bandwidth-intensive. This project aims to alleviate that by using the wonderful [WebTorrent](https://webtorrent.io/) library, so listeners share the burden.

# Requirements
* Node.js

# Status
* prealpha
* Not functioning currently
* Not looking for commentary or assistance at this time
* Do not try to run yet because it won't do anything

# Getting Started
You can't yet. But when you can...

* Configure config/default.js
* Run `build.sh` (this will eventually be `node build.js`)
* Run `npm install`
* Run `node server/server.js --add-admin <name> <pass>`
* Run `node server/server.js`
* Log in with the new user

# License
This software is currently licensed as CC BY-NC-SA.

Feel free to fork it, modify it as you desire, and use it for any non-commercial purpose. Just remember to share your changes somewhere, and be sure that your license is at least as permissive as mine.

# Disclaimer
Use this software at your own risk. I'm not responsible for what it may do, or how it is used, or what you do to/with/by yourself.

This software will not allow downloading or storage of the data transmitted. It's for listening, not making copies. Thanks.
