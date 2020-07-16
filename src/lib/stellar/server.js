import sdk from './sdk'
import networks from './networks'
import has from 'lodash/has'
import * as StellarSdk from "stellar-sdk";
import Transport from "@ledgerhq/hw-transport-u2f"; // for browser
import Str from "@ledgerhq/hw-app-str";

const serverAddresses = {
    public: 'https://horizon.kinfederation.com',
    test: 'https://horizon-testnet.kin.org',
    local: 'https://horizon.kinfederation.com',
}

/**
 * Wrap the stellar-sdk Server hiding setup of horizon addresses and adding
 * some helper functions. These helpers are more easily mocked for testing then
 * direct use of sdk fluent api.
 */
class WrappedServer extends sdk.Server {
  constructor(network) {
    if (!has(networks, network)) throw new Error(`network ${network} unknown`)

	  if (network === networks.public)
	  {
		  sdk.Network.usePublicNetwork()
		  StellarSdk.Network.use(new StellarSdk.Network('Kin Mainnet ; December 2018'));
	  }
	  else if (network === networks.test)
	  {
		  sdk.Network.useTestNetwork()
		  StellarSdk.Network.use(new StellarSdk.Network('Kin Testnet ; December 2018'));
	  }

    // allowHttp: public/test use HTTPS; local can use HTTP
    super(serverAddresses[network], {allowHttp: network === networks.local})
  }


   arrayBufferToBase64 = ( buffer ) => {
		var binary = '';
		var bytes = new Uint8Array( buffer );
		var len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	};

	SendTransaction(sourceKey, destinationId, asset_issuer, asset_code, amount, useLedger) {
  	    let thisServer = this;
		return thisServer.loadAccount(destinationId)
		// If there was no error, load up-to-date information on your account.
		.then(function() {
			return thisServer.loadAccount(sourceKey.publicKey());
		})
		.then(async function(sourceAccount) {
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
			.addMemo(StellarSdk.Memo.text('1-ejF5-'))
			.build();
			if(useLedger){
				const transport = await Transport.create();
				const str = new Str(transport);
				const result = await str.signTransaction("44'/2017'/0'", transaction.signatureBase());
				const hint = sourceKey.signatureHint();
				const decorated = new StellarSdk.xdr.DecoratedSignature({hint: hint, signature: result.signature});
				transaction.signatures.push(decorated);
			}
			else {
				// Sign the transaction to prove you are actually the person sending it.
				transaction.sign(sourceKey);
			}

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
