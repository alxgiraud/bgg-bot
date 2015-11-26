# BGG BOT
BGG BOT is a NodeJS script using the boardgamegeek API to insert boardgame data in a MongoDB database.

Type `node server.js` to run the script then type in the prompt the first and last game ID to to call with the API.
The bot will call all the related games between these IDs and insert/update them in the database.

Please visit https://boardgamegeek.com/wiki/page/BGG_XML_API2 for further information about boardgamegeek API.

Dependencies:

 - mongodb
 - xml2js
 - prompt
