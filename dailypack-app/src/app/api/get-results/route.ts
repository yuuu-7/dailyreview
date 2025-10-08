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

