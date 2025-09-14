import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import {
  Activity,
  Building,
  Check,
  ChevronDown,
  Filter,
  Phone,
  UserPlus,
  Users,
} from "lucide-react";
import { z } from "zod/v4";
import { getUsersQuery } from "@solved-contact/backend/zero/get-queries";
import { Button } from "@solved-contact/web-ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@solved-contact/web-ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@solved-contact/web-ui/components/dropdown-menu";

import { UsersSearchInput } from "./-components/users-search-input";
import { UsersTable } from "./-components/users-table";

const statuses = ["All Statuses", "Active", "Away", "Offline"] as const;
const statusSchema = z.enum(statuses).optional();

const teams = [
  "All Teams",
  "Customer Support",
  "Technical Support",
  "Sales",
  "Management",
] as const;
const locations = [
  "All Locations",
  "New York",
  "San Francisco",
  "Chicago",
  "Miami",
  "Boston",
] as const;
const roles = ["All Roles", "Agent", "Supervisor", "Administrator"] as const;
const rolesSchema = z.enum(roles).optional();
const teamsSchema = z.enum(teams).optional();
const locationsSchema = z.enum(locations).optional();

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UserManagement,
  validateSearch: z.object({
    search: z.string().optional(),
    status: statusSchema,
    team: teamsSchema,
    location: locationsSchema,
    role: rolesSchema,
    page: z.number().min(1).optional().default(1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    const { zero, session } = context;
    const organizationId = session.data?.activeOrganizationId ?? "";
    zero.preload(getUsersQuery(organizationId, deps.search ?? null));
  },
});

function UserManagement() {
  const {
    status = "All Statuses",
    team = "All Teams",
    location = "All Locations",
    role = "All Roles",
  } = Route.useSearch({
    select: (s) => ({
      status: s.status,
      team: s.team,
      location: s.location,
      role: s.role,
    }),
  });
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <>
      <div className="container flex-1 space-y-4 p-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <h1>User Management</h1>
                </CardTitle>
                <CardDescription>
                  Manage your contact center users, teams, and permissions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button asChild size="sm">
                  <Link to="/admin/users/add-user">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between space-x-2">
              <div className="flex flex-1 items-center space-x-2">
                <UsersSearchInput />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Activity className="mr-2 h-4 w-4" />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statuses.map((t) => (
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        key={t}
                        onClick={() =>
                          void navigate({
                            search: (prev) => ({
                              ...prev,
                              status: t === "All Statuses" ? undefined : t,
                              page: 1,
                            }),
                          })
                        }
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        {t === status && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Building className="mr-2 h-4 w-4" />
                      {team}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    {/* TODO: idk if this is accessible? */}
                    <DropdownMenuLabel>Filter by Team</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {teams.map((t) => (
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        key={t}
                        // TODO: this logic was totally broken from v0, so need to get clever about implementing it
                        onClick={() =>
                          void navigate({
                            search: (prev) => ({
                              ...prev,
                              team: t === "All Teams" ? undefined : t,
                              page: 1,
                            }),
                          })
                        }
                      >
                        {t}
                        {t === team && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      {location}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {locations.map((loc) => (
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        key={loc}
                        onClick={() =>
                          void navigate({
                            search: (prev) => ({
                              ...prev,
                              location:
                                loc === "All Locations" ? undefined : loc,
                              page: 1,
                            }),
                          })
                        }
                      >
                        {loc}
                        {loc === location && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      {role}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {roles.map((r) => (
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        key={r}
                        onClick={() =>
                          void navigate({
                            search: (prev) => ({
                              ...prev,
                              role: r === "All Roles" ? undefined : r,
                              page: 1,
                            }),
                          })
                        }
                      >
                        {r}
                        {r === role && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <UsersTable />
          </CardContent>
        </Card>
      </div>
      <Outlet />
    </>
  );
}
