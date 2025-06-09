"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";

import { useFieldContext } from "./tanstack-form";
import { Label } from "./ui/label";

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this is straight from shadcn
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function useFormField() {
  const itemContext = React.useContext(FormItemContext);
  const { id } = itemContext;

  return {
    id,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      // data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const {
    // error,
    formItemId,
    formDescriptionId,
    // formMessageId,
  } = useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={formDescriptionId}
      //   aria-describedby={
      //     !error
      //       ? `${formDescriptionId}`
      //       : `${formDescriptionId} ${formMessageId}`
      //   }
      //   aria-invalid={!!error}
      {...props}
    />
  );
}

export function TextField({
  label,
  placeholder,
  description,
}: {
  label: string;
  placeholder?: string;
  description?: string;
}) {
  // TODO: there should be a way to make this more typesafe
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();
  //   TODO: cannot invoke this hook here because the `FormItem` is the actual provider! In other words, the `useFormField` returns `undefined`
  // so the `formitem` needs to wrap the `textfield` (or just remove the textfield entirely and go with something closer to the original shadcn implementation)
  //   const { formItemId, formDescriptionId } = useFormField();

  return (
    // TODO: all of these elements are tightly bound to RHF -- need to reimplement them for Tanstack
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          // aria-describedby={formDescriptionId}
          // aria-invalid={field.state.meta.errors.length > 0}
          // id={formItemId}
          placeholder={placeholder}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </FormControl>

      {description && <FormDescription>{description}</FormDescription>}
      {/* <FormMessage /> */}
    </FormItem>
  );
}
