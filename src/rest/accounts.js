var _ = require('lodash'),
    models = require('../models'),
    utils = require('../utils'),
    returnSuccess = utils.returnSuccess,
    validateAsync = require('../utils').validateAsync,
    router = require('express').Router();

module.exports = router;

var constraints = {
  code: {
    presence: { message: '^You must supply the account code.'}
  }
}

function findAccount(code) {
  return models.Account.findOne({code: code}).then(function(row) {
    utils.assertNotNull(row, 'No such Account ' + code)
    return row
  })
}

router.route('/')
  .get(function(req, res, next) {
    var filter = req.query;
    res.promise = models.Account.findAllAndCount(filter)
      .then(function(data) {
        data.rows.forEach(function(acc) { delete acc.passwordHash })
        return data
      });
  })

  .post(function(req, res, next) {
    var obj = req.body;
    res.promise = validateAsync(obj, constraints).then(function() {
      return models.Account.create(obj)
    }).then(returnSuccess)
  })

router.route('/:code')
  .get(function(req, res, next) {
    res.promise = findAccount(req.params.code)
  })

  // Unlike the typical scenario, you can PUT to a non-existing
  // account and it will be created instead of returning an error.
  .put(function(req, res, next) {
    var obj = req.body,
        code = req.params.code

    obj.code = code

    res.promise = validateAsync(obj, constraints).then(function() {
      return findAccount(code)
    }).then(function(row) {
      if ( row == null ) return models.Account.create(obj);
      else return models.Account.update(row._id, obj);
    }).then(returnSuccess)
  })

  .patch(function(req, res) {
    var where = {code: req.params.code},
        what  = {$set: req.body}

    res.promise = models.Account.bulkUpdate(where, what)
      .then(returnSuccess)
  })

  .delete(function(req, res, next) {
    var code = req.params.code;
    res.promise = findAccount(code).then(function(row) {
      return models.Account.destroy({_id: row._id})
    }).then(returnSuccess)
  })


router.route('/:code/subscriptions')
  .get(function(req, res) {
    res.promise = findAccount(req.params.code).then(function(row) {
      return row.subscriptions || []
    })
  })

  .post(function(req, res) {
    var code = req.param.code,
        sub = req.body

    res.promise = findAccount(req.params.code).then(function(row) {
      if ( row.subscriptions == null ) row.subscriptions = []
      row.subscriptions.push(_.omit(sub, '_id'))

      return models.Account.update(row._id, row)
    }).thenReturn({result: 'success'})
  })

router.route('/:code/subscriptions/:index')
  .get(function(req, res) {
    res.promise = findAccount(req.params.code).then(function(row) {
      return (row.subscriptions || [])[+req.params.index]
    })
  })

  .put(function(req, res) {
    var code = req.param.code,
        index = +req.param.index,
        sub = req.body

    res.promise = findAccount(req.params.code).then(function(row) {
      var sub = row.subscriptions[index]
      _.assign(sub, _.omit(req.body, '_id'))

      return models.Account.update(row._id, row)
    }).thenReturn({result: 'success'})
  })

  .delete(function(req, res) {
    var code = req.param.code,
        index = +req.param.index

    res.promise = findAccount(req.params.code).then(function(row) {
      row.subscriptions.splice(index, 1)
      return models.Account.update(row._id, row)
    }).thenReturn({result: 'success'})
  })
