# K6 Performance Scenario

Muc tieu:
- Tich hop k6 vao repo de chay performance smoke/load test cho Day Sales staging.

Pham vi:
- Sua `package.json`.
- Them `performance/k6/src/*`.
- Them `docs/repo-command-guide.md`.
- Cap nhat `README.md`.

Khong lam:
- Khong doi Playwright config.
- Khong chay full Playwright suite.
- Khong tao load lon vao staging mac dinh.
- Khong hard-code secret/token.

Huong sua:
- Dung TypeScript source cho k6.
- Build bang `esbuild` sang `performance/k6/dist`.
- Dung k6 CLI local de run script da build.
- Mac dinh smoke performance nhe cho home page va product detail.

Verify:
- `npm install` de cap nhat dependency/lockfile.
- `npm run perf:build`.
- `npm run typecheck`.

Rui ro:
- `k6 run` can cai k6 CLI rieng hoac dung Docker.
- Staging data/response co the thay doi, nen threshold ban dau can thap va an toan.
