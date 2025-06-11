import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authenticated)/admin/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authenticated)/users/"!</div>
}
