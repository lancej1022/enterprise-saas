import { useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Button } from "@solved-contact/ui/components/button";
import { Input } from "@solved-contact/ui/components/input";
import { Label } from "@solved-contact/ui/components/label";

import { useDebouncedSearchParam } from "#/shared/hooks/use-debounced-search-params";

export function UsersSearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { search } = useSearch({ from: "/_authenticated/admin/users" });
  const navigate = useNavigate({ from: "/admin/users" });
  const [searchVal, setSearchVal] = useDebouncedSearchParam(
    search ?? "",
    "search",
    inputRef,
  );

  function setSearchQuery(value: string) {
    void navigate({
      search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
    });
  }

  return (
    <div className="relative max-w-sm flex-1">
      <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
      <Label className="sr-only" htmlFor="search">
        User search
      </Label>
      <Input
        className="pl-8"
        defaultValue={searchVal}
        id="search"
        onChange={setSearchVal}
        placeholder="Search users..."
        // TODO: using a controlled input here would definitely be simpler than using a ref to clear the value, but since the `value` is determined by search params
        // it can cause the cursor to jump to the end of the input if the user types in the middle of an existing value.
        // For more details, view https://discord.com/channels/719702312431386674/1007702008448426065/1332429537925005353 in the Tanstack Discord.
        ref={inputRef}
      />
      {search && (
        <Button
          className="absolute top-0 right-0 h-full px-3"
          onClick={() => {
            // TODO: this should just update the searchVal react state
            if (inputRef.current) {
              inputRef.current.value = "";
            }
            setSearchQuery("");
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
