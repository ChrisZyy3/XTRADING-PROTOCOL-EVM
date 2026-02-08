# XTG 后端 API 接口文档

**Base URL**:
- **生产环境**: `https://xtrading.xin/api/v1`
- **测试环境**: `http://54.179.159.49:8080/api/v1`（仅用于调试）

**反向代理**: Caddy (自动HTTPS)

---

## 目录

1. [认证接口](#1-认证接口)
2. [用户接口](#2-用户接口)
3. [转账接口](#3-转账接口)
4. [算力接口](#4-算力接口)
5. [挖矿接口](#5-挖矿接口)
6. [推荐系统接口](#6-推荐系统接口)
7. [节点预售接口 ⭐](#7-节点预售接口-)
8. [提币接口 ⭐](#8-提币接口-)
9. [区块链事件监听接口 🔒](#9-区块链事件监听接口-) **NEW**
10. [充值与提现流程 📖](#10-充值与提现流程-) **NEW**
11. [通用响应格式](#11-通用响应格式)
12. [数值精度说明](#12-数值精度说明)
13. [认证说明](#13-认证说明)
14. [接口限流](#14-接口限流)
15. [附录](#15-附录)

---

## 1. 认证接口

### 1.1 钱包签名登录 ⭐ 推荐

**接口**: `POST /auth/wallet-login`

**描述**: 使用钱包签名进行登录/注册（推荐方式，支持MetaMask等钱包）

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| address | string | 是 | 钱包地址（BNB Chain地址，42字符） |
| signature | string | 是 | 签名数据（使用personal_sign签名） |
| message | string | 是 | 签名的消息内容 |
| referral_code | string | 否 | 推荐码（格式：XTGXXXXXX） |

**请求示例**:

带推荐码登录:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901b",
  "message": "Login to XTG at 2026-02-05 12:34:56",
  "referral_code": "XTG7A3K9M"
}
```

无推荐码登录:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901b",
  "message": "Login to XTG at 2026-02-05 12:34:56"
}
```

**消息格式说明**:

前端需要生成以下格式的消息并请求用户签名：
```
Login to XTG at 2026-02-05 12:34:56
```

其中时间戳为当前时间，格式：`YYYY-MM-DD HH:MM:SS`

**签名验证规则**:
- 消息时间戳必须在当前时间前后5分钟内
- 签名必须使用 `personal_sign` 方法
- 签名必须与提供的钱包地址匹配

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码，0表示成功 |
| message | string | 响应消息 |
| data.token | string | JWT认证令牌 |
| data.address | string | 钱包地址（checksum格式） |
| data.user_id | uint64 | 用户ID |
| data.expires_at | int64 | Token过期时间(Unix时间戳) |
| data.is_new_user | bool | 是否为新用户（仅新用户注册时返回） |

**响应示例**:

新用户注册:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "address": "0x742d35cC6634c0532925a3b844bc9E7595F0bEb1",
    "user_id": 1234,
    "expires_at": 1738209696,
    "is_new_user": true
  }
}
```

老用户登录:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "address": "0x742d35cC6634c0532925a3b844bc9E7595F0bEb1",
    "user_id": 1234,
    "expires_at": 1738209696
  }
}
```

**错误示例**:

签名验证失败:
```json
{
  "code": 1005,
  "message": "wallet auth failed: signature does not match address"
}
```

消息过期:
```json
{
  "code": 1005,
  "message": "wallet auth failed: message expired or invalid timestamp"
}
```

地址格式无效:
```json
{
  "code": 1005,
  "message": "wallet auth failed: invalid wallet address: invalid wallet address format"
}
```

**前端集成示例** (以太坊钱包):

```javascript
import { ethers } from 'ethers';

async function walletLogin(referralCode = '') {
  // 1. 获取钱包地址和签名
  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

  // 2. 生成时间戳消息
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const message = `Login to XTG at ${timestamp}`;

  // 3. 请求签名
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, account]
  });

  // 4. 调用登录接口
  const response = await fetch('/api/v1/auth/wallet-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: account,
      signature: signature,
      message: message,
      referral_code: referralCode
    })
  });

  const result = await response.json();

  if (result.code === 0) {
    // 保存Token
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user_id', result.data.user_id);

    if (result.data.is_new_user) {
      console.log('新用户注册成功！');
    }

    return result.data;
  } else {
    throw new Error(result.message);
  }
}
```

**安全说明**:
- 使用 `personal_sign` 而不是 `eth_sign`（更安全的签名方法）
- 消息必须包含精确到秒的时间戳
- 后端会验证时间戳在5分钟有效期内
- 签名验证使用椭圆曲线加密恢复公钥

**优势**:
- ✅ 无需注册，首次登录自动创建账户
- ✅ 无需密码，使用私钥签名更安全
- ✅ 支持MetaMask、WalletConnect等主流钱包
- ✅ 兼容所有EVM兼容钱包（BNB Chain）

---

## 2. 用户接口

### 2.1 获取用户信息

**接口**: `GET /user/profile`

**描述**: 获取当前登录用户的个人信息

**请求头**:
```
Authorization: Bearer {token}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码 |
| message | string | 响应消息 |
| data | object | 用户数据 |
| data.id | uint64 | 用户ID |
| data.wallet_address | string | 钱包地址（BNB Chain） |
| data.void_account | string | **废弃字段**：VoidChain账号（保留用于兼容性） |
| data.void_address | string | **废弃字段**：VoidChain钱包地址（保留用于兼容性） |
| data.tcm_balance | string | TCM代币余额(精度18位) |
| data.tc_balance | string | TC代币余额(精度18位) |
| data.total_hashrate | string | 累计总算力 |
| data.status | string | 用户状态 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "void_account": "user001",
    "void_address": "0x1234567890abcdef",
    "tcm_balance": "10000.000000000000000000",
    "tc_balance": "5000.000000000000000000",
    "total_hashrate": "5000.000000000000000000",
    "status": "active"
  }
}
```

---

### 2.2 更新用户会话

**接口**: `POST /user/session`

**描述**: 刷新用户会话

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**: 无

**响应示例**:
```json
{
  "code": 0,
  "message": "session updated",
  "data": {
    "session_id": "sess_new123",
    "expires_at": 1738022400
  }
}
```

---

## 3. 转账接口

### 3.1 执行转账

**接口**: `POST /transfer`

**描述**: 执行TCM代币转账，触发算力分配

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| to_address | string | 是 | 接收方VoidChain地址 |
| amount | string | 是 | 转账金额(字符串格式，精度18位) |

**请求示例**:
```json
{
  "to_address": "0xabcdef1234567890",
  "amount": "1000.000000000000000000"
}
```

**转账分配规则**:
```
转账 1000 TCM 的分配结果:
├── 接收方实际到账: 800 TCM  (1000 - 200销毁)
├── 发送方获得算力: 1000    (100%)
├── 接收方获得算力: 500     (50%)
├── 销毁: 200 TCM          (20%销毁)
└── 矿池分配: 200 TCM      (20%从矿池产出)
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码 |
| message | string | 响应消息 |
| data | object | 转账结果 |
| data.tx_id | string | 交易ID |
| data.from_address | string | 发送方地址 |
| data.to_address | string | 接收方地址 |
| data.amount | string | 转账金额 |
| data.burned_amount | string | 销毁金额 |
| data.to_amount | string | 接收方实际到账金额 |
| data.mining_pool_amount | string | 矿池分配金额 |
| data.from_hashrate | string | 发送方获得算力 |
| data.to_hashrate | string | 接收方获得算力 |

**响应示例**:
```json
{
  "code": 0,
  "message": "transfer success",
  "data": {
    "tx_id": "tx_1a2b3c4d",
    "from_address": "0x1234567890abcdef",
    "to_address": "0xabcdef1234567890",
    "amount": "1000.000000000000000000",
    "burned_amount": "200.000000000000000000",
    "to_amount": "800.000000000000000000",
    "mining_pool_amount": "200.000000000000000000",
    "from_hashrate": "1000.000000000000000000",
    "to_hashrate": "500.000000000000000000"
  }
}
```

**错误示例**:
```json
{
  "code": 1001,
  "message": "insufficient balance"
}
```

---

### 3.2 获取转账历史

**接口**: `GET /transfer/history`

**描述**: 获取当前用户的转账历史记录

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "transfers": [
      {
        "tx_id": "tx_1a2b3c4d",
        "from_address": "0x1234567890abcdef",
        "to_address": "0xabcdef1234567890",
        "amount": "1000.000000000000000000",
        "created_at": 1737936000
      }
    ]
  }
}
```

---

## 4. 算力接口

### 4.1 获取用户算力

**接口**: `GET /hashrate/user`

**描述**: 获取当前用户的算力信息

**请求头**:
```
Authorization: Bearer {token}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码 |
| message | string | 响应消息 |
| data | object | 算力数据 |
| data.address | string | 用户地址 |
| data.current_hashrate | string | 当前有效算力 |
| data.total_hashrate | string | 累计总算力 |
| data.transfer_count | int64 | 转账次数 |
| data.last_update_time | int64 | 最后更新时间 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "address": "0x1234567890abcdef",
    "current_hashrate": "5000.000000000000000000",
    "total_hashrate": "8000.000000000000000000",
    "transfer_count": 15,
    "last_update_time": 1737936000
  }
}
```

---

### 4.2 获取总算力

**接口**: `GET /hashrate/total`

**描述**: 获取平台总算力

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total_hashrate": "1000000.000000000000000000"
  }
}
```

---

### 4.3 计算用户算力占比

**接口**: `GET /hashrate/share`

**描述**: 计算当前用户算力占总算力的百分比

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "address": "0x1234567890abcdef",
    "share": 0.05,
    "share_percentage": "5.00%"
  }
}
```

---

## 5. 挖矿接口

### 5.1 计算每日挖矿收益

**接口**: `GET /mining/daily-reward`

**描述**: 计算用户当前算力可获得的每日挖矿收益

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| daily_pool | string | 否 | 每日矿池总额，默认10000 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "address": "0x1234567890abcdef",
    "user_hashrate": "5000.000000000000000000",
    "total_hashrate": "100000.000000000000000000",
    "user_share": 0.05,
    "daily_pool": "10000.000000000000000000",
    "estimated_reward": "500.000000000000000000"
  }
}
```

---

### 5.2 获取待领取奖励

**接口**: `GET /mining/pending`

**描述**: 获取用户待领取的挖矿奖励总额

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "pending_amount": "1500.500000000000000000",
    "record_count": 5
  }
}
```

---

### 5.3 领取挖矿奖励

**接口**: `POST /mining/claim`

**描述**: 领取所有待领取的挖矿奖励到用户余额

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**: 无

**响应示例**:
```json
{
  "code": 0,
  "message": "reward claimed",
  "data": {
    "claimed_amount": "1500.500000000000000000",
    "records_claimed": 5,
    "new_tcm_balance": "11500.500000000000000000"
  }
}
```

---

## 6. 推荐系统接口

### 7.1 获取我的推荐码

**接口**: `GET /api/v1/referral/my-code`

**描述**: 获取当前用户的推荐码（如果不存在则自动生成）

**请求头**:
```
Authorization: Bearer {token}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码 |
| message | string | 响应消息 |
| data.referral_code | string | 推荐码（格式：XTGXXXXXX） |
| data.void_address | string | 用户VoidChain地址 |
| data.void_account | string | 用户VoidChain账号 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "referral_code": "XTG7A3K9M",
    "void_address": "0x1234567890abcdef1234567890abcdef12345678",
    "void_account": "user001"
  }
}
```

**推荐码规则**:
- 格式：`XTG` + 6位随机字符（数字+大写字母，去掉易混淆字符 0O1I）
- 示例：`XTG7A3K9M`
- 每个用户只有一个唯一推荐码
- 首次调用时自动生成，后续调用返回相同推荐码

---

### 7.2 获取我的直接推荐

**接口**: `GET /api/v1/referral/my-referrals`

**描述**: 获取我直接推荐的用户列表

**请求头**:
```
Authorization: Bearer {token}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| data.total | int | 推荐用户总数 |
| data.referrals | array | 推荐用户列表 |
| data.referrals[].user_id | uint64 | 用户ID |
| data.referrals[].void_address | string | VoidChain地址 |
| data.referrals[].void_account | string | VoidChain账号 |
| data.referrals[].created_at | int64 | 注册时间 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 5,
    "referrals": [
      {
        "user_id": 1002,
        "void_address": "0xabcdef1234567890",
        "void_account": "user002",
        "created_at": 1737936000
      },
      {
        "user_id": 1003,
        "void_address": "0x1234567890abcdef",
        "void_account": "user003",
        "created_at": 1738022400
      }
    ]
  }
}
```

---

### 7.3 获取我的推荐链

**接口**: `GET /api/v1/referral/my-chain`

**描述**: 获取我的上级推荐链（我的推荐人、推荐人的推荐人...）

**请求头**:
```
Authorization: Bearer {token}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| data.chain_length | int | 推荐链长度 |
| data.chain | array | 推荐人列表（从近到远） |
| data.chain[].user_id | uint64 | 推荐人ID |
| data.chain[].void_address | string | 推荐人地址 |
| data.chain[].void_account | string | 推荐人账号 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "chain_length": 2,
    "chain": [
      {
        "user_id": 1001,
        "void_address": "0xparent1234567890",
        "void_account": "parent001"
      },
      {
        "user_id": 1000,
        "void_address": "0xgrandparent1234",
        "void_account": "grandparent001"
      }
    ]
  }
}
```

---

### 7.4 绑定推荐关系

**接口**: `POST /api/v1/referral/bind`

**描述**: 绑定推荐关系（使用推荐码或推荐人地址）

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| referral_code | string | 条件必填 | 推荐码（与referrer_address二选一） |
| referrer_address | string | 条件必填 | 推荐人VoidChain地址（与referral_code二选一） |

**请求示例**:

使用推荐码绑定（推荐）:
```json
{
  "referral_code": "XTG7A3K9M"
}
```

使用推荐人地址绑定（旧方式）:
```json
{
  "referrer_address": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| data.referrer_id | uint64 | 推荐人ID |
| data.referee_id | uint64 | 被推荐人ID（当前用户） |

**响应示例**:
```json
{
  "code": 0,
  "message": "referral bound successfully",
  "data": {
    "referrer_id": 1001,
    "referee_id": 1002
  }
}
```

**错误示例**:
```json
{
  "code": 3001,
  "message": "invalid referral code"
}
```

```json
{
  "code": 3002,
  "message": "cannot bind yourself as referrer"
}
```

**注意事项**:
- 不能绑定自己作为推荐人
- 推荐码优先级高于推荐人地址
- 推荐码格式：`XTG` + 6位字符

---

## 7. 节点预售接口 ⭐

### 7.1 获取可购买节点列表

**接口**: `GET /api/v1/node/available`

**描述**: 获取当前可购买的节点等级列表（公开接口，无需登录）

**请求头**: 无需认证

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码 |
| message | string | 响应消息 |
| data.tiers | array | 节点等级列表 |
| data.tiers[].tier_name | string | 节点类型: genesis/super/city/community |
| data.tiers[].display_name | string | 显示名称 |
| data.tiers[].tier_requirement | string | 持币要求 |
| data.tiers[].total_slots | int | 总名额 |
| data.tiers[].available_slots | int | 可用名额 |
| data.tiers[].tc_bonus | string | 赠送TC数量 |
| data.tiers[].tcm_bonus | string | 赠送TCM私募数量 |
| data.tiers[].flow_reward_rate | string | 流水收益比例 |
| data.tiers[].fee_reward_rate | string | 交易费分红比例 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tiers": [
      {
        "id": 1,
        "tier_name": "genesis",
        "display_name": "创世节点",
        "tier_requirement": "1000000.000000000000000000",
        "total_slots": 1000,
        "available_slots": 800,
        "tc_bonus": "70000.000000000000000000",
        "tcm_bonus": "1000000.000000000000000000",
        "flow_reward_rate": "0.0800",
        "fee_reward_rate": "0.5000"
      }
    ]
  }
}
```

---

### 7.2 购买节点

**接口**: `POST /api/v1/node/purchase`

**描述**: 购买指定等级的节点，并赠送私募奖励

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tier_name | string | 是 | 节点类型: genesis/super/city/community |

**请求示例**:
```json
{
  "tier_name": "genesis"
}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| data.node_holding_id | uint64 | 节点持有ID |
| data.node_tier_id | uint64 | 节点等级ID |
| data.tc_bonus | string | 赠送的TC数量 |
| data.tcm_bonus | string | 赠送的TCM数量 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "node_holding_id": 1001,
    "node_tier_id": 1,
    "tc_bonus": "70000.000000000000000000",
    "tcm_bonus": "1000000.000000000000000000"
  }
}
```

**错误示例**:
```json
{
  "code": 1002,
  "message": "insufficient TCM balance, required: 1000000"
}
```

---

### 7.3 获取我的节点

**接口**: `GET /api/v1/node/my-nodes`

**描述**: 获取当前用户持有的所有节点

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "nodes": [
      {
        "id": 1001,
        "node_tier_id": 1,
        "tier_name": "genesis",
        "shares_count": 1,
        "status": "active",
        "purchased_at": 1737936000
      }
    ]
  }
}
```

---

### 7.4 领取节点私募奖励

**接口**: `POST /api/v1/node/claim-bonus`

**描述**: 领取节点赠送的TC和TCM私募奖励

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| node_holding_id | uint64 | 是 | 节点持有ID |

**请求示例**:
```json
{
  "node_holding_id": 1001
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "bonus claimed",
  "data": {
    "tc_bonus": "70000.000000000000000000",
    "tcm_bonus": "1000000.000000000000000000",
    "claimed_at": 1737936000
  }
}
```

---

### 7.5 获取节点收益

**接口**: `GET /api/v1/node/rewards`

**描述**: 获取节点收益汇总（流水收益 + 交易费分红）

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total_rewards": "5000.000000000000000000",
    "pending": "500.000000000000000000",
    "claimed": "4500.000000000000000000"
  }
}
```

---

## 8. 提币接口 ⭐

### 7.1 检查底池注入状态

**接口**: `GET /api/v1/withdraw/injection-status`

**描述**: 检查用户是否已注入20%到底池

**请求头**:
```
Authorization: Bearer {token}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| data.has_injected | bool | 是否已注入足够金额 |
| data.required_amount | string | 需要注入的金额 |
| data.injected_amount | string | 已注入的金额 |
| data.remaining | string | 还需要注入的金额 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "has_injected": false,
    "required_amount": "2000.000000000000000000",
    "injected_amount": "0",
    "remaining": "2000.000000000000000000"
  }
}
```

---

### 7.2 注入底池

**接口**: `POST /api/v1/withdraw/inject`

**描述**: 注入TCM资金到底池，满足提币前置条件

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | string | 是 | 注入金额(18位精度) |

**请求示例**:
```json
{
  "amount": "2000.000000000000000000"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "injection successful",
  "data": {
    "injection_id": 1001,
    "amount": "2000.000000000000000000",
    "status": "confirmed"
  }
}
```

---

### 7.3 发起提币请求

**接口**: `POST /api/v1/withdraw/request`

**描述**: 发起提币请求（需先注入20%到底池）

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | string | 是 | 提币金额(18位精度) |
| destination_address | string | 是 | 目标地址 |

**请求示例**:
```json
{
  "amount": "5000.000000000000000000",
  "destination_address": "0xabcdef1234567890"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "withdrawal request created",
  "data": {
    "request_id": 2001,
    "amount": "5000.000000000000000000",
    "destination_address": "0xabcdef1234567890",
    "status": "pending",
    "created_at": 1737936000
  }
}
```

**错误示例**:
```json
{
  "code": 1003,
  "message": "must inject 20% to base pool before withdrawal, remaining: 2000"
}
```

---

### 7.4 获取提币状态

**接口**: `GET /api/v1/withdraw/status/:request_id`

**描述**: 查询提币请求的当前状态

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| request_id | uint64 | 提币请求ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "request_id": "2001",
    "status": "pending",
    "amount": "5000.000000000000000000",
    "destination_address": "0xabcdef1234567890",
    "created_at": 1737936000,
    "processed_at": null
  }
}
```

**状态枚举**: pending → approved → completed

---

### 7.5 获取提币历史

**接口**: `GET /api/v1/withdraw/history`

**描述**: 获取用户的提币历史记录

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "withdrawals": [
      {
        "request_id": 2001,
        "amount": "5000.000000000000000000",
        "status": "completed",
        "created_at": 1737936000,
        "processed_at": 1737936500
      }
    ]
  }
}
```

---

## 9. 区块链事件监听接口 🔒

**重要**: 以下接口仅供区块链监听器内部使用，需要 **API密钥认证**。

**认证方式**: `X-API-Key` 请求头

### 9.1 处理区块链充值事件

**接口**: `POST /api/v1/admin/blockchain-deposit`

**描述**: 处理用户向智能合约充值TCM代币的事件（由监听器自动调用）

**请求头**:
```
Content-Type: application/json
X-API-Key: {API_KEY}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_address | string | 是 | 用户钱包地址 |
| amount | string | 是 | 充值金额（Wei格式，18位精度） |
| new_balance | string | 是 | 充值后在合约中的余额（Wei格式） |
| tx_hash | string | 是 | 区块链交易哈希 |
| block_number | uint64 | 是 | 区块高度 |
| timestamp | uint64 | 是 | 区块时间戳 |

**请求示例**:
```json
{
  "user_address": "0x742d35Cc6634C0532925a3b844Bc9e7595F0bEb1",
  "amount": "500000000000000000000",
  "new_balance": "500000000000000000000",
  "tx_hash": "0x1234567890abcdef...",
  "block_number": 12345678,
  "timestamp": 1737936000
}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码，0表示成功 |
| message | string | 响应消息 |
| data.tx_hash | string | 交易哈希 |
| data.user_address | string | 用户地址 |
| data.amount | string | 充值金额（转换为TCM单位） |
| data.new_tcm_balance | string | 充值后的TCM余额 |
| data.status | string | 处理状态 |

**响应示例**:
```json
{
  "code": 0,
  "message": "blockchain deposit processed successfully",
  "data": {
    "tx_hash": "0x1234567890abcdef...",
    "user_address": "0x742d35Cc6634C0532925a3b844Bc9e7595F0bEb1",
    "amount": "500",
    "new_tcm_balance": "500",
    "status": "success"
  }
}
```

**功能说明**:
- ✅ 自动创建用户（如果地址未注册）
- ✅ 自动增加用户TCM余额
- ✅ 幂等性保证（重复交易不会重复处理）
- ✅ 记录区块链交易历史

**错误示例**:
```json
{
  "code": 2003,
  "message": "insufficient balance for withdrawal"
}
```

---

### 9.2 处理区块链提现事件

**接口**: `POST /api/v1/admin/blockchain-withdraw`

**描述**: 处理用户从智能合约提现TCM代币的事件（由监听器自动调用）

**请求头**:
```
Content-Type: application/json
X-API-Key: {API_KEY}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_address | string | 是 | 用户钱包地址 |
| amount | string | 是 | 提现金额（Wei格式，18位精度） |
| new_balance | string | 是 | 提现后在合约中的余额（Wei格式） |
| tx_hash | string | 是 | 区块链交易哈希 |
| block_number | uint64 | 是 | 区块高度 |
| timestamp | uint64 | 是 | 区块时间戳 |

**请求示例**:
```json
{
  "user_address": "0x742d35Cc6634C0532925a3b844Bc9e7595F0bEb1",
  "amount": "200000000000000000000",
  "new_balance": "300000000000000000000",
  "tx_hash": "0xabcdef1234567890...",
  "block_number": 12345679,
  "timestamp": 1737936100
}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码 |
| message | string | 响应消息 |
| data.tx_hash | string | 交易哈希 |
| data.user_address | string | 用户地址 |
| data.amount | string | 提现金额（转换为TCM单位） |
| data.new_tcm_balance | string | 提现后的TCM余额 |
| data.status | string | 处理状态 |

**响应示例**:
```json
{
  "code": 0,
  "message": "blockchain withdraw processed successfully",
  "data": {
    "tx_hash": "0xabcdef1234567890...",
    "user_address": "0x742d35Cc6634C0532925a3b844Bc9e7595F0bEb1",
    "amount": "200",
    "new_tcm_balance": "300",
    "status": "success"
  }
}
```

**功能说明**:
- ✅ 自动扣减用户TCM余额
- ✅ 余额不足时拒绝处理
- ✅ 幂等性保证（重复交易不会重复处理）
- ✅ 记录区块链交易历史

---

### 9.3 处理区块链转账事件

**接口**: `POST /api/v1/admin/blockchain-transfer`

**描述**: 处理用户之间的TCM转账事件（由监听器自动调用）

**请求头**:
```
Content-Type: application/json
X-API-Key: {API_KEY}
```

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| from_address | string | 是 | 发送方地址 |
| to_address | string | 是 | 接收方地址 |
| amount | string | 是 | 转账金额（Wei格式） |
| tx_hash | string | 是 | 区块链交易哈希 |
| block_number | uint64 | 是 | 区块高度 |
| timestamp | uint64 | 是 | 区块时间戳 |

**功能说明**:
- ✅ 自动创建用户（如果地址未注册）
- ✅ 自动分配算力（发送方100%，接收方50%）
- ✅ 幂等性保证
- ✅ 记录转账历史

---

### 9.4 获取区块链交易历史

**接口**: `GET /api/v1/admin/blockchain-tx`

**描述**: 查询区块链交易处理历史（用于调试和监控）

**请求头**:
```
X-API-Key: {API_KEY}
```

**查询参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tx_hash | string | 否 | 按交易哈希查询 |
| user_address | string | 否 | 按用户地址查询 |
| event_type | string | 否 | 事件类型: transfer/deposit/withdraw |
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |

---

## 10. 充值与提现流程 📖

### 10.1 系统架构概述

XTG平台采用**金库模式**来防止双花攻击，确保用户购买节点时真实消耗了TCM代币。

```
┌─────────────────────────────────────────────────────────────┐
│                    XTG 平台架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  用户钱包          智能合约          后端数据库              │
│  (Real TCM)      (Vault)          (Virtual Balance)         │
│      │              │                  │                    │
│      │  1. Deposit   │                  │                    │
│      ├─────────────>│                  │                    │
│      │   锁定代币    │                  │                    │
│      │              │  2. 监听事件      │                    │
│      │              ├─────────────────>│                    │
│      │              │   增加余额        │                    │
│      │              │                  │                    │
│      │              │              3. 购买节点                │
│      │              │              扣除数据库余额             │
│      │              │                  │                    │
│      │              │  4. Withdraw     │                    │
│      │<─────────────┤<─────────────────┤                    │
│      │   释放代币    │   减少余额        │                    │
│      │              │                  │                    │
└─────────────────────────────────────────────────────────────┘
```

**核心原理**:
1. 用户向智能合约充值 = 真实代币被锁定在合约中
2. 后端监听Deposit事件 = 增加用户数据库余额
3. 用户购买节点 = 只扣除数据库余额（不消耗真实代币）
4. 用户提现 = 智能合约释放代币 + 后端监听Withdraw事件 = 扣减数据库余额

### 10.2 充值流程（Deposit）

#### Step 1: 用户授权合约

前端需要调用 `TCMTokenWithVault.approve()` 授权合约可以转账：

```javascript
// 前端代码示例
const tcmContract = new ethers.Contract(
  TCM_TOKEN_ADDRESS,
  ['function approve(address spender, uint256 amount) returns (bool)'],
  signer
);

// 授权合约可以转走1000 TCM
const amount = ethers.parseUnits("1000", 18);
const tx = await tcmContract.approve(VAULT_CONTRACT_ADDRESS, amount);
await tx.wait();
```

#### Step 2: 用户调用充值

前端调用 `TCMTokenWithVault.deposit()` 将代币存入合约金库：

```javascript
const vaultContract = new ethers.Contract(
  VAULT_CONTRACT_ADDRESS,
  ['function deposit(uint256 amount) external returns (bool)'],
  signer
);

// 存入1000 TCM
const amount = ethers.parseUnits("1000", 18);
const tx = await vaultContract.deposit(amount);
await tx.wait();

// 获取交易收据，查询Deposit事件
const receipt = await tx.wait();
const depositEvent = receipt.logs.find(log => {
  // 解析Deposit事件
});
```

#### Step 3: 监听器自动处理

区块链监听器会：
1. 监听 `Deposit(address user, uint256 amount, uint256 newBalance, uint256 timestamp)` 事件
2. 调用后端API: `POST /api/v1/admin/blockchain-deposit`
3. 后端自动创建用户（如果不存在）
4. 后端增加用户的TCM余额

**智能合约事件签名**:
```
Deposit: 0x36af321ec8d3c75236829c5317affd40ddb308863a1236d2d277a4025cccee1e
```

**前端确认充值成功**:
```javascript
// 方式1: 等待后端更新余额（推荐）
setTimeout(async () => {
  const profile = await fetchUserProfile();
  console.log('新余额:', profile.tcm_balance);
}, 5000); // 等待监听器处理（通常<5秒）

// 方式2: 轮询交易状态
const checkDeposit = async (txHash) => {
  const response = await fetch(`/api/v1/admin/blockchain-tx?tx_hash=${txHash}`);
  const data = await response.json();
  return data.processed;
};
```

### 10.3 购买节点流程

用户充值后，数据库中的TCM余额增加，此时可以购买节点：

```javascript
// 1. 检查余额
const profile = await fetchUserProfile();
console.log('当前TCM余额:', profile.tcm_balance);

// 2. 购买节点
const response = await fetch('/api/v1/node/purchase', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tier_name: 'genesis'  // 或其他节点类型
  })
});

const result = await response.json();
if (result.code === 0) {
  console.log('购买成功！节点ID:', result.data.node_holding_id);
  // 数据库余额已扣除
}
```

**关键点**:
- ✅ 购买节点只扣除数据库余额
- ✅ 不消耗区块链上的真实代币
- ✅ 真实代币已锁定在智能合约中

### 10.4 提现流程（Withdraw）

#### Step 1: 用户调用提现

前端调用 `TCMTokenWithVault.withdraw()` 将代币从合约金库提取到钱包：

```javascript
const vaultContract = new ethers.Contract(
  VAULT_CONTRACT_ADDRESS,
  ['function withdraw(uint256 amount) external returns (bool)'],
  signer
);

// 提取200 TCM
const amount = ethers.parseUnits("200", 18);
const tx = await vaultContract.withdraw(amount);
await tx.wait();

// 获取交易收据
const receipt = await tx.wait();
```

#### Step 2: 监听器自动处理

区块链监听器会：
1. 监听 `Withdraw(address user, uint256 amount, uint256 newBalance, uint256 timestamp)` 事件
2. 调用后端API: `POST /api/v1/admin/blockchain-withdraw`
3. 后端扣减用户的TCM余额
4. 余额不足时拒绝处理

**智能合约事件签名**:
```
Withdraw: 0x02f25270a4d87bea75db541cdfe559334a275b4a233520ed6c0a2429667cca94
```

#### Step 3: 前端确认

```javascript
// 等待监听器处理
setTimeout(async () => {
  const profile = await fetchUserProfile();
  console.log('提现后余额:', profile.tcm_balance);
}, 5000);
```

### 10.5 完整流程示例

```javascript
// ===== 完整的充值 -> 购买 -> 提现流程 =====

// 1. 连接钱包
const [account] = await window.ethereum.request({
  method: 'eth_requestAccounts'
});

// 2. 登录获取Token
const loginResult = await walletLogin();
const { token } = loginResult;

// 3. 授权合约
const tcmContract = new ethers.Contract(TCM_ADDRESS, ABI, signer);
await tcmContract.approve(VAULT_ADDRESS, ethers.parseUnits("1000", 18));

// 4. 充值1000 TCM到合约
const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
const depositTx = await vaultContract.deposit(ethers.parseUnits("1000", 18));
await depositTx.wait();

// 5. 等待监听器处理（约5秒）
await new Promise(resolve => setTimeout(resolve, 5000));

// 6. 检查余额（应该显示1000 TCM）
const profile1 = await fetchUserProfile();
console.log('充值后余额:', profile1.data.tcm_balance);

// 7. 购买创世节点（假设需要1000 TCM）
const buyResult = await fetch('/api/v1/node/purchase', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ tier_name: 'genesis' })
}).then(r => r.json());

console.log('购买节点成功:', buyResult.data.node_holding_id);

// 8. 再次检查余额（应该为0）
const profile2 = await fetchUserProfile();
console.log('购买后余额:', profile2.data.tcm_balance);

// 9. 假设我们要领取节点奖励获得了一些TCM，现在提现200 TCM
// 注意：实际使用中，用户需要先有余额才能提现
const withdrawTx = await vaultContract.withdraw(ethers.parseUnits("200", 18));
await withdrawTx.wait();

// 10. 等待监听器处理
await new Promise(resolve => setTimeout(resolve, 5000));

// 11. 检查最终余额
const profile3 = await fetchUserProfile();
console.log('提现后余额:', profile3.data.tcm_balance);
```

### 10.6 安全机制

#### 幂等性保护

每个区块链交易只会被处理一次，即使监听器多次接收到同一事件：

```go
// 后端检查交易是否已处理
processed, err := blockchainTxRepo.IsProcessed(ctx, req.TxHash)
if processed {
    return c.JSON(http.StatusOK, gin.H{
        "code":    0,
        "message": "tx already processed",
    })
}

// 标记交易已处理
blockchainTxRepo.MarkAsProcessed(ctx, req.TxHash)
```

#### 余额验证

提现时会验证用户数据库余额是否足够：

```go
newTCMBalance := user.TCMBalance.Sub(amount)
if newTCMBalance.LessThan(decimal.Zero) {
    return c.JSON(http.StatusBadRequest, gin.H{
        "code":    2003,
        "message": "insufficient balance for withdrawal",
    })
}
```

#### 自动注册

监听到转账/充值/提现事件时，如果用户地址未注册，会自动创建用户记录：

```go
user, err := userService.FindByWalletAddress(ctx, req.UserAddress)
if err != nil {
    // 自动创建用户
    user = &model.User{
        WalletAddress: req.UserAddress,
        TCMBalance:    decimal.Zero,
        // ... 其他字段
    }
    userService.CreateUser(ctx, user)
}
```

### 10.7 智能合约地址

**BSC测试网部署地址**:
```
TCMTokenWithVault: 0x6dE2c12780F547A9f8dD3A7b83C82A2d41FC38C8
```

**配置环境变量**:
```env
# 所有.env文件都需要更新
CONTRACT_ADDRESS=0x6dE2c12780F547A9f8dD3A7b83C82A2d41FC38C8
```

### 10.8 监听器配置

区块链监听器配置（`cmd/blockchain-listener/.env`）:

```env
# RPC连接
BLOCKCHAIN_RPC=wss://bsc-testnet-rpc.publicnode.com

# 合约地址
CONTRACT_ADDRESS=0x6dE2c12780F547A9f8dD3A7b83C82A2d41FC38C8

# 后端API
BACKEND_API_URL=http://localhost:8080
BACKEND_API_KEY=xtg-blockchain-api-key-2024-secure

# 监听配置
FROM_BLOCK=-1  # -1表示从最新块开始监听
WORKER_COUNT=10  # 并发处理worker数量
MAX_RETRIES=3   # API失败重试次数
RETRY_DELAY=5   # 重试延迟（秒）
```

### 10.9 常见问题

**Q: 充值后余额没有立即更新？**
A: 监听器处理通常需要3-5秒。如果超过10秒未更新，检查：
- 监听器是否正常运行：`tail -f logs/blockchain-listener.log`
- 交易是否成功：在BSC测试网浏览器查询交易哈希
- 后端API是否正常：`curl http://localhost:8080/health`

**Q: 提现失败？**
A: 检查：
- 合约中是否有足够余额（vaultBalances[user]）
- 数据库余额是否足够
- Gas费是否足够

**Q: 购买节点时余额不足？**
A: 确保已完成充值流程：
1. 授权合约
2. 调用deposit()
3. 等待监听器处理（5秒）
4. 检查余额是否更新

---

## 11. 通用响应格式

### 11.1 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

### 11.2 错误响应

```json
{
  "code": 1001,
  "message": "error message",
  "data": null
}
```

### 11.3 通用错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 用户不存在 |
| 1003 | 余额不足 |
| 1004 | 权限不足 |
| 1005 | Token无效或过期 |
| 1006 | 资源已存在 |
| 2001 | 数据库错误 |
| 2002 | 外部服务错误 |
| 3001 | 转账失败 |
| 3002 | 算力不足 |
| 3003 | 节点状态错误 |

---

## 12. 数值精度说明

所有涉及金额和算力的字段均使用 **18位精度** 的十进制数：

- **TCM余额**: `decimal.Decimal(38, 18)`
- **TC余额**: `decimal.Decimal(38, 18)`
- **算力**: `decimal.Decimal(38, 18)`

**示例**:
```
1000 TCM  => "1000.000000000000000000"
0.5 TCM    => "0.500000000000000000"
```

前端建议使用 BigNumber.js 或类似库处理精度数值。

---

## 13. 认证说明

### 13.1 获取Token

通过登录或注册接口获取JWT Token

### 13.2 使用Token

在需要认证的接口请求头中添加：

```
Authorization: Bearer {your_token}
```

### 13.3 Token有效期

- 默认有效期: **24小时**
- 过期后需要重新登录获取新Token

---

## 14. 接口限流

| 接口类型 | 限制 |
|----------|------|
| 认证接口 | 10次/分钟 |
| 转账接口 | 30次/分钟 |
| 查询接口 | 100次/分钟 |

超出限制将返回 `429 Too Many Requests`

---

## 15. 附录

### 15.1 VoidChain地址格式

VoidChain地址格式: `0x` 开头的40位十六进制字符串

示例: `0x1234567890abcdef1234567890abcdef12345678`

### 15.2 时间戳格式

所有时间戳均为 **Unix秒级时间戳** (10位数字)

示例: `1737936000` (2025-01-27 00:00:00 UTC)

### 15.3 状态枚举

| 类型 | 状态值 |
|------|--------|
| 用户状态 | active, inactive, banned |
| 节点状态 | pending, active, inactive |
| 挖矿记录状态 | pending, claimed |

---

**文档版本**: v2.1.0
**最后更新**: 2026-02-08
**更新内容**:
- ⭐ **新增**：区块链事件监听接口（Section 9）- Deposit/Withdraw/Transfer事件处理
- ⭐ **新增**：充值与提现完整流程文档（Section 10）- 包含前端集成示例和安全机制说明
- ✅ **更新**：标注废弃字段（void_account/void_address）为向后兼容字段
- ✅ **更新**：智能合约地址更新为 BSC 测试网部署地址
- 🔒 **安全**：API密钥认证说明，防止未授权访问
- 📖 **完善**：添加完整的充值→购买→提现流程示例代码
- 🌐 **部署**：后端API已确认可从外部访问（http://54.179.159.49:8080）

### 服务访问信息

**生产环境API**:
- 主域名: `https://xtrading.xin/api/v1`
- www域名: `https://www.xtrading.xin/api/v1`
- 协议: HTTPS（Caddy自动证书）
- 反向代理: Caddy → localhost:8080

**测试服务器**（仅用于调试）:
- IP地址: `54.179.159.49:8080`
- 协议: HTTP
- 用途: 开发和测试环境

**智能合约（BSC测试网）**: `0x6dE2c12780F547A9f8dD3A7b83C82A2d41FC38C8`

### 外部可访问性确认

✅ **生产环境（HTTPS）**:
- 域名访问: `https://xtrading.xin` ✅ 正常
- SSL证书: Caddy自动提供（Let's Encrypt）
- 反向代理: Caddy配置正常

✅ **测试环境（HTTP）**:
- Health端点测试：`curl http://54.179.159.49:8080/health` → 200 OK
- Deposit接口测试：`POST /api/v1/admin/blockchain-deposit` → 正常工作
- Withdraw接口测试：`POST /api/v1/admin/blockchain-withdraw` → 正常工作
- 防火墙状态：inactive（端口8080对外开放）
- 监听状态：`*:8080`（监听所有网络接口）

### Caddy配置

```caddyfile
xtrading.xin {
    reverse_proxy localhost:8080
}

www.xtrading.xin {
    reverse_proxy localhost:8080
}
```

**特性**:
- ✅ 自动HTTPS（Let's Encrypt证书）
- ✅ HTTP自动重定向到HTTPS
- ✅ 反向代理到后端Go服务（端口8080）
- ✅ 自动证书续期

### 废弃字段说明

以下字段已废弃但保留用于向后兼容：
- `void_account`：旧系统账号字段，已被 `wallet_address` 替代
- `void_address`：旧系统地址字段，已被 `wallet_address` 替代

**建议**：新开发应使用 `wallet_address` 字段。

---

**文档历史版本**:
- v2.0.0 (2026-02-05): 钱包签名登录、移除账号密码登录
- v2.1.0 (2026-02-08): 新增区块链监听接口和充值提现流程文档
