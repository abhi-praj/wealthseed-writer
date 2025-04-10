import { NextRequest, NextResponse } from 'next/server';
import { CohereClientV2 } from 'cohere-ai';

type Section = {
  title: string;
  summary: string;
  wordCount: number;
};

function parseSectionPlan(planText: string): Section[] {
  try {
    const cleaned = planText
      .replace(/```json|```/g, '')
      .trim();
    
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) throw new Error('Section plan must be an array');

    return parsed.map((section, index) => {
      if (
        typeof section.title !== 'string' ||
        typeof section.summary !== 'string' ||
        typeof section.wordCount !== 'number'
      ) {
        throw new Error(`Invalid section format at index ${index}`);
      }
      return {
        title: section.title,
        summary: section.summary,
        wordCount: section.wordCount
      };
    });
  } catch (err) {
    console.error('Error parsing section plan:', err);
    throw new Error('Invalid section plan format. Ensure JSON structure was returned.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, mode, moduleData } = await request.json();
    const apiKey = request.headers.get('x-api-key') || process.env.NEXT_PUBLIC_COHERE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const cohere = new CohereClientV2({ token: apiKey });

    if (mode === 'content-builder' && moduleData) {
      const { module, submodules, keywords, miscRequirements, includeMathQuestions } = moduleData;

      if (submodules?.length > 4) {
        return NextResponse.json({ error: 'Maximum of 4 submodules allowed per request' }, { status: 400 });
      }

      const finalSubmoduleOutputs: Record<string, string> = {};

      for (const submodule of submodules) {
        // --- Step 1: Section Planning ---
        const planningPrompt = `
You are planning a Canadian personal finance submodule titled "${submodule}" under the module "${module}".

Task:
Return ONLY a valid JSON array of 6 to 10 sections — nothing else, no extra text, no markdown, no comments. Just the 6-10 unique sections. Once you have 10 sections, stop the json, no more sections.

Format:
[
  {
    "title": "Section Title",
    "summary": "1-2 sentence summary of the section",
    "wordCount": 1000
  },
  ...
]

Constraints:
- TOTAL word count should be above 8500 words across all sections combined but it should not exceed 10000 words across all sections combined
- Do NOT include more than 10 sections
- Do NOT repeat sections
- Do NOT include any explanation or text outside the JSON array
- Do NOT wrap the response in backticks or markdown
- The last section should complete the plan and conclude the submodule

Consider the following when picking the topics and the summaries:
- Canadian laws, currency, banking, and personal finance context
- Room for case studies, inline citations, and media placeholders

The sections should include the topic to include in: ${keywords.join(', ')}
Requirements: ${miscRequirements}
Audience: Canadian high school or university students
`;

        const planResponse = await cohere.chat({
          model: 'command-a-03-2025',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Canadian curriculum planner for personal finance education.'
            },
            { role: 'user', content: planningPrompt }
          ],
          maxTokens: 8000,
          temperature: 0.4,
          stream: false
        });
        console.log(planResponse);
        const rawPlanText = planResponse.message.content[0].text;
        const sections = parseSectionPlan(rawPlanText);

        // --- Step 2: Generate Section Content with proper Markdown formatting ---
        let compiledContent = `# Submodule: ${submodule}\n\n`;

        for (const [index, section] of sections.entries()) {
          const sectionPrompt = `
Write a detailed section titled "${section.title}" for the submodule "${submodule}" in Canadian personal finance.

Requirements:
- Audience: High school or university students in Canada
- Word count: ${section.wordCount}
- Use Canadian terminology, spelling, laws, and currency
- Include inline citations (e.g., from CRA, Government of Canada, Canadian banks, etc.)
- Add media placeholders, real-world Canadian case studies
- Include 5 multiple choice questions (MCQs)
${includeMathQuestions ? '- Include math-based examples or calculations where appropriate' : ''}
- Section Summary: ${section.summary}

MARKDOWN FORMATTING REQUIREMENTS:
- Use proper markdown syntax:
  * Use ## for section headings (level 2)
  * Use ### for subsection headings (level 3)
  * Leave blank lines between paragraphs
  * Use * or - for unordered lists
  * Use 1. 2. 3. for ordered lists
  * Use **bold** and *italic* for emphasis
  * Use > for block-quotes
  * Use proper markdown table syntax when needed
  * Format code snippets and examples properly
- Do NOT use HTML tags in your content, use only markdown
- Ensure sufficient spacing between different content sections
`;

          const sectionResponse = await cohere.chat({
            model: 'command-a-03-2025',
            messages: [
              {
                role: 'system',
                content: 'You are a professional Canadian personal finance textbook content writer who creates clean, properly formatted markdown. Your content should be well-structured using proper markdown syntax with correct headings, spacing, lists, tables, and emphasis.'
              },
              { role: 'user', content: sectionPrompt }
            ],
            max_tokens: 8192,
            temperature: 0.5,
            p: 0.75,
            k: 0,
            stream: false
          });

          const sectionText = sectionResponse.message.content[0].text.trim();
          
          // Add the section with proper spacing
          compiledContent += `\n\n## ${section.title}\n\n${sectionText}`;
          
          // Add separator between sections (except for the last one)
          if (index < sections.length - 1) {
            compiledContent += '\n\n---\n';
          }
        }

        finalSubmoduleOutputs[submodule] = compiledContent;
      }

      return NextResponse.json({ content: finalSubmoduleOutputs });
    }

    // --- Free Chat Mode ---
    const freeChatMessages = [
      {
        role: 'system',
        content: 'You are a Canadian finance content writer creating clear, structured answers using real Canadian context and inline citations.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await cohere.chat({
      model: 'command-a-03-2025',
      messages: freeChatMessages,
      max_tokens: 8192,
      temperature: 0.5,
      p: 0.75,
      k: 0,
      stream: false
    });

    return NextResponse.json({ content: response.message.content[0].text });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}