# Tasks - DailyPack

## Phase 0: 初始化

### T0.1 准备Notion环境

  - **步骤1 - 创建数据库**:
      - 登录Notion，创建四个新的数据库（Database - Full page）。
      - 数据库1: `DailyNotes`，用于存放所有原始记录。默认的 `Name` 属性保留，再新建一个 `Tags` 属性（多选类型）。
      - 数据库2: `ActionItems`，用于存放AI生成的待办事项。需要属性：`Task` (Title), `Status` (Select: To-Do, In-Progress, Done), `Project` (Text)。
      - 数据库3: `KnowledgeHub`，用于存放经验和灵感。需要属性：`Topic` (Title), `Summary` (Text), `Tags` (Multi-select)。
      - 数据库4: `ContentDrafts`，用于存放创作素材。需要属性：`Platform` (Select: 即刻, 小红书, X), `Content` (Text), `Status` (Select: Draft, Published)。
  - **步骤2 - 获取Notion API密钥**:
      - 访问 [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 创建一个新的集成（Integration），命名为 "DailyPack"。
      - 复制生成的 "Internal Integration Secret"，保存好备用。
  - **步骤3 - 连接集成到数据库**:
      - 打开你创建的每一个数据库页面，点击右上角的 "..." 菜单，选择 "Add connections"，然后选择你刚刚创建的 "DailyPack" 集成。
  - **步骤4 - 获取数据库ID**:
      - 打开每个数据库页面，URL的格式为 `notion.so/your-workspace/DATABASE_ID?v=...`。
      - 复制 `DATABASE_ID` 部分（一长串字母和数字），分别保存好四个数据库的ID。

**验收：**

  - [ ] 成功创建了四个指定的Notion数据库。
  - [ ] 获得了Notion API密钥并已保存。
  - [ ] 四个数据库都已连接到 "DailyPack" 集成。

-----

### T0.2 初始化Next.js项目

  - **步骤1 - 创建项目**:
    ```bash
    npx create-next-app@latest dailypack-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
    ```
  - **步骤2 - 安装Notion客户端库**:
    ```bash
    cd dailypack-app
    npm install @notionhq/client
    ```
  - **步骤3 - 配置环境变量**:
      - 在项目根目录下创建一个新文件 `.env.local`。
      - 在 `.env.local` 文件中添加你的Notion密钥和数据库ID，格式如下：
        ```
        NOTION_API_KEY="secret_..."
        NOTION_DAILY_NOTES_DB_ID="..."
        NOTION_ACTION_ITEMS_DB_ID="..."
        NOTION_KNOWLEDGE_HUB_DB_ID="..."
        NOTION_CONTENT_DRAFTS_DB_ID="..."
        ```

**验收：**

  - [ ] Next.js项目成功创建并能通过 `npm run dev` 正常启动。
  - [ ] `.env.local` 文件已创建并填入了正确的Notion API密钥和数据库ID。

-----

### T0.3 部署本地n8n环境

  - **步骤1 - 创建 `docker-compose.yml` 文件**:
      - 在你的项目文件夹之外的另一个位置（例如 `~/docker/n8n`），创建一个 `docker-compose.yml` 文件。
      - 将以下内容复制到文件中：
        ```yaml
        version: '3'

        services:
          n8n:
            image: n8n.io/n8n:latest
            restart: always
            ports:
              - "5678:5678"
            environment:
              - GENERIC_TIMEZONE=Asia/Shanghai
            volumes:
              - ~/.n8n:/home/node/.n8n
        ```
  - **步骤2 - 启动n8n**:
      - 在 `docker-compose.yml` 文件所在的目录中，打开终端并运行：
        ```bash
        docker-compose up -d
        ```

**验收：**

  - [ ] Docker容器成功运行。
  - [ ] 在浏览器中访问 `http://localhost:5678` 可以看到n8n的欢迎界面。

## Phase 1: 核心数据链路 - 从网页输入到Notion

### T1.1 创建前端输入界面

  - **步骤1 - 清理页面文件**:
      - 删除 `src/app/page.tsx` 文件中的所有示例代码。
  - **步骤2 - 编写UI组件代码**:
      - 将以下代码粘贴到 `src/app/page.tsx` 中，创建一个简单的输入框和提交按钮。
        ```typescript
        // src/app/page.tsx
        "use client";
        import { useState } from 'react';

        export default function HomePage() {
          const [note, setNote] = useState('');
          const [status, setStatus] = useState('');

          const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setStatus('正在保存...');
            const res = await fetch('/api/add-note', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: note }),
            });
            if (res.ok) {
              setStatus('保存成功！');
              setNote('');
            } else {
              setStatus('保存失败。');
            }
          };

          return (
            <main className="flex min-h-screen flex-col items-center p-24 bg-gray-50">
              <h1 className="text-4xl font-bold mb-8">DailyPack</h1>
              <form onSubmit={handleSubmit} className="w-full max-w-lg">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-4 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                  placeholder="记录你的灵感、想法、文章..."
                />
                <button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                  记录到Notion
                </button>
                {status && <p className="mt-4 text-center">{status}</p>}
              </form>
            </main>
          );
        }
        ```

**验收：**

  - [ ] 页面上正确显示一个标题、一个文本输入框和一个按钮。
  - [ ] 输入文字后，按钮可以被点击。

-----

### T1.2 创建后端API用于接收笔记

  - **步骤1 - 创建API路由文件**:
      - 在 `src/app` 目录下创建 `api/add-note/route.ts`。
  - **步骤2 - 编写API逻辑**:
      - 将以下代码粘贴到 `src/app/api/add-note/route.ts` 中，用于将接收到的文本写入Notion。
        ```typescript
        // src/app/api/add-note/route.ts
        import { Client } from "@notionhq/client";
        import { NextResponse } from "next/server";

        const notion = new Client({ auth: process.env.NOTION_API_KEY });
        const databaseId = process.env.NOTION_DAILY_NOTES_DB_ID!;

        export async function POST(req: Request) {
          try {
            const { content } = await req.json();
            if (!content) {
              return NextResponse.json({ error: "Content is required" }, { status: 400 });
            }

            await notion.pages.create({
              parent: { database_id: databaseId },
              properties: {
                Name: {
                  title: [
                    {
                      text: {
                        content: content.substring(0, 50) + "...", // 用内容前50个字作为标题
                      },
                    },
                  ],
                },
              },
              children: [ // 将完整内容写入页面块中
                {
                  object: 'block',
                  type: 'paragraph',
                  paragraph: {
                    rich_text: [{ type: 'text', text: { content: content } }],
                  },
                },
              ]
            });
            return NextResponse.json({ message: "Success" }, { status: 200 });
          } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
          }
        }
        ```

**验收：**

  - [ ] 在网页输入框中输入文本并点击按钮后，状态显示“保存成功！”。
  - [ ] 在Notion的 `DailyNotes` 数据库中看到一条新的记录，其内容与输入一致。

## Phase 2: AI自动化核心 - n8n与Gemini联动

### T2.1 创建n8n工作流并连接Notion

  - **步骤1 - 获取Gemini API Key**:
      - 访问 Google AI Studio ([https://aistudio.google.com/](https://aistudio.google.com/))，登录并创建一个API密钥。
  - **步骤2 - 在n8n中配置凭证**:
      - 打开n8n界面 (`http://localhost:5678`)。
      - 在左侧菜单选择 "Credentials"，点击 "Add credential"。
      - 搜索并选择 "Google Gemini API"，将你的API密钥粘贴进去并保存。
      - 同样的方式，添加 "Notion API" 凭证，粘贴之前保存的Notion API密钥。
  - **步骤3 - 创建工作流并读取Notion数据**:
      - 返回主界面，创建一个新的工作流。
      - 添加第一个节点，选择 "Webhook"。这个节点会自动生成一个测试URL，暂时不管它。
      - 添加第二个节点，搜索 "Notion"。
          - **Credential**: 选择你刚创建的Notion凭证。
          - **Resource**: `Database/Page`
          - **Operation**: `Query`
          - **Database ID**: 填入你的 `NOTION_DAILY_NOTES_DB_ID`。
          - 添加一个Filter，规则设置为 `Created time` -\> `On or after` -\> `today`。这样可以确保只读取当天的笔记。
      - 手动执行该节点（点击节点上的播放按钮），检查是否能成功读取到 `DailyNotes` 里的数据。

**验收：**

  - [ ] Gemini 和 Notion 的凭证在n8n中配置成功。
  - [ ] Notion节点可以成功执行并输出当天创建的笔记数据。

-----

### T2.2 调用Gemini API进行内容整合

  - **步骤1 - 准备数据给AI**:
      - 在Notion节点后添加一个 "Code" 节点。
      - 这个节点的作用是将多条笔记合并成一个文本块，方便AI处理。
      - 在JavaScript代码区域输入以下代码：
        ```javascript
        const allNotes = $input.all();
        let combinedText = "";

        allNotes.forEach(item => {
          // 假设笔记的完整内容存储在第一个block的paragraph text中
          const contentBlock = item.json.blocks?.[0]?.paragraph?.rich_text?.[0]?.text?.content;
          if (contentBlock) {
            combinedText += contentBlock + "\\n---\\n";
          }
        });

        return { combinedText };
        ```
  - **步骤2 - 添加Gemini节点并编写Prompt**:
      - 在 "Code" 节点后添加 "Google Gemini" 节点。
          - **Credential**: 选择你配置好的Gemini凭证。
          - **Mode**: `Chat`
          - **Model**: `gemini-pro`
          - 在 "Text" 输入框中，点击 `Add Expression`，选择上一个节点输出的 `combinedText`。
          - 在 "Text" 输入框中，编写你的Prompt，将 `combinedText` 变量包裹起来。示例Prompt如下：
            ```
            你是一个高效的个人助理。请根据以下今日记录的零散笔记，将其整理成三部分：行动清单（Todo）、信息沉淀（经验/灵感）、以及为三个社交平台（即刻、小红书、X）创作的内容。请严格按照下面的JSON格式输出，不要有任何多余的解释：

            {"todos": [{"task": "具体任务", "project": "所属项目"}], "knowledge": [{"topic": "主题", "summary": "总结", "tags": ["标签1", "标签2"]}], "drafts": [{"platform": "即刻", "content": "内容"}, {"platform": "小红书", "content": "内容"}, {"platform": "X", "content": "内容"}]}

            --- 以下是今日笔记 ---
            {{ $('Code').item.json.combinedText }}
            ```

**验收：**

  - [ ] Code节点能正确合并多条笔记为一个字符串。
  - [ ] Gemini节点成功执行后，能输出一个包含 `todos`, `knowledge`, 和 `drafts` 的JSON字符串。

## Phase 3: 结果回写与网页展示

### T3.1 解析AI结果并写入Notion

  - **步骤1 - 解析JSON**:
      - 在Gemini节点后添加一个 "Code" 节点，用于将AI返回的字符串解析为可用的JSON对象。
        ````javascript
        const aiResponse = $input.item.json.response;
        // Gemini可能会返回被```json ... ```包裹的字符串，需要提取
        const jsonString = aiResponse.replace(/```json\n?|\n?```/g, '');
        const parsedData = JSON.parse(jsonString);
        return parsedData;
        ````
  - **步骤2 - 循环写入待办事项**:
      - 在上一步的Code节点后，添加一个 "Split In Batches" 节点。
      - 在 "Field to Split" 中，通过表达式选择 `{{ $('Code1').item.json.todos }}`。这会为每个todo项单独执行后续节点。
      - 添加一个 "Notion" 节点。
          - **Operation**: `Create`
          - **Database ID**: 填入 `NOTION_ACTION_ITEMS_DB_ID`。
          - 点击 "Add Property"，选择 "Task (Title)"，用表达式 `{{ $json.task }}` 填入。
          - 再添加 "Project (Text)" 属性，用表达式 `{{ $json.project }}` 填入。
  - **步骤3 - 类似地写入知识和草稿**:
      - 重复步骤2，分别为 `knowledge` 和 `drafts` 添加 "Split In Batches" 和 "Notion" 节点，将数据写入对应的数据库。

**验收：**

  - [ ] 当n8n工作流完整运行后，`ActionItems`, `KnowledgeHub`, `ContentDrafts` 数据库中都出现了AI生成的新条目。
  - [ ] 数据内容与AI生成的JSON内容完全对应。

-----

### T3.2 在前端触发工作流并展示结果

  - **步骤1 - 修改前端页面**:
      - 回到 `src/app/page.tsx` 文件，添加 "今日打包" 按钮和结果展示区域。
        ```typescript
        // src/app/page.tsx - 完整代码
        "use client";
        import { useState } from 'react';

        // 假设这是从API获取的数据结构
        interface ResultData {
          todos: any[];
          knowledge: any[];
          drafts: any[];
        }

        export default function HomePage() {
          const [note, setNote] = useState('');
          const [status, setStatus] = useState('');
          const [results, setResults] = useState<ResultData | null>(null);
          const [isLoading, setIsLoading] = useState(false);

          const handleAddNote = async (e: React.FormEvent) => {
            e.preventDefault();
            setStatus('正在保存...');
            const res = await fetch('/api/add-note', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: note }),
            });
            if (res.ok) {
              setStatus('保存成功！');
              setNote('');
              setTimeout(() => setStatus(''), 2000);
            } else {
              setStatus('保存失败。');
            }
          };
          
          const handlePackage = async () => {
            setIsLoading(true);
            setResults(null);
            // 1. 触发 n8n Webhook
            // !! 把这里的URL换成你的n8n生产环境Webhook URL
            await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!, { method: 'POST' });

            // 2. 等待一段时间后获取结果（简单轮询方式）
            setTimeout(async () => {
              const res = await fetch('/api/get-results');
              const data = await res.json();
              setResults(data);
              setIsLoading(false);
            }, 15000); // 等待15秒让n8n处理
          };

          return (
            <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-50 text-gray-800">
              <div className="w-full max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center">DailyPack</h1>
                
                {/* 输入区域 */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                  <form onSubmit={handleAddNote}>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-4 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={5}
                      placeholder="记录你的灵感、想法、文章..."
                    />
                    <button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold">
                      记录到Notion
                    </button>
                    {status && <p className="mt-2 text-center text-sm">{status}</p>}
                  </form>
                </div>

                {/* 操作和展示区域 */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <button onClick={handlePackage} disabled={isLoading} className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-bold text-lg disabled:bg-gray-400">
                    {isLoading ? '正在打包中...' : '今日打包'}
                  </button>

                  {isLoading && <div className="text-center mt-4">请稍候，AI正在处理... (预计20秒)</div>}
                  
                  {results && (
                    <div className="mt-8 space-y-6">
                      {/* 行动清单 */}
                      <div>
                        <h2 className="text-2xl font-bold mb-2">行动清单</h2>
                        <ul className="list-disc pl-5 space-y-1">
                          {results.todos.map((item: any, index: number) => (
                            <li key={index}>{item.properties.Task.title[0].text.content}</li>
                          ))}
                        </ul>
                      </div>
                      {/* 信息沉淀 */}
                      <div>
                        <h2 className="text-2xl font-bold mb-2">信息沉淀</h2>
                         {results.knowledge.map((item: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-100 rounded-lg mb-2">
                              <h3 className="font-semibold">{item.properties.Topic.title[0].text.content}</h3>
                              <p>{item.properties.Summary.rich_text[0].text.content}</p>
                            </div>
                          ))}
                      </div>
                      {/* 创作内容 */}
                      <div>
                         <h2 className="text-2xl font-bold mb-2">创作内容</h2>
                         {results.drafts.map((item: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-100 rounded-lg mb-2">
                              <h3 className="font-semibold">发往 {item.properties.Platform.select.name}</h3>
                              <p className="whitespace-pre-wrap">{item.properties.Content.rich_text[0].text.content}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>
          );
        }
        ```
  - **步骤2 - 创建获取结果的API**:
      - 创建文件 `src/app/api/get-results/route.ts`。
      - 写入代码，用于从Notion的三个结果数据库中读取最新数据。
        ```typescript
        // src/app/api/get-results/route.ts
        import { Client } from "@notionhq/client";
        import { NextResponse } from "next/server";

        const notion = new Client({ auth: process.env.NOTION_API_KEY });

        async function queryDatabase(databaseId: string) {
          const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
              property: "Created time", // 假设都有这个属性
              date: {
                on_or_after: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
              },
            },
          });
          return response.results;
        }

        export async function GET() {
          try {
            const [todos, knowledge, drafts] = await Promise.all([
              queryDatabase(process.env.NOTION_ACTION_ITEMS_DB_ID!),
              queryDatabase(process.env.NOTION_KNOWLEDGE_HUB_DB_ID!),
              queryDatabase(process.env.NOTION_CONTENT_DRAFTS_DB_ID!),
            ]);
            return NextResponse.json({ todos, knowledge, drafts });
          } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
          }
        }
        ```
  - **步骤3 - 配置n8n Webhook URL**:
      - 回到n8n工作流，将Webhook节点的 "Production URL" 复制出来。
      - 在 `.env.local` 文件中添加：`NEXT_PUBLIC_N8N_WEBHOOK_URL="粘贴你的URL"`。

**验收：**

  - [ ] 网页上出现“今日打包”按钮。
  - [ ] 点击按钮后，n8n工作流被触发并成功运行。
  - [ ] 约20秒后，网页能成功显示从Notion获取的行动清单、沉淀信息和创作内容。

## Phase 4: iOS快捷指令输入

### T4.1 配置iOS快捷指令

  - **步骤1 - 在iOS上打开“快捷指令”App**。
  - **步骤2 - 创建新的快捷指令**:
      - 点击右上角的 "+" 号。
      - 点击 "添加操作"，搜索并选择 "要求输入"。可以修改提示问题为“记录什么？”。
  - **步骤3 - 添加网络请求操作**:
      - 再次 "添加操作"，搜索并选择 "获取URL内容"。
      - 在 "URL" 一栏，填入你的应用的API地址。如果是本地测试，需要用内网穿透工具（如ngrok）生成一个公网地址。部署后用Vercel的地址。格式：`https://<你的域名>/api/add-note`。
      - 点击展开箭头 "▶"，设置 "方法" 为 `POST`。
      - 在 "请求正文" 中，选择 "JSON"。
      - 添加一个新的字段，Key为 `content`，Value选择 "魔法变量"，然后选择第一步的 "提供的输入"。
  - **步骤4 - (可选) 添加通知**:
      - 添加 "显示通知" 操作，内容可以设置为“已记录到DailyPack”。
  - **步骤5 - 命名并保存**:
      - 给快捷指令命名，例如 "随手记"。你还可以把它添加到主屏幕或配置轻点背部触发。

**验收：**

  - [ ] 在手机上运行此快捷指令，输入一段文字。
  - [ ] Notion的 `DailyNotes` 数据库中出现一条对应的新记录。

## Phase 5: 部署

### T5.1 部署Next.js应用到Vercel

  - **步骤1 - 推送代码到GitHub**:
      - 创建一个新的GitHub仓库。
      - 将你的Next.js项目代码推送到该仓库。
  - **步骤2 - 从Vercel导入项目**:
      - 登录Vercel，点击 "Add New... -\> Project"。
      - 选择 "Continue with Git"，然后选择你刚创建的GitHub仓库。
  - **步骤3 - 配置环境变量**:
      - 在项目设置的 "Environment Variables" 页面，添加你在 `.env.local` 文件中使用的所有变量（`NOTION_API_KEY`, 所有数据库ID, `NEXT_PUBLIC_N8N_WEBHOOK_URL`）。
  - **步骤4 - 部署**:
      - 点击 "Deploy"。Vercel会自动完成构建和部署。

**验收：**

  - [ ] Vercel部署成功，你获得一个公共URL。
  - [ ] 访问该URL，所有功能（添加笔记、打包、展示）均可正常使用。

-----

### T5.2 部署n8n到云端

  - **步骤1 - 选择部署方式**:
      - **推荐**: 使用 [n8n Cloud](https://n8n.cloud/)，这是最简单的方式，有免费套餐。注册后直接创建一个云实例即可。
      - **备选**: 在Railway, Heroku, 或任何支持Docker的云服务器上部署 `docker-compose.yml`。
  - **步骤2 - 迁移工作流**:
      - 在本地n8n界面，下载你的工作流 (Workflow -\> Download)。
      - 在云端n8n实例中，导入该工作流 (New -\> Import from file)。
  - **步骤3 - 更新配置**:
      - 在云端n8n中重新配置Credentials (Notion和Gemini)。
      - 激活工作流 (右上角开关)。
  - **步骤4 - 更新Vercel环境变量**:
      - 获取云端n8n工作流的新的 "Production URL"。
      - 回到Vercel项目设置，将 `NEXT_PUBLIC_N8N_WEBHOOK_URL` 更新为这个新的URL。Vercel会自动重新部署。

**验收：**

  - [ ] n8n工作流在云端激活并可以被公网访问。
  - [ ] 在你Vercel部署的网站上点击“今日打包”按钮，云端的n8n工作流被成功触发。