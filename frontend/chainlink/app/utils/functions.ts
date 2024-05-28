import { readContract, writeContract } from "wagmi/actions";
import { config } from "./config";
import { AvalancheSenderABI, AvalancheSenderAddress } from "./constants";

// ReadContract Functions
export const  consoleDepositAmount = async (account:any) => {
    const result = await readContract(config, {
      abi: AvalancheSenderABI,
      address: AvalancheSenderAddress,
      functionName: "userDeposits",
      
      args: [account.address],
    });
    console.log(Number(result));
  };

// ROUTER ADDRES: 

// WriteContract Functions
export const  deposit = async (account:any, amount:any) => {
    const result = await writeContract(config, {
      abi: AvalancheSenderABI,
      address: AvalancheSenderAddress,
      functionName: "deposit",
      account: account.address,
      value: amount,
    });
    console.log(result);
  };