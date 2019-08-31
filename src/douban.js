import { safeMatch, comporse, getNodeProps } from './tools'

export const getDoubanInfo = () => {
  const infoNode = document.getElementById('info')

  const doubanId = getDoubanId()
  const imdbId = getImdbId(infoNode.innerHTML)
  const isTvShow = checkIsTvShow()

  return {
    doubanId,
    imdbId,
    isTvShow,
    title: getTitle(),
    isCastrate: isCastrate(infoNode),
    getFirstSeasonImdbId: () => getFirstSeasonImdbId({ doubanId, imdbId })
  }
}

const getImdbId = docText => safeMatch(docText, /www.imdb.com\/title\/(\w+)?"/)

const getDoubanId = () =>
  safeMatch(window.location.pathname, /\/subject\/(\w+)(\/|$)/)

const checkIsTvShow = () =>
  !!(getNodeProps('#season') || getNodeProps('.episode_list'))

const getTitle = () => getNodeProps('[property="v:itemreviewed"]', 'innerText')

const isCastrate = (el = document) => {
  const runTimeNode = el.querySelector('[property="v:runtime"')
  const chinaRunTime = safeMatch(el.innerText, /片长:.*?(\d*)\D*?中国大陆/)
  if (!runTimeNode) return false
  const runTime = runTimeNode.getAttribute('content')
  if (!runTime || !chinaRunTime) return false
  return Number(runTime) - Number(chinaRunTime) > 0
}

const getFirstSeasonImdbId = ({ doubanId, imdbId }) => {
  const selectNode = document.getElementById('season')
  if (!selectNode) return Promise.resolve(imdbId)

  const fsId = selectNode.firstElementChild.value
  if (fsId === doubanId) return Promise.resolve(imdbId)

  return fetch('https://movie.douban.com/subject/' + fsId + '/')
    .then(res => res.text())
    .then(text => safeMatch(text, /id="info">([\s\S]*?)<\/div>/))
    .then(getImdbId)
}
