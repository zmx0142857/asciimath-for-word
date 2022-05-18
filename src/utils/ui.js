/* eslint-disable */
export function appendChildren (el, children) {
  if (Array.isArray(children)) children.forEach(c => el.appendChild(c))
  else el.appendChild(children)
}

// 虚拟 dom (bushi
export default function $(tag, options = {}, children = []) {
  const len = tag && tag.length
  const el = !tag
    ? document.createDocumentFragment()
    : tag[0] === '#'
    ? document.getElementById(tag.slice(1))
    : tag[0] === '.'
    ? document.getElementsByClassName(tag.slice(1))
    : tag[0] === '<' && tag[len-1] === '>'
    ? (options.namespace
      ? document.createElementNS(namespace, tag.slice(1,len-1))
      : document.createElement(tag.slice(1,len-1))
    ) : document.getElementsByTagName(tag);

  if (typeof options === 'string') {
    el.innerText = options
  } else {
    Object.keys(options).forEach(key => {
      const value = options[key]
      if (key === 'className') {
        if (Array.isArray(value)) value.forEach(v => el.classList.add(v))
        else el.classList.add(value)
      } else if (key === 'attrs') {
        Object.keys(value).forEach(attr => el.setAttribute(attr, value[attr]))
      } else if (key === 'on') {
        Object.keys(value).forEach(ev => {
          const arr = ev.split('.')
          el.addEventListener(arr[0], value[ev].bind(options), arr[1] === 'true')
        })
      } else if (key === 'style') {
        Object.assign(el.style, value)
      } else if (typeof value === 'function') {
        el[key] = value.bind(options)
      } else if (key !== 'namespace') {
        el[key] = value
      }
    })
    options.el = el
  }

  appendChildren(el, children)

  return el
}