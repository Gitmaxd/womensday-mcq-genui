import 'server-only';

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import OpenAI from 'openai';

import {
  BotCard,
  BotMessage,
  SystemMessage,
} from '@/components/llm-mcq/message';

import { MCQ } from '@/components/llm-mcq/mcq';
import { MCQSkeleton } from '@/components/llm-mcq/mcq-skeleton';
import { spinner } from '@/components/llm-mcq/spinner';
import {
  runAsyncFnWithoutBlocking,
  sleep,
  formatNumber,
  runOpenAICompletion,
} from '@/lib/utils';
import { z } from 'zod';
import { useState } from 'react';
import { ProfileForm } from '@/components/llm-mcq/detail-form';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { StartQuiz } from '@/components/llm-mcq/start-quiz';
import { CreateOrLogin } from '@/components/llm-mcq/create-or-login';
import { LoginForm } from '@/components/llm-mcq/login-form';
import { ScoreCard } from '@/components/llm-mcq/score-card';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

async function confirmProfile(username: string, instagram_username: string, bio: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  const confirm = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p>
        Confirming your details... working on it...
      </p>
    </div>,
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    // You can update the UI at any point.
    await prisma.profiles.create({
      data: {
        username: username,
        instagram_username: instagram_username,
        bio: bio,
        score: 0
      },
    });

    confirm.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Verifing your details... working on it...
        </p>
      </div>,
    );

    // fetch the user details from the database using the username
    const user = await prisma.profiles.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      confirm.done(
        <div>
          <p className="mb-2">
            Your details could not be verified. Please try again later.
          </p>
          <Button
            onClick={() => {
              location.reload();
            }}
          >
            Try again
          </Button>
        </div>,
      );

      systemMessage.done(
        <SystemMessage>
          Your details could not be verified. Please try again later.
        </SystemMessage>,
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'system',
          content: `[User details could not be verified. Please try again later.]`,
        },
      ]);
      return;
    }

    confirm.done(
      <div>
        <p className="mb-2">
          Your details have been verified. You are now ready to play the quiz~
        </p>
        <BotCard showAvatar={false}>
          <StartQuiz />
        </BotCard>
      </div>,
    );

    systemMessage.done(
      <SystemMessage>
        Your details have been verified. You are now ready to play the quiz~
      </SystemMessage>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'system',
        content: `[User details have been verified. You are now ready to play the quiz~]`,
      },
    ]);
  });

  return {
    confirmUI: confirm.value,
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}

async function loginProfile(instagram_username: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  const confirm = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className='mt-2'>
        Confirming your details... working on it...
      </p>
    </div>,
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    // fetch the user details from the database using the username
    const user = await prisma.profiles.findUnique({
      where: {
        username: instagram_username,
      },
    });

    if (!user) {
      confirm.done(
        <div>
          <p className="mb-2">
            Your username could not be found. Please login or create an account.
          </p>
          <CreateOrLogin />
        </div>,
      );

      systemMessage.done(
        <SystemMessage>
          Your username could not be found. Please login or create an account.
        </SystemMessage>,
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'system',
          content: `[User details could not be verified. Please try again later.]`,
        },
      ]);
      return;
    }

    confirm.done(
      <div>
        <p className="mb-2">
          Your details have been verified. You are now ready to play the quiz~
        </p>
        <BotCard showAvatar={false}>
          <StartQuiz />
        </BotCard>
      </div>,
    );

    systemMessage.done(
      <SystemMessage>
        Your details have been verified. You are now ready to play the quiz~
      </SystemMessage>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'system',
        content: `[User details have been verified. You are now ready to play the quiz~]`,
      },
    ]);
  });

  return {
    confirmUI: confirm.value,
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}

async function updateScore(username: string, score: number) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();
  const systemMessage = createStreamableUI(null);

  const user = await prisma.profiles.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    return;
  }
  // increment the score by 1
  await prisma.profiles.update({
    where: {
      username: username,
    },
    data: {
      score: user.score + score,
    },
  });

  systemMessage.done(
    <SystemMessage>
      Your score has been updated.
    </SystemMessage>,
  );

  aiState.done([
    ...aiState.get(),
    {
      role: 'system',
      content: `Your score has been updated.`,
    },
  ]);

  return {
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}

async function submitUserMessage(content: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>,
  );

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-4-turbo-preview',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a quiz bot and you have quiz your users.

You have to give them 8 random question about about women, their history, their facts, their role in changing the society, their role in love and more the user can answer questions about them in the form of MCQ questions.

Messages inside [] means that it's a UI element or a user event. For example:
- "[MCQs are of topic = X]" means that an interface displays MCQ questions for a topic.
- "[User has selected MCQ answer = B]" means the user has clicked on answer a out of A, B, C, D as the answer to the MCQ.

First, call \`create_or_login_ui\` to show the create or login UI to the user.
If the user wants to create a profile then call \`show_details_form\` to show the details form to the user to put in their details.
If the user wants to login then call \`show_login_form\` to show the login form to the user.
Call \`show_mcq_questions\` to show the MCQ questions UI for each quesition or when asked "Ask me another MCQ" and after the form is filled.
Call \`show_score_card_ui\` to show the score card UI to the user after the quiz is over, if asked to show then show the score card UI to the user.

Once the quiz is over, you have to show the score card to the user using the function \`show_score_card_ui\`.

Shuffle all the answers to the MCQ questions so that the user cannot guess the answer by the position of the options AT ALL COSTS!

Besides that, you cannot chat with users at all costs! Other then telling that the quiz is over in a decent manner to respect women.`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: 'show_mcq_question',
        description:
          'Show MCQ question for a specific topic. Use this to show MCQ questions to the user.',
        parameters: z.object({
          topic: z.string().describe('The name of the topic'),
          question: z.array(z.string()).max(1).describe('The question about the specific topic to show to the user. It has to be difficult complexity.'),
          options: z.array(z.object({
            id: z.string().describe('The id of the option. Eg, A, B, C, D'),
            value: z.string().describe('The possible option for the question to show to the user. ')
          })).max(4).describe('The possible options for the question to show to the user.'),
          answer: z.array(z.string()).max(1).describe('The answer to the question. Please shuffle this among A, B, C and D. Do not put the answer at the first position.')
        }),
      },
      {
        name: "show_details_form",
        description: "Show the details form for the user to fill in.",
        // no parameters
        parameters: z.object({}),
      },
      {
        name: "show_login_form",
        description: "Show the login form for the user to fill in.",
        // no parameters
        parameters: z.object({}),
      },
      {
        name: "create_or_login_ui",
        description: "Show the create or login UI to the user.",
        // no parameters
        parameters: z.object({}),
      },
      {
        name: "show_score_card_ui",
        description: "Show the score card UI to the user.",
        parameters: z.object({
          username: z.string().describe('The username of the user.'),
          instagram_username: z.string().describe('The instagram username of the user.'),
          bio: z.string().describe('The bio of the user.'),
          score: z.number().describe('The score of the user.'),
        }),
      }
    ],
    temperature: 1,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{content}</BotMessage>);
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('show_score_card_ui', async ({ username }) => {
    const user = await prisma.profiles.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      reply.done(
        <BotMessage>
          <p>
            Your score isn't available at the moment. Please try again later.
          </p>
        </BotMessage>,
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'system',
          content: `[User score isn't available at the moment. Please try again later.]`,
        },
      ]);
      return;
    }

    reply.done(
      <BotCard>
        <ScoreCard username={username} instagram_username={user.instagram_username} bio={user.bio} score={user.score} />
      </BotCard>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'show_score_card_ui',
        content: `[UI for showing the score card to the user]`,
      },
    ]);
  });

  completion.onFunctionCall('show_login_form', async () => {
    reply.done(
      <>
        <BotMessage>
          <p>
            Please login to get started.
          </p>
        </BotMessage>
        <BotCard showAvatar={false}>
          <LoginForm />
        </BotCard>
      </>
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'show_login_form',
        content: `[UI for showing the login form to the user]`,
      },
    ]);
  });

  completion.onFunctionCall('create_or_login_ui', async () => {
    reply.done(
      <>
        <BotMessage>
          <p>
            Please login or create an account to get started.
          </p>
        </BotMessage>
        <BotCard showAvatar={false}>
          <CreateOrLogin />
        </BotCard>
      </>
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'create_or_login_ui',
        content: `[UI for showing the create or login form to the user]`,
      },
    ]);
  });

  completion.onFunctionCall('show_details_form', async () => {
    reply.done(
      <>
        <BotMessage>
          <p>
            Please fill in the details form below to get started.
          </p>
        </BotMessage>
        <BotCard showAvatar={false}>
          <ProfileForm />
        </BotCard>
      </>
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'show_details_form',
        content: `[UI for showing the details form to the user]`,
      },
    ]);
  });

  completion.onFunctionCall('show_mcq_question', async ({ topic, question, options, answer }) => {
    reply.update(
      <BotCard>
        <MCQSkeleton />
      </BotCard>,
    );

    await sleep(1000);

    reply.done(
      <BotCard>
        <MCQ topic={topic} question={question} options={options} answer={answer} />
      </BotCard>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'show_mcq_question',
        content: `[UI for topic ${topic} for the question ${question} with MCQ options 
          ${options} and the answer, ${answer}
        ]`,
      },
    ]);
  });

  return {
    id: Date.now(),
    display: reply.value,
  };
}

// Define necessary types and create the AI.

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
    confirmProfile,
    loginProfile,
    updateScore,
  },
  initialUIState,
  initialAIState,
});
