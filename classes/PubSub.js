/*
 groups{}
 subscribe(group, function, context)
 publish(groups, data)
 */
class PubSub {
  constructor() {
    this.groups = {};
  }

  getGroup(group) {
    if (this.groups[group]) {
      return this.groups[group];
    }
    return false;
  }

  createGroup(group) {
    if (!this.groups[group]) {
      this.groups[group] = [];
    }

    return this.getGroup(group);
  }

  subscribe(group, fn, context) {
    var _group = this.createGroup(group);

    _group.push({
      fn: fn,
      context: context || this
    });
  }

  publish() {
    var args = Array.prototype.slice.call(arguments);
    var group = args.shift();
    var _group = this.getGroup(group);

    if (!_group) {
      return false;
    }

    _group.forEach(function (entry) {
      entry.fn.apply(entry.context, args);
    });
  }

  unsubscribe(group, fn) {
    var _group = this.getGroup(group);
    if (!_group) {
      return true;
    }

    for (var i = 0; i < _group.length; i += 1) {
      if (_group[i].fn === fn) {
        _group.splice(i, 1);
        i -= 1;
      }
    }
    return true;
  }
}

export default PubSub;