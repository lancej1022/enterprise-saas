import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/inbox/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/inbox/"!</div>
}
