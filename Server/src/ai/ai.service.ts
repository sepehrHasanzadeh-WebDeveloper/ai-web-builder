import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SectionsService } from '../sections/sections.service';
import { MessagesService } from '../messages/messages.service';
import { MessageRole } from '../messages/entities/message.entity';
@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  constructor(
    private readonly configService: ConfigService,
    private readonly sectionsService: SectionsService,
    private readonly messagesService: MessagesService,
  ) {
    const apiKey =
      this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is missing',
      );
    }
    this.openai = new OpenAI({
      apiKey,
    });
  }
  async generateWebsite(
  projectId: string,
  userPrompt: string,
  userId: string,
){
    // ذخیره پیام کاربر
    await this.messagesService.create({
      projectId,
      role: MessageRole.USER,
      content: userPrompt,
    });
    const response =
      await this.openai.chat.completions.create({
        model: 'gpt-5-mini',
        response_format: {
          type: 'json_object',
        },
        messages: [
          {
            role: 'system',
            content: `
You are an AI website builder.
Your job is to generate website sections.
Rules:
- Return ONLY valid JSON.
- No markdown.
- No explanation.
- Only HTML + Tailwind CSS.
- No JavaScript.
- Every section must have one root semantic HTML tag.
HTML rules:
navbar => <header>
hero => <section>
features => <section>
products => <section>
footer => <footer>
Return exactly this format:
{
 "sections":[
  {
   "name":"string",
   "key":"string",
   "orderIndex":0,
   "htmlCode":"string"
  }
 ]
}
`,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });
    const content =
      response.choices[0].message.content;
    if (!content) {
      throw new InternalServerErrorException(
        'AI returned empty response',
      );
    }
    let aiData: {
      sections: {
        name: string;
        key: string;
        orderIndex: number;
        htmlCode: string;
      }[];
    };
    try {
      aiData = JSON.parse(content);
    } catch {
      throw new InternalServerErrorException(
        'Invalid AI JSON response',
      );
    }
    // ساخت سکشن‌ها
    for (const section of aiData.sections) {
      await this.sectionsService.createFromAI({
        projectId,
        name: section.name,
        key: section.key,
        orderIndex: section.orderIndex,
        htmlCode: section.htmlCode,
      });
    }
    // ذخیره پاسخ AI
    await this.messagesService.create({
      projectId,
      role: MessageRole.ASSISTANT,
      content: JSON.stringify(aiData),
    });
    return {
      message: 'Website generated successfully',
      sections: aiData.sections,
    };
  }
}