import { createFileRoute } from "@tanstack/react-router";

import { ChatWidget } from "#/components/chat-widget";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  // Get widget configuration from window global
  interface ChatWidgetWindow extends Window {
    __chatWidgetConfig?: {
      app_id: string;
      created_at?: number;
      email: string;
      name: string;
      onSecurityError?: (error: string, code: string) => void;
      organizationId: string;
      user_id: string;
      userJWT?: string;
    };
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: claude
  const config = (window as ChatWidgetWindow).__chatWidgetConfig;

  if (!config?.organizationId) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error: Chat widget not properly configured.</p>
        <p className="text-sm">Missing organizationId parameter.</p>
      </div>
    );
  }

  return (
    <ChatWidget
      onSecurityError={config.onSecurityError}
      organizationId={config.organizationId}
      userJWT={config.userJWT}
    />
  );
}
