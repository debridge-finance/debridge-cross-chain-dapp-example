import { expect } from "chai";
import { ethers, deBridge } from "hardhat";
import { CrossChainCounter, CrossChainIncrementor, DeBridgeGate } from "../typechain";

interface State {
  gate: DeBridgeGate
  counter: CrossChainCounter,
  incrementor: CrossChainIncrementor
}

async function deployContracts(): Promise<State> {

  const gate = await deBridge.emulator.deployGate();

  const Counter = await ethers.getContractFactory('CrossChainCounter');
  const counter = await Counter.deploy(gate.address);
  await counter.deployed();

  const Incrementor = await ethers.getContractFactory('CrossChainIncrementor')
  const incrementor = await Incrementor.deploy(gate.address, ethers.provider.network.chainId, counter.address)
  await incrementor.deployed()

  await counter.addChainSupport(ethers.provider.network.chainId, incrementor.address)

  return {
    gate, counter, incrementor
  }

}

describe("CrossChainCounter and CrossChainIncrementor communication - different flows", function () {
  let STATE: State|null = null;
  const INCREMENT_BY = 10;

  before(async () => {
    STATE = await deployContracts();
  })

  it("Must correctly increment", async function () {
    await STATE!.incrementor.increment(INCREMENT_BY, 0, {
      // deBridge takes a fixed fee in the native blockchain currency, pass it as a value
      value: await STATE!.gate.globalFixedNativeFee()
    });

    await STATE!.gate.claim(
      ... await deBridge.emulator.getClaimArgs()
    )

    expect(await STATE!.counter.counter())
      .to.be.eq(INCREMENT_BY)
  });

  it("Must handle second increment", async function() {
    await STATE!.incrementor.increment(INCREMENT_BY, 0, {
      // deBridge takes a fixed fee in the native blockchain currency, pass it as a value
      value: await STATE!.gate.globalFixedNativeFee()
    });

    await STATE!.gate.claim(
      ... await deBridge.emulator.getClaimArgs()
    )

    expect(await STATE!.counter.counter())
      .to.be.eq(INCREMENT_BY * 2)
  })
});