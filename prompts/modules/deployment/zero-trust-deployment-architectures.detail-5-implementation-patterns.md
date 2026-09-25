```
## Implementation Patterns

### Zero-Trust Service Mesh Configuration

```yaml
# istio/zero-trust-service-mesh.yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: zero-trust-control-plane
spec:
  values:
    global:
      meshID: zero-trust-mesh
      network: zero-trust-network
      
    pilot:
      env:
        EXTERNAL_ISTIOD: false
        PILOT_ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION: true
        PILOT_ENABLE_CROSS_CLUSTER_WORKLOAD_ENTRY: true
  
  components:
    pilot:
      k8s:
        env:
        - name: PILOT_ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION
          value: "true"
        - name: PILOT_ENABLE_CROSS_CLUSTER_WORKLOAD_ENTRY
          value: "true"
        - name: PILOT_ENABLE_STATUS
          value: "true"
    
    ingressGateways:
    - name: istio-ingressgateway
      enabled: true
      k8s:
        service:
          type: LoadBalancer
        env:
        - name: ISTIO_META_ROUTER_MODE
          value: "sni-dnat"
    
    egressGateways:
    - name: istio-egressgateway
      enabled: true
      k8s:
        env:
        - name: ISTIO_META_ROUTER_MODE
          value: "sni-dnat"

---
# Strict mTLS policy for zero-trust
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: zero-trust-strict-mtls
  namespace: istio-system
spec:
  mtls:
    mode: STRICT

---
# Default deny authorization policy
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: zero-trust-default-deny
  namespace: istio-system
spec:
  # Empty spec means deny all

---
# Identity-based authorization policies
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: zero-trust-identity-based-authz
  namespace: production
spec:
  selector:
    matchLabels:
      app: web-application
  
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/production/sa/web-service-account"]
    - source:
        requestPrincipals: ["https://accounts.google.com/oauth2/v2/userinfo/user@company.com"]
    to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
        paths: ["/api/v1/*"]
    when:
    - key: source.certificate_fingerprint
      values: ["sha256:1234567890abcdef..."]
    - key: request.headers[x-forwarded-for]
      notValues: ["*malicious-ip*"]
    - key: request.time
      values: ["09:00:00", "17:00:00"] # Business hours only

---
# Request authentication with JWT validation
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: zero-trust-jwt-auth
  namespace: production
spec:
  selector:
    matchLabels:
      app: web-application
  
  jwtRules:
  - issuer: "https://accounts.google.com"
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs"
    audiences:
    - "web-application.company.com"
    forwardOriginalToken: true
  
  - issuer: "https://login.microsoftonline.com/tenant-id/v2.0"
    jwksUri: "https://login.microsoftonline.com/tenant-id/discovery/v2.0/keys"
    audiences:
    - "api://web-application"
    forwardOriginalToken: true

---
# Telemetry configuration for zero-trust monitoring
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: zero-trust-telemetry
  namespace: istio-system
spec:
  metrics:
  - providers:
    - name: prometheus
  - overrides:
    - match:
        metric: ALL_METRICS
      tagOverrides:
        source_principal:
          value: "%{SOURCE_PRINCIPAL}"
        destination_principal:
          value: "%{DESTINATION_PRINCIPAL}"
        request_id:
          value: "%{REQUEST_ID}"
  
  accessLogging:
  - providers:
    - name: otel
  - format:
      labels:
        source_principal: "%{SOURCE_PRINCIPAL}"
        destination_principal: "%{DESTINATION_PRINCIPAL}"
        request_id: "%{REQUEST_ID}"
        response_code: "%{RESPONSE_CODE}"
        request_duration: "%{DURATION}"
```

### Open Policy Agent (OPA) Zero-Trust Policies

```rego
# opa/zero-trust-policies.rego
package kubernetes.admission

import future.keywords.contains
import future.keywords.if
import future.keywords.in

# Default deny policy
default allow = false

# Allow if all zero-trust requirements are met
allow if {
    input.request.kind.kind == "Pod"
    zero_trust_compliant
}

# Zero-trust compliance checks
zero_trust_compliant if {
    has_service_account
    has_security_context
    has_resource_limits
    has_network_policies
    has_pod_security_standards
    not_privileged
    not_host_network
    not_host_pid
}

# Service account requirement
has_service_account if {
    input.request.object.spec.serviceAccountName
    input.request.object.spec.serviceAccountName != "default"
}

# Security context requirements
has_security_context if {
    security_context := input.request.object.spec.securityContext
    security_context.runAsNonRoot == true
    security_context.runAsUser > 0
    security_context.fsGroup > 0
}

# Resource limits requirement
has_resource_limits if {
    container := input.request.object.spec.containers[_]
    container.resources.limits.memory
    container.resources.limits.cpu
    container.resources.requests.memory
    container.resources.requests.cpu
}

# Network policies requirement (check if namespace has network policies)
has_network_policies if {
    # This would typically check external data about network policies
    # For this example, we assume it's validated externally
    true
}

# Pod security standards requirement
has_pod_security_standards if {
    container := input.request.object.spec.containers[_]
    container_security := container.securityContext
    container_security.allowPrivilegeEscalation == false
    container_security.readOnlyRootFilesystem == true
    container_security.runAsNonRoot == true
    "ALL" in container_security.capabilities.drop
}

# Not privileged requirement
not_privileged if {
    container := input.request.object.spec.containers[_]
    container.securityContext.privileged != true
}

# Not host network requirement
not_host_network if {
    input.request.object.spec.hostNetwork != true
}

# Not host PID requirement
not_host_pid if {
    input.request.object.spec.hostPID != true
}

# Identity-based authorization policy
package kubernetes.authz

import future.keywords.contains
import future.keywords.if
import future.keywords.in

# Default deny
default allow = false

# Allow based on identity and context
allow if {
    identity_verified
    context_appropriate
    action_authorized
}

# Identity verification
identity_verified if {
    # Check if user has valid identity
    input.user.username
    input.user.groups
    
    # Verify identity provider
    valid_identity_provider
    
    # Check MFA status
    mfa_verified
}

# Valid identity provider check
valid_identity_provider if {
    provider := input.user.extra["oidc.issuer"][0]
    provider in [
        "https://accounts.google.com",
        "https://login.microsoftonline.com/tenant-id/v2.0",
        "https://company.okta.com"
    ]
}

# MFA verification
mfa_verified if {
    amr := input.user.extra["oidc.amr"][0]
    "mfa" in split(amr, ",")
}

# Context appropriateness
context_appropriate if {
    # Check time-based access
    time_based_access_allowed
    
    # Check location-based access
    location_based_access_allowed
    
    # Check device-based access
    device_based_access_allowed
}

# Time-based access control
time_based_access_allowed if {
    current_hour := time.now_ns() / 1000000000 / 3600 % 24
    current_hour >= 9  # 9 AM
    current_hour <= 17 # 5 PM
}

# Location-based access control
location_based_access_allowed if {
    source_ip := input.request.remoteAddr
    # Check if IP is from allowed ranges
    net.cidr_contains("10.0.0.0/8", source_ip)
}

# Device-based access control
device_based_access_allowed if {
    device_id := input.user.extra["device_id"][0]
    device_id in data.trusted_devices
}

# Action authorization
action_authorized if {
    # Check RBAC permissions
    rbac_authorized
    
    # Check ABAC policies
    abac_authorized
    
    # Check resource-specific permissions
    resource_authorized
}

# RBAC authorization
rbac_authorized if {
    user_groups := input.user.groups
    required_group := data.rbac_policies[input.request.resource.resource][input.request.verb]
    required_group in user_groups
}

# ABAC authorization
abac_authorized if {
    # Attribute-based access control logic
    user_attributes := input.user.extra
    resource_attributes := input.request.object.metadata.labels
    
    # Example: Only allow access to resources with matching department
    user_attributes["department"][0] == resource_attributes["department"]
}

# Resource-specific authorization
resource_authorized if {
    # Check if user has access to specific resource
    resource_name := input.request.object.metadata.name
    namespace := input.request.object.metadata.namespace
    
    # Check ownership or delegation
    resource_accessible(input.user.username, namespace, resource_name)
}

# Helper function to check resource accessibility
resource_accessible(username, namespace, resource) if {
    # This would typically check external data about resource ownership
    # For this example, we assume it's validated externally
    true
}
```

### Falco Zero-Trust Runtime Security Rules

```yaml
# falco/zero-trust-rules.yaml
- rule: Zero Trust - Unauthorized Process Execution
  desc: Detect unauthorized process execution in zero-trust environment
  condition: >
    spawned_process and
    not container and
    not proc.name in (authorized_processes) and
    not proc.pname in (authorized_parent_processes)
  output: >
    Unauthorized process execution detected in zero-trust environment
    (user=%user.name command=%proc.cmdline pid=%proc.pid ppid=%proc.ppid
    container_id=%container.id image=%container.image.repository)
  priority: HIGH
  tags: [zero-trust, process, unauthorized]

- rule: Zero Trust - Suspicious Network Activity
  desc: Detect suspicious network activity violating zero-trust principles
  condition: >
    inbound_outbound and
    not fd.typechar=4 and
    not fd.name in (authorized_network_connections) and
    not proc.name in (authorized_network_processes)
  output: >
    Suspicious network activity detected in zero-trust environment
    (user=%user.name command=%proc.cmdline connection=%fd.name
    container_id=%container.id image=%container.image.repository)
  priority: HIGH
  tags: [zero-trust, network, suspicious]

- rule: Zero Trust - Privilege Escalation Attempt
  desc: Detect privilege escalation attempts in zero-trust environment
  condition: >
    spawned_process and
    proc.name in (privilege_escalation_binaries) and
    not user.name in (authorized_privileged_users)
  output: >
    Privilege escalation attempt detected in zero-trust environment
    (user=%user.name command=%proc.cmdline binary=%proc.name
    container_id=%container.id image=%container.image.repository)
  priority: CRITICAL
  tags: [zero-trust, privilege-escalation, critical]

- rule: Zero Trust - Unauthorized File Access
  desc: Detect unauthorized file access in zero-trust environment
  condition: >
    open_read and
    fd.name startswith /etc/ and
    not proc.name in (authorized_config_readers) and
    not user.name in (authorized_config_users)
  output: >
    Unauthorized file access detected in zero-trust environment
    (user=%user.name command=%proc.cmdline file=%fd.name
    container_id=%container.id image=%container.image.repository)
  priority: HIGH
  tags: [zero-trust, file-access, unauthorized]

- rule: Zero Trust - Container Escape Attempt
  desc: Detect container escape attempts in zero-trust environment
  condition: >
    spawned_process and
    proc.name in (container_escape_binaries) and
    container
  output: >
    Container escape attempt detected in zero-trust environment
    (user=%user.name command=%proc.cmdline binary=%proc.name
    container_id=%container.id image=%container.image.repository)
  priority: CRITICAL
  tags: [zero-trust, container-escape, critical]

# Authorized processes list
- list: authorized_processes
  items: [
    systemd, kthreadd, ksoftirqd, migration, rcu_gp, rcu_par_gp,
    kworker, mm_percpu_wq, ksoftirqd, migration, rcu_gp, rcu_par_gp,
    bash, sh, ssh, sshd, systemd-logind, systemd-networkd,
    kubelet, containerd, dockerd, runc, pause
  ]

- list: authorized_parent_processes
  items: [
    systemd, kubelet, containerd, dockerd, systemd-logind,
    sshd, bash, sh
  ]

- list: authorized_network_connections
  items: [
    /dev/log, /run/systemd/journal/socket, /run/systemd/notify,
    127.0.0.1, ::1, kubernetes.default.svc.cluster.local
  ]

- list: authorized_network_processes
  items: [
    kubelet, containerd, dockerd, systemd-networkd, systemd-resolved,
    istio-proxy, envoy
  ]

- list: privilege_escalation_binaries
  items: [
    sudo, su, pkexec, doas, setuid, setgid, chmod, chown,
    mount, umount, insmod, rmmod, modprobe
  ]

- list: authorized_privileged_users
  items: [root, system, kubelet]

- list: authorized_config_readers
  items: [
    systemd, kubelet, containerd, dockerd, systemd-networkd,
    systemd-resolved, istio-proxy, envoy
  ]

- list: authorized_config_users
  items: [root, system, kubelet]

- list: container_escape_binaries
  items: [
    nsenter, unshare, chroot, pivot_root, mount, umount,
    docker, kubectl, crictl, runc, ctr
  ]
```
