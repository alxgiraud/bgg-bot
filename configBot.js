/*global module*/
var configBot = {};

configBot.mongoServerAddr = 'mongodb://localhost:27017/bgg'; //MongoDB server address
configBot.maxApiCall = 10; //Max game retrieved at the same time for each API call
configBot.delayApi = 5000; //Amount of ms between each API call (recommended by BGG: 5000)

module.exports = configBot;
