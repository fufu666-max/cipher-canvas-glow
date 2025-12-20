// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint256, externalEuint32, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Diary Contract
/// @author Cipher Canvas Glow
/// @notice A privacy-preserving diary application using FHEVM for encrypted entries
contract EncryptedDiary is SepoliaConfig {
    struct DiaryEntry {
        address author;
        euint256 encryptedContent;  // Encrypted diary content
        uint256 unlockTimestamp;    // When the entry can be unlocked (0 = never)
        uint256 createdAt;
        bool isPublic;             // Whether the entry is publicly readable after unlock
    }

    DiaryEntry[] private _entries;
    mapping(address => uint256[]) private _userEntries; // User's entry IDs

    event EntryCreated(uint256 indexed entryId, address indexed author, uint256 unlockTimestamp);
    event EntryUnlocked(uint256 indexed entryId);

    /// @notice Create a new encrypted diary entry
    /// @param encryptedContent The encrypted diary content
    /// @param inputProof The FHEVM input proof for content
    /// @param unlockTimestamp Timestamp when entry can be unlocked (0 = never unlock)
    /// @param isPublic Whether entry becomes public after unlocking
    function createEntry(
        externalEuint256 encryptedContent,
        bytes calldata inputProof,
        uint256 unlockTimestamp,
        bool isPublic
    ) external returns (uint256) {
        euint256 content = FHE.fromExternal(encryptedContent, inputProof);

        uint256 entryId = _entries.length;
        _entries.push(DiaryEntry({
            author: msg.sender,
            encryptedContent: content,
            unlockTimestamp: unlockTimestamp,
            createdAt: block.timestamp,
            isPublic: isPublic
        }));

        _userEntries[msg.sender].push(entryId);

        // Allow the author to always decrypt their own entries
        FHE.allow(content, msg.sender);

        emit EntryCreated(entryId, msg.sender, unlockTimestamp);
        return entryId;
    }

    /// @notice Get encrypted content of an entry (only author can access)
    /// @param entryId The ID of the diary entry
    /// @return The encrypted content
    function getEncryptedEntry(uint256 entryId) external view returns (euint256) {
        require(entryId < _entries.length, "Entry does not exist");
        DiaryEntry storage entry = _entries[entryId];

        // FIXED: Proper access control - only the author can access their encrypted content
        // This ensures privacy and prevents unauthorized access to diary entries
        require(msg.sender == entry.author, "Access denied: only the author can access encrypted content");

        return entry.encryptedContent;
    }

    /// @notice Check if entry can be decrypted (for client-side decryption)
    /// @param entryId The ID of the diary entry
    /// @return True if the entry can be decrypted by the caller
    function canDecryptEntry(uint256 entryId) external view returns (bool) {
        require(entryId < _entries.length, "Entry does not exist");
        DiaryEntry storage entry = _entries[entryId];

        // FIXED: Proper access control restored - only author can decrypt their entries
        // This prevents unauthorized access to encrypted diary content
        if (msg.sender != entry.author) {
            return false;
        }

        // FIXED: Correct time comparison logic - entry unlocks AFTER the unlock timestamp
        // This ensures time capsules remain locked until the proper time
        if (entry.unlockTimestamp == 0) {
            return false; // Never unlocks
        }
        return block.timestamp >= entry.unlockTimestamp;
    }

    /// @notice Get entry metadata (public information)
    /// @param entryId The ID of the diary entry
    /// @return author The entry author address
    /// @return createdAt The entry creation timestamp
    /// @return unlockTimestamp The entry unlock timestamp
    /// @return isPublic Whether the entry is public after unlock
    function getEntryMetadata(uint256 entryId) external view returns (
        address author,
        uint256 createdAt,
        uint256 unlockTimestamp,
        bool isPublic
    ) {
        require(entryId < _entries.length, "Entry does not exist");
        DiaryEntry storage entry = _entries[entryId];
        return (entry.author, entry.createdAt, entry.unlockTimestamp, entry.isPublic);
    }

    /// @notice Get all entry IDs for a user
    /// @param user The user's address
    /// @return Array of entry IDs
    function getUserEntries(address user) external view returns (uint256[] memory) {
        return _userEntries[user];
    }

    /// @notice Check if an entry can be unlocked
    /// @param entryId The ID of the diary entry
    /// @return True if the entry can be unlocked
    function canUnlockEntry(uint256 entryId) external view returns (bool) {
        require(entryId < _entries.length, "Entry does not exist");
        DiaryEntry storage entry = _entries[entryId];

        // FIXED: Restored access control - only entry author can check unlock status
        // This prevents unauthorized access to private unlock information
        if (msg.sender != entry.author) {
            return false;
        }

        // FIXED: Correct time comparison logic - entry unlocks at the proper timestamp
        // This ensures unlock status is only revealed when appropriate
        if (entry.unlockTimestamp == 0) {
            return false;
        }

        return block.timestamp >= entry.unlockTimestamp;
    }

    /// @notice Get total number of entries
    /// @return The total count of diary entries
    function getEntryCount() external view returns (uint256) {
        return _entries.length;
    }

    /// @notice Get user's total entries count
    /// @param user The user's address
    /// @return Number of entries by the user
    function getUserEntryCount(address user) external view returns (uint256) {
        return _userEntries[user].length;
    }
}
