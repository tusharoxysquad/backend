const cron = require('node-cron');
const { markAbsent, autoCheckout } = require('../services/attendance.service');
const logger = require('../utils/logger');

/**
 * Runs every day at 11:45 PM
 * Auto checks out any employee who checked in but forgot to check out
 */
const autoCheckoutJob = cron.schedule(
  '45 23 * * *',
  async () => {
    logger.info('[CRON] Running auto checkout job...');
    try {
      const result = await autoCheckout();
      logger.info(`[CRON] Auto checkout job completed. Processed ${result.processed} records.`);
    } catch (error) {
      logger.error(`[CRON] Auto checkout job failed: ${error.message}`);
    }
  },
  { scheduled: false, timezone: 'Asia/Karachi' }
);

/**
 * Runs every day at 11:59 PM
 * Marks all employees who never checked in as ABSENT
 * Runs AFTER autoCheckoutJob so absent logic is clean
 */
const autoMarkAbsentJob = cron.schedule(
  '59 23 * * *',
  async () => {
    logger.info('[CRON] Running auto absent marking job...');
    try {
      const result = await markAbsent();
      logger.info(`[CRON] Auto absent job completed. Marked ${result.marked} employees as absent.`);
    } catch (error) {
      logger.error(`[CRON] Auto absent job failed: ${error.message}`);
    }
  },
  { scheduled: false, timezone: 'Asia/Karachi' }
);

const startCronJobs = () => {
  autoCheckoutJob.start();
  logger.info('[CRON] Auto checkout job scheduled (daily at 23:45)');

  autoMarkAbsentJob.start();
  logger.info('[CRON] Auto absent marking job scheduled (daily at 23:59)');
};

module.exports = { startCronJobs };
