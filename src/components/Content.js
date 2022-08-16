import React, { Component } from 'react'
import { connect } from 'react-redux'
import { exchangeSelector, connectionSelector } from  '../store/selectors'
import { loadAllOrders } from '../store/interactions'
import OrderBook from './OrderBook'
import Trades from './Trades'
import MyTransactions from './MyTransactions'

class Content extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch){
    await loadAllOrders(this.props.connection, this.props.exchange, dispatch) 
  }

  render() {
    return(
      <div className="content">
        <div className="vertical-split">
          <div className="card bg-dark text-white">
            <div className="card-header">
                Card Title - Vertical Split 1-1
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
          <div className="card bg-dark text-white">
            <div className="card-header">
                Card Title - Vertical Split 1-2
            </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
          </div>
        </div>
        <OrderBook />
        <div className="vertical-split">
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title - Vertical Split 3-1
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
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
    connection: connectionSelector(state)
  }
}

export default connect(mapStateToProps)(Content) // Passing mapStateProps function to connect() subscribes the wrapped component to Redux store updates so that the function gets called whenever the Redux store changes