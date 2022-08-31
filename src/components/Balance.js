import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  loadBalances,
  depositEther,
  withdrawEther,
  depositToken,
  withdrawToken
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
  etherDepositAmountSelector,
  etherWithdrawAmountSelector,
  tokenDepositAmountSelector,
  tokenWithdrawAmountSelector
} from '../store/selectors'
import Spinner from './Spinner'
import {
  etherDepositAmountChanged,
  etherWithdrawAmountChanged,
  tokenDepositAmountChanged,
  tokenWithdrawAmountChanged
} from '../store/actions'

// TODO: Refactor. Bit messy
const showDepositForm = (_token,props) => {
  // Fetch the following from props
  const {dispatch, exchange, web3, etherDepositAmount, tokenDepositAmount, token, account } = props
  let deposit, amountChanged, amount
  // Only two tokens in this project. If it is not ETHER then it has to be our token MAGG 
  if (_token === 'ETH') {
      deposit = (...args) => depositEther(...args)
      amountChanged = (...args) => etherDepositAmountChanged(...args)
      amount = etherDepositAmount
  } else {
      deposit = (...args) => depositToken(...args) 
      amountChanged = (...args) => tokenDepositAmountChanged(...args)
      amount = tokenDepositAmount 
  }

  return(
    <form className="row" onSubmit={(event) => {
      event.preventDefault()
      deposit(dispatch, exchange, web3, amount, token, account)
      console.log("form submitting...")
    }}>
      <div className="col-12 col-sm pr-sm-2">
        <input
          type="text"
          placeholder={`${_token} Amount`}
          onChange={(e) => dispatch(amountChanged(e.target.value))}
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

const showWithdrawForm = (_token,props) => {
  // Fetch the following from props
  const {dispatch, exchange, web3, etherWithdrawAmount, tokenWithdrawAmount, token, account } = props
  let withdraw, amountChanged, amount
  // Only two tokens in this project. If it is not ETHER then it has to be our token MAGG
  if (_token === 'ETH') {
      withdraw = (...args) => withdrawEther(...args)
      amountChanged = (...args) => etherWithdrawAmountChanged(...args)
      amount = etherWithdrawAmount
  } else {
      withdraw = (...args) => withdrawToken(...args) 
      amountChanged = (...args) => tokenWithdrawAmountChanged(...args)
      amount = tokenWithdrawAmount 
  }

  return(
    <form className="row" onSubmit={(event) => {
      event.preventDefault()
      withdraw(dispatch, exchange, web3, amount, token, account)
      console.log("form submitting...")
    }}>
      <div className="col-12 col-sm pr-sm-2">
        <input
          type="text"
          placeholder={`${_token} Amount`}
          onChange={(e) => dispatch(amountChanged(e.target.value))}
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
          <td>{token}</td>
          <td>{token === 'ETH' ? etherBalance : tokenBalance}</td>
          <td>{token === 'ETH' ? exchangeEtherBalance : exchangeTokenBalance}</td>
        </tr>
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
          { showBalance('MAGG',props) }
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
  const balancesLoading = balancesLoadingSelector(state)

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
    showTabs: !balancesLoading,  
    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
  }
}

export default connect(mapStateToProps)(Balance)