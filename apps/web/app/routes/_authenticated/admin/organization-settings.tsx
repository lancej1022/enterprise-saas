import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  EyeOff,
  Key,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
} from "@solved-contact/web-ui/components/alert";
import { Badge } from "@solved-contact/web-ui/components/badge";
import { Button } from "@solved-contact/web-ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@solved-contact/web-ui/components/card";
import { Input } from "@solved-contact/web-ui/components/input";
import { Label } from "@solved-contact/web-ui/components/label";
import { Separator } from "@solved-contact/web-ui/components/separator";
import { Switch } from "@solved-contact/web-ui/components/switch";

export const Route = createFileRoute(
  "/_authenticated/admin/organization-settings",
)({
  component: OrganizationSettings,
});

function OrganizationSettings() {
  const router = useRouter();
  const { orpc, session } = router.options.context;
  const organizationId = session.data?.activeOrganizationId ?? "";
  const [testingDomain, _setTestingDomain] = useState<null | string>(null);
  const [domainTestResults, _setDomainTestResults] = useState<
    Record<string, "error" | "success" | "testing">
  >({});

  const [jwtSecret, _setJwtSecret] = useState("example_secret_goes_here");
  const [showSecret, setShowSecret] = useState(false);

  async function copySecret() {
    await navigator.clipboard.writeText(jwtSecret);
    toast("Secret copied", {
      description: "JWT secret has been copied to clipboard.",
    });
  }

  function getDomainTestIcon(domain: string) {
    const result = domainTestResults[domain];
    if (result === "testing")
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (result === "success")
      return <Check className="h-4 w-4 text-green-500" />;
    if (result === "error") return <X className="h-4 w-4 text-red-500" />;
    return null;
  }

  const [newDomain, setNewDomain] = useState("");

  // Fetch current organization security configuration
  const configQuery = useQuery(
    orpc.chat.getConfig.queryOptions({
      input: { organizationId },
    }),
  );

  const updateSecurityLevelMutation = useMutation({
    ...orpc.chat.updateSecurityLevel.mutationOptions(),
    onSuccess: () => {
      void configQuery.refetch();
    },
  });

  const addDomainMutation = useMutation({
    ...orpc.chat.addDomain.mutationOptions(),
    onSuccess: () => {
      void configQuery.refetch();
      setNewDomain("");
    },
  });

  const removeDomainMutation = useMutation({
    ...orpc.chat.removeDomain.mutationOptions(),
    onSuccess: () => {
      void configQuery.refetch();
    },
  });

  // @ts-expect-error -- TODO: wire this up
  const generateSecretMutation = useMutation({
    ...orpc.chat.generateSecret.mutationOptions(),
    onSuccess: () => {
      void configQuery.refetch();
    },
  });

  // @ts-expect-error -- TODO: wire this up
  const createSampleJWTMutation = useMutation({
    ...orpc.chat.createSampleJWT.mutationOptions(),
  });

  // @ts-expect-error -- TODO: wire this up
  const testDomainMutation = useMutation(
    orpc.chat.validateJWT.mutationOptions(),
  );

  const config = configQuery.data;
  const allowedDomains = config?.allowedDomains || [];
  const isJWTRequired = config?.securityLevel === "jwt_required";

  function handleAddDomain() {
    if (newDomain.trim()) {
      addDomainMutation.mutate({ domain: newDomain.trim(), organizationId });
    }
  }

  function handleRemoveDomain(domain: string) {
    removeDomainMutation.mutate({ domain, organizationId });
  }

  function handleSecurityLevelChange(isEnabled: boolean) {
    const securityLevel = isEnabled ? "jwt_required" : "basic";
    updateSecurityLevelMutation.mutate({ organizationId, securityLevel });
  }

  return (
    <div className="flex flex-col">
      <div className="border-b" />
      <div className="container flex-1 space-y-6 overflow-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Organization Security Settings
            </h1>
            <p className="text-muted-foreground">
              Configure chat widget security, domain validation, and JWT
              authentication
            </p>
          </div>
        </div>

        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Organization Information
            </CardTitle>
            <CardDescription>
              Current organization details and identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-id">Organization ID</Label>
              <div className="flex gap-2">
                <Input
                  className="font-mono text-sm"
                  id="org-id"
                  readOnly
                  value={organizationId || "No organization selected"}
                />
                <Button
                  disabled={!organizationId}
                  onClick={async () => {
                    if (organizationId) {
                      await navigator.clipboard.writeText(organizationId);
                      toast("Organization ID copied", {
                        description:
                          "Organization ID has been copied to clipboard.",
                      });
                    }
                  }}
                  variant="outline"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Use this ID when configuring external integrations or API calls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Level
            </CardTitle>
            <CardDescription>
              Choose the security level for your chat widget
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="jwt-required">
                  JWT Authentication Required
                </Label>
                <p className="text-muted-foreground text-sm">
                  {isJWTRequired
                    ? "Enterprise mode: Requires JWT tokens for authentication"
                    : "Basic mode: Domain validation only"}
                </p>
              </div>
              <Switch
                checked={isJWTRequired}
                disabled={updateSecurityLevelMutation.isPending}
                id="jwt-required"
                onCheckedChange={handleSecurityLevelChange}
              />
            </div>
            <Badge variant={isJWTRequired ? "default" : "secondary"}>
              {isJWTRequired ? "Enterprise Security" : "Basic Security"}
            </Badge>
          </CardContent>
        </Card>

        {/* Allowed Domains Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Allowed Domains
            </CardTitle>
            <CardDescription>
              Manage which domains can access your chat widget. Only requests
              from these domains will be accepted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Domain */}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddDomain();
              }}
            >
              <div className="flex-1">
                <Label className="sr-only" htmlFor="new-domain">
                  Add new domain
                </Label>
                <Input
                  id="new-domain"
                  onChange={(e) => setNewDomain(e.target.value)}
                  // onKeyDown={(e) => e.key === "Enter" && addDomain()}
                  placeholder="Enter domain (e.g., example.com)"
                  value={newDomain}
                />
              </div>
              <Button disabled={!newDomain.trim()} type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Domain
              </Button>
            </form>

            {/* Domain List */}
            <div className="space-y-3">
              {allowedDomains.map((domain) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={domain}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{domain}</span>
                    {getDomainTestIcon(domain)}
                    {domainTestResults[domain] === "success" && (
                      <Badge
                        className="bg-green-50 text-green-700"
                        variant="secondary"
                      >
                        Verified
                      </Badge>
                    )}
                    {domainTestResults[domain] === "error" && (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={testingDomain === domain}
                      // onClick={() => testDomain(domain)}
                      size="sm"
                      variant="outline"
                    >
                      {testingDomain === domain ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRemoveDomain(domain)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {allowedDomains.length === 0 && (
              // TODO: create some sort of yellow "warning" variant
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No domains configured. Widget will accept requests from any
                  domain.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* JWT Secret Management */}
        {isJWTRequired && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                JWT Secret Key
              </CardTitle>
              <CardDescription>
                Generate and manage JWT secret keys for secure authentication.
                Use this key to sign JWT tokens for your chat widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Secret */}
              <div className="space-y-3">
                <Label htmlFor="jwt-secret">Current Secret Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      className="pr-10 font-mono text-sm"
                      id="jwt-secret"
                      readOnly
                      type={showSecret ? "text" : "password"}
                      value={jwtSecret}
                    />
                    <Button
                      aria-label={showSecret ? "Hide secret" : "Show secret"}
                      className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
                      onClick={() => setShowSecret(!showSecret)}
                      size="sm"
                      variant="ghost"
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button onClick={copySecret} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Secret Management Actions */}
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-lg font-medium">
                    Secret Key Management
                  </p>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Rotate your secret key regularly for enhanced security. This
                    will invalidate all existing JWT tokens.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="destructive">
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rotate Secret Key
                    </>
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Rotating the secret key will
                    invalidate all existing JWT tokens. Make sure to update your
                    applications with the new key before rotating.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
