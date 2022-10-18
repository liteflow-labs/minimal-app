import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer'
import { useCreateOffer } from '@nft/hooks'
import { BigNumber } from 'ethers'
import { useCallback } from 'react'
import { chain, useAccount, useConnect, useDisconnect, useSigner } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import styles from '../styles/app.module.css'

export default function Home() {
  const { data: signer } = useSigner()
  const [_create] = useCreateOffer(
    signer as (Signer & TypedDataSigner) | undefined,
  )
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    chainId: chain[process.env.NEXT_PUBLIC_CHAIN_NAME].id, // Pass the name of the Wagmi supported chain. See "chain" types or (https://wagmi.sh/docs/providers/configuring-chains#chains)
  })
  const { disconnect } = useDisconnect()

  const create = useCallback(async () => {
    const price = parseFloat(prompt('Price of the offer'))
    const id = await _create({
      type: 'BUY',
      assetId: process.env.NEXT_PUBLIC_ASSET_ID, // Pass a desired asset ID,
      currencyId: process.env.NEXT_PUBLIC_CURRENCY_ID, // Pass the desired currency ID
      expiredAt: new Date(Date.now() + 1000 * 60 * 60),
      quantity: BigNumber.from(1),
      unitPrice: BigNumber.from(price * 1e6), // Replace `1e6` by the right number of decimals of the used currency to shift the price to unit.
    })
    alert(id)
  }, [_create])

  return (
    <>
      {!isConnected ? (
        <button className={styles.btn} onClick={() => connect()}>
          Connect Wallet
        </button>
      ) : (
        <>
          <button className={styles.btn} onClick={() => disconnect()}>
            Disconnect Wallet
          </button>
          <p>Your address: {address}</p>
          <button className={styles.btn} onClick={create}>
            Create offer
          </button>
        </>
      )}
    </>
  )
}
