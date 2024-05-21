// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Oracle.sol";

contract EthToUsdcConverter {
    Oracle public oracle;
    IERC20 public usdcToken;
    mapping(address => uint256) public userDeposits;

    constructor(address _oracleAddress, address _usdcTokenAddress) {
        oracle = Oracle(_oracleAddress);
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        int ethUsdPrice = oracle.getThePrice();
        require(ethUsdPrice > 0, "Invalid price from oracle");
        uint256 usdAmount = (msg.value * uint256(ethUsdPrice)) / 10 ** 20;
        userDeposits[msg.sender] += usdAmount;
    }

    function withdraw() public {
        uint256 usdAmount = userDeposits[msg.sender];
        require(usdAmount > 0, "No USD amount to withdraw");

        userDeposits[msg.sender] = 0;
        bool success = usdcToken.transfer(msg.sender, usdAmount);
        require(success, "USDC transfer failed");
    }

    function withdrawForNoIsraf(uint256 value) public {
        bool success = usdcToken.transfer(msg.sender, value * 10 ** 6);
        require(success, "USDC transfer failed");
    }
}
