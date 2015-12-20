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
  findPlaylistsFromTrackId: function (trackId) {
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
  sortTracks: function (results, trackIds, strictMode, limit) {
    var countedTracks = {};
    for (var k = 0; k < results.length; k++) {
      var collection = results[k];
      for (var key in collection) {

        var tracks = collection[key].tracks;

        for (var i = 0; i < tracks.length; i++) {
          var j = tracks[i].id;

          if (typeof countedTracks[j] === 'undefined') {
            countedTracks[j] = tracks[i];
            countedTracks[j].total_count = 1;
            countedTracks[j].linkedTracks = [];
          } else{
            countedTracks[j].total_count++;
          }

          if(strictMode && countedTracks[j].linkedTracks.indexOf(k) === -1){
            countedTracks[j].linkedTracks.push(k);
          }

        }
      }
    }

    var countedTracksArray = _.values(countedTracks);

    //Remove searched track and tracks where count < 0
    var filteredTracks = _.filter(countedTracksArray, function (track) {
      return track.total_count > 1 && !_.includes(trackIds, track.id.toString())
        && (!strictMode || track.linkedTracks.length == results.length);
    });

    //Sort tracks by count
    var sortedTracks = _.sortBy(filteredTracks, function (track) {
      return -track.total_count;
    });

    response = _.chunk(sortedTracks, limit)[0];

    if(typeof response === 'undefined') response = [];
    return response;

  }
};
