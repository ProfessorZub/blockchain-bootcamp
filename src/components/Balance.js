import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadBalances } from '../store/interactions'
import { Tab, Tabs } from 'react-bootstrap'
import {
  web3Selector,
  exchangeSelector,
  tokenSelector,
  accountSelector,
  etherBalanceSelector,
  tokenBalanceSelector,
  exchangeEtherBalanceSelector,
  exchangeTokenBalanceSelector,
  balancesLoadingSelector
} from '../store/selectors'
import Spinner from './Spinner'

const showForm = (formType) => {
  return(
    <form className="row" onSubmit={(event) => {
      event.preventDefault()
      console.log("form submitting...")
    }}>
      <div className="col-12 col-sm pr-sm-2">
        <input
          type="text"
          placeholder="ETH Amount"
          onChange={(e) => console.log("amount changed...")}
          className="form-control form-control-sm bg-dark text-white"
          required />
      </div>
      <div className="col-12 col-sm-auto pl-sm-0">
        <button type="submit" className="btn btn-primary btn-block btn-sn">
          Deposit
        </button>
      </div>
    </form>
  )



  // switch (formType) {
  //   case 'deposit':
  //     console.log("deposit request")
  //   case 'withdraw':
  //     console.log("withdraw request")
  //   default:
  //     console.log('WRONGGGG')
  // }
}

const showBalances = (props) => {
    const {
    etherBalance,
    tokenBalance,
    exchangeEtherBalance,
    exchangeTokenBalance,
  } = props
  return (
    <table className="table table-dark table-sm small">
      <thead>
        <tr>
          <th>Token</th>
          <th>Wallet</th>
          <th>Exchange</th>
        </tr>
      </thead> 
      <tbody>
        <tr>
          <td>ETH</td>
          <td>{etherBalance}</td>
          <td>{exchangeEtherBalance}</td>
        </tr>
        <tr>
          <td>MAGG</td>
          <td>{tokenBalance}</td>
          <td>{exchangeTokenBalance}</td>
        </tr>
      </tbody> 
    </table>
  )
}

const showTabs = (props) => {

  return(
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
      <Tab eventKey="deposit" title="Deposit" className="bg-dark" >
          { showBalances(props) }
          { showForm('deposit')}
      </Tab>
      <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
          { showBalances(props) }
          { showForm('withdraw')}
      </Tab> 
    </Tabs>
  )
}

class Balance extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const { dispatch, web3, exchange, token, account } = this.props
    await loadBalances(dispatch, web3, exchange, token, account)
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
            Balance
        </div>
        <div className="card-body">
          { this.props.showTabs ? showTabs(this.props) : <Spinner />}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  // console.log({
  //   web3: web3Selector(state),
  //   exchange: exchangeSelector(state),
  //   token: tokenSelector(state),
  //   account: accountSelector(state),
  //   etherBalance: etherBalanceSelector(state),
  //   tokenBalance: tokenBalanceSelector(state),
  //   exchangeEtherBalance: exchangeEtherBalanceSelector(state),
  //   exchangeTokenBalance: exchangeTokenBalanceSelector(state),
  //   balancesLoading: balancesLoadingSelector(state)
  // })
  const balancesLoading = balancesLoadingSelector(state)

  // TODO: balances UI needs to be updated once the order filling goes through. Right now, balances don't change until manually refresh
  // BUG: and balances do not update at all when filling a sell order from the order book (i.e. buying) 
  return {
    web3: web3Selector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state),
    etherBalance: etherBalanceSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    balancesLoading,
    showTabs: !balancesLoading 
  }
}

export default connect(mapStateToProps)(Balance)