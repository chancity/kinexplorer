const networks = {
  public: 'public',
  test: 'test',
  local: 'local',
}

const hostnameToNetwork = hostname => {
  if (hostname === 'kinexplorer.com' || hostname === 'publicnet.local')
    return networks.public
  else if (hostname === 'testnet.kinexplorer.com' || hostname === 'testnet.local')
    return networks.test
  else return networks.local
}

export {networks as default, hostnameToNetwork}
