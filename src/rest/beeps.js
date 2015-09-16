var _ = require('lodash'),
    models = require('../services/models.js'),
    utils = require('../utils.js'),
    returnSuccess = utils.returnSuccess,
    validateAsync = require('../utils').validateAsync,
    router = require('express').Router();

module.exports = router;

var constraints = {
  contents: {
    presence: { message: '^You must supply the beep contents.'}
  },
  source: {
    presence: { message: '^You must supply the beep source.'}
  }
}

router.route('/')
  .get(function(req, res, next) {
    var filter = req.query;
    res.promise = models.Beep.findAll(filter);
  })

  .post(function(req, res, next) {
    var obj = req.body;
    res.promise = validateAsync(obj, constraints).then(function() {
      return models.Source.findOne({name: obj.source})
    }).then(function(source) {
      if ( source == null ) return models.Source.create({
        name: obj.source
      })
    }).then(function() {
      obj.timestamp = new Date();
      if ( obj.tags == null ) obj.tags = [];
      if ( obj.data == null ) obj.data = {};
      return models.Beep.create(obj);
    }).then(returnSuccess)
  })

router.route('/:id')
  .get(function(req, res, next) {
    res.promise = models.Beep.findById(req.params.id);
  })

  .delete(function(req, res, next) {
    res.promise = models.Beep.deleteById(req.params.id)
      .then(returnSuccess)
  })
