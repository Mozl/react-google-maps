"use strict"

Object.defineProperty(exports, "__esModule", {
  value: true,
})

var _getIterator2 = require("babel-runtime/core-js/get-iterator")

var _getIterator3 = _interopRequireDefault(_getIterator2)

var _keys = require("babel-runtime/core-js/object/keys")

var _keys2 = _interopRequireDefault(_keys)

exports.construct = construct
exports.componentDidMount = componentDidMount
exports.componentDidUpdate = componentDidUpdate
exports.componentWillUnmount = componentWillUnmount

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

/* global google */
/* eslint-disable no-param-reassign */

function lowerFirst(string) {
  // Not Unicode safe, but using [...string] compiles to Array.from which require babel-polyfill, which is a 100k+ library
  var loweredHead = string.charAt(0).toLowerCase()
  var unchangedTail = string.slice(1)

  return loweredHead + unchangedTail
}

function rdcUncontrolledAndControlledProps(acc, val, index, arr) {
  var key = arr[index]
  console.log("rdcUncontrolledAndControlledProps: ", key)
  if ((0, _keys2.default)(acc.prevProps).includes(key)) {
    var match = key.match(/^default(\S+)/)
    if (match) {
      var unprefixedKey = lowerFirst(match[1])
      if (!(0, _keys2.default)(acc.nextProps).includes(unprefixedKey)) {
        acc.nextProps[unprefixedKey] = acc.prevProps[key]
      }
    } else {
      acc.nextProps[key] = acc.prevProps[key]
    }
  }
  return acc
}

function applyUpdaterToNextProps(updaterMap, prevProps, nextProps, instance) {
  var _iteratorNormalCompletion = true
  var _didIteratorError = false
  var _iteratorError = undefined

  try {
    for (
      var _iterator = (0, _getIterator3.default)(
          (0, _keys2.default)(updaterMap)
        ),
        _step;
      !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
      _iteratorNormalCompletion = true
    ) {
      var key = _step.value

      var fn = updaterMap[key]
      var nextValue = nextProps[key]
      if (nextValue !== prevProps[key]) {
        fn(instance, nextValue)
      }
    }
  } catch (err) {
    _didIteratorError = true
    _iteratorError = err
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return()
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError
      }
    }
  }
}

function construct(propTypes, updaterMap, prevProps, instance) {
  var _Object$keys$reduce = (0, _keys2.default)(propTypes).reduce(
      rdcUncontrolledAndControlledProps,
      {
        nextProps: {},
        prevProps: prevProps,
      }
    ),
    nextProps = _Object$keys$reduce.nextProps

  applyUpdaterToNextProps(
    updaterMap,
    {
      /* empty prevProps for construct */
    },
    nextProps,
    instance
  )
}

function componentDidMount(component, instance, eventMap) {
  registerEvents(component, instance, eventMap)
}

function componentDidUpdate(
  component,
  instance,
  eventMap,
  updaterMap,
  prevProps
) {
  component.unregisterAllEvents()
  applyUpdaterToNextProps(updaterMap, prevProps, component.props, instance)
  registerEvents(component, instance, eventMap)
}

function componentWillUnmount(component) {
  component.unregisterAllEvents()
}

function registerEvents(component, instance, eventMap) {
  var registeredList = (0, _keys2.default)(eventMap).reduce(function(
    acc,
    onEventName,
    index
  ) {
    var googleEventName = eventMap[onEventName]
    if (typeof component.props[onEventName] === "function") {
      acc.push(
        google.maps.event.addListener(
          instance,
          googleEventName,
          component.props[onEventName]
        )
      )
    }
    return acc
  },
  [])

  component.unregisterAllEvents = function() {
    registeredList.forEach(function(event) {
      unregisterEvent(event)
    })
  }
}

function unregisterEvent(registered) {
  google.maps.event.removeListener(registered)
}
