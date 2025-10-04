export const formatDate = (isoDate, options = { year: "numeric", month: "long", day: "numeric" }) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, options);
  };
  