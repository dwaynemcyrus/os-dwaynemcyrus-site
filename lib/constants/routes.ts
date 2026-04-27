export const ROUTES = {
  calendar: "/calendar",
  home: "/",
  incubate: "/incubate",
  list: "/list",
  media: "/media",
  projects: "/projects",
  reference: "/reference",
  tasks: "/tasks",
  waiting: "/waiting",
  writing: "/writing",
} as const;

export function getWritingItemRoute(itemId: string) {
  return `${ROUTES.writing}/${itemId}`;
}
