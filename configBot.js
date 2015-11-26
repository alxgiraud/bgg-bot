/*global module*/
var configBot = {};

configBot.mongoServerAddr = 'mongodb://localhost:27017/bgg'; //MongoDB server address
configBot.maxApiCall = 10; //Max game retrieved at the same time for each API call

module.exports = configBot;
