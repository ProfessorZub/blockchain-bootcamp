import React, { Component } from 'react'
import { connect } from 'react-redux'
import { exchangeSelector, web3Selector } from  '../store/selectors'
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
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }

  async loadBlockchainData(props){
    const { dispatch, exchange, web3} = props
    await loadAllOrders(web3, exchange, dispatch) 
    await subscribeToEvents(dispatch, exchange)
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
    web3: web3Selector(state)
  }
}

export default connect(mapStateToProps)(Content) // Passing mapStateProps function to connect() subscribes the wrapped component to Redux store updates so that the function gets called whenever the Redux store changes