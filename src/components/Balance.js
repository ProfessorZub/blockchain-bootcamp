import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  loadBalances,
  depositEther,
  withdrawEther
  } from '../store/interactions'
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
  balancesLoadingSelector,
  balancesLoadedSelector,
  etherDepositAmountSelector,
  etherWithdrawAmountSelector
} from '../store/selectors'
import Spinner from './Spinner'
import { etherDepositAmountChanged, etherWithdrawAmountChanged } from '../store/actions'

// TODO: Refactor. Bit messy
const showDepositForm = (token,props) => {
  const {dispatch, exchange, web3, etherDepositAmount, account } = props
  let tokenDepositAmountChanged
  let depositToken
  let 
  if (token === 'ETH') {
    tokenDepositAmountChanged = (args) => etherDepositAmountChanged(args)
    depositToken = (args) => depositEther(args)
  } else {
    tokenDepositAmountChanged = (args) => tokenDepositAmountChanged(args)
    depositToken = (args) => depositToken(args)
  }
  return(
    <form className="row" onSubmit={(event) => {
      event.preventDefault()
      depositToken(dispatch, exchange, web3, etherDepositAmount, account)
      console.log("form submitting...")
    }}>
      <div className="col-12 col-sm pr-sm-2">
        <input
          type="text"
          placeholder="ETH Amount"
          onChange={(e) => dispatch(etherDepositAmountChanged(e.target.value))}
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
}

const showWithdrawForm = (props) => {
  const {dispatch, exchange, web3, etherWithdrawAmount, account } = props
  return(
    <form className="row" onSubmit={(event) => {
      event.preventDefault()
      console.log("form submitting...")
      withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account)
    }}>
      <div className="col-12 col-sm pr-sm-2">
        <input
          type="text"
          placeholder="ETH Amount"
          onChange={(e) => dispatch(etherWithdrawAmountChanged(e.target.value))}
          className="form-control form-control-sm bg-dark text-white"
          required />
      </div>
      <div className="col-12 col-sm-auto pl-sm-0">
        <button type="submit" className="btn btn-primary btn-block btn-sn">
          Withdraw
        </button>
      </div>
    </form>
  )
}

const showBalance = (token,props) => {
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
          <td>{token === 'ETH' ? etherBalance : tokenBalance}</td>
          <td>{exchangeEtherBalance}</td>
        </tr>
     {/*   { showDepositForm(props)}*/}
{/*        <tr>
          <td>MAGG</td>
          <td>{tokenBalance}</td>
          <td>{exchangeTokenBalance}</td>
        </tr>*/}
      </tbody> 
    </table>
  )
}

const showTabs = (props) => {

  return(
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
      <Tab eventKey="deposit" title="Deposit" className="bg-dark" >
          { showBalance('ETH',props) }
          { showDepositForm('ETH',props)}
          { showBalance('MAG',props) }
          { showDepositForm('MAGG',props)}
      </Tab>
      <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
          { showBalance('ETH',props) }
          { showWithdrawForm('ETH',props)}
          { showBalance('MAGG',props) }
          { showWithdrawForm('MAGG',props)}
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
  const balancesLoaded = balancesLoadedSelector(state)

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
    balancesLoaded,
    showTabs: !balancesLoading && balancesLoaded, 
    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    balancesLoaded: balancesLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(Balance)