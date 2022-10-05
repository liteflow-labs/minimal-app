import { useCreateOffer } from "@nft/hooks";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import {
  chainId,
  useAccount,
  useConnect,
  useDisconnect,
  useSigner,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export default function Home() {
  const { data: signer } = useSigner();
  const [_create] = useCreateOffer(signer);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    chainId: chainId.polygonMumbai, // Polygon Mumbai
  });
  const { disconnect } = useDisconnect();
  const assetId =
    "80001-0xe3fe92dfec700e7a168f4b074ee7daca71a11397-60249402084937876423066029128237587855293854847399126862551129956955539542019"; // Pass a valid asset ID, this is a placeholder.

  const create = useCallback(async () => {
    const amount = parseFloat(prompt("amount in USDC"));
    const id = await _create({
      type: "BUY",
      assetId,
      currencyId: "80001-0x0fa8781a83e46826621b3bc094ea2a0212e71b23", // USDC on Polygon Mumbai
      expiredAt: new Date(Date.now() + 1000 * 60 * 60),
      quantity: BigNumber.from(1),
      unitPrice: BigNumber.from(amount * 1e6),
    });
    alert(id);
  }, [_create]);

  return (
    <div>
      {!isConnected ? (
        <button onClick={() => connect()}>Connect Wallet</button>
      ) : (
        <>
          <button onClick={() => disconnect()}>Disconnect Wallet</button>
          <p>Your address: {address}</p>
          <button onClick={create}>Create offer</button>
          <a
            href={`https://liteflow-nft-test-polygon-mumbai.vercel.app/tokens/${assetId}?filter=bids`} // this is a placeholder, change with your marketplace URL to see the bid.
            target="_blank"
            rel="noreferrer"
          >
            Check bids
          </a>
        </>
      )}
    </div>
  );
}
