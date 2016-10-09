import {_} from 'lodash';
import Ajax from './Ajax';
import PubSub from './PubSub';
/*
 attributes {}
 get(name)
 set(name, value)
 */
const _events = [
  'created',
  'updated',
  'fetched',
  'removed'
];

var models = [];

class Model {
  constructor(args, options, collection) {
    this.attrs = args || {};
    this.options = options || {};

    this.collection = collection;

    this._previousAttrs = {};
    this.mid = 'm' + models.length;
    models.push(this);

    this.e = new PubSub();

    if (this.events) {
      for (var event in this.events()) {
        if (this.events().hasOwnProperty(event) && _events.indexOf(event) !== -1) {
          this.e.subscribe(event, this.events()[event], this);
        }
      }
    }
  }

  get(name) {
    if (this.attrs[name] !== undefined) {
      return this.attrs[name];
    }
  }

  set(name, value) {
    if (this.attrs[name] && typeof this.attrs[name] !== typeof value && value !== null) {
      throw new Error(name + ' - ' + value + ': ' + (typeof this.attrs[name] !== typeof value));
    }
    this._previousAttrs = _.extend(this._previousAttrs, this.attrs);

    this.attrs[name] = value;

    this.e.publish('updated', this.attrs, this._previousAttrs);
    if (this.collection) {
      this.collection.e.publish('updated', this.collection, this);
    }
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

      _this.attrs = _data;

      _this.e.publish('fetched', _this);
    }, function (error) {
      console.log('AJAX Error: ', error);
    });
  }

  remove() {
    this.e.publish('removed');
    delete this;
  }

  toObject() {
    return _.extend({}, this.attrs);
  }
}

export default Model;