# Kin Explorer

A ledger explorer for [Kin](https://kinecosystem.org).

Public: https://kinexplorer.com
Test: https://testnet.kinexplorer.com
Local: http://localhost:3000

## Resources

### Lists

| Resource     | URI                                          |
| ------------ | -------------------------------------------- |
| Operations   | [/operations](https://kinexplorer.com/operations) |
| Transactions | [/txs](https://kinexplorer.com/txs)               |
| Ledgers      | [/ledgers](https://kinexplorer.com/ledgers)       |
| Payments     | [/payments](https://kinexplorer.com/payments)     |
| Trades       | [/trades](https://kinexplorer.com/trades)         |
| Effects      | [/effects](https://kinexplorer.com/effects)       |

### Directory

| Resource        | URI                                        |
| --------------- | ------------------------------------------ |
| Assets          | [/assets](https://kinexplorer.com/assets)       |
| Anchors         | [/anchors](https://kinexplorer.com/anchors)     |
| Exchanges       | [/exchanges](https://kinexplorer.com/exchanges) |
| Inflation Pools | [/pools](https://kinexplorer.com/pools)         |

### Accounts

| Resource             | URI                                                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| by Federated address | [/account/stellar\*fed.network](https://kinexplorer.com/account/stellar*fed.network)                                                                          |
| by Public address    | [/account/GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX](https://kinexplorer.com/account/GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX) |

#### Tabs

| Resource         | URI                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Balances Tab     | [/account/stellar\*fed.network#balances](https://kinexplorer.com/account/stellar*fed.network#balances)         |
| Payments Tab     | [/account/stellar\*fed.network#payments](https://kinexplorer.com/account/stellar*fed.network#payments)         |
| Offers Tab       | [/account/stellar\*fed.network#offers](https://kinexplorer.com/account/stellar*fed.network#offers)             |
| Effects Tab      | [/account/stellar\*fed.network#effects](https://kinexplorer.com/account/stellar*fed.network#effects)           |
| Operations Tab   | [/account/stellar\*fed.network#operations](https://kinexplorer.com/account/stellar*fed.network#operations)     |
| Transactions Tab | [/account/stellar\*fed.network#transactions](https://kinexplorer.com/account/stellar*fed.network#transactions) |
| Signing Tab      | [/account/stellar\*fed.network#signing](https://kinexplorer.com/account/stellar*fed.network#signing)           |
| Flags Tab        | [/account/stellar\*fed.network#flags](https://kinexplorer.com/account/stellar*fed.network#flags)               |
| Data Tab         | [/account/stellar\*fed.network#data](https://kinexplorercom/account/stellar*fed.network#data)                  |

### Search

| Resource              | URI                                                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Federated address     | [/search/kinexplorer\*fed.network](https://kinexplorer.com/search/kinexplorer*fed.network)                                                                                            |
| Public address        | [/search/GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX](https://kinexplorer.com/search/GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX)                 |
| Ledger                | [/search/10000000](https://kinexplorer.com/search/10000000)                                                                                                                 |
| Transaction           | [/search/26a568681712a44a515b2c90dcfaadb3ed2c40dc60254638407937bee4767071](https://kinexplorer.com/search/26a568681712a44a515b2c90dcfaadb3ed2c40dc60254638407937bee4767071) |
| Asset Code            | [/search/NGN](https://kinexplorer.com/search/NGN)                                                                                                                           |
| Anchor Name           | [/search/ripplefox](https://kinexplorer.com/search/ripplefox)                                                                                                               |
| Anchor Name (Partial) | [/search/fox](https://kinexplorer.com/search/fox)                                                                                                                           |

### Misc

| Resource    | URI                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transaction | [/tx/26a568681712a44a515b2c90dcfaadb3ed2c40dc60254638407937bee4767071](https://kinexplorer.com/tx/26a568681712a44a515b2c90dcfaadb3ed2c40dc60254638407937bee4767071) |
| Ledger      | [/ledger/10000000](https://kinexplorer.com/ledger/10000000)                                                                                                         |
| Anchor      | [/anchor/apay.io](https://kinexplorer.com/anchor/apay.io)                                                                                                           |
| Asset       | [/asset/NGN](https://kinexplorer.com/asset/NGN)                                                                                                                     |

## Exploring Private / Local Development Networks<a name="private-networks"></a>

kinexplorer will connect to a local horizon instance at http://localhost:8000 by default. If your running a local private network for development this is quite handy for browsing your changes to the ledger.

Alternatively you can run locally connecting to the testnet or public network horizon instances. To do this define these aliases to localhost:

```
127.0.1.1  testnet.local     # for kinexplorer use testnet horizon
127.0.1.1  publicnet.local   # for kinexplorer use mainnet horizon
```

Navigate to http://testnet.local:3000 or http://publicnet.local:3000 to select the network your interesting in exploring.

## Development

NOTE: use npm instead of yarn to install the dependencies - see [#15](https://github.com/chatch/stellarexplorer/issues/15) for details

See the section [Exploring Private / Local Development Networks](#private-networks) for connecting to different backend networks. By default kinexplorer will look for a local instance of horizon.

Start:

```
npm i && npm start
```

Test:

```
npm i && npm test
```

Build:

```
npm i && npm run build
```

## Languages

Use the language selector in the top right corner to change the language.

Translation files are here:
https://github.com/chatch/stellarexplorer/tree/master/src/languages

Submit pull requests with new languages or languages fixes there.
