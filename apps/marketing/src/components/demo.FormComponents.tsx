import { useStore } from '@tanstack/react-form'

import { useFieldContext, useFormContext } from '../hooks/demo.form-context'

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {label}
        </button>
      )}
    </form.Subscribe>
  )
}

function ErrorMessages({
  errors,
}: {
  errors: ({ message: string } | string)[]
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          className="text-red-500 mt-1 font-bold"
          key={typeof error === 'string' ? error : error.message}
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function TextField({
  label,
  placeholder,
}: {
  label: string
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- comes from tanstack start boilerplate...
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <label className="block font-bold mb-1 text-xl" htmlFor={label}>
        {label}
        <input
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          value={field.state.value}
        />
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function TextArea({
  label,
  rows = 3,
}: {
  label: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- comes from tanstack start boilerplate...
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <label className="block font-bold mb-1 text-xl" htmlFor={label}>
        {label}
        <textarea
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          rows={rows}
          value={field.state.value}
        />
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Select({
  label,
  values,
}: {
  label: string
  placeholder?: string
  values: { label: string; value: string }[]
}) {
  const field = useFieldContext<string>()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- comes from tanstack start boilerplate...
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <label className="block font-bold mb-1 text-xl" htmlFor={label}>
        {label}
      </label>
      <select
        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value}
      >
        {values.map((value) => (
          <option key={value.value} value={value.value}>
            {value.label}
          </option>
        ))}
      </select>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
