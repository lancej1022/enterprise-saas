// import { Image } from "@solved-contact/ui/components/image";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
// import { AnimatedGroup } from "@solved-contact/ui/components/motion-primitives/animated-group";
// import { TextEffect } from "@solved-contact/ui/components/motion-primitives/text-effect";
import { Button } from "@solved-contact/ui/components/button";

import { HeroHeader } from "./marketing-header";

// const transitionVariants = {
//   item: {
//     hidden: {
//       opacity: 0,
//       filter: "blur(12px)",
//       y: 12,
//     },
//     visible: {
//       opacity: 1,
//       filter: "blur(0px)",
//       y: 0,
//       transition: {
//         type: "spring",
//         bounce: 0.3,
//         duration: 1.5,
//       },
//     },
//   },
// };

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
          <div className="absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <div
              className="absolute inset-0 -z-20"
              //   variants={{
              //     container: {
              //       visible: {
              //         transition: {
              //           delayChildren: 1,
              //         },
              //       },
              //     },
              //     item: {
              //       hidden: {
              //         opacity: 0,
              //         y: 20,
              //       },
              //       visible: {
              //         opacity: 1,
              //         y: 0,
              //         transition: {
              //           type: "spring",
              //           bounce: 0.3,
              //           duration: 2,
              //         },
              //       },
              //     },
              //   }}
            >
              <img
                alt="background"
                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
                height="4095"
                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                width="3276"
              />
            </div>
            {/* </AnimatedGroup> */}
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
                {/* <AnimatedGroup variants={transitionVariants}> */}
                <div
                // variants={transitionVariants}
                >
                  <Link
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                    to="/"
                  >
                    <span className="text-foreground text-sm">
                      Introducing Support for AI Models
                    </span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* </AnimatedGroup> */}
                {/* <TextEffect */}
                <h1
                  //   as="h1"
                  className="mt-8 text-6xl text-balance md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                  //   preset="fade-in-blur"
                  //   speedSegment={0.3}
                >
                  Modern Solutions for Customer Engagement
                </h1>
                {/* </TextEffect> */}
                <p
                  className="mx-auto mt-8 max-w-2xl text-lg text-balance"
                  // delay={0.5}
                  // per="line"
                  // preset="fade-in-blur"
                  // speedSegment={0.3}
                >
                  Highly customizable components for building modern websites
                  and applications that look and feel the way you mean it.
                </p>

                <div
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                  //   variants={{
                  //     container: {
                  //       visible: {
                  //         transition: {
                  //           staggerChildren: 0.05,
                  //           delayChildren: 0.75,
                  //         },
                  //       },
                  //     },
                  //     ...transitionVariants,
                  //   }}
                >
                  <div
                    className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                    key={1}
                  >
                    <Button
                      asChild
                      className="rounded-xl px-5 text-base"
                      size="lg"
                    >
                      <Link to="/">
                        <span className="text-nowrap">Start Building</span>
                      </Link>
                    </Button>
                  </div>
                  <Button
                    asChild
                    className="h-10.5 rounded-xl px-5"
                    key={2}
                    size="lg"
                    variant="ghost"
                  >
                    <Link to="/">
                      <span className="text-nowrap">Request a demo</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div
            //   variants={{
            //     container: {
            //       visible: {
            //         transition: {
            //           staggerChildren: 0.05,
            //           delayChildren: 0.75,
            //         },
            //       },
            //     },
            //     ...transitionVariants,
            //   }}
            >
              <div className="relative mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
                <div
                  aria-hidden
                  className="to-background absolute inset-0 z-10 bg-linear-to-b from-transparent from-35%"
                />
                <div className="ring-background bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg ring-1 inset-shadow-2xs shadow-zinc-950/15 dark:inset-shadow-white/20">
                  <img
                    alt="app screen"
                    className="bg-background relative hidden aspect-15/8 rounded-2xl dark:block"
                    height="1440"
                    src="/mail2.png"
                    width="2700"
                  />
                  <img
                    alt="app screen"
                    className="border-border/25 relative z-2 aspect-15/8 rounded-2xl border dark:hidden"
                    height="1440"
                    src="/mail2-light.png"
                    width="2700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-background pt-16 pb-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                className="block text-sm duration-150 hover:opacity-75"
                to="/"
              >
                <span> Meet Our Customers</span>

                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14">
              <div className="flex">
                <img
                  alt="Nvidia Logo"
                  className="mx-auto h-5 w-fit dark:invert"
                  height="20"
                  src="https://html.tailus.io/blocks/customers/nvidia.svg"
                  width="auto"
                />
              </div>

              <div className="flex">
                <img
                  alt="Column Logo"
                  className="mx-auto h-4 w-fit dark:invert"
                  height="16"
                  src="https://html.tailus.io/blocks/customers/column.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="GitHub Logo"
                  className="mx-auto h-4 w-fit dark:invert"
                  height="16"
                  src="https://html.tailus.io/blocks/customers/github.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="Nike Logo"
                  className="mx-auto h-5 w-fit dark:invert"
                  height="20"
                  src="https://html.tailus.io/blocks/customers/nike.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="Lemon Squeezy Logo"
                  className="mx-auto h-5 w-fit dark:invert"
                  height="20"
                  src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="Laravel Logo"
                  className="mx-auto h-4 w-fit dark:invert"
                  height="16"
                  src="https://html.tailus.io/blocks/customers/laravel.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="Lilly Logo"
                  className="mx-auto h-7 w-fit dark:invert"
                  height="28"
                  src="https://html.tailus.io/blocks/customers/lilly.svg"
                  width="auto"
                />
              </div>

              <div className="flex">
                <img
                  alt="OpenAI Logo"
                  className="mx-auto h-6 w-fit dark:invert"
                  height="24"
                  src="https://html.tailus.io/blocks/customers/openai.svg"
                  width="auto"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
