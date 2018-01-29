'use strict';

const PORT = process.env.PORT || 8000;

// if (process.argv.length >= 2) {
//   if (process.argv.indexOf('mobile') >= 2) {
//     NETWORK = '192.168.1.1';
//   }
// }

const express = require('express');
const app = express();

app.use(function (req, res, next) {
  // When using Express and Node to serve mySoil Sample as a web app it must be
  // done over https for location services to work. Force a redirect if http is used. 
  // Suitable for Heroku. May need adjusting for other platforms.
  if (req.headers['x-forwarded-proto'] !== 'https' &&
      req.hostname !== 'localhost') {
    res.redirect('https://' + req.hostname + req.url) 
  }
  else {
    next();
  }
});

app.use(express.static('dist/main'));

const server = app.listen(PORT, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
