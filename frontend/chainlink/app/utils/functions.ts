import { readContract } from "wagmi/actions";
import { config } from "./config";
import { AvalancheSenderABI, AvalancheSenderAddress } from "./constants";


export const  consoleDepositAmount = async (account:any) => {
    const result = await readContract(config, {
      abi: AvalancheSenderABI,
      address: AvalancheSenderAddress,
      functionName: "userDeposits",
      
      args: [account.address],
    });
    console.log(Number(result));
  };