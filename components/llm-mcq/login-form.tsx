"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useActions, useUIState } from 'ai/rsc';
import type { AI } from '../../app/action';
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react";

// Schema definition.

const formSchema = z.object({
    username: z.string().min(5, {
        message: "Instagram username must be at least 5 characters.",
    }),
})


export function LoginForm() {
    const [, setMessages] = useUIState<typeof AI>();
    const [confirmUI, setConfirmUI] = useState<React.ReactNode | null>(
        null,
    );
    const { loginProfile } = useActions();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        // save value to local storage
        localStorage.setItem('username', values.username);
        const response = await loginProfile(values.username);
        setConfirmUI(response.confirmUI);
        setMessages((currentMessages: any) => [
            ...currentMessages,
            response.newMessage,
        ]);
    }

    return (
        <Form {...form}>
            <div className="space-y-4 p-8 border rounded-lg w-full max-w-2xl">
                {confirmUI
                    ?
                    <div className="text-zinc-200">{confirmUI}</div>
                    :
                    (
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instagram Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your username" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your username.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="mt-3">
                                Submit
                            </Button>
                        </form>
                    )
                }
            </div>
        </Form>
    );
}