const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ actorType, actor, actorName, action, targetType, target, req, metadata }) => {
  try {
    await ActivityLog.create({
      actorType,
      actor,
      actorName,
      action,
      targetType,
      target,
      ipAddress: req?.ip,
      metadata,
    });
  } catch (err) {
    console.error('[ActivityLog] failed:', err.message);
  }
};

module.exports = { logActivity };
