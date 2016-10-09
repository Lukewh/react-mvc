import {_} from 'lodash';
import PubSub from './PubSub';
import Model from './Model';
import Ajax from './Ajax';

const _events = [
  'created',
  'updated',
  'fetched',
  'removed'
];

var collections = -1;

class Collection {
  constructor(models, options) {
    this.models = [];
    this.options = options;

    this.model = this.options.model || Model;

    collections += 1;
    this.cid = 'c' + collections;

    this.e = new PubSub();

    if (this.events) {
      for (var event in this.events()) {
        if (this.events().hasOwnProperty(event) && _events.indexOf(event) !== -1) {
          this.e.subscribe(event, this.events()[event], this);
        }
      }
    }

    this.length = this.models.length;
  }

  add(model, addToStart) {
    if (model instanceof Model) {
      if (addToStart) {
        this.models.unshift(model);
      } else {
        this.models.push(model);
      }
    } else {
      if (!this.modelExists(model)) {
        if (addToStart) {
          this.models.unshift(new this.model(model, {}, this));
        } else {
          this.models.push(new this.model(model, {}, this));
        }
      }
    }

    this.length = this.models.length;
  }

  at(index) {
    if (this.models[index]) {
      return this.models[index];
    }
    return false;
  }

  modelExists(attrs) {
    for (var i = 0, ii = this.models.length; i < ii; i += 1) {
      let model = this.models[i];
      if (_.isEqual(attrs, model.attrs)) {
        return true;
      }
    }

    return false;
  }

  fetch(options) {
    var _this = this;
    var url;

    let _options = _.extend({}, this.options);

    if (options) {
      _options = _.extend(_options, options);
    }

    if (_options.url) {
      url = _options.url;
      delete _options.url;
    } else {
      throw new Error('No url');
    }

    Ajax.request(url, _options).then(function (data) {
      var _data = data;
      if (_this.parse) {
        _data = _this.parse(_data);
      }

      if (_.isArray(_data) && _data.length > 0) {
        _data.forEach(function (item) {
          _this.add(item);
        });
      }

      _this.e.publish('fetched', _this);
    }, function (error) {
      console.log('AJAX Error: ', error);
    });
  }

  remove(model) {
    for (var i = 0; i < this.models.length; i += 1) {
      if (this.models[i] === model) {
        this.models.splice(i, 1);
        i -= 1;
      }
    }
    this.length = this.models.length;
    this.e.publish('removed');
  }
}

export default Collection;