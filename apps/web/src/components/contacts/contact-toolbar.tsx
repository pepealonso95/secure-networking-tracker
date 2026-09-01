"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContactSort, PriorityFilter } from "@/lib/types";

export function ContactToolbar({
  query,
  priority,
  sort,
  onQueryChange,
  onPriorityChange,
  onSortChange,
}: {
  query: string;
  priority: PriorityFilter;
  sort: ContactSort;
  onQueryChange: (value: string) => void;
  onPriorityChange: (value: PriorityFilter) => void;
  onSortChange: (value: ContactSort) => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border bg-card p-3 shadow-sm md:grid-cols-[minmax(15rem,1fr)_12rem_13rem]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search people or notes" className="pl-9" aria-label="Search contacts" />
      </div>
      <Select value={priority} onValueChange={(value) => onPriorityChange(value as PriorityFilter)}>
        <SelectTrigger aria-label="Filter by priority"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High priority</SelectItem>
          <SelectItem value="medium">Medium priority</SelectItem>
          <SelectItem value="low">Low priority</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(value) => onSortChange(value as ContactSort)}>
        <SelectTrigger aria-label="Sort contacts"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Recently updated</SelectItem>
          <SelectItem value="name">Name A to Z</SelectItem>
          <SelectItem value="priority">Priority high to low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

