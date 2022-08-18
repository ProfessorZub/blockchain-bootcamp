import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'
import Spinner from './Spinner'
import { chartOptions, dummyData} from './PriceChart.config'
import {
	priceChartLoadedSelector,
	priceChartSelector
} from '../store/selectors'

const showPriceChart = (priceChart) => {
	return(
		<div className="price-chart">
			<div className="price">
				<h4>MAGG/ETH &nbsp; {priceChart.lastPrice}</h4>
			</div>
			<Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%'/>
		</div>
	)
}

class PriceChart extends Component {
	render() {
		return (
	    <div className="card bg-dark text-white">
	      <div className="card-header">
	        Price Chart
	      </div>
	      <div className="card-body">
	      	{this.props.priceChartLoadedSelector ? showPriceChart(this.props.priceChartSelector) : <Spinner />}
	      </div>
	    </div>			
		)
	}
}

function mapStateToProps(state) {
	console.log({
		priceChartLoadedSelector: priceChartLoadedSelector(state),
		priceChartSelector: priceChartSelector(state)
	})

  return {
		priceChartLoadedSelector: priceChartLoadedSelector(state),
		priceChartSelector: priceChartSelector(state)
  }
}

export default connect(mapStateToProps)(PriceChart)