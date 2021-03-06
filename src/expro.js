var debug = require('debug')('beeper:srv')

module.exports = function(req, res, next) {
  next()

  if ( res.promise ) {
    res.promise
      .then(function(value) { res.json(value) })
      .catch(next)
  }
}

module.exports.errorHandler = function(err, req, res, next) {

  // If there is an 'httpStatus' property, assume whoever threw
  // it wanted a specific HTTP error response.
  if ( err.httpStatus ) {
    debug('Operational error during %s %s: %s', req.method,
      req.url, err.httpStatus, err.message);
    res.status(err.httpStatus).json({error: err.message});
  }

  // If there is an 'errors' property, assume this is a validation
  // error and sends an HTTP 400 response (containing the errors).
  else if ( err.errors ) {
    debug('ValidationErrors during %s %s: %s', req.method,
      req.url, JSON.stringify(err.errors));
    res.status(400).json(err.errors);
  }

  // If we got here, then it's an unexpected error that deserves
  // an HTTP 500 response.
  else {
    debug('Unexpected error during %s %s: %s', req.method,
      req.url, err.message, err.stack);
    res.status(500).json({error: err.message});
  }
}
