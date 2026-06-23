const { mkdir, readdir, rm } = require('node:fs/promises');
const path = require('node:path');

const reportRoot = path.resolve(__dirname, '..', 'report');
const reportFolders = ['pass', 'false'];

async function cleanReportFolder(folderName) {
  const folderPath = path.join(reportRoot, folderName);

  await mkdir(folderPath, { recursive: true });

  const entries = await readdir(folderPath, { withFileTypes: true });
  await Promise.all(
    entries.map((entry) =>
      rm(path.join(folderPath, entry.name), {
        force: true,
        recursive: entry.isDirectory()
      })
    )
  );

  return entries.length;
}

async function cleanTestReports() {
  const deletedCounts = await Promise.all(reportFolders.map(cleanReportFolder));
  const totalDeleted = deletedCounts.reduce((total, count) => total + count, 0);

  console.log(`Cleaned ${totalDeleted} report artifact(s) from report/pass and report/false.`);
}

cleanTestReports().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
