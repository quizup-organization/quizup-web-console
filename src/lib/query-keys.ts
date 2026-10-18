/**
 * Clés React Query hiérarchiques de la console.
 */
export const queryKeys = {
  dashboard: {
    all: ["console", "dashboard"] as const,
    version: () => ["console", "dashboard", "version"] as const,
  },
  applications: {
    all: ["console", "applications"] as const,
    detail: (application: string) =>
      ["console", "applications", "detail", application] as const,
  },
  processors: {
    all: ["console", "processors"] as const,
    list: (application?: string) =>
      ["console", "processors", "list", application ?? "all"] as const,
    detail: (application: string, instanceId: string, name: string) =>
      ["console", "processors", "detail", application, instanceId, name] as const,
    lag: (application: string, instanceId: string, name: string) =>
      ["console", "processors", "lag", application, instanceId, name] as const,
  },
  commands: {
    inFlight: (application?: string) =>
      ["console", "commands", "in-flight", application ?? "all"] as const,
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
  metrics: {
    processor: (
      application: string,
      instanceId: string,
      name: string,
      range: string,
    ) =>
      ["console", "metrics", "processor", application, instanceId, name, range] as const,
    application: (application: string, range: string) =>
      ["console", "metrics", "application", application, range] as const,
    messages: (application: string, range: string) =>
      ["console", "metrics", "messages", application, range] as const,
  },
  search: {
    events: (application: string, aggregateId: string) =>
      ["console", "search", "events", application, aggregateId] as const,
    eventsByType: (application: string, type: string, within: string) =>
      ["console", "search", "events-by-type", application, type, within] as const,
    eventTypes: () => ["console", "search", "event-types"] as const,
    snapshots: (application: string, aggregateId: string) =>
      ["console", "search", "snapshots", application, aggregateId] as const,
    scheduledEvents: (application: string) =>
      ["console", "search", "scheduled", application] as const,
  },
  users: {
    all: ["console", "users"] as const,
  },
  media: {
    all: ["media"] as const,
    objects: (origin: string, q: string) =>
      ["media", "objects", origin, q] as const,
    stats: () => ["media", "stats"] as const,
    orphans: () => ["media", "orphans"] as const,
    usage: (page: number, size: number) =>
      ["media", "usage", page, size] as const,
  },
  questions: {
    all: ["questions"] as const,
    list: (params: unknown) => ["questions", "list", params] as const,
    queue: (params: unknown) => ["questions", "queue", params] as const,
    summary: () => ["questions", "summary"] as const,
    topics: () => ["questions", "topics"] as const,
    detail: (questionId: string) =>
      ["questions", "detail", questionId] as const,
  },
  userModeration: {
    all: ["user-moderation"] as const,
    catalogue: (params: unknown) =>
      ["user-moderation", "catalogue", params] as const,
    queue: (params: unknown) =>
      ["user-moderation", "queue", params] as const,
    summary: () => ["user-moderation", "summary"] as const,
    search: (query: string) =>
      ["user-moderation", "search", query] as const,
    detail: (userId: string) =>
      ["user-moderation", "detail", userId] as const,
  },
} as const
