import { assertValidIntent } from "./schema-validator.js";
import { evaluateQuestionGate, makeOpenQuestion } from "./question-gate.js";

const PATTERNS = {
  partner: /\b(partner|spouse|wife|husband|girlfriend|boyfriend)\b|パートナー|夫婦|妻|夫|恋人/iu,
  family: /\bfamily\b|家族/iu,
  organization: /\b(team|coworkers?|colleagues?|company|organization|staff)\b|チーム|同僚|会社|組織|スタッフ/iu,
  publicAudience: /\b(public|everyone|anyone)\b|公開|誰でも|みんな/iu,
  personalAudience: /\b(only me|just me|for myself|personal)\b|自分だけ|自分用|個人用/iu,
  linkAccess: /\b(anyone with (the )?link|link access|shareable link)\b|リンクを知っている人|リンク共有/iu,
  inviteAccess: /\b(invite|invited|invitation|members? only)\b|招待|メンバー限定/iu,
  privateAccess: /\b(private|only me|just me)\b|非公開|自分だけ/iu,
  mobile: /\b(mobile|phone|smartphone|iphone|android)\b|スマホ|携帯|モバイル/iu,
  desktop: /\b(desktop|pc|laptop)\b|デスクトップ|パソコン|PC/iu,
  save: /\b(save|store|keep|remember|track|record)\b|保存|残す|記録|管理|追跡/iu,
  list: /\b(list|collection|catalog)\b|一覧|リスト/iu,
  share: /\b(share|shared|sharing|collaborate|together)\b|共有|一緒|共同/iu,
  vote: /\b(vote|voting|poll)\b|投票/iu,
  visit: /\b(visit|visited|travel|trip|go to|want to go)\b|行きたい|訪問|旅行|行った/iu
};

const ENTITY_PATTERNS = [
  { name: "place", regex: /\b(places?|restaurants?|cafes?|destinations?|spots?)\b|場所|行き先|レストラン|カフェ|店/iu },
  { name: "task", regex: /\b(tasks?|todos?|to-dos?)\b|タスク|やること/iu },
  { name: "expense", regex: /\b(expenses?|spending|costs?)\b|支出|出費|家計/iu },
  { name: "recipe", regex: /\b(recipes?)\b|レシピ/iu },
  { name: "habit", regex: /\b(habits?)\b|習慣/iu },
  { name: "note", regex: /\b(notes?)\b|メモ|ノート/iu },
  { name: "idea", regex: /\b(ideas?)\b|アイデア|案/iu },
  { name: "photo", regex: /\b(photos?|pictures?|images?)\b|写真|画像/iu }
];

function evidenceFor(text, regex) {
  const match = text.match(regex);
  return match?.[0] ?? null;
}

function addFact(facts, field, value, evidence) {
  if (!evidence) return;
  facts.push({ field, value, evidence });
}

function addAssumption(assumptions, field, value, reason, reversible = true) {
  assumptions.push({ field, value, reason, reversible });
}

function detectAudience(text, facts, assumptions) {
  const partnerEvidence = evidenceFor(text, PATTERNS.partner);
  if (partnerEvidence) {
    addFact(facts, "audience.kind", "small_private_group", partnerEvidence);
    addFact(facts, "audience.size_hint", 2, partnerEvidence);
    return { kind: "small_private_group", size_hint: 2, explicit: true };
  }

  const familyEvidence = evidenceFor(text, PATTERNS.family);
  if (familyEvidence) {
    addFact(facts, "audience.kind", "small_private_group", familyEvidence);
    return { kind: "small_private_group", size_hint: null, explicit: true };
  }

  const organizationEvidence = evidenceFor(text, PATTERNS.organization);
  if (organizationEvidence) {
    addFact(facts, "audience.kind", "organization", organizationEvidence);
    return { kind: "organization", size_hint: null, explicit: true };
  }

  const publicEvidence = evidenceFor(text, PATTERNS.publicAudience);
  if (publicEvidence) {
    addFact(facts, "audience.kind", "public", publicEvidence);
    return { kind: "public", size_hint: null, explicit: true };
  }

  const personalEvidence = evidenceFor(text, PATTERNS.personalAudience);
  if (personalEvidence) {
    addFact(facts, "audience.kind", "single_user", personalEvidence);
    return { kind: "single_user", size_hint: 1, explicit: true };
  }

  const collaborationSignal = PATTERNS.share.test(text);
  if (!collaborationSignal) {
    addAssumption(
      assumptions,
      "audience.kind",
      "single_user",
      "No collaboration or public audience was stated, so a single-user default avoids unnecessary access complexity.",
      true
    );
    return { kind: "single_user", size_hint: 1, explicit: false };
  }

  return { kind: "unknown", size_hint: null, explicit: false };
}

function detectEntity(text, facts) {
  for (const candidate of ENTITY_PATTERNS) {
    const evidence = evidenceFor(text, candidate.regex);
    if (evidence) {
      addFact(facts, "primary_entity", candidate.name, evidence);
      return candidate.name;
    }
  }
  return "item";
}

function inferAppType(text, audience, entity, facts, assumptions) {
  const voteEvidence = evidenceFor(text, PATTERNS.vote);
  if (voteEvidence) {
    addFact(facts, "app_type", "voting_list", voteEvidence);
    return "voting_list";
  }

  const listLike = PATTERNS.save.test(text) || PATTERNS.list.test(text) || entity !== "item";
  if (listLike && (audience.kind === "small_private_group" || audience.kind === "organization")) {
    addAssumption(
      assumptions,
      "app_type",
      "shared_list",
      "The request describes persistent items used by more than one person, which maps cleanly to a shared-list product shape.",
      true
    );
    return "shared_list";
  }

  if (listLike) {
    addAssumption(
      assumptions,
      "app_type",
      "personal_list",
      "The request describes persistent items and no explicit multi-user workflow, so a personal list is the smallest useful product shape.",
      true
    );
    return "personal_list";
  }

  addAssumption(
    assumptions,
    "app_type",
    "simple_app",
    "No stronger product pattern was explicit, so the compiler keeps the shape intentionally generic.",
    true
  );
  return "simple_app";
}

function inferActions(text, entity, assumptions) {
  const actions = ["add", "edit"];

  if (PATTERNS.visit.test(text) && entity === "place") {
    actions.push("mark_visited");
  } else if (entity === "task") {
    actions.push("mark_complete");
  }

  if (PATTERNS.vote.test(text)) {
    actions.push("vote");
  }

  actions.push("delete");

  addAssumption(
    assumptions,
    "actions",
    actions,
    "These are the smallest reversible lifecycle actions that make the inferred product shape usable.",
    true
  );

  return actions;
}

function inferDevicePriority(text, entity, facts, assumptions) {
  const mobileEvidence = evidenceFor(text, PATTERNS.mobile);
  if (mobileEvidence) {
    addFact(facts, "device_priority", "mobile", mobileEvidence);
    return "mobile";
  }

  const desktopEvidence = evidenceFor(text, PATTERNS.desktop);
  if (desktopEvidence) {
    addFact(facts, "device_priority", "desktop", desktopEvidence);
    return "desktop";
  }

  const value = entity === "place" ? "mobile" : "responsive";
  addAssumption(
    assumptions,
    "device_priority",
    value,
    entity === "place"
      ? "Place and travel lists are commonly used away from a desk, and mobile-first presentation is reversible."
      : "Responsive presentation is a safe reversible default when no device preference is stated.",
    true
  );
  return value;
}

function inferAccess(text, audience, facts, assumptions, openQuestions) {
  const linkEvidence = evidenceFor(text, PATTERNS.linkAccess);
  if (linkEvidence) {
    addFact(facts, "access.visibility", "link_access", linkEvidence);
    return { visibility: "link_access", auth_required: false };
  }

  const publicEvidence = evidenceFor(text, PATTERNS.publicAudience);
  if (publicEvidence) {
    addFact(facts, "access.visibility", "public", publicEvidence);
    return { visibility: "public", auth_required: false };
  }

  const inviteEvidence = evidenceFor(text, PATTERNS.inviteAccess);
  if (inviteEvidence) {
    addFact(facts, "access.visibility", "invite_only", inviteEvidence);
    return { visibility: "invite_only", auth_required: true };
  }

  const privateEvidence = evidenceFor(text, PATTERNS.privateAccess);
  if (privateEvidence) {
    addFact(facts, "access.visibility", "private", privateEvidence);
    return { visibility: "private", auth_required: true };
  }

  if (audience.kind === "small_private_group" || audience.kind === "organization") {
    const value = { visibility: "invite_only", auth_required: true };
    addAssumption(
      assumptions,
      "access",
      value,
      "A known small group is safest as invite-only by default. This preserves privacy and can be relaxed later.",
      true
    );
    return value;
  }

  if (audience.kind === "single_user") {
    const value = { visibility: "private", auth_required: true };
    addAssumption(
      assumptions,
      "access",
      value,
      "A single-user app is safest as private by default. This can be changed later.",
      true
    );
    return value;
  }

  const gate = evaluateQuestionGate({
    canInferSafely: false,
    reversibleDefaultExists: false,
    materiallyChangesResult: true,
    userHasContextToAnswer: true,
    consentRequired: false
  });

  if (gate.ask) {
    openQuestions.push(
      makeOpenQuestion(
        "Who should be able to use this: only people you invite, anyone with the link, or everyone?",
        "Access changes the privacy and sharing behavior of the product.",
        "privacy"
      )
    );
  }

  return { visibility: "unknown", auth_required: null };
}

function inferPersistence(text, appType, facts, assumptions) {
  const saveEvidence = evidenceFor(text, PATTERNS.save);
  if (saveEvidence) {
    addFact(facts, "persistence.required", true, saveEvidence);
    return {
      required: true,
      reason: "The request explicitly describes saving or retaining information across uses."
    };
  }

  if (appType === "shared_list" || appType === "personal_list" || appType === "voting_list") {
    addAssumption(
      assumptions,
      "persistence.required",
      true,
      "A list that disappears between sessions would not satisfy the inferred product shape.",
      true
    );
    return {
      required: true,
      reason: "The inferred list workflow needs information to remain available across sessions."
    };
  }

  addAssumption(
    assumptions,
    "persistence.required",
    false,
    "No durable information requirement was stated, so persistence is not assumed for the first product hypothesis.",
    true
  );
  return { required: false, reason: null };
}

function buildGoal(entity, audience, text) {
  if (entity === "place" && audience.kind === "small_private_group" && PATTERNS.visit.test(text)) {
    if (audience.size_hint === 2) {
      return "Keep a shared list of places two people want to visit.";
    }
    return "Keep a shared list of places the group wants to visit.";
  }

  const noun = entity === "item" ? "items" : `${entity}s`;
  if (audience.kind === "single_user") {
    return `Keep a simple personal collection of ${noun}.`;
  }
  if (audience.kind === "public") {
    return `Create a public app centered on ${noun}.`;
  }
  return `Create a simple app for working with ${noun}.`;
}

function compactAudience(audience) {
  return {
    kind: audience.kind,
    size_hint: audience.size_hint
  };
}

export function compileIntent(input) {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new TypeError("Intent input must be a non-empty string.");
  }

  const text = input.trim();
  const facts = [];
  const assumptions = [];
  const openQuestions = [];

  const audience = detectAudience(text, facts, assumptions);
  const primaryEntity = detectEntity(text, facts);
  const appType = inferAppType(text, audience, primaryEntity, facts, assumptions);
  const actions = inferActions(text, primaryEntity, assumptions);
  const devicePriority = inferDevicePriority(text, primaryEntity, facts, assumptions);
  const access = inferAccess(text, audience, facts, assumptions, openQuestions);
  const persistence = inferPersistence(text, appType, facts, assumptions);

  const intent = {
    goal: buildGoal(primaryEntity, audience, text),
    app_type: appType,
    audience: compactAudience(audience),
    primary_entity: primaryEntity,
    actions,
    device_priority: devicePriority,
    access,
    persistence,
    constraints: [],
    preferences: [],
    facts,
    assumptions,
    open_questions: openQuestions
  };

  return assertValidIntent(intent);
}
