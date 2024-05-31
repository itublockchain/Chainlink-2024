"use client";
//@ts-nocheck
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

const networks = [
  { name: "OP Sepolia", image: "/op-logo.png" },
  { name: "Avalanche Fuji", image: "/avalanche-logo.png" },
  { name: "Arbitrum", image: "/arb-logo.png" },
  { name: "Polygon Amoy", image: "/polygon-logo.png" },
  { name: "Sepolia", image: "/eth-logo.png" },
];

import { readContract } from "wagmi/actions";
import { config } from "../utils/config";
import {
  AvalancheSenderABI,
  AvalancheSenderAddress,
  sepoliaSelector,
  SepoliaStakerABI,
  SepoliaStakerAddress,
  avalancheSelector,
  polygonSelector,
} from "../utils/constants";
import { avalancheFuji } from "viem/chains";
import { useAccount } from "wagmi";
import {
  consoleDepositAmount,
  deposit,
  redeem,
  withdraw,
} from "../utils/functions";
import { parseEther, parseUnits } from "viem";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNetwork1, setSelectedNetwork1] = useState("");
  const [selectedNetwork2, setSelectedNetwork2] = useState("");
  const [activeSelection, setActiveSelection] = useState(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [avalancheMoney, setAvalancheMoney] = useState(null as any);
  const [totalMoney, setTotalMoney] = useState(null as any);
  const account = useAccount();

  const { isLoading, isPending, refetch } = useQuery({
    queryKey: ["avalancheMoney"],
    refetchOnMount: false,
    enabled: isFirstRender,
    queryFn: async () => {
      const result = await readContract(config, {
        abi: AvalancheSenderABI,
        address: AvalancheSenderAddress,
        functionName: "userDeposits",
        args: [account.address],
      });
      setAvalancheMoney(Number(result) / 1000000);
      console.log(Number(result));
    },
  });
  console.log(isLoading, isPending);
  console.log(Number(parseUnits("0.9", 6)));

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  const handleNetworkClick = (network) => {
    if (activeSelection === 1) {
      setSelectedNetwork1(network.name);
    } else if (activeSelection === 2) {
      setSelectedNetwork2(network.name);
    }
    setShowModal(false);
  };

  const getSelector = (networkName) => {
    switch (networkName) {
      case "OP Sepolia":
        return sepoliaSelector;
      case "Avalanche Fuji":
        return avalancheSelector;
      case "Polygon Amoy":
        return polygonSelector;
      default:
        return sepoliaSelector;
    }
  };

  const openModal = (selection) => {
    setActiveSelection(selection);
    setShowModal(true);
  };

  const handleWithdraw = () => {
    const selector = getSelector(selectedNetwork1);
    console.log("Selected Network 1:", selectedNetwork1);
    console.log("Selector:", selector);
    withdraw(selector, account.address, parseUnits("0.9", 6));
  };

  return (
    <div className="flex flex-row justify-center">
      <div className="relative w-1/4 h-96">
        <Image
          src={"/dragonleft.png"}
          alt="dragon"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div className="flex flex-col space-y-10 mt-10 justify-center items-center text-center">
        <div className="flex flex-col justify-center items-center text-center w-[600px] h-[300px] bg-[#E0C7EC] bg-opacity-50 rounded-3xl space-y-8">
          <div className="flex bg-[#E0C7EC] bg-opacity-80 justify-center border-2 border-black text-center items-center w-[250px] h-[60px] rounded-2xl font-bold">
            Total Money:{" "}
            {avalancheMoney !== null ? `$${avalancheMoney}` : "Loading..."}
          </div>
          <div className="flex bg-[#E0C7EC] bg-opacity-80 justify-center items-center text-center border-2 border-black w-[500px] h-[40px] rounded-2xl font-bold">
            Avalanche Fuji:{" "}
            {avalancheMoney !== null ? `$${avalancheMoney}` : "Loading..."}
          </div>
          <div className="flex bg-[#E0C7EC] bg-opacity-80 justify-center items-center text-center border-2 border-black w-[500px] h-[40px] rounded-2xl font-bold">
            Polygon Amoy: $5.345
          </div>
          <div className="flex bg-[#E0C7EC] bg-opacity-80 justify-center items-center text-center border-2 border-black w-[500px] h-[40px] rounded-2xl font-bold">
            OP Sepolia : $0
          </div>
        </div>
        <div className="flex flex-col justify-center items-center text-center w-[1000px] h-[350px] bg-[#E0C7EC] border-2 border-black bg-opacity-50 rounded-3xl space-y-6">
          <div className="flex flex-row w-[900px] h-[80px] justify-around items-center text-center  rounded-3xl ">
            <div
              className="flex items-center bg-[#E0C7EC] bg-opacity-80 border-2 border-black rounded-xl w-[250px] h-[45px] text-center justify-center cursor-pointer text-lg font-bold"
              onClick={() => openModal(1)}
            >
              {selectedNetwork1 || "Select Network"}
            </div>
            <Image src={"/arrow2.png"} alt="arrow" width={300} height={300} />
            <div
              className="flex items-center bg-[#E0C7EC] bg-opacity-80 border-2 border-black rounded-xl w-[250px] h-[45px] text-center justify-center cursor-pointer text-lg font-bold"
              onClick={() => openModal(2)}
            >
              {selectedNetwork2 || "Select Network"}
            </div>
          </div>
          <button
            className="flex justify-center text-center items-center bg-[#E0C7EC] bg-opacity-80 border-2 border-black w-64 h-12 rounded-2xl font-bold"
            onClick={handleWithdraw}
          >
            Withdraw
          </button>
          {/* <button className="flex justify-center text-center items-center bg-[#44878B] w-64 h-12 rounded-3xl font-bold"
          onClick={() => redeem(account)}>
          Redeem
        </button> */}
          {/* <button
          className="flex justify-center text-center items-center bg-[#44878B] w-64 h-12 rounded-3xl font-bold"
          onClick={() => refetch()}
        >
          Console Deposit
        </button> */}
          <button
            className="flex justify-center text-center items-center bg-[#E0C7EC] bg-opacity-80  border-2 border-black w-64 h-12 rounded-2xl font-bold"
            onClick={() => deposit(account, parseEther("0.002"))}
          >
            Deposit
          </button>
        </div>

        {showModal && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white p-6 rounded-3xl space-y-4"
              onClick={(e) => e.stopPropagation()} 
            >
              <h2 className="text-2xl font-bold">Select a Network</h2>
              {networks.map((network) => (
                <div
                  key={network.name}
                  className="flex items-center space-x-4 border-2 border-black rounded-3xl w-[250px] h-[60px] text-center justify-center cursor-pointer"
                  onClick={() => handleNetworkClick(network)}
                >
                  <Image
                    src={network.image}
                    alt={network.name}
                    width={40}
                    height={40}
                  />
                  <span>{network.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="relative w-1/4 h-96">
        <Image
          src={"/dragonright.png"}
          alt="dragon"
          layout="fill"
          objectFit="contain"
        />
      </div>
    </div>
  );
};

export default Dashboard;
