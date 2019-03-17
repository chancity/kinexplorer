import React from 'react'
import Col from 'react-bootstrap/lib/Col'
import FetchPonyfill from 'fetch-ponyfill'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import {storageInit} from "../../lib/utils";
import {Redirect} from "react-router-dom";
import ClipboardCopy from "./ClipboardCopy";
import Row from "react-bootstrap/es/Row";
import Tooltip from 'react-bootstrap/lib/Tooltip'
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import { Link } from 'react-router-dom';
const storage = storageInit()
const fetch = FetchPonyfill().fetch

const TooltipRemove = <Tooltip id="tooltip-remove">Delete local wallet data</Tooltip>
const TooltipAdd = <Tooltip id="tooltip-remove">Add a local wallet</Tooltip>
const RemoveIcon = (
	<Glyphicon glyph="remove" style={{fontSize: 'small', marginLeft: 5}} />
)
const AddIcon = (
	<Glyphicon glyph="plus" style={{fontSize: 'small', marginLeft: 5}} />
)
const ManageAccount = ({message, removeHandler}) => (
	<Col style={{ paddingTop: 8, paddingLeft: 5, paddingRight:15}}>
		<Row>

			<Col md={9}>

					<Link style={{color:'#08b5e5'}} to={'/account/' + message}>
					<span className="break">{message}</span>
					</Link>
					<ClipboardCopy text={message}/>
				<OverlayTrigger delayShow={300}	onMouseOut={this.handleMouseOut} overlay={TooltipRemove}>
					<a style={{color:'#f00'}} onClick={removeHandler}>
						{RemoveIcon}
					</a>
				</OverlayTrigger>


			</Col>

		</Row>
	</Col>
)
const  AddAccount = () => (
	<Col style={{ paddingTop: 8, paddingLeft: 5, paddingRight:15}}>
		<Row>

			<Col md={9}>

				<OverlayTrigger	delayShow={300}	onMouseOut={this.handleMouseOut} overlay={TooltipAdd}>
					<Link style={{color:'#7CFC00'}} to={'/qrcode_restore'}>
						{AddIcon}
					</Link>
				</OverlayTrigger>


			</Col>

		</Row>
	</Col>
)

class SponsoredLinkContainer extends React.Component {
  checkForKey = () =>{
    let key = JSON.parse(storage.getItem('accountKeyStore'));
    if(key){
      this.setState({message: key.pkey})
    }else {
      this.setState({message: ''})
    }
    setTimeout(this.checkForKey, 500);
  }

  removeHandler = (event) => {
	  event.preventDefault()
     storage.removeItem('accountKeyStore')
	 this.setState({redirect:true})
	  return <Redirect to='/my_account' />
  }
  componentDidMount() {
      this.checkForKey();
  }

  render() {

    let key = JSON.parse(storage.getItem('accountKeyStore'));
    if (
      !this.state ||
      !has(this.state, 'message') ||
      isEmpty(this.state.message)
    )
      return  <AddAccount/>
      return  <ManageAccount message={this.state.message} removeHandler={this.removeHandler} />
  }
}

export default SponsoredLinkContainer
