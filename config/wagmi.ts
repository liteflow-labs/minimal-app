import { configureChains, createClient, allChains, chain } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'

// init provider and chains
const { provider, chains } = configureChains(
  [chain.mainnet, chain.polygonMumbai, chain.goerli],
  [publicProvider()],
)

// init connectors
export const injectedConnector = new InjectedConnector({ chains }) // Very important to set the chains, otherwise client and hooks return wrong array of chains. Default in createClient is `[new InjectedConnector()]`

// create Wagmi client
export const wagmiClient = createClient({
  autoConnect: true,
  provider: provider,
  connectors: [injectedConnector],
})
