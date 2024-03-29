import React, { Component } from 'react'
import { connect } from 'react-redux'
import { exchangeSelector, web3Selector, tokenSelector, accountSelector } from  '../store/selectors'
import { 
  loadAllOrders,
  subscribeToEvents
 } from '../store/interactions'
import OrderBook from './OrderBook'
import Trades from './Trades'
import MyTransactions from './MyTransactions'
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'

class Content extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props)
  }

  async loadBlockchainData(props){
    const { dispatch, exchange, web3, token, account} = props
    await loadAllOrders(web3, exchange, dispatch) 
    await subscribeToEvents(dispatch, web3, exchange, token, account)
  }

  render() {
    return(
      <div className="content">
        <div className="vertical-split">
          <Balance />
          <NewOrder />
        </div>
        <OrderBook />
        <div className="vertical-split">
          <PriceChart />
          <MyTransactions />
        </div>
        <Trades />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state),
    web3: web3Selector(state),
    token: tokenSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(Content)