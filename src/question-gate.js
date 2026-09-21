const USER_DECISION_MATERIALITIES = new Set([
  "privacy",
  "cost",
  "destructive",
  "external_action",
  "core_meaning",
  "other"
]);

const TECHNICAL_JARGON = /\b(postgres(?:ql)?|sqlite|mysql|orm|ssr|csr|framework|database|schema migration|docker|kubernetes|npm|pnpm|yarn|node\.js|vercel|cloudflare|supabase|firebase|api key|environment variable|env var|oauth|jwt)\b/iu;

export function isHumanAnswerableQuestion(question) {
  return typeof question === "string"
    && question.trim().length > 0
    && !TECHNICAL_JARGON.test(question);
}

export function evaluateQuestionGate({
  materiality = "other",
  canInferSafely = false,
  reversibleDefaultExists = false,
  materiallyChangesResult = false,
  userHasContextToAnswer = true,
  consentRequired = false,
  implementationDetail = false,
  requestedTechnicalControl = false
} = {}) {
  if (implementationDetail && !requestedTechnicalControl) {
    return { ask: false, reason: "implementation_detail" };
  }

  if (consentRequired) {
    return { ask: true, reason: "consent_required" };
  }

  if (!materiallyChangesResult) {
    return { ask: false, reason: "not_material" };
  }

  if (canInferSafely && reversibleDefaultExists) {
    return { ask: false, reason: "safe_reversible_default" };
  }

  if (!userHasContextToAnswer) {
    return { ask: false, reason: "system_should_resolve_first" };
  }

  if (!USER_DECISION_MATERIALITIES.has(materiality) && !requestedTechnicalControl) {
    return { ask: false, reason: "implementation_detail" };
  }

  return { ask: true, reason: "material_unresolved_decision" };
}

export function makeOpenQuestion(
  question,
  reason,
  materiality,
  {
    choices = [],
    allowChooseForMe = false,
    defaultChoice = null
  } = {}
) {
  if (!USER_DECISION_MATERIALITIES.has(materiality)) {
    throw new TypeError(`Unsupported user-facing materiality: ${materiality}`);
  }

  if (!isHumanAnswerableQuestion(question)) {
    throw new TypeError("User-facing questions must be phrased without implementation jargon.");
  }

  if (allowChooseForMe && defaultChoice === null) {
    throw new TypeError("Questions that allow 'choose for me' must define a safe default choice.");
  }

  if (defaultChoice !== null && choices.length > 0 && !choices.includes(defaultChoice)) {
    throw new TypeError("defaultChoice must be one of choices.");
  }

  return {
    question,
    reason,
    materiality,
    choices,
    allow_choose_for_me: allowChooseForMe,
    default_choice: defaultChoice
  };
}

export function resolveQuestionCandidate(candidate) {
  const decision = evaluateQuestionGate(candidate);

  if (!decision.ask) {
    return {
      id: candidate.id ?? null,
      ask: false,
      reason: decision.reason,
      question: null,
      materiality: candidate.materiality ?? "other",
      choices: [],
      allow_choose_for_me: false,
      default_choice: null,
      resolution: candidate.safeDefault ?? null
    };
  }

  const choices = candidate.choices ?? [];
  const safeDefault = candidate.safeDefault ?? null;
  const allowChooseForMe = safeDefault !== null;

  const openQuestion = makeOpenQuestion(
    candidate.question,
    candidate.reason,
    candidate.materiality ?? "other",
    {
      choices,
      allowChooseForMe,
      defaultChoice: safeDefault
    }
  );

  return {
    id: candidate.id ?? null,
    ask: true,
    reason: decision.reason,
    ...openQuestion,
    resolution: null
  };
}
