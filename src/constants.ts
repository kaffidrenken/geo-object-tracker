export const TASK_LOCATION = "TASK_LOCATION";

// Tuning thresholds for proximity / state changes
export const APPROACH_RADIUS_M = 400; // distance to start "approaching" logic (heuristic + ETA)
export const ARRIVAL_RADIUS_M = 30;   // consider "at object" within this radius (meters)

export const IDLE_SECONDS = 180;      // 3 minutes stopped at object before we prompt
export const LEAVE_RADIUS_M = 200;    // consider "left object" if beyond this distance
export const LEAVE_MINUTES = 5;       // ...or if away for this many minutes
