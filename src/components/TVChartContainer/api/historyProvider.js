import axios from 'axios'

const api_root = 'https://min-api.cryptocompare.com'

const getBarsHistory = async (
  symbolInfo,
  resolution,
  from,
  to,
  first,
  limit
) => {
  let history = {}

  console.log('======historyProvider.getBarsHistory running')

  console.log('symbolInfo', symbolInfo)
  console.log('to', to)

  var split_symbol = symbolInfo.name.split(/[:/]/)
  const url =
    resolution === 'D'
      ? '/data/histoday'
      : resolution >= 60
      ? '/data/histohour'
      : '/data/histominute'
  const params = new URLSearchParams([
    ['e', split_symbol[0]], // exchange
    ['fsym', split_symbol[1]], // base currency
    ['tsym', split_symbol[2]], // quote currency
    ['toTs', to ? +to : ''],
    ['limit', limit ? limit : 2000],
    // aggregate: 1 //resolution
  ])
  console.log('url', url)
  console.log('params', params)

  const response = await axios.get(`${api_root}${url}`, { params })
  console.log('response.data', response.data)

  const { Data: data, TimeFrom: timeFrom, TimeTo: timeTo } = response.data

  console.log('data', data)

  if (data.length) {
    console.log(
      `Actually returned: ${new Date(
        timeFrom * 1000
      ).toISOString()} - ${new Date(timeTo * 1000).toISOString()}`
    )

    const bars = data.map((el) => {
      return {
        time: el.time * 1000, // TradingView requires bar time in ms
        low: el.low,
        high: el.high,
        open: el.open,
        close: el.close,
        volume: el.volumefrom,
      }
    })

    if (first) {
      const lastBar = bars[bars.length - 1]
      history[symbolInfo.name] = { lastBar }
		}
		return bars
  }

  return []
}

export default getBarsHistory
