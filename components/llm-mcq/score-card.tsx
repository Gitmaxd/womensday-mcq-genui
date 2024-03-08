"use client";

import * as React from "react"
import { toPng } from 'html-to-image';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import Image from "next/image";

export function ScoreCard({ username, instagram_username, bio, score }:
    {
        username: string;
        instagram_username: string;
        bio: string;
        score: number;
    }) {

    const userName = localStorage.getItem('username');
    const [downloadString, setDownloadString] = React.useState<string>('Share');
    console.log("[DEBUG] username: ", userName);
    const cardRef = React.useRef<HTMLDivElement>(null);
    function downloadScore() {
        if (cardRef.current == null) return;
        setDownloadString('Happy Women\'s Day');
        toPng(cardRef.current as HTMLElement, { cacheBust: true, pixelRatio: 3 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${username}-score.png`;
                link.href = dataUrl;
                link.click();
                setDownloadString('Share');
            })
    }
    return (
        <div className="relative max-w-80" ref={cardRef}>
            <div className="absolute inset-0 z-0 max-w-80 rounded-lg">
                <Image
                    alt="bg"
                    src="/imdg.png"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-xl"
                />
            </div>
            <Card className="z-10 relative max-w-80 bg-inherit">
                <CardHeader>
                    <CardTitle>Your Score Card</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        <p className="text-xl text-white">{score} ~ score till now</p>
                        <p className="text-sm text-white">@{instagram_username}</p>
                        <p className="text-sm text-white">{bio}</p>
                    </CardDescription>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={downloadScore}
                        className="w-full"
                    >
                        {downloadString}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
