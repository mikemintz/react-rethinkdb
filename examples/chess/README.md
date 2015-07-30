# example-chess

Example chess app using react-rethinkdb

## How do I run this?

* Start a RethinkDB server on `localhost` port `28015`
* Run `npm install` to set up the app
* Run `npm run resetdb` to reset a database with name `react_example_chess`
* Run `npm start` to start the web server
* Navigate to http://localhost:8015/ in your browser

You can edit `server/config.json` if you want to use different parameters.

If you open two browsers, navigate to the app, and log in as two different
users, you can have them play chess with each other in realtime.
