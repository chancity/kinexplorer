import React from 'react'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import FetchPonyfill from 'fetch-ponyfill'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import {storageInit} from "../../lib/utils";
const storage = storageInit()
const fetch = FetchPonyfill().fetch

const SPONSOR_LINK_JSON =  'https://raw.githubusercontent.com/chatch/stellarexplorer/master/banner.json'

const SponsoredLink = ({message, removeHandler}) => (

  <Grid>
    <Row>
      <Col style={{marginBottom: 15, paddingLeft: 15, paddingRight:15}}>
        Your public key: <span dangerouslySetInnerHTML={{__html: message}} /> <button onClick={removeHandler} className="btn-danger" style={{fontSize: '10px'}}>Remove </button>
      </Col>
    </Row>
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
    storage.removeItem('accountKeyStore')
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
