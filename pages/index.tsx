import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer'
import { useCreateOffer } from '@nft/hooks'
import { BigNumber } from 'ethers'
import { useCallback } from 'react'
import { useSigner } from 'wagmi'
import styles from '../styles/app.module.css'

export default function Home() {
  const { data: signer } = useSigner()
  const [_create] = useCreateOffer(
    signer as (Signer & TypedDataSigner) | undefined,
  )

  const create = useCallback(async () => {
    const amount = parseFloat(prompt('amount in USDC'))
    const id = await _create({
      type: 'BUY',
      assetId: process.env.NEXT_PUBLIC_ASSET_ID, // Pass a desired asset ID,
      currencyId: process.env.NEXT_PUBLIC_CURRENCY_ID, // Pass the desired currency ID
      expiredAt: new Date(Date.now() + 1000 * 60 * 60),
      quantity: BigNumber.from(1),
      unitPrice: BigNumber.from(amount * 1e6),
    })
    alert(id)
  }, [_create])

  return (
    <>
      {signer && (
        <a className={styles.btn} onClick={create}>
          Create offer
        </a>
      )}
    </>
  )
}
