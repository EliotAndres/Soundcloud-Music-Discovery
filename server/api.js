/*
 * Serve JSON to our AngularJS client
 */
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var _ = require('lodash');
var Promise = require("bluebird");
var pmongo = require('promised-mongo');

var scService = require('./service/soundcloud');


/* Soundcloud route
 * @params : trackIds, must be trackIds passed as values with comma separator
 * */
router.get('/soundcloud', function(req, res, next) {
    trackIds = req.query.trackIds.split(',');
    Promise.map(trackIds, function(trackId) {
        return scService.findPlaylistFromTrackId(trackId);
    }).then(function(results) {
        res.json(scService.sortTracks(results, trackIds));
    }).catch(function (err) {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;
