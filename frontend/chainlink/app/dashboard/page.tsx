"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

const networks = [
  { name: "OP Sepolia", image: "/op-logo.png", selector: "opsepoliaSelector" },
  { name: "Avalanche Fuji", image: "/avalanche-logo.png", selector: "avalancheSelector" },
  { name: "Arbitrum", image: "/arb-logo.png", selector: "arbitrumSelector" },
  { name: "Polygon Amoy", image: "/polygon-logo.png", selector: "polygonSelector" },
  {name:"Sepolia", image:"/eth-logo.png", selector:"sepoliaSelector"}
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
import { useAccount } from "wagmi";
import { consoleDepositAmount, deposit, redeem, withdraw } from "../utils/functions";
import { parseEther, parseUnits } from "viem";
import { avalancheFuji } from "wagmi/chains";

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
        chainId: avalancheFuji.id,
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

  const openModal = (selection) => {
    setActiveSelection(selection);
    setShowModal(true);
  };

  const getSelector = (networkName) => {
    const network = networks.find((net) => net.name === networkName);
    if (network) {
      switch (network.selector) {
        case "sepoliaSelector":
          return sepoliaSelector;
        case "avalancheSelector":
          return avalancheSelector;
        case "polygonSelector":
          return polygonSelector;
        default:
          return null;
      }
    }
    return null;
  };



  return (
    <div className="flex flex-col space-y-10 mt-10 justify-center items-center text-center">
      <div className="flex flex-col justify-center items-center text-center w-[600px] h-[300px] bg-white opacity-85 rounded-3xl space-y-8">
        <div className="flex justify-center border-2 border-black text-center items-center w-[250px] h-[60px] rounded-2xl">
          Total Money:{" "}
          {avalancheMoney !== null ? `$${avalancheMoney}` : "Loading..."}
        </div>
        <div className="flex justify-center items-center text-center border-2 border-black w-[500px] h-[40px] rounded-2xl">
          Avalanche Fuji:{" "}
          {avalancheMoney !== null ? `$${avalancheMoney}` : "Loading..."}
        </div>
        <div className="flex justify-center items-center text-center border-2 border-black w-[500px] h-[40px] rounded-2xl">
          Polygon Amoy: $5.345
        </div>
        <div className="flex justify-center items-center text-center border-2 border-black w-[500px] h-[40px] rounded-2xl">
          OP Sepolia : $0
        </div>
      </div>
      <div className="flex flex-col justify-center items-center text-center w-[1000px] h-[350px] bg-white opacity-85 rounded-3xl space-y-6">
        <div className="flex flex-row w-[900px] h-[80px] justify-around items-center text-center border-2 border-black rounded-3xl ">
          <div
            className="flex items-center border-2 border-black rounded-3xl w-[200px] h-[40px] text-center justify-center cursor-pointer"
            onClick={() => openModal(1)}
          >
            {selectedNetwork1 || "Select Network"}
          </div>
          <Image src={"/arrow2.png"} alt="arrow" width={300} height={300} />
          <div
            className="flex items-center border-2 border-black rounded-3xl w-[200px] h-[40px] text-center justify-center cursor-pointer"
            onClick={() => openModal(2)}
          >
            {selectedNetwork2 || "Select Network"}
          </div>
        </div>
        <button className="flex justify-center text-center items-center bg-[#44878B] w-64 h-12 rounded-3xl font-bold"
        onClick={()=>withdraw(getSelector(selectedNetwork1), account.address, parseUnits("0.9", 6))}>
          Withdraw
        </button>
        <button className="flex justify-center text-center items-center bg-[#44878B] w-64 h-12 rounded-3xl font-bold"
        onClick={()=>redeem(account)}>
          Redeem
        </button>
        <button
          className="flex justify-center text-center items-center bg-[#44878B] w-64 h-12 rounded-3xl font-bold"
          onClick={() => consoleDepositAmount(account)}
        >
          Console Deposit
        </button>
        <button
          className="flex justify-center text-center items-center bg-[#44878B] w-64 h-12 rounded-3xl font-bold"
          onClick={() => deposit(account, parseEther("0.002"))}
        >
          Deposit
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-3xl space-y-4">
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
  );
};

export default Dashboard;
