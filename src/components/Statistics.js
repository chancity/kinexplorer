import React from 'react'

class Statistics extends React.Component {
  render() {
    return (
		<div class="container">
			<div class="row">
				<div class="panel panel-default">
					<div class="panel-body">
						<iframe src="https://grafana.kinexplorer.com/d/m0QvPkEmk/aggregated-stats?orgId=1" width="100%" height="1600px" frameborder="0">
						</iframe>
					</div>
				</div>
			</div>
		</div>
    )
  }
}

export default Statistics
