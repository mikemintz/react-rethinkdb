# example-chat

Example chat app using react-rethinkdb

## How do I run this?

* Make sure you have `node_modules/.bin` in your `$PATH` environment variable
* Start a RethinkDB server on `localhost` port `28015`
* Run `npm install` to set up the app
* Run `npm run resetdb` to reset a database with name `react_example_chat`
* Run `npm start` to start the web server
* Navigate to http://localhost:8015/ in your browser

You can edit `server/config.json` if you want to use different parameters.

If you open two browsers, navigate to the app, and log in as two different
users, you can have them chat with each other in realtime.
