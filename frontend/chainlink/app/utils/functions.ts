import { readContract, writeContract } from "wagmi/actions";
import { config } from "./config";
import {
  AvalancheSenderABI,
  AvalancheSenderAddress,
  SepoliaStakerABI,
  SepoliaStakerAddress,
} from "./constants";
import { type WriteContractReturnType } from "@wagmi/core";
import { avalancheFuji } from "viem/chains";

// ReadContract Functions
export const consoleDepositAmount = async (account: any) => {
  const result = await readContract(config, {
    abi: AvalancheSenderABI,
    address: AvalancheSenderAddress,
    functionName: "userDeposits",
    chainId: avalancheFuji.id,
    args: [account.address],
  });
  console.log(Number(result));
};

// ROUTER ADDRES:

// WriteContract Functions
export const deposit = async (account: any, amount: any) => {
  const result = await writeContract(config, {
    abi: AvalancheSenderABI,
    address: AvalancheSenderAddress,
    functionName: "deposit",
    account: account.address,
    value: amount,
  });
  console.log(result);
};

export const withdraw = async (destination: any, account: any, amount: any) => {
  try {
    const result = await writeContract(config, {
      abi: AvalancheSenderABI,
      address: AvalancheSenderAddress,
      functionName: "sendMessagePayLINK",
      args: [destination, account, amount],
      account: account,
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

export const redeem = async (account: any) => {
  try {
    const result = await writeContract(config, {
      abi: SepoliaStakerABI,
      address: SepoliaStakerAddress,
      functionName: "redeem",
      account: account.address,
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
