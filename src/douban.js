import { safeMatch, comporse, getNodeProps } from "./tools"

export const getDoubanInfo = () => {
  const infoNode = document.getElementById("info")

  const doubanId = getDoubanId()
  const imdbId = getImdbId(infoNode.innerHTML)
  const isTvShow = checkIsTvShow()

  return {
    doubanId,
    imdbId,
    isTvShow,
    title: getTitle(),
    isCastrate: isCastrate(infoNode),
    getFirstSeasonImdbId: () => getFirstSeasonImdbId({ doubanId, imdbId }),
  }
}

const getImdbId = (docText) =>
  safeMatch(docText, /class="pl">IMDb:.*?>(?:<.*?>)?(.+?)</).trim()

const getDoubanId = () =>
  safeMatch(window.location.pathname, /\/subject\/(\w+)(\/|$)/)

const checkIsTvShow = () =>
  !!(getNodeProps("#season") || getNodeProps(".episode_list"))

const getTitle = () => getNodeProps('[property="v:itemreviewed"]', "innerText")

/**
 *
 * @param {Element} node
 * @param {string} endQuery
 * @returns
 */
const getSiblings = (node, endQuery) => {
  const collectText = (start, getNext, prepend = false) => {
    let text = ""
    for (let sibling = start; sibling; sibling = getNext(sibling)) {
      if (sibling.matches?.(endQuery)) break
      const content = sibling.textContent || ""
      text = prepend ? content + text : text + content
    }
    return text
  }

  return (
    collectText(node.previousSibling, (n) => n.previousSibling, true) +
    node.textContent +
    collectText(node.nextSibling, (n) => n.nextSibling)
  )
}

const isCastrate = (el = document) => {
  const runTimeNode = el.querySelector('[property="v:runtime"')
  return getSiblings(runTimeNode, "span.pl").includes("中国大陆")
}

const getFirstSeasonImdbId = ({ doubanId, imdbId }) => {
  const selectNode = document.getElementById("season")
  if (!selectNode) return Promise.resolve(imdbId)

  const fsId = selectNode.firstElementChild.value
  if (fsId === doubanId) return Promise.resolve(imdbId)

  return fetch("https://movie.douban.com/subject/" + fsId + "/")
    .then((res) => res.text())
    .then(getImdbId)
}
