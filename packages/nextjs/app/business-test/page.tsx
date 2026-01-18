"use client";

import { useState } from "react";
import { CustomLoginButton } from "~~/components/auth/CustomLoginButton";
import { useBalance, useTransfer, useTransferHistory } from "~~/hooks/api/useAssets";
import { useDividend, useDividendHistory } from "~~/hooks/api/useDividends";
import { useBuyNode, useHashpower, useNodeTypes } from "~~/hooks/api/useNodes";
import { useDepositAddress, useWithdraw } from "~~/hooks/api/usePayment";
import { useAuthStore } from "~~/services/store/authStore";
import { notification } from "~~/utils/scaffold-eth";

export default function BusinessTestPage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#39FF14]">Business Modules Verification</h1>

      <div className="flex justify-center mb-8">
        <CustomLoginButton />
      </div>

      {!isAuthenticated ? (
        <div className="text-center text-xl text-gray-500">Please login to test business modules.</div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          <AssetsSection />
          <NodesSection />
          <PaymentSection />
          <DividendsSection />
        </div>
      )}
    </div>
  );
}

const AssetsSection = () => {
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance();
  const { mutate: transfer, isPending: isTransferPending } = useTransfer();
  const { data: historyData } = useTransferHistory(1, 10);

  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const handleTransfer = () => {
    if (!transferTo || !transferAmount) return;
    transfer({ to_address: transferTo, amount: transferAmount });
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-secondary">1. Assets Module</h2>

      {/* Balance */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat bg-black/30 rounded-lg">
          <div className="stat-title">TCM Balance</div>
          <div className="stat-value text-primary">{balanceData?.data?.tcm_balance || "0"}</div>
        </div>
        <div className="stat bg-black/30 rounded-lg">
          <div className="stat-title">USDT Balance</div>
          <div className="stat-value text-success">{balanceData?.data?.usdt_balance || "0"}</div>
        </div>
        <div className="stat bg-black/30 rounded-lg">
          <div className="stat-title">Locked TCM</div>
          <div className="stat-value text-warning">{balanceData?.data?.locked_tcm || "0"}</div>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <h3 className="font-bold mb-2">Off-chain Transfer</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="To Address"
            className="input input-bordered flex-1"
            value={transferTo}
            onChange={e => setTransferTo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            className="input input-bordered flex-1"
            value={transferAmount}
            onChange={e => setTransferAmount(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleTransfer} disabled={isTransferPending}>
            {isTransferPending ? "Sending..." : "Transfer"}
          </button>
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="font-bold mb-2">Transfer History (Recent 10)</h3>
        <div className="overflow-x-auto">
          <table className="table table-xs">
            <thead>
              <tr>
                <th>ID</th>
                <th>To</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyData?.data?.list?.map((record: any) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.to_address}</td>
                  <td>{record.amount}</td>
                  <td>{record.status === 1 ? "Success" : "Failed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const NodesSection = () => {
  const { data: nodeTypes } = useNodeTypes();
  const { mutate: buyNode, isPending: isBuying } = useBuyNode();
  const { data: hashpower } = useHashpower();

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-accent">2. Nodes & Hashpower</h2>

      {/* Hashpower */}
      <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
        <p>
          <strong>Total Hashpower:</strong> {hashpower?.data?.total_hash_power || "0"}
        </p>
        <p>
          <strong>Effective Hashpower:</strong> {hashpower?.data?.effective_hash_power || "0"}
        </p>
        <p>
          <strong>Node Hashpower:</strong> {hashpower?.data?.node_hash_power || "0"}
        </p>
      </div>

      {/* Node List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {nodeTypes?.data?.map((node: any) => (
          <div key={node.type} className="card bg-base-300 p-4 flex flex-col items-center">
            <h3 className="font-bold text-lg">{node.name}</h3>
            <p className="text-sm my-2">Price: {node.usd_amount} USDT</p>
            <p className="text-xs text-gray-400 mb-4">+ {node.hash_power} Hashpower</p>
            <p className="text-xs text-warning mb-2">Locked: {node.tcm_locked} TCM</p>
            <button
              className="btn btn-sm btn-accent w-full"
              onClick={() => buyNode({ node_type: node.type })}
              disabled={isBuying}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PaymentSection = () => {
  const { mutate: getAddr, data: addrData, isPending: isGettingAddr } = useDepositAddress();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw();

  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = () => {
    if (!withdrawAddr || !withdrawAmount) return;
    withdraw({ to_address: withdrawAddr, amount: withdrawAmount });
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-info">3. Payment (Deposit/Withdraw)</h2>

      <div className="flex gap-10">
        {/* Deposit */}
        <div className="flex-1">
          <h3 className="font-bold mb-2">Deposit</h3>
          <button className="btn btn-outline btn-info mb-2" onClick={() => getAddr()} disabled={isGettingAddr}>
            Get Deposit Address
          </button>
          {addrData?.data && (
            <div className="p-2 bg-black/50 rounded font-mono text-sm break-all">
              {addrData.data.address} <br />
              <span className="text-xs text-gray-500">Chain: {addrData.data.chain}</span>
            </div>
          )}
        </div>

        {/* Withdraw */}
        <div className="flex-1">
          <h3 className="font-bold mb-2">Withdraw</h3>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="To Address"
              className="input input-bordered"
              value={withdrawAddr}
              onChange={e => setWithdrawAddr(e.target.value)}
            />
            <input
              type="text"
              placeholder="Amount"
              className="input input-bordered"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
            />
            <button className="btn btn-error" onClick={handleWithdraw} disabled={isWithdrawing}>
              Apply Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DividendsSection = () => {
  const { data: dividendData } = useDividend();
  const { data: historyData } = useDividendHistory(1, 10);

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">4. Dividends</h2>

      <div className="flex gap-10 mb-6">
        <div className="stat bg-base-200 rounded-lg w-auto">
          <div className="stat-title">Dividend Count</div>
          <div className="stat-value text-primary">{dividendData?.data?.dividend_count || "0"}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg w-auto">
          <div className="stat-title">Pending Dividend</div>
          <div className="stat-value">{dividendData?.data?.pending_dividend || "0"}</div>
        </div>
      </div>

      <h3 className="font-bold mb-2">History</h3>
      <div className="overflow-x-auto h-40">
        <table className="table table-xs">
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Token</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {historyData?.data?.list?.map((record: any) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.amount}</td>
                <td>{record.token_type}</td>
                <td>{record.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
