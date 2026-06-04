# 个人网站项目 - 学习文档

> **版本**: 1.0.0  
> **技术栈**: Node.js + Express + EJS + XLSX  
> **适用人群**: 前端/后端初学者，想学习全栈开发的小白

---

## 📖 目录

1. [项目概述](#1-项目概述)
2. [技术栈详解](#2-技术栈详解)
3. [项目文件结构](#3-项目文件结构)
4. [核心概念速查](#4-核心概念速查)
5. [学习路线](#5-学习路线)
6. [代码是怎么跑起来的](#6-代码是怎么跑起来的)
7. [前后端交互流程](#7-前后端交互流程)
8. [各文件功能速查](#8-各文件功能速查)
9. [常见问题](#9-常见问题)

---

## 1. 项目概述

这是一个**个人作品展示网站**，主要功能包括：

- **首页展示**：显示个人头像、简介、项目作品
- **项目分类**：按类别（如 AI、Unity）筛选项目
- **精选轮播**：在首页滚动展示精选项目
- **管理后台**：登录后可添加/编辑/删除项目、修改网站配置、管理分类
- **暗黑模式**：支持日间/夜间模式切换
- **数据存储**：所有数据存储在 Excel 文件中，不需要安装数据库
---

## 2. 技术栈详解

### 后端技术

| 技术 | 作用 | 难度 | 学习建议 |
|------|------|------|---------|
| **Node.js** | JavaScript 的运行环境，让 JS 在服务器上运行 | ★★☆ | 先学 JS 基础语法 |
| **Express** | 搭建 Web 服务器的框架（类似乐高骨架） | ★★☆ | 学路由、中间件概念 |
| **EJS** | 模板引擎，在 HTML 里嵌入 JS 代码 | ★☆☆ | 了解 `<% %>` 语法即可 |
| **XLSX** | 读写 Excel 文件的库，充当简易数据库 | ★☆☆ | 知道有这个东西就行 |
| **Multer** | 处理文件上传的库 | ★☆☆ | 了解文件上传流程 |

### 前端技术

| 技术 | 作用 | 难度 | 学习建议 |
|------|------|------|---------|
| **HTML5** | 页面结构（骨架） | ★☆☆ | 学标签、语义化 |
| **CSS3** | 页面样式（衣服） | ★★☆ | 学 Flexbox、Grid、动画 |
| **JavaScript** | 页面交互（行为） | ★★★ | 学 DOM 操作、事件 |
| **AOS** | 滚动动画库 | ★☆☆ | 看文档就能用 |
| **Font Awesome** | 图标库 | ★☆☆ | 复制粘贴图标名 |

---

## 3. 项目文件结构

```
personal-website/              # 项目根目录
├── app.js                     # ★ 入口文件（启动服务器）
├── package.json               # 项目配置（依赖列表）
│
├── routes/                    # ★ 路由层（处理URL请求）
│   ├── index.js               #   首页路由
│   ├── admin.js               #   管理后台路由
│   └── api.js                 #   API接口路由
│
├── views/                     # ★ 视图层（HTML模板）
│   ├── index.ejs              #   首页模板
│   ├── 404.ejs                #   404错误页
│   └── admin/                 #   后台模板
│       ├── login.ejs          #     登录页
│       ├── projects.ejs       #     项目管理页
│       ├── config.ejs         #     网站配置页
│       └── change-password.ejs #     修改密码页
│
├── public/                    # ★ 静态资源（浏览器可直接访问）
│   ├── css/
│   │   └── style.css          #   主样式表
│   ├── js/
│   │   └── main.js            #   前端主脚本
│   ├── css/
│   │   └── admin.css          #   后台样式表
│   ├── uploads/               #   上传的文件存放处
│   └── images/                #   图片存放处
│
├── middleware/                 # 中间件层（请求处理管道）
│   ├── auth.js                #   登录验证
│   └── upload.js              #   文件上传配置
│
├── utils/                     # 工具函数
│   ├── excel.js               #   Excel读写工具
│   └── markdown.js            #   Markdown转HTML工具
│
├── scripts/                   # 脚本文件
│   └── init.js                #   初始化脚本（创建默认数据）
│
├── data/                      # ★ 数据文件（用Excel代替数据库）
│   ├── projects.xlsx          #   项目数据
│   ├── site_config.xlsx       #   网站配置
│   ├── categories.xlsx        #   分类数据
│   └── admin.xlsx             #   管理员账号
│
└── README.md                  # 本文件（项目文档）
```

**学习顺序建议**：按 `★` 标记从上往下看，从 `app.js` 开始理解整体流程。

---

## 4. 核心概念速查

### 4.1 MVC 架构

本项目采用了经典的 **MVC（Model-View-Controller）** 架构：

```
浏览器请求 → 路由(Controller) → 读取数据(Model) → 渲染模板(View) → 返回HTML
```

| 概念 | 对应项目位置 | 作用 |
|------|-------------|------|
| **Model（模型）** | `data/*.xlsx` + `utils/excel.js` | 数据存储和读写 |
| **View（视图）** | `views/*.ejs` | 页面显示（HTML） |
| **Controller（控制器）** | `routes/*.js` | 业务逻辑处理 |

### 4.2 中间件（Middleware）

中间件是 Express 的核心概念，可以理解为请求处理流水线上的"工位"：

```
请求 → 日志中间件 → 登录验证中间件 → 路由处理 → 响应
```

本项目用到了：`express.json()`（解析JSON）、`express.static()`（静态文件）、`auth`（登录验证）等。

### 4.3 路由（Route）

路由就是把 URL 地址和对应的处理函数关联起来：

```
GET  /                        → 显示首页
GET  /admin/login             → 显示登录页
POST /admin/projects/add      → 添加项目
GET  /api/projects            → 获取项目数据（JSON）
```

### 4.4 Session（会话）

Session 用来记住用户的登录状态：用户登录后服务器创建一个 Session，浏览器存一个 Cookie，后续请求带上 Cookie 就能识别身份。

---

## 5. 学习路线

### 阶段一：了解整体流程（30分钟）

1. 阅读本 README，了解项目是做什么的
2. 按顺序浏览文件：`app.js` → `routes/index.js` → `views/index.ejs` → `public/js/main.js`
3. 理解一次"打开首页"的过程：

```
浏览器访问 http://localhost:3000
    ↓
app.js 接收到请求
    ↓
routes/index.js 的 GET '/' 路由处理
    ↓
读取 data/site_config.xlsx 和 data/projects.xlsx
    ↓
把数据传给 views/index.ejs
    ↓
EJS 渲染成 HTML
    ↓
浏览器显示页面，加载 public/js/main.js
```

### 阶段二：学习基础知识

按这个顺序学，每个阶段花几天到一周：

1. **HTML 基础**（2-3天）
   - 标签、属性、语义化
   - 看 `views/index.ejs` 里的 HTML 结构

2. **CSS 基础**（3-5天）
   - 选择器、盒模型、Flexbox、Grid
   - 看 `public/css/style.css`，理解每一段的作用

3. **JavaScript 基础**（1-2周）
   - 变量、函数、数组、对象、DOM 操作
   - 看 `public/js/main.js`，理解每个交互效果

4. **Node.js 基础**（1周）
   - 模块（require/exports）、npm
   - 看 `app.js` 如何引入和使用模块

5. **Express 基础**（1周）
   - 路由、中间件、模板引擎
   - 看 `routes/index.js` 和 `routes/admin.js`

### 阶段三：动手修改

1. **改样式**：修改 `public/css/style.css` 中的颜色、字体
2. **改内容**：直接在 Excel 文件中修改项目数据
3. **加功能**：比如在首页新增一个"关于我"区域

### 建议的学习资源

- [MDN Web 文档](https://developer.mozilla.org/zh-CN/) - 最权威的 Web 教程
- [Node.js 官方教程](https://nodejs.org/zh-cn/learn/)
- [Express 官方文档](https://expressjs.com/zh-cn/)
- [CSS-Tricks 的 Flexbox 指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

## 6. 代码是怎么跑起来的

### 启动流程

```
1. 在终端运行: node app.js
2. app.js 开始执行:
   ├── 第1步：引入依赖（express、session等）
   ├── 第2步：创建必要的文件夹
   ├── 第3步：运行 scripts/init.js 初始化数据
   │   ├── 如果 data/*.xlsx 不存在 → 创建并写入默认数据
   │   └── 如果已经存在 → 跳过
   ├── 第4步：配置中间件（压缩、解析、session、静态文件）
   ├── 第5步：注册路由（首页、后台、API）
   └── 第6步：监听 3000 端口，开始接受请求
3. 打开浏览器访问 http://localhost:3000
```

### 一次完整的请求旅程

以"用户点击『AI 项目』分类按钮"为例：

```
1. 用户点击按钮
2. main.js 监听到 click 事件
   ├── 更新 currentFilterCategory = "ai"
   ├── 调用 updateProjectCards()
   │   ├── 隐藏所有 .project-card
   │   ├── 只显示 data-category="ai" 的卡片
   │   └── 更新分页按钮
   └── 页面展示 AI 分类的项目
   ※ 注意：这次操作不涉及服务器，数据已经在页面里了
```

以"管理员添加新项目"为例：

```
1. 管理员填表，点击"保存"
2. 浏览器 POST 请求到 /admin/projects/add
3. Express 收到请求，经过中间件
   ├── auth.js: 检查是否登录
   └── upload.js: 处理上传文件
4. admin.js 的路由处理：
   ├── 读取 projects.xlsx 获取现有数据
   ├── 创建新项目对象
   ├── 把上传文件移到项目目录
   ├── 追加到项目列表
   ├── 写入 projects.xlsx
   └── 重定向到列表页
5. 浏览器刷新列表页，显示新项目
```

---

## 7. 前后端交互流程

### 7.1 服务端渲染流程（大部分页面）

```
服务器                               浏览器
   │                                   │
   │  ←── 访问首页 GET / ──→           │
   │                                   │
   │  读取 Excel 数据 ──→ 数据         │
   │                                   │
   │  用 EJS 渲染成 HTML               │
   │                                   │
   │  ──→ 返回完整 HTML 页面 ──→       │
   │                                   │
   │                            浏览器直接显示
```

特点：页面内容在服务器组装好再发给浏览器，对 SEO 友好。

### 7.2 API 交互流程（动态数据）

```
前端 JS (main.js)                   服务器
     │                                │
     │  ←── AJAX 请求 /api/projects   │
     │              ?category=ai      │
     │                                │
     │         读取 Excel              │
     │         筛选 + 排序             │
     │                                │
     │  ──→ 返回 JSON 数据 ──→        │
     │                                │
     JS 处理数据，更新页面
```

特点：不刷新页面就能更新内容（体验更好）。

### 7.3 数据流向图

```
Excel 文件 (.xlsx)
    │
    ├── utils/excel.js (读写工具)
    │       │
    │       ├── routes/index.js (首页路由)
    │       │       │
    │       │       └── views/index.ejs (渲染成HTML)
    │       │
    │       ├── routes/admin.js (后台管理)
    │       │       │
    │       │       └── views/admin/*.ejs (渲染后台页面)
    │       │
    │       └── routes/api.js (API接口)
    │               │
    │               └── 返回 JSON → public/js/main.js 处理
    │
    └── scripts/init.js (初始化创建默认数据)
```

---

## 8. 各文件功能速查

### 核心文件

| 文件 | 功能 | 重要程度 |
|------|------|---------|
| `app.js` | **项目入口**，启动服务器，配置中间件和路由 | ⭐⭐⭐ |
| `routes/index.js` | **首页路由**，读取数据并渲染首页 | ⭐⭐⭐ |
| `routes/admin.js` | **后台路由**，管理项目、配置、分类 | ⭐⭐⭐ |
| `routes/api.js` | **API 路由**，提供 JSON 数据接口 | ⭐⭐ |
| `views/index.ejs` | **首页模板**，定义页面结构 | ⭐⭐⭐ |
| `public/css/style.css` | **主样式表**，所有前端样式 | ⭐⭐⭐ |
| `public/js/main.js` | **前端脚本**，页面交互效果 | ⭐⭐⭐ |
| `utils/excel.js` | **Excel 工具**，读写数据文件 | ⭐⭐⭐ |
| `scripts/init.js` | **初始化脚本**，创建默认数据 | ⭐⭐ |
| `middleware/auth.js` | **登录验证**，保护后台页面 | ⭐⭐ |
| `middleware/upload.js` | **文件上传**，处理上传请求 | ⭐⭐ |
| `utils/markdown.js` | **Markdown 转换** | ⭐ |
| `package.json` | **项目配置**，依赖版本 | ⭐ |

### 其他文件

| 文件 | 功能 |
|------|------|
| `views/404.ejs` | 404 错误页面 |
| `views/admin/login.ejs` | 后台登录页 |
| `views/admin/projects.ejs` | 项目管理页 |
| `views/admin/config.ejs` | 网站配置页 |
| `views/admin/change-password.ejs` | 修改密码页 |

---

## 9. 常见问题

### Q: 怎么启动项目？

```bash
cd personal-website
npm install        # 第一次运行需要安装依赖
node app.js        # 启动服务器
```

然后浏览器打开 `http://localhost:3000`

### Q: 管理后台地址和默认密码？

后台地址：`http://localhost:3000/admin/login`
默认账号：`admin` / `admin123`

### Q: 怎么修改网站标题、邮箱等信息？

方法一：登录后台 → 网站配置 → 修改 → 保存
方法二：直接编辑 `data/site_config.xlsx` 文件

### Q: 怎么添加新的分类？

登录后台 → 项目管理 → 点击"项目类别"按钮 → 新增类别

### Q: 怎么添加新项目？

登录后台 → 项目管理 → 点击"添加项目" → 填写表单 → 保存

### Q: 数据存在哪里？

所有数据都存在 `data/` 目录下的 `.xlsx` 文件中，直接用 Excel 打开就能编辑。

但注意：服务器运行时修改 Excel 文件需要重启服务器才能生效。

### Q: 为什么用 Excel 不用数据库？

这个项目是小型的个人展示网站，用 Excel 好处是：
- 不需要安装和配置数据库
- 数据直接用 Excel 打开编辑，非常直观
- 对于少量数据完全够用

如果以后数据量大、需要多人同时编辑，建议换成 SQLite 或 MySQL。

### Q: 代码修改后需要重启吗？

改了 `routes/`、`utils/`、`scripts/`、`app.js` 需要重启服务器（按 `Ctrl+C` 停止，再 `node app.js`）。
改了 `views/`、`public/` 的模板、CSS、JS 文件不需要重启，刷新浏览器即可。

### Q: 我想增加一个新功能，从哪里开始？

1. **新增页面** → 在 `views/` 新建 `.ejs` 文件，在 `routes/` 添加路由
2. **新增数据字段** → 修改 `scripts/init.js` 的表头，修改相应的路由和模板
3. **新增样式** → 在 `public/css/style.css` 添加 CSS 代码
4. **新增交互** → 在 `public/js/main.js` 添加 JS 代码
5. **新增 API** → 在 `routes/api.js` 添加路由

---

*祝你学习愉快！有任何问题欢迎交流。*
