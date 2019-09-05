const ethjsUtil = require('ethereumjs-util')
const { keccak } = ethjsUtil

const container = document.querySelector('#app-container')

const input = document.createElement('input')
container.appendChild(input)

const display = document.createElement('div')
container.appendChild(display)

input.addEventListener('change', (event) => {
  const { value } = event.target
  console.log(value)
  const result = parseValue(value)
  display.innerHTML = result
})

// for debugging
global.ethjsUtil = ethjsUtil
global.parseValue = parseValue


function parseValue (_value) {
  const value = _value.trim()
  const isValidEthAddress = ethjsUtil.isValidAddress(value)
  if (isValidEthAddress) {
    return parseEthereumeAddress(value)
  }
  return 'sorry, could not recognize this value'
}

function parseEthereumeAddress (value) {
  const isMixedCase = value.toLowerCase() !== value
  if (!isMixedCase) {
    return 'ethereum address - no chainId'
  }
  const isValidWithoutChainId = isValidChecksumAddress(value)
  if (isValidWithoutChainId) {
    return 'ethereum address - checksum without network id'
  }
  const validIds = []
  if (isMixedCase) {
    new Array(1000).fill().map((_, chainId) => {
      if (!isValidChecksumAddress(value, chainId)) return
      validIds.push(chainId)
    })
  }
  return `valid on chains ${validIds}`
}

// not included in latest ethereumjs-util
function toChecksumAddress (address, eip1191ChainId) {
  address = ethjsUtil.stripHexPrefix(address).toLowerCase()

  const prefix = eip1191ChainId !== undefined ? eip1191ChainId.toString() + '0x' : ''

  const hash = keccak(prefix + address).toString('hex')
  let ret = '0x'

  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase()
    } else {
      ret += address[i]
    }
  }

  return ret
}

function isValidAddress (address) {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

function isValidChecksumAddress (address, eip1191ChainId) {
  return isValidAddress(address) && toChecksumAddress(address, eip1191ChainId) === address
}