import { get as storeGet, set as storeSet } from './store'

const DEFAULTS = [
  '+1',
  'grinning',
  'kissing_heart',
  'heart_eyes',
  'laughing',
  'stuck_out_tongue_winking_eye',
  'sweat_smile',
  'joy',
  'scream',
  'disappointed',
  'unamused',
  'weary',
  'sob',
  'sunglasses',
  'heart',
  'poop',
]

let frequently, initialized
let defaults = {}

function init() {
  initialized = true
  frequently = storeGet('frequently')
}

function add(emoji) {
  if (!initialized) init()
  var { id } = emoji

  frequently || (frequently = defaults)
  frequently[id] || (frequently[id] = 0)
  frequently[id] += 1

  storeSet('last', id)
  storeSet('frequently', frequently)
}

function get(perLine) {
  if (!initialized) init()
  if (!frequently) {
    defaults = {}

    const result = []

    for (let i = 0; i < perLine; i++) {
      defaults[DEFAULTS[i]] = perLine - i
      result.push(DEFAULTS[i])
    }

    return result
  }

  const quantity = perLine * 4
  const frequentlyKeys = []

  for (let key in frequently) {
    if (frequently.hasOwnProperty(key)) {
      frequentlyKeys.push(key)
    }
  }

  const sorted = frequentlyKeys
    .sort((a, b) => frequently[a] - frequently[b])
    .reverse()
  const sliced = sorted.slice(0, quantity)

  const last = storeGet('last')

  if (last && sliced.indexOf(last) == -1) {
    sliced.pop()
    sliced.push(last)
  }

  return sliced
}

export { add, get }
