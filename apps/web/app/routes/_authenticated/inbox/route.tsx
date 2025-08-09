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
  // const layout =  cookies().get("react-resizable-panels:layout:mail");
  // const collapsed =  cookies().get("react-resizable-panels:collapsed");

  const defaultLayout = undefined; // layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = undefined; // collapsed ? JSON.parse(collapsed.value) : undefined;

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
        <Mail
          defaultCollapsed={defaultCollapsed}
          defaultLayout={defaultLayout}
          mails={mails}
          navCollapsedSize={4}
        />
      </div>
    </>
  );
}
