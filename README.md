# BGG BOT
BGG BOT is a NodeJS script using the boardgamegeek API to insert boardgame data in a MongoDB database.

Run `node server.js` to run the script and call the API. Logs will be written in a folder named logs.
Add a parameter when lauching the script to update/insert a specific game by his ID (e. g. `node server.js 1234`)

Dependencies:

 - mongodb: "^2.0.46"
 - xml2js: "^0.4.13"
