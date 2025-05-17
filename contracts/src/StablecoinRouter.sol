// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {SwapExecutorHook} from "./SwapExecutorHook.sol";

/**
 * @title StablecoinRouter
 * @notice Smart contract to route stablecoin payments and perform automatic swaps using Uniswap V4.
 * @dev Requires that pools are created and hooks configured off-chain.
 */
contract StablecoinRouter is Ownable {
    using SafeERC20 for IERC20;
    using CurrencyLibrary for Currency;

    /// @notice Address of the Uniswap V4 PoolManager
    IPoolManager public immutable poolManager;
    
    /// @notice The swap hook contract used for executing swaps
    SwapExecutorHook public immutable swapHook;

    /// @notice Mapping of allowed stablecoins
    mapping(address => bool) public isAllowedStablecoin;

    /// @notice Mapping of user payment preferences
    mapping(address => address) public preferredStablecoin;

    // === Events ===

    /// @notice Emitted when a stablecoin is added to the allowlist
    event StablecoinAdded(address indexed token);

    /// @notice Emitted when a stablecoin is removed from the allowlist
    event StablecoinRemoved(address indexed token);

    /// @notice Emitted when a user updates their preferred stablecoin
    event PreferenceSet(address indexed user, address indexed token);

    /// @notice Emitted after a successful payment
    event PaymentExecuted(
        address indexed from,
        address indexed to,
        address indexed inputToken,
        address outputToken,
        uint256 inputAmount,
        uint256 outputAmount
    );

    /**
     * @notice Initializes the contract with a given PoolManager address.
     * @param _poolManager The address of the Uniswap V4 PoolManager contract.
     * @param _swapHook The address of the SwapExecutorHook contract.
     */
    constructor(address _poolManager, address _swapHook) Ownable(msg.sender) {
        require(_poolManager != address(0), "Invalid PoolManager");
        require(_swapHook != address(0), "Invalid Hook");

        poolManager = IPoolManager(_poolManager);
        swapHook = SwapExecutorHook(_swapHook);
        // for Base
        _addStablecoin(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913); // USDC
        _addStablecoin(0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42); // EURC
        _addStablecoin(0xa411c9Aa00E020e4f88Bc19996d29c5B7ADB4ACf); // MXN
        _addStablecoin(0xE9185Ee218cae427aF7B9764A011bb89FeA761B4); // BRZ

        // for Sepolia Base 
        // _addStablecoin(0xCd099308b66804E73d89e766923130FCda19b703); // USDC
        // _addStablecoin(0x22F926E1A35A435484Ae1445f750A2E8C21754Dc); // MXN
    }


    // ========== Admin Functions ==========

    /**
     * @notice Adds a stablecoin to the allowlist.
     * @param token The address of the stablecoin.
     */
    function addStablecoin(address token) external onlyOwner {
        _addStablecoin(token);
    }

    /**
     * @notice Removes a stablecoin from the allowlist.
     * @param token The address of the stablecoin.
     */
    function removeStablecoin(address token) external onlyOwner {
        require(isAllowedStablecoin[token], "Token not listed");
        isAllowedStablecoin[token] = false;
        emit StablecoinRemoved(token);
    }

    // ========== User Preference ==========

    /**
     * @notice Sets the user's preferred stablecoin for receiving payments.
     * @param token The stablecoin address.
     */
    function setPreferredStablecoin(address token) external {
        require(isAllowedStablecoin[token], "Unsupported stablecoin");
        preferredStablecoin[msg.sender] = token;
        emit PreferenceSet(msg.sender, token);
    }

    // ========== Payment Logic ==========

    /**
     * @notice Allows users to pay others in their preferred stablecoin. Swaps if required.
     * @param to The recipient of the payment.
     * @param amount The amount of `inputToken` to send.
     * @param inputToken The token the sender wants to use.
     */
    function pay(address to, uint256 amount, address inputToken) external {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Zero amount");
        require(isAllowedStablecoin[inputToken], "Input token not allowed");

        address outputToken = preferredStablecoin[to];
        require(isAllowedStablecoin[outputToken], "Recipient has no preference");

        IERC20(inputToken).safeTransferFrom(msg.sender, address(this), amount);

        uint256 outputAmount;

        if (inputToken == outputToken) {
            // Direct transfer without swap
            IERC20(inputToken).safeTransfer(to, amount);
            outputAmount = amount;
        } else {
            // Swap via Uniswap V4
            outputAmount = _swapUniswapV4(inputToken, outputToken, amount, to);
        }

        emit PaymentExecuted(msg.sender, to, inputToken, outputToken, amount, outputAmount);
    }

    // ========== Internal Swap Logic ==========

    /**
     * @notice Executes a token swap using Uniswap V4.
     * @param tokenIn The address of the token being sold.
     * @param tokenOut The address of the token to buy.
     * @param amountIn The amount of `tokenIn`.
     * @param recipient Address to receive the swapped tokens.
     * @return amountOut The amount of output tokens received.
     */
    function _swapUniswapV4(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        address recipient
    ) internal returns (uint256 amountOut) {
        Currency currencyIn = Currency.wrap(tokenIn);
        Currency currencyOut = Currency.wrap(tokenOut);

        // Define PoolKey (you must register this pool off-chain beforehand)
        PoolKey memory key = PoolKey({
            currency0: currencyIn < currencyOut ? currencyIn : currencyOut,
            currency1: currencyIn < currencyOut ? currencyOut : currencyIn,
            fee: 3000,          // 0.3% fee tier
            tickSpacing: 60,    // standard
            hooks: IHooks(address(0))   // assuming no custom hooks
        });

        // Determine swap direction
        bool zeroForOne = currencyIn < currencyOut;

        // Prepare calldata for the hook
        bytes memory swapData = abi.encode(
            key,
            amountIn,
            zeroForOne,
            recipient
        );

        // Approve tokenIn to PoolManager
        IERC20(tokenIn).approve(address(poolManager), amountIn);

        // Use unlock instead of lock with the swap hook address and data
        bytes memory returnData = poolManager.unlock(
            abi.encode(address(swapHook), swapData)
        );

        BalanceDelta delta = abi.decode(returnData, (BalanceDelta));
        
        // Calculate the output amount (convert negative value to positive)
        int128 rawAmount;
        if (zeroForOne) {
            rawAmount = delta.amount1();
        } else {
            rawAmount = delta.amount0();
        }
        
        // Convert to positive uint256
        require(rawAmount < 0, "Unexpected positive delta");
        amountOut = uint256(-int256(rawAmount));

        require(amountOut > 0, "Swap failed");
    }

    // ========== Private ==========

    /**
     * @dev Internal function to add a stablecoin to the allowlist.
     * @param token The token address.
     */
    function _addStablecoin(address token) private {
        require(token != address(0), "Zero address");
        require(!isAllowedStablecoin[token], "Already allowed");
        isAllowedStablecoin[token] = true;
        emit StablecoinAdded(token);
    }
}
