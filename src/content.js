import { getDoubanInfo } from './douban.js'
import { getImdbInfo } from './imdb.js'
import {
  insertAfter,
  openLink,
  fetchData,
  setLocalStorage,
  getLocalStorage,
  createEl,
  findAndRemove,
  safeMatch,
} from './tools.js'
import localSearchLink from './config.json'
;(function main() {
  try {
    const doubanInfo = getDoubanInfo()
    castrateWarning(doubanInfo)

    updateSearchLink()

    getSearchLink().then((searchLink) =>
      addDownloadLink(Object.assign({ searchLink }, doubanInfo))
    )

    getImdbInfo(doubanInfo.imdbId)
      .then((imdbInfo) => {
        setImdbRating(Object.assign({}, imdbInfo, doubanInfo))
        setMPAA(imdbInfo)
      })
      .catch((err) => {
        console.error(err)
      })
  } catch (error) {
    console.error(error)
  }
})()

function getSearchLink() {
  return getLocalStorage('searchLink').then(
    ({ searchLink }) => {
      return searchLink && searchLink.list && searchLink.list.length
        ? searchLink.list
        : localSearchLink
    },
    () => localSearchLink
  )
}

function updateSearchLink() {
  getLocalStorage('searchLink').then(({ searchLink }) => {
    if (searchLink && searchLink.expiresAt && searchLink.expiresAt > Date.now())
      return

    fetchData(
      'https://raw.githubusercontent.com/buuer/doubanPlus/master/src/config.json'
    ).then((searchLink) => {
      if (searchLink) {
        setLocalStorage('searchLink', {
          list: JSON.parse(searchLink),
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        })
      }
    })
  })
}

function castrateWarning(doubanInfo) {
  if (!doubanInfo.isCastrate) return

  findAndRemove('.castrateNode')

  const castrateNode = createEl({
    tag: 'span',
    attr: { class: 'castrateNode', style: 'color:red' },
    children: ' ✂ 删减预警 ',
  })

  insertAfter(castrateNode, '[property="v:runtime"')
}

function setImdbRating({ ratingValue, ratingCount }) {
  if (!ratingValue) return
  findAndRemove('.imdbRatingDom')

  const imdbRatingDom = createEl({
    tag: 'span',
    attr: { class: 'imdbRatingDom' },
    children: [
      {
        tag: 'span',
        attr: { style: 'color: #ffac2d; margin: 0 5px;' },
        children: ratingValue + ' ★',
      },
      { tag: 'span', children: ratingCount + '人评价' },
    ],
  })

  insertAfter(imdbRatingDom, "a[href^='https://www.imdb.com']")
}

function setMPAA({ MPAA, imdbId }) {
  if (!MPAA.label || !imdbId) return
  findAndRemove('.MPAADom')

  const MPAADom = createEl({
    tag: 'div',
    attr: { class: 'MPAADom' },
    children: [
      { tag: 'span', attr: { class: 'pl' }, children: 'MPAA评级:' },
      {
        tag: 'a',
        attr: {
          target: '_blank',
          rel: 'nofollow',
          title: MPAA.pop,
          href: 'https://www.imdb.com/title/' + imdbId + '/parentalguide',
        },
        children: MPAA.label,
      },
      { tag: 'br' },
    ],
  })

  document.querySelector('#info').appendChild(MPAADom)
}

function addDownloadLink({
  imdbId,
  getFirstSeasonImdbId,
  isTvShow,
  title,
  searchLink,
}) {
  const lineEl = {
    tag: 'a',
    attr: {
      style:
        'display: block; margin-bottom: 8px; border-bottom: 1px dashed #DDD;',
    },
  }

  const searchTitle = title.replace(/(\s?第.+季|Season\s\d)/g, '')
  const searchTitle2 = searchTitle.replace(/(\s+)/g, '+')

  const getLink = (link, name) => {
    const rLink = link
      .replace('${searchTitle}', searchTitle)
      .replace('${imdbId}', imdbId)
      .replace('${title}', title)

    return {
      tag: 'a',
      attr: {
        href: rLink,
        target: '_blank',
        rel: 'nofollow',
      },
      children: name,
    }
  }

  findAndRemove('.asideDownloadEL')

  const asideDownloadEL = createEl({
    attr: { class: 'asideDownloadEL' },
    children: [
      {
        tag: 'h2',
        children: [
          { tag: 'i', children: ' 下载链接 ' },
          { tag: 'span', children: '· · · · · ·' },
        ],
      },
      {
        attr: {
          class: 'tags-body',
          style: 'margin-bottom: 40px;',
        },
        children: searchLink.map(({ link, name, line }) => {
          if (line) return lineEl
          if (link) return getLink(link, name)
        }),
      },
    ],
  })

  asideDownloadEL.addEventListener('click', (ev) => {
    if (isTvShow && /rarbg/.test(ev.target.href)) {
      const rarbgDomain = safeMatch(ev.target.href, /^http.+\//, 0)
      ev.preventDefault()
      getFirstSeasonImdbId().then((id) =>
        openLink(rarbgDomain + 'tv/' + id + '/')
      )
    }
  })

  insertAfter(asideDownloadEL, '.tags')
}
