/**
 * Utility functions to calculate branch open/closed status based on schedule.
 * Standard Wegagen Bank Operating Hours:
 * - Monday - Friday: 8:00 AM - 5:00 PM (08:00 - 17:00)
 * - Saturday:        8:00 AM - 12:00 PM (08:00 - 12:00)
 * - Sunday:          Closed
 */

export interface BranchStatusInfo {
  isOpen: boolean;
  statusText: 'Open' | 'Closed';
  badgeLabel: 'Open Now' | 'Closed';
  badgeVariant: 'open' | 'danger';
  scheduleText: string;
  nextOpenText?: string;
}

/**
 * Checks if a bank branch is currently open at this exact moment.
 * @param manualIsOpen Optional admin boolean override from server (default: true)
 * @param customHours Optional custom hours string (e.g. "8:00 AM - 5:00 PM")
 */
export function isBranchOpenNow(manualIsOpen: boolean = true, customHours?: string): boolean {
  if (!manualIsOpen) {
    return false;
  }

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const OPEN_TIME_MINUTES = 8 * 60; // 08:00 AM (480 mins)
  const CLOSE_WEEKDAY_MINUTES = 17 * 60; // 05:00 PM (1020 mins)
  const CLOSE_SATURDAY_MINUTES = 12 * 60; // 12:00 PM (720 mins)

  // Sunday is closed
  if (day === 0) {
    return false;
  }

  // Saturday (8:00 AM - 12:00 PM)
  if (day === 6) {
    return currentMinutes >= OPEN_TIME_MINUTES && currentMinutes < CLOSE_SATURDAY_MINUTES;
  }

  // Weekdays (Monday - Friday 8:00 AM - 5:00 PM)
  return currentMinutes >= OPEN_TIME_MINUTES && currentMinutes < CLOSE_WEEKDAY_MINUTES;
}

/**
 * Returns formatted status badge information for UI display.
 */
export function getBranchStatusInfo(
  manualIsOpen: boolean = true,
  customHours?: string
): BranchStatusInfo {
  const isOpen = isBranchOpenNow(manualIsOpen, customHours);

  const now = new Date();
  const day = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const OPEN_TIME_MINUTES = 8 * 60;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let nextOpenText = 'Opens Monday at 8:00 AM';
  if (!manualIsOpen) {
    nextOpenText = 'Temporarily closed';
  } else if (day === 0) {
    nextOpenText = 'Opens Monday at 8:00 AM';
  } else if (day === 6) {
    if (currentMinutes < OPEN_TIME_MINUTES) {
      nextOpenText = 'Opens today (Saturday) at 8:00 AM';
    } else {
      nextOpenText = 'Opens Monday at 8:00 AM';
    }
  } else if (day >= 1 && day <= 5) {
    if (currentMinutes < OPEN_TIME_MINUTES) {
      nextOpenText = `Opens today (${dayNames[day]}) at 8:00 AM`;
    } else if (currentMinutes >= 17 * 60) {
      nextOpenText = day === 5 ? 'Opens Saturday at 8:00 AM' : `Opens tomorrow (${dayNames[day + 1]}) at 8:00 AM`;
    }
  }

  return {
    isOpen,
    statusText: isOpen ? 'Open' : 'Closed',
    badgeLabel: isOpen ? 'Open Now' : 'Closed',
    badgeVariant: isOpen ? 'open' : 'danger',
    scheduleText: 'Mon-Fri: 8:00 AM - 5:00 PM | Sat: 8:00 AM - 12:00 PM',
    nextOpenText: isOpen ? undefined : nextOpenText,
  };
}

/**
 * Returns full customer-facing alert message when attempting to join a closed branch queue.
 */
export function getBranchClosedMessage(
  branchName: string = 'This branch',
  manualIsOpen: boolean = true,
  customHours?: string
): string {
  if (!manualIsOpen) {
    return `${branchName} is currently temporarily closed by bank administration.\n\nStandard Banking Hours:\n• Mon - Fri: 8:00 AM - 5:00 PM\n• Saturday: 8:00 AM - 12:00 PM\n• Sunday: Closed`;
  }

  const statusInfo = getBranchStatusInfo(manualIsOpen, customHours);
  const nextOpen = statusInfo.nextOpenText || 'Opens next business day at 8:00 AM';

  return `${branchName} is currently closed.\n\n⏰ Next Opening: ${nextOpen}\n\n📅 Operating Schedule:\n• Monday – Friday: 8:00 AM – 5:00 PM\n• Saturday: 8:00 AM – 12:00 PM\n• Sunday: Closed`;
}

