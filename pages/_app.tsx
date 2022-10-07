import styles from '../styles/app.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { AppProps } from 'next/app'
import {
  chain,
  configureChains,
  useAccount,
  createClient,
  WagmiConfig,
  useSigner,
} from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { PropsWithChildren, useEffect } from 'react'
import { useAuthenticate } from '@nft/hooks'

const { chains, provider } = configureChains(
  [chain[process.env.NEXT_PUBLIC_CHAIN_NAME]], // Pass the name of the Wagmi supported chain. See "chain" types or (https://wagmi.sh/docs/providers/configuring-chains#chains)
  [publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: process.env.NEXT_PUBLIC_APP_NAME, // Pass the name of your app
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const authLink = setContext((_, context) => {
  const address = localStorage.getItem('authorization.address')
  const authorization = localStorage.getItem(`authorization.${address}`)
  if (!authorization) return context
  return {
    ...context,
    headers: {
      ...context.headers,
      authorization: `Bearer ${authorization}`,
    },
  }
})

const apolloClient = new ApolloClient({
  link: authLink.concat(
    createHttpLink({
      uri: process.env.NEXT_PUBLIC_ENDPOINT, // Pass the API endpoint of your app
    }),
  ),
  cache: new InMemoryCache({}),
})

function AccountManager(props: PropsWithChildren) {
  const [authenticate, { loading }] = useAuthenticate()
  const { address, isConnected, isDisconnected } = useAccount()
  const { data: signer } = useSigner()

  // Authenticate the user to save the authorization token in the
  // localStorage for later use by the Apollo client
  useEffect(() => {
    if (!isConnected) return
    if (!signer) return
    if (loading) return
    if (localStorage.getItem(`authorization.${address}`)) return
    authenticate(signer).then(({ jwtToken }) => {
      localStorage.setItem('authorization.address', address)
      localStorage.setItem(`authorization.${address}`, jwtToken)
    })
  }, [authenticate, address, isConnected, signer, loading])

  // Remove authorization token when the user disconnects
  useEffect(() => {
    if (!isDisconnected) return
    const address = localStorage.getItem('authorization.address')
    localStorage.removeItem(`authorization.${address}`)
    localStorage.removeItem('authorization.address')
  }, [isDisconnected])

  return <>{props.children}</>
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ApolloProvider client={apolloClient}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} coolMode>
          <AccountManager>
            <div className={styles.app}>
              <ConnectButton />
              <Component {...pageProps} />
            </div>
          </AccountManager>
        </RainbowKitProvider>
      </WagmiConfig>
    </ApolloProvider>
  )
}

export default MyApp
