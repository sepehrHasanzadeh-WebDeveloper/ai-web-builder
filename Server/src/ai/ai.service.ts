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
- Do not return markdown or explanations outside the JSON.
- Return a short Persian reply for the user in the "reply" field.
- The reply must be concise: one natural sentence and at most 12 Persian words.
- If the user asks for a change, say briefly what was done in the past tense.
- Do not describe implementation details or repeat the user's full request.
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
 "reply":"یک جمله کوتاه فارسی درباره کاری که انجام شد",
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
      reply?: string;
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
    const assistantReply =
      aiData.reply?.trim() || 'تغییرات موردنظر با موفقیت انجام شد.';
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
    const projectSections = await this.sectionsService.findAll(
      projectId,
      userId,
    );
    // ذخیره پاسخ AI
    await this.messagesService.create({
      projectId,
      role: MessageRole.ASSISTANT,
      content: assistantReply,
    });
    return {
      message: assistantReply,
      sections: projectSections,
    };
  }
}
