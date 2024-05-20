import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <>
      <header className="z-[999] sticky top-0 bg-transparent">
        <div className="flex flex-row justify-around h-24 items-center border-b-2 border-white border-opacity-65">
          <h1 className="text-white text-xl">ABC</h1>
          <div className="flex flex-row space-x-24">
            <h1 className="text-white text-xl">Protocol</h1>
            <h1 className="text-white text-xl">Ecosystem</h1>
            <h1 className="text-white text-xl">Governance</h1>
            <h1 className="text-white text-xl">Security</h1>
            <h1 className="text-white text-xl">FAQ</h1>
          </div>
          <button className="text-black w-40 h-12 rounded-2xl bg-white opacity-80 text-xl">Launch App</button>
        </div>
      </header>
    </>
  );
};

export default Header;
