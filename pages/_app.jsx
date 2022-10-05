import { setContext } from "@apollo/client/link/context";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  chain,
  configureChains,
  useAccount,
  createClient,
  WagmiConfig,
  useSigner,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { useEffect } from "react";
import { useAuthenticate } from "@nft/hooks";

const { provider } = configureChains(
  [chain.polygonMumbai], // we want Polygon Mumbai
  [publicProvider()]
);

const wagmiClient = createClient({
  autoConnect: true,
  provider,
});

const authLink = setContext((_, context) => {
  const address = localStorage.getItem("authorization.address");
  const authorization = localStorage.getItem(`authorization.${address}`);
  if (!authorization) return context;
  return {
    ...context,
    headers: {
      ...context.headers,
      authorization: `Bearer ${authorization}`,
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

function AccountManager(props) {
  const [authenticate, { loading }] = useAuthenticate();
  const { address, isConnected, isDisconnected } = useAccount();
  const { data: signer } = useSigner();

  // Authenticate the user to save the authorization token in the
  // localStorage for later use by the Apollo client
  useEffect(() => {
    if (!isConnected) return;
    if (!signer) return;
    if (loading) return;
    if (localStorage.getItem(`authorization.${address}`)) return;
    authenticate(signer).then(({ jwtToken }) => {
      localStorage.setItem("authorization.address", address);
      localStorage.setItem(`authorization.${address}`, jwtToken);
    });
  }, [address, isConnected, signer, loading]);

  // Remove authorization token when the user disconnects
  useEffect(() => {
    if (!isDisconnected) return;
    const address = localStorage.getItem("authorization.address");
    localStorage.removeItem(`authorization.${address}`);
    localStorage.removeItem("authorization.address");
  }, [isDisconnected]);

  return <>{props.children}</>;
}

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={apolloClient}>
      <WagmiConfig client={wagmiClient}>
        <AccountManager>
          <div>
            <Component {...pageProps} />
          </div>
        </AccountManager>
      </WagmiConfig>
    </ApolloProvider>
  );
}

export default MyApp;
