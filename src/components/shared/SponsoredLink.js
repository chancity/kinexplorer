import React from 'react'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import FetchPonyfill from 'fetch-ponyfill'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import {storageInit} from "../../lib/utils";
//import Transport from "@ledgerhq/hw-transport-node-hid";
import Transport from "@ledgerhq/hw-transport-u2f"; // for browser
import Str from "@ledgerhq/hw-app-str";
import StellarSdk from "stellar-sdk";
import regeneratorRuntime from "regenerator-runtime";

const storage = storageInit()
const fetch = FetchPonyfill().fetch

const SPONSOR_LINK_JSON =  'https://raw.githubusercontent.com/chatch/stellarexplorer/master/banner.json'

const getStrAppVersion = async () => {
  const transport = await Transport.create();
  const str = new Str(transport);
  const result = await str.getAppConfiguration();
  return result.version;
}

const getStrPublicKey = async () => {
  const transport = await Transport.create();
  const str = new Str(transport);
  const result = await str.getPublicKey("44'/148'/0'");
  return result.publicKey;
};

const SponsoredLink = ({message, removeHandler}) => (

  <Grid>
    <div className="panel panel-default" style={{marginBottom:'20px', wordWrap: 'break-word'}}>
    <div className="panel-body">

      <Col style={{marginBottom: 15, paddingLeft: 15, paddingRight:15}}>
        <label>Your public key: <span dangerouslySetInnerHTML={{__html: message}}/></label> <br/> <button onClick={removeHandler} className="btn-danger" style={{fontSize: '10px', textAlign:'center'}}>Remove </button>
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

  removeHandler = () => {
    getStrAppVersion().then(v => console.log(v));
    let publicKey;
    getStrPublicKey().then(pk => {
      console.log(pk);
      publicKey = pk;
    });
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
    return <SponsoredLink message={this.state.message} removeHandler={this.removeHandler} />
  }
}

export default SponsoredLinkContainer
