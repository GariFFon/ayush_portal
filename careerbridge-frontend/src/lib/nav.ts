import type { ComponentType, SVGProps } from "react"

import {
  ApplicationsIcon,
  GlobalIcon,
  InternshipsIcon,
  OverviewIcon,
  PeopleIcon,
  ProfileIcon,
} from "@/components/icons"

export type Role = "student" | "company" | "university" | "admin"
type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>

export interface NavChild {
  label: string
  href: string
}

export interface NavLink {
  label: string
  href: string
  icon: IconType
  /** Dashboard roots only match their exact path. */
  exact?: boolean
  /** Optional sub-menu (tree) shown under the item. */
  children?: NavChild[]
}

export const ROLE_NAV: Record<Role, NavLink[]> = {
  student: [
    { label: "Overview", href: "/dashboard/student", icon: OverviewIcon, exact: true },
    { label: "Internships", href: "/internships", icon: InternshipsIcon },
    { label: "Applications", href: "/dashboard/student/applications", icon: ApplicationsIcon },
    {
      label: "Profile",
      href: "/dashboard/student/profile",
      icon: ProfileIcon,
      children: [
        { label: "Details", href: "/dashboard/student/profile" },
        { label: "Skills", href: "/dashboard/student/skills" },
      ],
    },
  ],
  company: [
    { label: "Overview", href: "/dashboard/company", icon: OverviewIcon, exact: true },
    {
      label: "Internships",
      href: "/dashboard/company/internships",
      icon: InternshipsIcon,
      children: [
        { label: "All listings", href: "/dashboard/company/internships" },
        { label: "Post new", href: "/dashboard/company/internships/create" },
      ],
    },
    { label: "Applicants", href: "/dashboard/company/applicants", icon: PeopleIcon },
    { label: "Public listings", href: "/internships", icon: GlobalIcon },
  ],
  university: [
    { label: "Overview", href: "/dashboard/university", icon: OverviewIcon, exact: true },
    { label: "Internships", href: "/internships", icon: InternshipsIcon },
  ],
  admin: [{ label: "Overview", href: "/dashboard/admin", icon: OverviewIcon, exact: true }],
}

export const ROLE_HOME: Record<Role, string> = {
  student: "/dashboard/student",
  company: "/dashboard/company",
  university: "/dashboard/university",
  admin: "/dashboard/admin",
}

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard/student": "Overview",
  "/dashboard/student/applications": "Applications",
  "/dashboard/student/skills": "Skills",
  "/dashboard/student/profile": "Profile",
  "/dashboard/company": "Overview",
  "/dashboard/company/internships": "Internships",
  "/dashboard/company/internships/create": "Post internship",
  "/dashboard/company/applicants": "Applicants",
  "/dashboard/university": "Overview",
  "/dashboard/admin": "Overview",
  "/dashboard/account": "Account",
  "/internships": "Internships",
}

const matches = (pathname: string, href: string, exact?: boolean) =>
  pathname === href || (!exact && pathname.startsWith(href + "/"))

/** A link is active if it, or one of its children, matches the path. */
export const isActive = (pathname: string, l: NavLink) =>
  matches(pathname, l.href, l.exact) || !!l.children?.some((c) => pathname === c.href)

export const isChildActive = (pathname: string, c: NavChild) => pathname === c.href
