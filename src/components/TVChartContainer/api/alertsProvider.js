import axios from 'axios'

const api_root = 'https://min-api.cryptocompare.com'

const mock = (from, to, success, timeout) => {
  console.log(`Fetching alerts ${from} to ${to} (simulated)`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve()
      } else {
        reject({ message: 'Error' })
      }
    }, timeout || 1000)
  })
}

const getAlertsHistory = async (from, to) => {
  console.log('======alertsProvider.getAlertsHistory running')

  let alerts = []

  try {
    await mock(from, to, true, 4000)
  } catch (e) {
    console.log(e.message)
  }

  return {
    from,
    to,
    alerts,
  }
}

export default getAlertsHistory
