import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { TextField } from "./textfield";

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    TextField,
  },
  formComponents: {
    /*
        While form.AppField solves many of the problems with Field boilerplate and reusability, 
        it doesn't solve the problem of form boilerplate and reusability.
        In particular, being able to share instances of form.Subscribe for, say, 
        a reactive form submission button is a common usecase.
    */
    SubscribeButton,
  },
});
export { useAppForm };

function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button type="submit" disabled={isSubmitting}>
          {label}
        </button>
      )}
    </form.Subscribe>
  );
}

export function TanstackForm() {
  const form = useAppForm({
    // Supports all useForm options
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form.AppForm>
      {/* Notice the `AppField` instead of `Field`; `AppField` provides the required context */}
      <form.AppField
        name="email"
        children={(field) => (
          <field.TextField label="Email" description="Email" />
        )}
      />
      <form.AppField
        name="password"
        children={(field) => (
          <field.TextField label="Password" description="Password" />
        )}
      />
      {/* Notice the `AppForm` component wrapper; `AppForm` provides the required context */}
      <form.SubscribeButton label="Submit" />
    </form.AppForm>
  );
}
