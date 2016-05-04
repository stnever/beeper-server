var _ = require('lodash'),
    moment = require('moment'),
    cev = require('omit-empty'),
    models = require('../models'),
    service = require('../services/beeper-service'),
    search = require('../services/search'),
    utils = require('../utils.js'),
    debug = require('debug')('beeper:rest')
    returnSuccess = utils.returnSuccess,
    router = require('express').Router();

module.exports = router;

router.route('/')
  .get(function(req, res, next) {
    var filter = _.pick(req.query, 'fromDate', 'untilDate',
      'tags', 'withoutTags', 'sources', 'withoutSources',
      'offset', 'limit', 'sort', 'countOnly')

    res.promise = search.searchBeeps(filter)
  })

  .post(function(req, res, next) {
    var wasArray = _.isArray(req.body)
    res.promise = service.create(req.body)
      .then(function(result) {
        if ( wasArray ) {
          return {
            result: 'success',
            ids: _.map(result, 'id')
          }
        } else {
          return {
            result: 'success',
            id: result._id
          }
        }
      })
  })

router.route('/:id')
  .get(function(req, res, next) {
    res.promise = models.Beep.findById(req.params.id);
  })

  .delete(function(req, res, next) {
    res.promise = models.Beep.destroy({_id: req.params.id})
      .then(returnSuccess)
  })

  // .patch(function(req, res, next) {
  //   var id = req.params.id
  //   res.promise = service.patch(id, req.body)
  //     .then(returnSuccess)
  // })
