/*global require, console   */
var prompt = require('prompt'),
    Bot = require('./bot'),
    schema = {
        properties: {
            start: {
                description: 'Start ID',
                pattern: /^[1-9]\d*$/,
                message: 'Start ID must be a positive number greather than zero.',
                'default': 1,
                required: true
            },
            end: {
                description: 'End ID',
                pattern: /^[1-9]\d*$/,
                message: 'End ID must be a positive number greather than Start ID.',
                'default': 9999999,
                required: true,
                conform: function (end) {
                    'use strict';
                    var start = parseInt(prompt.history('start').value, 10);
                    return (start <= end);
                }
            }
        }
    },
    callBackPrompt = function (err, result) {
        'use strict';
        if (err) {
            console.error(err);
        } else {
            var bot = new Bot(parseInt(result.start, 10), parseInt(result.end, 10));
        }
    };

prompt.message = 'bgg-bot'.grey;
prompt.delimiter = '>';
prompt.start();
prompt.get(schema, callBackPrompt);
