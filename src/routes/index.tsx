import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Online Admission Portal | Kenya Unity University",
      },
      {
        name: "description",
        content:
          "Prototype online admission application portal with form validation, automatic reference number generation and instant success feedback.",
      },
      { property: "og:title", content: "Online Admission Portal | Kenya Unity University" },
      {
        property: "og:description",
        content:
          "Apply for admission online: validated application form with instant feedback and a unique reference number.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  kcseIndex: string;
  program: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const PROGRAMS = [
  "Bachelor of Science in Computer Science",
  "Bachelor of Science in Information Technology",
  "Bachelor of Commerce",
  "Bachelor of Education (Arts)",
  "Bachelor of Science in Nursing",
  "Bachelor of Laws (LLB)",
];

// --- Validation techniques (Part B) ---------------------------------------

function validateField(field: keyof FormState, value: string): string | undefined {
  const v = value.trim();

  switch (field) {
    case "fullName": {
      // 3+ characters, letters/spaces/apostrophes/hyphens, at least two words.
      if (!v) return "Full name is required.";
      if (v.length < 3) return "Name must be at least 3 characters long.";
      if (!/^[A-Za-z' -]+$/.test(v)) return "Name may only contain letters, spaces, hyphens and apostrophes.";
      if (v.trim().split(/\s+/).length < 2) return "Please enter your full name (first and last name).";
      return undefined;
    }
    case "email": {
      // Standard email pattern: local part @ domain, domain has a dot and TLD.
      if (!v) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) return "Enter a valid email address, e.g. name@example.com.";
      return undefined;
    }
    case "phone": {
      // Kenyan formats: +2547XXXXXXXX, 2547XXXXXXXX, 07XXXXXXXX or 01XXXXXXXX
      const digits = v.replace(/[\s-]/g, "");
      if (!digits) return "Phone number is required.";
      if (!/^(?:\+?254|0)(?:7|1)\d{8}$/.test(digits))
        return "Enter a valid Kenyan phone number, e.g. 0712 345 678 or +254712345678.";
      return undefined;
    }
    case "kcseIndex": {
      // KCSE index: at least 11 digits, optionally followed by /NN or /YYYY candidate code
      if (!v) return "KCSE index number is required.";
      const cleaned = v.replace(/\s/g, "").toUpperCase();
      if (!/^\d{11,}(\/\d{2,4})?$/.test(cleaned))
        return "KCSE index number must be at least 11 digits, optionally followed by a candidate code, e.g. 112345678901/01.";
      return undefined;
    }
    case "program": {
      if (!v) return "Please select a programme.";
      return undefined;
    }
  }
}

function validateAll(form: FormState): Errors {
  const errors: Errors = {};
  (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
    const message = validateField(key, form[key]);
    if (message) errors[key] = message;
  });
  return errors;
}

// --- Reference number generator (Part C) ----------------------------------

function generateReference(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `KUU/ADM/${year}/${timestamp}${random}`;
}

function Index() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    kcseIndex: "",
    program: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [reference, setReference] = useState<string | null>(null);

  const update = (field: keyof FormState) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    // Live re-validation once a field has been visited.
    if (touched[field]) {
      setErrors((errs) => ({ ...errs, [field]: validateField(field, value) }));
    }
  };

  const blur = (field: keyof FormState) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((errs) => ({ ...errs, [field]: validateField(field, form[field]) }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); // stop the browser round-trip; JS takes over
    const allErrors = validateAll(form);
    setErrors(allErrors);
    setTouched({ fullName: true, email: true, phone: true, kcseIndex: true, program: true });
    if (Object.keys(allErrors).length > 0) {
      setReference(null);
      return;
    }
    // Success path: unique reference number + confirmation message
    setReference(generateReference());
  };

  const fieldError = (field: keyof FormState) =>
    touched[field] || Object.keys(errors).length > 0 ? errors[field] : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Part A: University banner */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
          >
            KU
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Kenya Unity University</h1>
            <p className="text-xs text-muted-foreground">Knowledge • Integrity • Service</p>
          </div>
        </div>
      </header>

      {/* Part A: Navigation menu */}
      <nav aria-label="Main navigation" className="border-b border-border bg-secondary">
        <ul className="mx-auto flex max-w-5xl flex-wrap gap-1 px-2 py-1 text-sm font-medium">
          {[
            ["Home", "#home"],
            ["Admissions", "#admissions"],
            ["Programmes", "#programmes"],
            ["How it Works", "#evaluation"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <li key={label}>
              <a className="inline-block rounded-md px-3 py-2 text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground" href={href}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main id="home" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <section id="admissions" className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight">Admission Application Form</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the details below. All fields are validated before your application is accepted.
          </p>

          {/* Part C: success message with generated reference number */}
          {reference && (
            <div
              role="status"
              className="mt-6 rounded-lg border border-chart-2/40 bg-chart-2/10 p-4 text-sm"
            >
              <p className="font-semibold text-foreground">Application submitted successfully! 🎉</p>
              <p className="mt-1 text-foreground">
                Your unique reference number is{" "}
                <strong className="font-mono text-primary">{reference}</strong>
              </p>
              <p className="mt-1 text-muted-foreground">
                Keep it safe — use it to track your admission status and in all correspondence with the
                admissions office.
              </p>
            </div>
          )}

          <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={submit} noValidate>
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="e.g. Amina Wanjiku Otieno"
                value={form.fullName}
                onChange={update("fullName")}
                onBlur={blur("fullName")}
                aria-invalid={fieldError("fullName") ? true : undefined}
                aria-describedby={fieldError("fullName") ? "fullName-error" : undefined}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
              />
              {fieldError("fullName") && (
                <p id="fullName-error" role="alert" className="mt-1 text-xs text-destructive">
                  {fieldError("fullName")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="e.g. amina.wanjiku@example.com"
                value={form.email}
                onChange={update("email")}
                onBlur={blur("email")}
                aria-invalid={fieldError("email") ? true : undefined}
                aria-describedby={fieldError("email") ? "email-error" : undefined}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
              />
              {fieldError("email") && (
                <p id="email-error" role="alert" className="mt-1 text-xs text-destructive">
                  {fieldError("email")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. 0712 345 678"
                value={form.phone}
                onChange={update("phone")}
                onBlur={blur("phone")}
                aria-invalid={fieldError("phone") ? true : undefined}
                aria-describedby={fieldError("phone") ? "phone-error" : undefined}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
              />
              {fieldError("phone") && (
                <p id="phone-error" role="alert" className="mt-1 text-xs text-destructive">
                  {fieldError("phone")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="kcseIndex" className="mb-1 block text-sm font-medium">
                KCSE Index Number <span className="text-destructive">*</span>
              </label>
              <input
                id="kcseIndex"
                name="kcseIndex"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 11234567890/01"
                value={form.kcseIndex}
                onChange={update("kcseIndex")}
                onBlur={blur("kcseIndex")}
                aria-invalid={fieldError("kcseIndex") ? true : undefined}
                aria-describedby={fieldError("kcseIndex") ? "kcseIndex-error" : undefined}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
              />
              {fieldError("kcseIndex") && (
                <p id="kcseIndex-error" role="alert" className="mt-1 text-xs text-destructive">
                  {fieldError("kcseIndex")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="program" className="mb-1 block text-sm font-medium">
                Programme Applied For <span className="text-destructive">*</span>
              </label>
              <select
                id="program"
                name="program"
                value={form.program}
                onChange={update("program")}
                onBlur={blur("program")}
                aria-invalid={fieldError("program") ? true : undefined}
                aria-describedby={fieldError("program") ? "program-error" : undefined}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
              >
                <option value="">— Select a programme —</option>
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {fieldError("program") && (
                <p id="program-error" role="alert" className="mt-1 text-xs text-destructive">
                  {fieldError("program")}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:px-8"
              >
                Submit Application
              </button>
            </div>
          </form>
        </section>

        <section id="programmes" className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">Programmes on Offer</h2>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {PROGRAMS.map((p) => (
              <li key={p} className="rounded-lg border border-border bg-card px-4 py-3">
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* Additional requirement: brief evaluation */}
        <section id="evaluation" className="mt-10 rounded-xl border border-border bg-muted/40 p-6">
          <h2 className="text-xl font-bold tracking-tight">Design Evaluation</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold">1. Layout Decisions</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                A single-page layout mirrors how applicants read: banner for identity, a fixed
                navigation menu for orientation, the admission form placed first as the page's main
                task, programmes and evaluation details below, and a footer with contacts. The form
                uses a two-column grid that collapses to one column on phones, with grouped fields,
                clear labels, required-field markers and inline error messages right beside the
                offending input.
              </p>
            </div>
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold">2. Validation Techniques</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                JavaScript regular expressions validate each field: names must have 3+ letters and at
                least two words; emails follow the local@domain.tld pattern; phone numbers accept
                Kenyan formats (+2547…, 07…, 01…); KCSE index numbers must be at least 11 digits with
                an optional candidate code (e.g. /01). Validation runs on blur and on change after a first visit, is
                re-checked for all fields on submit, and uses <code>noValidate</code> plus{" "}
                <code>aria-invalid</code>/<code>role="alert"</code> so errors are announced to screen
                readers.
              </p>
            </div>
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold">3. Efficiency vs Manual Admissions</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                The portal removes paper forms, travel and queues: data is captured cleanly at the
                source, so incomplete or mistyped entries are rejected instantly instead of surfacing
                weeks later. Each submission gets a unique reference number for automatic tracking and
                retrieval, eliminating manual filing and duplicate records. Staff review a digital
                queue instead of transcribing handwriting — cutting processing time, errors and costs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Part A: Footer section */}
      <footer id="contact" className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
          <div>
            <h3 className="font-semibold">Kenya Unity University</h3>
            <p className="mt-1 text-muted-foreground">
              P.O. Box 1234-00100, Nairobi, Kenya
              <br />
              Admissions Block, Main Campus
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Contact</h3>
            <p className="mt-1 text-muted-foreground">
              admissions@kenyaunity.ac.ke
              <br />
              +254 20 555 0100
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href="#admissions">
                  Apply Now
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#programmes">
                  Programmes
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#evaluation">
                  How it Works
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kenya Unity University. All rights reserved. (Prototype)
        </div>
      </footer>
    </div>
  );
}
