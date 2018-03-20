/* global google */
/* eslint-disable no-param-reassign */

function lowerFirst(string) {
  // Not Unicode safe, but using [...string] compiles to Array.from which require babel-polyfill, which is a 100k+ library
  const loweredHead = string.charAt(0).toLowerCase()
  const unchangedTail = string.slice(1)

  return loweredHead + unchangedTail
}

function rdcUncontrolledAndControlledProps(acc, val, index, arr) {
  let key = arr[index]
  if (Object.keys(acc.prevProps).includes(key)) {
    const match = key.match(/^default(\S+)/)
    if (match) {
      const unprefixedKey = lowerFirst(match[1])
      if (!Object.keys(acc.nextProps).includes(unprefixedKey)) {
        acc.nextProps[unprefixedKey] = acc.prevProps[key]
      }
    } else {
      acc.nextProps[key] = acc.prevProps[key]
    }
  }
  return acc
}

function applyUpdaterToNextProps(updaterMap, prevProps, nextProps, instance) {
  for (let key of Object.keys(updaterMap)) {
    let fn = updaterMap[key]
    const nextValue = nextProps[key]
    if (nextValue !== prevProps[key]) {
      fn(instance, nextValue)
    }
  }
}

export function construct(propTypes, updaterMap, prevProps, instance) {
  const { nextProps } = Object.keys(propTypes).reduce(
    rdcUncontrolledAndControlledProps,
    {
      nextProps: {},
      prevProps,
    }
  )
  applyUpdaterToNextProps(
    updaterMap,
    {
      /* empty prevProps for construct */
    },
    nextProps,
    instance
  )
}

export function componentDidMount(component, instance, eventMap) {
  registerEvents(component, instance, eventMap)
}

export function componentDidUpdate(
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

export function componentWillUnmount(component) {
  component.unregisterAllEvents()
}

function registerEvents(component, instance, eventMap) {
  const registeredList = Object.keys(eventMap).reduce(
    (acc, onEventName, index) => {
      let googleEventName = eventMap[onEventName]
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
    []
  )

  component.unregisterAllEvents = () => {
    registeredList.forEach(event => {
      unregisterEvent(event)
    })
  }
}

function unregisterEvent(registered) {
  google.maps.event.removeListener(registered)
}
