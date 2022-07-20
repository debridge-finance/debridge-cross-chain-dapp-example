import chalk from "chalk";
import { BigNumber } from "ethers";
import { task } from "hardhat/config";

import {
  CrossChainCounter,
  CrossChainCounter__factory,
  CrossChainIncrementor,
  CrossChainIncrementor__factory,
  DeBridgeGate__factory,
} from "../../typechain";
import { SentEvent } from "../../typechain/IDeBridgeGate";

const DEFAULT_DEBRIDGE_ADDRESS = "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA";

task("deploy-counter", "Deploys CrossChainCounter")
  .addOptionalParam(
    "deBridgeGateAddress",
    "Address of the deBridgeGate contract on the current chain (default value represents the mainnet address)",
    DEFAULT_DEBRIDGE_ADDRESS
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
      chalk.green("CrossChainCounter"),
      `has been deployed at ${chalk.red(counter.address)}`,
      `on the chain ${hre.network.name} (chainId: ${chalk.red(
        hre.ethers.provider.network.chainId
      )})`
    );
    console.log(
      `You can now deploy the ${chalk.blue(
        "CrossChainIncrementor"
      )} contract to another chain using the address above,`
    );
    console.log(
      `then grant them a permission to make cross-chain calls by running ${chalk.underline(
        "configure-counter"
      )}`
    );
  });

task("deploy-incrementor", "Deploys CrossChainIncrementor")
  .addParam(
    "counterAddress",
    "Address of the CrossChainCounter contract on the given chain"
  )
  .addParam(
    "counterChainId",
    "The chain ID where CrossChainCounter has been deployed"
  )
  .addOptionalParam(
    "deBridgeGateAddress",
    "Address of the deBridgeGate contract on the current chain (default value represents the mainnet address)",
    DEFAULT_DEBRIDGE_ADDRESS
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
      chalk.blue("CrossChainIncrementor"),
      `has been deployed at ${chalk.red(incrementor.address)}`,
      `on the chain ${hre.network.name} (chainId: ${chalk.red(
        hre.ethers.provider.network.chainId
      )})`
    );
    console.log(
      `Now you probably need to grant it a permission to make cross-chain calls to the ${chalk.green(
        "CrossChainCounter"
      )} contract,`,
      `run ${chalk.underline("configure-counter")} using the data above`
    );
  });

task(
  "configure-counter",
  "Adds the given CrossChainIncrementor address as a trusted cross-chain caller for the given CrossChainCounter"
)
  .addParam(
    "counterAddress",
    "Address of the CrossChainCounter on the current chain"
  )
  .addParam(
    "incrementorAddress",
    "Address of the CrossChainIncrementor on the given chain"
  )
  .addParam(
    "incrementorChainId",
    "Chain ID where CrossChainIncrementor has been deployed"
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
      `${chalk.green(
        "CrossChainCounter"
      )} can now accept cross-chain calls originating`,
      `from the CrossChainIncrementor address ${args.incrementorAddress} from the chain id ${args.incrementorChainId}`
    );
    console.log(
      `Run ${chalk.underline(
        "send-increment"
      )} to initiate your first cross-chain transaction!`
    );
  });

task(
  "send-increment",
  "Calls the CrossChainIncrementor contract on the given chain to construct and broadcast a call to increment CrossChainCounter's value by the given amount"
)
  .addParam(
    "incrementorAddress",
    "Address of the CrossChainIncrementor contract on the current chain"
  )
  .addOptionalParam(
    "incrementBy",
    "Amount to increment CrossChainCounter's value by",
    "10"
  )
  .addOptionalParam(
    "executionFeeAmount",
    "Amount of ethers to bridge along with the message to incetivize a third party to execute a transaction on the destination chain",
    "0"
  )
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
    const tx = await incrementor.incrementWithIncludedGas(
      args.incrementBy,
      args.executionFeeAmount,
      {
        value,
      }
    );
    const receipt = await tx.wait();

    console.log(
      `Tx has been included in the blockchain: ${chalk.red(
        receipt.transactionHash
      )}`
    );
    console.log("Looking for deBridgeGate submission id...");

    const events = (await gate.queryFilter(gate.filters.Sent())) as SentEvent[];
    const sentEvent = events
      .reverse()
      .find((ev) => ev.transactionHash === receipt.transactionHash);
    console.log("SubmissionID:", chalk.red(sentEvent?.args.submissionId));
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

    console.log(
      "Current CrossChainCounter value:",
      chalk.green(currentValue.toString())
    );
  });
