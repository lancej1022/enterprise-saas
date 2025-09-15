import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";

/**
 * A set of layered sections of content—known as tab panels—that are displayed
 * one at a time.
 */
const meta = {
  title: "ui/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {},
  args: {
    defaultValue: "account",
    className: "w-96",
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  ),
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the tabs.
 */
export const Default: Story = {};

export const ShouldChangeTabs: Story = {
  name: "when clicking a tab, should change the content",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, step }) => {
    const tabs = await canvas.findAllByRole("tab");

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      if (!tab) {
        throw new Error("Tab not found");
      }
      await step(`click the '${tab.innerText}' tab`, async () => {
        await userEvent.click(tab);
        await waitFor(() =>
          expect(tab).toHaveAttribute("aria-selected", "true"),
        );
        await expect(
          canvas.queryByRole("tabpanel", { name: tab.innerText }),
        ).toBeVisible();
      });

      await step("check other tabs are not selected", async () => {
        for (let j = 0; j < tabs.length; j++) {
          const tab = tabs[j];
          if (!tab) {
            throw new Error("Tab not found");
          }
          if (j !== i) {
            await expect(tabs[j]).toHaveAttribute("aria-selected", "false");
            await expect(
              canvas.queryByRole("tabpanel", { name: tab.innerText }),
            ).toBeNull();
          }
        }
      });
    }
  },
};
