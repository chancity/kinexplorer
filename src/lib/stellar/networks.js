const networks = {
  public: 'public',
  test: 'test',
  local: 'local',
  kin3Test: 'kin3Test',
  kin3Public: 'kin3Public',
}

const hostnameToNetwork = hostname => {
  if (hostname === 'kinexplorer.com' || hostname === 'publicnet.local')
    return networks.public
  else if (hostname === 'testnet.kinexplorer.com' || hostname === 'testnet.local')
    return networks.test
  else if (hostname === 'kin3test.kinexplorer.com' || hostname === 'kin3test.local')
    return networks.kin3Test
  else if (hostname === 'kin3public.kinexplorer.com' || hostname === 'kin3public.local')
    return networks.kin3Public
  else return networks.public
}

export {networks as default, hostnameToNetwork}
