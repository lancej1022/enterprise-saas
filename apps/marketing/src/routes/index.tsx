import { createFileRoute } from "@tanstack/react-router";

import HeroSection from "#/components/hero-section";
import { HeroHeader } from "#/components/marketing-header";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <>
      {/* TODO: Needs images and the theme, so that it resembles https://tailark.com/hero-section */}
      <HeroHeader />
      <HeroSection />
    </>
  );
}
