import { useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Button } from "@solved-contact/ui/components/button";
import { Input } from "@solved-contact/ui/components/input";
import { Label } from "@solved-contact/ui/components/label";

// import { useDebouncedCallback } from "use-debounce";

// TODO: need to somehow reset the value if the user clicks the back button, otherwise the input value doesnt match the URL value
// function useDebouncedSearchParam(initialValue: string, paramName: string) {
//   const [value, setValue] = useState(initialValue);
//   const navigate = useNavigate();
//   const searchParams = useSearch({ strict: false });
//   console.log("searchParams:", searchParams);

//   // TODO: how to re-run this when `setValue` gets called without using useEffect?
//   const debouncedNavigate = useDebouncedCallback(
//     async (callback: () => void) => {
//       await navigate({
//         // @ts-expect-error -- TODO: need to figure out how to properly type this
//         search: (prev) => ({
//           ...prev,
//           [paramName]: value.length > 0 ? value : undefined,
//         }),
//       });
//       callback();
//       console.log("debouncedNavigate complete");
//     },
//     300,
//   );

//   const relevantSearchParam =
//     // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- `string` is too broad to be valid, so we must cast
//     searchParams[paramName as keyof typeof searchParams];

//   function updateValue(event: React.ChangeEvent<HTMLInputElement>) {
//     const val = event.target.value;
//     event.target.focus();
//     setValue(val);
//     void debouncedNavigate(() => event.target.focus());
//   }

//   useEffect(() => {
//     if (relevantSearchParam !== value) {
//       setValue(String(relevantSearchParam ?? ""));
//     }
//   }, [relevantSearchParam]);

//   return [value, updateValue] as const;
// }

export function UsersSearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { search } = useSearch({ from: "/_authenticated/admin/users" });
  const navigate = useNavigate({ from: "/admin/users" });
  // const [searchVal, setSearchVal] = useDebouncedSearchParam(search, "search");

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
        defaultValue={search}
        // defaultValue={searchVal}
        id="search"
        onChange={(e) => setSearchQuery(e.target.value)}
        // onChange={setSearchVal}
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
