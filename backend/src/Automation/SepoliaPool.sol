// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {AvalancheSender} from "./AvalancheSender.sol";

// Sepolia ROUTER: 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59
// Sepolia LINK: 0x779877A7B0D9E8603169DdbD7836e478b4624789
// Sepolia USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

// SEPOLIA Destination: 16015286601757825753
// AVALANCHE Destination: 14767482510784806043
// 0.027 = 27000000000000000

/// @title - A simple messenger contract for transferring tokens to a receiver  that calls a staker contract.
contract Pool is OwnerIsCreator, AutomationCompatibleInterface {
    using SafeERC20 for IERC20;

    // Custom errors to provide more descriptive revert messages.
    error InvalidRouter(); // Used when the router address is 0
    error InvalidLinkToken(); // Used when the link token address is 0
    error InvalidUsdcToken(); // Used when the usdc token address is 0
    error InvalidNumberOfDecimals(); // Used when the number of decimals is 0
    error InvalidBeneficiary(); // Used when the beneficiary address is 0
    error InvalidAmount(); // Used when the amount is 0
    error NothingToRedeem(); // Used when the balance of Staker tokens is 0
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance to cover the fees.
    error NothingToWithdraw(); // Used when trying to withdraw Ether but there's nothing to withdraw.
    error InvalidDestinationChain(); // Used when the destination chain selector is 0.
    error InvalidReceiverAddress(); // Used when the receiver address is 0.
    error NoReceiverOnDestinationChain(uint64 destinationChainSelector); // Used when the receiver address is 0 for a given destination chain.
    error AmountIsZero(); // Used if the amount to transfer is 0.
    error InvalidGasLimit(); // Used if the gas limit is 0.
    error NoGasLimitOnDestinationChain(uint64 destinationChainSelector); // Used when the gas limit is 0.

    // Event emitted when a message is sent to another chain.
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address indexed receiver, // The address of the receiver contract on the destination chain.
        address token, // The token address that was transferred.
        uint256 tokenAmount, // The token amount that was transferred.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the message.
    );

    IRouterClient public immutable i_router;
    IERC20 public immutable i_linkToken;
    IERC20 public immutable i_usdcToken;
    AggregatorV3Interface public oracle;
    bool public receipt;
    bool public isWarned;
    uint256 public num = 30;
    uint256 public count = 5;

    // Mapping to keep track of the receiver contract per destination chain.
    mapping(uint64 => address) public s_receivers;
    // Mapping to store the gas limit per destination chain.
    mapping(uint64 => uint256) public s_gasLimits;
    mapping(address => uint256) public userDeposits;

    // Magic Numbers
    int256 public avaxUsdPrice = 3736436355;

    modifier validateDestinationChain(uint64 _destinationChainSelector) {
        if (_destinationChainSelector == 0) revert InvalidDestinationChain();
        _;
    }

    /// @notice Constructor initializes the contract with the router address.
    /// @param _router The address of the router contract.
    /// @param _link The address of the link contract.
    /// @param _usdcToken The address of the usdc contract.
    constructor(
        address _router,
        address _link,
        address _usdcToken
    ) {
        if (_router == address(0)) revert InvalidRouter();
        if (_link == address(0)) revert InvalidLinkToken();
        if (_usdcToken == address(0)) revert InvalidUsdcToken();
        i_router = IRouterClient(_router);
        i_linkToken = IERC20(_link);
        i_usdcToken = IERC20(_usdcToken);
        setGasLimitForDestinationChain(14767482510784806043, 1500000);
    }

    /// @dev Set the receiver contract for a given destination chain.
    /// @notice This function can only be called by the owner.
    /// @param _destinationChainSelector The selector of the destination chain.
    /// @param _receiver The receiver contract on the destination chain .
    function setReceiverForDestinationChain(
        uint64 _destinationChainSelector,
        address _receiver
    ) public validateDestinationChain(_destinationChainSelector) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        s_receivers[_destinationChainSelector] = _receiver;
    }

    /// @dev Set the gas limit for a given destination chain.
    /// @notice This function can only be called by the owner.
    /// @param _destinationChainSelector The selector of the destination chain.
    /// @param _gasLimit The gas limit on the destination chain .
    function setGasLimitForDestinationChain(
        uint64 _destinationChainSelector,
        uint256 _gasLimit
    ) public validateDestinationChain(_destinationChainSelector) {
        if (_gasLimit == 0) revert InvalidGasLimit();
        s_gasLimits[_destinationChainSelector] = _gasLimit;
    }

    /// @dev Delete the receiver contract for a given destination chain.
    /// @notice This function can only be called by the owner.
    /// @param _destinationChainSelector The selector of the destination chain.
    function deleteReceiverForDestinationChain(uint64 _destinationChainSelector)
        public
        validateDestinationChain(_destinationChainSelector)
    {
        if (s_receivers[_destinationChainSelector] == address(0))
            revert NoReceiverOnDestinationChain(_destinationChainSelector);
        delete s_receivers[_destinationChainSelector];
    }

    function sendMessagePayLINK(
        uint64 _destinationChainSelector,
        uint256 _amount,
        uint256 _usdcAmount
    )
        public
        validateDestinationChain(_destinationChainSelector)
        returns (bytes32 messageId)
    {
        address receiver = s_receivers[_destinationChainSelector];
        if (receiver == address(0))
            revert NoReceiverOnDestinationChain(_destinationChainSelector);
        if (_amount == 0) revert AmountIsZero();
        uint256 gasLimit = s_gasLimits[_destinationChainSelector];
        if (gasLimit == 0)
            revert NoGasLimitOnDestinationChain(_destinationChainSelector);
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        // address(linkToken) means fees are paid in LINK
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_usdcToken),
            amount: _amount
        });
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver), // ABI-encoded receiver address
            data: abi.encodeWithSelector(
                AvalancheSender.increaseNonce.selector,
                _usdcAmount
            ), // Encode the function selector and the arguments of the stake function
            tokenAmounts: tokenAmounts, // The amount and type of token being transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit
                Client.EVMExtraArgsV1({gasLimit: gasLimit})
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: address(i_linkToken)
        });

        // Get the fee required to send the CCIP message
        uint256 fees = i_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > i_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(i_linkToken.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        i_linkToken.approve(address(i_router), fees);

        // approve the Router to spend usdc tokens on contract's behalf. It will spend the amount of the given token
        i_usdcToken.approve(address(i_router), _amount);

        // Send the message through the router and store the returned message ID
        messageId = i_router.ccipSend(
            _destinationChainSelector,
            evm2AnyMessage
        );

        // Emit an event with message details
        emit MessageSent(
            messageId,
            _destinationChainSelector,
            receiver,
            address(i_usdcToken),
            _amount,
            address(i_linkToken),
            fees
        );

        // Return the message ID
        return messageId;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        //(,int avaxUsdPrice,,,) = oracle.latestRoundData();
        require(avaxUsdPrice > 0, "Invalid price from oracle");
        uint256 usdAmount = (msg.value * uint256(avaxUsdPrice)) / 10**20;
        userDeposits[msg.sender] += usdAmount;
    }

    function getReceipt(uint256 _amount) external {
        i_usdcToken.safeTransferFrom(msg.sender, address(this), _amount);
        isWarned = false;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        if (i_usdcToken.balanceOf(address(this)) <= 2000000) {
            if (isWarned) {
                upkeepNeeded = false;
            } else {
                upkeepNeeded = true;
            }
        } else {
            upkeepNeeded = false;
        }
    }

    function performUpkeep(
        bytes calldata /*performData*/
    ) external {
        sendMessagePayLINK(14767482510784806043, 1, 3000000);
        isWarned = true;
    }

    function decreaseUSDC() public {
        i_usdcToken.transfer(msg.sender, 1000000);
    }

   
}
