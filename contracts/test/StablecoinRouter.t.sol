// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {StablecoinRouter} from "../src/StablecoinRouter.sol";

contract StablecoinRouterTest is Test {
  StablecoinRouter public router;

  address dummyPoolManager = address(0xBEEF);

  function setUp() public {
    router = new StablecoinRouter(dummyPoolManager);
  }

  function testAddStablecoin() public {
    address usdc = address(0x123);
    router.addStablecoin(usdc);
    assertTrue(router.isAllowedStablecoin(usdc));
  }
}
