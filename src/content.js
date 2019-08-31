import { getDoubanInfo } from './douban.js'
import { getImdbInfo } from './imdb.js'
import { getNode, insertAfter, openLink } from './tools.js'
;(function main() {
  try {
    const doubanInfo = getDoubanInfo()
    castrateWarning(doubanInfo)
    addDownloadLink(doubanInfo)

    getImdbInfo(doubanInfo.imdbId).then(imdbInfo => {
      setImdbRating({ ...imdbInfo, ...doubanInfo })
      setMPAA(imdbInfo)
    })
  } catch (error) {
    console.log('error', error)
  }
})()

function castrateWarning(doubanInfo) {
  if (!doubanInfo.isCastrate) return
  const castrateNode = getNode('span', 'castrateNode')

  castrateNode.innerText = ' ✂ 删减预警 '
  castrateNode.style = 'color:red'

  insertAfter(castrateNode, '[property="v:runtime"')
}

function setImdbRating({ ratingValue, ratingCount }) {
  if (!ratingValue) return
  const imdbRatingDom = getNode('span', 'imdbRatingDom')

  imdbRatingDom.innerHTML = `
    / <span style="color: #ffac2d"> ${ratingValue} ★ </span> 
    / ${ratingCount} 人评价`

  insertAfter(imdbRatingDom, "a[href^='http://www.imdb.com']")
}

function setMPAA({ MPAA, imdbId }) {
  if (!MPAA.label || !imdbId) return
  const MPAADom = getNode('div', 'MPAADom')

  MPAADom.innerHTML = `
  <span class='pl'>MPAA评级:</span> 
  <a href="https://www.imdb.com/title/${imdbId}/parentalguide" target="_blank" rel="nofollow"  
  title="${MPAA.pop}">  ${MPAA.label} </a> 
  <br/>
  `
  document.querySelector('#info').appendChild(MPAADom)
}

function addDownloadLink({ imdbId, getFirstSeasonImdbId, isTvShow, title }) {
  const asideDownloadEL = getNode('div', 'asideDownloadEL')

  asideDownloadEL.addEventListener('click', ev => {
    if (isTvShow && /rarbg/.test(ev.target.href)) {
      ev.preventDefault()
      getFirstSeasonImdbId().then(id => openLink(`https://rarbg.to/tv/${id}/`))
    }
  })

  const searchTitle = title.replace(/(\s?第.+季|Season\s\d)/g, '')
  const searchTitle2 = searchTitle.replace(/(\s+)/g, '+')
  const links = [
    {
      name: '人人影视',
      link: `http://www.zmz2019.com/search?keyword=${searchTitle}&type=resource`
    },
    {
      name: '音范丝',
      link: `http://www.yinfans.me/?s=${searchTitle}`
    },
    {
      name: 'RARBG',
      link: imdbId && `https://rarbg.to/torrents.php?imdb=${imdbId}`
    },
    {
      name: 'thepiratebay',
      link: imdbId && `https://thepiratebay.org/search/${imdbId}/0/99/200`
    },
    {
      name: 'KickAss',
      link: `https://katcr.co/katsearch/page/1/${title}`
    },
    {
      name: 'yourbittorrent',
      link: `https://yourbittorrent.com/?q=${title}`
    },
    {
      html:
        '<a style="display: block; margin-bottom: 8px; border-bottom: 1px dashed #DDD;"></a>'
    },
    {
      name: '字幕库',
      link: `http://www.zimuku.la/search?q=${searchTitle}`
    },
    {
      name: '伪射手',
      link: `https://secure.assrt.net/sub/?searchword=${searchTitle}`
    }
  ]

  const linkHtml = links
    .map(({ link, name, html }) => {
      if (html) return html
      if (link) {
        return `<a href="${link}" target="_blank" rel="nofollow"> ${name} </a>`
      }
      return ''
    })
    .join('')

  asideDownloadEL.innerHTML = `
    <h2> <i> 下载链接 </i>  · · · · · · </h2>
    <div class="tags-body" style="margin-bottom: 40px;"> ${linkHtml} </div>`

  insertAfter(asideDownloadEL, '.tags')
}
