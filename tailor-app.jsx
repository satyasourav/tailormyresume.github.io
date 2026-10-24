import { useState, useRef, useMemo } from "react";
import mammoth from "mammoth";
import { Upload, FileText, Download, Copy, X, Check, Printer, Camera } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Country norms                                                      */
/* ------------------------------------------------------------------ */
const ORDER_STD = ["summary", "skills", "experience", "education", "certifications", "projects", "languages", "extras"];
const ORDER_EU = ["experience", "education", "skills", "certifications", "languages", "projects", "extras"];

const NORMS = {
  US: {
    label: "United States", doc: "Resume", paper: "Letter", pages: "1 page; 2 only with 10+ years of experience",
    photo: "no", photoNote: "No photo", personal: "none",
    personalNote: "No age, marital status, nationality or photo (anti-discrimination norms)",
    spelling: "American English",
    style: "Reverse-chronological, ATS-friendly single column, strong action verbs, quantified results, no pronouns, no objective statement",
    letter: "3 to 4 short paragraphs, max 350 words, 'Dear Hiring Manager,' if no name, confident and achievement-led tone, close with 'Sincerely,'",
    tips: ["Mirror exact keywords from the job description", "Use standard headings so ATS parses them", "Skip references; 'available on request' is unnecessary"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-US", dateNumeric: false,
  },
  CA: {
    label: "Canada", doc: "Resume", paper: "Letter", pages: "1 to 2 pages",
    photo: "no", photoNote: "No photo", personal: "none",
    personalNote: "No age, marital status or photo; work authorization can be stated briefly if relevant",
    spelling: "Canadian English (colour, centre, licence as noun)",
    style: "Reverse-chronological, ATS-friendly, results-focused, concise bullets; Canadian experience is valued so state location and work authorization if applicable",
    letter: "One page, 3 to 4 paragraphs, professional yet warm, 'Dear Hiring Manager,' and 'Sincerely,'",
    tips: ["Bilingual (English/French) ability is a real asset; list levels", "Quebec employers expect French documents"],
    order: ORDER_STD, tabular: false, localLang: "French", enLocale: "en-CA", localLocale: "fr-CA", dateNumeric: false,
  },
  UK: {
    label: "United Kingdom", doc: "CV", paper: "A4", pages: "2 pages",
    photo: "no", photoNote: "No photo", personal: "none",
    personalNote: "No date of birth, marital status or photo; right to work can be stated",
    spelling: "British English",
    style: "Reverse-chronological CV with a short personal profile at the top, key skills, achievements per role; references 'available on request' or omitted",
    letter: "One page, 3 to 4 paragraphs, formal but personable; 'Dear Mr/Ms Surname,' or 'Dear Hiring Manager,'; close 'Yours sincerely,' if named, 'Yours faithfully,' if not",
    tips: ["Personal statement of 3 to 4 lines", "Address how you meet the person specification", "Date format: 24 October 2026"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-GB", dateNumeric: false,
  },
  IE: {
    label: "Ireland", doc: "CV", paper: "A4", pages: "2 pages",
    photo: "no", photoNote: "No photo", personal: "none",
    personalNote: "No date of birth, marital status or photo",
    spelling: "British/Irish English",
    style: "Reverse-chronological CV with profile, achievements and relevant skills; 2 referees or 'available on request'",
    letter: "One page, formal, tailored to the company; 'Dear Hiring Manager,' and 'Yours sincerely/faithfully,'",
    tips: ["Mention work eligibility if non-EU", "Keep it factual and understated"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-IE", dateNumeric: false,
  },
  AU: {
    label: "Australia", doc: "Resume", paper: "A4", pages: "2 to 3 pages",
    photo: "no", photoNote: "No photo", personal: "some",
    personalNote: "No age, marital status or photo; citizenship or visa/work rights are commonly stated",
    spelling: "Australian English",
    style: "Reverse-chronological, detailed achievements, career summary at top, referees often listed (2) or 'available on request'",
    letter: "One page, direct and friendly, address selection criteria if listed, 'Dear Hiring Manager,' and 'Yours sincerely,'",
    tips: ["State work rights clearly", "Government roles: address key selection criteria with examples"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-AU", dateNumeric: false,
  },
  NZ: {
    label: "New Zealand", doc: "CV", paper: "A4", pages: "2 to 3 pages",
    photo: "no", photoNote: "No photo", personal: "some",
    personalNote: "No age, marital status or photo; state work rights/residency; referees commonly listed",
    spelling: "New Zealand English (British-style)",
    style: "Reverse-chronological, honest and modest tone, achievements with context, include referees or availability",
    letter: "One page, genuine and personable, 'Dear Hiring Manager,' and 'Yours sincerely,'",
    tips: ["Cultural fit and teamwork are weighed heavily", "Mention residency or visa status"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-NZ", dateNumeric: false,
  },
  DE: {
    label: "Germany", doc: "Lebenslauf (CV)", paper: "A4", pages: "1 to 2 pages",
    photo: "common", photoNote: "Professional photo is customary but optional",
    personal: "common", personalNote: "Date and place of birth, nationality are traditionally included (now optional); marital status optional",
    spelling: "Standard German (or English if applying in English)",
    style: "Tabular layout with dates on the left, strictly reverse-chronological, gap-free, no unexplained gaps, concise factual wording, signed and dated at the end",
    letter: "Anschreiben: one page, formal, structured: why this company, why you, what you offer; mention earliest start date and, if asked, salary expectation; 'Sehr geehrte Damen und Herren,' or named person; close 'Mit freundlichen Grüßen'",
    tips: ["Certificates (Zeugnisse) are attached as separate documents", "Language skills with CEFR levels", "Place and date plus signature line at the end"],
    order: ORDER_EU, tabular: true, localLang: "German", enLocale: "en-GB", localLocale: "de-DE", dateNumeric: true,
  },
  FR: {
    label: "France", doc: "CV", paper: "A4", pages: "1 page (2 for senior profiles)",
    photo: "optional", photoNote: "Photo optional and becoming less common", personal: "some",
    personalNote: "Age/date of birth not required; avoid marital status",
    spelling: "French",
    style: "Clean and compact, title line stating target job, experience then education, languages with CEFR levels, interests section (centres d'intérêt) is expected",
    letter: "Lettre de motivation is expected: one page, formal and structured (you, the company, the match), 'Madame, Monsieur,' and a polite formal closing formula",
    tips: ["Include the degree and school prestige where relevant", "Keep a short interests section"],
    order: ORDER_EU, tabular: false, localLang: "French", enLocale: "en-GB", localLocale: "fr-FR", dateNumeric: false,
  },
  NL: {
    label: "Netherlands", doc: "CV", paper: "A4", pages: "2 pages",
    photo: "optional", photoNote: "Photo optional", personal: "some",
    personalNote: "Date of birth and nationality sometimes included; marital status omitted",
    spelling: "Dutch (or British English if in English)",
    style: "Direct, factual, reverse-chronological, concise profile, clear results",
    letter: "Motivatiebrief: one page, direct and informal-professional, say what you bring and why you want the role",
    tips: ["Directness is valued over self-promotion", "Mention availability and notice period"],
    order: ORDER_STD, tabular: false, localLang: "Dutch", enLocale: "en-GB", localLocale: "nl-NL", dateNumeric: false,
  },
  CH: {
    label: "Switzerland", doc: "CV (Lebenslauf)", paper: "A4", pages: "2 pages",
    photo: "common", photoNote: "Photo is common", personal: "common",
    personalNote: "Date of birth, nationality and work permit type are commonly included",
    spelling: "Swiss Standard German (no ß; use ss) or the relevant language",
    style: "Tabular, reverse-chronological, precise and complete, with certificates and references available",
    letter: "One page, formal and polite, precise motivation, mention notice period and start date; 'Sehr geehrte Damen und Herren,'",
    tips: ["State work permit (B, C, L, G) or Swiss/EU citizenship", "Multilingual skills matter; list levels"],
    order: ORDER_EU, tabular: true, localLang: "German", enLocale: "en-GB", localLocale: "de-CH", dateNumeric: true,
  },
  ES: {
    label: "Spain", doc: "Currículum Vitae", paper: "A4", pages: "1 to 2 pages",
    photo: "common", photoNote: "Photo is common but optional", personal: "some",
    personalNote: "Date of birth and nationality are often included",
    spelling: "Spanish",
    style: "Reverse-chronological, clear sections, languages with levels, IT skills",
    letter: "Carta de presentación: one page, formal, 'Estimados señores:' or named person, courteous closing",
    tips: ["Include language levels", "Add a short availability line"],
    order: ORDER_EU, tabular: false, localLang: "Spanish", enLocale: "en-GB", localLocale: "es-ES", dateNumeric: false,
  },
  IT: {
    label: "Italy", doc: "CV (Europass style)", paper: "A4", pages: "2 pages",
    photo: "optional", photoNote: "Photo optional", personal: "some",
    personalNote: "Date of birth, nationality commonly included",
    spelling: "Italian",
    style: "Reverse-chronological, Europass-like structure, languages with CEFR, digital skills",
    letter: "Lettera di presentazione: one page, formal, 'Gentile Responsabile Selezione,' and 'Cordiali saluti,'",
    tips: ["End the CV with the GDPR consent line: authorization to process personal data (D.Lgs. 196/2003 and GDPR)"],
    order: ORDER_EU, tabular: true, localLang: "Italian", enLocale: "en-GB", localLocale: "it-IT", dateNumeric: false,
  },
  AE: {
    label: "United Arab Emirates", doc: "CV", paper: "A4", pages: "2 pages",
    photo: "common", photoNote: "Photo commonly included", personal: "common",
    personalNote: "Nationality, visa status and notice period are commonly stated; date of birth sometimes",
    spelling: "British English",
    style: "Reverse-chronological, achievement-driven, professional summary, visa status and notice period visible",
    letter: "One page, formal and respectful, 'Dear Hiring Manager,' mention visa status, notice period and availability",
    tips: ["Gulf experience and language skills (Arabic) are valued", "State visa type and ability to join"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-GB", dateNumeric: false,
  },
  IN: {
    label: "India", doc: "Resume / CV", paper: "A4", pages: "1 to 2 pages (up to 3 for senior roles)",
    photo: "optional", photoNote: "Photo not required for corporate roles", personal: "common",
    personalNote: "Date of birth, nationality, languages known and location are often included; notice period is helpful",
    spelling: "Indian/British English",
    style: "Career objective or summary, skills, projects and internships for early careers, academic scores/CGPA for freshers, technology keywords for portals like Naukri",
    letter: "One page, polite and formal, 'Dear Hiring Manager,' mention notice period and current location",
    tips: ["Add a short declaration line at the end if appropriate", "Mention notice period; share CTC only if asked"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-IN", dateNumeric: false,
  },
  SG: {
    label: "Singapore", doc: "Resume", paper: "A4", pages: "1 to 2 pages",
    photo: "no", photoNote: "Photo not needed", personal: "some",
    personalNote: "Nationality/work pass status commonly stated; expected salary and notice period often requested",
    spelling: "British English",
    style: "Concise reverse-chronological, results with numbers, ATS-friendly",
    letter: "One page, professional and direct, 'Dear Hiring Manager,' mention availability and work pass status",
    tips: ["State citizen, PR or pass type (EP/S Pass)", "Mention notice period and expected salary only if asked"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-SG", dateNumeric: false,
  },
  JP: {
    label: "Japan", doc: "Shokumu Keirekisho (career history resume)", paper: "A4", pages: "2 pages",
    photo: "common", photoNote: "Photo is required on the Rirekisho form (not generated here)", personal: "common",
    personalNote: "Age, nationality and visa status commonly stated; Rirekisho form is separate and standardized",
    spelling: "Japanese or British English",
    style: "Career-history document: company, role, responsibilities and achievements with clear numbers, written formally; the standard Rirekisho form must be filled separately",
    letter: "Formal, humble tone, one page, explain motivation and contribution to the company",
    tips: ["Generated content covers the work-history (Shokumu Keirekisho) part only", "Use YYYY/MM dates"],
    order: ORDER_EU, tabular: true, localLang: "Japanese", enLocale: "en-GB", localLocale: "ja-JP", dateNumeric: true,
  },
  BR: {
    label: "Brazil", doc: "Currículo", paper: "A4", pages: "1 to 2 pages",
    photo: "optional", photoNote: "Photo optional", personal: "some",
    personalNote: "Age, marital status and city are often included; keep to what is relevant",
    spelling: "Brazilian Portuguese",
    style: "Objective line, professional summary, reverse-chronological experience, courses and certifications",
    letter: "Carta de apresentação: short and polite, 'Prezados,' and 'Atenciosamente,'",
    tips: ["Include courses and certifications", "Language proficiency with levels"],
    order: ORDER_STD, tabular: false, localLang: "Portuguese", enLocale: "en-GB", localLocale: "pt-BR", dateNumeric: false,
  },
  XX: {
    label: "Other / international", doc: "Resume / CV", paper: "A4", pages: "2 pages",
    photo: "no", photoNote: "No photo", personal: "none",
    personalNote: "Keep personal details minimal",
    spelling: "British English",
    style: "Reverse-chronological, ATS-friendly, concise, achievement-focused",
    letter: "One page, professional, 3 to 4 paragraphs",
    tips: ["Mention work authorization if applying abroad"],
    order: ORDER_STD, tabular: false, localLang: null, enLocale: "en-GB", dateNumeric: false,
  },
};

const normsText = (n, lang) =>
  [
    `Country: ${n.label}`,
    `Document name: ${n.doc}`,
    `Length: ${n.pages}`,
    `Photo: ${n.photoNote}`,
    `Personal details: ${n.personalNote}`,
    `Spelling: ${n.spelling}`,
    `Resume style: ${n.style}`,
    `Cover letter: ${n.letter}`,
    `Other: ${n.tips.join("; ")}`,
    `Write the documents in: ${lang === "local" && n.localLang ? n.localLang : "English"}`,
  ].join("\n");

/* ------------------------------------------------------------------ */
/*  Model calls                                                        */
/* ------------------------------------------------------------------ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One model call. If a reply hits the output limit, it is continued automatically (up to 5 parts).
// Rate limits, server errors and network drops are retried.
async function ask(system, content, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const sys = i === 0 ? system : `${system}\nIMPORTANT: Be as brief as possible and return complete, valid JSON only.`;
      let messages = [{ role: "user", content }];
      let full = "";
      for (let part = 0; part < 5; part++) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: sys, messages }),
        });
        if (!res.ok) {
          let detail = "";
          try {
            detail = (await res.json())?.error?.message || "";
          } catch {}
          const err = new Error(`Request failed (${res.status})${detail ? `: ${detail}` : ""}`);
          err.retry = res.status === 429 || res.status >= 500;
          throw err;
        }
        const data = await res.json();
        full += data.content.map((c) => (c.type === "text" ? c.text : "")).filter(Boolean).join("\n");
        if (data.stop_reason !== "max_tokens") return full;
        messages = [
          { role: "user", content },
          { role: "assistant", content: full },
          { role: "user", content: "Your reply was cut off. Continue exactly where it stopped. No repetition, no preamble, no code fences." },
        ];
      }
      throw new Error("A reply was too long to complete.");
    } catch (e) {
      lastErr = e;
      if (e.retry === false) break;
      await sleep(1500 * (i + 1));
    }
  }
  throw lastErr;
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const a = clean.indexOf("{");
  const b = clean.lastIndexOf("}");
  if (a < 0 || b < a) throw new Error("The reply was not valid JSON.");
  return JSON.parse(clean.slice(a, b + 1));
}

async function askJSON(system, content) {
  let err;
  for (let i = 0; i < 3; i++) {
    try {
      return parseJSON(await ask(system, content));
    } catch (e) {
      err = e;
      if (e.retry === false) break;
    }
  }
  throw new Error(`${err.message} Try again, or use a shorter resume or job description.`);
}

// Each prompt is small on purpose so every reply stays well within the output limit.
const CORE_RULES = `Extract from the candidate's resumes and notes. If sources conflict, newer information wins. Never invent facts. Return ONLY compact JSON, no prose.`;

const CORE_A_SYS = `${CORE_RULES}
{"name":"","email":"","phone":"","location":"","links":[],"headline":"","summary":"","personal":{"dob":"","nationality":"","maritalStatus":"","workAuth":""},"skills":[],"languages":[],"extras":[],"newDetails":[]}
Max 20 skills. "extras" are interests or other short items (max 5). "newDetails" are short strings for items that appear only in typed notes or in newer documents and not in the oldest resume; empty if there is a single source and no notes.`;

const CORE_B_SYS = `${CORE_RULES}
{"roles":[{"title":"","company":"","location":"","start":"","end":""}]}
Reverse-chronological, max 8 roles, no bullets or descriptions.`;

const CORE_C_SYS = `${CORE_RULES}
{"education":[{"degree":"","school":"","location":"","year":"","details":""}],"certifications":[],"projects":[{"name":"","description":""}]}
Max 4 projects, descriptions under 25 words. "details" under 15 words.`;

const BULLETS_SYS = `You write tailored resume bullets. For each role given (matched by idx), use ONLY facts about that role in the candidate's documents or notes. 3 to 5 bullets for idx 0 and 1, 2 to 3 for older roles. Each bullet under 25 words, starts with a strong action verb, quantified only where the source has numbers, and includes job-description keywords only where truthful. Follow the country norms for spelling and document language. Return ONLY JSON: {"roles":[{"idx":0,"bullets":[]}]}`;

const META_SYS = `You are an expert resume writer tailoring a resume to a job description and a country's norms. Use ONLY facts from the profile; never invent. Return ONLY compact JSON:
{"headline":"","summary":"","skills":[{"group":"","items":[]}],"personal":[{"label":"","value":""}],"headings":{"summary":"","skills":"","experience":"","education":"","certifications":"","projects":"","languages":"","extras":""},"footer":""}
"summary" is max 60 words, written for this job and country style. "skills": max 3 groups of up to 8 items, ordered by relevance to the job. "personal" only if the norms allow it and the profile has the values, else []. "headings" are section titles in the document language. "footer" only for country conventions (signature/date line, declaration, consent statement), else "".`;

const ANALYSIS_SYS = `Compare a finished resume to a job description. Return ONLY compact JSON:
{"matchedKeywords":[],"missingKeywords":[],"newDetailsUsed":[],"suggestions":[]}
"matchedKeywords": up to 12 important job keywords the resume covers. "missingKeywords": up to 8 important job keywords the candidate cannot truthfully claim. "newDetailsUsed": the given new details that appear in the resume. "suggestions": max 3 short tips.`;

const TRANSLATE_SYS = (lang) => `Translate every string value in the JSON into ${lang}. Keep keys, structure, proper nouns, school and company names unchanged. Return ONLY the JSON.`;

const LETTER_SYS = `You write a tailored cover letter following a country's norms. Use ONLY facts given about the candidate; never invent achievements. Reference the company and role from the job description, connect 2 or 3 of the strongest relevant achievements to the role's needs, and do not repeat the resume line by line. Respect the country's tone, salutation, closing and length, and keep the total under 300 words. Return ONLY compact JSON:
{"recipient":["name or title","company","city"],"subject":"","salutation":"","paragraphs":[],"closing":"","signoff":"","enclosure":""}
"enclosure" is only for conventions like 'Enclosure: CV', else "". "signoff" is the candidate's name.`;

/* ------------------------------------------------------------------ */
/*  HTML builders                                                      */
/* ------------------------------------------------------------------ */
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const ul = (items) =>
  items && items.filter(Boolean).length ? `<ul>${items.filter(Boolean).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";

function fmtDate(n, lang) {
  const loc = lang === "local" && n.localLang ? n.localLocale : n.enLocale;
  const o = n.dateNumeric
    ? { day: "2-digit", month: "2-digit", year: "numeric" }
    : { day: "numeric", month: "long", year: "numeric" };
  try {
    return new Date().toLocaleDateString(loc, o);
  } catch {
    return new Date().toLocaleDateString("en-GB", o);
  }
}

function resumeHTML(r, n, photo) {
  const h = r.headings || {};
  const c = r.contact || {};
  const contact = [c.location, c.phone, c.email, ...(c.links || [])].filter(Boolean).map(esc).join(" | ");
  const personal = (r.personal || []).filter((p) => p && p.value).map((p) => `${esc(p.label)}: ${esc(p.value)}`).join(" | ");
  const showPhoto = photo && n.photo !== "no";

  const header = `<div class="head"><div>
    <h1>${esc(r.name)}</h1>
    ${r.headline ? `<div class="headline">${esc(r.headline)}</div>` : ""}
    <div class="contact">${contact}</div>
    ${personal ? `<div class="contact">${personal}</div>` : ""}
  </div>${showPhoto ? `<img class="photo" src="${photo}" alt="Applicant photo"/>` : ""}</div>`;

  const entry = (when, titleHTML, body) =>
    n.tabular
      ? `<div class="entry"><div class="when">${esc(when)}</div><div>${titleHTML}${body}</div></div>`
      : `<div class="entry"><div class="row"><div>${titleHTML}</div><div class="when">${esc(when)}</div></div>${body}</div>`;

  const parts = {
    summary: () => (r.summary ? `<p>${esc(r.summary)}</p>` : ""),
    skills: () =>
      (r.skills || [])
        .map((s) => `<div>${s.group ? `<b>${esc(s.group)}:</b> ` : ""}${esc((s.items || []).join(", "))}</div>`)
        .join(""),
    experience: () =>
      (r.experience || [])
        .map((e) =>
          entry(
            [e.start, e.end].filter(Boolean).join(" – "),
            `<b>${esc(e.title)}</b>${e.company ? `, ${esc(e.company)}` : ""}${e.location ? `, ${esc(e.location)}` : ""}`,
            ul(e.bullets)
          )
        )
        .join(""),
    education: () =>
      (r.education || [])
        .map((e) =>
          entry(
            e.year || "",
            `<b>${esc(e.degree)}</b>${e.school ? `, ${esc(e.school)}` : ""}${e.location ? `, ${esc(e.location)}` : ""}`,
            e.details ? `<div>${esc(e.details)}</div>` : ""
          )
        )
        .join(""),
    certifications: () => ul(r.certifications),
    projects: () =>
      (r.projects || [])
        .map((p) => `<div class="entry"><b>${esc(p.name)}</b>${p.description ? `: ${esc(p.description)}` : ""}</div>`)
        .join(""),
    languages: () => ((r.languages || []).length ? `<div>${esc(r.languages.join(", "))}</div>` : ""),
    extras: () => ul(r.extras),
  };

  const body = n.order
    .map((k) => {
      const inner = parts[k] ? parts[k]() : "";
      return inner ? `<h2>${esc(h[k] || k)}</h2>${inner}` : "";
    })
    .join("");

  return header + body + (r.footer ? `<p class="footer">${esc(r.footer)}</p>` : "");
}

function letterHTML(l, p, n, lang) {
  const sender = [p.location, p.phone, p.email].filter(Boolean).map(esc).join("<br/>");
  return `<div class="letter">
    <div class="sender"><b>${esc(p.name)}</b><br/>${sender}</div>
    <p>${esc(fmtDate(n, lang))}</p>
    <p>${(l.recipient || []).filter(Boolean).map(esc).join("<br/>")}</p>
    ${l.subject ? `<p><b>${esc(l.subject)}</b></p>` : ""}
    <p>${esc(l.salutation)}</p>
    ${(l.paragraphs || []).map((x) => `<p>${esc(x)}</p>`).join("")}
    <p>${esc(l.closing)}<br/><br/>${esc(l.signoff || p.name)}</p>
    ${l.enclosure ? `<p class="enc">${esc(l.enclosure)}</p>` : ""}
  </div>`;
}

const DOC_CSS = `
.doc{font-family:Calibri,Arial,Helvetica,sans-serif;font-size:10.5pt;line-height:1.4;color:#111}
.doc h1{font-size:21pt;line-height:1.15;margin:0;font-weight:700}
.doc .headline{font-size:11.5pt;color:#333;margin:2px 0 4px}
.doc .contact{font-size:9.5pt;color:#333}
.doc .head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
.doc .photo{width:92px;height:118px;object-fit:cover}
.doc h2{font-size:11pt;font-weight:700;border-bottom:1px solid #222;margin:14px 0 6px;padding-bottom:2px}
.doc .row{display:flex;justify-content:space-between;gap:12px}
.doc .when{white-space:nowrap;color:#333}
.doc .entry{margin-bottom:6px}
.doc.tab .entry{display:grid;grid-template-columns:118px 1fr;gap:12px}
.doc.tab .when{white-space:normal}
.doc ul{margin:3px 0 6px 18px;padding:0}
.doc li{margin:1px 0}
.doc p{margin:0 0 8px}
.doc .footer{margin-top:18px}
.doc .letter p{margin:0 0 11px}
.doc .letter .sender{margin-bottom:14px}
`;

/* ------------------------------------------------------------------ */
/*  File helpers                                                       */
/* ------------------------------------------------------------------ */
const toB64 = (f) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error(`Could not read ${f.name}`));
    r.readAsDataURL(f);
  });

const toDataURL = (f) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("Could not read the photo"));
    r.readAsDataURL(f);
  });

async function fileToBlock(f) {
  const name = f.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    return { type: "document", source: { type: "base64", media_type: "application/pdf", data: await toB64(f) } };
  }
  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() });
    return { type: "text", text: `--- File: ${f.name} ---\n${value}` };
  }
  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return { type: "text", text: `--- File: ${f.name} ---\n${await f.text()}` };
  }
  throw new Error(`${f.name}: use PDF, DOCX or TXT. Older .doc files are not supported.`);
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const t = document.createElement("textarea");
  t.value = text;
  document.body.appendChild(t);
  t.select();
  document.execCommand("copy");
  document.body.removeChild(t);
  return Promise.resolve();
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
const STEPS = ["Reading your documents", "Tailoring experience to the job", "Writing summary and skills", "Writing cover letter"];

export default function App() {
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [jd, setJd] = useState("");
  const [country, setCountry] = useState("US");
  const [lang, setLang] = useState("en");
  const [photo, setPhoto] = useState("");
  const [status, setStatus] = useState("idle");
  const [step, setStep] = useState(0);
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("resume");
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState(false);
  const resumeRef = useRef(null);
  const letterRef = useRef(null);
  const fileInput = useRef(null);

  const n = NORMS[country];
  const canGo = jd.trim().length > 40 && (files.length > 0 || notes.trim().length > 40) && status !== "working";

  const addFiles = (list) => {
    const next = [...files];
    Array.from(list).forEach((f) => {
      if (f.size > 10 * 1024 * 1024) {
        setError(`${f.name} is over 10 MB.`);
        return;
      }
      if (!next.find((x) => x.name === f.name && x.size === f.size)) next.push(f);
    });
    setFiles(next);
  };

  const onPhoto = async (e) => {
    const f = e.target.files[0];
    if (f) setPhoto(await toDataURL(f));
  };

  async function generate() {
    setStatus("working");
    setError("");
    setStep(0);
    setDetail("");
    const nn = NORMS[country];
    const lg = nn.localLang ? lang : "en";
    const used = { n: nn, country, lang: lg, photo };
    try {
      const src = [];
      for (const f of files) src.push(await fileToBlock(f));
      const notesText = notes.trim() ? `New details typed by the candidate:\n${notes.trim()}\n\n` : "";
      const norm = normsText(nn, lg);
      const jdText = jd.trim().slice(0, 6000);

      // 1. Merged profile (no bullets, keeps the reply small)
      const extract = (sys) => askJSON(sys, [...src, { type: "text", text: `${notesText}Extract now.` }]);
      const [ca, cb, cc] = await Promise.all([extract(CORE_A_SYS), extract(CORE_B_SYS), extract(CORE_C_SYS)]);
      const core = { ...ca, ...cb, ...cc };
      const roles = (core.roles || []).slice(0, 8);

      // 2. Tailored bullets, two roles per call, two calls at a time
      setStep(1);
      const chunks = [];
      for (let i = 0; i < roles.length; i += 2) chunks.push(roles.slice(i, i + 2).map((r, j) => ({ idx: i + j, ...r })));
      const bullets = {};
      let done = 0;
      const queue = [...chunks];
      const worker = async () => {
        while (queue.length) {
          const c = queue.shift();
          const out = await askJSON(BULLETS_SYS, [
            ...src,
            { type: "text", text: `${notesText}COUNTRY NORMS\n${norm}\n\nJOB DESCRIPTION\n${jdText}\n\nROLES TO WRITE\n${JSON.stringify(c)}` },
          ]);
          (out.roles || []).forEach((r) => {
            bullets[r.idx] = r.bullets || [];
          });
          done += c.length;
          setDetail(`${done} of ${roles.length} roles`);
        }
      };
      setDetail(`0 of ${roles.length} roles`);
      await Promise.all([worker(), worker()]);
      const experience = roles.map((r, i) => ({ ...r, bullets: bullets[i] || [] }));

      // 3. Summary, skills, headings, keyword analysis
      setStep(2);
      setDetail("");
      const brief = {
        headline: core.headline,
        summary: core.summary,
        personal: core.personal,
        skills: core.skills,
        roles: experience.map((r) => ({ title: r.title, company: r.company, bullets: r.bullets.slice(0, 2) })),
        education: (core.education || []).map((e) => ({ degree: e.degree, school: e.school })),
        newDetails: core.newDetails,
      };
      const meta = await askJSON(META_SYS, `COUNTRY NORMS\n${norm}\n\nJOB DESCRIPTION\n${jdText}\n\nPROFILE\n${JSON.stringify(brief)}`);
      const analysis = await askJSON(
        ANALYSIS_SYS,
        `JOB DESCRIPTION\n${jdText}\n\nRESUME\n${JSON.stringify({
          summary: meta.summary,
          skills: meta.skills,
          bullets: experience.map((r) => r.bullets.slice(0, 3)),
        })}\n\nNEW DETAILS\n${JSON.stringify(core.newDetails || [])}`
      );

      let rest = {
        education: core.education || [],
        certifications: core.certifications || [],
        projects: core.projects || [],
        languages: core.languages || [],
        extras: core.extras || [],
      };
      const hasRest = Object.values(rest).some((v) => v.length);
      if (lg === "local" && hasRest) rest = { ...rest, ...(await askJSON(TRANSLATE_SYS(nn.localLang), JSON.stringify(rest))) };

      // 4. Cover letter
      setStep(3);
      const who = {
        name: core.name,
        location: core.location,
        headline: meta.headline || core.headline,
        summary: meta.summary,
        topAchievements: experience.slice(0, 3).map((r) => ({ title: r.title, company: r.company, bullets: r.bullets.slice(0, 3) })),
        skills: (meta.skills || []).flatMap((g) => g.items || []).slice(0, 12),
        workAuth: core.personal?.workAuth,
      };
      const letter = await askJSON(LETTER_SYS, `COUNTRY NORMS\n${norm}\n\nJOB DESCRIPTION\n${jdText}\n\nCANDIDATE\n${JSON.stringify(who)}`);

      const resume = {
        name: core.name,
        headline: meta.headline || core.headline,
        contact: { email: core.email, phone: core.phone, location: core.location, links: core.links || [] },
        personal: meta.personal || [],
        headings: meta.headings || {},
        summary: meta.summary,
        skills: meta.skills || [],
        experience,
        ...rest,
        footer: meta.footer,
        analysis,
      };

      setResult({ profile: core, resume, letter, ...used });
      setTab("resume");
      setStatus("done");
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setStatus("error");
    } finally {
      setDetail("");
    }
  }

  const rHTML = useMemo(() => (result ? resumeHTML(result.resume, result.n, result.photo) : ""), [result]);
  const lHTML = useMemo(
    () => (result ? letterHTML(result.letter, { ...result.profile, name: result.resume.name || result.profile.name }, result.n, result.lang) : ""),
    [result]
  );

  const activeRef = () => (tab === "resume" ? resumeRef : letterRef);

  const doCopy = async () => {
    await copyText(activeRef().current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const doDownload = () => {
    const html = activeRef().current.innerHTML;
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>@page{size:${result.n.paper === "Letter" ? "8.5in 11in" : "A4"};margin:18mm}${DOC_CSS}</style></head><body><div class="doc ${result.n.tabular ? "tab" : ""}">${html}</div></body></html>`;
    const blob = new Blob(["\ufeff", doc], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const who = (result.resume.name || "applicant").replace(/[^\w]+/g, "_");
    a.href = url;
    a.download = `${who}_${tab === "resume" ? "Resume" : "Cover_Letter"}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doPrint = () => {
    try {
      window.print();
    } catch {
      setError("Printing is blocked in this preview. Download the .doc and save it as PDF from Word.");
    }
  };

  const an = result?.resume?.analysis || {};
  const matched = an.matchedKeywords || [];
  const missing = an.missingKeywords || [];
  const newUsed = [...new Set([...(an.newDetailsUsed || []), ...(result?.profile?.newDetails || [])])];

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&display=swap');
        .app{--ink:#101B2D;--muted:#586578;--bg:#E4EAF1;--panel:#F7F9FB;--line:#C7D0DC;--cobalt:#1F4FD8;--mark:#FFD84D;
          font-family:'Schibsted Grotesk',system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;font-size:15px;line-height:1.5}
        .app *{box-sizing:border-box}
        .top{padding:22px 28px 6px;display:flex;align-items:baseline;gap:16px;flex-wrap:wrap}
        .top h1{font-size:26px;margin:0;font-weight:700;letter-spacing:-.02em}
        .top p{margin:0;color:var(--muted)}
        .wrap{display:grid;grid-template-columns:minmax(330px,430px) 1fr;gap:22px;padding:16px 28px 40px;align-items:start}
        @media (max-width:900px){.wrap{grid-template-columns:1fr;padding:12px 14px 32px}.top{padding:18px 14px 4px}}
        .panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px;display:flex;flex-direction:column;gap:18px}
        .field label,.field .lbl{display:block;font-weight:600;margin-bottom:6px}
        .hint{color:var(--muted);font-size:13px;margin:-2px 0 8px}
        select,textarea{width:100%;font:inherit;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:7px;padding:9px 11px}
        textarea{resize:vertical;min-height:90px}
        select:focus-visible,textarea:focus-visible,button:focus-visible,.drop:focus-visible,a:focus-visible{outline:3px solid var(--cobalt);outline-offset:2px}
        .drop{border:1.5px dashed #8d9bb0;border-radius:8px;padding:16px;text-align:center;background:#fff;cursor:pointer;color:var(--muted)}
        .drop.on{border-color:var(--cobalt);background:#EEF3FF}
        .drop svg{display:block;margin:0 auto 6px;color:var(--cobalt)}
        .files{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
        .files li{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:7px;padding:6px 8px;font-size:14px}
        .files li span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .icon{background:none;border:0;cursor:pointer;color:var(--muted);padding:2px;display:inline-flex;border-radius:4px}
        .norms{background:#fff;border:1px solid var(--line);border-radius:8px;padding:12px 14px}
        .norms h3{margin:0 0 8px;font-size:15px}
        .norms dl{margin:0;display:grid;grid-template-columns:104px 1fr;gap:6px 10px;font-size:13.5px}
        .norms dt{color:var(--muted)}
        .norms dd{margin:0}
        .norms details{margin-top:8px;font-size:13.5px}
        .norms summary{cursor:pointer;color:var(--cobalt);font-weight:600}
        .norms ul{margin:6px 0 0 18px;padding:0}
        .go{font:inherit;font-weight:600;background:var(--cobalt);color:#fff;border:0;border-radius:8px;padding:12px 16px;cursor:pointer}
        .go:disabled{background:#9AA8C4;cursor:not-allowed}
        .err{background:#FDECEC;border:1px solid #E7A5A5;color:#7A1F1F;border-radius:8px;padding:10px 12px;font-size:14px}
        .steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;font-size:14px;color:var(--muted)}
        .steps li{display:flex;align-items:center;gap:8px}
        .steps li.now{color:var(--ink);font-weight:600}
        .dot{width:10px;height:10px;border-radius:50%;background:var(--line);flex:none}
        .now .dot{background:var(--cobalt);animation:pulse 1s ease-in-out infinite}
        .past .dot{background:#2E8B57}
        @keyframes pulse{50%{transform:scale(1.5);opacity:.5}}
        @media (prefers-reduced-motion:reduce){.now .dot{animation:none}}
        .stage{display:flex;flex-direction:column;gap:14px;min-width:0}
        .bar{position:sticky;top:0;z-index:2;background:var(--bg);padding:2px 0 8px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
        .tabs{display:flex;gap:4px;background:#d3dbe6;border-radius:9px;padding:3px}
        .tabs button{font:inherit;font-weight:600;border:0;background:none;padding:7px 14px;border-radius:7px;cursor:pointer;color:var(--muted)}
        .tabs button[aria-selected=true]{background:#fff;color:var(--ink)}
        .tools{margin-left:auto;display:flex;gap:8px}
        .btn{font:inherit;font-weight:600;display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:7px 12px;cursor:pointer}
        .btn.solid{background:var(--ink);color:#fff;border-color:var(--ink)}
        .paper{background:#fff;margin:0 auto;width:100%;padding:clamp(18px,5vw,56px);box-shadow:0 1px 0 #fff inset,0 2px 0 #cfd7e2,0 10px 0 -4px #d6dde8,0 18px 30px -12px rgba(16,27,45,.28);min-height:420px}
        .paper.a4{max-width:794px}.paper.letter{max-width:816px}
        .paper [contenteditable]:focus{outline:none}
        .paper .doc{outline:none}
        .hide{display:none}
        .empty{background:var(--panel);border:1px dashed #8d9bb0;border-radius:10px;padding:48px 24px;text-align:center;color:var(--muted)}
        .empty b{display:block;color:var(--ink);font-size:17px;margin-bottom:4px}
        .review{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px 18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
        .review h3{margin:0 0 8px;font-size:15px}
        .chips{display:flex;flex-wrap:wrap;gap:6px}
        .chip{font-size:13px;padding:2px 8px;border-radius:5px}
        .chip.hit{background:var(--mark)}
        .chip.miss{border:1px solid #8d9bb0;background:#fff}
        .review ul{margin:0 0 0 18px;padding:0;font-size:14px}
        .edit-note{font-size:13px;color:var(--muted)}
        @media print{
          body *{visibility:hidden}
          .paper,.paper *{visibility:visible}
          .paper{position:absolute;left:0;top:0;width:100%;max-width:none;box-shadow:none;padding:0}
          .hide{display:none!important}
        }
        ${DOC_CSS}
      `}</style>

      <header className="top">
        <h1>Tailor</h1>
        <p>Resume and cover letter, fitted to the job and the country.</p>
      </header>

      <div className="wrap">
        {/* ---------------- Inputs ---------------- */}
        <section className="panel" aria-label="Inputs">
          <div className="field">
            <span className="lbl">Your resume or new profile details</span>
            <p className="hint">PDF, DOCX or TXT. Add several files to merge old and new.</p>
            <div
              className={`drop ${drag ? "on" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => fileInput.current.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                addFiles(e.dataTransfer.files);
              }}
            >
              <Upload size={22} />
              Drop files here or click to browse
            </div>
            <input ref={fileInput} type="file" multiple accept=".pdf,.docx,.txt,.md" hidden onChange={(e) => addFiles(e.target.files)} />
            {files.length > 0 && (
              <ul className="files">
                {files.map((f) => (
                  <li key={f.name + f.size}>
                    <FileText size={16} />
                    <span>{f.name}</span>
                    <button className="icon" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((x) => x !== f))}>
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="field">
            <label htmlFor="notes">What is new since your last resume</label>
            <p className="hint">Optional if you uploaded a file. New role, certification, project, numbers.</p>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Promoted to Senior Analyst in March 2026; led migration that cut reporting time by 40%..." />
          </div>

          <div className="field">
            <label htmlFor="jd">Job description</label>
            <textarea id="jd" style={{ minHeight: 150 }} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job posting here" />
          </div>

          <div className="field">
            <label htmlFor="country">Country of application</label>
            <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
              {Object.entries(NORMS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="norms" aria-live="polite">
            <h3>What {n.label} expects</h3>
            <dl>
              <dt>Document</dt>
              <dd>{n.doc}, {n.paper} paper</dd>
              <dt>Length</dt>
              <dd>{n.pages}</dd>
              <dt>Photo</dt>
              <dd>{n.photoNote}</dd>
              <dt>Personal details</dt>
              <dd>{n.personalNote}</dd>
              <dt>Spelling</dt>
              <dd>{n.spelling}</dd>
              <dt>Cover letter</dt>
              <dd>{n.letter}</dd>
            </dl>
            <details>
              <summary>More tips</summary>
              <ul>
                {n.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </details>
          </div>

          {n.localLang && (
            <div className="field">
              <label htmlFor="lang">Write documents in</label>
              <select id="lang" value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="local">{n.localLang}</option>
              </select>
            </div>
          )}

          {n.photo !== "no" && (
            <div className="field">
              <span className="lbl">Photo</span>
              <p className="hint">{n.photoNote}. Optional, shown only on the resume.</p>
              <label className="btn" style={{ width: "fit-content", cursor: "pointer" }}>
                <Camera size={16} /> {photo ? "Replace photo" : "Add photo"}
                <input type="file" accept="image/*" hidden onChange={onPhoto} />
              </label>
              {photo && (
                <button className="icon" style={{ marginLeft: 8 }} onClick={() => setPhoto("")} aria-label="Remove photo">
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          <button className="go" disabled={!canGo} onClick={generate}>
            {status === "working" ? "Working..." : "Generate resume and cover letter"}
          </button>
          {!canGo && status !== "working" && (
            <p className="hint" style={{ margin: 0 }}>
              Needs a job description and either a file or some profile details.
            </p>
          )}

          {status === "working" && (
            <ul className="steps" aria-live="polite">
              {STEPS.map((s, i) => (
                <li key={s} className={i === step ? "now" : i < step ? "past" : ""}>
                  <span className="dot" />
                  {s}
                  {i === step && detail ? ` (${detail})` : ""}
                </li>
              ))}
            </ul>
          )}
          {error && (
            <div className="err" role="alert">
              {error}
            </div>
          )}
        </section>

        {/* ---------------- Output ---------------- */}
        <section className="stage" aria-label="Output">
          {!result ? (
            <div className="empty">
              <b>Your documents appear here</b>
              Add your resume, paste the job description, pick a country, then generate. You can edit the text directly on the page.
            </div>
          ) : (
            <>
              <div className="bar">
                <div className="tabs" role="tablist">
                  <button role="tab" aria-selected={tab === "resume"} onClick={() => setTab("resume")}>
                    {result.n.doc.split(" ")[0] === "Resume" ? "Resume" : "CV"}
                  </button>
                  <button role="tab" aria-selected={tab === "letter"} onClick={() => setTab("letter")}>
                    Cover letter
                  </button>
                </div>
                <div className="tools">
                  <button className="btn" onClick={doCopy}>
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy text"}
                  </button>
                  <button className="btn" onClick={doPrint}>
                    <Printer size={16} /> Print or PDF
                  </button>
                  <button className="btn solid" onClick={doDownload}>
                    <Download size={16} /> Download .doc
                  </button>
                </div>
              </div>

              <div className={`paper ${result.n.paper === "Letter" ? "letter" : "a4"}`}>
                <div className={tab === "resume" ? "" : "hide"}>
                  <div
                    ref={resumeRef}
                    className={`doc ${result.n.tabular ? "tab" : ""}`}
                    contentEditable
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{ __html: rHTML }}
                  />
                </div>
                <div className={tab === "letter" ? "" : "hide"}>
                  <div
                    ref={letterRef}
                    className="doc"
                    contentEditable
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{ __html: lHTML }}
                  />
                </div>
              </div>
              <p className="edit-note">Click anywhere on the page to edit. Edits are included in copy and download.</p>

              <div className="review">
                <div>
                  <h3>
                    Job keywords covered ({matched.length} of {matched.length + missing.length})
                  </h3>
                  <div className="chips">
                    {matched.map((k) => (
                      <span key={k} className="chip hit">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                {missing.length > 0 && (
                  <div>
                    <h3>Not supported by your profile</h3>
                    <div className="chips">
                      {missing.map((k) => (
                        <span key={k} className="chip miss">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {newUsed.length > 0 && (
                  <div>
                    <h3>New details added</h3>
                    <ul>
                      {newUsed.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(an.suggestions || []).length > 0 && (
                  <div>
                    <h3>Suggestions</h3>
                    <ul>
                      {an.suggestions.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
