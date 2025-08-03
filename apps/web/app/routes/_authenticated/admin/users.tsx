import { useEffect, useRef, useState } from "react";
import { type Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/react";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouter,
  // useSearch,
} from "@tanstack/react-router";
import {
  Activity,
  ArrowUpDown,
  Building,
  Check,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Phone,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
// import { useDebouncedCallback } from "use-debounce";
import { type Mutators } from "zero/mutators";
import { type Schema } from "zero/schema";
import { z } from "zod/v4";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@solved-contact/ui/components/avatar";
import { Badge } from "@solved-contact/ui/components/badge";
import { Button } from "@solved-contact/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@solved-contact/ui/components/card";
import { Checkbox } from "@solved-contact/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@solved-contact/ui/components/dropdown-menu";
import { Input } from "@solved-contact/ui/components/input";
import { Label } from "@solved-contact/ui/components/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@solved-contact/ui/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@solved-contact/ui/components/table";

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

const limit = 20;

function query(
  z: Zero<Schema, Mutators>,
  options: {
    organizationId: string;
    search?: string;
    // TODO: this appears to be a `member` object rather than `unknown`, but Im not 100% sure how to accurately get the type of that from the BE?
    startAfter?: unknown; // cursor for pagination
  },
) {
  // TODO: Zero is flagging this as a slow query. Need to ask in Discord if they have perf improvement ideas or try adding an index
  return z.query.users
    .whereExists("members", (q) =>
      q.where("organizationId", options.organizationId),
    )
    .where("name", "ILIKE", options.search ? `%${options.search}%` : "%")
    .related("members")
    .orderBy("updatedAt", "desc")
    .limit(limit);
}

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
    query(zero, { organizationId, search: deps.search })
      .preload({ ttl: "5m" })
      .cleanup();
  },
});

// TODO: need to somehow reset the value if the user clicks the back button, otherwise the input value doesnt match the URL value
// function useDebouncedSearchParam(initialValue: string, paramName: string) {
//   const [value, setValue] = useState(initialValue);
//   const navigate = useNavigate();
//   const searchParams = useSearch({ strict: false });
//   console.log("searchParams:", searchParams);

//   // TODO: how to re-run this when `setValue` gets called without using useEffect?
//   const debouncedNavigate = useDebouncedCallback(
//     async (callback: () => void) => {
//       await navigate({
//         // @ts-expect-error -- TODO: need to figure out how to properly type this
//         search: (prev) => ({
//           ...prev,
//           [paramName]: value.length > 0 ? value : undefined,
//         }),
//       });
//       callback();
//       console.log("debouncedNavigate complete");
//     },
//     300,
//   );

//   const relevantSearchParam =
//     // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- `string` is too broad to be valid, so we must cast
//     searchParams[paramName as keyof typeof searchParams];

//   function updateValue(event: React.ChangeEvent<HTMLInputElement>) {
//     const val = event.target.value;
//     event.target.focus();
//     setValue(val);
//     void debouncedNavigate(() => event.target.focus());
//   }

//   useEffect(() => {
//     if (relevantSearchParam !== value) {
//       setValue(String(relevantSearchParam ?? ""));
//     }
//   }, [relevantSearchParam]);

//   return [value, updateValue] as const;
// }

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-500";
    case "Away":
      return "bg-yellow-500";
    case "Offline":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

export function UserManagement() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Record<number, unknown>>({});
  const {
    search = "",
    status = "All Statuses",
    team = "All Teams",
    location = "All Locations",
    role = "All Roles",
    page = 1,
  } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { zero, session } = useRouter().options.context;
  const organizationId = session.data?.activeOrganizationId ?? "";
  // const [searchVal, setSearchVal] = useDebouncedSearchParam(search, "search");

  // For cursor-based pagination, we need to determine the cursor for the current page
  const currentCursor = page > 1 ? cursors[page] : undefined;

  const [users] = useQuery(
    // query(zero, { organizationId, search, startAfter: currentCursor }),
    query(zero, {
      organizationId,
      // search: searchVal,
      search,
      startAfter: currentCursor,
    }),
    {
      ttl: "5m",
    },
  );

  // TODO: this was vibe coded with Claude -- need to check the Zero discord to see if they have better recommendations
  // Store cursor for next page when we have a full page of results
  useEffect(() => {
    if (users.length === limit && page > 0) {
      const lastMember = users[users.length - 1];
      if (lastMember) {
        // eslint-disable-next-line react-you-might-not-need-an-effect/no-derived-state -- TODO: keeping this temporarily until I get cursors working properly with Zero
        setCursors((prev) => ({ ...prev, [page + 1]: lastMember }));
      }
    }
  }, [users, page]);

  function setSearchQuery(value: string) {
    void navigate({
      search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
    });
  }

  function toggleUserSelection(userId: string) {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  function toggleSelectAll() {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b"></div>

      <div className="container flex-1 space-y-4 overflow-auto p-4">
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
                <div className="relative max-w-sm flex-1">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Label className="sr-only" htmlFor="search">
                    User search
                  </Label>
                  <Input
                    className="pl-8"
                    defaultValue={search}
                    // defaultValue={searchVal}
                    id="search"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    // onChange={setSearchVal}
                    placeholder="Search users..."
                    // TODO: using a controlled input here would definitely be simpler than using a ref to clear the value, but since the `value` is determined by search params
                    // it can cause the cursor to jump to the end of the input if the user types in the middle of an existing value.
                    // For more details, view https://discord.com/channels/719702312431386674/1007702008448426065/1332429537925005353 in the Tanstack Discord.
                    ref={inputRef}
                  />
                  {search && (
                    <Button
                      className="absolute top-0 right-0 h-full px-3"
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }
                        setSearchQuery("");
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>
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
              <div className="flex items-center space-x-2">
                {selectedUsers.length > 0 && (
                  <Button
                    onClick={() => setSelectedUsers([])}
                    size="sm"
                    variant="outline"
                  >
                    Clear Selection ({selectedUsers.length})
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <span className="sr-only">Select users</span>
                      <Checkbox
                        aria-label="Select all users"
                        checked={
                          selectedUsers.length === users.length &&
                          users.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[250px]">
                      <div className="flex items-center space-x-1">
                        <span>User</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={8}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow className="group" key={user.id}>
                        <TableCell>
                          <Checkbox
                            aria-label={`Select ${user.name}`}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                alt={user.name}
                                src={user.image || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <Link
                                className="font-medium hover:underline"
                                // @ts-expect-error -- link intentionally broken for now
                                to={`/admin/users/${user.id}`}
                              >
                                {user.name}
                              </Link>
                              <div className="text-muted-foreground text-xs">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.members[0]?.role === "Administrator"
                                ? "default"
                                : "outline"
                            }
                          >
                            {user.members[0]?.role}
                          </Badge>
                        </TableCell>
                        {/* @ts-expect-error -- havent yet assigned these to users/members */}
                        <TableCell>{user.team}</TableCell>
                        {/* @ts-expect-error -- havent yet assigned these to users/members */}
                        <TableCell>{user.location}</TableCell>
                        {/* @ts-expect-error -- havent yet assigned these to users/members */}
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div
                              //  @ts-expect-error -- havent yet assigned these to users/members
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- havent created statuses yet
                              className={`h-2 w-2 rounded-full ${getStatusColor(user.status)}`}
                            />
                            {/* @ts-expect-error -- havent yet assigned these to users/members */}
                            <span>{user.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="opacity-0 group-hover:opacity-100"
                                size="sm"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  params={{ userId: user.id }}
                                  to={`/admin/users/$userId`}
                                >
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              <DropdownMenuItem>
                                Assign to Team
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Change Phone Number
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      aria-disabled={page <= 1}
                      className={
                        page <= 1 ? "pointer-events-none" : "cursor-pointer"
                      }
                      // @ts-expect-error -- link intentionally broken for now
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- link intentionally broken for now
                      search={(prev) => ({
                        ...prev,
                        page: page > 1 ? page - 1 : undefined,
                      })}
                      to={`/admin/users`}
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: Math.min(5, Math.max(page + 2, 5)) },
                    (_, i) => i + 1,
                  ).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        className="cursor-pointer"
                        isActive={pageNum === page}
                        // @ts-expect-error -- link intentionally broken for now
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- link intentionally broken for now
                        search={(prev) => ({
                          ...prev,
                          page: pageNum,
                        })}
                        to={`/admin/users`}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {page < 5 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      aria-disabled={users.length < limit}
                      className={
                        users.length < limit
                          ? "pointer-events-none"
                          : "cursor-pointer"
                      }
                      // @ts-expect-error -- link intentionally broken for now
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- link intentionally broken for now
                      search={(prev) => ({
                        ...prev,
                        page: page + 1,
                      })}
                      to={`/admin/users`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>

      <Outlet />
    </div>
  );
}
