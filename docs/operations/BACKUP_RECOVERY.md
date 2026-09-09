# Backup and recovery

The UI maintains project history snapshots and a local recovery snapshot. Round-trip work can use source checkpoints/audit/rollback. Keep the project JSON and generated/imported source under Git for durable recovery. Before destructive page or mass layout/source operations, create a checkpoint/commit. Recovery data is assistance, not a substitute for source control.
