import React from "react";
import QrCode from "qrcode-reader";
import Dropzone from 'react-dropzone-component';
import {injectIntl} from "react-intl";

class QrcodeRestore extends React.Component {
	constructor(props) {
		super(props);
		this.eventHandlers = {
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
			this.changeState(value.result);

		}
	}
	handleImageUpload(file) {
		var qr = new QrCode();
		qr.callback = this.qrCallback;
		qr.changeState = this.props.qrCodeUploaded;
		var reader = new FileReader();

		reader.addEventListener('load', function() {
			qr.decode(this.result);
		}.bind(reader), false);

		reader.readAsDataURL(file);
	}


	render() {

		return (
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

		)
	}
}

export default injectIntl(QrcodeRestore)