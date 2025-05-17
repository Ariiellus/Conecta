// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";

// Define the exact interface subset we need
interface IPoolManagerWithSwap {
    struct SwapParams {
        bool zeroForOne;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
    }
    
    function swap(
        PoolKey memory key,
        SwapParams memory params,
        bytes memory hookData
    ) external returns (BalanceDelta);
}

contract SwapExecutorHook {
    IPoolManager public immutable poolManager;
    
    constructor(IPoolManager _poolManager) {
        poolManager = _poolManager;
    }

    /// @notice This function is called by PoolManager during lock(...)
    function lockAcquired(bytes calldata data) external returns (bytes memory) {
        require(msg.sender == address(poolManager), "Only PoolManager");

        (
            PoolKey memory key,
            uint256 amountIn,
            bool zeroForOne,
            address recipient
        ) = abi.decode(data, (PoolKey, uint256, bool, address));

        // Cast to our interface with the right structs
        IPoolManagerWithSwap manager = IPoolManagerWithSwap(address(poolManager));
        
        // Perform the swap
        BalanceDelta delta = manager.swap(
            key,
            IPoolManagerWithSwap.SwapParams({
                zeroForOne: zeroForOne,
                amountSpecified: int256(amountIn),
                sqrtPriceLimitX96: 0 // full range
            }),
            abi.encode(recipient) // data sent to hook swap callback (not used here)
        );

        return abi.encode(delta);
    }
}
