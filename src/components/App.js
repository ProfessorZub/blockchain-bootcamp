import React, { Component } from 'react'
import './App.css'
import Navbar from './Navbar'
import Contents from './Content'
import { connect } from 'react-redux'
import { loadWeb3,
  loadAccount,
  loadToken,
  loadExchange }
from '../store/interactions'
import Token from '../abis/Token.json'
import { accountSelector } from '../store/selectors'
import { contractsLoadedSelector } from '../store/selectors'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch){
    const web3 = await loadWeb3(dispatch)
    const chainID = await web3.eth.getChainId()
    const networkType = await web3.eth.net.getNetworkType()
    const accounts = await loadAccount(web3,dispatch)
    const abi = Token.abi
    const networks = Token.networks
    const networkID = await web3.eth.net.getId()
    const tokenAddress = Token.networks[networkID].address
    const token = await loadToken(web3, networkID, dispatch)
    const totalSupply = await token.methods.totalSupply().call()
    const exchange = await loadExchange(web3, networkID, dispatch)

    // log({networkType})
    // log({chainID})
    // log({web3})
    // log({accounts})
    // log({Token})
    // log({abi})
    // log({networks})
    // log({networkID})
    // log({tokenAddress})
    // log({token})
    // log({totalSupply})

    // function log(obj) {   
    //   console.log(obj)
    // }   
  }

  render() {
    //D
    console.log(">> " + this.props.account) // This gets loaded twice. Why?
    //_D
    return (
      <div>
        <Navbar />
        <Contents />
      </div>
    )
  }

}  

function mapStateToProps(state) {
  console.log(">>>Contracts loaded? ",contractsLoadedSelector(state))
  return {
    account: accountSelector(state)
  // TODO: Fill me in...
  }
}
export default connect(mapStateToProps)(App)

function log(obj) {   
  console.log(obj)
} 