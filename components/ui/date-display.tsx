import { useDateFormat } from "@/hooks/use-date-format";
import { type DateFormat } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface DateDisplayProps {
  date: string | number | Date;
  format?: DateFormat;
  className?: string;
  showRelative?: boolean;
  fallback?: string;
}

/**
 * Компонент для отображения дат с поддержкой интернационализации
 */
export function DateDisplay({
  date,
  format = "long",
  className,
  showRelative = false,
  fallback,
}: DateDisplayProps) {
  const { format: formatDate, formatRelative } = useDateFormat();

  try {
    const formattedDate = showRelative 
      ? formatRelative(date)
      : formatDate(date, format);

    return (
      <time 
        dateTime={new Date(date).toISOString()} 
        className={cn("inline-block", className)}
      >
        {formattedDate}
      </time>
    );
  } catch (error) {
    return fallback ? <span className={className}>{fallback}</span> : null;
  }
}

/**
 * Компонент для отображения даты публикации
 */
export function PublishedDate({ 
  date, 
  className,
  showRelative = true 
}: Omit<DateDisplayProps, 'format'>) {
  return (
    <DateDisplay
      date={date}
      format="long"
      className={cn("text-sm text-muted-foreground", className)}
      showRelative={showRelative}
      fallback="Date unavailable"
    />
  );
}

/**
 * Компонент для отображения короткой даты
 */
export function ShortDate({ 
  date, 
  className 
}: Omit<DateDisplayProps, 'format' | 'showRelative'>) {
  return (
    <DateDisplay
      date={date}
      format="short"
      className={className}
      fallback="Date unavailable"
    />
  );
}

/**
 * Компонент для отображения месяца и года
 */
export function MonthYear({ 
  date, 
  className 
}: Omit<DateDisplayProps, 'format' | 'showRelative'>) {
  return (
    <DateDisplay
      date={date}
      format="month"
      className={className}
      fallback="Date unavailable"
    />
  );
}
