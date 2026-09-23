import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SectionsService } from '../sections/sections.service';
import { MessagesService } from '../messages/messages.service';
import { MessageRole } from '../messages/entities/message.entity';
import { ProjectsService } from '../projects/projects.service';

interface AiSection {
  name: string;
  key: string;
  orderIndex: number;
  htmlCode: string;
}
@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  constructor(
    private readonly configService: ConfigService,
    private readonly sectionsService: SectionsService,
    private readonly messagesService: MessagesService,
    private readonly projectsService: ProjectsService,
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

  private async requestJson(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<Record<string, unknown>> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-5-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new InternalServerErrorException('خطایی درجواب ai');
    }

    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      throw new InternalServerErrorException('پاسخ نا معتبر  ارسال شده !');
    }
  }

  private readSection(value: unknown): AiSection {
    if (!value || typeof value !== 'object') {
      throw new InternalServerErrorException('جوابی از سمت ai نیومد');
    }

    const section = value as Partial<AiSection>;
    if (
      typeof section.name !== 'string' ||
      typeof section.key !== 'string' ||
      typeof section.orderIndex !== 'number' ||
      typeof section.htmlCode !== 'string' ||
      !section.htmlCode.trim()
    ) {
      throw new InternalServerErrorException('AI returned an invalid section');
    }

    return {
      name: section.name,
      key: section.key,
      orderIndex: section.orderIndex,
      htmlCode: section.htmlCode,
    };
  }
  async generateWebsite(
  projectId: string,
  userPrompt: string,
  userId: string,
  ){
    await this.projectsService.findOne(projectId, userId);
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

  async addSection(
    projectId: string,
    userPrompt: string,
    userId: string,
  ) {
    const project = await this.projectsService.findOne(projectId, userId);

    const aiData = await this.requestJson(
      `
You add exactly one new website section to an existing website.
Return only valid JSON in this exact shape:
{
  "reply":"one concise Persian sentence, at most 12 words",
  "section": {
    "name":"short Persian display name",
    "key":"unique lowercase kebab-case key",
    "orderIndex":0,
    "htmlCode":"one root semantic HTML element using Tailwind CSS"
  }
}
Rules:
- Return only HTML and Tailwind CSS. Never return JavaScript.
- Use one semantic root tag for the section.
- The section key must be new and different from existing sections.
- Do not include markdown or explanations outside JSON.
      `.trim(),
      `Existing section keys: ${project.sections?.map((section) => section.key).join(', ') || 'none'}
User request: ${userPrompt}`,
    );

    const section = this.readSection(aiData.section);
    const existingKeys = new Set(project.sections?.map((item) => item.key));
    if (existingKeys.has(section.key)) {
      section.key = `${section.key}-${Date.now().toString(36)}`.slice(0, 50);
    }

    const orderIndex =
      (project.sections?.reduce(
        (max, item) => Math.max(max, item.orderIndex),
        -1,
      ) ?? -1) + 1;
    const savedSection = await this.sectionsService.createFromAI({
      projectId,
      name: section.name,
      key: section.key,
      orderIndex,
      htmlCode: section.htmlCode,
    });
    const assistantReply =
      typeof aiData.reply === 'string' && aiData.reply.trim()
        ? aiData.reply.trim()
        : 'بخش جدید با موفقیت اضافه شد.';

    await this.messagesService.create({
      projectId,
      sectionId: savedSection.id,
      role: MessageRole.USER,
      content: userPrompt,
    });

    await this.messagesService.create({
      projectId,
      sectionId: savedSection.id,
      role: MessageRole.ASSISTANT,
      content: assistantReply,
    });

    return {
      message: assistantReply,
      section: savedSection,
    };
  }

  async editSection(
    sectionId: string,
    userPrompt: string,
    userId: string,
  ) {
    const currentSection = await this.sectionsService.findOne(
      sectionId,
      userId,
    );

    await this.messagesService.create({
      projectId: currentSection.projectId,
      sectionId,
      role: MessageRole.USER,
      content: userPrompt,
    });

    const aiData = await this.requestJson(
      `
You edit one existing website section.
Return only valid JSON in this exact shape:
{
  "reply":"one concise Persian sentence, at most 12 words",
  "section": {
    "name":"the section display name",
    "key":"the original section key",
    "orderIndex":0,
    "htmlCode":"the complete updated HTML with Tailwind CSS"
  }
}
Rules:
- Use the current section as the source of truth and apply the user's requested change.
- Return the complete section HTML, not a fragment.
- Return only HTML and Tailwind CSS. Never return JavaScript.
- Keep the section key and orderIndex unchanged.
- Do not include markdown or explanations outside JSON.
      `.trim(),
      `Current section:
name: ${currentSection.name}
key: ${currentSection.key}
orderIndex: ${currentSection.orderIndex}
htmlCode:
${currentSection.htmlCode}

User edit request: ${userPrompt}`,
    );

    const section = this.readSection(aiData.section);
    const updatedSection = await this.sectionsService.update(
      sectionId,
      userId,
      {
        name: section.name,
        htmlCode: section.htmlCode,
        orderIndex: currentSection.orderIndex,
      },
    );
    const assistantReply =
      typeof aiData.reply === 'string' && aiData.reply.trim()
        ? aiData.reply.trim()
        : 'بخش انتخاب‌شده با موفقیت ویرایش شد.';

    await this.messagesService.create({
      projectId: currentSection.projectId,
      sectionId,
      role: MessageRole.ASSISTANT,
      content: assistantReply,
    });

    return {
      message: assistantReply,
      section: updatedSection,
    };
  }
}
