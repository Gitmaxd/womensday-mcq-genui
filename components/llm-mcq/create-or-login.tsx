'use client';

import { useActions, useUIState } from 'ai/rsc';

import type { AI } from '../../app/action';

import { Button } from "@/components/ui/button"

export function CreateOrLogin() {
    const [, setMessages] = useUIState<typeof AI>();
    const { submitUserMessage } = useActions();

    return (
        <div className='flex flex-row items-center space-x-4 md:text-base text-sm mt-2'>
            <Button
                onClick={async () => {
                    const response = await submitUserMessage(`Create Profile`);
                    setMessages(currentMessages => [...currentMessages, response]);
                }}
            >
                Create
            </Button>
            <Button
                onClick={async () => {
                    const response = await submitUserMessage(`Login to Profile`);
                    setMessages(currentMessages => [...currentMessages, response]);
                }}
            >
                Login
            </Button>
        </div>
    );
}