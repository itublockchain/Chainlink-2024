"use client";
import React, { useState } from "react";
import Image from "next/image";

const networks = [
  { name: "Ethereum", logo: "/eth-logo.png" },
  { name: "Optimism", logo: "/op-logo.png" },
  { name: "Polygon", logo: "/polygon-logo.png" },
  { name: "Avalanche", logo: "/avalanche-logo.png" },
  { name: "Arbitrum", logo: "/arb-logo.png" },
];

const NetworkModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-black bg-opacity-50 p-8 rounded text-white">
        <h2 className="text-2xl mb-4">Select a Network</h2>
        <ul className="space-y-4">
          {networks.map((network) => (
            <li
              key={network.name}
              className="cursor-pointer flex flex-row text-lg"
              onClick={() => onSelect(network)}
            >
              <Image
                src={network.logo}
                alt="network logo"
                width={30}
                height={30}
                className="mr-2"
              />
              {network.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setIsModalOpen(false);
  };

  return (
    <div className="mt-8 mb-12">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-row space-x-4 pl-80 items-center">
          <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center">
            {selectedNetwork && (
              <Image
                src={selectedNetwork.logo}
                alt={selectedNetwork.name}
                width={40}
                height={40}
              />
            )}
          </div>
          <p
            className="flex text-center text-white items-center text-xl cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            {selectedNetwork && selectedNetwork.name} Market
            <svg
              width="12px"
              height="12px"
              viewBox="0 -4.5 20 20"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              className="ml-2"
            >
              <title>arrow_down [#339]</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
              <g
                id="Page-1"
                stroke="none"
                strokeWidth="1"
                fill="none"
                fillRule="evenodd"
              >
                <g
                  id="Dribbble-Light-Preview"
                  transform="translate(-180.000000, -6684.000000)"
                  fill="#FFFFFF"
                >
                  <g id="icons" transform="translate(56.000000, 160.000000)">
                    <path
                      d="M144,6525.39 L142.594,6524 L133.987,6532.261 L133.069,6531.38 L133.074,6531.385 L125.427,6524.045 L124,6525.414 C126.113,6527.443 132.014,6533.107 133.987,6535 C135.453,6533.594 134.024,6534.965 144,6525.39"
                      id="arrow_down-[#339]"
                    ></path>
                  </g>
                </g>
              </g>
            </svg>
          </p>
        </div>
        <div className="flex flex-col space-y-10">
          <div className="flex flex-row justify-center space-x-10">
            <div className="flex bg-white bg-opacity-85 w-[600px] h-44 rounded-xl flex-col">
              <p className="text-3xl p-6">Your Supplies</p>
              <p className="text-lg text-gray-600 p-6">Nothing supplied yet</p>
            </div>
            <div className="flex bg-white bg-opacity-85 w-[600px] h-44 rounded-xl flex-col">
              <p className="text-3xl p-6">Your Borrows</p>
              <p className="text-lg text-gray-600 p-6">Nothing borrow yet</p>
            </div>
          </div>
          <div className="flex flex-row justify-center space-x-10">
            <div className="flex bg-white bg-opacity-85 w-[600px] h-[500px] rounded-xl"></div>
            <div className="flex bg-white bg-opacity-85 w-[600px] h-[500px] rounded-xl"></div>
          </div>
        </div>
        <NetworkModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleNetworkSelect}
        />
      </div>
    </div>
  );
};

export default Dashboard;
