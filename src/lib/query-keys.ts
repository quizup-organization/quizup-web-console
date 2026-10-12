/**
 * Clés React Query hiérarchiques de la console.
 */
export const queryKeys = {
  applications: {
    all: ["console", "applications"] as const,
  },
  processors: {
    all: ["console", "processors"] as const,
    list: (application?: string) =>
      ["console", "processors", "list", application ?? "all"] as const,
    detail: (application: string, instanceId: string, name: string) =>
      ["console", "processors", "detail", application, instanceId, name] as const,
  },
  dlq: {
    all: ["console", "dlq"] as const,
    stats: () => ["console", "dlq", "stats"] as const,
    sequences: (
      application: string,
      instanceId: string,
      processor: string,
      page: number,
    ) =>
      [
        "console",
        "dlq",
        "sequences",
        application,
        instanceId,
        processor,
        page,
      ] as const,
  },
  audit: {
    list: (page: number, size: number) =>
      ["console", "audit", page, size] as const,
  },
} as const
