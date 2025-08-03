import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useDebouncedCallback } from "use-debounce";

// TODO: need to somehow reset the value if the user clicks the back button, otherwise the input value doesnt match the URL value
export function useDebouncedSearchParam(
  initialValue: string,
  paramName: string,
  _ref: React.RefObject<HTMLInputElement | null>,
) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });

  const debouncedNavigate = useDebouncedCallback(async () => {
    await navigate({
      // @ts-expect-error -- TODO: need to figure out how to properly type this
      search: (prev) => ({
        ...prev,
        [paramName]: value.length > 0 ? value : undefined,
      }),
    });
    // setTimeout(() => {
    /* 
          TODO: this `ref.current.focus()` logic doesnt wind up working for whatever reason, regardless of whether its wrapped in `setTimeout` or not.
          Might need to use a `useState` or, worst case scenario, focus via document.querySelector()? Surely there must be a better way than that though.
      */
    //   ref.current?.focus();
    // }, 1000);
  }, 300);

  const relevantSearchParam =
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- `string` is too broad to be valid, so we must cast
    searchParams[paramName as keyof typeof searchParams];

  function updateValue(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value;
    event.target.focus();
    setValue(val);
    void debouncedNavigate();
  }

  // TODO: Consider whether replacing this with `useSyncExternalStore` or something would avoid the need for `useEffect`
  useEffect(() => {
    if (relevantSearchParam !== value) {
      setValue(String(relevantSearchParam ?? ""));
    }
    // eslint-disable-next-line react-hooks/react-compiler -- see below
    // eslint-disable-next-line react-hooks/exhaustive-deps -- including `value` will cause the value to always re-sync to the search param every keystroke
  }, [relevantSearchParam]);

  return [value, updateValue] as const;
}
