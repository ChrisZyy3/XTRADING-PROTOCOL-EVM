# XTG 后端 API 接口文档

**Base URL**: `http://103.47.82.211:8080/api/v1`

**认证方式**: Bearer Token (JWT)

---

## 目录

1. [认证接口](#1-认证接口)
2. [用户接口](#2-用户接口)
3. [转账接口](#3-转账接口)
4. [算力接口](#4-算力接口)
5. [挖矿接口](#5-挖矿接口)
6. [节点预售接口 ⭐](#6-节点预售接口-)
7. [提币接口 ⭐](#7-提币接口-)
8. [通用响应格式](#8-通用响应格式)
9. [数值精度说明](#9-数值精度说明)
10. [认证说明](#10-认证说明)
11. [接口限流](#11-接口限流)
12. [WebSocket接口 (可选)](#12-websocket接口-可选)
13. [附录](#13-附录)

---

## 1. 认证接口

### 1.1 用户注册

**接口**: `POST /auth/register`

**描述**: 使用VoidChain账号密码注册新用户

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | string | 是 | VoidChain账号，3-50个字符 |
| password | string | 是 | 密码，6-50个字符 |
| refer | string | 否 | 推荐人账号 |

**请求示例**:
```json
{
  "account": "user001",
  "password": "password123",
  "refer": "inviter001"
}
```

**响应参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码，0表示成功 |
| message | string | 响应消息 |
| data | object | 响应数据 |
| data.token | string | JWT认证令牌 |
| data.address | string | VoidChain钱包地址 |
| data.session_id | string | VoidChain会话ID |
| data.expires_at | int64 | Token过期时间(Unix时间戳) |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "address": "0x1234567890abcdef",
    "session_id": "sess_abc123",
    "expires_at": 1737936000
  }
}
```

---

### 1.2 用户登录

**接口**: `POST /auth/login`

**描述**: 使用VoidChain账号密码登录

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | string | 是 | VoidChain账号 |
| password | string | 是 | 密码 |

**请求示例**:
```json
{
  "account": "user001",
  "password": "password123"
}
```

**响应参数**: 同注册接口

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "address": "0x1234567890abcdef",
    "session_id": "sess_xyz789",
    "expires_at": 1737936000
  }
}
```

---

### 1.3 用户登出

**接口**: `POST /auth/logout`

**描述**: 退出登录，使当前Token失效

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**: 无

**响应示例**:
```json
{
  "code": 0,
  "message": "logout success"
}
```

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
| data.void_account | string | VoidChain账号 |
| data.void_address | string | VoidChain钱包地址 |
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
├── 接收方获得算力: 600     (60%)
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
    "to_hashrate": "600.000000000000000000"
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

## 6. 节点预售接口 ⭐

### 6.1 获取可购买节点列表

**接口**: `GET /api/v1/node/available`

**描述**: 获取当前可购买的节点等级列表

**请求头**:
```
Authorization: Bearer {token}
```

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

### 6.2 购买节点

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

### 6.3 获取我的节点

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

### 6.4 领取节点私募奖励

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

### 6.5 获取节点收益

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

## 7. 提币接口 ⭐

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

## 8. 通用响应格式

### 9.1 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

### 9.2 错误响应

```json
{
  "code": 1001,
  "message": "error message",
  "data": null
}
```

### 9.3 通用错误码

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

## 9. 数值精度说明

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

## 10. 认证说明

### 9.1 获取Token

通过登录或注册接口获取JWT Token

### 9.2 使用Token

在需要认证的接口请求头中添加：

```
Authorization: Bearer {your_token}
```

### 9.3 Token有效期

- 默认有效期: **24小时**
- 过期后需要重新登录获取新Token

---

## 11. 接口限流

| 接口类型 | 限制 |
|----------|------|
| 认证接口 | 10次/分钟 |
| 转账接口 | 30次/分钟 |
| 查询接口 | 100次/分钟 |

超出限制将返回 `429 Too Many Requests`

---

## 12. WebSocket接口 (可选)

### 11.1 实时算力更新

**连接**: `ws://103.47.82.211:8080/ws/hashrate`

**订阅消息**:
```json
{
  "action": "subscribe",
  "channel": "hashrate",
  "address": "0x1234567890abcdef"
}
```

**推送消息**:
```json
{
  "channel": "hashrate",
  "data": {
    "current_hashrate": "5500.000000000000000000",
    "updated_at": 1737936000
  }
}
```

---

## 13. 附录

### 12.1 VoidChain地址格式

VoidChain地址格式: `0x` 开头的40位十六进制字符串

示例: `0x1234567890abcdef1234567890abcdef12345678`

### 12.2 时间戳格式

所有时间戳均为 **Unix秒级时间戳** (10位数字)

示例: `1737936000` (2025-01-27 00:00:00 UTC)

### 12.3 状态枚举

| 类型 | 状态值 |
|------|--------|
| 用户状态 | active, inactive, banned |
| 节点状态 | pending, active, inactive |
| 挖矿记录状态 | pending, claimed |

---

**文档版本**: v1.0.0
**最后更新**: 2025-01-27
