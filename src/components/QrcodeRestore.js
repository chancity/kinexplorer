import React from "react";
import QrcodeDecoder from 'qrcode-decoder';
import QrCodeEncoder from "qrcode";
import {injectIntl} from "react-intl";
import {storageInit, getNewKeyPair, getStrPublicKey, getStrAppVersion} from "../lib/utils";
import { Redirect } from 'react-router-dom'
import Button from "react-bootstrap/es/Button";
import { saveAs } from 'file-saver';
import {Spinner} from "./shared/Spinner";
import JSONPretty from 'react-json-pretty'
import FetchPonyfill from 'fetch-ponyfill'
const fetch = FetchPonyfill().fetch

const storage = storageInit()

class QrcodeRestore extends React.Component {
	renderRedirect = () => {
		if (this.state.redirect) {
			return <Redirect to={'/account/' + this.state.ledgerAddress} />
		}
	}
	state = {};

	constructor(props) {
		super(props);

		this.state = {
			uploadedFile: null,
			redirect: false,
			createAccountClicked:false,
			importAccountClicked:false,
			useLedgerClicked:false,
			password:'',
			confirmPassword:'',
			accountJsonSet:false,
			paperWalletJson:'',
			encryptedWalletJson:'',
			headerText: 'add account',
			ledgerVersion:'',
			ledgerAddress:'',
			ledgerError:false,
			loading:false

		};
	}

	setRedirect = () => {
		this.setState({
			redirect: true
		})
	}


	onChangeFile(event) {
		event.stopPropagation();
		event.preventDefault();
		if(!event.target.files.length){
			this.setState({
				createAccountClicked: false,
				importAccountClicked: false,
				useLedgerClicked: false,
			});
		}
		else {
			let file = event.target.files[0];
			this.handleImageUpload(file); /// if you want to upload latter
		}
	}
	handleImageUpload(file) {
		let reader = new FileReader();
		let hmm = this.setImgAndEncryptedStore;
		reader.addEventListener('load', function() {
			let qr = new QrcodeDecoder;
			let result1 = this.result;
			qr.decodeFromImage(this.result).then((res) => {
				hmm(result1, res.data, false);
			});
		}.bind(reader), false);

		reader.readAsDataURL(file);
	}
	setImgAndEncryptedStore = (dataUrl, json, saveBackup) => {
		let keystore = JSON.parse(json);
		this.setState({
			encryptedWalletJson:json,
			ledgerAddress:keystore.pkey,
			loading:false
		});
		let myCanvas = document.getElementById('accountImg');
		let ctx = myCanvas.getContext('2d');
		let img = new Image;
		img.onload = function () {
			myCanvas.height = img.height;
			myCanvas.width = img.width;
			ctx.drawImage(img, 0, 0, img.width, img.height,     // source rectangle
				0, 0, img.width, img.height); // destination rectangle
			myCanvas.style.display = 'inline'
			if (saveBackup) {
				myCanvas.toBlob(function (blob) {
					saveAs(blob, "backup_qr.png");
				});
			}
		}
		img.src = dataUrl;
	}
	createNewWallet = () => {
		this.setState({
			createAccountClicked: false,
			useLedgerClicked:false,
			importAccountClicked: true
		});
		let encryptedKp = getNewKeyPair(this.state.password);
		let jsonValue = JSON.stringify(encryptedKp.encrypted);

		this.setState({
			paperWalletJson:JSON.stringify(encryptedKp.decrypted),
			loading:false
		})

		QrCodeEncoder.toDataURL(jsonValue)
		.then(url => {
			this.setImgAndEncryptedStore(url, jsonValue, true);
		})
		.catch(err => {
			console.error(err)
		})
	}
	handleCreateNewWallet = () => {
		this.setState({
			importAccountClicked: false,
			useLedgerClicked:false,
			createAccountClicked: true
		})
	}


	handleUseLedger = async () => {
		this.setState({
			loading:true,
			useLedgerClicked: true
		});
		try {
			let v = await getStrAppVersion();
			this.setState({
				ledgerVersion:v
			});

			let pk = await getStrPublicKey()
			this.setState({
				ledgerAddress:pk
			});

			this.setState({
				importAccountClicked: false,
				createAccountClicked: false,
				ledgerError: false,
				loading:false
			})
		}
		catch (e) {
			this.setState({
				importAccountClicked: false,
				createAccountClicked: false,
				ledgerError: true,
				loading:false
			})
		}
	}
	handleImportWallet = () => {
		this.refs.fileUploader.click();
		this.setState({
			loading:true,
			createAccountClicked: false,
			useLedgerClicked:false,
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
		if(this.state.ledgerVersion && this.state.ledgerVersion !== ''){
			var keyStore = {
				pkey:this.state.ledgerAddress,
				useLedger:true,
			};
			storage.setItem('accountKeyStore', JSON.stringify(keyStore));
		}else{
			storage.setItem('accountKeyStore', this.state.encryptedWalletJson);
		}
		this.setState({
			loading:true,
			paperWalletJson:''
		})

		fetch('https://friendbot.kinexplorer.com/api/Create/' + this.state.ledgerAddress)
		.then(rsp => rsp.json())
		.then(rsp => {
			const newState = {};
			newState.loading = false;
			newState.paperWalletJson = JSON.stringify(rsp);
			if(rsp.success || rsp.message === 'Account already exists'){
				if(this.props && this.props.qrCodeUploaded){
					this.props.qrCodeUploaded(storage.getItem('accountKeyStore'));
				}else{
					this.setRedirect();
				}
			}

			this.setState(newState);
		})
		.catch(err => {
			console.error(`Failed to fetch price: [${err}]`)
			console.error(`stack: [${err.stack}]`)
		})
	}
	render() {

		const widthStyle ={
			width: '100%'
		}

		let body;
		if(this.state.loading){
			body = 	<Spinner/>
		}
		else if(this.state.importAccountClicked){
			body = 	<canvas id="accountImg" style={{width:'276px', height:'276px', display:'none'}}></canvas>
		}
		else if(this.state.useLedgerClicked){
			if(this.state.ledgerError)
			{
				body = <div
					className="container-fluid"><label
					style={{color:"#890000",marginTop:'10px'}}>
						CONNECT YOUR LEDGER AND OPEN KIN APP
					</label>
					<br/>
					<br/>
					<Button
						style={{marginTop:'10px', fontSize:14+'px'}}
						onClick={this.handleUseLedger}>
						TRY AGAIN
					</Button>
				</div>
			}
			else {
				body = 	<div className="container-fluid">
					<label>
						Ledger Version: {this.state.ledgerVersion}
					</label>
					<br/>
					<br/>
					<label>
						Public Key: {this.state.ledgerAddress}
					</label>
				</div>
			}
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
				<Button onClick={this.handleUseLedger} style={{fontSize:20+'px'}}>USE LEDGER</Button>
				<br/>
				<br/>
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

				{this.state.paperWalletJson !== '' && <div><JSONPretty id="json-pretty" json={this.state.paperWalletJson} /></div>}
					{body}
				</div>
					{this.state.importAccountClicked || this.state.createAccountClicked || this.state.useLedgerClicked ?
						<div className="panel-footer" style={{backgroundColor:'#383f4b'}}>
						<Button onClick={() => {
							this.setState({
								importAccountClicked: false,
								createAccountClicked: false,
								useLedgerClicked: false,
								accountJsonSet:false,
								ledgerError:false,
								loading:false,
								paperWalletJson:''
							});
						}}
					        style={{fontSize:'10px'}}>
							BACK
						</Button>
							{!this.state.loading && <Button
								onClick={this.handleOk} style={{fontSize:'10px', marginLeft:'10px'}}>
								OK
							</Button>}
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
