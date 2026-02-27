const getApiErrorMessage = (error, fallback) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (Array.isArray(error?.response?.data?.errors) && error.response.data.errors.length > 0) {
    return error.response.data.errors.map((e) => e.msg).join(", ");
  }

  if (error?.message === "Network Error") {
    return "Cannot reach backend API. Ensure backend is running on port 5000.";
  }

  return fallback;
};

export default getApiErrorMessage;
