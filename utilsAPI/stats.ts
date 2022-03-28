import { getInfuraRPCUrl } from '@lido-sdk/fetch';
import { BigNumber, Contract, providers, utils } from 'ethers';

import { getLidoMaticAddress, getMaticAddress } from 'config';

import getConfig from 'next/config';

import ILidoMatic from '../abi/StMATIC.json';
import { formatBalance } from 'utils';

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

const { ethplorerMainnetUrl, defaultChain } = publicRuntimeConfig;
const { infuraApiKey } = serverRuntimeConfig;
const lidoMaticAddress = getLidoMaticAddress(+defaultChain);
const maticAddress = getMaticAddress(+defaultChain);

export const getApr = async (): Promise<number> => {
  const apr = 18;
  return new Promise(resolve => setTimeout(() => resolve(apr), 100))
}

export const getRate = async () => {
  const { price: { rate } = { rate: 1.6 } } = await fetch(
    `${ethplorerMainnetUrl}getTokenInfo/${maticAddress}?apiKey=${process.env.ETHPLORER_MAINNET_API_KEY}`,
  ).then((res) => res.json());

  return rate;
};

export const getHoldersCount = async () => {
  const { holdersCount = 100 } = await fetch(
    `${ethplorerMainnetUrl}getTokenInfo/${lidoMaticAddress}?apiKey=${process.env.ETHPLORER_MAINNET_API_KEY}`,
  ).then((res) => res.json());

  return holdersCount;
};

export const getTotalPooledMatic = async () => {
  const provider = new providers.JsonRpcProvider({
    url: getInfuraRPCUrl(+defaultChain, infuraApiKey),
  });

  const contract = new Contract(lidoMaticAddress, ILidoMatic.abi, provider);

  const totalPooledMatic = await contract.getTotalPooledMatic();

  return (+utils.formatEther(totalPooledMatic));
};

export const getTotalStMaticSupply = async () => {
  const provider = new providers.JsonRpcProvider({
    url: getInfuraRPCUrl(+defaultChain, infuraApiKey),
  });

  const contract = new Contract(lidoMaticAddress, ILidoMatic.abi, provider);

  const totalStMaticSupply = await contract
    .totalSupply()
    .then((res: BigNumber) => formatBalance(res));

  return totalStMaticSupply;
};
