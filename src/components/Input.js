import React from 'react'
import PropTypes from 'prop-types'
import CopyToClipboard from 'react-copy-to-clipboard'
import JSONPretty from 'react-json-pretty'
import Button from 'react-bootstrap/lib/Button'
import Modal from 'react-bootstrap/lib/Modal'

import QrcodeRestore from './QrcodeRestore'
import NewWindowIcon from './shared/NewWindowIcon'
import {withSpinner} from './shared/Spinner'
import {sendPayment, storageInit} from "../lib/utils";
import AccountLink from "./shared/AccountLink";
import PaymentButton from "./layout/Header";
const storage = storageInit();

/**
 * Button that reveals a backend resouce at 'url' when clicked.
 *
 * Used to show the underlying JSON that a view was rendered with OR for
 * showing a related resource, eg. an anchor's server.toml file.
 */

class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sent: false,
            amount: '',
	        password: ''
        }

        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
	    event.preventDefault()
        this.setState({ [event.target.name]: event.target.value });
    }


    handleClick(event) {
	    event.preventDefault()
        this.props.handleSend(this.state.amount, this.state.password, this.props.destinationId, this.props.asset_issuer, this.props.asset_code);
        this.setState({sent: true})
    }

    render() {
        const { amount,password } = this.state;
        const widthStyle ={
            width: '100%'
        }
	    const textAlignStyle ={
		    textAlign: 'left'
	    }
        return (
            <div  style={textAlignStyle}>
            <div id="amount">
               <label >Amount:</label> <input
	                style={widthStyle}
                    value={amount}
                    name="amount"
                    onChange={this.handleChange}
                    type="number" />
            </div>
            <p/>
	            {!this.props.useLedger && <div id="password">
	            <label>Password:</label> <input
		            style={widthStyle}
		            value={password}
		            name="password"
		            onChange={this.handleChange}
		            type="password" />
            </div>}
	            <br/>
	            <p/>

                <div>
                <BackendResourceBadgeButton style={widthStyle} handleClickFn={(e) => this.handleClick(e)} label={ 'Send'} url={'_blank'}/>

                </div>
            </div>

        )
    }
}

const BackendResourceBadgeButton = ({handleClickFn, label, url}) => (
    <a
        id='backend-resource-badge-button'
        className="backend-resource-badge-button"
        href={url}
        onClick={handleClickFn}
    >
        {label}
    </a>
)

BackendResourceBadgeButton.propTypes = {
    handleClickFn: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    url: PropTypes.string,
}

class ClipboardCopyButton extends React.Component {
    state = {copied: false}

    constructor(props, context) {
        super(props, context)
        this.handleClickCopy = this.handleClickCopy.bind(this)
    }

    handleClickCopy() {
        this.setState({copied: true})
    }

    render() {
        return (
            <CopyToClipboard text={this.props.text} onCopy={this.handleClickCopy}>
        <span>
          <Button
              style={{backgroundColor: '#08b5e5', color: 'white', border: 0}}
          >
            Copy
          </Button>
            {this.state.copied && <span style={{marginLeft: 5}}>Copied!</span>}
        </span>
            </CopyToClipboard>
        )
    }
}

ClipboardCopyButton.propTypes = {
    text: PropTypes.string.isRequired,
}

const ResourceModalBody = ({handleCloseFn, isJson, show, text, url}) => (
    <div>
        <div className="break" style={{marginBottom: 15}}>
            <a href={url} target="_blank">
                {url}
                <NewWindowIcon />
            </a>
        </div>
        <div>
            {isJson ? <JSONPretty id="json-pretty" json={text} /> : <pre>{text}</pre>}
        </div>
    </div>
)

const ResourceModalBodyWithSpinner = withSpinner()(ResourceModalBody)




class ResourceModalContainer extends React.Component {
	constructor(props, context) {
		super(props, context)

		this.handleSend = this.handleSend.bind(this);
		this.qrCodeUploaded = this.qrCodeUploaded.bind(this);



		this.state = {
			isSending: false,
            isError: false,
			isJson: false,
			isLoading: true,
			show: false,
			text: null,
            url: '_blank',
            accountJson: JSON.parse(storage.getItem('accountKeyStore')) || null
		}
	}

    checkNested(obj /*, level1, level2, ... levelN*/) {
		var args = Array.prototype.slice.call(arguments, 1);

		for (var i = 0; i < args.length; i++) {
			if (!obj || !obj.hasOwnProperty(args[i])) {
				return false;
			}
			obj = obj[args[i]];
		}
		return true;
	}
	qrCodeUploaded(value)
    {
        storage.setItem('accountKeyStore', value);
        this.setState({accountJson: JSON.parse(value) || null})
    }
	handleSend(amount, passphrase, destinationId, asset_issuer, asset_code) {
	    this.setState({
		    isSending: true,
		    isError: false,
		    isJson: false,
		    isLoading: true,
		    show: false,
		    text: null,
		    url: '_blank'
	    });

		try {
			sendPayment(amount, passphrase, destinationId, asset_issuer, asset_code)
			.then(rsp =>
				this.setState({
					text: JSON.stringify(rsp),
					isLoading: false,
					isSending: false,
					isJson: true,
					show: true,
                    url: this.checkNested(rsp,'_links','transaction','href') ? rsp._links.transaction.href : '_blank'
				})
			)
			.catch(err => {
				this.setState({
					text: JSON.stringify({message: err.message.toString()}),
					isJson: true,
					isError: true,
					isLoading: false,
					isSending: false,
                    show: true
				})
			});
        }
        catch (e) {
            this.setState({
                text: JSON.stringify({message: e.message.toString()}),
                isError: true,
                isLoading: false,
	            isJson: true,
	            isSending: false,
	            show: true,
            })
        }
	}

    render() {
            return (
                <Modal id="resourceModal" show={this.props.show} onHide={this.props.handleCloseFn}>
                    <Modal.Header closeButton>
                        {!this.state.text ? <AccountLink account={this.props.destinationId}/> : <ClipboardCopyButton text={this.state.text} />}
                    </Modal.Header>

                    {this.state.accountJson === null && <QrcodeRestore qrCodeUploaded={this.qrCodeUploaded}/>}
                        {this.state.isSending || this.state.isError || this.state.text && this.state.accountJson ?  <Modal.Body>
                         <ResourceModalBodyWithSpinner
	                         handleCloseFn={this.props.handleCloseFn}
	                         isJson={this.state.isJson}
	                         isLoading={this.state.isLoading}
	                         show={this.props.show}
	                         text={this.state.text}
	                         url={this.state.url}
                         />
                    </Modal.Body> : null}

	                {this.state.accountJson && this.state.accountJson.useLedger && this.state.isSending && <Modal.Footer style={{textAlign:'center'}}><label>Confirm the tx on your ledger...</label> </Modal.Footer>}
	                {this.state.accountJson && (!this.state.isSending || this.state.isError) ? <Modal.Footer>
		                <Input{...this.props} handleSend={this.handleSend} useLedger={this.state.accountJson && this.state.accountJson.useLedger} />
                    </Modal.Footer> : null}
                </Modal>
            )

    }
}

ResourceModalContainer.propTypes = {
    filterFn: PropTypes.func,
    handleCloseFn: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
	destinationId: PropTypes.string.isRequired,
	asset_code: PropTypes.string,
	asset_issuer: PropTypes.string,
}

class BackendResourceBadgeButtonWithResourceModal extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.handleClick = this.handleClick.bind(this)
        this.handleClose = this.handleClose.bind(this)

        this.state = {
            show: false,
        }
    }

    handleClose() {
        this.setState({show: false})
    }

    handleClick(event) {
        event.preventDefault()
        this.setState({show: true})
    }

    render() {
        return (
            <span>
        <BackendResourceBadgeButton
            label={this.props.label}
            handleClickFn={this.handleClick}
            url={this.props.url}
        />
                {this.state.show && (
                    <ResourceModalContainer
                        filterFn={this.props.filterFn}
                        handleCloseFn={this.handleClose}
                        show={this.state.show}
                        destinationId={this.props.destinationId}
                        asset_code={this.props.asset_code}
                        asset_issuer={this.props.asset_issuer}
                    />
                )}
      </span>
        )
    }
}

BackendResourceBadgeButtonWithResourceModal.propTypes = {
    filterFn: PropTypes.func,
    label: PropTypes.string.isRequired,
    url: PropTypes.string,
	destinationId: PropTypes.string.isRequired,
	asset_code: PropTypes.string,
	asset_issuer: PropTypes.string,
}

export default BackendResourceBadgeButtonWithResourceModal
