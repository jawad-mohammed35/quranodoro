"use client";

import Image from "next/image";
import { Briefcase, GraduationCap, Mail, MapPin, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Profile photo (lives in /public). Swap the file to update the headshot. */
const PROFILE_IMAGE_SRC: string | null = "/profile.png";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function ProfileImage() {
  if (PROFILE_IMAGE_SRC) {
    return (
      <Image
        src={PROFILE_IMAGE_SRC}
        alt="Jawad Mohammed"
        width={112}
        height={112}
        priority
        className="h-28 w-28 rounded-full border-4 border-primary-soft object-cover shadow-card"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary-soft bg-muted text-muted-foreground shadow-card"
    >
      <User className="h-12 w-12" strokeWidth={1.5} />
    </span>
  );
}

const EXPERIENCE = [
  {
    role: "Testing Technician",
    org: "RAZOR-Gov",
    period: "June 2026 – Present",
    current: true,
  },
  {
    role: "Graduate Research Assistant",
    org: "FIU EPSi Lab",
    period: "February 2024 – December 2026",
    current: false,
  },
  {
    role: "Quality Assurance & IT Specialist",
    org: "Wooo!",
    period: "April 2025 – December 2025",
    current: false,
  },
] as const;

export function AboutView() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("about.title")} description={t("about.description")} />

      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <ProfileImage />
            <h2 className="text-xl font-semibold">Jawad Mohammed</h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" aria-hidden /> {t("about.education")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">
                Master of Science in Computer Science
              </p>
              <p className="text-sm italic text-muted-foreground">
                Florida International University
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" aria-hidden /> {t("about.experience")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative flex flex-col gap-8 border-l-2 border-primary-soft pl-6">
              {EXPERIENCE.map((job) => (
                <li key={job.role} className="relative">
                  <span
                    aria-hidden
                    className={
                      "absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-primary-soft " +
                      (job.current ? "bg-primary" : "bg-muted-foreground/60")
                    }
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold">{job.role}</p>
                    <p className="text-sm text-muted-foreground">{job.org}</p>
                    <p className="text-xs text-muted-foreground">{job.period}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("about.connect")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">{t("about.location")}</p>
                  <p className="text-muted-foreground">Miami, FL</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                  <LinkedInIcon className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p className="font-medium">LinkedIn</p>
                  <a
                    href="https://www.linkedin.com/in/jawad-mohammed01/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    linkedin.com/in/jawad-mohammed01
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                  <Mail className="h-4 w-4 text-primary" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">Email</p>
                  <a
                    href="mailto:jmoha027@fiu.edu"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    jmoha027@fiu.edu
                  </a>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
