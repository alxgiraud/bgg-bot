/*global module, require, console*/
/*jslint white: true*/
module.exports = function Parser() {
	'use strict';
	var parseString = require('xml2js').parseString,

		getResult = function (dirtyResult) {
			var result = [],
				i,
				l = dirtyResult.length;

			for (i = 0; i < l; i += 1) {
				if (dirtyResult[i].hasOwnProperty('$')) {
					result.push({
						value: dirtyResult[i].$.value,
						num_votes: parseInt(dirtyResult[i].$.numvotes, 10)
					});
				}
			}

			return result;
		},

		getPollResults = function (dirtyResults) {
			var pollResults = [],
				subResults = [],
				i,
				l = dirtyResults.length;

			for (i = 0; i < l; i += 1) {

				if (dirtyResults[i].hasOwnProperty('result')) {
					subResults = getResult(dirtyResults[i].result);
				}

				//Special case: suggested_numplayers poll (the only one with subresults)
				if (dirtyResults[i].hasOwnProperty('$')) {
					pollResults.push({
						num_players: parseInt(dirtyResults[i].$.numplayers, 10),
						sub_results: subResults
					});

				} else {
					pollResults = subResults;
				}


			}
			return pollResults;
		},

		getPolls = function (dirtyPolls) {
			var polls = [],
				poll,
				i;

			for (i = 0; i < dirtyPolls.length; i += 1) {
				if (dirtyPolls[i].hasOwnProperty('$')) {
					poll = {
						name: dirtyPolls[i].$.name,
						title: dirtyPolls[i].$.title,
						totalvotes: parseInt(dirtyPolls[i].$.totalvotes, 10)
					};
					if (dirtyPolls[i].hasOwnProperty('results')) {
						poll.results = getPollResults(dirtyPolls[i].results);
						polls.push(poll);
					}
				}
			}
			return polls;
		},

		getIntValue = function (dirtyObject, property) {
			if (dirtyObject.hasOwnProperty(property) &&
				typeof dirtyObject[property][0] !== 'undefined' &&
				dirtyObject[property][0].hasOwnProperty('$') &&
				dirtyObject[property][0].$.hasOwnProperty('value') &&
				!isNaN(parseInt(dirtyObject[property][0].$.value, 10))) {

				return parseInt(dirtyObject[property][0].$.value, 10);
			}
		},

		getValue = function (dirtyObject, property) {
			if (dirtyObject.hasOwnProperty(property) &&
				typeof dirtyObject[property][0] !== 'undefined') {

				return dirtyObject[property][0];
			}
		},

		getNames = function (dirtyObject) {
			var l, i, cleanNames = [];

			if (dirtyObject.hasOwnProperty('name')) {
				l = dirtyObject.name.length;
				for (i = 0; i < l; i += 1) {
					if (dirtyObject.name[i].hasOwnProperty('$')) {
						cleanNames.push({
							type: dirtyObject.name[i].$.type,
							value: dirtyObject.name[i].$.value
						});
					}
				}
			}

			return cleanNames;
		},

		getRanks = function (dirtyObject) {
			var ranks = [],
				i,
				l,
				dirtyRank;

			if (typeof dirtyObject[0] !== 'undefined' &&
				dirtyObject[0].hasOwnProperty('ranks') &&
				typeof dirtyObject[0].ranks[0] !== 'undefined' &&
				dirtyObject[0].ranks[0].hasOwnProperty('rank')) {
				l = dirtyObject[0].ranks[0].rank.length;

				for (i = 0; i < l; i += 1) {
					if (dirtyObject[0].ranks[0].rank[i].hasOwnProperty('$')) {
						dirtyRank = dirtyObject[0].ranks[0].rank[i].$;
						ranks.push({
							type: dirtyRank.type,
							id: parseInt(dirtyRank.id, 10),
							name: dirtyRank.name,
							friendly_name: dirtyRank.friendlyname,
							value: parseInt(dirtyRank.value, 10),
							bayes_average: parseFloat(dirtyRank.bayesaverage, 10)
						});
					}
				}
			}

			return ranks;
		},

		getStatisticsIntValue = function (dirtyObject, property) {
			if (typeof dirtyObject[0] !== 'undefined' &&
				dirtyObject[0].hasOwnProperty(property) &&
				typeof dirtyObject[0][property][0] !== 'undefined' &&
				dirtyObject[0][property][0].hasOwnProperty('$') &&
				!isNaN(parseInt(dirtyObject[0][property][0].$.value, 10))) {
				return parseInt(dirtyObject[0][property][0].$.value, 10);
			}
		},

		getStatisticsFloatValue = function (dirtyObject, property) {
			if (typeof dirtyObject[0] !== 'undefined' &&
				dirtyObject[0].hasOwnProperty(property) &&
				typeof dirtyObject[0][property][0] !== 'undefined' &&
				dirtyObject[0][property][0].hasOwnProperty('$') &&
				!isNaN(parseFloat(dirtyObject[0][property][0].$.value, 10))) {
				return parseFloat(dirtyObject[0][property][0].$.value, 10);
			}
		},

		getStatistics = function (dirtyObject) {
			var statistics = {};

			statistics.ranks = getRanks(dirtyObject);

			statistics.users_rated = getStatisticsIntValue(dirtyObject, 'usersrated');
			statistics.average = getStatisticsFloatValue(dirtyObject, 'average');
			statistics.bayes_average = getStatisticsFloatValue(dirtyObject, 'bayesaverage');
			statistics.stddev = getStatisticsFloatValue(dirtyObject, 'stddev');
			statistics.median = getStatisticsFloatValue(dirtyObject, 'median');
			statistics.owned = getStatisticsIntValue(dirtyObject, 'owned');
			statistics.trading = getStatisticsIntValue(dirtyObject, 'trading');
			statistics.wanting = getStatisticsIntValue(dirtyObject, 'wanting');
			statistics.wishing = getStatisticsIntValue(dirtyObject, 'wishing');
			statistics.num_comments = getStatisticsIntValue(dirtyObject, 'numcomments');
			statistics.num_weights = getStatisticsIntValue(dirtyObject, 'numweights');
			statistics.average_weight = getStatisticsFloatValue(dirtyObject, 'averageweight');

			return statistics;
		},

		cleanResult = function (result) {
			var dirtyObjects,
				i,
				l,
				cleanObjects = [],
				dirtyObject,
				cleanObject,
				j,
				link;

			if (!result.hasOwnProperty('items') ||
				!result.items.hasOwnProperty('item')) {
				return;
			}

			dirtyObjects = result.items.item;
			l = dirtyObjects.length;

			for (i = 0; i < l; i += 1) {
				dirtyObject = dirtyObjects[i];
				cleanObject = {};

				if (dirtyObject.hasOwnProperty('$') &&
					dirtyObject.$.hasOwnProperty('id') &&
					!isNaN(parseInt(dirtyObject.$.id, 10))) {
					cleanObject.game_id = parseInt(dirtyObject.$.id, 10);
				}

				cleanObject.names = getNames(dirtyObject);

				cleanObject.year_published = getIntValue(dirtyObject, 'yearpublished');
				cleanObject.min_players = getIntValue(dirtyObject, 'minplayers');
				cleanObject.max_players = getIntValue(dirtyObject, 'maxplayers');
				cleanObject.playing_time = getIntValue(dirtyObject, 'playingtime');
				cleanObject.min_playtime = getIntValue(dirtyObject, 'minplaytime');
				cleanObject.max_playtime = getIntValue(dirtyObject, 'maxplaytime');
				cleanObject.min_age = getIntValue(dirtyObject, 'minage');

				cleanObject.description = getValue(dirtyObject, 'description');
				cleanObject.thumbnail = getValue(dirtyObject, 'thumbnail');
				cleanObject.image = getValue(dirtyObject, 'image');

				if (dirtyObject.hasOwnProperty('link')) {
					cleanObject.publishers = [];
					cleanObject.expansions = [];
					cleanObject.artists = [];
					cleanObject.families = [];
					cleanObject.categories = [];
					cleanObject.compilations = [];
					cleanObject.implementations = [];
					cleanObject.mechanics = [];
					cleanObject.designers = [];
					cleanObject.integrations = [];

					for (j = 0; j < dirtyObject.link.length; j += 1) {
						if (dirtyObject.link[j].hasOwnProperty('$')) {
							link = dirtyObject.link[j].$;
							switch (link.type) {
								case 'boardgamepublisher':
									cleanObject.publishers.push({
										publisher_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgameexpansion':
									cleanObject.expansions.push({
										expansion_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgameartist':
									cleanObject.artists.push({
										artist_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgamefamily':
									cleanObject.families.push({
										family_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgamecategory':
									cleanObject.categories.push({
										category_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgamecompilation':
									cleanObject.compilations.push({
										compilation_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgameimplementation':
									cleanObject.implementations.push({
										implementation_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgamemechanic':
									cleanObject.mechanics.push({
										mechanic_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgamedesigner':
									cleanObject.designers.push({
										designer_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								case 'boardgameintegration':
									cleanObject.integrations.push({
										integration_id: parseInt(link.id, 10),
										value: link.value
									});
									break;
								default:
									console.log("Property unasigned:");
									console.log(link);
							}
						}
					}
				}

				if (dirtyObject.hasOwnProperty('poll')) {
					cleanObject.polls = getPolls(dirtyObject.poll);
				}
				if (dirtyObject.hasOwnProperty('statistics') &&
					typeof dirtyObject.statistics[0] !== 'undefined' &&
					dirtyObject.statistics[0].hasOwnProperty('ratings')) {
					cleanObject.statistics = getStatistics(dirtyObject.statistics[0].ratings);
				}

				cleanObjects.push(cleanObject);
			}

			return cleanObjects;
		};

	return {
		parseBggXml: function (xml, callback) {
			parseString(xml, function (err, result) {
				if (err) {
					callback('XML2JS parsing: ');
				}
				try {
					callback(null, cleanResult(result));
				} catch (e) {
					callback('Cleaning : ' + e);
				}
			});
		}
	};
};
