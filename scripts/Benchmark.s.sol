// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/ERC20Benchmark.sol";

/**
 * @title BenchmarkScript
 * @author MPAS Guild
 * @notice A Foundry script to execute performance benchmarks on deployed contracts.
 * @dev Example Usage:
 * forge script scripts/Benchmark.s.sol:BenchmarkScript --rpc-url <MONAD_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
 */
contract BenchmarkScript is Script {

    // --- Configuration ---
    // The target contract to benchmark.
    ERC20Benchmark public constant TARGET_CONTRACT = ERC20Benchmark(payable(0x...)); // TODO: Add deployed contract address
    // Number of transactions to send.
    uint256 public constant TX_COUNT = 100;

    function run() external {
        vm.startBroadcast();

        // Prepare a dummy recipients array for the airdrop function
        address[] memory recipients = new address[](1);
        recipients[0] = vm.addr(1); // Use a dummy address

        console.log("--- Starting Benchmark ---");
        console.log("Target Contract:", address(TARGET_CONTRACT));
        console.log("Transactions to send:", TX_COUNT);

        // Record start time
        uint256 startTime = block.timestamp;

        for (uint256 i = 0; i < TX_COUNT; i++) {
            // Call the target function. In this case, airdropping 1 token to 1 address.
            TARGET_CONTRACT.airdrop(recipients, 1 ether);
        }

        // Record end time
        uint256 endTime = block.timestamp;

        console.log("--- Benchmark Finished ---");
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        uint256 duration = endTime - startTime;
        console.log("Total Duration (seconds):", duration);

        if (duration > 0) {
            uint256 tps = TX_COUNT / duration;
            console.log("Calculated TPS:", tps);
        } else {
            console.log("Calculated TPS: Very high (completed within 1 second)");
        }
        
        vm.stopBroadcast();
    }
} 