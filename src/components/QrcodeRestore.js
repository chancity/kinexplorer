import React from "react";
import QrCode from "qrcode-reader";
import { Redirect } from 'react-router-dom'
import Dropzone from 'react-dropzone-component';
import {storageInit} from "../lib/utils";
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Panel from 'react-bootstrap/lib/Panel'
import Row from 'react-bootstrap/lib/Row'
import {withServer} from "./shared/HOCs";
import {injectIntl} from "react-intl";

const storage = storageInit()

class QrcodeRestore extends React.Component {
	renderRedirect = () => {
		if (this.state.redirect) {
			return <Redirect to='/my_account' />
		}
	}

	constructor(props) {
		super(props);
		this.eventHandlers = {
			//addedfile: (file) => {
			//	console.log(file)
			//	this.onImageDrop(file)
			//},
			complete: (file) => {
				console.log(file)
 				this.onImageDrop(file)
			}
		}
		this.componentConfig = {
			postUrl: 'no-url',
			iconFiletypes: ['.jpg', '.png', '.gif'],
			showFiletypeIcon: true,
		};


		this.djsConfig = {autoProcessQueue: true}

		this.state = {
			uploadedFile: null,
			redirect: false
		};


	}

	setRedirect = () => {
		this.setState({
			redirect: true
		})
	}

	onImageDrop(file) {
		this.setState({
			uploadedFile: file,
			redirect: false
		});

		this.handleImageUpload(file);
	}

	qrCallback(err, value) {
		if (err) {
			console.error(err);
			// TODO handle error
		}
		else {
			console.log(value.result);
			storage.setItem('accountKeyStore', value.result);
			this.changeState();

		}
	}
	handleImageUpload(file) {
		var qr = new QrCode();
		qr.callback = this.qrCallback;
		qr.changeState = this.setRedirect;
		var reader = new FileReader();

		reader.addEventListener('load', function() {
			qr.decode(this.result);
		}.bind(reader), false);

		reader.readAsDataURL(file);
	}


	render() {

		return (
			<Grid>
				{this.renderRedirect()}
				<Row>
					<Panel header={"Upload QR Code"}>
						<Grid style={{paddingLeft: 0}}>
							<Row>
								<Col md={10}>
									<form>
										<div className="FileUpload">
											<Dropzone
												config={this.componentConfig}
												eventHandlers={this.eventHandlers}
												djsConfig={this.djsConfig}>
											</Dropzone>
										</div>

										<div>
											{this.state.uploadedFile === null ? null :
												<div>
													<p>{this.state.uploadedFile.name}</p>
													<img src={"'" + this.state.uploadedFile + "'"}/>
												</div>}
										</div>
									</form>
								</Col>
							</Row>
						</Grid>
					</Panel>
				</Row>
			</Grid>
		)
	}
}

export default injectIntl(QrcodeRestore)