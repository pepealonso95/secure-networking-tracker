import Link from "next/link";
import { ArrowRight, LockKeyhole, Search, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <UsersRound className="size-5" aria-hidden="true" />
          </span>
          Network Keeper
        </Link>
        <nav className="flex items-center gap-2" aria-label="Account">
          <Button asChild variant="ghost" size="sm"><Link href="/sign-in">Sign in</Link></Button>
          <Button asChild size="sm"><Link href="/sign-up">Create account</Link></Button>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:pt-24">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary shadow-sm">
            <span className="size-2 rounded-full bg-[#fdb515]" />
            Your network, remembered
          </div>
          <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.04] tracking-tight text-primary sm:text-6xl lg:text-7xl">
            Relationships deserve better than a forgotten note.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Keep the people you meet, the context that matters, and your next follow-up in one private workspace built around you.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/sign-up">Start your private tracker <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/sign-in">I already have an account</Link></Button>
          </div>
        </div>

        <Card className="overflow-hidden border-primary/15 bg-card/95 shadow-[0_24px_70px_-28px_rgba(0,50,98,0.35)]">
          <div className="border-b bg-primary px-6 py-5 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">This week</p>
            <p className="mt-1 font-serif text-2xl font-semibold">People worth remembering</p>
          </div>
          <CardContent className="space-y-3 p-5">
            {[
              { name: "Maya Chen", context: "Climate founders dinner", priority: "high" },
              { name: "Jon Bell", context: "Berkeley alumni panel", priority: "medium" },
              { name: "Priya Shah", context: "Product leadership meetup", priority: "low" },
            ].map(({ name, context, priority }) => (
              <div key={name} className="flex items-center gap-4 rounded-lg border bg-background/80 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-serif font-semibold text-secondary-foreground">{name.charAt(0)}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{name}</p>
                  <p className="truncate text-sm text-muted-foreground">{context}</p>
                </div>
                <span className="rounded-full border border-border bg-card px-2 py-1 text-xs font-medium capitalize">{priority}</span>
              </div>
            ))}
            <div className="grid gap-3 pt-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-muted p-4"><Search className="size-5 text-primary" /><span className="text-sm font-medium">Find any detail fast</span></div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-4"><LockKeyhole className="size-5 text-primary" /><span className="text-sm font-medium">Private by design</span></div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3">
          <div><p className="font-serif text-3xl font-semibold">One place</p><p className="mt-2 text-sm leading-6 text-white/70">Names, roles, meeting context, notes, and priority stay together.</p></div>
          <div><p className="font-serif text-3xl font-semibold">Your rows</p><p className="mt-2 text-sm leading-6 text-white/70">Database policies prevent one account from reading another account&apos;s contacts.</p></div>
          <div><p className="font-serif text-3xl font-semibold">Ready anywhere</p><p className="mt-2 text-sm leading-6 text-white/70">A focused table on desktop and clear contact cards on mobile.</p></div>
        </div>
      </section>
    </main>
  );
}
