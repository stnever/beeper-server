var _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('../models'),
    utils = require('../utils.js'),
    subscriptions = require('./subscriptions'),
    returnSuccess = utils.returnSuccess,
    validateAsync = require('../utils').validateAsync;

var constraints = {
  contents: {
    presence: { message: '^You must supply the beep contents.'}
  },
  source: {
    presence: { message: '^You must supply the beep source.'}
  }
}

exports.create = function(beeps) {
  var wasArray = true
  if ( !_.isArray(beeps) ) {
    wasArray = false
    beeps = [beeps]
  }

  return Promise.all(beeps.map(function(beep) {
    return validateAsync(beep, constraints)
      .then(preProcess)
  })).then(function(validatedBeeps) {
    return Promise.all(validatedBeeps.map(createOne))
  }).then(function(createdBeeps) {

    // Agrupa por sourceName, e atualiza o latestBeep de
    // cada uma para o último da lista.
    var pairs = _.chain(createdBeeps)
      .groupBy('source').pairs().value()

    return Promise.all(pairs.map(function(p) {
      var sourceName = p[0],
          someBeeps = p[1],
          latestBeep = _.last(someBeeps)

      return findOrCreateSource(sourceName).then(function(source) {
        return models.Source.bulkUpdate(
          { _id: source._id },
          { $set: { latestBeep: latestBeep } }
        )
      })
    })).thenReturn(createdBeeps)
  }).tap(function(result) {
    return Promise.map(result, subscriptions.checkSubscriptions)
  }).then(function(result) {
    if ( wasArray ) return result
    else return result[0]
  })
}

function createOne(beep) {
  return models.Beep.create(beep)
}

function preProcess(beep) {
  beep.timestamp = new Date()
  _.defaults(beep, {
    tags: [],
    data: {}
  })
  return beep
}

function findOrCreateSource(name) {
  return models.Source.findOne({
    name: name
  }).then(function(source) {
    if ( source == null )
      return models.Source.create({name: name})
    else
      return source
  })
}
