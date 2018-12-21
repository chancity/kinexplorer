import React from 'react'

import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Panel from 'react-bootstrap/lib/Panel'
import Row from 'react-bootstrap/lib/Row'
import Table from 'react-bootstrap/lib/Table'
import Tab from 'react-bootstrap/lib/Tab'
import Tabs from 'react-bootstrap/lib/Tabs'
import {injectIntl, FormattedMessage} from 'react-intl'
import {FederationServer, StrKey} from 'stellar-sdk'
import { Redirect } from 'react-router-dom'

import has from 'lodash/has'


import knownAccounts from '../data/known_accounts'
import {
	base64Decode,
	handleFetchDataFailure,
	isPublicKey,
	isStellarAddress, storageInit,
	keyHash
} from '../lib/utils'
import {withServer} from './shared/HOCs'
import {withSpinner} from './shared/Spinner'
import {titleWithJSONButton} from './shared/TitleWithJSONButton'

import AccountLink from './shared/AccountLink'
import Asset from './shared/Asset'
import ClipboardCopy from './shared/ClipboardCopy'
import EffectTable from './EffectTable'
import Logo from './shared/Logo'
import OperationTable from './OperationTable'
import OfferTable from './OfferTable'
import PaymentTable from './PaymentTable'
import TransactionTable from './TransactionTableContainer'
import BackendResourceBadgeButton from "./shared/BackendResourceBadgeButton";


const storage = storageInit()


const kinAddressFromStorage = () => {
	var accountKeyStore = JSON.parse(storage.getItem('accountKeyStore')) || null;

	if(accountKeyStore === null)
	{
		return undefined
	}
	var publicKey = accountKeyStore['pkey'];
	return isStellarAddress(publicKey) ? publicKey : undefined
}

const NameValueTable = ({data, decodeValue = false}) => {
	if (!data || Object.keys(data).length === 0)
		return <div style={{marginTop: 20, marginBottom: 20}}>No Data</div>
	return (
		<Table>
			<thead>
			<tr>
				<th>
					<FormattedMessage id="name"/>
				</th>
				<th>
					<FormattedMessage id="value"/>
				</th>
			</tr>
			</thead>
			<tbody>
			{Object.keys(data).map(key => (
				<tr key={key}>
					<td>{key}</td>
					<td>
						{typeof data[key] === 'boolean'
							? data[key].toString()
							: decodeValue ? base64Decode(data[key]) : data[key]}
					</td>
				</tr>
			))}
			</tbody>
		</Table>
	)
}


const balanceRow = bal => (
	<tr key={bal.asset_code ? `${bal.asset_code}-${bal.asset_issuer}` : 'XLM'}>
		<td>
			<Asset
				type={bal.asset_type}
				code={bal.asset_code}
				issuer={bal.asset_issuer}
			/>
		</td>
		<td>
			<span className="break">{bal.balance}</span>
		</td>
		<td>
			<span className="break">{bal.limit}</span>
		</td>
	</tr>
)

const Balances = props => (
	<Table>
		<thead>
		<tr>
			<th>
				<FormattedMessage id="asset"/>
			</th>
			<th>
				<FormattedMessage id="balance"/>
			</th>
			<th>
				<FormattedMessage id="limit"/>
			</th>
		</tr>
		</thead>
		<tbody>{props.balances.map(balanceRow)}</tbody>
	</Table>
)

const Thresholds = ({thresholds}) => (
	<Table>
		<thead>
		<tr>
			<th>
				<FormattedMessage id="threshold.low"/>
			</th>
			<th>
				<FormattedMessage id="threshold.medium"/>
			</th>
			<th>
				<FormattedMessage id="threshold.high"/>
			</th>
		</tr>
		</thead>
		<tbody>
		<tr>
			<td>{thresholds.low_threshold}</td>
			<td>{thresholds.med_threshold}</td>
			<td>{thresholds.high_threshold}</td>
		</tr>
		</tbody>
	</Table>
)

const Signers = props => (
	<Table>
		<thead>
		<tr>
			<th>
				<FormattedMessage id="key"/>
			</th>
			<th>
				<FormattedMessage id="weight"/>
			</th>
			<th>
				<FormattedMessage id="type"/>
			</th>
		</tr>
		</thead>
		<tbody>
		{props.signers.map(signer => (
			<tr key={signer.public_key}>
				<td>
					{signer.type === 'ed25519_public_key' && (
						<AccountLink account={signer.key}/>
					)}
					{signer.type === 'sha256_hash' &&
					StrKey.decodeSha256Hash(signer.key).toString('hex')}
					{signer.type === 'preauth_tx' &&
					StrKey.decodePreAuthTx(signer.key).toString('hex')}
				</td>
				<td>{signer.weight}</td>
				<td>{signer.type}</td>
			</tr>
		))}
		</tbody>
	</Table>
)

const Flags = ({flags}) => <NameValueTable data={flags}/>
const Data = ({data}) => <NameValueTable data={data} decodeValue/>

const AccountSummaryPanel = ({
	                             account: a,
	                             accountUrl,
	                             formatMessageFn,
	                             knownAccounts,
                             }) => {
	const header = titleWithJSONButton(
		formatMessageFn({id: 'account'}),
		accountUrl
	)
	const kinAddr = kinAddressFromStorage();
	return (
		<Panel header={header}>
			<Grid style={{paddingLeft: 0}}>
				<Row>
					<Col md={10}>
						<Row>
							<Col md={3}>
								<FormattedMessage id="key.public"/>:
							</Col>
							<Col md={9}>
								<span className="break">{a.id}</span>
								<ClipboardCopy text={a.id}/>
							</Col>
						</Row>
						{kinAddr && (
							<Row>
								<Col md={3}>
									<FormattedMessage id="stellar.address"/>:
								</Col>
								<Col md={9}>{kinAddr}</Col>
							</Row>
						)}
					</Col>
					{has(knownAccounts, a.id) &&
					knownAccounts[a.id].type !== 'inflation_pools' && (
						<Col md={2}>
							<div style={{marginBottom: 10}}>
								<Logo
									src={knownAccounts[a.id].logo}
									name={knownAccounts[a.id].name}
								/>
							</div>
						</Col>
					)}
				</Row>
			</Grid>
		</Panel>
	)
}

class AccountMy extends React.Component {
	state = {
		key: 'balances',
		renderEffects: false,
	}

	constructor(props, context) {
		super(props, context)
		this.handleURIHash = this.handleURIHash.bind(this)
		this.handleSelect = this.handleSelect.bind(this)
		this.setNewState = this.setNewState.bind(this)
	}

	componentDidMount() {
		this.handleURIHash()
	}

	componentWillReceiveProps(nextProps) {
		this.handleURIHash()
	}

	setNewState(tabKey) {
		const newState = {key: tabKey}
		if (tabKey === 'effects') newState.renderEffects = true
		this.setState(newState)
	}

	handleURIHash() {
		if (has(window.location, 'hash') && window.location.hash.length > 1) {
			const tab = window.location.hash.substring(1) // string after '#'
			this.setNewState(tab)
		}
	}

	handleSelect(key) {
		window.location.hash = `#${key}`
		this.setNewState(key)
	}

	render() {
		const {formatMessage} = this.props.intl
		const a = this.props.account
		return (
			<Grid>
				<Row>
					<AccountSummaryPanel
						account={a}
						accountUrl={this.props.urlFn(a.id)}
						formatMessageFn={formatMessage}
						knownAccounts={knownAccounts}
					/>
				</Row>
				<Row>
					<Tabs
						id="account-tabs"
						activeKey={this.state.key}
						onSelect={this.handleSelect}
						style={{border: '1px solid #ddd', borderRadius: 4}}
					>
						<Tab eventKey="balances" title={formatMessage({id: 'balances'})}>
							<Balances balances={a.balances}/>
						</Tab>
						<Tab eventKey="payments" title={formatMessage({id: 'payments'})}>
							<PaymentTable
								key={a.id}
								account={a.id}
								compact={false}
								limit={20}
								usePaging
							/>
						</Tab>
						<Tab eventKey="offers" title={formatMessage({id: 'offers'})}>
							<OfferTable
								key={a.id}
								account={a.id}
								compact={false}
								limit={20}
								showSeller={false}
								usePaging
							/>
						</Tab>
						<Tab eventKey="effects" title={formatMessage({id: 'effects'})}>
							{// OPTIMISATION: render on focus only as it hits the server for every effect
								this.state.renderEffects === true && (
									<EffectTable
										key={a.id}
										account={a.id}
										limit={20}
										showAccount={false}
										usePaging
									/>
								)}
						</Tab>
						<Tab
							eventKey="operations"
							title={formatMessage({id: 'operations'})}
						>
							<OperationTable
								key={a.id}
								account={a.id}
								compact={false}
								limit={20}
								usePaging
							/>
						</Tab>
						<Tab
							eventKey="transactions"
							title={formatMessage({id: 'transactions'})}
						>
							<TransactionTable
								key={a.id}
								account={a.id}
								compact={false}
								limit={20}
								showSource={false}
								usePaging
							/>
						</Tab>
						<Tab eventKey="signing" title={formatMessage({id: 'signing'})}>
							<Row>
								<Col md={7}>
									<Signers signers={a.signers}/>
								</Col>
								<Col
									md={3}
									mdOffset={1}
									style={{border: '1px solid white', marginTop: 30}}
								>
									<h4>
										<FormattedMessage id="thresholds"/>
									</h4>
									<Thresholds thresholds={a.thresholds}/>
								</Col>
							</Row>
						</Tab>
						<Tab eventKey="flags" title={formatMessage({id: 'flags'})}>
							<Flags flags={a.flags}/>
						</Tab>
						<Tab eventKey="data" title={formatMessage({id: 'data'})}>
							<Data data={a.data_attr}/>
						</Tab>
					</Tabs>
				</Row>
			</Grid>
		)
	}
}


const AccountWithSpinner = withSpinner()(AccountMy)

class AccountMyContainer extends React.Component {
	state = {
		account: null,
		accountKeyStore: JSON.parse(storage.getItem('accountKeyStore')) || null,
		isLoading: true,
	}

	componentDidMount() {
		if (this.state.accountKeyStore !== null) {
			this.loadAccount(this.state.accountKeyStore['pkey'])
		}
	}

	componentWillReceiveProps() {
		if (this.state.accountKeyStore !== null) {
			this.loadAccount(this.state.accountKeyStore['pkey'])
		}
	}

	loadAccount(accountId) {
		if (isPublicKey(accountId))
			this.loadAccountByKey(accountId)
		else if (isStellarAddress(accountId))
			this.loadAccountByKinAddress(accountId)
		else {
			handleFetchDataFailure(accountId)(
				new Error(`Unrecognized account: ${accountId}`)
			)
		}
	}

	loadAccountByKinAddress(kinAddr) {
		const [name, domain] = kinAddr.split('*')
		FederationServer.createForDomain(domain)
		.then(fed => fed.resolveAddress(name))
		.then(acc => this.loadAccount(acc.account_id))
		.catch(handleFetchDataFailure(kinAddr))
	}

	loadAccountByKey(accountId) {
		this.props.server
		.accounts()
		.accountId(accountId)
		.call()
		.then(res => {
			this.setState({account: res, isLoading: false})
			return null
		})
		.catch(handleFetchDataFailure(accountId))
	}

	render() {
		if (this.state.accountKeyStore !== null) {
			//this.state.account = this.state.accountKeyStore['pkey']

			return (
				<AccountWithSpinner
					account={this.state.account}
					isLoading={this.state.isLoading}
					urlFn={this.props.server.accountURL}
					{...this.props}
				/>
			)
		}
		else {
			return <Redirect to='/qrcode_restore' />
		}
	}
}

export default injectIntl(withServer(AccountMyContainer))
