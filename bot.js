/*global module, require*/
module.exports = function Bot() {
	'use strict';
	var http = require('http'), 
		options = require('./config'),
		getPath = function (min, max) {
			var url = 'http://www.boardgamegeek.com/xmlapi2/thing?id=' + min,
				i;
			for (i = min + 1; i < max + 1; i += 1) {
				url += ',' + i;
			}
			url += '&stats=1&type=boardgame';
			return url;
		};

	return {
		getBoardgames: function (min, max, callback) {
			options.path = getPath(min, max);
			var request = http.request(options, function (response) {
				var xml = '';

				response.on('data', function (data) {
					xml += data;
				});

				response.on('end', function () {
					if (xml.indexOf('<title>Error 503</title>') > -1) {
						callback('Error 503 Service Unavailable');
					} else if (xml.indexOf('<title>404 Not Found</title>') > -1) {
						callback('404 Not Found');
					} else {
						callback(null, xml);
					}
				});
			});

			request.on('error', function (e) {
				callback(e);
			});

			request.end();
		}
	};

};
