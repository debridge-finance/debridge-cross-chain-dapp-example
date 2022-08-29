// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@debridge-finance/debridge-protocol-evm-interfaces/contracts/libraries/Flags.sol";
import "@debridge-finance/debridge-protocol-evm-interfaces/contracts/interfaces/IDeBridgeGateExtended.sol";

import "./interfaces/ICrossChainCounter.sol";

contract CrossChainIncrementor is AccessControl{
    /// @dev DeBridgeGate's address on the current chain
    IDeBridgeGateExtended public deBridgeGate;

    /// @dev Chain ID where the cross-chain counter contract has been deployed
    uint256 crossChainCounterResidenceChainID;

    /// @dev Address of the cross-chain counter contract (on the `crossChainCounterResidenceChainID` chain)
    address crossChainCounterResidenceAddress;

    error AdminBadRole();

    /* ========== MODIFIERS ========== */

    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert AdminBadRole();
        _;
    }

    /* ========== INITIALIZERS ========== */

    constructor(
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /* ========== MAINTENANCE METHODS ========== */

    function setDeBridgeGate(IDeBridgeGateExtended deBridgeGate_) external onlyAdmin {
        deBridgeGate = deBridgeGate_;
    }

    function addCounter(
        uint256 crossChainCounterResidenceChainID_,
        address crossChainCounterResidenceAddress_
    ) external onlyAdmin {
        crossChainCounterResidenceChainID = crossChainCounterResidenceChainID_;
        crossChainCounterResidenceAddress = crossChainCounterResidenceAddress_;
    }

    /* ========== PUBLIC METHODS: SENDING ========== */

    function increment(uint8 _amount) external payable {
        uint fee = deBridgeGate.globalFixedNativeFee();
        require(msg.value >= fee, "fee not covered by the msg.value");

        bytes memory dstTxCall = _encodeReceiveCommand(_amount, msg.sender);

        _send(dstTxCall, 0);
    }

    function incrementWithIncludedGas(uint8 _amount, uint256 _executionFee) external payable {
        uint fee = deBridgeGate.globalFixedNativeFee();
        require(msg.value >= (fee + _executionFee), "fee not covered by the msg.value");

        bytes memory dstTxCall = _encodeReceiveCommand(_amount, msg.sender);

        _send(dstTxCall, _executionFee);
    }

    /* ========== INTERNAL METHODS ========== */

    function _encodeReceiveCommand(uint8 _amount, address _initiator)
        internal
        pure
        returns (bytes memory)
    {
        return
            abi.encodeWithSelector(
                ICrossChainCounter.receiveIncrementCommand.selector,
                _amount,
                _initiator
            );
    }

    function _send(bytes memory _dstTransactionCall, uint256 _executionFee)
        internal
    {
        IDeBridgeGate.SubmissionAutoParamsTo memory autoParams;

        autoParams.executionFee = _executionFee;

        // Exposing nativeSender must be requested explicitly
        // We request it bc of CrossChainCounter's onlyCrossChainIncrementor modifier
        autoParams.flags = Flags.setFlag(
            autoParams.flags,
            Flags.PROXY_WITH_SENDER,
            true
        );

        // if something happens, we need to revert the transaction, otherwise the sender will loose assets
        autoParams.flags = Flags.setFlag(
            autoParams.flags,
            Flags.REVERT_IF_EXTERNAL_FAIL,
            true
        );

        autoParams.data = _dstTransactionCall;
        autoParams.fallbackAddress = abi.encodePacked(msg.sender);

        deBridgeGate.send{value: msg.value}(
            address(0), // _tokenAddress
            _executionFee, // _amount
            crossChainCounterResidenceChainID, // _chainIdTo
            abi.encodePacked(crossChainCounterResidenceAddress), // _receiver
            "", // _permit
            true, // _useAssetFee
            0, // _referralCode
            abi.encode(autoParams) // _autoParams
        );
    }
}
