import type { Message } from "@/db-collections";

export function getAvatarColor(username: string) {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-teal-500",
  ];
  const index = username
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export default function Messages({
  messages,
  user,
}: {
  messages: Message[];
  user: string;
}) {
  return (
    <>
      {messages.map((msg: Message) => (
        <div
          className={`flex ${
            msg.user === user ? "justify-end" : "justify-start"
          }`}
          key={msg.id}
        >
          <div
            className={`flex max-w-xs items-start space-x-3 lg:max-w-md ${
              msg.user === user ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white ${getAvatarColor(
                msg.user,
              )}`}
            >
              {msg.user.charAt(0).toUpperCase()}
            </div>

            <div
              className={`rounded-2xl px-4 py-2 ${
                msg.user === user
                  ? "rounded-br-md bg-blue-500 text-white"
                  : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
              }`}
            >
              {msg.user !== user && (
                <p className="mb-1 text-xs font-medium text-gray-500">
                  {msg.user}
                </p>
              )}
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
