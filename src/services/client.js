import axios from 'axios'
import Config from 'react-native-config'
import NodesIp from '../utils/nodeIp'
import { AUTH_ID } from '../../config'

export const ONE_TRX = 1000000

class ClientWallet {
  constructor (opt = null) {
    this.api = Config.MAIN_API_URL
    this.apiTest = Config.API_URL
    this.notifier = Config.NOTIFIER_API_URL
    this.tronwalletApi = Config.TRONWALLET_API
  }

  //* ============TronScan Api============*//

  async getTronscanUrl () {
    const { isTestnet } = await NodesIp.getAllNodesIp()
    return isTestnet ? this.apiTest : this.api
  }

  async getVoteCycle () {
    const apiUrl = await this.getTronscanUrl()
    const { data: {nextCycle} } = await axios.get(`${apiUrl}/vote/next-cycle`)
    return nextCycle
  }
  async getTotalVotes () {
    const apiUrl = await this.getTronscanUrl()
    const { data } = await axios.get(`${apiUrl}/vote/current-cycle`)
    const totalVotes = data.total_votes
    const candidates = data.candidates
      .sort((a, b) => a.votes > b.votes ? -1 : a.votes < b.votes ? 1 : 0)
      .map((candidate, index) => ({ ...candidate, rank: index + 1 }))
    return { totalVotes, candidates }
  }

  async getTransactionDetails (tx) {
    const apiUrl = await this.getTronscanUrl()
    const { data: { transaction } } = await axios.post(
      `${apiUrl}/transaction?dry-run`,
      { transaction: tx }
    )
    return transaction
  }

  async getBalances (address) {
    const apiUrl = await this.getTronscanUrl()
    const { data: { balances } } = await axios.get(
      `${apiUrl}/account/${address}`
    )
    if (balances && balances.length > 1) {
      return balances.sort((a, b) => Number(b.balance) - Number(a.balance))
    }
    return balances
  }

  async getFreeze (address) {
    const apiUrl = await this.getTronscanUrl()
    const { data: { frozen, bandwidth, balances } } = await axios.get(
      `${apiUrl}/account/${address}`
    )
    return { ...frozen, total: frozen.total / ONE_TRX, bandwidth, balances }
  }

  async getTokenList (start, limit, name) {
    const apiUrl = await this.getTronscanUrl()
    const { data: { data } } = await axios.get(
      `${apiUrl}/token?sort=-name&start=${start}&limit=${limit}&name=%25${name}%25&status=ico`
    )
    return data
  }

  async getTransactionList (address) {
    const apiUrl = await this.getTronscanUrl()
    const tx = () =>
      axios.get(
        `${apiUrl}/transaction?sort=-timestamp&limit=50&address=${address}`
      )
    const tf = () =>
      axios.get(
        `${apiUrl}/transfer?sort=-timestamp&limit=50&address=${address}`
      )
    const transactions = await Promise.all([tx(), tf()])
    const txs = transactions[0].data.data.filter(d => d.contractType !== 1)
    const trfs = transactions[1].data.data.map(d => ({
      ...d,
      contractType: 1,
      ownerAddress: address
    }))
    let sortedTxs = [...txs, ...trfs].sort((a, b) => b.timestamp - a.timestamp)
    sortedTxs = sortedTxs.map(transaction => ({
      type: this.getContractType(transaction.contractType),
      ...transaction
    }))
    return sortedTxs
  }

  async fetchTransactionByHash (hash) {
    const apiUrl = await this.getTronscanUrl()

    const txResponse = await axios.get(`${apiUrl}/transaction/${hash}`)

    if (txResponse.data.contractType <= 2) {
      const tfResponse = await axios.get(`${apiUrl}/transfer/${hash}`)
      return {
        ...tfResponse.data,
        contractType: 1,
        ownerAddress: txResponse.data.ownerAddress,
        type: 'Transfer'
      }
    }

    return {
      ...txResponse.data,
      type: this.getContractType(txResponse.data.contractType)
    }
  }

  //* ============TronWalletServerless Api============*//

  async giftUser (address, deviceId) {
    const body = { address, deviceId, authid: AUTH_ID }
    const { data: { result } } = await axios.post(`${this.tronwalletApi}/gift`, body)
    return result
  }

  async getAssetList () {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const { data } = await axios.get(
      `${this.tronwalletApi}/vote/list?node=${nodeIp}`
    )
    return data
  }

  async broadcastTransaction (transactionSigned) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      transactionSigned,
      node: nodeIp
    }
    const { data: { result } } = await axios.post(
      `${this.tronwalletApi}/transaction/broadcast`,
      reqBody
    )
    return result
  }

  async getTransferTransaction ({ to, from, token, amount, data }) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      from,
      to,
      amount,
      token,
      data,
      node: nodeIp
    }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/send`,
      reqBody
    )
    return transaction
  }

  async getFreezeTransaction (address, freezeAmount) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      address,
      freezeAmount,
      freezeDuration: 3,
      node: nodeIp
    }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/freeze`,
      reqBody
    )
    return transaction
  }

  async getUnfreezeTransaction (address, pin) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      address,
      node: nodeIp
    }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/unfreeze`,
      reqBody
    )
    return transaction
  }

  async getParticipateTransaction (address, {
    participateAmount,
    participateToken,
    participateAddress
  }) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      address,
      participateAmount,
      participateToken,
      participateAddress,
      node: nodeIp
    }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/participate`,
      reqBody
    )
    return transaction
  }

  async getVoteWitnessTransaction (address, votes) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      address,
      votes,
      node: nodeIp
    }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/vote`,
      reqBody
    )
    return transaction
  }

  async registerDeviceForNotifications (deviceId, publicKey, removeExtraDeviceIds) {
    return axios.post(`${Config.TRONWALLET_API}/user/put`, { deviceId, publicKey, refresh: removeExtraDeviceIds })
  }

  async notifyNewTransactions (id, transactions) {
    return axios.post(`${Config.TRONWALLET_API}/notify`, { id, transactions })
  }

  async getDevicesFromPublicKey (publicKey) {
    return axios.get(`${Config.TRONWALLET_API}/user/${publicKey}`)
  }

  getContractType = number => {
    switch (number) {
      case 1:
        return 'Transfer'
      case 2:
        return 'Transfer Asset'
      case 4:
        return 'Vote'
      case 6:
        return 'Create'
      case 9:
        return 'Participate'
      case 11:
        return 'Freeze'
      case 12:
        return 'Unfreeze'
      default:
        return 'Unregistred Name'
    }
  }
}

export default new ClientWallet()
