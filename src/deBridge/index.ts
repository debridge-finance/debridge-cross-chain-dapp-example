import './type-extensions';
import { extendEnvironment } from 'hardhat/config';
import { lazyObject } from 'hardhat/plugins';
import { DeployDebridgeGateFunction, GetClaimArgsFunction } from './functions';

export interface DeBridge {
  emulator: {
    deployGate: DeployDebridgeGateFunction;
    getClaimArgs: GetClaimArgsFunction;
  }
}

extendEnvironment(hre => {
  hre.deBridge = lazyObject((): DeBridge => {
    const { makeDeployGate, makeGetClaimArgs } = require("./functions")

    return {
      emulator: {
        deployGate: makeDeployGate(hre),
        getClaimArgs: makeGetClaimArgs(hre),
      }
    };
  });
});
