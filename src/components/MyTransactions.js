import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'

class MyTransactions extends Component {
	render() {
		return(
          <div className="card bg-dark text-white">
            <div className="card-header">
              My Transactions
            </div>
            <div className="card-body">
              <p className="card-text">I exist in my own component now</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>  
		)
	}
}

function mapStateToProps(state) {
	return{
		// TODO
	}
}

export default connect(mapStateToProps)(MyTransactions)
 