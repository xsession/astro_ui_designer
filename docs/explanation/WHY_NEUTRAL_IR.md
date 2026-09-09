# Why a neutral intermediate representation exists

Without a neutral IR, every importer/exporter pair becomes a bespoke translation path. With *n* platforms, direct pairwise converters trend toward O(n²) integration edges and inconsistent loss semantics.

The neutral IR gives importers a shared semantic target and exporters a shared source. Platform-specific metadata can remain attached where needed. It does not claim that all frameworks are equivalent; it defines the common vocabulary while retaining enough provenance to preserve non-common constructs.
