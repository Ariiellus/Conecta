// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Uniswap V4 imports (base structure, actual router setup depends on deployment)
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {CurrencyLibrary, Currency} from "v4-core/types/Currency.sol";

contract StablecoinRouter is Ownable {
    using CurrencyLibrary for Currency;

    /// @notice PoolManager for Uniswap V4 (must be set per deployment)
    IPoolManager public immutable poolManager;

    /// @notice Allowed stablecoins (per network deployment)
    mapping(address => bool) public isAllowedStablecoin;

    /// @notice Users' stablecoin preferences
    mapping(address => address) public preferredStablecoin;

    event PaymentExecuted(address indexed from, address indexed to, address inputToken, address outputToken, uint256 inputAmount, uint256 outputAmount);
    event PreferenceSet(address indexed user, address token);
    event StablecoinAdded(address token);
    event StablecoinRemoved(address token);

    constructor(address _poolManager) Ownable(msg.sender) {
        poolManager = IPoolManager(_poolManager);
    }

    function addStablecoin(address token) external onlyOwner {
        isAllowedStablecoin[token] = true;
        emit StablecoinAdded(token);
    }

    function removeStablecoin(address token) external onlyOwner {
        isAllowedStablecoin[token] = false;
        emit StablecoinRemoved(token);
    }

    function setPreferredStablecoin(address token) external {
        require(isAllowedStablecoin[token], "Unsupported stablecoin");
        preferredStablecoin[msg.sender] = token;
        emit PreferenceSet(msg.sender, token);
    }

    function pay(address to, uint256 amount, address inputToken) external {
        require(to != address(0), "Invalid recipient");
        require(isAllowedStablecoin[inputToken], "Input token not allowed");

        address outputToken = preferredStablecoin[to];
        require(isAllowedStablecoin[outputToken], "Recipient has no valid preference");

        IERC20(inputToken).transferFrom(msg.sender, address(this), amount);

        uint256 amountOut;

        if (inputToken == outputToken) {
            // Same-token transfer
            IERC20(inputToken).transfer(to, amount);
            amountOut = amount;
        } else {
            // Swap via Uniswap V4
            amountOut = _swapUniswapV4(inputToken, outputToken, amount, to);
        }

        emit PaymentExecuted(msg.sender, to, inputToken, outputToken, amount, amountOut);
    }

    function _swapUniswapV4(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        address recipient
    ) internal returns (uint256 amountOut) {
        // Placeholder — requires full Uniswap V4 setup with hooks/pools
        // Replace this logic with actual IPoolManager interaction
        revert("Uniswap V4 swap not implemented yet");
    }
}
