// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "foundry-contracts/contracts/token/ERC20.sol";

/**
 * @title ERC20Benchmark
 * @author MPAS Guild
 * @notice A standard ERC20 token with an added `airdrop` function
 * for high-throughput transfer benchmarks.
 */
contract ERC20Benchmark is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Distributes a fixed amount of tokens to multiple recipients.
     * @dev This function is a primary target for stress-testing transaction throughput.
     * @param recipients An array of addresses to receive the tokens.
     * @param amount The amount of tokens each recipient will receive.
     */
    function airdrop(address[] calldata recipients, uint256 amount) external {
        uint256 totalAmount = recipients.length * amount;
        require(balanceOf(msg.sender) >= totalAmount, "ERC20: insufficient balance for airdrop");

        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amount);
        }
    }
} 