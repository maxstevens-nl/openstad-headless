module.exports = {
  can: require('../lib/sequelize-authorization/middleware/can'),
  toAuthorizedJSON: require('../lib/sequelize-authorization/middleware/to-authorized-json'),
  useReqUser: require('../lib/sequelize-authorization/middleware/use-req-user'),
  hasRole: require('../lib/sequelize-authorization/lib/hasRole'),
};
