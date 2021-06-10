export const isChrome = /chrome/.test(navigator.userAgent.toLowerCase())

const allBrowser = isChrome ? chrome : browser

export const onMessage = (handler) => {
  const polyfill = (res, sender, sendResponse) => {
    const messageRes = handler(res, sender, sendResponse)

    if (isChrome && messageRes instanceof Promise) {
      messageRes.then(sendResponse)
      return true
    } else {
      return messageRes
    }
  }

  return allBrowser.runtime.onMessage.addListener(polyfill)
}

/**
 *
 *
 * @param {RequestInit} url
 * @param {RequestInit} init
 * @param {boolean} [cache=true]
 * @returns
 */

export const fetchData = (url, init) => {
  return new Promise((resolve) => {
    allBrowser.runtime.sendMessage({ type: 'fetch', url, init }, resolve)
  })
}

export const safeMatch = (str = '', reg, index = 1) => {
  const matched = str.match(reg)
  return (matched && matched[index]) || ''
}

export const getNodeProps = (query, key) => {
  const el = document.querySelector(query)
  return el && key ? el[key] : el
}

/**
 *
 *
 * @param {String} tag
 * @param {String} className
 * @returns {Element}
 */
export const getNode = (tag, className) =>
  document.querySelector('.' + className) ||
  createEl({ tag, attr: { class: className } })

/**
 *
 *
 * @param {*} el
 * @param {String|Element} targetEl
 */
export const insertAfter = (el, targetEl) => {
  if (typeof targetEl === 'string') {
    targetEl = document.querySelector(targetEl)
  }
  if (!targetEl) throw 'targetEl is require'
  return targetEl.parentElement.insertBefore(el, targetEl.nextElementSibling)
}

/**
 *
 *
 * @param {Array<Function>} fns
 */
export const comporse = (fns) => (arg) =>
  fns.reduceRight((preRes, curFn) => curFn(preRes), arg)

export const openLink = (link) => {
  const linkEl = createLinkEl({
    link,
    text: '',
    create: true,
    attr: { style: 'disaple:none' },
  })

  document.body.appendChild(linkEl)
  linkEl.click()
  linkEl.remove()
}

export const getLocalStorage = (key) => allBrowser.storage.local.get(key)

export const setLocalStorage = (key, val) =>
  allBrowser.storage.local.set({ [key]: val })

export const findAndRemove = (className) => {
  const el = document.querySelector(className)
  el && el.remove()
}

export const createEl = ({ tag = 'div', attr = {}, children = '' }) => {
  const el = document.createElement(tag)
  try {
    Object.keys(attr).map((k) => el.setAttribute(k, attr[k]))
    if (typeof children === 'string') {
      el.innerText = children
    } else if (Array.isArray(children)) {
      children.map((item) => el.appendChild(createEl(item)))
    } else if (typeof children === 'object') {
      el.appendChild(createEl(children))
    } else {
      throw new Error('type error')
    }
  } catch (error) {
    console.error(error)
  }
  return el
}

export const log = (name) => (content) =>
  console.log('log-', name, ': ', content)

export const createLinkEl = ({
  link,
  text = link,
  create = false,
  attr = {},
}) => {
  const linkEl = {
    tag: 'a',
    attr: { target: '_blank', rel: 'nofollow', href: link, ...attr },
    children: text,
  }
  return create ? createEl(linkEl) : linkEl
}
