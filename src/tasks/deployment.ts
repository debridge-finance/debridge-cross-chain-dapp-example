import { BigNumber } from "ethers";
import { HardhatUserConfig, task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  CrossChainCounter,
  CrossChainCounter__factory,
  CrossChainIncrementor,
  CrossChainIncrementor__factory,
  DeBridgeGate__factory,
} from "../../typechain";
import { SentEvent } from "../../typechain/IDeBridgeGate";

task("deploy-counter", "Deploys CrossChainCounter")
  .addOptionalParam(
    "deBridgeGateAddress",
    "",
    "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA"
  )
  .setAction(async (args, hre) => {
    const Counter = (await hre.ethers.getContractFactory(
      "CrossChainCounter"
    )) as CrossChainCounter__factory;
    const counter = (await Counter.deploy(
      args.deBridgeGateAddress
    )) as CrossChainCounter;
    await counter.deployed();

    console.log(
      `The CrossChainCounter has been deployed at ${counter.address}`
    );
    console.log(
      `on the chain ${hre.network.name} (chainId: ${hre.ethers.provider.network.chainId})`
    );
    console.log(`Now deploy CrossChainIncrementor on the other chain`);
    console.log("Then grant them permission to call CrossChainCounter");
  });

task("deploy-incrementor", "Deploys CrossChainIncrementor")
  .addParam(
    "counterAddress",
    "The address of the CrossChainCounter on the given chain"
  )
  .addParam(
    "counterChainId",
    "The chain ID where CrossChainCounter has been deployed"
  )
  .addOptionalParam(
    "deBridgeGateAddress",
    "",
    "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA"
  )
  .setAction(async (args, hre) => {
    const Incrementor = (await hre.ethers.getContractFactory(
      "CrossChainIncrementor"
    )) as CrossChainIncrementor__factory;
    const incrementor = (await Incrementor.deploy(
      args.deBridgeGateAddress,
      args.counterChainId,
      args.counterAddress
    )) as CrossChainIncrementor;
    await incrementor.deployed();

    console.log(
      `The CrossChainIncrementor has been deployed at ${incrementor.address}`
    );
    console.log(
      `on the chain ${hre.network.name} (chainId: ${hre.ethers.provider.network.chainId})`
    );
    console.log(`It will send commends to CrossChainCounter which is `);
    console.log(
      `deployed at ${args.counterAddress} on the chainId ${args.counterChainId}`
    );
    console.log(
      `But first you need to enable CrossChainCounter to accept messages`
    );
    console.log(`from this newly deployed CrossChainIncrementor`);
  });

task(
  "configure-counter",
  "Enables the given CrossChainCounter to accept commands from the given CrossChainIncrementor"
)
  .addParam(
    "counterAddress",
    "The address of the CrossChainCounter on the current chain"
  )
  .addParam(
    "incrementorAddress",
    "The address of the CrossChainIncrementor on the given chain"
  )
  .addParam(
    "incrementorChainId",
    "The chain ID where CrossChainIncrementor has been deployed"
  )
  .setAction(async (args, hre) => {
    const Counter = (await hre.ethers.getContractFactory(
      "CrossChainCounter"
    )) as CrossChainCounter__factory;
    const counter = Counter.attach(args.counterAddress);

    const tx = await counter.addChainSupport(
      args.incrementorChainId,
      args.incrementorAddress
    );
    await tx.wait();

    console.log(
      `The CrossChainCounter can now accept calls coming from the CrossChainIncrementor`
    );
    console.log(`which is deployed on the ${args.incrementorChainId} chain `);
  });

task(
  "send-increment",
  "Asks CrossChainIncrementor on the given chain to increment CrossChainCounter's value by the given amount"
)
  .addParam(
    "incrementorAddress",
    "The address of the CrossChainIncrementor on the current chain"
  )
  .addOptionalParam(
    "incrementBy",
    "The amount to increment CrossChainCounter's value by",
    "10"
  )
  .addOptionalParam("executionFeeAmount", "", "0")
  .setAction(async (args, hre) => {
    const Incrementor = (await hre.ethers.getContractFactory(
      "CrossChainIncrementor"
    )) as CrossChainIncrementor__factory;
    const incrementor = Incrementor.attach(args.incrementorAddress);

    const Gate = (await hre.ethers.getContractFactory(
      "DeBridgeGate"
    )) as DeBridgeGate__factory;
    const gate = Gate.attach(await incrementor.deBridgeGate());

    const protocolFee = await gate.globalFixedNativeFee();
    const value = protocolFee.add(BigNumber.from(args.executionFeeAmount));
    const tx = await incrementor.increment(
      args.incrementBy,
      args.executionFeeAmount,
      {
        value,
      }
    );
    const receipt = tx.wait();

    console.log(`Tx has been submitted: ${(await receipt).transactionHash}`);
    console.log("Looking for submission id");

    const events = (await gate.queryFilter(gate.filters.Sent())) as SentEvent[];
    const sentEvent = events.pop();
    console.log("SubmissionID: ", sentEvent?.args.submissionId);
  });

task(
  "read-increment",
  "Prints the current state value of the given CrossChainCounter"
)
  .addParam(
    "counterAddress",
    "The address of the CrossChainCounter on the current chain"
  )
  .setAction(async (args, hre) => {
    const Counter = (await hre.ethers.getContractFactory(
      "CrossChainCounter"
    )) as CrossChainCounter__factory;
    const counter = Counter.attach(args.counterAddress);
    const currentValue = (await counter.counter()) as BigNumber;

    console.log("Current CrossChainCounter value: ", currentValue.toString());
  });
