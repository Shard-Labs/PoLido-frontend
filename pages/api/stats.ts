import type { NextApiRequest, NextApiResponse } from 'next';

import { getInfuraRPCUrl } from '@lido-sdk/fetch';
import { BigNumber, Contract, providers, utils } from 'ethers';

import { getLidoMaticAddress } from 'config';

import getConfig from 'next/config';

import ILidoMatic from '../../abi/StMATIC.json';
import { formatBalance } from 'utils';

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const { ethplorerMainnetUrl, defaultChain } = publicRuntimeConfig;
  const { infuraApiKey } = serverRuntimeConfig;

  const {
    price: { rate },
    holdersCount,
  } = await fetch(
    `${ethplorerMainnetUrl}getTokenInfo/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0?apiKey=${process.env.ETHPLORER_MAINNET_API_KEY}`,
  ).then((res) => res.json());

  const provider = new providers.JsonRpcProvider({
    url: getInfuraRPCUrl(+defaultChain, infuraApiKey),
  });

  const contract = new Contract(
    getLidoMaticAddress(+defaultChain),
    ILidoMatic.abi,
    provider,
  );

  const totalPooledMatic = await contract.getTotalPooledMatic();
  const totalStMatic = await contract
    .convertMaticToStMatic(totalPooledMatic.toString())
    .then(([res]: BigNumber[]) => formatBalance(res));

  const formattedPooledMatic = +utils.formatEther(totalPooledMatic);

  const data = {
    maticPriceInUsd: rate,
    numberOfStMaticAccounts: holdersCount,
    totalMaticStaked: {
      matic: formattedPooledMatic,
      usd: formattedPooledMatic * rate,
    },
    totalRewards: {
      stMATIC: formattedPooledMatic - totalStMatic,
      usd: (formattedPooledMatic - totalStMatic) * rate,
    },
  };
  res.status(200).json(data);
}
