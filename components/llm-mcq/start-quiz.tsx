'use client';

import { useActions, useUIState } from 'ai/rsc';

import type { AI } from '../../app/action';

import { Button } from "@/components/ui/button"

export function StartQuiz() {
    const [, setMessages] = useUIState<typeof AI>();
    const { submitUserMessage } = useActions();

    return (
        <div className='space-x-2 flex flex-row'>
            <Button
                onClick={async () => {
                    const response = await submitUserMessage(`Ask me MCQs`);
                    setMessages(currentMessages => [...currentMessages, response]);
                }}
                size={'lg'}
                className='text-sm'
            >
                Start Quiz
            </Button>
            <Button
                onClick={async () => {
                    const response = await submitUserMessage(`Show my score card`);
                    setMessages(currentMessages => [...currentMessages, response]);
                }
                }
                size={'lg'}
                className='text-sm'
            >
                Score Card
            </Button>
        </div>
    );
}