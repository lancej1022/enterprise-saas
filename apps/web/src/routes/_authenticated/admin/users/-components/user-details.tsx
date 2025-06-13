import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building,
  Calendar,
  Edit2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Save,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

// Mock user data
const userData = {
  id: "1",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@acme.com",
  role: "Agent",
  status: "Active",
  team: "Customer Support",
  location: "New York",
  phoneNumber: "+1 (555) 123-4567",
  avatar: "/placeholder.svg?height=128&width=128",
  dateJoined: "2023-05-15",
  lastActive: "2023-11-28",
  skills: ["Customer Service", "Technical Support", "Conflict Resolution"],
  callsHandled: 1245,
  avgCallTime: "4m 32s",
  satisfactionScore: 4.8,
  permissions: [
    { name: "View Customer Data", granted: true },
    { name: "Edit Customer Data", granted: true },
    { name: "Access Call Recordings", granted: true },
    { name: "Manage Team Members", granted: false },
    { name: "Generate Reports", granted: false },
    { name: "Admin Dashboard", granted: false },
  ],
  callHistory: [
    {
      id: "c1",
      date: "2023-11-28",
      duration: "5m 12s",
      customer: "John Smith",
      status: "Completed",
    },
    {
      id: "c2",
      date: "2023-11-28",
      duration: "3m 45s",
      customer: "Emily Davis",
      status: "Completed",
    },
    {
      id: "c3",
      date: "2023-11-27",
      duration: "8m 20s",
      customer: "Michael Brown",
      status: "Transferred",
    },
    {
      id: "c4",
      date: "2023-11-27",
      duration: "2m 10s",
      customer: "Jessica Wilson",
      status: "Completed",
    },
    {
      id: "c5",
      date: "2023-11-26",
      duration: "6m 05s",
      customer: "David Miller",
      status: "Completed",
    },
  ],
};

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const [user, setUser] = useState(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(userData);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  function handleSaveChanges() {
    setUser(editedUser);
    setIsEditing(false);

    toast.success("User information has been updated successfully.");
  }

  function handleDeleteUser() {
    // Here you would typically make an API call to delete the user

    toast.error("User has been deleted successfully.");

    // Redirect to users list would happen here
  }

  return (
    <div className="flex flex-col">
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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/users/${userId}`}>
                  {user.firstName} {user.lastName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link search={(prev) => prev} to="/admin/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Cancel Editing
                    </>
                  ) : (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit User
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserCog className="mr-2 h-4 w-4" />
                  Manage Permissions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container flex-1 space-y-4 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    alt={`${user.firstName} ${user.lastName}`}
                    src={user.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Badge
                  variant={
                    user.role === "Administrator" ? "default" : "outline"
                  }
                >
                  {user.role}
                </Badge>
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      user.status === "Active"
                        ? "bg-green-500"
                        : user.status === "Away"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                    }`}
                  />
                  <span className="ml-1 text-xs">{user.status}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.team}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {new Date(user.dateJoined).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-medium">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map((skill) => (
                      <Badge
                        className="text-xs"
                        key={skill}
                        variant="secondary"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 md:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="mb-4 grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="history">Call History</TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-4" value="overview">
                {isEditing ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit User Information</CardTitle>
                      <CardDescription>
                        Update user details and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            onChange={(e) =>
                              setEditedUser({
                                ...editedUser,
                                firstName: e.target.value,
                              })
                            }
                            value={editedUser.firstName}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            onChange={(e) =>
                              setEditedUser({
                                ...editedUser,
                                lastName: e.target.value,
                              })
                            }
                            value={editedUser.lastName}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              email: e.target.value,
                            })
                          }
                          type="email"
                          value={editedUser.email}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            onValueChange={(value) =>
                              setEditedUser({ ...editedUser, role: value })
                            }
                            value={editedUser.role}
                          >
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Agent">Agent</SelectItem>
                              <SelectItem value="Supervisor">
                                Supervisor
                              </SelectItem>
                              <SelectItem value="Administrator">
                                Administrator
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            onValueChange={(value) =>
                              setEditedUser({ ...editedUser, status: value })
                            }
                            value={editedUser.status}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Away">Away</SelectItem>
                              <SelectItem value="Offline">Offline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="team">Team</Label>
                          <Select
                            onValueChange={(value) =>
                              setEditedUser({ ...editedUser, team: value })
                            }
                            value={editedUser.team}
                          >
                            <SelectTrigger id="team">
                              <SelectValue placeholder="Select a team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Customer Support">
                                Customer Support
                              </SelectItem>
                              <SelectItem value="Technical Support">
                                Technical Support
                              </SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                              <SelectItem value="Management">
                                Management
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Select
                            onValueChange={(value) =>
                              setEditedUser({ ...editedUser, location: value })
                            }
                            value={editedUser.location}
                          >
                            <SelectTrigger id="location">
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="New York">New York</SelectItem>
                              <SelectItem value="San Francisco">
                                San Francisco
                              </SelectItem>
                              <SelectItem value="Chicago">Chicago</SelectItem>
                              <SelectItem value="Miami">Miami</SelectItem>
                              <SelectItem value="Boston">Boston</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              phoneNumber: e.target.value,
                            })
                          }
                          value={editedUser.phoneNumber}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedUser(user);
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                      <CardDescription>
                        User statistics and performance metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <div className="text-2xl font-bold">
                            {user.callsHandled}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Calls Handled
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <div className="text-2xl font-bold">
                            {user.avgCallTime}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg. Call Time
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <div className="text-2xl font-bold">
                            {user.satisfactionScore}/5.0
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Satisfaction Score
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="mb-4 text-lg font-medium">
                          Recent Activity
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                            <div>
                              <div className="font-medium">Logged in</div>
                              <div className="text-sm text-muted-foreground">
                                Today at 9:32 AM
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                            <div>
                              <div className="font-medium">
                                Completed call with John Smith
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Today at 10:15 AM
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                            <div>
                              <div className="font-medium">
                                Updated profile information
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Yesterday at 2:45 PM
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="permissions">
                <Card>
                  <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                    <CardDescription>
                      Manage what this user can access in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.permissions.map((permission, index) => (
                        <div
                          className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                          key={index}
                        >
                          <div className="font-medium">{permission.name}</div>
                          <Badge
                            variant={permission.granted ? "default" : "outline"}
                          >
                            {permission.granted ? "Granted" : "Not Granted"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      <UserCog className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Call History</CardTitle>
                    <CardDescription>
                      Recent calls handled by this user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.callHistory.map((call) => (
                        <div
                          className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                          key={call.id}
                        >
                          <div>
                            <div className="font-medium">{call.customer}</div>
                            <div className="text-sm text-muted-foreground">
                              {call.date} • {call.duration}
                            </div>
                          </div>
                          <Badge
                            variant={
                              call.status === "Completed"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {call.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      View Full Call History
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <AlertDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteUser}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
