/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  CrossChainIncrementor,
  CrossChainIncrementorInterface,
} from "../CrossChainIncrementor";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IDeBridgeGateExtended",
        name: "deBridgeGate_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "crossChainCounterResidenceChainID_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "crossChainCounterResidenceAddress_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "deBridgeGate",
    outputs: [
      {
        internalType: "contract IDeBridgeGateExtended",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_amount",
        type: "uint8",
      },
    ],
    name: "increment",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_amount",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_executionFee",
        type: "uint256",
      },
    ],
    name: "incrementWithIncludedGas",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516108e53803806108e583398101604081905261002f91610066565b600080546001600160a01b039485166001600160a01b031991821617909155600192909255600280549190931691161790556100c1565b60008060006060848603121561007b57600080fd5b8351610086816100a9565b60208501516040860151919450925061009e816100a9565b809150509250925092565b6001600160a01b03811681146100be57600080fd5b50565b610815806100d06000396000f3fe6080604052600436106100345760003560e01c8063a78730a514610039578063ca777fbf1461004e578063d6b46330146100a4575b600080fd5b61004c610047366004610613565b6100b7565b005b34801561005a57600080fd5b5060005461007b9073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f35b61004c6100b23660046105f8565b610255565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166335087f0a6040518163ffffffff1660e01b8152600401602060405180830381600087803b15801561012257600080fd5b505af1158015610136573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061015a91906105df565b905061016682826107a0565b3410156101d4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f666565206e6f7420636f766572656420627920746865206d73672e76616c756560448201526064015b60405180910390fd5b6040805160ff85166024820152336044808301919091528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fcca5afd40000000000000000000000000000000000000000000000000000000017905261024f81846103e5565b50505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166335087f0a6040518163ffffffff1660e01b8152600401602060405180830381600087803b1580156102c057600080fd5b505af11580156102d4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102f891906105df565b905080341015610364576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f666565206e6f7420636f766572656420627920746865206d73672e76616c756560448201526064016101cb565b6040805160ff84166024820152336044808301919091528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fcca5afd4000000000000000000000000000000000000000000000000000000001790526103e08160006103e5565b505050565b6104106040518060800160405280600081526020016000815260200160608152602001606081525090565b818152602081015161042590600260016105a5565b60208201819052610438906001806105a5565b602080830191909152606082018490526040516104829133910160609190911b7fffffffffffffffffffffffffffffffffffffffff00000000000000000000000016815260140190565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529181528281019190915260008054600154600254935160609490941b7fffffffffffffffffffffffffffffffffffffffff00000000000000000000000016602085015273ffffffffffffffffffffffffffffffffffffffff9091169263be2974769234929091879190603401604051602081830303815290604052600160008960405160200161053d919061072c565b6040516020818303038152906040526040518963ffffffff1660e01b815260040161056e97969594939291906106a8565b6000604051808303818588803b15801561058757600080fd5b505af115801561059b573d6000803e3d6000fd5b5050505050505050565b600081156105b957506001821b83176105c2565b506001821b1983165b9392505050565b803560ff811681146105da57600080fd5b919050565b6000602082840312156105f157600080fd5b5051919050565b60006020828403121561060a57600080fd5b6105c2826105c9565b6000806040838503121561062657600080fd5b61062f836105c9565b946020939093013593505050565b6000815180845260005b8181101561066357602081850181015186830182015201610647565b81811115610675576000602083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b600061010073ffffffffffffffffffffffffffffffffffffffff8a1683528860208401528760408401528060608401526106e48184018861063d565b90508281038060808501526000825286151560a085015263ffffffff861660c08501526020810160e08501525061071e602082018561063d565b9a9950505050505050505050565b602081528151602082015260208201516040820152600060408301516080606084015261075c60a084018261063d565b905060608401517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0848303016080850152610797828261063d565b95945050505050565b600082198211156107da577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b50019056fea26469706673582212208405d25b4988d47b4d7026b64a764c43f56d36b6b98b5b6a7162352276e2275164736f6c63430008070033";

export class CrossChainIncrementor__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    deBridgeGate_: string,
    crossChainCounterResidenceChainID_: BigNumberish,
    crossChainCounterResidenceAddress_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<CrossChainIncrementor> {
    return super.deploy(
      deBridgeGate_,
      crossChainCounterResidenceChainID_,
      crossChainCounterResidenceAddress_,
      overrides || {}
    ) as Promise<CrossChainIncrementor>;
  }
  getDeployTransaction(
    deBridgeGate_: string,
    crossChainCounterResidenceChainID_: BigNumberish,
    crossChainCounterResidenceAddress_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      deBridgeGate_,
      crossChainCounterResidenceChainID_,
      crossChainCounterResidenceAddress_,
      overrides || {}
    );
  }
  attach(address: string): CrossChainIncrementor {
    return super.attach(address) as CrossChainIncrementor;
  }
  connect(signer: Signer): CrossChainIncrementor__factory {
    return super.connect(signer) as CrossChainIncrementor__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CrossChainIncrementorInterface {
    return new utils.Interface(_abi) as CrossChainIncrementorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CrossChainIncrementor {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as CrossChainIncrementor;
  }
}
