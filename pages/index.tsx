import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer'
import { useCreateOffer } from '@nft/hooks'
import { BigNumber } from 'ethers'
import { useCallback, useEffect } from 'react'
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useConnect,
  useDisconnect,
  useNetwork,
  useSigner,
  chain,
  useSwitchNetwork,
} from 'wagmi'
import styles from '../styles/app.module.css'
import { injectedConnector } from '../config/wagmi'

export default function Home() {
  const { data: signer } = useSigner()
  const [_create] = useCreateOffer(
    signer as (Signer & TypedDataSigner) | undefined,
  )
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: injectedConnector, // Very important to use the same connector passed to createClient,
  })
  const { disconnect } = useDisconnect()

  const { data: blockNumberPolygonMumbai, error: blockNumberError } =
    useBlockNumber({
      chainId: chain.polygonMumbai.id, // Setting chainId is fixed since 0.6.7: https://github.com/wagmi-dev/wagmi/blob/main/packages/react/CHANGELOG.md#067
      watch: true,
    })

  useEffect(() => {
    console.error('blockNumberError', blockNumberError)
  }, [blockNumberError])

  const { chain: connectedChain, chains } = useNetwork()

  const {
    chains: chainsToSwitch,
    error: switchNetworkError,
    isLoading,
    pendingChainId,
    switchNetwork,
    switchNetworkAsync,
  } = useSwitchNetwork()

  useEffect(() => {
    console.error('switchNetworkError', switchNetworkError)
  }, [switchNetworkError])

  const { data: balancePolygonMumbai } = useBalance({
    addressOrName: address,
    chainId: chain.polygonMumbai.id,
    watch: true,
  })

  const { data: balanceGoerli } = useBalance({
    addressOrName: address,
    chainId: chain.goerli.id,
    watch: true,
  })

  const create = useCallback(async () => {
    const price = parseFloat(prompt('Price of the offer'))
    await switchNetworkAsync(chain.polygonMumbai.id) // switch to the right chain
    const id = await _create({
      type: 'BUY',
      assetId: process.env.NEXT_PUBLIC_ASSET_ID, // Pass a desired asset ID,
      currencyId: process.env.NEXT_PUBLIC_CURRENCY_ID, // Pass the desired currency ID
      expiredAt: new Date(Date.now() + 1000 * 60 * 60),
      quantity: BigNumber.from(1),
      unitPrice: BigNumber.from(price * 1e6), // Replace `1e6` by the right number of decimals of the used currency to shift the price to unit.
    })
    alert(id)
  }, [_create, switchNetworkAsync])

  return (
    <>
      <div>Last block number on Polygon Mumbai: {blockNumberPolygonMumbai}</div>
      {chains && (
        <div>
          Configured chains: {chains.map((chain) => chain.name).join(', ')}
        </div>
      )}
      {!isConnected ? (
        <button className={styles.btn} onClick={() => connect()}>
          Connect Wallet
        </button>
      ) : (
        <>
          {connectedChain && <p>Connected to {connectedChain.name}</p>}
          <p>
            Switch to:
            <br />
            {chainsToSwitch.map((x) => (
              <button
                disabled={!switchNetwork || x.id === connectedChain?.id}
                key={x.id}
                onClick={() => switchNetwork?.(x.id)}
              >
                {x.name}
                {isLoading && pendingChainId === x.id && ' (switching)'}
              </button>
            ))}
          </p>
          <p>
            My balance:
            <br />
            Polygon Mumbai: {balancePolygonMumbai?.formatted}
            <br />
            Goerli: {balanceGoerli?.formatted}
            <br />
          </p>
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
