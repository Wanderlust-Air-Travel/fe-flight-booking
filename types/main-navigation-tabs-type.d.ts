export interface TabItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  paths: string[]; // Paths that should highlight this tab
}

