import React, { Component } from 'react'
import { connect } from 'react-redux'

class Trades extends Component {
	render() {
		return (
		    <div className="vertical">
		      <div className="card bg-dark text-white">
		        <div className="card-header">
		          Trades
		        </div>
		        <div className="card-body">
		       	  <table className="table table-dark table-sm small">
		       	  	<thead>
		       	  	  <tr>
		       	  	    <th>Time</th>
		       	  	    <th>MAGG</th>
		       	  	    <th>MAGG/ETH</th>
		       	  	   </tr>
		       	  	   <tr>
		       	  	      <td>Orders</td>
		       	  	      <td>go</td>
		       	  	      <td>here</td>  
		       	  		</tr>
		       	  	</thead>
		       	  </table>
		        </div>
		      </div>        
		    </div>
		)
	}
}

function mapStateToProps(state) {
  return {
	// TODO: Fill me in...
  }
}

export default connect(mapStateToProps)(Trades)