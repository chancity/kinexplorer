import {join} from 'path'
import {tmpdir} from 'os'
import truncate from 'lodash/truncate'
import {sdk} from './stellar'
import WarpedServer from './stellar/server'
import * as StellarSdk from "stellar-sdk";
import Transport from "@ledgerhq/hw-transport-u2f"; // for browser
import Str from "@ledgerhq/hw-app-str";
const _sodium = require('libsodium-wrappers-sumo');
let sodium;

(async() => {
	await _sodium.ready;
	 sodium = _sodium;
})();

const STROOPS_PER_LUMEN = 10000000
const stroopsToLumens = stroops => stroops / STROOPS_PER_LUMEN

// stellar federated address (eg. "stellar*fed.network")
const isStellarAddress = addr => /^[^*,]*\*[a-z0-9-.]*$/i.test(addr)
const isPublicKey = keyStr => sdk.StrKey.isValidEd25519PublicKey(keyStr)
const isSecretKey = keyStr => sdk.StrKey.isValidEd25519SecretSeed(keyStr)
const isTxHash = hashStr => /^[0-9a-f]{64}$/i.test(hashStr)
const shortHash = (hash, length = 10) => truncate(hash, {length})

const isDefInt = (obj, key) => {
  if (!obj || !key || obj.hasOwnProperty(key) === false) return false
  return Number.isInteger(Number(obj[key]))
}

const base64Decode = value => Buffer.from(value, 'base64').toString()
const base64DecodeToHex = value => Buffer.from(value, 'base64').toString('hex')

// Extract asset issuer address from keys in the form <code>-<issuer>
const assetKeyToIssuer = key => key.substring(key.indexOf('-') + 1)

const handleFetchDataFailure = id => e => {
  let status
  if (e.data && e.data.status) status = e.data.status
  else if (e.response && e.response.status) status = e.response.status

  let msg = `Failed to fetch data:`
  if (status) msg += `\n\tStatus: [${status}]`
  if (e.response && e.response.status)
    msg += `\n\tStatus: [${e.response.status}]`
  if (e.message) msg += `\n\tMessage: [${e.message}]`
  if (e.stack) msg += `\n\tStack: [${e.stack}]`

  console.error(msg)
  console.error(`Raw Error: ${e}`)

  let errorURI
  if (status === 404) {
    let redirectURI = '/error/not-found'
    if (id) redirectURI += `/${id}`
    errorURI = redirectURI
  } else if (e.message === 'Network Error') {
    errorURI = `/error/general/network`
  } else {
    errorURI = `/error/general/${id}`
  }
  //window.location.href = errorURI
}

const storageInit = () => {
  let storage
  if (typeof localStorage === 'undefined' || localStorage === null) {
    const storagePath = join(tmpdir(), 'kinexplorer')
    const LocalStorage = require('node-localstorage').LocalStorage
    storage = new LocalStorage(storagePath)
  } else {
    storage = localStorage
  }
  return storage
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
const getStrPublicKey = async () => {
	const transport = await Transport.create();
	const str = new Str(transport);
	const result = await str.getPublicKey("44'/2017'/0'");
	return result.publicKey;
};

const getStrAppVersion = async () => {
	const transport = await Transport.create();
	const str = new Str(transport);
	const result = await str.getAppConfiguration();
	return result.version;
}

const sendPayment = (amount, passphrase, destinationId, asset_issuer, asset_code) =>
{
	let storage = storageInit();
	var accountJson = JSON.parse(storage.getItem('accountKeyStore')) || null;

	return sleep(200).then(async () =>{
		if(accountJson.useLedger){
			let pkey = await getStrPublicKey();
			return StellarSdk.Keypair.fromPublicKey(pkey);
		}
		let key = keyPairFromKeyStore(passphrase, accountJson.salt, accountJson.seed)
		return key;
	}).then(key => {
		let server = new WarpedServer('public');
		return server.SendTransaction(key,destinationId, asset_issuer, asset_code,amount/100, accountJson.useLedger);
	});
}
const keyPairFromKeyStore =  (passPhrase,saltHex, seedHex) => {
	let keyHashBytes = keyHash(passPhrase, saltHex);
	let decryptedSeedBytes = decryptSecretSeed(seedHex, keyHashBytes);
	let keyPair = StellarSdk.Keypair.fromRawEd25519Seed(decryptedSeedBytes);
	let secret = keyPair.secret();
	let publick = keyPair.publicKey();
	return keyPair;
}

const getNewKeyPair = (password) => {
	let keyPair = StellarSdk.Keypair.random();
	let secret = keyPair.secret();
	let publicKey = keyPair.publicKey();
	return {
		encrypted: encryptedKeyStore(keyPair, password),
		decrypted: {pkey: publicKey, seed: secret}
	};
}
const encryptedKeyStore  =  (keyPair, password) => {
	let saltHex = sodium.to_hex(sodium.randombytes_buf(16));
	let keyHashBytes = keyHash(password, saltHex);
	let seedBytes = keyPair.rawSecretKey();
	let encryptedSeedBytes = encryptSecretSeedBytes(seedBytes, keyHashBytes);
	let pubkey = keyPair.publicKey();
	let encryptedSeedHex = sodium.to_hex(encryptedSeedBytes);
	return {
		pkey: pubkey,
		salt: saltHex,
		seed: encryptedSeedHex
	}
}

const encryptSecretSeedBytes  =  (seedBytes, keyHashBytes) => {
	let nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
	let encrypted = sodium.crypto_secretbox_easy(seedBytes, nonce, keyHashBytes);
	return mergeTypedArraysUnsafe(nonce,encrypted);
}

const mergeTypedArraysUnsafe = (a, b) => {
	var c = new a.constructor(a.length + b.length);
	c.set(a);
	c.set(b, a.length);

	return c;
}

const decryptSecretSeed =  (seedHex, keyHashBytes) => {
	let nonce_and_ciphertext = sodium.from_hex(seedHex);
	if (nonce_and_ciphertext.length < sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES) {
		throw "Short message";
	}
	let nonce = nonce_and_ciphertext.slice(0, sodium.crypto_secretbox_NONCEBYTES),ciphertext = nonce_and_ciphertext.slice(sodium.crypto_secretbox_NONCEBYTES);
	let decryptedSeedBytes = sodium.crypto_secretbox_open_easy(ciphertext, nonce, keyHashBytes);
	return decryptedSeedBytes.slice(0, 32);
}

const keyHash =  (passPhrase, saltHex) =>{
	let saltBytes = sodium.from_hex(saltHex);
	let passPhraseBytes = sodium.from_string(passPhrase);
	var hash = sodium.crypto_pwhash(32,passPhraseBytes,saltBytes, 2, 67108864, 2);
	let hmm = sodium.to_hex(hash)
	return hash;
}


export {
  assetKeyToIssuer,
  base64Decode,
  base64DecodeToHex,
  handleFetchDataFailure,
  isDefInt,
  isPublicKey,
  isSecretKey,
  isStellarAddress,
  isTxHash,
  shortHash,
  storageInit,
  stroopsToLumens,
  sendPayment,
  getNewKeyPair,
	getStrPublicKey,
	getStrAppVersion
}
