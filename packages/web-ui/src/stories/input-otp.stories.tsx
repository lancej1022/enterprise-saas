import type { Meta, StoryObj } from "@storybook/react-vite";
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { expect, fn, userEvent } from "storybook/test";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../components/input-otp";

/**
 * Accessible one-time password component with copy paste functionality.
 */
const meta = {
  title: "ui/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
  argTypes: {},
  args: {
    maxLength: 6,
    onChange: fn(),
    onComplete: fn(),
    pattern: REGEXP_ONLY_DIGITS_AND_CHARS,
    children: null,
    "aria-label": "One-time password",
  },

  render: (args) => (
    <InputOTP {...args} render={undefined}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the InputOTP field.
 */
export const Default: Story = {};

/**
 * The number form of the InputOTP field.
 */
export const OnlyNumbers: Story = {
  args: {
    pattern: REGEXP_ONLY_DIGITS,
  },
};

/**
 * Use multiple groups to separate the input slots.
 */
export const SeparatedGroup: Story = {
  render: (args) => (
    <InputOTP {...args} render={undefined}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const ShouldEnterText: Story = {
  name: "when typing text, should call onChange and onComplete",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvas, step }) => {
    const inputTextbox = await canvas.findByRole("textbox");

    await step("type into input textbox", async () => {
      await userEvent.click(inputTextbox);
      await userEvent.type(inputTextbox, "mocked");
      await expect(args.onChange).toHaveBeenCalledTimes(6);
    });

    await step("finish typing by pressing Enter", async () => {
      await userEvent.keyboard("{enter}");
      await expect(args.onComplete).toHaveBeenCalledTimes(1);
    });
  },
};

export const ShouldEnterOnlyNumbers: Story = {
  ...OnlyNumbers,
  name: "when only numbers are allowed, should call onChange for numbers and onComplete",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvas, step }) => {
    const inputTextbox = await canvas.findByRole("textbox");

    await step("type text into input textbox", async () => {
      await userEvent.click(inputTextbox);
      await userEvent.type(inputTextbox, "mocked");
      await expect(args.onChange).toHaveBeenCalledTimes(0);
    });

    await step("type numbers into input textbox", async () => {
      await userEvent.type(inputTextbox, "123456");
      await expect(args.onChange).toHaveBeenCalledTimes(6);
    });

    await step("finish typing by pressing Enter", async () => {
      await userEvent.keyboard("{enter}");
      await expect(args.onComplete).toHaveBeenCalledTimes(1);
    });
  },
};
