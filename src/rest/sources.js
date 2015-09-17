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

// *? will catch source1, source1/subsystem1, etc, but it will
// be accessible via req.params[0] and not a named param.
router.route('/*?')
  .get(function(req, res, next) {
    var name = req.params[0];
    res.promise = models.Source.findOne({name: name});
  })

  // Unlike the typical scenario, you can PUT to a non-existing
  // source and it will be created instead of returning an error.
  .put(function(req, res, next) {
    var obj = req.body;
    var name = req.params[0];
    res.promise = validateAsync(obj, constraints).then(function() {
      return models.Source.findOne({name: name})
    }).then(function(row) {
      if ( row == null ) return models.Source.create(obj);
      else return models.Source.update(row._id, obj);
    }).then(returnSuccess)
  })

  .delete(function(req, res, next) {
    var name = req.params[0];
    res.promise = models.Source.findOne({name: name}).then(function(row) {
      utils.assertNotNull(row, 'No such source ' + name);

      return models.Beep.destroy({source: row.name})
        .then(function() {
          return models.Source.destroy({_id: row._id});
        })
    }).then(returnSuccess)
  })
