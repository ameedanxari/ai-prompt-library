# State and operations

For the active journey, identify canonical state ownership: entities/fields, who may read or mutate them, lifecycle transitions and interfaces between consumers. Check the same rule across UI, API and storage policy; a correct narrative cannot repair a contradictory access matrix. Exercise at least one denied action across roles or tenants where that boundary exists.

Follow an effect through retries and failures. What identifies an operation? Where is durable intent recorded? When is it acknowledged? What happens after timeout, restart, duplicate delivery, out-of-order input or a partial write? A scheduler declaration alone does not explain dispatch, missed ticks, concurrency, retry or replay. For ambiguous email/payment/provider results, reconcile through supported identifiers/status before retrying. Promise exactly-once effects only when the actual boundary supports the claim.

Keep targets distinct: local preparation, new disposable deployment, existing retained system and live operator work have different data and authority. Name the actual target and operator for each outcome. A planning document cannot own proof of a live cutover. Unknown/live data needs compatibility, migration and recovery until verified authority permits otherwise. An approved plan never authorizes deletion or production mutation by itself.

Test recovery against the resources actually used: database plus files, queues, secrets/configuration and dependent providers as applicable. Restoring one component does not establish a restored service. Inspect stale clients, rollback compatibility, replay and operator handover. Use isolated fixtures and authorized disposable environments; keep secrets and real personal data out of retained evidence.

For native work verify the OS capability/permission boundary on the actual supported device/runtime. Product names do not create privileged capabilities: app-owned cache cleanup differs from arbitrary system memory control. Reflect unsupported behavior honestly and test permission denial, cancellation and recoverable interruption.
