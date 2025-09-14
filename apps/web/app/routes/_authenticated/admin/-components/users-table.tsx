import { useState } from "react";
import { useQuery } from "@rocicorp/zero/react";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { getUsersQuery } from "@solved-contact/backend/zero/get-queries";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@solved-contact/web-ui/components/avatar";
import { Badge } from "@solved-contact/web-ui/components/badge";
import { Button } from "@solved-contact/web-ui/components/button";
import { Checkbox } from "@solved-contact/web-ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@solved-contact/web-ui/components/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@solved-contact/web-ui/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@solved-contact/web-ui/components/table";

const limit = 20;

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

export function UsersTable() {
  const { session } = useRouter().options.context;
  const organizationId = session.data?.activeOrganizationId ?? "";
  const { search, page = 1 } = useSearch({
    from: "/_authenticated/admin/users",
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [users] = useQuery(getUsersQuery(organizationId, search ?? null), {
    ttl: "5m",
  });

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <span className="sr-only">Select users</span>
              <Checkbox
                aria-label="Select all users"
                checked={
                  selectedUsers.length === users.length && users.length > 0
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
                      <DropdownMenuItem>
                        <Link
                          className="w-full"
                          params={{ userId: user.id }}
                          to={`/admin/users/$userId`}
                        >
                          Edit User
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Assign to Team</DropdownMenuItem>
                      <DropdownMenuItem>Change Phone Number</DropdownMenuItem>
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
              className={page <= 1 ? "pointer-events-none" : "cursor-pointer"}
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
                users.length < limit ? "pointer-events-none" : "cursor-pointer"
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
  );
}
