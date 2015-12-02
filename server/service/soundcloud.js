var soundcloudConfig = require('../config/soundcloud');

var Promise = require("bluebird");
var pmongo = require('promised-mongo');
var rp = require('request-promise');
var _ = require('lodash');
var baseUrl = 'https://api.soundcloud.com/tracks/';
var urlSuffix = '/playlists'
var db = pmongo('localhost:27017/vennmusic', ['playlistcollection']);
var limit = 5;


var fetchPlaylistFromTrackId = function(trackId, maxRound) {

  var results = [];

  function fetchData(round) {
    return rp({
      uri: baseUrl + trackId + urlSuffix,
      qs: {
        app_version: 'bb71047',
        limit: limit,
        linked_partitioning: 1,
        client_id: soundcloudConfig.serverKey,
        offset: round * limit
      },
      method: 'GET',
      json:true
    })
      .then(function(resp) {
        if(typeof resp.collection === 'undefined'){
          return Promise.reject(resp);
        }

        for (var i = 0; i < resp.collection.length; i++) {
          results.push(resp.collection[i]);
        }

        if (typeof resp.next_href !== 'undefined' && round < maxRound) {
          return fetchData(++round);
        } else {
          db.playlistcollection.insert({
            trackId: trackId,
            response: results
          });

          return results;
        }
      })
      .catch(function (err) {
        return Promise.reject(err);
      });
  }

  return fetchData(0);


};



module.exports = {


  findPlaylistFromTrackId: function (trackId) {
  return db.playlistcollection.findOne({
    trackId: trackId
  }).then(function (result) {
    if (result != null) {
      return result.response;
    } else {
      return fetchPlaylistFromTrackId(trackId, 2);
    }
  })
},
  sortTracks: function (results, trackIds) {
    var countedTracks = {};
    for (k = 0; k < results.length; k++) {
      var collection = results[k];
      for (var key in collection) {

        var tracks = collection[key].tracks;

        for (i = 0; i < tracks.length; i++) {
          if (countedTracks[tracks[i].id] === undefined) {
            countedTracks[tracks[i].id] = tracks[i];
            countedTracks[tracks[i].id].total_count = 1;
          } else {
            countedTracks[tracks[i].id].total_count++;
          }
        }
      }
    }

    var countedTracksArray = _.values(countedTracks);

    //Remove searched track and tracks where count < 0
    var filteredTracks = _.filter(countedTracksArray, function (track) {
      return track.total_count > 1 && !_.includes(trackIds, track.id.toString());
    });

    //Sort tracks by count
    var response = _.sortBy(filteredTracks, function (track) {
      return -track.total_count;
    });

    return response;

  }
};
