import React from "react";
import QrCode from "qrcode-reader";
import QrCodeCreator from "qrcode";
import {injectIntl} from "react-intl";
import {storageInit, getNewKeyPair} from "../lib/utils";
import { Redirect } from 'react-router-dom'
import Button from "react-bootstrap/es/Button";
import { saveAs } from 'file-saver';

const storage = storageInit()

class QrcodeRestore extends React.Component {
	renderRedirect = () => {
		if (this.state.redirect) {
			return <Redirect to='/my_account' />
		}
	}
	state = {};

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
			redirect: false,
			createAccountClicked:false,
			importAccountClicked:false,
			password:'',
			confirmPassword:'',
			accountJsonSet:false,
			headerText: 'add account'
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
			storage.setItem('accountKeyStore', value.result);
			if(this.changeState) this.changeState(value.result);

		}
	}
	onChangeFile(event) {
		event.stopPropagation();
		event.preventDefault();
		if(!event.target.files.length){
			this.setState({
				createAccountClicked: false,
				importAccountClicked: false
			});
		}
		else {
			let file = event.target.files[0];
			this.handleImageUpload(file); /// if you want to upload latter
		}
	}
	handleImageUpload(file) {
		let qr = new QrCode();
		qr.callback = this.qrCallback;
		qr.changeState = this.props.qrCodeUploaded;
		let reader = new FileReader();

		reader.addEventListener('load', function() {
			qr.decode(this.result);
			let myCanvas = document.getElementById('accountImg');
			let ctx = myCanvas.getContext('2d');
			let img = new Image;
			img.onload = function(){
				myCanvas.height = img.height;
				myCanvas.width = img.width;
				ctx.drawImage(img, 0, 0, img.width,    img.height,     // source rectangle
					0, 0, img.width, img.height); // destination rectangle
				myCanvas.style.display = 'inline'
				myCanvas.toBlob(function(blob) {
					saveAs(blob, "backup.png");
				});

			};
			img.src = this.result;
		}.bind(reader), false);

		reader.readAsDataURL(file);
	}
	setImg = (dataUrl) =>{
		//var key = JSON.parse(storage.getItem('accountKeyStore'));
		//this.setState({headerText: key.pkey});
		let myCanvas = document.getElementById('accountImg');
		let ctx = myCanvas.getContext('2d');
		let img = new Image;
		img.onload = function(){
			myCanvas.height = img.height;
			myCanvas.width = img.width;
			ctx.drawImage(img, 0, 0, img.width,    img.height,     // source rectangle
				0, 0, img.width, img.height); // destination rectangle
			myCanvas.style.display = 'inline'
			myCanvas.toBlob(function(blob) {
				saveAs(blob, "backup.png");
			});

		};
		img.src = dataUrl;

	}
	createNewWallet = () => {
		this.setState({
			createAccountClicked: false,
			importAccountClicked: true
		});
		let encryptedKp = getNewKeyPair(this.state.password);
		let jsonValue = JSON.stringify(encryptedKp);
		storage.setItem('accountKeyStore', jsonValue);
		QrCodeCreator.toDataURL(jsonValue)
		.then(url => {
			this.setImg(url);
		})
		.catch(err => {
			console.error(err)
		})
	}
	handleCreateNewWallet = () => {
		this.setState({
			importAccountClicked: false,
			createAccountClicked: true
		})
	}
	handleImportWallet = () => {
		this.refs.fileUploader.click();
		this.setState({
			createAccountClicked: false,
			importAccountClicked: true
		});
	}
	handleChange = (event) => {
		event.preventDefault()
		this.setState({
			[event.target.name]: event.target.value,
		});
	}
	handleOk = () => {
		if(this.props && this.props.qrCodeUploaded)
		{
			this.props.qrCodeUploaded(storage.getItem('accountKeyStore'));
		}
		else{
			this.setRedirect();
		}


	}
	render() {
		const widthStyle ={
			width: '100%'
		}

		let body;
		if(this.state.importAccountClicked){
			body = 	<canvas id="accountImg" style={{width:'276px', height:'276px', display:'none'}}></canvas>
		}
		else if(this.state.createAccountClicked){
			body = 	<div className="container-fluid"><div id="password"><label>Password:</label>
					<input
						style={widthStyle}
						value={this.password}
						name="password"
						onChange={this.handleChange}
						type="password"
					/>
				</div>
				<div id="confirmPassword"><label>Confirm Password:</label>
					<input
						style={widthStyle}
						value={this.confirmPassword}
						name="confirmPassword"
						onChange={this.handleChange}
						type="password"
					/>
				</div>
				{!(this.state.password === this.state.confirmPassword) ? <label style={{color:"#890000",marginTop:'10px'}}>THE PASSWORDS DO NOT MATCH</label> : <Button style={{marginTop:'10px', fontSize:14+'px'}} onClick={this.createNewWallet}>CREATE</Button>}
			</div>
		}
		else {
			body = 	<div className="container-fluid">
				<Button onClick={this.handleCreateNewWallet} style={{fontSize:20+'px'}}>CREATE WALLET</Button>
				<br/>
				<br/>
				<Button onClick={this.handleImportWallet} style={{fontSize:20+'px'}}>IMPORT WALLET</Button>
			</div>
		}
		return (
			<form>
				{this.renderRedirect()}
				<input type="file" id="file" ref="fileUploader" style={{display: "none"}} onChange={this.onChangeFile.bind(this)}/>
				<div className="panel panel-default" style={{marginBottom:0}}>
				<div className="panel-heading">{this.state.headerText}</div>
				<div className="panel-body" style={{textAlign: 'center'}}>
					{body}
				</div>
					{this.state.importAccountClicked || this.state.createAccountClicked ?
						<div className="panel-footer" style={{backgroundColor:'#383f4b'}}>
						<Button onClick={() => {
							this.setState({
								importAccountClicked: false,
								createAccountClicked: false,
								accountJsonSet:false,
							});
						}} style={{fontSize:10+'px'}}>BACK</Button>
							<Button onClick={this.handleOk} style={{fontSize:10+'px', marginLeft:'10px'}}>OK</Button>
							</div>
					:
					null}
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
