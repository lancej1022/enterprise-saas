import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
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

import { AddUserDialog } from "./add-user-dialog";

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
];

const teams = [
  "All Teams",
  "Customer Support",
  "Technical Support",
  "Sales",
  "Management",
];
const locations = [
  "All Locations",
  "New York",
  "San Francisco",
  "Chicago",
  "Miami",
  "Boston",
];
const roles = ["All Roles", "Agent", "Supervisor", "Administrator"];

export function UserManagement() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedRole, setSelectedRole] = useState("All Roles");

  const filteredUsers = users.filter((user) => {
    // Filter by search query
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery);

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && user.status === "Active") ||
      (activeTab === "away" && user.status === "Away") ||
      (activeTab === "offline" && user.status === "Offline");

    // Filter by dropdown filters
    const matchesTeam =
      selectedTeam === "All Teams" || user.team === selectedTeam;
    const matchesLocation =
      selectedLocation === "All Locations" ||
      user.location === selectedLocation;
    const matchesRole =
      selectedRole === "All Roles" || user.role === selectedRole;

    return (
      matchesSearch &&
      matchesTab &&
      matchesTeam &&
      matchesLocation &&
      matchesRole
    );
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const getStatusColor = (status: string) => {
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
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
      </header>

      <div className="container flex-1 space-y-4 overflow-auto p-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage your contact center users, teams, and permissions
                </CardDescription>
              </div>
              <Tabs
                className="w-[400px]"
                defaultValue="all"
                onValueChange={setActiveTab}
                value={activeTab}
              >
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="away">Away</TabsTrigger>
                  <TabsTrigger value="offline">Offline</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between space-x-2">
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    value={searchQuery}
                  />
                  {searchQuery && (
                    <Button
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setSearchQuery("")}
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
                      {selectedTeam}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Team</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {teams.map((team) => (
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        key={team}
                        onClick={() => setSelectedTeam(team)}
                      >
                        {team}
                        {selectedTeam === team && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      {selectedLocation}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {locations.map((location) => (
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                      >
                        {location}
                        {selectedLocation === location && (
                          <Check className="h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      {selectedRole}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {roles.map((role) => (
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        key={role}
                        onClick={() => setSelectedRole(role)}
                      >
                        {role}
                        {selectedRole === role && <Check className="h-4 w-4" />}
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
                  <TableRow>
                    <TableHead className="w-[40px]">
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
                    <TableHead className="w-[80px]"></TableHead>
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
