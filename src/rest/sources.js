var _ = require('lodash'),
    models = require('../services/models.js'),
    utils = require('../utils.js'),
    returnSuccess = utils.returnSuccess,
    validateAsync = require('../utils').validateAsync,
    router = require('express').Router();

module.exports = router;

var constraints = {
  name: {
    presence: { message: '^You must supply the source name.'}
  }
}

router.route('/')
  .get(function(req, res, next) {
    var filter = req.query;
    res.promise = models.Source.findAll(filter);
  })

  .post(function(req, res, next) {
    var obj = req.body;
    res.promise = validateAsync(obj, constraints).then(function() {
      return models.Source.create(obj);
    }).then(returnSuccess)
  })

router.route('/:name')
  .get(function(req, res, next) {
    res.promise = models.Source.findOne({name: req.params.name});
  })

  .put(function(req, res, next) {
    var obj = req.body;
    res.promise = validateAsync(obj, constraints).then(function() {
      return models.Source.findOne({name: +req.params.name})
    }).then(function(row) {
      utils.assertNotNull(row, 'No such source ' + req.params.name);
      return row.set(obj).save();
    }).then(returnSuccess)
  })

  .delete(function(req, res, next) {
    res.promise = models.Source.findOne({name: req.params.name}).then(function(row) {
      utils.assertNotNull(row, 'No such source ' + req.params.name);
      return models.Source.destroy(row);
    }).then(returnSuccess)
  })
