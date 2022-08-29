import { expect } from "chai";
import { deBridge, ethers } from "hardhat";

import {
  CrossChainCounter,
  CrossChainCounter__factory,
  CrossChainIncrementor,
  CrossChainIncrementor__factory,
} from "../typechain";

/**
 * CrossChainCounter and CrossChainIncrementor are expected to reside in the different chains.
 * Since we use deBridge emulator here, it is okay they are on the same chain, as deBridgeGate is configured to
 * accept and broadcast loopback txns.
 *
 * This test suite actually checks the general flow:
 * CrossChainIncrementor (which resides in the chain A) must construct a message to call CrossChainCounter (which
 * resides in the chain B), and pass this message to deBridgeGate, which will broadcast this message to the off-chain.
 * Next we must bypass the validators' part of work and immediately take the broadcasted message (we assume it is
 * correct) and construct a claim txn and broadcast it to chain B. This txn calls deBridgeGate, which
 * decodes the message and executes it. Since this message contains an encoded call to CrossChainCounter, it is being
 * called by debBridgeGate's CallProxy contract. During a call, CrossChainCounter ensures that it was called by
 * deBridgeGate's CallProxy directly, and the actual message has been constructed by the CrossChainCounter
 * contract is trusts.
 */
describe("CrossChainCounter and CrossChainIncrementor communication: basic", function () {
  it("CrossChainCounter is being incremented by the CrossChainIncrementor request", async function () {
    const INCREMENT_BY = 10;

    //
    // construct prereqs
    //
    const gate = await deBridge.emulator.deployGate();

    const Counter = (await ethers.getContractFactory(
      "CrossChainCounter"
    )) as CrossChainCounter__factory;
    const counter = (await Counter.deploy()) as CrossChainCounter;
    await counter.deployed();
    await counter.setDeBridgeGate(gate.address);

    const Incrementor = (await ethers.getContractFactory(
      "CrossChainIncrementor"
    )) as CrossChainIncrementor__factory;
    const incrementor = (await Incrementor.deploy()) as CrossChainIncrementor;
    await incrementor.deployed();

    await incrementor.setDeBridgeGate(gate.address);
    await incrementor.addCounter(
      ethers.provider.network.chainId,
      counter.address
    );

    await counter.addChainSupport(
      ethers.provider.network.chainId,
      incrementor.address
    );

    //
    // call CrossChainIncrementor on chain A
    //
    await incrementor.increment(INCREMENT_BY, {
      // deBridge takes a fixed fee in the native currency of the blockchain, we need to pass it as a value
      value: await gate.globalFixedNativeFee(),
    });

    //
    // bypass the validation stage, immediately broadcast a claim txn
    //
    await deBridge.emulator.autoClaim();

    //
    // expect that CrossChainCounter accepted the call and its value has been incremented
    //
    expect(await counter.counter()).to.be.eq(INCREMENT_BY);
  });
});
