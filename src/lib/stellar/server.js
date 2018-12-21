import sdk from './sdk'
import networks from './networks'
import has from 'lodash/has'
import * as StellarSdk from "stellar-sdk";


const serverAddresses = {
  public: 'https://horizon-kin-ecosystem.kininfrastructure.com/',
  test: 'https://horizon-playground.kininfrastructure.com/',
  local: 'https://horizon-playground.kininfrastructure.com/',
}

/**
 * Wrap the stellar-sdk Server hiding setup of horizon addresses and adding
 * some helper functions. These helpers are more easily mocked for testing then
 * direct use of sdk fluent api.
 */
class WrappedServer extends sdk.Server {
  constructor(network) {
    if (!has(networks, network)) throw new Error(`network ${network} unknown`)

    if (network === networks.public) sdk.Network.usePublicNetwork()
    else if (network === networks.test) sdk.Network.useTestNetwork()

	  StellarSdk.Network.use(new StellarSdk.Network('Public Global Kin Ecosystem Network ; June 2018'));
    // allowHttp: public/test use HTTPS; local can use HTTP
    super(serverAddresses[network], {allowHttp: network === networks.local})
  }



	SendTransaction(sourceKey, destinationId, asset_issuer, asset_code, amount) {
  	    let thisServer = this;

		return thisServer.loadAccount(destinationId)
		// If there was no error, load up-to-date information on your account.
		.then(function() {
			return thisServer.loadAccount(sourceKey.publicKey());
		})
		.then(function(sourceAccount) {
			// Start building the transaction.
			let transaction = new StellarSdk.TransactionBuilder(sourceAccount)
			.addOperation(StellarSdk.Operation.payment({
				destination: destinationId,
				// Because Stellar allows transaction in many currencies, you must
				// specify the asset type. The special "native" asset represents Lumens.
				asset: !asset_code || !asset_issuer ? new StellarSdk.Asset.native() : new StellarSdk.Asset(asset_code, asset_issuer),
				amount: amount.toString()
			}))
			// A memo allows you to add your own metadata to a transaction. It's
			// optional and does not affect how Stellar treats the transaction.
			.addMemo(StellarSdk.Memo.text('1-kin_explorer'))
			.build();

			// Sign the transaction to prove you are actually the person sending it.
			transaction.sign(sourceKey);
			// And finally, send it off to Stellar!
			return thisServer.submitTransaction(transaction);
		})

	}


  accountURL = id => `${this.serverURL}accounts/${id}`
  effectURL = id => `${this.serverURL}operations/${id}/effects`
  ledgerURL = id => `${this.serverURL}ledgers/${id}`
  opURL = id => `${this.serverURL}operations/${id}`
  txURL = id => `${this.serverURL}transactions/${id}`
}

const Server = network => new WrappedServer(network)

export default Server
