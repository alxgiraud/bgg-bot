/*global require, console, process*/
var MongoClient = require('mongodb').MongoClient,
	Bot = require('./bot'),
	Parser = require('./parser'),
	url = 'mongodb://localhost:27017/bgg',
	maxGamesPerApiCall = 50;

MongoClient.connect(url, function (err, db) {
	'use strict';
	console.log('Connected correctly to MongoDB server');
	var bot = new Bot(),
		start = 1,
		end = start + maxGamesPerApiCall - 1,

		insertBoardgames = function (boardgames) {
			db.collection('boardgames_debug').insertMany(boardgames, function (err, records) {
				if (err) {
					console.error('[ERROR] Insertion failed');
					console.error(err.message);
				} else {
					console.log('[' + records.ops[0].game_id + '-' + records.ops[records.ops.length - 1].game_id + '] ' + records.result.n + ' documents inserted');
				}
			});
		},

		callbackApi = function (err, result) {
			var parser = new Parser(),
				boardgames = [];

			if (err) {
				console.error('[ERROR] API call failed');
				console.error(err);
				return;
			}

			parser.parseBggXml(result, function (err, boardgames) {
				if (err) {
					console.error('[ERROR] Parsing failed');
					console.error(err);
				} else if (typeof boardgames === 'undefined') {
					console.log('No document inserted');
				} else {
					insertBoardgames(boardgames);
				}
			});
		},

		launchBot = function () {
			console.log('[' + start + '-' + end + '] Call API');
			bot.getBoardgames(start, end, callbackApi);
			start += maxGamesPerApiCall;
			end += maxGamesPerApiCall;
			setTimeout(launchBot, 5000);
		};

	launchBot();

	process.on('SIGINT', function () {
		db.close();
		console.log('Disconnected to MongoDB server');
		console.log('Bye');
		process.exit();
	});
});
