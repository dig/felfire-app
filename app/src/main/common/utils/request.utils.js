exports.handleError = (body, statusCode) => {
  switch (statusCode) {
    case 400: return body.error;
    case 422: return body.errors[0].msg;
    default: return 'Server error.';
  }
};