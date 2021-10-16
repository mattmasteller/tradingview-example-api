import * as React from 'react'
import './index.css'
import { widget } from '../../charting_library'

import Datafeed from './api'
import getAlertsHistory from './api/alertsProvider'

const PAUSE_BEFORE_FETCHING_ALERTS = 1000

let isFetchingAlerts = false

// total visible range
let visibleRange = {
  minFrom: undefined,
  maxTo: undefined,
  fetchedFrom: undefined,
  fetchedTo: undefined,
}

const pause = (timeout = 1000) => {
  console.log(`Pausing ${timeout / 1000} seconds to let more events fire...`)
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), timeout)
  })
}

const fetchAlerts = async () => {
  // Skip if already fetching
  if (isFetchingAlerts) return

  isFetchingAlerts = true

  console.log('visibleRange', visibleRange)

  // Pause before fetching, to allow more events to fire
  await pause(PAUSE_BEFORE_FETCHING_ALERTS)

  while (visibleRange.minFrom !== visibleRange.fetchedFrom) {
    const from = visibleRange.minFrom
    const to = visibleRange.fetchedFrom
      ? visibleRange.fetchedFrom
      : visibleRange.maxTo

    const results = await getAlertsHistory(from, to)

    visibleRange.fetchedFrom = results.from
    visibleRange.fetchedTo = results.to
    isFetchingAlerts = false

    console.log(
      `Fetched ${results.alerts.length} alerts from ${results.from} to ${results.to}`
    )
    console.log(
      `fetchedFrom: ${visibleRange.fetchedFrom} to ${visibleRange.fetchedTo}`
    )
  }

  console.log('visibleRange', visibleRange)
}

const setVisibleRange = (from, to) => {
  const { minFrom, maxTo } = visibleRange

  // Initialize
  if (!minFrom && !maxTo) {
    console.log(`Initialize minFrom ${visibleRange.minFrom} -> ${from}`)
    visibleRange.minFrom = from
    console.log(`Initialize maxTo ${visibleRange.maxTo} -> ${to}`)
    visibleRange.maxTo = to

    // Fetch alerts
    fetchAlerts()

    return
  }

  if (from < minFrom) {
    console.log(`Update minFrom ${visibleRange.minFrom} -> ${from}`)
    visibleRange.minFrom = from

    // Fetch alerts
    fetchAlerts()
  }
}

export class TVChartContainer extends React.PureComponent {
  static defaultProps = {
    symbol: 'BINANCE:BTC/USDT',
    interval: '60',
    containerId: 'tv_chart_container',
    datafeedUrl: 'https://demo_feed.tradingview.com',
    libraryPath: '/charting_library/',
    chartsStorageUrl: 'https://saveload.tradingview.com',
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
    theme: 'Dark',
  }

  tvWidget = null

  componentDidMount() {
    // https://github.com/tradingview/charting_library/wiki/Widget-Constructor
    const widgetOptions = {
      symbol: this.props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      // datafeed: new window.Datafeeds.UDFCompatibleDatafeed(this.props.datafeedUrl),
      datafeed: Datafeed,
      interval: this.props.interval,
      container_id: this.props.containerId,
      library_path: this.props.libraryPath,

      // locale: getLanguageFromURL() || 'en',
      // disabled_features: ['use_localstorage_for_settings'],
      // enabled_features: ['study_templates'],
      // charts_storage_url: this.props.chartsStorageUrl,
      // charts_storage_api_version: this.props.chartsStorageApiVersion,
      // client_id: this.props.clientId,
      // user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      // studies_overrides: this.props.studiesOverrides,

      compare_symbols: null,
      theme: this.props.theme,

      // https://github.com/tradingview/charting_library/wiki/Featuresets
      disabled_features: [
        // 'header_widget',
        'header_symbol_search',
        'symbol_search_hot_key',
        'header_resolutions',
        'header_chart_type',
        'header_settings',
        'header_indicators',
        'header_compare',
        'header_undo_redo',
        // 'header_screenshot',
        // 'header_fullscreen_button',

        // Toolbars
        'left_toolbar',
        'right_toolbar',
        'timeframes_toolbar',

        'chart_crosshair_menu',
        'show_chart_property_page',
        'go_to_date',

        'use_localstorage_for_settings',
      ],
      // enabled_features: ['study_templates'],
    }

    const tvWidget = new widget(widgetOptions)
    this.tvWidget = tvWidget

    const bearishShape = {
      shape: 'icon',
      // icon: 0xf060, // left arrow
      // icon: 0xf104, // left chevron
      // icon: 0xf0d7, // down triangle
      // icon: 0xf0d8, // up triangle
      icon: 0xf01a, // circled down triangle
      lock: true,
      zOrder: 'top',
      overrides: { color: 'red', size: 20 },
      disableSelection: true,
      disableSave: true,
      disableUndo: true,
    }

    const bullishShape = {
      shape: 'icon',
      // icon: 0xf060, // left arrow
      // icon: 0xf104, // left chevron
      // icon: 0xf0d8, // up triangle
      icon: 0xf01b, // circled up triangle
      lock: true,
      zOrder: 'top',
      overrides: { color: 'green', size: 20 },
      disableSelection: true,
      disableSave: true,
      disableUndo: true,
    }

    tvWidget.onChartReady(() => {
      // add alert marker (TEST)
      // https://github.com/tradingview/charting_library/wiki/Chart-Methods#createmultipointshapepoints-options

      // Bearish Shape
      tvWidget
        .activeChart()
        .createMultipointShape(
          [{ time: 1634328000, price: 62900 }],
          bearishShape
        )

      // Bullish Shape
      tvWidget
        .activeChart()
        .createMultipointShape(
          [{ time: 1634331600, price: 61000 }],
          bullishShape
        )

      // TODO: fetch and add alert markers ()
      tvWidget
        .activeChart()
        .onVisibleRangeChanged()
        .subscribe(null, ({ from, to }) => setVisibleRange(from, to)) // TODO: watch out! events are fast, don't fetch from api too often
      // add debug button
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton()
        button.setAttribute('title', 'Click to show a notification popup')
        button.classList.add('apply-common-tooltip')
        button.addEventListener('click', () =>
          tvWidget.showNoticeDialog({
            title: 'Notification',
            body: 'TradingView Charting Library API works correctly',
            callback: () => {
              console.log('Noticed!')
            },
          })
        )

        button.innerHTML = 'Check API'
      })
    })
  }

  componentWillUnmount() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove()
      this.tvWidget = null
    }
  }

  render() {
    return <div id={this.props.containerId} className={'TVChartContainer'} />
  }
}
