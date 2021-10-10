import getBarsHistory from './historyProvider'

const supportedResolutions = ['15', '30', '60', 'D']

const config = {
  supported_resolutions: supportedResolutions,
}

export default {
  /* mandatory methods for realtime chart */
  onReady: (cb) => {
    console.log('=====onReady running')
    setTimeout(() => cb(), 0) // pass the datafeed config options into the onReady cb function
  },
  resolveSymbol: (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    // expects a symbolInfo object in response
    console.log('======resolveSymbol running')

    console.log('resolveSymbol:', { symbolName })
    // https://github.com/tradingview/charting_library/wiki/Symbology
    var symbol_stub = {
      name: symbolName,
      description: '',
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      ticker: symbolName,
      // exchange: 'Binance',
      minmov: 1,
      pricescale: 100000000,
      has_intraday: true,
      intraday_multipliers: ['1', '60'],
      // supported_resolution: supportedResolutions,
      volume_precision: 8,
      data_status: 'streaming',
    }

    symbol_stub.pricescale = 100

    setTimeout(function () {
      onSymbolResolvedCallback(symbol_stub)
      console.log('Resolving that symbol....', symbol_stub)
    }, 0)

    // onResolveErrorCallback('Not feeling it today')
  },
  getBars: async (
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) => {
    console.log('=====getBars running')
    console.log('function args', arguments)
    // console.log(`Requesting bars between ${new Date(from * 1000).toISOString()} and ${new Date(to * 1000).toISOString()}`)

    const { from, to, firstDataRequest } = periodParams

    const bars = await getBarsHistory(
      symbolInfo,
      resolution,
      from,
      to,
      firstDataRequest
    )

    console.log('bars', bars)

    if (bars.length) {
      onHistoryCallback(bars, { noData: false })
    } else {
      ;[]
    }
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback
  ) => {},
  unsubscribeBars: (subscriberUID) => {},

  /* optional methods */
  getServerTime: (cb) => {},
  calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {},
  getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {},
  getTimeScaleMarks: (
    symbolInfo,
    startDate,
    endDate,
    onDataCallback,
    resolution
  ) => {},
  // only need searchSymbols when search is enabled
  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {},
}
