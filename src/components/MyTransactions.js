import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tabs from 'react-bootstrap/Tabs'
import Tab  from 'react-bootstrap/Tab'
import Spinner from './Spinner'
import {
	myFilledOrdersLoadedSelector,
	myFilledOrdersSelector,
	myOpenOrdersLoadedSelector,
	myOpenOrdersSelector
} from '../store/selectors'

const showMyFilledOrders = (myFilledOrders) => {
	return(
		<tbody>
			{ myFilledOrders.map(order => {
				return(
					<tr key={order.id}>
						<td className="text-muted">{ order.formattedTimeStamp }</td>
						<td className={`text-${order.orderTypeClass}`}>{ order.orderSign }{ order.tokenAmount }</td>
						<td className={`text-${order.orderTypeClass}`}>{ order.tokenPrice }</td>
					</tr>
				)})
			}
		</tbody>
	)
}

const showMyOpenOrders = (myOpenOrders) => {
	return(
		<tbody>
			{ myOpenOrders.map(order => {
				return(
					<tr key={order.id}>
						<td className={`text-${order.orderTypeClass}`}>{ order.tokenAmount }</td>
						<td className={`text-${order.orderTypeClass}`}>{ order.tokenPrice }</td>
						<td className="text-muted">x</td>
					</tr>
				)})
			}
		</tbody>
	)
}

class MyTransactions extends Component {
	render() {
		// TODO: Research defaultActiveKey and eventKey in html props. Gregory had them in template but I will only add them when I know why
		return(
          <div className="card bg-dark text-white">
	            <div className="card-header">
	              My Transactions
	            </div>
	            <div className="card-body">
	            	<Tabs defaultActiveKey="trades"  className="bg-dark text-white">
	            		<Tab eventKey="trades" title="Trades">
	            			<table className="table table-dark table-sm small">
	            				<thead>
	            					<tr>
	            						<th>Time</th>
	            						<th>MAGG</th>
	            						<th>MAGG/ETH</th>
	            					</tr>
	            					<tr></tr>
	            				</thead>
	            				{showMyFilledOrders ? showMyFilledOrders(this.props.myFilledOrders) : <Spinner /> }
	            			</table>
	            		</Tab>
	            		<Tab eventKey="orders" title="Orders">
	            			<table className="table table-dark table-sm small">
	            				<thead>
	            					<tr>
	            						<th>Amount</th>
	            						<th>MAGG/ETH</th>
	            						<th>Cancel</th>
	            					</tr>
	            				</thead>
	            				{showMyOpenOrders ? showMyOpenOrders(this.props.myOpenOrders) : <Spinner /> }
	            			</table>
	            		</Tab>
	            	</Tabs>
	            </div>
          </div>  
		)
	}
}

function mapStateToProps(state) {
	return{
		myFilledOrders: myFilledOrdersSelector(state),
		showMyFilledOrders: myFilledOrdersLoadedSelector(state),
		myOpenOrders: myOpenOrdersSelector(state),
		showMyOpenOrders: myOpenOrdersLoadedSelector(state)
	}
}

export default connect(mapStateToProps)(MyTransactions)
 