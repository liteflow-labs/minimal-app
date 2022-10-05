import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { useCreateOffer } from "@nft/hooks";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { useSigner } from "wagmi";
import styles from "../styles/app.module.css";

export default function Home() {
  const { data: signer } = useSigner();
  const [_create] = useCreateOffer(
    signer as (Signer & TypedDataSigner) | undefined
  );
  const assetId =
    "80001-0x7c68c3c59ceb245733a2fdeb47f5f7d6dbcc65b3-60249402084937876423066029128237587855293854847399126863606291191289075471730";

  const create = useCallback(async () => {
    const amount = parseFloat(prompt('amount in USDC'))
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
    <>
      {signer && (
        <a className={styles.btn} onClick={create}>
          Create offer
        </a>
      )}
      <a
        className={styles.btn}
        href={`https://liteflow-nft-test-polygon-mumbai.vercel.app/tokens/${assetId}?filter=bids`}
        target="_blank"
      >
        Check bids
      </a>
    </>
  );
}
