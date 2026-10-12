/**
 * Chemins de l'API `quizup-console` (surface admin dédiée, `ROLE_ADMIN`).
 */
const segment = (value: string) => encodeURIComponent(value)

export const ENDPOINTS = {
  console: {
    dashboard: "/api/console/dashboard",
    applications: "/api/console/applications",
    application: (application: string) =>
      `/api/console/applications/${segment(application)}`,
    processors: "/api/console/processors",
    processor: (application: string, instanceId: string, name: string) =>
      `/api/console/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}`,
    dlq: "/api/console/dlq",
    dlqSequences: (application: string, instanceId: string, processor: string) =>
      `/api/console/dlq/${segment(application)}/${segment(instanceId)}/${segment(processor)}/sequences`,
    audit: "/api/console/audit",
    users: "/api/console/users",
    metrics: {
      application: (application: string) =>
        `/api/console/metrics/applications/${segment(application)}`,
      processor: (application: string, instanceId: string, name: string) =>
        `/api/console/metrics/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}`,
      messages: (application: string) =>
        `/api/console/metrics/messages/${segment(application)}`,
    },
    search: {
      events: "/api/console/search/events",
      eventsByType: "/api/console/search/events/by-type",
      eventTypes: "/api/console/search/event-types",
      snapshots: "/api/console/search/snapshots",
      scheduledEvents: "/api/console/scheduled-events",
    },
    actions: {
      retryDlqSequence: (
        application: string,
        instanceId: string,
        processor: string,
        sequenceId: string,
      ) =>
        `/api/console/actions/dlq/${segment(application)}/${segment(instanceId)}/${segment(processor)}/sequences/${segment(sequenceId)}/retry`,
      deleteDlqSequence: (
        application: string,
        instanceId: string,
        processor: string,
        sequenceId: string,
      ) =>
        `/api/console/actions/dlq/${segment(application)}/${segment(instanceId)}/${segment(processor)}/sequences/${segment(sequenceId)}`,
      clearDlq: (application: string, instanceId: string, processor: string) =>
        `/api/console/actions/dlq/${segment(application)}/${segment(instanceId)}/${segment(processor)}/clear`,
      pauseProcessor: (application: string, instanceId: string, name: string) =>
        `/api/console/actions/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}/pause`,
      startProcessor: (application: string, instanceId: string, name: string) =>
        `/api/console/actions/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}/start`,
      resetProcessor: (application: string, instanceId: string, name: string) =>
        `/api/console/actions/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}/reset`,
      splitSegment: (
        application: string,
        instanceId: string,
        name: string,
        segmentId: number,
      ) =>
        `/api/console/actions/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}/segments/${segmentId}/split`,
      mergeSegment: (
        application: string,
        instanceId: string,
        name: string,
        segmentId: number,
      ) =>
        `/api/console/actions/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}/segments/${segmentId}/merge`,
    },
  },
} as const
