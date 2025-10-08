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

