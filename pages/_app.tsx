import styles from "../styles/app.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { AppProps } from "next/app";
import {
  chain,
  configureChains,
  useAccount,
  createClient,
  WagmiConfig,
  useSigner,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { PropsWithChildren, useEffect } from "react";
import { useAuthenticate } from "@nft/hooks";

const { chains, provider } = configureChains(
  [chain.ropsten],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({ appName: "Test", chains });

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const authLink = setContext((_, context) => {
  const authorization = localStorage.getItem("authorization");
  return {
    ...context,
    headers: {
      ...context.headers,
      authorization: authorization ? `Bearer ${authorization}` : undefined,
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(
    createHttpLink({
      uri: process.env.NEXT_PUBLIC_ENDPOINT,
    })
  ),
  cache: new InMemoryCache({}),
});

function AccountManager(props: PropsWithChildren) {
  const [authenticate, { loading }] = useAuthenticate();
  const { isConnected, isDisconnected } = useAccount();
  const { data: signer } = useSigner();

  // Authenticate the user to save the authorization token in the
  // localStorage for later use by the Apollo client
  useEffect(() => {
    if (!isConnected) return;
    if (!signer) return;
    if (loading) return;
    authenticate(signer).then(({ jwtToken }) =>
      localStorage.setItem("authorization", jwtToken)
    );
  }, [isConnected, signer]);

  // Remove authorization token when the user disconnects
  useEffect(() => {
    if (!isDisconnected) return;
    localStorage.removeItem("authorization");
  });

  return <>{props.children}</>;
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
  );
}

export default MyApp;
