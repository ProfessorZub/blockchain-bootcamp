import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip} from 'react-bootstrap'
import Spinner from './Spinner'
import {
	orderBookSelector,
	orderBookLoadedSelector
} from '../store/selectors'

const renderOrder = (order) => {
	return(
    <OverlayTrigger
      key={order.id}
      placement='top'
      overlay={
        <Tooltip id={order.id}>
          {`Click here to ${order.orderFillAction}`}
        </Tooltip>
      }
    >
			<tr key={order.id}>
				<td>{order.tokenAmount}</td>
				<td className={`text-${order.orderTypeClass}`}> { order.tokenPrice } </td>
				<td>{ order.etherAmount }</td>
			</tr>
		</OverlayTrigger>
	)
}

const showOrderBook = (props) => {
	const { orderBook } = props  // E6 syntax to create a variable called 'oderBook' from the poperty called 'orderBook' of props

	return(
		<tbody>
			{ orderBook.sellOrders.map((order) => renderOrder(order))}
				<tr>
					<th>MAGG</th>
					<th>MAGG/ETH</th>
					<th>ETH</th>
				</tr> 
			{ orderBook.buyOrders.map((order) => renderOrder(order))}
		</tbody>
	)
}

class OrderBook extends Component {
	render() {
		return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body order-book">
          	<table className="table table-dark table-sm small">
          	 { this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type='table' />}
          	</table>
          </div>
        </div>        
      </div>
		)
	}
}

function mapStateToProps(state) {
	const orderBook = orderBookSelector(state)
	console.log({orderBook})
  return { // keep the order of the following statements to make sure the orderBook is built before trying to show it
		orderBook: orderBookSelector(state),
		showOrderBook: orderBookLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(OrderBook)