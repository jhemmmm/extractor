"use strict";
exports.__esModule = true;
const mcache = require('memory-cache');
const Promise = require('bluebird');
const request = require('request-promise');

var WebTool = (function() {
    /**
     * Init WebTool
     */
    function WebTool() {}
    /**
     * Google Photo extractor
     * @param {*} photoId 
     * @param {*} index 
     */
    WebTool.prototype.googlePhotoExtractor = function(photoId, index, retry = 5) {
        var _this = this;
        return new Promise(async(resolve, reject) => {
            try {
                //get cache
                var response = mcache.get(photoId);
                if (!response) {
                    //get response from request
                    response = await request('https://photos.app.goo.gl/' + photoId);
                    //set to cache
                    mcache.put(photoId, response, 60 * 60 * 24 * 10 * 1000);
                }

                //parse album
                var albumUrl = response.match(/<link rel="canonical" href=("([^"]*)")/);
                albumUrl = albumUrl[2].split('?key=');
                var url = albumUrl[0];
                var key = albumUrl[1];

                //get photos
                var stream_map = response.split('data:[null,[');
                stream_map = stream_map[1].match(/("([^"]*)",\[)/g);

                //get photo id by index
                var photoUrl = stream_map[index].replace(/"/g, '').replace(",[", '');

                //fetch photo
                var photoResponse = await request(url + '/photo/' + photoUrl + '?key=' + key);

                var photoMap = photoResponse.split(',2,0,null,null,[]');
                photoMap = photoMap[1].split(',"');
                photoMap = photoMap[1].split('",[');

                var photoDirecUrl = photoMap[0].replace(/"/g, '');
                return resolve({
                    results: photoDirecUrl,
                    error: false,
                    cache: 10800 * 1000
                });
            } catch (e) {
                //decrese retry
                retry--;

                //check if not last retry
                if (retry > 0)
                    return resolve(_this.googlePhotoExtractor(photoId, index, retry));

                //return last retry
                return resolve({
                    results: null,
                    error: true,
                    cache: 0
                })
            }
        });
    };

    return WebTool;
}());
exports.WebTool = WebTool;