import {
  Briefcase,
  Calendar,
  FileCheck,
  Heart,
  LayoutDashboard,
  PenLine,
  Shield,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";

export const featureIcons = {
  users: Users,
  heart: Heart,
  "file-check": FileCheck,
  "pen-line": PenLine,
  upload: Upload,
  "layout-dashboard": LayoutDashboard,
  sparkles: Sparkles,
  calendar: Calendar,
  briefcase: Briefcase,
  shield: Shield,
} as const;

export type FeatureIconName = keyof typeof featureIcons;
