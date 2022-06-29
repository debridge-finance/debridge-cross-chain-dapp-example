//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ICrossChainCounter.sol";
import "./interfaces/IDeBridgeGate.sol";
import "./interfaces/ICallProxy.sol";

interface IDebridgeGateWithCallProxy is IDeBridgeGate {
    function callProxy() external returns (address);
}

contract CrossChainCounter is AccessControl, ICrossChainCounter {

    /// @dev DeBridgeGate's address on the current chain
    IDeBridgeGate public deBridgeGate;

    /// @dev chains, where commands are allowed to come from
    /// @dev chain_id_from => ChainInfo
    mapping(uint => ChainInfo) supportedChains;

    uint public counter;
    address public latestIncrementInitiator;

    /* ========== MODIFIERS ========== */

    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert AdminBadRole();
        _;
    }

    /// @dev Restricts calls made by deBridge's CallProxy
    ///         AND that are originating from the whitelisted CrossChainCounter address on the origin chain
    modifier onlyCrossChainIncrementor() {
        ICallProxy callProxy = ICallProxy(IDebridgeGateWithCallProxy(address(deBridgeGate)).callProxy());

        // caller is CallProxy?
        if (address(callProxy) != msg.sender) {
            revert CallProxyBadRole();
        }

        bytes memory nativeSender = callProxy.submissionNativeSender();
        uint256 chainIdFrom = callProxy.submissionChainIdFrom();

        // has the transaction being initiated by the whitelisted CrossChainCounter on the origin chain?
        if (keccak256(supportedChains[chainIdFrom].crossChainCounterAddress) != keccak256(nativeSender)) {
            revert NativeSenderBadRole(nativeSender, chainIdFrom);
        }

        _;
    }

    /* ========== INITIALIZERS ========== */

    constructor(IDeBridgeGate deBridgeGate_) {
       deBridgeGate = deBridgeGate_;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /* ========== MAINTENANCE METHODS ========== */

    function addChainSupport(uint256 _chainId, bytes memory _crossChainCounterAddress) external onlyAdmin {
        supportedChains[_chainId].crossChainCounterAddress = _crossChainCounterAddress;
        supportedChains[_chainId].isSupported = true;

        emit SupportedChainAdded(_chainId, _crossChainCounterAddress);
    }

    function removeChainSupport(uint256 _chainId) external onlyAdmin {
        supportedChains[_chainId].isSupported = false;
        emit SupportedChainRemoved(_chainId);
    }

    /* ========== PUBLIC METHODS: RECEIVING ========== */

    function receiveIncrementCommand(uint8 _amount, address _initiator)
        external
        override
        onlyCrossChainIncrementor
    {
        counter += _amount;
        latestIncrementInitiator = _initiator;
        emit CounterIncremented(counter, _amount, _initiator);
    }
}
