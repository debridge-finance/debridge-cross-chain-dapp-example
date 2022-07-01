import { expect } from "chai";
import { ethers, deBridge } from "hardhat";

describe("CrossChainCounter and CrossChainIncrementor communication: basic", function () {
  it("Must correctly increment", async function () {
    const INCREMENT_BY = 10;
    const gate = await deBridge.emulator.deployGate();

    const Counter = await ethers.getContractFactory('CrossChainCounter');
    const counter = await Counter.deploy(gate.address);
    await counter.deployed();

    const Incrementor = await ethers.getContractFactory('CrossChainIncrementor')
    const incrementor = await Incrementor.deploy(gate.address, ethers.provider.network.chainId, counter.address)
    await incrementor.deployed()

    await counter.addChainSupport(ethers.provider.network.chainId, incrementor.address)

    await incrementor.increment(INCREMENT_BY, 0, {
      // deBridge takes a fixed fee in the native blockchain currency, pass it as a value
      value: await gate.globalFixedNativeFee()
    });

    await gate.claim(
      ... await deBridge.emulator.getClaimArgs()
    )

    expect(await counter.counter())
      .to.be.eq(INCREMENT_BY)
  });
});