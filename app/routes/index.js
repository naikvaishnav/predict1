const prediction_routes = require('./prediction_routes');
module.exports = function(app, db) {
  prediction_routes(app, db);
  // Other route groups could go here, in the future
};