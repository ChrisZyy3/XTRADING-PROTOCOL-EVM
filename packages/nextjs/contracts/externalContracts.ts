import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const externalContracts = {
    97: {
        TCMTokenWithVault: {
            address: "0x6dE2c12780F547A9f8dD3A7b83C82A2d41FC38C8",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "spender",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "allowance",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "needed",
                            type: "uint256",
                        },
                    ],
                    name: "ERC20InsufficientAllowance",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "amount",
                            type: "uint256",
                        },
                    ],
                    name: "deposit",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "amount",
                            type: "uint256",
                        },
                    ],
                    name: "withdraw",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "spender",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "amount",
                            type: "uint256",
                        },
                    ],
                    name: "approve",
                    outputs: [
                        {
                            internalType: "bool",
                            name: "",
                            type: "bool",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "account",
                            type: "address",
                        },
                    ],
                    name: "balanceOf",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "spender",
                            type: "address",
                        },
                    ],
                    name: "allowance",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "decimals",
                    outputs: [
                        {
                            internalType: "uint8",
                            name: "",
                            type: "uint8",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "account",
                            type: "address",
                        },
                    ],
                    name: "vaultBalanceOf",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
            ],
        },
    },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
