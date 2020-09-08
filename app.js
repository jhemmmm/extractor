const express = require("express");
const app = express();
const webTool = require('./WebTool');
const cors = require('cors');
const mcache = require('memory-cache');
const tool = new webTool.WebTool();

app.use(cors());
app.disable('x-powered-by');

/**
 * Get Photo URL
 */
app.get('/get_video_info/:photoid/:index', async(req, res) => {
    let key = req.params.photoid + '_' + req.params.index;
    let response = mcache.get(key)
    if (!response) {
        response = await tool.googlePhotoExtractor(req.params.photoid, req.params.index);
        mcache.put(key, response, response.cache);
    }
    res.set('Cache-control', 'public, max-age=' + response.cache);
    res.json(response);
});

app.get('*', function(req, res) {
    res.send("Extractor Version: 1.0.1");
});

app.listen(4000, async(req, res) => {
    console.log("Extractor Version: 1.0.1 - Running on port 4000");
});