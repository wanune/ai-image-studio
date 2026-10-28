import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, size } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入有效的图片描述' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new ImageGenerationClient(config, customHeaders);

    const response = await client.generate({
      prompt: prompt.trim(),
      size: size || '2K',
    });

    const helper = client.getResponseHelper(response);

    if (helper.success) {
      return NextResponse.json({ imageUrls: helper.imageUrls });
    } else {
      return NextResponse.json(
        { error: helper.errorMessages.join('; ') || '图片生成失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Image Generation API Error]', error);
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
