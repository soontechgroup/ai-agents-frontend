# AI Agents Frontend

基于 Next.js 14 的前端应用，提供用户注册、登录等基础功能。

## 技术栈

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Context API (状态管理)

## 功能特点

- 用户注册和登录
- JWT 认证
- 路由保护（中间件）
- 响应式设计
- 类型安全

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件（已创建）：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3001 启动

### 4. 确保后端服务运行

确保后端 API 服务在 http://localhost:8000 运行：

```bash
cd ../ai-agents
./scripts/run.sh
```

## 项目结构

```
ai-agents-frontend/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx          # 主页
│   ├── login/            # 登录页面
│   └── register/         # 注册页面
├── components/           # React 组件
│   └── providers/        # Context Providers
├── lib/                  # 工具和配置
│   ├── api-config.ts    # API 端点配置
│   └── types.ts         # TypeScript 类型定义
└── middleware.ts        # 路由保护中间件
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行代码检查

## 认证流程

1. 用户在注册页面创建账户
2. 注册成功后跳转到登录页面
3. 登录成功后获取 JWT token
4. Token 存储在 localStorage 和 cookie 中
5. 中间件检查 cookie 进行路由保护
6. 用户信息通过 Context API 全局管理

## 后续开发

可以在此基础上添加更多功能：
- 用户个人资料编辑
- 密码重置
- 更多业务功能页面
- 数据表格和图表
- 文件上传
- 实时通知

## 注意事项

- 确保 Node.js 版本 >= 20.0.0
- 开发时后端服务必须运行
- 生产环境需要配置正确的 API URL