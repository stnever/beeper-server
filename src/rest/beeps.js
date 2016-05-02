var _ = require('lodash'),
    moment = require('moment'),
    cev = require('omit-empty'),
    models = require('../models'),
    service = require('../services/beeper-service'),
    utils = require('../utils.js'),
    debug = require('debug')('beeper:rest')
    returnSuccess = utils.returnSuccess,
    router = require('express').Router();

module.exports = router;

function m(s) { return _.get(s, 'length', 0) == 0 ? null : moment(s).toDate() }
function a(s) { return _.get(s, 'length', 0) == 0 ? [] : s.split(',') }
function j(s) { return _.get(s, 'length', 0) == 0 ? null : JSON.parse(s) }

router.route('/')
  .get(function(req, res, next) {
    var where = cev({
      timestamp: {
        $gte: m(req.query.fromDate),
        $lte: m(req.query.untilDate)
      },
      tags: {
        $in: a(req.query.tags),
        $nin: a(req.query.withoutTags)
      },
      source: {
        $in: a(req.query.sources),
        $nin: a(req.query.withoutSources)
      },
      offset: +req.query.offset || 0,
      limit: +req.query.limit || 20,
      sort: req.query.sort
    })

    // Data filters use the mongodb query format.
    _.forOwn(req.query, function(v, k) {
      if ( v == null || v.trim().length < 1 ) return;
      if ( k.indexOf('data.') !== 0 ) return;

      where[k] = JSON.parse(v)
    })

    var countOnly = req.query.countOnly == 'true'

    debug('Beeps filter: %j (count only? %s)', where, countOnly)

    if ( countOnly ) {
      res.promise = models.Beep.count(where).then(function(n) {
        return {count: n}
      })
    } else {
      res.promise = models.Beep.findAllAndCount(where)
    }
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

  .patch(function(req, res, next) {
    var id = req.params.id
    res.promise = service.patch(id, req.body)
      .then(returnSuccess)
  })
