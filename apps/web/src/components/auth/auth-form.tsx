"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, LockKeyhole, UsersRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { neon } from "@/lib/neon";

const schema = z.object({
  name: z.string().trim().max(100, "Use 100 characters or fewer").optional(),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters").max(128, "Use 128 characters or fewer"),
});

type Values = z.infer<typeof schema>;

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const session = neon.auth.useSession();
  const [serverError, setServerError] = useState<string | null>(null);
  const isSignUp = mode === "sign-up";
  const form = useForm<Values>({
    resolver: zodResolver(schema.refine((value) => !isSignUp || Boolean(value.name?.trim()), {
      message: "Name is required",
      path: ["name"],
    })),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (session.data) router.replace("/contacts");
  }, [router, session.data]);

  async function onSubmit(values: Values) {
    setServerError(null);
    const result = isSignUp
      ? await neon.auth.signUp.email({
          name: values.name?.trim() ?? "",
          email: values.email,
          password: values.password,
        })
      : await neon.auth.signIn.email({ email: values.email, password: values.password });

    if (result.error) {
      setServerError(result.error.message ?? "Authentication failed. Please try again.");
      return;
    }

    router.replace("/contacts");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-3 font-semibold"><span className="grid size-10 place-items-center rounded-lg bg-white/10"><UsersRound /></span>Network Keeper</Link>
        <div className="max-w-lg">
          <LockKeyhole className="mb-6 size-10 text-[#fdb515]" aria-hidden="true" />
          <h1 className="font-serif text-5xl font-semibold leading-tight">A private record of the people who shape your work.</h1>
          <p className="mt-6 text-lg leading-8 text-white/70">Every contact is tied to your account and protected again at the database row level.</p>
        </div>
        <p className="text-sm text-white/50">Secure Networking Tracker</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Button asChild variant="ghost" className="mb-5 -ml-3"><Link href="/"><ArrowLeft />Back home</Link></Button>
          <Card className="bg-card/95 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle>{isSignUp ? "Create your account" : "Welcome back"}</CardTitle>
              <CardDescription>{isSignUp ? "Start building a network you can actually remember." : "Sign in to return to your private contacts."}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {isSignUp ? (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" autoComplete="name" placeholder="Your name" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
                    {form.formState.errors.name ? <p className="text-sm text-destructive">{form.formState.errors.name.message}</p> : null}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
                  {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />
                  {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : <p className="text-xs text-muted-foreground">At least 8 characters.</p>}
                </div>
                {serverError ? <Alert className="border-red-200 bg-red-50"><AlertDescription className="text-red-700">{serverError}</AlertDescription></Alert> : null}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || session.isPending}>
                  {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
                  {isSignUp ? "Create account" : "Sign in"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "New to Network Keeper?"}{" "}
                <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Sign in" : "Create one"}</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

