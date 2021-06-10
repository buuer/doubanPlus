import { safeMatch, fetchData, getLocalStorage, setLocalStorage } from './tools'

export const getImdbInfo = (imdbId) => {
  const storageKey = 'IMDb-' + imdbId
  return getLocalStorage(storageKey).then((cache) => {
    const cacheInfo = cache[storageKey]
    if (cacheInfo && cacheInfo.updateAt > Date.now() - 86400000) {
      return cacheInfo
    }

    return fetchImdb(imdbId).then((html) => {
      const version = getVersion(html)
      const rate = getRate(html, { version })

      const imdbInfo = {
        imdbId,
        updateAt: Date.now(),
        ...rate,
      }

      const allget = Object.keys(imdbInfo).every((key) => !!imdbInfo[key])

      if (allget) {
        setLocalStorage(storageKey, imdbInfo)
      }

      return {
        ...imdbInfo,
        MPAA: MPAAList[rate.parentalguide] || {},
      }
    })
  })
}

const fetchImdb = (imdbId) =>
  fetchData('https://www.imdb.com/title/' + imdbId + '/')

const TVMA = {
  'TV-Y': '适合所有儿童观看',
  'TV-Y7': '为了 7 岁以上的幼童设计',
  'TV-G': '大多数的家长会认为此节目适合所有年龄',
  'TV-PG':
    '可能会让部分家长感到不适合8岁以下儿童观看，但大部分内容适合儿童观看',
  'TV-14': '包含家长可能认为不适合年龄低于 14 岁儿童的内容',
  'TV-MA': '为了成年观众制作，可能不适合年龄低于 16 岁的儿童',
}

const MPAAList = Object.assign(
  {
    G: {
      label: 'G 一般观众',
      pop: '所有年龄皆可观赏。电影中不含或仅含少量会让家长在让儿童观赏时感到被冒犯的内容。',
    },
    PG: {
      label: 'PG 建议家长指导',
      pop: '有些内容可能不适合儿童。由于影片包含部分家长可能认为不适合儿童的内容，因此建议家长在可同时进行指导。',
    },
    'PG-13': {
      label: 'PG-13 家长需特别注意',
      pop: '由于影片包含部分家长可能认为不适合13岁以下观看的内容，因此建议家长需特别注意。',
    },
    R: {
      label: 'R 限制级',
      pop: '未满十八岁必须由家长或成年监护人陪同才能入场观看。',
    },
    'NC-17': {
      label: 'NC-17 17岁或以下不得观赏',
      pop: '电影的内容仅适合成人观赏，十七岁及以下的观众不得入场观看。',
    },
  },

  Object.keys(TVMA).reduce((pre, cur) => {
    pre[cur] = { label: cur, pop: TVMA[cur] }
    return pre
  }, {})
)

const getVersion = (html) => (/styleguide-v2/.test(html) ? 'v2' : 'new')

const getRate = (html, { version = 'new' }) => {
  return version === 'v2'
    ? {
        ratingValue: safeMatch(html, /ratingValue.*?>(.+?)<\/span>/),
        ratingCount: safeMatch(html, /ratingCount.*?>(.+?)<\/span>/),
        parentalguide: safeMatch(html, /subtext.*?>\s*?(.*?)\s*?</).trim(),
      }
    : {
        ratingValue: safeMatch(html, /RatingScore.*?>(.+?)<\/span>/),
        ratingCount: safeMatch(html, /RatingAmount.*?>(.+?)<\/div>/),
        parentalguide: safeMatch(html, /parentalguide.*?>(.+?)<\/a/).trim(),
      }
}
