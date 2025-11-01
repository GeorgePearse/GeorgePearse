const units: Array<{ max: number; value: number; name: Intl.RelativeTimeFormatUnit }> = [
  { max: 60, value: 1, name: "second" },
  { max: 3600, value: 60, name: "minute" },
  { max: 86400, value: 3600, name: "hour" },
  { max: 604800, value: 86400, name: "day" },
  { max: 2629800, value: 604800, name: "week" },
  { max: 31557600, value: 2629800, name: "month" },
  { max: Number.POSITIVE_INFINITY, value: 31557600, name: "year" },
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const formatDistanceToNow = (date: string | number | Date) => {
  const input = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  const now = new Date();
  const elapsedSeconds = Math.round((input.getTime() - now.getTime()) / 1000);
  const absElapsed = Math.abs(elapsedSeconds);

  for (const unit of units) {
    if (absElapsed < unit.max) {
      return rtf.format(Math.round(elapsedSeconds / unit.value), unit.name);
    }
  }
  return input.toLocaleDateString();
};
