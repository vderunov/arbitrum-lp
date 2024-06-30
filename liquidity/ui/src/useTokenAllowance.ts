import { useQuery } from '@tanstack/react-query';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { ethers } from 'ethers';
import { fetchTokenAllowance } from './fetchTokenAllowance';

export function useTokenAllowance({
  tokenAddress,
  ownerAddress,
  spenderAddress,
}: {
  tokenAddress?: string;
  ownerAddress?: string;
  spenderAddress?: string;
}) {
  const [{ connectedChain }] = useSetChain();
  const [{ wallet }] = useConnectWallet();
  return useQuery({
    enabled: Boolean(
      connectedChain?.id && wallet?.provider && tokenAddress && ownerAddress && spenderAddress
    ),
    queryKey: [connectedChain?.id, 'Allowance', { tokenAddress, ownerAddress, spenderAddress }],
    queryFn: async () => {
      if (!(connectedChain?.id && wallet && tokenAddress && ownerAddress && spenderAddress)) {
        throw 'OMFG';
      }
      return fetchTokenAllowance({ wallet, tokenAddress, ownerAddress, spenderAddress });
    },
    select: (allowance) => ethers.BigNumber.from(allowance),
    refetchInterval: 5 * 60 * 1000,
  });
}
