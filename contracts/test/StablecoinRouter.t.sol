// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/StablecoinRouter.sol";
import "../src/SwapExecutorHook.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./mocks/MockERC20.sol";

contract StablecoinRouterTest is Test {
    StablecoinRouter public router;
    SwapExecutorHook public swapHook;
    address public poolManager;
    MockERC20 public usdc;
    MockERC20 public eurc;
    address public owner = address(this);
    address public user = address(0xBEEF);
    address public recipient = address(0xCAFE);

    function setUp() public {
        // Create mock tokens
        usdc = new MockERC20("USD Coin", "USDC", 6);
        eurc = new MockERC20("Euro Coin", "EURC", 6);
        
        // Create mocks
        poolManager = address(0x123);
        swapHook = new SwapExecutorHook(IPoolManager(poolManager));
        
        // Create router with mock addresses
        router = new StablecoinRouter(poolManager, address(swapHook));
        
        // Add mock tokens to router
        router.addStablecoin(address(usdc));
        router.addStablecoin(address(eurc));
        
        // Mint tokens to user
        usdc.mint(user, 1000 * 10**6);
        eurc.mint(user, 1000 * 10**6);
        
        // Set user's preferred stablecoin
        vm.prank(recipient);
        router.setPreferredStablecoin(address(eurc));
    }

    function testAddAndRemoveStablecoin() public {
        address stablecoin = address(0xABC);
        router.addStablecoin(stablecoin);
        assertTrue(router.isAllowedStablecoin(stablecoin));

        router.removeStablecoin(stablecoin);
        assertFalse(router.isAllowedStablecoin(stablecoin));
    }

    function testSetPreference() public {
        address stablecoin = address(0xABC);
        router.addStablecoin(stablecoin);
        
        router.setPreferredStablecoin(stablecoin);
        assertEq(router.preferredStablecoin(owner), stablecoin);
    }

    function testOnlyOwnerCanAddStablecoin() public {
        vm.prank(user);
        vm.expectRevert();
        router.addStablecoin(address(0xABC));
    }

    function testOnlyOwnerCanRemoveStablecoin() public {
        vm.prank(user);
        vm.expectRevert();
        router.removeStablecoin(address(0xABC));
    }
    
    function testDirectPayment() public {
        uint256 paymentAmount = 100 * 10**6; // 100 EURC
        
        // Approve tokens for router
        vm.startPrank(user);
        eurc.approve(address(router), paymentAmount);
        
        // Check initial balances
        uint256 initialUserBalance = eurc.balanceOf(user);
        uint256 initialRecipientBalance = eurc.balanceOf(recipient);
        
        // Make payment with same token (no swap needed)
        router.pay(recipient, paymentAmount, address(eurc));
        vm.stopPrank();
        
        // Check final balances
        assertEq(eurc.balanceOf(user), initialUserBalance - paymentAmount);
        assertEq(eurc.balanceOf(recipient), initialRecipientBalance + paymentAmount);
    }
}
