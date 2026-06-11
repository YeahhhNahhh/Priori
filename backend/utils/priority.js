// Priority Engine Rules
// Returns priority level, insight, and base ETA

function calculatePriority(symptomsStr, conditionAnswersStr, durationStr) {
  let priority = "LOW";
  let insightContext = [];
  let baseEta = 60; // 60 mins default
  
  // Basic parsing
  let symptoms = [];
  try { symptoms = JSON.parse(symptomsStr); } catch(e) { symptoms = [symptomsStr]; }
  
  let conditions = {};
  try { conditions = JSON.parse(conditionAnswersStr); } catch(e) {}

  let answers = {};
  try { answers = JSON.parse(durationStr); } catch(e) {}
  
  const v = conditions.vitals || {};
  const rr = parseFloat(v.rr);
  const pulse = parseFloat(v.pulse);
  const spo2 = parseFloat(v.spo2);
  const crt = parseFloat(v.crt);

  // RED (Immediate - Life-threatening) Check
  let isRed = false;

  // 1. Vitals red flags
  if (!isNaN(rr) && (rr < 10 || rr > 30)) { isRed = true; insightContext.push("Critical RR"); }
  if (!isNaN(pulse) && (pulse < 50 || pulse > 130)) { isRed = true; insightContext.push("Critical Pulse"); }
  if (!isNaN(spo2) && spo2 < 90) { isRed = true; insightContext.push("Critical SpO2"); }
  if (!isNaN(crt) && crt > 3) { isRed = true; insightContext.push("Critical CRT"); }
  
  // 2. Keyword/Form red flags
  if (conditions.can_walk === "No") { isRed = true; insightContext.push("Cannot walk/collapse"); }
  if (conditions.speak_properly === "No") { isRed = true; insightContext.push("Not responding/speaking properly"); }
  
  // Custom symptom severities for RED
  if (symptoms.includes("Chest Pain")) {
    if (answers.sweating === "Yes" || answers.spreading === "Yes") {
      isRed = true;
      insightContext.push("Severe chest pain");
    }
  }

  // YELLOW (Urgent - Stable but serious) Check
  let isYellow = false;
  if (!isRed) {
    if (!isNaN(rr) && (rr >= 20 && rr <= 30)) { isYellow = true; insightContext.push("Elevated RR (20-30)"); }
    if (!isNaN(pulse) && (pulse >= 100 && pulse <= 130)) { isYellow = true; insightContext.push("Elevated Pulse (100-130)"); }
    if (!isNaN(spo2) && (spo2 >= 90 && spo2 <= 94)) { isYellow = true; insightContext.push("Low SpO2 (90-94%)"); }
    if (!isNaN(crt) && (crt >= 2 && crt <= 3)) { isYellow = true; insightContext.push("Delayed CRT (2-3s)"); }
    
    // Keyword/Form yellow flags
    if (conditions.dizzy === "Yes") { isYellow = true; insightContext.push("Confused/Dizzy"); }
    
    if (symptoms.includes("Chest Pain")) {
      isYellow = true; 
      insightContext.push("Moderate chest pain");
    }
    if (symptoms.includes("Bleeding")) {
      isYellow = true;
      insightContext.push("Bleeding reported");
    }
    if (symptoms.includes("Breathing Difficulty")) {
      isYellow = true;
      insightContext.push("Difficulty breathing");
    }
  }

  // GREEN (Minor) is default fallback if none apply.
  
  if (isRed) {
    priority = "HIGH";
    baseEta = 10;
  } else if (isYellow) {
    priority = "MEDIUM";
    baseEta = 30;
  } else {
    // Add generic minor insights if they are completely stable
    if (symptoms.includes("Fever") || symptoms.includes("Headache")) {
       insightContext.push(symptoms.join(', '));
    }
    if (insightContext.length === 0) insightContext.push("Minor issues");
  }
  
  // If no insight was explicitly added, summarize the generic symptoms
  if (insightContext.length === 0 && symptoms.length > 0) {
    insightContext.push(symptoms.join(', '));
  }

  // Deduplicate array
  insightContext = [...new Set(insightContext)];

  return {
    priorityLevel: priority,
    priorityInsight: insightContext.join(' + '),
    baseEta
  };
}

function calculateQueueETA(baseEta, positionAhead) {
  return baseEta + (positionAhead * 10);
}

module.exports = { calculatePriority, calculateQueueETA };
