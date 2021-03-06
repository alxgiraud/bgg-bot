/*global module, require, console*/
module.exports = function ApiManager() {
    'use strict';
    var fs = require('fs'),
        botDate = Math.floor(Date.now() / 1000),
        dirLog = 'logs',
        nameLogErr = dirLog + '/log_errors_' + botDate + '.txt',
        nameLogBot = dirLog + '/log_bot_' + botDate + '.txt',
        eol = require('os').EOL,
        getShortTimeStamp = function () {
            var now = new Date(),
                date = [now.getMonth() + 1, now.getDate(), now.getFullYear()],
                time = [now.getHours(), now.getMinutes(), now.getSeconds()],
                suffix = (time[0] < 12) ? "AM" : "PM",
                i;

            time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
            time[0] = time[0] || 12;
            for (i = 1; i < 3; i += 1) {
                if (time[i] < 10) {
                    time[i] = "0" + time[i];
                }
            }

            return date.join("/") + " " + time.join(":") + " " + suffix;
        };

    if (!fs.existsSync(dirLog)) {
        fs.mkdirSync(dirLog);
    }

    return {
        writeError: function (error, msg) {
            msg = (typeof msg !== 'undefined') ? '[' + getShortTimeStamp() + '] ' + msg : '[' + getShortTimeStamp() + '] Unknown error';

            fs.appendFile(nameLogErr, msg + eol, function (err) {
                if (err) {
                    console.error('An error occurs while writing file ' + nameLogErr);
                    console.error(err);
                }
            });

            if (error !== null) {
                fs.appendFile(nameLogErr, error + eol, function (err) {
                    if (err) {
                        console.error('An error occurs while writing file ' + nameLogErr);
                        console.error(err);
                    }
                });
            }

            console.error(msg);
            console.error(error);
        },
        writeLog: function (msg) {
            if (typeof msg === 'undefined') {
                console.error('Log message can\'t be empty');

            } else {
                msg = '[' + getShortTimeStamp() + '] ' + msg;
                fs.appendFile(nameLogBot, msg + eol, function (err) {
                    if (err) {
                        console.error('An error occurs while writing in the file ' + nameLogBot);
                        console.error(err);
                    }
                });

                console.log(msg);
            }
        }
    };
};
