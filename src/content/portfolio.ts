export interface Chapter {
  id: string;
  number: string;
  label: string;
  eyebrow: string;
  title: string;
  titleSecondary?: string;
  description?: string;
  align: "left" | "right";
}

export const chapters: Chapter[] = [
  {
    id: "signal",
    number: "00",
    label: "SIGNAL",
    eyebrow: "Munich / Germany",
    title: "NIKLAS",
    titleSecondary: "KOST",
    description: "COMPUTER SCIENCE / LMU MÜNCHEN",
    align: "left",
  },
  {
    id: "identity",
    number: "01",
    label: "IDENTITY",
    eyebrow: "C++ / SYSTEMS / SECURITY / SOFTWARE",
    title: "INFORMATION",
    titleSecondary: "UNDER GRAVITY",
    description:
      "I build software around systems, cybersecurity, and practical problem solving.",
    align: "right",
  },
  {
    id: "history",
    number: "02",
    label: "ORBITAL HISTORY",
    eyebrow: "SELECTED PROJECTS / GITHUB",
    title: "BUILD",
    titleSecondary: "WITHOUT NOISE",
    description:
      "C++ tools, CLI utilities, experiments, and systems-focused projects.",
    align: "left",
  },
  {
    id: "infrastructure",
    number: "03",
    label: "INFRASTRUCTURE",
    eyebrow: "C++ / GO / JS / HTML / SHELL",
    title: "COMPLEXITY",
    titleSecondary: "MADE TANGIBLE",
    description:
      "I like turning rough ideas into reliable tools, interfaces, and small systems.",
    align: "right",
  },
  {
    id: "algorithm",
    number: "04",
    label: "ALGORITHM FIELD",
    eyebrow: "PROBLEM SOLVING / C++ / COMPETITIVE PROGRAMMING",
    title: "ONE PATH",
    titleSecondary: "RESOLVES",
    description:
      "Focused on correctness, clarity, and efficient problem-solving.",
    align: "left",
  },
  {
    id: "education",
    number: "05",
    label: "EDUCATION",
    eyebrow: "LMU MÜNCHEN / COMPUTER SCIENCE",
    title: "COMPUTATION",
    titleSecondary: "× MATHEMATICS",
    description: "Studying computer science at LMU Munich.",
    align: "right",
  },
  {
    id: "human",
    number: "06",
    label: "HUMAN SIGNAL",
    eyebrow: "BEYOND THE SYSTEM",
    title: "DISTANT",
    titleSecondary: "SIGNALS",
    description: "Programming, systems, gaming, and practical experimentation.",
    align: "left",
  },
  {
    id: "horizon",
    number: "07",
    label: "HORIZON",
    eyebrow: "MUNICH, GERMANY",
    title: "THE NEXT",
    titleSecondary: "PROJECT",
    description: "Building tools, systems, and software with intent.",
    align: "right",
  },
];

export const careerAnchors = [
  {
    period: "2024 — CURRENT",
    role: "FTXUI-FlySim",
    detail:
      "C++ / TUI / SIMULATION / REAL-TIME FLIGHT MECHANICS / INTERACTIVE CONTROL",
  },
  {
    period: "2025",
    role: "SafeGuard",
    detail:
      "GO / CLI / FILE ENCRYPTION / CRYPTOGRAPHY LEARNING / CROSS-PLATFORM TOOLING",
  },
  {
    period: "2025",
    role: "LazyMouse",
    detail: "C++ / WINDOWS INPUT / XINPUT / HCI / KEYBOARD + MOUSE MAPPING",
  },
  {
    period: "2025",
    role: "Lamidi",
    detail: "HTML / JS / MIDI / LABY.NET / CLIENT-SIDE AUDIO + INTERACTION",
  },
];

export const infrastructureSignals = [
  "C++",
  "GO",
  "CLI",
  "SYSTEMS",
  "DEBUGGING",
  "TOOLS",
];

export const algorithmSignals = [
  "DATA STRUCTURES",
  "LINUX",
  "COMPETITIVE PROGRAMMING",
  "C++",
  "DEBUGGING",
  "Pentesting",
];

export const humanSignals = [
  { title: "PROGRAMMING", detail: "SYSTEMS / TOOLS / INTERFACES" },
  { title: "CYBERSECURITY", detail: "CRYPTOGRAPHY + SECURITY TOOLS" },
  { title: "SYSTEMS", detail: "C++ / CLI / INTERACTION" },
];

export const contact = {
  email: "niklasdioxid@gmail.com",
  linkedin: "https://www.linkedin.com/in/niklas-kost-6376063a7/",
};
