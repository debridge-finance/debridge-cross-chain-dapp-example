## debridge-cross-chain-messaging-example

A complete example of a conceptual cross-chain dApp which leverages the [deBridge protocol](https://debridge.finance) to send calls between its contracts across chains. This example is built on top of the Hardhat framework and the [`hardhat-debridge` plugin](https://github.com/debridge-finance/hardhat-debridge).

This repository will help you understand how to write, test, emulate and run EVM contracts that are intended to rely on deBridge infrastructure.

### Introduction

Assume there is a `CrossChainCounter` contract residing on one chain. It stores a value that can be incremented by a call originating from another chain, and this call must be initiated by and only by the `CrossChainIncrementor` contract residing at the known trusted address.

### Contracts overview

`CrossChainCounter` is the contract representing receiver: it stores a value which is expected to be incremented by a call initiated by the trusted contract on another chain an broadcasted by the `deBridgeGate` contract. Thus, it expects the address of the `deBridgeGate` contract during deployment (you can find it at the [official docs](https://docs.debridge.finance/contracts/mainnet-addresses)).

`CrossChainIncrementor` is the contract representing sender: it is able to construct a message wit ha transaction call (a set of instructions to invoke `CrossChainCounter.receiveIncrementCommand()` with the given args) and pass it to the `deBridgeGate` with the intention to be broadcasted to another chain (where `CrossChainCounter` already resides) and be executed there. Thus, it expects:
- the address of the `deBridgeGate` contract on the same chain the contract is being deployed,
- the address of the `CrossChainCounter` contract on the destination chain,
- the chain ID of the destination chain where `CrossChainCounter` resides.

Additionally, `CrossChainCounter` only accepts calls originating from the trusted addresses, to it must be configured to whitelist the chain ID and the address where the `CrossChainCounter` contract resides. See `CrossChainIncrementor.addChainSupport()`.

### Tests overview

Tests are leveraging the [`hardhat-debridge` plugin](https://github.com/debridge-finance/hardhat-debridge).

`Basic.ts` is a simple test validating the normal flow: after the contracts are being deployed, the `CrossChainIncrementor` contract is being invoked to construct and pass the message to the gate; the emulator sends the message back to the gate; the gate executes the call which actually calls the `CrossChainCounter` with the args given in the message.

`Cases.ts` is a set of unit tests needed to validate edge cases and ensure security considerations are met: e.g., ensure that `CrossChainCounter` cannot by called by anyone but the gate, or that it rejects calls from untrusted addresses, etc.


### Tasks overview

This repository comes with a bunch of handy console commands to reproduce the aforementioned flow, either on the deBridge emulator (a part of `hardhat-debridge` plugin) or even on the mainnet chain. Available commands:
- `npx hardhat deploy-counter`
- `npx hardhat deploy-incrementor`
- `npx hardhat configure-counter`
- `npx hardhat send-increment`
- `npx hardhat read-increment`


### Further reading

- Quick start guide (coming soon)
- Using the deBridge emulator video (coming soon)
- Constructing claim txns (coming soon)

