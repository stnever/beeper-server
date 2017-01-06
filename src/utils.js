var _ = require('lodash'),
    util = require('util'),
    moment = require('moment')

exports.j = function(o) { return JSON.stringify(o) }
exports.jp = function(o) { return JSON.stringify(o, null, ' ') }

module.exports.httpErr = function(status, message) {
  var msg = util.format.apply(util, _.rest(arguments));
  var e = new Error(msg);
  e.httpStatus = status;
  return e;
}

module.exports.assertNotNull = function(obj, message) {
  if ( obj == null )
    throw module.exports.httpErr(404, message);
}

module.exports.returnSuccess = function(obj) {
  var r = { result: 'success' };
  if ( obj && obj.id ) r.id = obj.id;
  if ( obj && obj._id ) r.id = obj._id;
  return r;
}

var validate = require('validate.js'),
    Promise = require('bluebird');

// Seta a lib de promises para o validatejs
validate.Promise = function(callback) {
  return new Promise(callback);
}

// Define um Error específico para erros de validação.
function ValidationErrors(errors, options, attributes, constraints) {
  Error.captureStackTrace(this, this.constructor);
  this.errors = errors;
  this.options = options;
  this.attributes = attributes;
  this.constraints = constraints;
}
ValidationErrors.prototype = new Error();

exports.ValidationErrors = ValidationErrors;
exports.validate = validate;

exports.validateAsync = function(obj, constraints) {
  return validate.async(obj, constraints, {
    cleanAttributes: false,
    wrapErrors: ValidationErrors
  })
}

exports.logQs = function(obj) {
  if ( obj == null || Object.keys(obj).length < 1 ) return '';
  return _.reduce(obj, function(acc, val, key) {
    if ( _.isDate(val) ) val = moment(val).format()
    return acc.push(key + '=' + val)
  }).join(' ')
}

exports.s2a = function(s) {
  if ( s == null ) return []
  if ( _.isArray(s) ) return s
  if ( s.trim().length == 0 ) return []
  return s.split(',').map(function(p) { return p.trim() })
}
