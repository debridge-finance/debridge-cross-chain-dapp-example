// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


interface ICrossChainCounter {

    /* ========== EVENTS ========== */

    event SupportedChainAdded(uint256 _chainId, bytes _adapter);
    event SupportedChainRemoved(uint256 _chainId);
    event CounterIncremented(uint newCounterValue, uint8 amount, address initiator);

    /* ========== ERRORS ========== */

    error AdminBadRole();
    error ChainNotSupported(uint chainId);
    error CallProxyBadRole();
    error NativeSenderBadRole(bytes nativeSender, uint256 chainIdFrom);
    error WrongArgument();

    /* ========== STRUCTS ========== */

    struct ChainInfo {
        bool isSupported;
        bytes crossChainCounterAddress;
    }

    /* ========== METHODS ========== */

    function receiveIncrementCommand(uint8 _amount, address _initiator)
        external;
}