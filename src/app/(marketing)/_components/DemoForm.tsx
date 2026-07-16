"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MarketingContent } from "../_content/types";

type Props = {
  content: MarketingContent["demo"]["form"];
  email: string;
};

export function DemoForm({ content, email }: Props) {
  const id = useId();
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // RFC 6068 schrijft CRLF (%0D%0A) voor als regeleinde in een mailto-body.
    const body = [
      `${content.name}: ${name}`,
      `${content.organisation}: ${organisation}`,
      `${content.email}: ${senderEmail}`,
      message ? `\r\n${message}` : "",
    ]
      .filter(Boolean)
      .join("\r\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      content.mailSubject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-naam`}>{content.name}</Label>
        <Input
          id={`${id}-naam`}
          name="naam"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-muted-foreground/75"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-organisatie`}>{content.organisation}</Label>
        <Input
          id={`${id}-organisatie`}
          name="organisatie"
          autoComplete="organization"
          required
          value={organisation}
          onChange={(e) => setOrganisation(e.target.value)}
          className="border-muted-foreground/75"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-email`}>{content.email}</Label>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          className="border-muted-foreground/75"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor={`${id}-bericht`}>{content.message}</Label>
        <textarea
          id={`${id}-bericht`}
          name="bericht"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex min-h-[80px] w-full flex-1 rounded-md border border-muted-foreground/75 bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
        />
      </div>
      <Button type="submit" className="w-full rounded-full">
        {content.submit}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {content.note}
      </p>
    </form>
  );
}
