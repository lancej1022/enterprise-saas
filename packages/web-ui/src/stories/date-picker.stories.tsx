import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { action } from "storybook/actions";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../components/button";
import { Calendar } from "../components/calendar";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";

/**
 * A window overlaid on either the primary window or another dialog window,
 * rendering the content underneath inert.
 */
const meta = {
  title: "ui/DatePicker",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {},
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Combination of the calendar and a button that opens a popover.
 */
export const WithPopover: Story = {
  args: {
    captionLayout: "dropdown",
  },

  render: (args) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    return (
      <div className="flex flex-col gap-3">
        <Label className="px-1" htmlFor="date">
          Date of birth
        </Label>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              className="w-48 justify-between font-normal"
              id="date"
              variant="outline"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto overflow-hidden p-0">
            <Calendar
              {...args}
              mode="single"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
                action("date selected")(date);
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};

export const ShouldOpenPopover: Story = {
  ...WithPopover,
  name: "when clicking the button, should open the popover to select a date",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await step("Open the popover", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: "Date of birth" }),
      );
      await waitFor(() =>
        expect(
          canvasElement.ownerDocument.body.querySelector(".rdp-root"),
        ).toBeVisible(),
      );
    });
    await step("Select a date", async () => {
      const dateButtons = await canvas.findAllByRole("button", {
        name: /1st/i,
      });
      const dateButton = dateButtons[0];
      if (!dateButton) {
        throw new Error("Date button not found");
      }
      await userEvent.click(dateButton);
    });
  },
};

function formatDate(date: Date | undefined) {
  return date
    ? date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";
}

function isValidDate(date: Date | undefined) {
  return date ? !isNaN(date.getTime()) : false;
}

/**
 * Combination of the calendar and an input field that allows typing a date.
 */
export const WithInput: Story = {
  args: {
    captionLayout: "dropdown",
  },

  render: (args) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date("2025-06-01"));
    const [month, setMonth] = useState<Date | undefined>(date);
    const [value, setValue] = useState(formatDate(date));

    return (
      <div className="flex flex-col gap-3">
        <Label className="px-1" htmlFor="date">
          Subscription Date
        </Label>
        <div className="relative flex gap-2">
          <Input
            className="bg-background pr-10"
            id="date"
            onChange={(e) => {
              const date = new Date(e.target.value);
              setValue(e.target.value);
              if (isValidDate(date)) {
                setDate(date);
                setMonth(date);
                action("date input changed")(date);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            placeholder="June 01, 2025"
            value={value}
          />
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <Button
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                id="date-picker"
                variant="ghost"
              >
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Select date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              alignOffset={-8}
              className="w-auto overflow-hidden p-0"
              sideOffset={10}
            >
              <Calendar
                {...args}
                mode="single"
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  setDate(date);
                  setValue(formatDate(date));
                  setOpen(false);
                  action("date selected")(date);
                }}
                selected={date}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  },
};

export const ShouldEnterTextDate: Story = {
  ...WithInput,
  name: "when typing a valid date, should update the input and close the calendar",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const input = await canvas.findByRole("textbox", {
      name: "Subscription Date",
    });
    await step("type a date", async () => {
      await userEvent.click(input);
      await userEvent.clear(input);
      await userEvent.type(input, "July 21, 1999");
      await userEvent.keyboard("{enter}");
      await expect(input).toHaveValue("July 21, 1999");
    });

    await step("check the calendar", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: "Select date" }),
      );
      await waitFor(() =>
        expect(
          canvas.queryByRole("button", {
            name: "Wednesday, July 21st, 1999, selected",
          }),
        ).toBeVisible(),
      );
    });
  },
};

/**
 * Combination of the calendar and an input field that allows changing the time.
 */
export const WithDateTime: Story = {
  args: {
    captionLayout: "dropdown",
  },

  render: (args) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    return (
      <div className="flex gap-4">
        <div className="flex flex-col gap-3">
          <Label className="px-1" htmlFor="date-picker">
            Date
          </Label>
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <Button
                className="w-32 justify-between font-normal"
                id="date-picker"
                variant="outline"
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto overflow-hidden p-0"
            >
              <Calendar
                {...args}
                mode="single"
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                  action("date selected")(date);
                }}
                selected={date}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3">
          <Label className="px-1" htmlFor="time-picker">
            Time
          </Label>
          <Input
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            defaultValue="10:30:00"
            disabled={!date}
            id="time-picker"
            onChange={(e) => {
              if (!date) {
                return;
              }
              const [hours, minutes, seconds] = e.target.value
                .split(":")
                .map(Number);
              if (hours) {
                date.setHours(hours, minutes, seconds);
              }
              setDate(date);
              action("time selected")(date);
            }}
            step="1"
            type="time"
          />
        </div>
      </div>
    );
  },
};

export const ShouldOpenCalendar: Story = {
  ...WithDateTime,
  name: "when clicking the date button, should open the calendar to select a date",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await step("Open the date popover", async () => {
      const dateInput = await canvas.findByLabelText("Date");
      await userEvent.click(dateInput);
      await waitFor(() =>
        expect(
          canvas.queryAllByRole("button", { name: /1st/i }).at(0),
        ).toBeVisible(),
      );
    });

    const dateButtons = await canvas.findAllByRole("button", { name: /1st/i });
    const dateButton = dateButtons[0];
    if (!dateButton) {
      throw new Error("Date button not found");
    }
    await userEvent.click(dateButton);

    await step("type a time", async () => {
      const timeInput = await canvas.findByLabelText("Time");
      await userEvent.click(timeInput);
      await userEvent.type(timeInput, "1");
    });
  },
};
