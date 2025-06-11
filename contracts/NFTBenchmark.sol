// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "foundry-contracts/contracts/token/ERC721.sol";

/**
 * @title NFTBenchmark
 * @author MPAS Guild
 * @notice An ERC721 contract with a `batchMint` function
 * for testing large-scale NFT minting performance.
 */
contract NFTBenchmark is ERC721 {
    uint256 private _nextTokenId;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    /**
     * @notice Mints a specified quantity of NFTs to a single address.
     * @dev This function is designed to test state growth and complex minting logic under load.
     * @param to The address to receive the minted NFTs.
     * @param quantity The number of NFTs to mint.
     */
    function batchMint(address to, uint256 quantity) external {
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(to, _nextTokenId);
            _nextTokenId++;
        }
    }
} 