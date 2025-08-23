import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@solved-contact/ui/components/breadcrumb";
import { Separator } from "@solved-contact/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@solved-contact/ui/components/sidebar";

import { Cart } from "#/components/cart";
import { ModeToggle } from "#/components/theme/mode-toggle";
import { AppSidebar } from "#/routes/-components/app-sidebar";

// Naming this file `route.tsx` creates a layout route that is used to wrap ALL the other routes nested under this directory
export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
  staleTime: Infinity,
  beforeLoad: ({ context, location }) => {
    if (!context.session.data) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center gap-2 px-4">
            {/* TODO: wrap in a tooltip to explain what this does */}
            <SidebarTrigger className="-ml-1" />
            <Separator
              className="mr-2 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <ModeToggle />
            </div>
          </div>
          <Cart />
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
