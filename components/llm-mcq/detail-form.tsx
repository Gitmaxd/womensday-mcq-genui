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
        message: "Username must be at least 5 characters.",
    }),
    instagram_username: z.string().min(5, {
        message: "Instagram username must be at least 5 characters.",
    }),
    bio: z.string().min(20, {
        message: "Bio must be at least 20 characters.",
    }),
})

export function ProfileForm() {
    const [, setMessages] = useUIState<typeof AI>();
    const [confirmUI, setConfirmUI] = useState<React.ReactNode | null>(
        null,
    );
    const { confirmProfile } = useActions();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            instagram_username: "",
            bio: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        localStorage.setItem('username', values.username);
        const response = await confirmProfile(values.username, values.instagram_username, values.bio);
        setConfirmUI(response.confirmUI);
        setMessages((currentMessages: any) => [
            ...currentMessages,
            response.newMessage,
        ]);
    }

    return (
        <Form {...form}>
            <div className="space-y-2 p-8 border rounded-lg w-full max-w-2xl">
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
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your username" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Instagram Username Field */}
                            <FormField
                                control={form.control}
                                name="instagram_username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instagram Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Instagram username" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your Instagram handle.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Bio Field */}
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="A short bio about yourself" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Share something interesting about yourself.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" variant="default">Submit</Button>
                        </form>
                    )
                }
            </div>
        </Form>
    )
}
