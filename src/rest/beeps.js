var _ = require('lodash'),
    moment = require('moment'),
    cev = require('omit-empty'),
    models = require('../models'),
    service = require('../services/beeper-service'),
    utils = require('../utils.js'),
    returnSuccess = utils.returnSuccess,
    router = require('express').Router();

module.exports = router;

function m(s) { return s == null ? null : moment(s).toDate() }
function a(s) { return s == null ? []   : s.split(',') }
function j(s) { return (s == null || s.trim().length < 1) ? null : JSON.parse(s) }

router.route('/')
  .get(function(req, res, next) {
    var where = cev({
      timestamp: {
        $gte: m(req.query.fromDate),
        $lte: m(req.query.untilDate)
      },
      tags: { $in: a(req.query.tags) },
      source: req.query.source,
      offset: +req.params.offset || 0,
      limit: +req.params.limit || 20,
      sort: req.params.sort
    })

    // Data filters use the mongodb query format.
    _.forOwn(req.query, function(v, k) {
      if ( v == null || v.trim().length < 1 ) return;
      if ( k.indexOf('data.') !== 0 ) return;

      where[k] = JSON.parse(v)
    })

    var countOnly = req.query.countOnly == 'true'

    console.log('Beeps filter: %s (count only? %s)',
      JSON.stringify(where), countOnly)

    if ( countOnly ) {
      res.promise = models.Beep.count(where).then(function(n) {
        return {count: n}
      })
    } else {
      res.promise = models.Beep.findAndCountAll(where)
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
    res.promise = models.Beep.deleteById(req.params.id)
      .then(returnSuccess)
  })

  .patch(function(req, res, next) {
    var id = req.params.id
    res.promise = service.patch(id, req.body)
      .then(returnSuccess)
  })
