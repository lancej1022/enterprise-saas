// import { atom, useAtom } from "jotai";

import {
  mails,
  // type Mail
} from "./data";

// interface Config {
//   selected: Mail["id"] | null;
// }

//   TODO: use a URL Param instead!
// const configAtom = atom<Config>({
//   selected: mails[0].id,
// });

export function useMail() {
  //   const params = useParams({ from: "/_authenticated/inbox/$mail" });
  return [
    // { selected: params.mail || mails[0]?.id },
    { selected: mails[0]?.id },
    () => {
      return;
    },
  ] as const;
  //   return useAtom(configAtom);
}
