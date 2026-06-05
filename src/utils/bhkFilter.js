/** Extract numeric BHK for API/URL (e.g. "3 BHK" → "3", "4+" → "4+"). */
export const getBhkFilterValue = (opt) => {
  const str = String(opt ?? '').trim();
  if (!str) return '';
  if (str.includes('+')) return str.replace(/\s+/g, '');
  if (/\bRK\b/i.test(str)) return '1 RK';
  const num = str.match(/\d+/)?.[0];
  return num || str.replace(/\s*bhk\s*/gi, '').trim();
};

/** Unique BHK keys for sidebar options. */
export const getUniqueBhkOptions = (options) => {
  const seen = new Set();
  return (options || []).filter((opt) => {
    const key = getBhkFilterValue(opt);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const isBhkOptionSelected = (beds, opt) =>
  (beds || []).some((b) => getBhkFilterValue(b) === getBhkFilterValue(opt));

export const toggleBhkSelection = (beds, opt, currentlySelected) => {
  const norm = getBhkFilterValue(opt);
  const list = beds || [];
  if (!norm) return list;
  if (currentlySelected) {
    return list.filter((b) => getBhkFilterValue(b) !== norm);
  }
  return [...list.filter((b) => getBhkFilterValue(b) !== norm), norm];
};

/** Values sent to search API (digits / 4+ / 1 RK). */
export const normalizeBhkForApi = (values) => {
  const list = Array.isArray(values) ? values : [values];
  const seen = new Set();
  return list
    .flatMap((v) => String(v).split(','))
    .map((v) => getBhkFilterValue(v))
    .filter((v) => {
      if (!v || seen.has(v)) return false;
      seen.add(v);
      return true;
    });
};

/** Parse bhk from URLSearchParams (supports repeated bhk=1&bhk=2 or bhk=1,2,3). */
export const parseBhkFromSearchParams = (params) => {
  const repeated = params.getAll('bhk').filter(Boolean);
  if (repeated.length > 1) {
    return normalizeBhkForApi(repeated);
  }
  const single = params.get('bhk');
  if (!single) return [];
  return normalizeBhkForApi(single);
};

/** Append each BHK as its own query param (safe for Express arrays). */
export const appendBhkToSearchParams = (queryParams, beds) => {
  normalizeBhkForApi(beds).forEach((b) => queryParams.append('bhk', b));
};
