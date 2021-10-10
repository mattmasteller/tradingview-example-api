import * as React from 'react'
import './index.css'
import { widget } from '../../charting_library'

import Datafeed from './api'

function getLanguageFromURL() {
  const regex = new RegExp('[\\?&]lang=([^&#]*)')
  const results = regex.exec(window.location.search)
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, ' '))
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

    tvWidget.onChartReady(() => {
      // total visible range
      let minFrom = undefined
      let maxTo = undefined
      const logTotalVisibleRange = () =>
        console.log('Total visible range', minFrom, maxTo)
      const setMinFromMaxTo = (from, to) => {
        if (!minFrom || from < minFrom) {
          minFrom = from
          logTotalVisibleRange()
        }
        if (!maxTo || to < maxTo) {
          maxTo = to
          logTotalVisibleRange()
        }
      }

      // add alert marker
      // https://github.com/tradingview/charting_library/wiki/Chart-Methods#createmultipointshapepoints-options
      tvWidget
        .activeChart()
        .createMultipointShape([{ time: 1633744800, price: 54156 }], {
          shape: 'arrow_left',
          lock: true,
          disableSelection: true,
          disableSave: true,
          disableUndo: true,
          zOrder: 'top',
          overrides: { color: '#FF0000' },
        })
      // TODO: fetch and add alert markers ()
      tvWidget
        .activeChart()
        .onVisibleRangeChanged()
        .subscribe(null, ({ from, to }) => setMinFromMaxTo(from, to)) // TODO: watch out! events are fast, don't fetch from api too often
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
