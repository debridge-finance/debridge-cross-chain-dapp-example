// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ICrossChainCounter {

    /* ========== EVENTS ========== */

    event SupportedChainAdded(uint256 chainId, bytes incrementorAddress);
    event SupportedChainRemoved(uint256 chainId);
    event CounterIncremented(
        uint256 newCounterValue,
        uint8 amount,
        uint chainFrom,
        address initiator
    );

    /* ========== ERRORS ========== */

    error AdminBadRole();
    error CallProxyBadRole();
    error ChainNotSupported(uint256 chainId);
    error NativeSenderBadRole(bytes nativeSender, uint256 chainIdFrom);

    /* ========== STRUCTS ========== */

    struct ChainInfo {
        bool isSupported;
        bytes callerAddress;
    }

    /* ========== METHODS ========== */

    function receiveIncrementCommand(uint8 _amount, address _initiator)
        external;
}
