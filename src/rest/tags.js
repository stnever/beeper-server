var _ = require('lodash'),
    tagCloud = require('../services/tag-cloud'),
    utils = require('../utils'),
    router = require('express').Router();

module.exports = router;

router.get('/', function(req, res) {
  res.promise = tagCloud.calculateTagCloud({
    sources: req.query.sources
  })
})
