export const unwrapApiData = (response) => response?.data ?? response ?? {};

export const extractArray = (response, keys = []) => {
  const data = unwrapApiData(response);

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    const value = data?.[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

export const getApiErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const message = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.msg || item.message || item.detail || JSON.stringify(item);
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');

    return message || fallback;
  }

  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || detail.detail || fallback;
  }

  return error?.message || fallback;
};