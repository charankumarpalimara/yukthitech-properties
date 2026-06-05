/** Land for Development — builder / owner revenue share (%) */

export const isLandForDevelopmentType = (propertyTypeName) =>
  String(propertyTypeName || '')
    .toLowerCase()
    .includes('land for development');

export const parseDevelopmentRatio = (value) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
};

export const getDevelopmentShare = (property) => {
  const specs = property?.specifications || {};
  const builder = parseDevelopmentRatio(specs.builderRatio ?? property?.builderRatio);
  const owner = parseDevelopmentRatio(specs.ownerRatio ?? property?.ownerRatio);
  if (builder == null && owner == null) return null;
  return {
    builder,
    owner,
    total: (builder ?? 0) + (owner ?? 0),
  };
};

export const formatDevelopmentRatio = (n) => (n != null ? `${n}%` : null);
