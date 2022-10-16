import styles from '../styles/app.module.css'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client'
import { AppProps } from 'next/app'
import { useAccount, WagmiConfig, useDisconnect } from 'wagmi'
import { PropsWithChildren } from 'react'
import { useAuthenticate } from '@nft/hooks'
import { wagmiClient } from '../config/wagmi'

// create logic to inject the authorization header to Apollo client using local storage
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

// init Apollo client
const apolloClient = new ApolloClient({
  link: authLink.concat(
    createHttpLink({
      uri: process.env.NEXT_PUBLIC_ENDPOINT, // Pass the API endpoint of your app
    }),
  ),
  cache: new InMemoryCache({}),
})

function AccountManager(props: PropsWithChildren<{}>) {
  const [authenticate] = useAuthenticate()
  const { disconnect } = useDisconnect()
  useAccount({
    async onConnect({ address, connector }) {
      // check if user is already authenticated, not only if its wallet is connected
      if (
        localStorage.getItem('authorization.address') === address &&
        localStorage.getItem(`authorization.${address}`)
      ) {
        // TODO: should check the expiration date of the jwt token to make sure it's still valid
        return
      }

      // authenticate user
      const signer = await connector.getSigner()
      authenticate(signer)
        .then(({ jwtToken }) => {
          localStorage.setItem('authorization.address', address)
          localStorage.setItem(`authorization.${address}`, jwtToken)
          console.log('user authenticated')
        })
        .catch((error) => {
          console.error(error)

          // disconnect wallet on error
          disconnect()
        })
    },
    onDisconnect() {
      // FIXME: this is randomly trigger if auto-connect is true: https://github.com/wagmi-dev/wagmi/pull/1091
      // remove authorization data
      console.log('onDisconnect')
      const address = localStorage.getItem('authorization.address')
      localStorage.removeItem(`authorization.${address}`)
      localStorage.removeItem('authorization.address')
    },
  })

  return <>{props.children}</>
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ApolloProvider client={apolloClient}>
      <WagmiConfig client={wagmiClient}>
        <AccountManager>
          <div className={styles.app}>
            <Component {...pageProps} />
          </div>
        </AccountManager>
      </WagmiConfig>
    </ApolloProvider>
  )
}

export default MyApp
