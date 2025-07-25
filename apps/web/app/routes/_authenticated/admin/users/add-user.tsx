// NOTE: Refer to this Tanstack Discord chat to understand the logic around rendering a route-based Modal https://discord.com/channels/719702312431386674/1383165435804913734/1383165435804913734
import type React from "react";
import { useState } from "react";
import { Button } from "@solved-contact/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@solved-contact/ui/components/dialog";
import { Input } from "@solved-contact/ui/components/input";
import { Label } from "@solved-contact/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@solved-contact/ui/components/select";
import {
  createFileRoute,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { toast } from "sonner";

// const teams = [
//   { label: "Customer Support", value: "customer-support" },
//   { label: "Technical Support", value: "technical-support" },
//   { label: "Sales", value: "sales" },
//   { label: "Management", value: "management" },
// ];

// const locations = [
//   { label: "New York", value: "new-york" },
//   { label: "San Francisco", value: "san-francisco" },
//   { label: "Chicago", value: "chicago" },
//   { label: "Miami", value: "miami" },
//   { label: "Boston", value: "boston" },
// ];

// const phoneNumbers = [
//   { label: "+1 (555) 123-4567", value: "+1 (555) 123-4567" },
//   { label: "+1 (555) 987-6543", value: "+1 (555) 987-6543" },
//   { label: "+1 (555) 456-7890", value: "+1 (555) 456-7890" },
//   { label: "+1 (555) 234-5678", value: "+1 (555) 234-5678" },
//   { label: "+1 (555) 876-5432", value: "+1 (555) 876-5432" },
// ];

// TODO: migrate to Tanstack Form !!
function AddUserDialog() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  // const [team, setTeam] = useState("");
  // const [openTeamCombobox, setOpenTeamCombobox] = useState(false);
  // const [location, setLocation] = useState("");
  // const [openLocationCombobox, setOpenLocationCombobox] = useState(false);
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const [openPhoneCombobox, setOpenPhoneCombobox] = useState(false);
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  function handleClose() {
    if (canGoBack) {
      router.history.back();
    } else {
      void navigate({ to: "/admin/users" });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Here you would typically make an API call to create the user

    toast.success(`${firstName} ${lastName} has been added successfully.`);

    handleClose();
  }

  return (
    <Dialog onOpenChange={handleClose} open={true}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user for your contact center. Fill in all required
              fields.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  value={firstName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  value={lastName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-select">Role</Label>
              <Select onValueChange={setRole} required value={role}>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* TODO: these comboboxes look kinda busted -- need to replace with the official ShadCN example from https://ui.shadcn.com/docs/components/combobox */}
            {/* <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Popover
                onOpenChange={setOpenTeamCombobox}
                open={openTeamCombobox}
              >
                <PopoverTrigger asChild id="team">
                  <Button
                    aria-expanded={openTeamCombobox}
                    className="w-full justify-between"
                    role="combobox"
                    variant="outline"
                  >
                    {team
                      ? teams.find((t) => t.value === team)?.label
                      : "Select team..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search team..." />
                    <CommandList>
                      <CommandEmpty>No team found.</CommandEmpty>
                      <CommandGroup>
                        {teams.map((t) => (
                          <CommandItem
                            key={t.value}
                            onSelect={(currentValue) => {
                              setTeam(
                                currentValue === team ? "" : currentValue,
                              );
                              setOpenTeamCombobox(false);
                            }}
                            value={t.value}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                team === t.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {t.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Popover
                onOpenChange={setOpenLocationCombobox}
                open={openLocationCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    aria-expanded={openLocationCombobox}
                    className="w-full justify-between"
                    role="combobox"
                    variant="outline"
                  >
                    {location
                      ? locations.find((l) => l.value === location)?.label
                      : "Select location..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search location..." />
                    <CommandList>
                      <CommandEmpty>No location found.</CommandEmpty>
                      <CommandGroup>
                        {locations.map((l) => (
                          <CommandItem
                            key={l.value}
                            onSelect={(currentValue) => {
                              setLocation(
                                currentValue === location ? "" : currentValue,
                              );
                              setOpenLocationCombobox(false);
                            }}
                            value={l.value}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                location === l.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {l.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Popover
                onOpenChange={setOpenPhoneCombobox}
                open={openPhoneCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    aria-expanded={openPhoneCombobox}
                    className="w-full justify-between"
                    role="combobox"
                    variant="outline"
                  >
                    {phoneNumber
                      ? phoneNumbers.find((p) => p.value === phoneNumber)?.label
                      : "Select phone number..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search phone number..." />
                    <CommandList>
                      <CommandEmpty>No phone number found.</CommandEmpty>
                      <CommandGroup>
                        {phoneNumbers.map((p) => (
                          <CommandItem
                            key={p.value}
                            onSelect={(currentValue) => {
                              setPhoneNumber(
                                currentValue === phoneNumber
                                  ? ""
                                  : currentValue,
                              );
                              setOpenPhoneCombobox(false);
                            }}
                            value={p.value}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                phoneNumber === p.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {p.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div> */}
          </div>
          <DialogFooter>
            <Button onClick={handleClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/_authenticated/admin/users/add-user")({
  component: AddUserDialog,
});
