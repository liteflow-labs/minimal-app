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
    "3-0xdf5b1a360f64fa8a6702efa8fe41946972ba5a7a-82153703594476779040147787829905511244693377253089187464282670230128051716726";

  const create = useCallback(async () => {
    const amount = parseFloat(prompt("amount in USDC"));
    const id = await _create({
      type: "BUY",
      assetId,
      currencyId: "3-0x07865c6e87b9f70255377e024ace6630c1eaa37f",
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
          create offer
        </a>
      )}
      <a
        className={styles.btn}
        href="https://nft-test-ropsten-liteflow.vercel.app/tokens/3-0xdf5b1a360f64fa8a6702efa8fe41946972ba5a7a-82153703594476779040147787829905511244693377253089187464282670230128051716726?filter=bids"
        target="_blank"
      >
        Check my bid
      </a>
    </>
  );
}
