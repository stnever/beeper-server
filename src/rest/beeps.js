var _ = require('lodash'),
    models = require('../services/models.js'),
    service = require('../services/beeper-service'),
    utils = require('../utils.js'),
    returnSuccess = utils.returnSuccess,
    router = require('express').Router();

module.exports = router;

router.route('/')
  .get(function(req, res, next) {
    var filter = req.query;
    res.promise = models.Beep.findAll(filter);
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
