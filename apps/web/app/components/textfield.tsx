"use client";

import React from "react";
// TODO: remove this dep
import { Slot } from "@radix-ui/react-slot";
import { Input } from "@solved-contact/ui/components/input";
import { Label } from "@solved-contact/ui/components/label";
import { cn } from "@solved-contact/ui/lib/utils";

import { useFieldContext } from "./tanstack-form";

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
        className={cn("grid gap-2", className)}
        data-slot="form-item"
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
}: React.ComponentProps<typeof Label>) {
  const { formItemId } = useFormField();

  return (
    <Label
      // data-error={!!error}
      className={cn("data-[error=true]:text-destructive", "gap-1", className)}
      data-slot="form-label"
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="form-description"
      id={formDescriptionId}
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
      aria-describedby={formDescriptionId}
      data-slot="form-control"
      id={formItemId}
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
  required,
}: {
  description?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
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
      <FormLabel htmlFor={field.name}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </FormLabel>
      <FormControl>
        <Input
          // aria-describedby={formDescriptionId}
          // aria-invalid={field.state.meta.errors.length > 0}
          // id={formItemId}
          id={field.name}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          value={field.state.value}
        />
      </FormControl>

      {description && <FormDescription>{description}</FormDescription>}
      {/* <FormMessage /> */}
    </FormItem>
  );
}
