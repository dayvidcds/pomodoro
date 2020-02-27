const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = mongoose.connect('mongodb://dayvidcds:dayvidupe12344223@ds251158.mlab.com:51158/jungle-style', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true
});