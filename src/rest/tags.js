var _ = require('lodash'),
    tagCloud = require('../services/tag-cloud'),
    utils = require('../utils'),
    router = require('express').Router();

module.exports = router;

router.get('/', function(req, res) {
  var filter = _.pick(req.query, 'fromDate', 'untilDate',
    'sources', 'withoutSources', 'tags', 'withoutTags')
  res.promise = tagCloud.calculateTagCloud(filter)
})
