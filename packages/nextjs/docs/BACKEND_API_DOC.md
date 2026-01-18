# TCM Backend API Documentation (v1.0)

## 基础信息
- **Base URL**: `http://localhost:8081`
- **API Prefix**: `/api/v1`
- **Authentication**: `Authorization: Bearer {token}`
- **Content-Type**: `application/json`

---

## 统一返回格式
所有接口均返回以下格式：
```json
{
  "code": 200,      // 状态码
  "message": "success", // 提示信息
  "data": { ... },  // 数据主体
  "timestamp": 1705497994 // 时间戳
}
```

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


### 用户注册
- **URL**: `/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "address": "0x...",   // 钱包地址
    "username": "string", // 用户名 (3-20位)
    "email": "string",    // 邮箱地址
    "password": "string"  // 密码 (min 6位)
  }
  ```

### 用户登录
- **URL**: `/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "address": "0x...",
    "password": "string"
  }
  ```

---

## 2. 资产与转账 (需认证)

### 获取余额
- **URL**: `/balance`
- **Method**: `GET`
- **Response**: 返回 TCM 余额、USDT 余额及锁仓 TCM。

### 链下转账
- **URL**: `/transfer`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "to_address": "0x...",
    "amount": "string", // 18位小数的整数形字符串
    "memo": "string"    // 备注
  }
  ```
- **逻辑**: 扣除 20% 销毁，80% 到账。

### 转账历史
- **URL**: `/transfer/history`
- **Method**: `GET`
- **Query Params**: `page=1`, `pageSize=10`

---

## 3. 节点与算力 (需认证)

### 获取节点配置
- **URL**: `/node/types`
- **Method**: `GET`

### 购买节点
- **URL**: `/node/buy`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "node_type": "genesis" // genesis, super, city, community
  }
  ```

### 获取当前算力
- **URL**: `/hashpower`
- **Method**: `GET`

---

## 4. 充值与提现 (需认证)

### 获取充值地址
- **URL**: `/deposit/address`
- **Method**: `POST`

### 申请提现
- **URL**: `/withdraw/apply`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "to_address": "0x...",
    "amount": "string"
  }
  ```
- **逻辑**: 扣除 10% USDT 手续费。

---

## 5. 分红模块 (需认证)

### 查询分红
- **URL**: `/dividend`
- **Method**: `GET`

### 分红历史
- **URL**: `/dividend/history`
- **Method**: `GET`
- **Query Params**: `page=1`, `pageSize=10`

---

## 6. 系统
- **URL**: `/health`
- **Method**: `GET`
- **Response**: `{"status": "ok", "message": "..."}`

---

## 安全建议
### 1. 密码加密传输
建议客户端在传输密码前使用 **RSA 非对称加密**。
- 后端提供公钥。
- 客户端使用公钥加密 `password` 字段后再发送给 `/register` 或 `/login` 接口。
- 后端使用私钥解密后再进行 `bcrypt` 校验。

### 2. HTTPS
生产环境必须启用 HTTPS 以防止中间人攻击。
