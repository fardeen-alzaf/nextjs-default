"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

export default function Search({ button }: { button?: boolean }) {
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSearchParams = useCallback(
    (debouncedValue: string) => {
      const params = new URLSearchParams(window.location.search);
      if (debouncedValue.length > 0) {
        params.set("search", debouncedValue);
        params.delete("page");
      } else {
        params.delete("search");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router]
  );

  // EFFECT: Set Initial Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("search") ?? "";
    setInputValue(searchQuery);
  }, []);

  // EFFECT: Set Mounted
  useEffect(() => {
    if (debouncedValue.length > 0 && !mounted) {
      setMounted(true);
    }
  }, [debouncedValue, mounted]);

  // EFFECT: Debounce Input Value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  // EFFECT: Search Params
  useEffect(() => {
    if (mounted) handleSearchParams(debouncedValue);
  }, [debouncedValue, handleSearchParams, mounted]);

  return (
    <div className="relative w-[250px]">
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        placeholder="Search..."
        className="pr-10 pl-7 w-full h-9"
      />

      <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />

      {button && (
        <Button
          className="absolute right-0 top-0 rounded-l-[0]"
          loading={isPending}
        >
          {!isPending && <SearchIcon />}
        </Button>
      )}
    </div>
  );
}
