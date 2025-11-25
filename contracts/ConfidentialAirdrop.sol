// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title ConfidentialAirdrop
 * @notice Batch airdrop contract where recipients receive encrypted token amounts
 * @dev Recipients cannot see their balance until they explicitly decrypt it
 */
contract ConfidentialAirdrop is ZamaEthereumConfig {
    // Owner of the contract (admin who can perform airdrops)
    address public owner;

    // Encrypted balances for each recipient
    mapping(address => euint64) private encryptedBalances;

    // Track if an address has received an airdrop
    mapping(address => bool) public hasReceivedAirdrop;

    // Events
    event AirdropExecuted(address[] recipients, uint256 count);
    event BalanceViewed(address indexed recipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Perform batch airdrop with encrypted amounts
     * @param recipients Array of recipient addresses
     * @param encryptedAmounts Array of encrypted amounts
     * @param inputProofs Array of encryption proofs
     */
    function batchAirdrop(
        address[] calldata recipients,
        externalEuint64[] calldata encryptedAmounts,
        bytes[] calldata inputProofs
    ) external onlyOwner {
        require(
            recipients.length == encryptedAmounts.length &&
            recipients.length == inputProofs.length,
            "Array length mismatch"
        );
        require(recipients.length > 0, "Empty recipients array");

        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            require(recipient != address(0), "Invalid recipient address");

            // Convert external encrypted input to internal encrypted value
            euint64 amount = FHE.fromExternal(encryptedAmounts[i], inputProofs[i]);

            // Add to existing balance or create new balance
            if (hasReceivedAirdrop[recipient]) {
                // Add to existing balance
                encryptedBalances[recipient] = FHE.add(encryptedBalances[recipient], amount);
            } else {
                // Set initial balance
                encryptedBalances[recipient] = amount;
                hasReceivedAirdrop[recipient] = true;
            }

            // Grant permissions: contract and recipient can access
            FHE.allowThis(encryptedBalances[recipient]);
            FHE.allow(encryptedBalances[recipient], recipient);
        }

        emit AirdropExecuted(recipients, recipients.length);
    }

    /**
     * @notice Single airdrop to one recipient (for convenience)
     * @param recipient Recipient address
     * @param encryptedAmount Encrypted amount
     * @param inputProof Encryption proof
     */
    function airdrop(
        address recipient,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

        if (hasReceivedAirdrop[recipient]) {
            encryptedBalances[recipient] = FHE.add(encryptedBalances[recipient], amount);
        } else {
            encryptedBalances[recipient] = amount;
            hasReceivedAirdrop[recipient] = true;
        }

        FHE.allowThis(encryptedBalances[recipient]);
        FHE.allow(encryptedBalances[recipient], recipient);

        address[] memory recipients = new address[](1);
        recipients[0] = recipient;
        emit AirdropExecuted(recipients, 1);
    }

    /**
     * @notice Get encrypted balance (returns encrypted handle for decryption)
     * @return The encrypted balance handle
     */
    function getEncryptedBalance() external returns (euint64) {
        require(hasReceivedAirdrop[msg.sender], "No airdrop received");

        euint64 balance = encryptedBalances[msg.sender];

        // Grant transient permission for this transaction
        FHE.allowTransient(balance, msg.sender);

        emit BalanceViewed(msg.sender);
        return balance;
    }

    /**
     * @notice Check if an address has received an airdrop
     * @param recipient Address to check
     * @return Boolean indicating if airdrop was received
     */
    function checkAirdropStatus(address recipient) external view returns (bool) {
        return hasReceivedAirdrop[recipient];
    }

    /**
     * @notice Transfer ownership of the contract
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @notice Get the current owner
     * @return The owner address
     */
    function getOwner() external view returns (address) {
        return owner;
    }
}
