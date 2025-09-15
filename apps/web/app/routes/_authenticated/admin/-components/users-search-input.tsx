import { useRef } from "react";
import { useSearch } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Button } from "@solved-contact/web-ui/components/button";
import { Input } from "@solved-contact/web-ui/components/input";
import { Label } from "@solved-contact/web-ui/components/label";

import { useDebouncedSearchParam } from "#/shared/hooks/use-debounced-search-params";

export function UsersSearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { search } = useSearch({ from: "/_authenticated/admin/users" });
  const [searchVal, setSearchVal] = useDebouncedSearchParam(
    search ?? "",
    "search",
    inputRef,
  );

  return (
    <div className="relative max-w-sm min-w-[90px] flex-1">
      <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
      <Label className="sr-only" htmlFor="search">
        User search
      </Label>
      <Input
        className="pl-8"
        defaultValue={searchVal}
        id="search"
        onChange={(e) => setSearchVal(e.target.value)}
        placeholder="Search users..."
        // TODO: want to use the ref to focus after navigating, but it doesnt seem to work for some reason...
        ref={inputRef}
      />
      {search && (
        <Button
          className="absolute top-0 right-0 h-full px-3"
          onClick={() => {
            setSearchVal("");
            // setTimeout(() => {
            //   inputRef.current?.focus();
            // }, 500);
          }}
          size="sm"
          variant="ghost"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
