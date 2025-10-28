import { scheduler } from './scheduler';

async function main() {
  console.log('worker starting');
  scheduler.startAllSchedules();

  const shutdown = async () => {
    try { scheduler.stopAllSchedules(); } catch {}
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('worker error', err);
  process.exit(1);
});
