import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GoogleCalendarEventProps {
  title: string;
  description: string;
  location: string;
  startDate: Date | string;
  durationInMinutes?: number;
}

export function generateGoogleCalendarUrl({
  title,
  description,
  location,
  startDate,
  durationInMinutes = 45,
}: GoogleCalendarEventProps) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationInMinutes * 60000);

  // Formata a data para o padrão exigido pelo Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatGDate = (date: Date) =>
    date.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location: location,
    dates: `${formatGDate(start)}/${formatGDate(end)}`,
  });

  return `${baseUrl}?${params.toString()}`;
}
