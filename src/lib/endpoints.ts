/**
 * Chemins des surfaces admin : `quizup-console` (Axon, `ROLE_ADMIN`) et BFF
 * (`/api/admin/media`, `ROLE_ADMIN` — appelé en direct sur `VITE_BFF_URL`).
 */
const segment = (value: string) => encodeURIComponent(value)

export const ENDPOINTS = {
  bff: {
    media: {
      objects: "/api/admin/media/objects",
      stats: "/api/admin/media/stats",
      orphans: "/api/admin/media/orphans",
      usage: "/api/admin/media/usage",
      asset: (mediaId: string) => `/api/admin/media/assets/${segment(mediaId)}`,
      purgeOrphans: "/api/admin/media/purge-orphans",
    },
    questions: {
      list: "/api/admin/questions",
      detail: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}`,
      topics: "/api/admin/question-topics",
      reports: "/api/admin/question-reports",
      reportSummary: "/api/admin/question-reports/summary",
      create: (topicId: string) =>
        `/api/admin/topics/${segment(topicId)}/questions`,
      text: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/text`,
      answers: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/answers`,
      correctAnswer: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/correct-answer`,
      imageUrl: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/image-url`,
      translations: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/translations`,
      approve: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/approve`,
      reject: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/reject`,
      suspend: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/suspend`,
      reinstate: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/reinstate`,
      archive: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/archive`,
      restore: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/restore`,
      resolveReport: (reportId: string) =>
        `/api/admin/question-reports/${segment(reportId)}/resolve`,
      resolveReports: (questionId: string) =>
        `/api/admin/questions/${segment(questionId)}/reports/resolve`,
    },
    userModeration: {
      queue: "/api/admin/user-reports",
      summary: "/api/admin/user-reports/summary",
      search: "/api/admin/users/search",
      detail: (userId: string) => `/api/admin/users/${segment(userId)}`,
      suspend: (userId: string) =>
        `/api/admin/users/${segment(userId)}/suspend`,
      reinstate: (userId: string) =>
        `/api/admin/users/${segment(userId)}/reinstate`,
      resolveReport: (reportId: string) =>
        `/api/admin/user-reports/${segment(reportId)}/resolve`,
      resolveReports: (userId: string) =>
        `/api/admin/users/${segment(userId)}/reports/resolve`,
    },
  },
  console: {
    dashboard: "/api/console/dashboard",
    applications: "/api/console/applications",
    application: (application: string) =>
      `/api/console/applications/${segment(application)}`,
    processors: "/api/console/processors",
    processor: (application: string, instanceId: string, name: string) =>
      `/api/console/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}`,
    processorLag: (application: string, instanceId: string, name: string) =>
      `/api/console/processors/${segment(application)}/${segment(instanceId)}/${segment(name)}/lag`,
    commandsInFlight: "/api/console/commands/in-flight",
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
      pauseAllProcessor: (application: string, name: string) =>
        `/api/console/actions/processors/${segment(application)}/${segment(name)}/pause-all`,
      startAllProcessor: (application: string, name: string) =>
        `/api/console/actions/processors/${segment(application)}/${segment(name)}/start-all`,
      cancelScheduledEvent: (
        application: string,
        taskName: string,
        taskInstance: string,
      ) =>
        `/api/console/actions/scheduled-events/${segment(application)}/${segment(taskName)}/${segment(taskInstance)}`,
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
