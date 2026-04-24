"use client";

import { createContext, useContext } from "react";
import type { Organization } from "./types";

export const OrgContext = createContext<Organization | null>(null);

export function useOrg(): Organization {
  const org = useContext(OrgContext);
  if (!org) {
    throw new Error("useOrg called outside OrgContext provider");
  }
  return org;
}
