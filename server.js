/*global require, console, process*/
var config = require('./configBot'),
    MongoClient = require('mongodb').MongoClient,
    ApiServices = require('./apiServices'),
    Parser = require('./parser'),
    Logger = require('./logger'),
    logger = new Logger();

MongoClient.connect(config.mongoServerAddr, function (err, db) {
    'use strict';
    if (err) {
        logger.writeError(err, 'connection MongoDB server');
        console.error('Error connection MongoDB server');
    } else {
        console.log('Connected correctly to MongoDB server');
        var apiServices = new ApiServices(),
            bot = {
                init: function () {
                    var start = 1,
                        end = start + config.maxApiCall - 1,
                        firstArgument = process.argv[2];

                    if (typeof firstArgument !== 'undefined') {
                        if (isNaN(parseInt(firstArgument, 10))) {
                            logger.writeError(null, 'First argument must be a number (argument passed: \'' + firstArgument + '\')');
                        } else {
                            apiServices.getBoardgames(firstArgument, 0, bot.callbackApi);
                        }
                    } else {
                        bot.run(start, end);
                    }
                },
                run: function (start, end) {
                    logger.writeLog('[' + start + '-' + end + '] Call API');
                    apiServices.getBoardgames(start, end, bot.callbackApi);
                    start += config.maxApiCall;
                    end += config.maxApiCall;
                    setTimeout(function () {
                        bot.run(start, end);
                    }, 5000);
                },
                callbackApi: function (err, result) {
                    var parser = new Parser(),
                        boardgames = [];

                    if (err) {
                        logger.writeError(err, 'API call failed');
                        return;
                    }

                    parser.parseBggXml(result, function (err, boardgames) {
                        if (err) {
                            logger.writeError(err, 'Parsing failed');
                        } else if (typeof boardgames === 'undefined') {
                            logger.writeLog('No board games found');
                        } else {
                            bot.insertBoardgames(boardgames);
                        }
                    });
                },
                insertBoardgames: function (boardgames) {
                    var i, boardgame, total = 0;
                    for (i = 0; i < boardgames.length; i += 1) {
                        boardgame = boardgames[i];
                        if (boardgame.hasOwnProperty('game_id')) {
                            total += 1;
                            db.collection('boardgames_fulldebug').update({
                                game_id: boardgame.game_id
                            }, boardgame, {
                                upsert: true
                            }, bot.callbackUpset);
                        }
                    }
                    logger.writeLog(total + ' board games processed');
                },
                callbackUpset: function (err, res) {
                    if (err) {
                        logger.writeError(err, 'Insertion failed');
                    }
                }
            };

        bot.init();

        process.on('SIGINT', function () {
            db.close();
            console.log('Disconnected to MongoDB server');
            console.log('Bye');
            process.exit();
        });
    }
});
