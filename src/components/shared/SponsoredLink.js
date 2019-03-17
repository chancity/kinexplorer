import React from 'react'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import FetchPonyfill from 'fetch-ponyfill'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import {storageInit} from "../../lib/utils";
//import PaymentButton from "../Account";
import {Redirect} from "react-router-dom";
const storage = storageInit()
const fetch = FetchPonyfill().fetch
const SPONSOR_LINK_JSON =  'https://raw.githubusercontent.com/chatch/stellarexplorer/master/banner.json'

const BackendResourceBadgeButton = ({handleClickFn, label, url}) => (
	<a
		style={{backgroundColor:'#f00'}}
		className="backend-resource-badge-button"
		href={url}
		onClick={handleClickFn}
	>
		{label}
	</a>
)

const SponsoredLink = ({message, removeHandler}) => (

  <Grid>
    <div className="panel panel-default" style={{marginBottom:'20px', wordWrap: 'break-word'}}>
    <div className="panel-body">

      <Col style={{marginBottom: 15, paddingLeft: 15, paddingRight:15}}>
        <label>
	        Your public key: <span dangerouslySetInnerHTML={{__html: message}}/>
        </label>
	      <br/>
	      <BackendResourceBadgeButton handleClickFn={removeHandler} label={'Remove'} url={"_blank"}/>
      </Col>

    </div>
    </div>
  </Grid>
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
      return null
      return  <SponsoredLink message={this.state.message} removeHandler={this.removeHandler} />
  }
}

export default SponsoredLinkContainer
