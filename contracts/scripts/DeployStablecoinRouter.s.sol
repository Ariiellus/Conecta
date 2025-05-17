// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {StablecoinRouter} from "../src/StablecoinRouter.sol";
import {SwapExecutorHook} from "../src/SwapExecutorHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

contract DeployStablecoinRouterSepoliaBase is Script {
    function run() external returns (StablecoinRouter) {
        vm.startBroadcast();
        address poolManager = address(0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408); // Base Sepolia PoolManager

        SwapExecutorHook hook = new SwapExecutorHook(IPoolManager(poolManager));
        StablecoinRouter router = new StablecoinRouter(poolManager, address(hook));

        vm.stopBroadcast();
        return router;
    }
}

contract DeployStablecoinRouterBase is Script {
    function run() external returns (StablecoinRouter) {
        vm.startBroadcast();
        address poolManager = address(0x498581fF718922c3f8e6A244956aF099B2652b2b); // Base PoolManager

        SwapExecutorHook hook = new SwapExecutorHook(IPoolManager(poolManager));
        StablecoinRouter router = new StablecoinRouter(poolManager, address(hook));

        vm.stopBroadcast();
        return router;
    }
}
