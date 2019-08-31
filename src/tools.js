const isChrome = /chrome/.test(navigator.userAgent.toLowerCase())
export const browser = isChrome ? chrome : browser
/**
 *
 *
 * @param {RequestInit} url
 * @param {RequestInit} init
 * @param {boolean} [cache=true]
 * @returns
 */

export const fetchData = (url, init, cache = true) => {
  return new Promise(resolve => {
    browser.runtime.sendMessage({ type: 'fetch', url, init, cache }, resolve)
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
export const getNode = (tag, className) => {
  const queryEl = document.querySelector('.' + className)

  if (queryEl) return queryEl

  const el = document.createElement(tag)
  el.className = className
  return el
}

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
export const comporse = fns => arg =>
  fns.reduceRight((preRes, curFn) => curFn(preRes), arg)

export const openLink = link => {
  const linkEl = document.createElement('a')
  linkEl.setAttribute('href', link)
  linkEl.setAttribute('target', '_blank')
  linkEl.setAttribute('rel', 'nofollow')
  linkEl.setAttribute('style', 'disaple:none')
  document.body.appendChild(linkEl)
  linkEl.click()
  linkEl.remove()
}
