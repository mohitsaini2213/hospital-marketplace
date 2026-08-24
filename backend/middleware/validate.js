const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().reduce((acc, e) => {
      acc[e.path] = e.msg;
      return acc;
    }, {});
    return next(new ApiError(400, 'Please correct the highlighted fields.', details));
  }
  next();
};

module.exports = validate;
