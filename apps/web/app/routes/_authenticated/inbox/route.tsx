import { createFileRoute } from "@tanstack/react-router";

import { mails } from "./-components/data";
// import { cookies } from "next/headers"
// import Image from "next/image"

import { Mail } from "./-components/mail";

export const Route = createFileRoute("/_authenticated/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MailPage />;
}

function Image(props: React.ComponentProps<"img">) {
  return <img {...props} />;
}

export default function MailPage() {
  return (
    <>
      <div className="md:hidden">
        <Image
          alt="Mail"
          className="hidden dark:block"
          height={727}
          src="/examples/mail-dark.png"
          width={1280}
        />
        <Image
          alt="Mail"
          className="block dark:hidden"
          height={727}
          src="/examples/mail-light.png"
          width={1280}
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Mail mails={mails} />
      </div>
    </>
  );
}
