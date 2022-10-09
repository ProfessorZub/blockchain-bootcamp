import React, { Component } from 'react'
import './App.css'
import Navbar from './Navbar'
import Contents from './Content'
import { connect } from 'react-redux'
import { 
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions'
import Token from '../abis/Token.json'
import { 
  contractsLoadedSelector
} from '../store/selectors'

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
    console.log({networkID})
    const token = await loadToken(web3, networkID, dispatch)
    if (!token) {
      window.alert('Token smart contract not detected on the current network. Please select another network with Metamask.')
    }
    const exchange = await loadExchange(web3, networkID, dispatch)
    if (!exchange) {
      window.alert('Exchange smart contract not detected on the current network. Please select another network with Metamask.')
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        { this.props.contractsLoaded ? <Contents /> : <div className="content"></div> }
        
      </div>
    )
  }

}  

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state)
  }
}
export default connect(mapStateToProps)(App)
