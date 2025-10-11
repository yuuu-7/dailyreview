import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://dailypack.app.n8n.cloud/webhook-test/c1134b1e-d953-4606-9637-b74e11abd4b3';
    
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'N8N Webhook URL not configured' },
        { status: 500 }
      );
    }

    // 通过服务器端发送请求，避免CORS问题
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // 增加超时时间到 5 分钟
      signal: AbortSignal.timeout(300000), // 300秒 = 5分钟
    });

    const responseData = await response.text();
    
    if (response.ok) {
      return NextResponse.json(
        { message: 'Successfully sent to n8n', data: responseData },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send to n8n',
          status: response.status,
          message: responseData
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error sending to n8n:', error);
    
    // 处理超时错误 - 即使超时，n8n 工作流可能已经成功执行
    if (error instanceof Error && error.name === 'TimeoutError') {
      // 返回成功状态，因为 n8n 工作流可能已经完成
      return NextResponse.json(
        { 
          message: 'n8n 工作流已启动，执行时间较长但可能已成功完成',
          data: '[]', // 返回空数据，让前端显示等待状态
          timeout: true
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
