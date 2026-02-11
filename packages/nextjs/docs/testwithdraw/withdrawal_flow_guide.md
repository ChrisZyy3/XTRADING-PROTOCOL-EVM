# TCM Token 提现流程文档

## 概述

本文档详细说明 TCM Token 的提现流程，包括前端调用、后端 API 和合约交互的完整步骤。

## 当前部署状态

| 项目 | 值 |
|------|-----|
| 网络 | BSC 测试网 (Chain ID: 97) |
| 合约地址 | `0x8F55456D0ea9fa160801110DE5B01D6D87015bd4` |
| 合约 Owner | `0xaBDc3DA893132B205F193799609B11d5d8260B4D` |
| 后端签名者 | `0x5234c52AE04e80256da8FB799347641dA141DFcA` |
| 提现手续费 | 20% |
| 后端服务 | `http://localhost:8080` |

## 完整提现流程

```
┌─────────────────────────────────────────────────────────────────┐
│ 步骤 1: 前端请求提现签名                                         │
│ ───────────────────────────────────────────────────────────────│
│ 调用: POST /api/v1/withdraw/request-signed                     │
│ 参数: { "amount": "500" }                                       │
│ 头部: Authorization: Bearer <JWT_TOKEN>                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 步骤 2: 后端处理并返回签名                                       │
│ ───────────────────────────────────────────────────────────────│
│ 1. 验证 JWT Token 获取 userID                                   │
│ 2. 查询用户数据库 TCM 余额                                      │
│ 3. 扣除数据库余额（防止双花）                                    │
│ 4. 生成唯一 orderId（格式: WD-{timestamp}-{random}）            │
│ 5. 计算 deadline（当前时间 + 30分钟）                            │
│ 6. 使用后端私钥对消息签名                                        │
│ 7. 保存订单到数据库（状态: pending）                             │
│ 8. 返回签名数据给前端                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 步骤 3: 前端调用合约提现                                         │
│ ───────────────────────────────────────────────────────────────│
│ 调用: contract.withdrawSigned(                                  │
│   user,           // 用户钱包地址                                │
│   amount,         // 提现数量 (wei)                              │
│   orderId,        // 订单ID                                      │
│   deadline,       // 过期时间 (Unix timestamp)                   │
│   signature       // 后端签名                                    │
│ )                                                                 │
│                                                                  │
│ 合约内部执行:                                                     │
│ 1. 验证 msg.sender == user                                      │
│ 2. 验证 block.timestamp <= deadline                             │
│ 3. 验证 orderId 未被处理过                                       │
│ 4. 验证签名来自 backendSigner                                   │
│ 5. 检查用户 vault 余额 >= amount                                │
│ 6. 扣除 vault 余额（全额）                                       │
│ 7. 计算手续费 = amount * 20%                                     │
│ 8. 转账 (amount - 手续费) 给用户                                 │
│ 9. 转账手续费到 feePool                                         │
│ 10. 发出 WithdrawalProcessed 事件                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 步骤 4: 区块链监听器处理事件                                     │
│ ───────────────────────────────────────────────────────────────│
│ 监听: WithdrawalProcessed 事件                                   │
│ 处理: 更新订单状态为 completed                                   │
└─────────────────────────────────────────────────────────────────┘
```

## API 端点详细说明

### 1. 请求提现签名（核心接口）

**端点**: `POST /api/v1/withdraw/request-signed`

**请求头**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**请求体**:
```json
{
  "amount": "500"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | string | 是 | TCM 数量（单位：TCM，不是 wei）|
| destination_address | string | 否 | 目标地址（旧接口需要，新接口从用户信息获取）|

**成功响应** (200 OK):
```json
{
  "code": 0,
  "message": "withdrawal request created, please sign with the provided data",
  "data": {
    "order_id": "WD1739250400abc123",
    "amount": "500000000000000000000",
    "fee_amount": "100000000000000000000",
    "net_amount": "400000000000000000000",
    "deadline": 1739250400,
    "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "contract_address": "0x8F55456D0ea9fa160801110DE5B01D6D87015bd4",
    "message": "请在 30 分钟内使用签名数据调用合约 withdraw 函数"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| order_id | string | 唯一订单ID，格式: WD-{timestamp}-{random} |
| amount | string | 提现总额（wei），即用户请求的数量 |
| fee_amount | string | 手续费（wei），amount × 20% |
| net_amount | string | 实际到账（wei），amount × 80% |
| deadline | int64 | 过期时间（Unix 时间戳），当前时间 + 1800 秒 |
| signature | string | 后端签名（65 字节），用于合约验证 |
| contract_address | string | 合约地址 |
| message | string | 提示信息 |

**错误响应**:
```json
{
  "code": 1001,
  "message": "invalid request"
}
```

| 错误码 | 说明 |
|--------|------|
| 1001 | 请求参数无效 |
| 1002 | 金额格式错误 |
| 1005 | 未授权（JWT Token 无效或过期）|
| 3006 | 余额不足或其他业务错误 |

### 2. 查询提现历史

**端点**: `GET /api/v1/withdraw/history`

**请求头**:
```
Authorization: Bearer <JWT_TOKEN>
```

**查询参数**:
```
?page=1&limit=20
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| limit | int | 否 | 20 | 每页数量（最大 100）|

**成功响应** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "withdrawals": [
      {
        "id": 123,
        "amount": "500.000000000000000000",
        "status": "completed",
        "tx_hash": "0xabc123...",
        "created_at": "1739250400",
        "processed_at": "1739250460"
      }
    ]
  }
}
```

### 3. 查询提现状态

**端点**: `GET /api/v1/withdraw/status/:request_id`

**请求头**:
```
Authorization: Bearer <JWT_TOKEN>
```

**路径参数**:
```
request_id: 123
```

**成功响应** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "request_id": "123",
    "status": "completed",
    "amount": "500.000000000000000000",
    "created_at": "1739250400"
  }
}
```

**订单状态**:
- `pending`: 待处理（已扣除数据库余额，等待合约调用）
- `completed`: 已完成（合约提现成功）
- `failed`: 失败

## 合约函数详细说明

### withdrawSigned

```solidity
function withdrawSigned(
    address user,           // 用户钱包地址
    uint256 amount,         // 提现数量（wei）
    string calldata orderId, // 订单ID
    uint256 deadline,       // 过期时间（Unix timestamp）
    bytes calldata signature // 后端签名（65字节）
) external nonReentrant
```

**参数说明**:

| 参数 | 类型 | 说明 |
|------|------|------|
| user | address | 调用者的钱包地址，必须与 msg.sender 相同 |
| amount | uint256 | 提现数量（wei），必须与后端签名中的数量一致 |
| orderId | string | 订单ID，后端生成的唯一标识符 |
| deadline | uint256 | 过期时间戳（Unix），必须大于当前区块时间 |
| signature | bytes | 后端签名（65字节），使用 EIP-191 标准签名 |

**合约执行流程**:
1. **验证调用者**: `require(msg.sender == user, "sender mismatch")`
2. **验证金额**: `require(amount > 0, "amount zero")`
3. **验证过期**: `require(block.timestamp <= deadline, "order expired")`
4. **验证订单唯一**: `require(!processedOrders[orderIdHash], "duplicate order")`
5. **验证签名**: 恢复签名者地址，验证为 backendSigner
6. **检查余额**: `require(vaultBalances[user] >= amount, "insufficient vault balance")`
7. **扣除余额**: `vaultBalances[user] -= amount`
8. **计算手续费**: `uint256 fee = (amount * withdrawFeeBps) / 10000;` （20% = 2000 bps）
9. **转账给用户**: `_transfer(user, amount - fee)`
10. **转账手续费**: `_transfer(feePool, fee)`
11. **标记订单已处理**: `processedOrders[orderIdHash] = true`
12. **发出事件**: `emit WithdrawalProcessed(user, amount, orderId, fee)`

## 前端完整调用示例

### 使用 ethers.js v6（推荐）

#### 1. 安装依赖

```bash
npm install ethers@6
```

#### 2. 配置文件

```javascript
// config/contract.js
export const CONTRACT_CONFIG = {
  address: '0x8F55456D0ea9fa160801110DE5B01D6D87015bd4',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  chainId: 97,  // BSC 测试网
  explorerUrl: 'https://testnet.bscscan.com'
};

export const API_CONFIG = {
  baseUrl: 'http://localhost:8080'
};
```

#### 3. 提现组件

```javascript
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, API_CONFIG } from './config/contract';

// 最小化 ABI（只包含需要的函数）
const CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "orderId", "type": "string"},
      {"name": "deadline", "type": "uint256"},
      {"name": "signature", "type": "bytes"}
    ],
    "name": "withdrawSigned",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getVaultBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": true, "name": "orderId", "type": "string"},
      {"indexed": false, "name": "fee", "type": "uint256"}
    ],
    "name": "WithdrawalProcessed",
    "type": "event"
  }
];

class WithdrawalManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.userAddress = null;
  }

  // 初始化连接
  async connect() {
    if (!window.ethereum) {
      throw new Error('请安装 MetaMask 或其他钱包');
    }

    // 连接到钱包
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.userAddress = await this.signer.getAddress();

    // 创建合约实例
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_ABI,
      this.signer
    );

    return this.userAddress;
  }

  // 切换到 BSC 测试网
  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }]  // 97 = 0x61
      });
    } catch (switchError) {
      // 如果网络不存在，添加网络
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x61',
            chainName: 'BNB Smart Chain Testnet',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'tBNB',
              decimals: 18
            },
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
            blockExplorerUrls: ['https://testnet.bscscan.com']
          }]
        });
      } else {
        throw switchError;
      }
    }
  }

  // 查询余额
  async getBalances() {
    const walletBalance = await this.contract.balanceOf(this.userAddress);
    const vaultBalance = await this.contract.getVaultBalance(this.userAddress);

    return {
      wallet: ethers.formatUnits(walletBalance, 18),
      vault: ethers.formatUnits(vaultBalance, 18)
    };
  }

  // 请求提现签名
  async requestWithdrawSignature(amountTCM) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('请先登录');
    }

    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/v1/withdraw/request-signed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amountTCM.toString() })
      }
    );

    const result = await response.json();

    if (result.code !== 0) {
      throw new Error(result.message || '请求失败');
    }

    return result.data;
  }

  // 执行提现
  async withdraw(amountTCM) {
    try {
      // 1. 请求签名
      console.log('步骤 1: 请求提现签名...');
      const signatureData = await this.requestWithdrawSignature(amountTCM);
      console.log('签名数据:', signatureData);

      // 2. 确认金额信息
      const amount = ethers.formatUnits(signatureData.amount, 18);
      const fee = ethers.formatUnits(signatureData.fee_amount, 18);
      const net = ethers.formatUnits(signatureData.net_amount, 18);

      console.log(`提现: ${amount} TCM`);
      console.log(`手续费: ${fee} TCM (20%)`);
      console.log(`实际到账: ${net} TCM (80%)`);

      // 3. 调用合约
      console.log('步骤 2: 调用合约...');
      const tx = await this.contract.withdrawSigned(
        this.userAddress,              // user
        signatureData.amount,          // amount (wei)
        signatureData.order_id,        // orderId
        signatureData.deadline,        // deadline
        signatureData.signature        // signature
      );

      console.log('交易已发送:', tx.hash);
      console.log('等待交易确认...');

      // 4. 等待确认
      const receipt = await tx.wait();
      console.log('交易已确认:', receipt.transactionHash);

      // 5. 查询事件
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'WithdrawalProcessed';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        console.log('提现事件:', parsed.args);
      }

      return {
        success: true,
        txHash: receipt.transactionHash,
        orderId: signatureData.order_id
      };

    } catch (error) {
      console.error('提现失败:', error);
      throw this.handleError(error);
    }
  }

  // 错误处理
  handleError(error) {
    const message = error.message || error.reason || '';

    if (message.includes('sender mismatch')) {
      return new Error('签名地址与调用者不匹配');
    } else if (message.includes('amount zero')) {
      return new Error('提现金额不能为零');
    } else if (message.includes('order expired')) {
      return new Error('订单已过期，请重新请求');
    } else if (message.includes('duplicate order')) {
      return new Error('订单重复，请使用新的订单ID');
    } else if (message.includes('invalid signature')) {
      return new Error('签名无效');
    } else if (message.includes('insufficient vault balance')) {
      return new Error('Vault 余额不足，请先充值');
    } else if (message.includes('insufficient funds')) {
      return new Error('BNB 余额不足以支付 Gas 费');
    } else if (message.includes('user rejected')) {
      return new Error('用户拒绝交易');
    }

    return error;
  }
}

// 使用示例
export default async function withdrawExample() {
  const manager = new WithdrawalManager();

  try {
    // 1. 连接钱包
    const address = await manager.connect();
    console.log('已连接:', address);

    // 2. 切换网络
    await manager.switchNetwork();

    // 3. 查询余额
    const balances = await manager.getBalances();
    console.log('钱包余额:', balances.wallet, 'TCM');
    console.log('Vault 余额:', balances.vault, 'TCM');

    // 4. 执行提现（500 TCM）
    const result = await manager.withdraw('500');
    console.log('提现成功:', result);

    alert(`提现成功！\n交易哈希: ${result.txHash}\n订单ID: ${result.orderId}`);

  } catch (error) {
    console.error('错误:', error);
    alert(`提现失败: ${error.message}`);
  }
}
```

#### 4. React Hook 示例

```javascript
import { useState, useEffect } from 'react';
import { WithdrawalManager } from './WithdrawalManager';

export function useWithdrawal() {
  const [manager, setManager] = useState(null);
  const [connected, setConnected] = useState(false);
  const [balances, setBalances] = useState({ wallet: '0', vault: '0' });
  const [loading, setLoading] = useState(false);

  // 初始化连接
  const connect = async () => {
    setLoading(true);
    try {
      const mgr = new WithdrawalManager();
      await mgr.connect();
      await mgr.switchNetwork();
      setManager(mgr);
      setConnected(true);

      const bals = await mgr.getBalances();
      setBalances(bals);
    } catch (error) {
      console.error('连接失败:', error);
      alert(`连接失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 提现
  const withdraw = async (amount) => {
    if (!manager) return;

    setLoading(true);
    try {
      const result = await manager.withdraw(amount);

      // 刷新余额
      const bals = await manager.getBalances();
      setBalances(bals);

      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    connected,
    balances,
    loading,
    connect,
    withdraw
  };
}

// 组件中使用
function WithdrawalComponent() {
  const { connected, balances, loading, connect, withdraw } = useWithdrawal();
  const [amount, setAmount] = useState('');

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入有效的金额');
      return;
    }

    try {
      const result = await withdraw(amount);
      alert(`提现成功！\n交易哈希: ${result.txHash}`);
      setAmount('');
    } catch (error) {
      alert(`提现失败: ${error.message}`);
    }
  };

  return (
    <div>
      {!connected ? (
        <button onClick={connect} disabled={loading}>
          {loading ? '连接中...' : '连接钱包'}
        </button>
      ) : (
        <div>
          <p>钱包余额: {balances.wallet} TCM</p>
          <p>Vault 余额: {balances.vault} TCM</p>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="提现数量 (TCM)"
          />
          <button onClick={handleWithdraw} disabled={loading}>
            {loading ? '处理中...' : '提现'}
          </button>
        </div>
      )}
    </div>
  );
}
```

## 合约函数说明

### withdrawSigned

```solidity
function withdrawSigned(
    address user,           // 用户地址
    uint256 amount,         // 提现数量 (wei)
    string calldata orderId, // 订单ID
    uint256 deadline,       // 过期时间 (Unix timestamp)
    bytes calldata signature // 后端签名
) external nonReentrant
```

**执行逻辑**:
1. 验证 `msg.sender == user`
2. 验证 `block.timestamp <= deadline`
3. 验证 `orderId` 未被处理过
4. 验证签名来自 `backendSigner`
5. 检查 vault 余额充足
6. 扣除 vault 余额（全额）
7. 计算 20% 手续费
8. 转账 80% 给用户
9. 转账 20% 到 feePool
10. 发出 `WithdrawalProcessed` 事件

## 完整测试流程

### 准备工作

#### 1. 检查合约状态

```bash
# 检查 backendSigner 配置
cast call 0x8F55456D0ea9fa160801110DE5B01D6D87015bd4 \
  "backendSigner()" \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545

# 期望输出: 0x0000000000000000000000005234c52ae04e80256da8fb799347641da141dfca

# 检查 feePool 配置
cast call 0x8F55456D0ea9fa160801110DE5B01D6D87015bd4 \
  "feePool()" \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545

# 期望输出: 0x0000000000000000000000005234c52ae04e80256da8fb799347641da141dfca

# 检查后端服务健康状态
curl http://localhost:8080/health
```

#### 2. 获取测试币

- **BNB 测试币**: https://testnet.bnbchain.org/faucet-smart
- **TCM 代币**: 需要合约 owner 转账

### 手动测试步骤

#### 步骤 1: 用户登录获取 JWT Token

```bash
# 假设登录接口返回 token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x...",
    "signature": "0x...",
    "message": "Login to XTG Platform"
  }'

# 保存返回的 token
export TOKEN="返回的_jwt_token"
```

#### 步骤 2: 检查用户余额

```bash
curl -X GET http://localhost:8080/api/v1/user/balance \
  -H "Authorization: Bearer $TOKEN"

# 返回示例:
# {
#   "code": 0,
#   "data": {
#     "tcm_balance": "10000.000000000000000000",
#     ...
#   }
# }
```

#### 步骤 3: 请求提现签名

```bash
curl -X POST http://localhost:8080/api/v1/withdraw/request-signed \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": "500"
  }'

# 返回示例:
# {
#   "code": 0,
#   "message": "withdrawal request created, please sign with the provided data",
#   "data": {
#     "order_id": "WD1739250400abc123",
#     "amount": "500000000000000000000",
#     "fee_amount": "100000000000000000000",
#     "net_amount": "400000000000000000000",
#     "deadline": 1739250400,
#     "signature": "0x1234...",
#     "contract_address": "0x8F55456D0ea9fa160801110DE5B01D6D87015bd4",
#     "message": "请在 30 分钟内使用签名数据调用合约 withdraw 函数"
#   }
# }
```

#### 步骤 4: 调用合约提现

```bash
# 使用 cast 调用合约
cast send 0x8F55456D0ea9fa160801110DE5B01D6D87015bd4 \
  "withdrawSigned(address,uint256,string,uint256,bytes)" \
  0xYourAddress \
  500000000000000000000 \
  "WD1739250400abc123" \
  1739250400 \
  0x1234... \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545 \
  --private-key YOUR_PRIVATE_KEY

# 交易成功后会返回交易哈希
# blockHash: 0x...
# transactionHash: 0x...
```

#### 步骤 5: 验证结果

```bash
# 1. 检查用户钱包余额增加（实际到账 80%）
cast call 0x8F55456D0ea9fa160801110DE5B01D6D87015bd4 \
  "balanceOf(address)(uint256)" \
  0xYourAddress \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545

# 2. 检查用户 vault 余额减少
cast call 0x8F55456D0ea9fa160801110DE5B01D6D87015bd4 \
  "getVaultBalance(address)(uint256)" \
  0xYourAddress \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545

# 3. 检查 feePool 余额增加（20% 手续费）
cast call 0x8F55456D0ea9fa160801110DE5B01D6D87015bd4 \
  "balanceOf(address)(uint256)" \
  0x5234c52AE04e80256da8FB799347641dA141DFcA \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545

# 4. 在浏览器查看交易
# https://testnet.bscscan.com/tx/YOUR_TX_HASH
```

## 常见错误及解决方案

### 后端 API 错误

| 错误码 | 错误信息 | 原因 | 解决方案 |
|--------|----------|------|----------|
| 1001 | invalid request | 请求参数格式错误 | 检查 JSON 格式 |
| 1002 | invalid amount | 金额格式错误或 <= 0 | 确保金额为正数 |
| 1005 | unauthorized | JWT Token 无效或过期 | 重新登录 |
| 3006 | insufficient TCM balance | 数据库余额不足 | 充值 TCM 代币 |
| 3006 | user wallet address not set | 用户未设置钱包地址 | 先绑定钱包地址 |

### 合约调用错误

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| sender mismatch | msg.sender != user | 确保调用者地址与签名中的 user 地址一致 |
| amount zero | 提现金额为 0 | 检查 amount 参数 |
| order expired | 当前时间 > deadline | 签名已过期，重新请求（30分钟有效期）|
| duplicate order | orderId 已被处理 | 使用新的订单 ID，不要重复使用 |
| invalid signature | 签名验证失败 | 检查后端签名服务配置，确认 backendSigner 正确 |
| insufficient vault balance | vault 余额不足 | 先充值到合约（调用 deposit）|
| insufficient funds for gas | BNB 余额不足支付 gas | 获取更多 BNB 测试币 |

### 调试技巧

#### 1. 查看交易详情

```bash
# 使用 cast 查看交易 receipt
cast receipt TX_HASH --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545

# 查看 transaction 中的 input data
cast tx TX_HASH --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545
```

#### 2. 模拟合约调用（不实际执行）

```bash
# 使用 cast call 先测试
cast call 0x8F55456D0ea9fa160801110DE5B01D6D87015bd4 \
  "withdrawSigned(address,uint256,string,uint256,bytes)" \
  0xYourAddress \
  500000000000000000000 \
  "WD1739250400abc123" \
  1739250400 \
  0x1234... \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545
```

#### 3. 监听事件

```bash
# 监听 WithdrawalProcessed 事件
cast logs \
  --address 0x8F55456D0ea9fa160801110DE5B01D6D87015bd4 \
  --event "WithdrawalProcessed(address,uint256,string,uint256)" \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545
```

## 注意事项

### 安全相关

1. **私钥管理**
   - 后端签名私钥必须妥善保管，不要提交到版本控制
   - 生产环境建议使用 KMS、AWS Secrets Manager 或类似服务
   - 定期轮换私钥

2. **签名验证**
   - 合约只验证 backendSigner 的签名
   - 如果 backendSigner 私钥泄露，立即使用 owner 权限更新

3. **订单唯一性**
   - 每次提现必须使用新的 orderId
   - 合约会记录已处理的订单，防止重复提现
   - 后端也预先扣除数据库余额，双重保障

### 用户体验

1. **余额显示**
   - 需要同时显示钱包余额和 Vault 余额
   - Vault 余额是可以提现的金额

2. **手续费透明**
   - 明确告知用户 20% 手续费
   - 显示实际到账金额

3. **Gas 费提醒**
   - 提醒用户需要 BNB 支付 gas 费
   - 提供获取测试币的链接

4. **签名过期处理**
   - 签名 30 分钟后过期
   - 过期后需要重新请求

## 相关文件

| 文件 | 说明 |
|------|------|
| [contracts/src/TCMTokenWithVault.sol](../contracts/src/TCMTokenWithVault.sol) | 合约源代码 |
| [contracts/out/TCMTokenWithVault.abi.json](../contracts/out/TCMTokenWithVault.abi.json) | 合约 ABI（完整版）|
| [internal/handler/withdrawal_handler.go](../internal/handler/withdrawal_handler.go) | 提现请求处理器 |
| [internal/service/withdrawal.go](../internal/service/withdrawal.go) | 提现业务逻辑 |
| [internal/service/signature_service.go](../internal/service/signature_service.go) | 签名生成服务 |
| [cmd/blockchain-listener/internal/listener/](../cmd/blockchain-listener/internal/listener/) | 区块链事件监听器 |
| [.env](../.env) | 环境配置文件 |
