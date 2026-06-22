export const smokeThresholds = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<3000'],
  checks: ['rate>0.95']
};

export const orderRequestThresholds = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<3000'],
  checks: ['rate>0.95']
};
