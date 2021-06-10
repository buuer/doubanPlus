import { onMessage, setLocalStorage } from './tools'

onMessage((res, sender, sendResponse) => {
  if (res.type === 'fetch') {
    return fetch(res.url, res.init).then((fetchRes) => fetchRes.text())
  }
})
