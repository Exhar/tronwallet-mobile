import axios from 'axios'
import Config from 'react-native-config'
import NodesIp from '../utils/nodeIp'

import { getUserSecrets } from '../utils/secretsUtils'
export const ONE_TRX = 1000000

class ClientWallet {
  constructor (opt = null) {
    this.api = Config.MAIN_API_URL
    this.apiTest = Config.API_URL
    this.notifier = Config.NOTIFIER_API_URL
    this.tronwalletApi = Config.TRON_WALLET_API_URL
  }

  //* ============TronScan Api============*//

  async getTronscanUrl () {
    const { isTestnet } = await NodesIp.getAllNodesIp()
    return isTestnet ? this.apiTest : this.api
  }

  async getTotalVotes () {
    try {
      const apiUrl = await this.getTronscanUrl()
      const { data } = await axios.get(`${apiUrl}/vote/current-cycle`)
      const totalVotes = data.total_votes
      const candidates = data.candidates
        .sort((a, b) => a.votes > b.votes ? -1 : a.votes < b.votes ? 1 : 0)
        .map((candidate, index) => ({...candidate, rank: index + 1}))
      return { totalVotes, candidates }
    } catch (error) {
      console.warn(error)
    }
  }

  async getTransactionDetails (tx) {
    try {
      const apiUrl = await this.getTronscanUrl()
      const { data: { transaction } } = await axios.post(
        `${apiUrl}/transaction?dry-run`,
        {
          transaction: tx
        }
      )
      return transaction
    } catch (error) {
      throw new Error(error.message || error)
    }
  }

  async getBalances (pin) {
    try {
      const apiUrl = await this.getTronscanUrl()
      const { address } = await getUserSecrets(pin)
      const { data: { balances } } = await axios.get(
        `${apiUrl}/account/${address}`
      )
      const sortedBalances = balances.sort(
        (a, b) => Number(b.balance) - Number(a.balance)
      )
      return sortedBalances
    } catch (error) {
      throw error
    }
  }

  async getFreeze (pin) {
    try {
      const apiUrl = await this.getTronscanUrl()
      const { address } = await getUserSecrets(pin)
      const { data: { frozen, bandwidth, balances } } = await axios.get(
        `${apiUrl}/account/${address}`
      )
      return { ...frozen, total: frozen.total / ONE_TRX, bandwidth, balances }
    } catch (error) {
      throw error
    }
  }

  async getUserVotes (pin) {
    try {
      const apiUrl = await this.getTronscanUrl()
      const { address } = await getUserSecrets(pin)
      const { data: { votes } } = await axios.get(
        `${apiUrl}/account/${address}/votes`
      )
      return votes
    } catch (error) {
      throw error
    }
  }

  async getTokenList () {
    try {
      const apiUrl = await this.getTronscanUrl()
      const { data: { data } } = await axios.get(
        `${apiUrl}/token?sort=-name&start=0&status=ico`
      )
      return data
    } catch (error) {
      throw new Error(error.message || error)
    }
  }

  async getTransactionList (pin) {
    const apiUrl = await this.getTronscanUrl()
    const { address } = await getUserSecrets(pin)
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

  //* ============TronWalletServerless Api============*//

  // async giftUser (pin) {
  //   try {
  //     const {
  //       signInUserSession,
  //       username
  //     } = await Auth.currentAuthenticatedUser()
  //     const authToken = signInUserSession.idToken.jwtToken
  //     const { address } = await getUserSecrets(pin)

  //     const config = {
  //       headers: {
  //         Authorization: authToken
  //       }
  //     }
  //     const body = {
  //       address,
  //       username
  //     }

  //     const { data: { result } } = await axios.post(
  //       `${this.tronwalletApi}/gift`,
  //       body,
  //       config
  //     )
  //     return result
  //   } catch (error) {
  //     throw error
  //   }
  // }

  async getAssetList () {
    try {
      const { nodeIp } = await NodesIp.getAllNodesIp()
      const { data } = await axios.get(
        `${this.tronwalletApi}/vote/list?node=${nodeIp}`
      )
      return data
    } catch (error) {
      throw new Error(error.message || error)
    }
  }

  async broadcastTransaction (transactionSigned) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      transactionSigned,
      node: nodeIp
    }
    try {
      const { data: { result } } = await axios.post(
        `${this.tronwalletApi}/transaction/broadcast`,
        reqBody
      )
      return result
    } catch (err) {
      const { data: { error } } = err.response
      throw new Error(error)
    }
  }

  async getTransferTransaction ({ to, from, token, amount }) {
    try {
      const { nodeIp } = await NodesIp.getAllNodesIp()
      const reqBody = {
        from,
        to,
        amount,
        token,
        node: nodeIp
      }
      const { data: { transaction } } = await axios.post(
        `${this.tronwalletApi}/unsigned/send`,
        reqBody
      )
      return transaction
    } catch (error) {
      console.warn(error.response)
      throw new Error(error.message || error)
    }
  }

  async getFreezeTransaction (pin, freezeAmount) {
    try {
      const { address } = await getUserSecrets(pin)
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
    } catch (error) {
      console.warn(error.response)
      throw new Error(error.message || error)
    }
  }

  async getUnfreezeTransaction (pin) {
    try {
      const { address } = await getUserSecrets(pin)
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
    } catch (error) {
      throw new Error(error.message || error)
    }
  }

  async getParticipateTransaction (pin, {
    participateAmount,
    participateToken,
    participateAddress
  }) {
    try {
      const { address } = await getUserSecrets(pin)
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
    } catch (error) {
      console.warn(error)
      console.warn(error.response)
      throw new Error(error.message || error)
    }
  }

  async getVoteWitnessTransaction (pin, votes) {
    try {
      const { address } = await getUserSecrets(pin)
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
    } catch (error) {
      console.warn(error.response)
      throw new Error(error.message || error)
    }
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
