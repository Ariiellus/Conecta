// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MockERC20} from "./MockERC20.sol";

contract MockPoolManager {
    struct SwapParams {
        bool zeroForOne;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
    }

    // Simple mapping to simulate swaps
    mapping(address => mapping(address => uint256)) public exchangeRates;
    
    constructor() {
        // Default exchange rate: 1 USDC = 5 BRZ (arbitrary values for testing)
    }
    
    function setExchangeRate(address tokenIn, address tokenOut, uint256 rate) external {
        exchangeRates[tokenIn][tokenOut] = rate;
    }
    
    function swap(
        PoolKey memory key,
        SwapParams memory params,
        bytes memory hookData
    ) external returns (BalanceDelta) {
        address tokenIn;
        address tokenOut;
        
        if (params.zeroForOne) {
            tokenIn = Currency.unwrap(key.currency0);
            tokenOut = Currency.unwrap(key.currency1);
        } else {
            tokenIn = Currency.unwrap(key.currency1);
            tokenOut = Currency.unwrap(key.currency0);
        }
        
        uint256 amountIn = uint256(params.amountSpecified > 0 ? params.amountSpecified : -params.amountSpecified);
        
        // Use predefined exchange rate or default to 1:1
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        if (rate == 0) rate = 1;
        
        uint256 amountOut = amountIn * rate / 10**18;
        
        // Mock token transfers
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        address recipient = abi.decode(hookData, (address));
        if (recipient == address(0)) {
            recipient = msg.sender;
        }
        
        // Mint the output tokens to simulate a swap
        MockERC20(tokenOut).mint(recipient, amountOut);
        
        // Create balance delta with proper signed values
        int256 amount0Delta;
        int256 amount1Delta;
        
        if (params.zeroForOne) {
            amount0Delta = int256(amountIn);
            amount1Delta = -int256(amountOut);
        } else {
            amount0Delta = -int256(amountOut);
            amount1Delta = int256(amountIn);
        }
        
        // Return properly constructed BalanceDelta
        return BalanceDelta.wrap(amount0Delta | (amount1Delta << 128));
    }
    
    function lock(bytes calldata data) external returns (bytes memory) {
        // Mock lock function
        // Parse the incoming data and call the target contract
        (address target, bytes memory callData) = abi.decode(data, (address, bytes));
        
        (bool success, bytes memory returnData) = target.call(
            abi.encodeWithSignature("lockAcquired(bytes)", callData)
        );
        
        require(success, "Lock call failed");
        return returnData;
    }
} 