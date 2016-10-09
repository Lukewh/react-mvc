import 'npm-fetch';

class _Ajax {
  constructor() {

  }

  request(url, options) {
    return new Promise(function (resolve, reject) {
      fetch(url, options).then(function (response) {
        if (response.status === 401) {
          return false;
        } else {
          return response.json();
        }
      }).then(function (data) {
        resolve(data);
      });
    });
  }
}

var Ajax = Ajax || new _Ajax();

export default Ajax;