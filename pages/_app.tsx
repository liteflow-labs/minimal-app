import styles from "../styles/app.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { AppProps } from "next/app";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

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

const apolloClient = new ApolloClient({
  link: createHttpLink({
    uri: process.env.NEXT_PUBLIC_ENDPOINT,
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
    },
  }),
  cache: new InMemoryCache({}),
});

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ApolloProvider client={apolloClient}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} coolMode>
          <div className={styles.app}>
            <ConnectButton />
            <Component {...pageProps} />
          </div>
        </RainbowKitProvider>
      </WagmiConfig>
    </ApolloProvider>
  );
}

export default MyApp;
