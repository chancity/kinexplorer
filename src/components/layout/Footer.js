import React from 'react'
import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import LumensRates from '../shared/LumensRates'

class Footer extends React.PureComponent {
	render() {
		return (
			<Grid id="footer">
				<Row>
					<Col md={3}>
						<LumensRates />
					</Col>
					<Col mdOffset={7} md={2}>
						<a href="https://kinecosystem.org/">
							<img
								src={`${process.env.PUBLIC_URL}/kin.ico`}
								alt="kin"
								height={20}
								width={20}
							/>
							kinecosystem.org
						</a>
					</Col>
				</Row>
			</Grid>
		)
	}
}

export default Footer
