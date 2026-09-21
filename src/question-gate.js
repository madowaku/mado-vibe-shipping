export function evaluateQuestionGate({
  canInferSafely = false,
  reversibleDefaultExists = false,
  materiallyChangesResult = false,
  userHasContextToAnswer = true,
  consentRequired = false
} = {}) {
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

  return { ask: true, reason: "material_unresolved_decision" };
}

export function makeOpenQuestion(question, reason, materiality) {
  return { question, reason, materiality };
}
