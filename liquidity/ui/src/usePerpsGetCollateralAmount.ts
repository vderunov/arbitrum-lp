import { useParams } from '@snx-v3/useParams';
import { useImportContract, usePerpsSelectedAccountId, useSynthetix } from '@synthetixio/react-sdk';
import { useQuery } from '@tanstack/react-query';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { ethers } from 'ethers';
import { useProvider } from './useProvider';

const USDx_MARKET_ID = 0;

export function usePerpsGetCollateralAmount() {
  const { chainId } = useSynthetix();
  const [{ connectedChain }] = useSetChain();
  const [{ wallet }] = useConnectWallet();
  const walletAddress = wallet?.accounts?.[0]?.address;
  const [params] = useParams();
  const provider = useProvider();
  const perpsAccountId = usePerpsSelectedAccountId({ provider, walletAddress, perpsAccountId: params.perpsAccountId });
  const { data: PerpsMarketProxyContract } = useImportContract('PerpsMarketProxy');

  const isChainReady = connectedChain?.id && chainId && chainId === Number.parseInt(connectedChain?.id, 16);

  return useQuery({
    enabled: Boolean(isChainReady && PerpsMarketProxyContract?.address && wallet?.provider && perpsAccountId),
    queryKey: [
      chainId,
      'GetPerpsCollateralAmount',
      { PerpsMarketProxy: PerpsMarketProxyContract?.address },
      { collateral: USDx_MARKET_ID },
      perpsAccountId,
    ],
    queryFn: async () => {
      if (!(isChainReady && PerpsMarketProxyContract?.address && wallet?.provider && perpsAccountId)) {
        throw 'OMFG';
      }

      const provider = new ethers.providers.Web3Provider(wallet.provider);
      const PerpsMarketProxy = new ethers.Contract(PerpsMarketProxyContract.address, PerpsMarketProxyContract.abi, provider);
      const result = await PerpsMarketProxy.getCollateralAmount(perpsAccountId, USDx_MARKET_ID);
      return result;
    },
  });
}
