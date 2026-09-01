import { AlertCircle, SearchX, UserRoundPlus } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContactLoading() {
  return <Card><CardContent className="space-y-4 p-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="grid grid-cols-[1.2fr_1fr_7rem] gap-6 border-b pb-4 last:border-0"><div className="space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-48" /></div><Skeleton className="h-4 w-44" /><Skeleton className="h-6 w-20 rounded-full" /></div>)}</CardContent></Card>;
}

export function ContactError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Alert className="border-red-200 bg-red-50"><AlertCircle className="mb-2 size-5 text-red-700" /><AlertTitle className="text-red-800">Contacts could not be loaded</AlertTitle><AlertDescription className="text-red-700"><p>{message}</p><Button type="button" variant="outline" size="sm" className="mt-4 border-red-200 bg-white" onClick={onRetry}>Try again</Button></AlertDescription></Alert>;
}

export function ContactEmpty({ filtered, onAdd }: { filtered: boolean; onAdd: () => void }) {
  return <Card><CardContent className="flex flex-col items-center px-6 py-16 text-center">{filtered ? <SearchX className="size-10 text-muted-foreground" /> : <UserRoundPlus className="size-10 text-primary" />}<h2 className="mt-5 font-serif text-2xl font-semibold">{filtered ? "No contacts match" : "Add the first person"}</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{filtered ? "Try a different search term or clear one of the filters." : "Start with someone you want to remember, then add the context that will make your next conversation easier."}</p>{filtered ? null : <Button className="mt-6" onClick={onAdd}>Add a contact</Button>}</CardContent></Card>;
}

