import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Building,
  Check,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { z } from "zod/v4";

import { AddUserDialog } from "./-components/add-user-dialog";

const tabs = ["all", "active", "away", "offline"] as const;
const tabsSchema = z.enum(tabs).default("all");

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
const rolesSchema = z.enum(roles).default("All Roles");
const teamsSchema = z.enum(teams).default("All Teams");
const locationsSchema = z.enum(locations).default("All Locations");

export const Route = createFileRoute("/(authenticated)/admin/users/")({
  component: UserManagement,
  validateSearch: z.object({
    search: z.string().optional(),
    tab: tabsSchema,
    team: teamsSchema,
    location: locationsSchema,
    role: rolesSchema,
  }),
});

// Mock data
const users = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@acme.com",
    role: "Agent",
    status: "Active",
    team: "Customer Support",
    location: "New York",
    phoneNumber: "+1 (555) 123-4567",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@acme.com",
    role: "Supervisor",
    status: "Active",
    team: "Technical Support",
    location: "San Francisco",
    phoneNumber: "+1 (555) 987-6543",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Jessica Williams",
    email: "jessica.williams@acme.com",
    role: "Agent",
    status: "Away",
    team: "Sales",
    location: "Chicago",
    phoneNumber: "+1 (555) 456-7890",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "David Rodriguez",
    email: "david.rodriguez@acme.com",
    role: "Administrator",
    status: "Active",
    team: "Management",
    location: "Miami",
    phoneNumber: "+1 (555) 234-5678",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Emily Taylor",
    email: "emily.taylor@acme.com",
    role: "Agent",
    status: "Offline",
    team: "Customer Support",
    location: "Boston",
    phoneNumber: "+1 (555) 876-5432",
    avatar: "/placeholder.svg?height=40&width=40",
  },
] as const;

export function UserManagement() {
  // TODO: refactor all of this stuff to use Tanstack params where possible!
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search = "", tab, team, location, role } = Route.useSearch();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const navigate = useNavigate({ from: Route.fullPath });

  function setSearchQuery(value: string) {
    void navigate({
      search: (prev) => ({ ...prev, search: value || undefined }),
    });
  }

  const filteredUsers = users.filter((user) => {
    // Filter by search query
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phoneNumber.includes(search);

    // Filter by tab
    const matchesTab =
      tab === "all" ||
      (tab === "active" && user.status === "Active") ||
      (tab === "away" && user.status === "Away") ||
      (tab === "offline" && user.status === "Offline");

    // Filter by dropdown filters
    const matchesTeam = team === "All Teams" || user.team === team;
    const matchesLocation =
      location === "All Locations" || user.location === location;
    const matchesRole = role === "All Roles" || user.role === role;

    return (
      matchesSearch &&
      matchesTab &&
      matchesTeam &&
      matchesLocation &&
      matchesRole
    );
  });

  function toggleUserSelection(userId: string) {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  function toggleSelectAll() {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  }

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

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsAddUserOpen(true)} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </div>

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
              {/* TODO: This isnt really the right use case for Tabs, and `axe` correctly flags this as an a11y violation because there isnt any TabContent being controlled here */}
              <Tabs
                className="w-[400px]"
                defaultValue="all"
                onValueChange={(value) => {
                  const parsed = tabsSchema.safeParse(value);
                  if (parsed.success) {
                    void navigate({
                      search: (prev) => ({ ...prev, tab: parsed.data }),
                    });
                  }
                }}
                value={tab}
              >
                <TabsList
                  aria-label="User status filter"
                  className="grid grid-cols-4"
                >
                  <TabsTrigger aria-controls={undefined} value="all">
                    All
                  </TabsTrigger>
                  <TabsTrigger aria-controls={undefined} value="active">
                    Active
                  </TabsTrigger>
                  <TabsTrigger aria-controls={undefined} value="away">
                    Away
                  </TabsTrigger>
                  <TabsTrigger aria-controls={undefined} value="offline">
                    Offline
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between space-x-2">
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Label className="sr-only" htmlFor="search">
                    User search
                  </Label>
                  <Input
                    className="pl-8"
                    defaultValue={search}
                    id="search"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    // TODO: using a controlled input here would definitely be simpler than using a ref to clear the value, but since the `value` is determined by search params
                    // it can cause the cursor to jump to the end of the input if the user types in the middle of an existing value.
                    // For more details, view https://discord.com/channels/719702312431386674/1007702008448426065/1332429537925005353 in the Tanstack Discord.
                    ref={inputRef}
                  />
                  {search && (
                    <Button
                      className="absolute right-0 top-0 h-full px-3"
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
                            search: (prev) => ({ ...prev, team: t }),
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
                        key={location}
                        onClick={() => {
                          void navigate({
                            search: (prev) => ({ ...prev, location: loc }),
                          });
                        }}
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
                        key={role}
                        onClick={() =>
                          void navigate({
                            search: (prev) => ({ ...prev, role: r }),
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
                <Button
                  onClick={() => setIsAddUserOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {/* <h1 className="sr-only">User Management</h1> */}
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <span className="sr-only">Select users</span>
                      <Checkbox
                        aria-label="Select all users"
                        checked={
                          selectedUsers.length === filteredUsers.length &&
                          filteredUsers.length > 0
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
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={8}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
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
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- when dealing with real data the avatar might be undefined
                                src={user.avatar || "/placeholder.svg"}
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
                              <div className="text-xs text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "Administrator"
                                ? "default"
                                : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.team}</TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-2 w-2 rounded-full ${getStatusColor(user.status)}`}
                            />
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
                                {/* @ts-expect-error -- link intentionally broken for now */}
                                <Link to={`/admin/users/${user.id}`}>
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
            </div>
          </CardContent>
        </Card>
      </div>

      <AddUserDialog onOpenChange={setIsAddUserOpen} open={isAddUserOpen} />
    </div>
  );
}
