import { DeBridgeGate } from "@debridge-finance/hardhat-debridge/dist/typechain";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { deBridge, ethers } from "hardhat";

import {
  CrossChainCounter,
  CrossChainCounter__factory,
  CrossChainIncrementor,
  CrossChainIncrementor__factory,
} from "../typechain";

interface TestSuiteState {
  gate: DeBridgeGate;
  gateProtocolFee: BigNumber;
  counter: CrossChainCounter;
  incrementor: CrossChainIncrementor;
}

// Creates a set of contracts for each test suite (useful for before() and beforeEach())
async function deployContracts(): Promise<TestSuiteState> {
  const gate = await deBridge.emulator.deployGate();

  const Counter = (await ethers.getContractFactory(
    "CrossChainCounter"
  )) as CrossChainCounter__factory;
  const counter = (await Counter.deploy(gate.address)) as CrossChainCounter;
  await counter.deployed();

  const Incrementor = (await ethers.getContractFactory(
    "CrossChainIncrementor"
  )) as CrossChainIncrementor__factory;
  const incrementor = (await Incrementor.deploy(
    gate.address,
    ethers.provider.network.chainId,
    counter.address
  )) as CrossChainIncrementor;
  await incrementor.deployed();

  await counter.addChainSupport(
    ethers.provider.network.chainId,
    incrementor.address
  );

  return {
    gate,
    gateProtocolFee: await gate.globalFixedNativeFee(),
    counter,
    incrementor,
  };
}

describe("CrossChainCounter and CrossChainIncrementor communication: sanity checks", function () {
  let contracts: TestSuiteState;
  const INCREMENT_BY = 10;

  before(async () => {
    contracts = await deployContracts();
  });

  it("CrossChainCounter is being incremented by the CrossChainIncrementor request", async function () {
    await contracts.incrementor.increment(INCREMENT_BY, {
      value: contracts.gateProtocolFee,
    });

    await deBridge.emulator.autoClaim();

    expect(await contracts.counter.counter()).to.be.eq(INCREMENT_BY);
  });

  it("CrossChainCounter is being incremented by the CrossChainIncrementor request (second request)", async function () {
    await contracts.incrementor.increment(INCREMENT_BY, {
      value: contracts.gateProtocolFee,
    });

    await deBridge.emulator.autoClaim();

    expect(await contracts.counter.counter()).to.be.eq(INCREMENT_BY * 2);
  });

  it("CrossChainCounter rejects direct call", async () => {
    // CrossChainCounter accepts only calls from the deBridgeGate's CallProxy contract,
    // rejecting calls initiated by any other contract or sender
    await expect(
      contracts.counter.receiveIncrementCommand(
        INCREMENT_BY,
        ethers.constants.AddressZero /*not used*/
      )
    ).to.revertedWith("" /*CallProxyBadRole*/);
    // hardhat cannot decode the error because DeBridgeGate contract (which
    // is deployed by the hardhat-debridge plugin) is not presented as an artifact
    // within this hardhat instance
  });

  it("CrossChainCounter rejects a broadcasted call from non-approved native sender", async () => {
    // deploy another CrossChainIncrementor
    // it is expected that it's call won't succeed because this instance of CrossChainIncrementor
    // resides on a new address which is not approved by CrossChainCounter
    const MaliciousIncrementor = (await ethers.getContractFactory(
      "CrossChainIncrementor"
    )) as CrossChainIncrementor__factory;
    const maliciousIncrementor = (await MaliciousIncrementor.deploy(
      contracts.gate.address,
      ethers.provider.network.chainId,
      contracts.counter.address
    )) as CrossChainIncrementor;
    await maliciousIncrementor.deployed();

    await maliciousIncrementor.increment(INCREMENT_BY, {
      value: contracts.gateProtocolFee,
    });

    // CrossChainCounter rejects all calls from deBridgeGate's CallProxy that
    // where initiated from unknown (non-trusted) contract on the supported chain
    // with NativeSenderBadRole() error raised.
    // However, CallProxy handles this error gracefully and
    // reverts another one: ExternalCallFailed()
    await expect(deBridge.emulator.autoClaim())
      .to.revertedWith("" /*ExternalCallFailed*/)
    // hardhat cannot decode the error because DeBridgeGate contract (which
    // is deployed by the hardhat-debridge plugin) is not presented as an artifact
    // within this hardhat instance
  });
});
