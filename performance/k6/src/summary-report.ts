type SummaryMetric = {
  value?: number;
  count?: number;
  rate?: number;
  passes?: number;
  fails?: number;
  avg?: number;
  min?: number;
  med?: number;
  max?: number;
  thresholds?: Record<string, boolean>;
  [key: string]: unknown;
};

type SummaryCheck = {
  name: string;
  passes: number;
  fails: number;
};

type SummaryData = {
  metrics: Record<string, SummaryMetric | undefined>;
  root_group?: {
    checks?: Record<string, SummaryCheck>;
  };
  state?: {
    testRunDurationMs?: number;
  };
};

type ReportConfig = {
  testName: string;
  mode: 'smoke' | 'orders';
  configuredVus: number;
  configuredDuration?: string;
  configuredIterations?: number;
};

function metricValue(metric: SummaryMetric | undefined, key: string): number | null {
  const value = metric?.[key];
  return typeof value === 'number' ? value : null;
}

function hasCrossedThreshold(metrics: Record<string, SummaryMetric | undefined>): boolean {
  return Object.values(metrics).some((metric) =>
    Object.values(metric?.thresholds ?? {}).some((crossed) => crossed)
  );
}

function checkDetails(data: SummaryData): SummaryCheck[] {
  return Object.values(data.root_group?.checks ?? {}).map((check) => ({
    name: check.name,
    passes: check.passes,
    fails: check.fails
  }));
}

export function buildSummaryReport(data: SummaryData, config: ReportConfig): string {
  const checks = data.metrics.checks;
  const httpReqs = data.metrics.http_reqs;
  const httpReqFailed = data.metrics.http_req_failed;
  const httpReqDuration = data.metrics.http_req_duration;
  const vus = data.metrics.vus;
  const vusMax = data.metrics.vus_max;
  const iterations = data.metrics.iterations;
  const thresholdsFailed = hasCrossedThreshold(data.metrics);
  const checksFailed = (checks?.fails ?? 0) > 0;
  const requestFailedRate = httpReqFailed?.value ?? 0;
  const status = thresholdsFailed || checksFailed || requestFailedRate > 0 ? 'FAILED' : 'PASSED';

  return JSON.stringify(
    {
      status,
      test: {
        name: config.testName,
        mode: config.mode
      },
      virtualUsers: {
        configured: config.configuredVus,
        observed: metricValue(vus, 'value'),
        max: metricValue(vusMax, 'max') ?? metricValue(vusMax, 'value')
      },
      duration: {
        configured: config.configuredDuration ?? null,
        actualMs: data.state?.testRunDurationMs ?? null
      },
      execution: {
        configuredIterations: config.configuredIterations ?? null,
        completedIterations: metricValue(iterations, 'count'),
        httpRequests: metricValue(httpReqs, 'count'),
        requestRatePerSecond: metricValue(httpReqs, 'rate')
      },
      cases: {
        passed: checks?.passes ?? 0,
        failed: checks?.fails ?? 0,
        total: (checks?.passes ?? 0) + (checks?.fails ?? 0),
        details: checkDetails(data)
      },
      thresholds: {
        status: thresholdsFailed ? 'FAILED' : 'PASSED',
        crossed: Object.fromEntries(
          Object.entries(data.metrics)
            .filter(([, metric]) => metric?.thresholds)
            .map(([name, metric]) => [name, metric?.thresholds])
        )
      },
      http: {
        failedRate: requestFailedRate,
        durationMs: {
          avg: metricValue(httpReqDuration, 'avg'),
          min: metricValue(httpReqDuration, 'min'),
          med: metricValue(httpReqDuration, 'med'),
          max: metricValue(httpReqDuration, 'max'),
          p90: metricValue(httpReqDuration, 'p(90)'),
          p95: metricValue(httpReqDuration, 'p(95)')
        }
      }
    },
    null,
    2
  );
}
