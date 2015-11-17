exports.groupByDay = function(items) {
  var result = [];
  items.forEach(function(i) {
    var last = _.last(result);
    if ( last == null || !exports.isSame(i.timestamp, last.timestamp) ) {
      last = {timestamp: i.timestamp, items: [i]}
      result.push(last);
    } else {
      last.items.push(i)
    }
  })
  return result;
}

exports.isSame = function(a, b) {
  return moment(a).utcOffset('-03:00')
    .isSame(moment(b).utcOffset('-03:00'), 'day');
}