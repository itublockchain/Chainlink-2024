"use client";
import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

const Header = () => {
  return (
    <>
      <header className="z-[999] sticky top-0 bg-transparent">
        <div className="flex flex-row justify-around h-24 items-center border-b-2 border-white border-opacity-65">
          <Link href={"/"}>
            <h1 className="text-white text-xl">Fusionlink</h1>
          </Link>
          <div className="flex flex-row space-x-24">
            <Link href={"/dashboard"}>
              <h1 className="text-white text-xl">Dashboard</h1>
            </Link>
            <h1 className="text-white text-xl">Markets</h1>
            <h1 className="text-white text-xl">Profile</h1>
            <h1 className="text-white text-xl">FAQ</h1>
          </div>
          {/* <button className="text-black w-40 h-12 rounded-2xl bg-white opacity-80 text-xl">Launch App</button> */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => (
              <div
                {...(!mounted && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {!mounted || !account || !chain ? (
                  <button
                    className="customNavConnectButton"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                ) : chain.unsupported ? (
                  <button
                    className="customNavConnectButton"
                    onClick={openChainModal}
                    type="button"
                  >
                    Wrong network
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      className="customNavConnectButton"
                      onClick={openChainModal}
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            overflow: "hidden",
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <Image
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              width={24}
                              height={24}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button
                      className="customNavConnectButton"
                      onClick={openAccountModal}
                      type="button"
                    >
                      {account.displayName}
                      {account.displayBalance && ` (${account.displayBalance})`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </ConnectButton.Custom>
        </div>
      </header>
    </>
  );
};

export default Header;
