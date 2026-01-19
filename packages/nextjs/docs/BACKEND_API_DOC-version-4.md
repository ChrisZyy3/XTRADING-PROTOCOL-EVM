# TCM Backend API Documentation (v2.0)

## 基础信息
- **Base URL**: `http://103.47.82.211:8081`
- **API Prefix**: `/api/v1`
- **Authentication**: `Authorization: Bearer {token}`
- **Content-Type**: `application/json`

---

## 统一返回格式
所有接口均返回以下格式：
```json
{
  "code": 200,      // HTTP 状态码
  "message": "success", // 提示信息
  "data": { ... },  // 数据主体
  "timestamp": 1705497994 // Unix时间戳(秒)
}
```

**状态码说明**：
- `200`: 成功
- `400`: 参数错误
- `401`: 未授权/认证失败
- `404`: 资源不存在
- `409`: 冲突（如用户名重复）
- `500`: 服务器内部错误

---

## 分页规范
列表接口（如转账历史、分红历史）支持分页参数：
- `page`: 当前页码 (默认 1)
- `pageSize`: 每页条数 (默认 10, 最大 100)

返回分页数据格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1705497994
}
```

---

## 1. 用户认证接口

### 1.1 用户注册
- **URL**: `/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "testuser",  // 用户名 (3-20位)
    "password": "password123", // 密码 (min 8位，VoidChain要求)
    "refer": "0x..."         // 推荐人地址 (可选)
  }
  ```
- **说明**: 
  - 自动调用 VoidChain `chain_register` 接口生成链上地址
  - 地址作为用户唯一标识（主键）
  - 密码长度必须 >= 8 位（VoidChain 限制）
  - 返回 JWT token（包含 address）
- **Response**:
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "address": "0xbf5ff2508770566e96a5f563f61f6c53358878c7",
        "username": "testuser",
        "nonce": 0,
        "status": 1,
        "created_at": "2026-01-18T11:23:54Z",
        "updated_at": "2026-01-18T11:23:54Z"
      }
    },
    "timestamp": 1768735434
  }
  ```

### 1.2 用户登录
- **URL**: `/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "testuser",   // 用户名
    "password": "password123"  // 密码
  }
  ```
- **说明**: 
  - 调用 VoidChain `chain_logon` 验证密码（不在后端验证）
  - 验证通过后返回 JWT token（包含 address）
- **Response**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "address": "0xbf5ff2508770566e96a5f563f61f6c53358878c7",
        "username": "testuser",
        "nonce": 0,
        "status": 1
      }
    },
    "timestamp": 1768735530
  }
  ```

### 1.3 获取用户资料
- **URL**: `/user/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "address": "0xbf5ff2508770566e96a5f563f61f6c53358878c7",
      "username": "testuser",
      "nonce": 0,
      "status": 1,
      "created_at": "2026-01-18T11:23:54Z",
      "updated_at": "2026-01-18T11:23:54Z"
    },
    "timestamp": 1768735444
  }
  ```

---

## 2. 资产与转账接口 (需认证)

### 2.1 获取余额
- **URL**: `/balance`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "tcm_balance": "1000000000000000000",  // TCM 余额 (wei)
      "usdt_balance": "0",                   // USDT 余额
      "locked_tcm": "500000000000000000"     // 锁仓 TCM
    },
    "timestamp": 1768735600
  }
  ```

### 2.2 链下转账
- **URL**: `/transfer`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "to_address": "0x6268af5542c4b0ccbb650a0aaccbfcdfbabf6b52",
    "amount": "1000000000000000000", // 18位小数的整数形字符串
    "memo": "转账备注"                // 备注 (可选)
  }
  ```
- **说明**: 
  - 扣除 20% 销毁，80% 到账
  - 仅在后端数据库操作，不上链
- **Response**:
  ```json
  {
    "code": 200,
    "message": "转账成功",
    "data": {
      "transaction_id": 1,
      "from_address": "0xbf5ff2508770566e96a5f563f61f6c53358878c7",
      "to_address": "0x6268af5542c4b0ccbb650a0aaccbfcdfbabf6b52",
      "amount": "1000000000000000000",
      "burn_amount": "200000000000000000",
      "receive_amount": "800000000000000000"
    },
    "timestamp": 1768735650
  }
  ```

### 2.3 转账历史
- **URL**: `/transfer/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Params**: `page=1&pageSize=10`
- **Response**: 分页格式，列表包含转账记录

---

## 3. 节点与算力接口 (需认证)

### 3.1 获取节点配置
- **URL**: `/node/types`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": [
      {
        "type": "genesis",
        "name": "创世节点",
        "usd_amount": "10000",
        "tcm_locked": "70000",
        "hash_power": 10,
        "ref_reward": "8",
        "swap_dividend": "50"
      },
      {
        "type": "super",
        "name": "超级节点",
        "usd_amount": "5000",
        "tcm_locked": "35000",
        "hash_power": 7,
        "ref_reward": "7",
        "swap_dividend": "40"
      },
      {
        "type": "city",
        "name": "城市节点",
        "usd_amount": "2500",
        "tcm_locked": "17500",
        "hash_power": 5,
        "ref_reward": "6",
        "swap_dividend": "30"
      },
      {
        "type": "community",
        "name": "社区节点",
        "usd_amount": "1000",
        "tcm_locked": "7000",
        "hash_power": 3,
        "ref_reward": "5",
        "swap_dividend": "20"
      }
    ],
    "timestamp": 1768735700
  }
  ```

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | 节点类型 |
| `name` | string | 节点名称 |
| `usd_amount` | string | USD价格 |
| `tcm_locked` | string | 锁仓TCM数量 |
| `hash_power` | int | 算力倍数 |
| `ref_reward` | string | 推荐奖励百分比 |
| `swap_dividend` | string | Swap分红百分比 |

### 3.2 购买节点
- **URL**: `/node/buy`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "node_type": "genesis" // genesis, super, city, community
  }
  ```
- **说明**: 从用户余额中扣除节点价格，增加对应算力
- **Response**:
  ```json
  {
    "code": 200,
    "message": "购买成功",
    "data": {
      "node_id": 1,
      "node_type": "genesis",
      "price": "10000000000000000000000",
      "hashpower": 1000
    },
    "timestamp": 1768735750
  }
  ```

### 3.3 获取当前算力
- **URL**: `/hashpower`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "total_hashpower": 1000,
      "nodes": [
        {
          "node_type": "genesis",
          "count": 1,
          "hashpower": 1000
        }
      ]
    },
    "timestamp": 1768735800
  }
  ```

---

## 4. 充值与提现接口 (需认证)

### 4.1 获取充值地址
- **URL**: `/deposit/address`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **说明**: 返回用户的链上地址，用于接收充值
- **Response**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "address": "0xbf5ff2508770566e96a5f563f61f6c53358878c7",
      "memo": "请勿向该地址发送非 TCM 代币"
    },
    "timestamp": 1768735500
  }
  ```

### 4.2 申请提现（链上转账）
- **URL**: `/withdraw/apply`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "to_address": "0x6268af5542c4b0ccbb650a0aaccbfcdfbabf6b52",
    "amount": "1000000000000000000" // 提现数量（字符串）
  }
  ```
- **说明**: 
  - 扣除链下余额
  - 调用 VoidChain `chain_sendTransaction` 执行链上转账
  - 手续费 10%（从金额中扣除）
  - 状态：0=pending, 1=processing, 2=completed, 3=failed
- **Response**:
  ```json
  {
    "code": 200,
    "message": "提现成功，已转到链上",
    "data": {
      "withdraw_id": 1,
      "tx_hash": "0xabcd1234567890...",
      "amount": "1000000000000000000",
      "fee": "100000000000000000",
      "actual_amount": "900000000000000000"
    },
    "timestamp": 1768735600
  }
  ```

### 4.3 提现历史
- **URL**: `/withdraw/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 返回用户的提现记录列表

---

## 5. 分红模块 (需认证)

### 5.1 查询分红
- **URL**: `/dividend`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "pending_dividend": "500000000000000000",
      "dividend_count": 5,
      "dividends": [
        {
          "id": 1,
          "amount": "100000000000000000",
          "status": 0,
          "created_at": "2026-01-18T10:00:00Z"
        }
      ]
    },
    "timestamp": 1768735850
  }
  ```

### 5.2 分红历史
- **URL**: `/dividend/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Params**: `page=1&pageSize=10`
- **Response**: 分页格式，列表包含分红记录

---

## 6. 系统接口

### 6.1 健康检查
- **URL**: `/health`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "code": 200,
    "message": "TCM Backend API is running",
    "timestamp": 1768735855
  }
  ```

---

## 架构说明

### VoidChain 集成
本系统与 VoidChain 区块链深度集成：

1. **用户注册**: 调用 VoidChain `chain_register` 接口生成链上地址
2. **用户登录**: 调用 VoidChain `chain_logon` 接口验证密码
3. **链上转账**: 调用 VoidChain `chain_sendTransaction` 接口执行提现

### 数据模型
- **User 表**: 使用 `address` 作为主键（VoidChain 链上地址）
- **Balance 表**: 记录链下余额，通过 `address` 关联用户
- **Transaction 表**: 记录链下转账历史
- **Withdraw 表**: 记录链上提现记录（包含 tx_hash）

### 认证流程
1. 用户注册/登录后获得 JWT token
2. Token 中包含 `address` 字段（非 user_id）
3. 后续请求需在 Header 中携带: `Authorization: Bearer {token}`
4. 中间件从 token 解析出 address，用于查询用户数据

---

## 安全建议

### 1. 密码安全
- **VoidChain 要求**: 密码长度 >= 8 位
- **传输安全**: 建议使用 HTTPS + RSA 加密传输密码
- **存储安全**: 后端使用 bcrypt 加密存储密码哈希

### 2. Token 管理
- JWT Token 请妥善保管，不要暴露给第三方
- 建议设置合理的过期时间（如 24 小时）
- Token 泄露时应立即更换密码重新登录

### 3. HTTPS
生产环境必须启用 HTTPS 以防止中间人攻击和数据泄露。

### 4. 金额处理
- 所有金额均使用字符串类型传输，避免精度损失
- TCM 代币使用 18 位小数（wei 为单位）
- 前端展示时需除以 10^18

---

## 错误码说明

| 错误码 | 说明 | 示例场景 |
|--------|------|----------|
| 200 | 成功 | 请求正常处理 |
| 400 | 参数错误 | 缺少必填字段、格式错误 |
| 401 | 未授权 | Token 无效或过期 |
| 404 | 资源不存在 | 用户不存在、地址不存在 |
| 409 | 冲突 | 用户名已存在 |
| 500 | 服务器错误 | 数据库错误、VoidChain 调用失败 |

---

## 更新日志

### v2.0 (2026-01-18)
- ✅ 用户表重构：address 作为主键
- ✅ 注册接口：集成 VoidChain chain_register
- ✅ 登录接口：集成 VoidChain chain_logon 验证
- ✅ 提现接口：集成 VoidChain chain_sendTransaction
- ✅ JWT 认证：存储 address 而非 user_id
- ✅ 移除 email 字段
- ✅ 密码要求：最小长度改为 8 位

### v1.0 (2026-01-15)
- 初始版本
