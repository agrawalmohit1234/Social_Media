const config = require('./../config/config');
const app = require('./express');
const mongoose = require('mongoose');

app.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info('Server started on port %s.', config.port);
});

mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connection is Successfull ..........');
  })
  .catch((e) => {
    console.log('No connection');
  });
