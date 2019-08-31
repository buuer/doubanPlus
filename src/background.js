import { browser } from './tools'

const dataCache = (function cache() {
  const cacheMap = Object.create(null)
  return Object.freeze({
    set: (key, val) => (cacheMap[key] = val),
    get: key => cacheMap[key]
  })
})()

browser.runtime.onMessage.addListener((res, sender, sendResponse) => {
  if (res.type === 'fetch') {
    const isCached = dataCache.get(res.url)
    if (res.cache === true && isCached) {
      sendResponse(isCached)
    } else {
      return fetch(res.url, res.init)
        .then(fetchRes => fetchRes.text())
        .then(text => dataCache.set(res.url, text))
    }
  }
})
