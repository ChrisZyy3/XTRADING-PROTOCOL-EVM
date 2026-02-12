"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";

export default function NewDepositPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useGlobalState();

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in-up">
      <h1 className="text-3xl md:text-5xl font-bold mb-12 text-center text-[#39FF14] uppercase font-display text-glow">
        {t.newDeposit.title}
      </h1>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-6 mt-20">
          <div className="text-center text-xl text-gray-400 font-display">{t.newDeposit.loginPrompt}</div>
        </div>
      ) : (
        <DepositSection balance={user?.tcm_balance || "0"} />
      )}
    </div>
  );
}

const DepositSection = ({ balance }: { balance: string }) => {
  const { t } = useGlobalState();
  const { address } = useAccount();
  const { data: bnbBalance } = useBalance({ address });

  // Get Contract Address Dynamically
  const { data: deployedContractData } = useDeployedContractInfo("TCMTokenWithVault");
  const contractAddress = deployedContractData?.address;

  // Contract Hooks
  const { writeContractAsync: depositAsync, isMining: isDepositing } = useScaffoldWriteContract("TCMTokenWithVault");
  const { writeContractAsync: approveAsync, isMining: isApproving } = useScaffoldWriteContract("TCMTokenWithVault");

  // Read Token Data
  const { data: tokenDecimals } = useScaffoldReadContract({
    contractName: "TCMTokenWithVault",
    functionName: "decimals",
  });

  const { data: tokenBalance, refetch: refetchTokenBalance } = useScaffoldReadContract({
    contractName: "TCMTokenWithVault",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: allowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "TCMTokenWithVault",
    functionName: "allowance",
    args: [address, contractAddress],
  });

  const { data: vaultBalance, refetch: refetchVaultBalance } = useScaffoldReadContract({
    contractName: "TCMTokenWithVault",
    functionName: "getVaultBalance",
    args: [address],
  });

  const [depositAmount, setDepositAmount] = useState("");

  const handleApprove = async () => {
    if (!contractAddress) {
      console.error("Contract address not found");
      return;
    }

    const decimals = tokenDecimals ?? 18;
    const amountToApprove = depositAmount
      ? parseUnits(depositAmount, decimals)
      : BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");

    try {
      await approveAsync({
        functionName: "approve",
        args: [contractAddress, amountToApprove],
      });
      await refetchAllowance();
    } catch (e) {
      console.error("Approve failed", e);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;

    const decimals = tokenDecimals ?? 18;
    const amount = parseUnits(depositAmount, decimals);

    console.log("Depositing:", {
      amount: amount.toString(),
      decimals,
      allowance: allowance?.toString(),
      contractAddress,
    });

    try {
      await depositAsync({
        functionName: "deposit",
        args: [amount],
      });
      setDepositAmount("");
      // Use setTimeout to allow chain capability to update
      setTimeout(() => {
        refreshAll();
      }, 3000);
    } catch (e) {
      console.error("Deposit failed", e);
    }
  };

  const refreshAll = () => {
    refetchTokenBalance();
    refetchAllowance();
    refetchVaultBalance();
  };

  const needsApproval =
    (allowance || 0n) === 0n || (!!depositAmount && (allowance || 0n) < parseUnits(depositAmount, tokenDecimals || 18));

  const hasDepositInput = depositAmount.trim().length > 0;
  const canSubmitDeposit = hasDepositInput && !needsApproval && !isDepositing;
  const depositButtonColorClass = !hasDepositInput
    ? "bg-[#2A2F3A] border-[#2A2F3A] text-[#8E95A3] hover:bg-[#2A2F3A]"
    : needsApproval
      ? "bg-[#204736] border-[#2A5C45] text-[#9EF6C3] hover:bg-[#204736]"
      : "bg-[#39FF14] border-[#39FF14] text-black hover:bg-[#4dff2f] shadow-[0_0_18px_rgba(57,255,20,0.35)]";

  return (
    <div className="card card-premium p-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-display mb-2">{t.newDeposit.depositToVault}</h2>
        <button
          onClick={refreshAll}
          className="btn btn-ghost btn-xs text-gray-400 hover:text-white"
          title="Refresh all balances"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      <p className="text-gray-400 text-sm mb-6">{t.newDeposit.description}</p>

      {/* Wallet & Balance Info */}
      <div className="bg-[#1a2c25] rounded-xl p-4 mb-6 border border-[#203731] text-sm space-y-2 font-mono">
        <div className="flex justify-between">
          <span className="text-gray-500">{t.newDeposit.wallet}:</span>
          <span className="text-white truncate max-w-[150px]" title={address}>
            {address}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t.newDeposit.bnb}:</span>
          <span className="text-[#F0B90B]">
            {bnbBalance ? parseFloat(bnbBalance?.formatted).toFixed(4) : "..."} BNB
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t.newDeposit.tcmBalance}:</span>
          <span className="text-[#39FF14]">
            {tokenBalance !== undefined ? parseFloat(formatUnits(tokenBalance, tokenDecimals || 18)).toFixed(2) : "..."}{" "}
            TCM
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t.newDeposit.vaultBalance}:</span>
          <span className="text-blue-400">
            {vaultBalance !== undefined ? parseFloat(formatUnits(vaultBalance, tokenDecimals || 18)).toFixed(2) : "..."}{" "}
            TCM
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t.newDeposit.allowance}:</span>
          <span className={allowance && allowance > 0n ? "text-green-400" : "text-red-400"}>
            {allowance && allowance > BigInt("1000000000000000000000000000000")
              ? t.newDeposit.unlimited
              : allowance !== undefined
                ? parseFloat(formatUnits(allowance, tokenDecimals || 18)).toLocaleString() + " TCM"
                : "..."}
          </span>
        </div>
      </div>

      {/* Deposit Form */}
      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-gray-400">{t.newDeposit.depositAmount}</span>
          </label>
          <div className="join w-full">
            <input
              type="text"
              className="input input-bordered join-item w-full bg-black/50 border-[#203731] text-white focus:border-[#39FF14]"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder="e.g. 100"
            />
            <button
              className="btn join-item bg-[#203731] border-[#203731] text-white hover:bg-[#2a453d]"
              onClick={() => {
                if (tokenBalance) {
                  setDepositAmount(formatUnits(tokenBalance, tokenDecimals || 18));
                }
              }}
            >
              {t.newDeposit.max}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {needsApproval && (
            <button className="btn btn-primary flex-1 font-bold" onClick={handleApprove} disabled={isApproving}>
              {isApproving ? <span className="loading loading-spinner loading-xs"></span> : t.newDeposit.approve}
            </button>
          )}
          <button
            className={`btn flex-1 font-bold transition-all duration-200 ${depositButtonColorClass} disabled:opacity-100 disabled:cursor-not-allowed`}
            onClick={handleDeposit}
            disabled={!canSubmitDeposit}
          >
            {isDepositing ? <span className="loading loading-spinner loading-xs"></span> : t.newDeposit.deposit}
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-8 text-xs text-gray-500">
        <p>
          <strong>{t.newDeposit.note.title}</strong>
        </p>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>{t.newDeposit.note.line1}</li>
          <li>{t.newDeposit.note.line2}</li>
          <li>{t.newDeposit.note.line3}</li>
        </ul>
      </div>
    </div>
  );
};
