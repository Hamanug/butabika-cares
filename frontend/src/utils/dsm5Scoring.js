export function scoreAdultDSM5(answers) {
  if (!answers || Object.keys(answers).length === 0) return null;

  const getScore = (idx) => parseInt(answers[idx], 10) || 0;

  const domains = [
    { name: "Depression", indices: [0, 1], threshold: 2, critical: false },
    { name: "Anger", indices: [2], threshold: 2, critical: false },
    { name: "Mania", indices: [3, 4], threshold: 2, critical: false },
    { name: "Anxiety", indices: [5, 6, 7], threshold: 2, critical: false },
    { name: "Somatic", indices: [8, 9], threshold: 2, critical: false },
    { name: "Suicidal Ideation", indices: [10], threshold: 1, critical: true },
    { name: "Psychosis", indices: [11, 12], threshold: 1, critical: true },
    { name: "Sleep", indices: [13], threshold: 2, critical: false },
    { name: "Memory", indices: [14], threshold: 2, critical: false },
    { name: "Repetitive Thoughts", indices: [15, 16], threshold: 2, critical: false },
    { name: "Dissociation", indices: [17], threshold: 2, critical: false },
    { name: "Personality", indices: [18, 19], threshold: 2, critical: false },
    { name: "Substance Use", indices: [20, 21, 22], threshold: 1, critical: true },
  ];

  const results = [];
  const criticalAlerts = [];

  domains.forEach(domain => {
    const scores = domain.indices.map(i => getScore(i));
    const highestScore = Math.max(...scores);
    const triggered = highestScore >= domain.threshold;
    
    results.push({
      domain: domain.name,
      score: highestScore,
      triggered,
      critical: domain.critical
    });

    if (triggered && domain.critical) {
      let severityLabel = highestScore === 1 ? 'Slight' : highestScore === 2 ? 'Mild' : highestScore === 3 ? 'Moderate' : 'Severe';
      criticalAlerts.push({ domain: domain.name, score: highestScore, label: severityLabel });
    }
  });

  return { results, criticalAlerts };
}

export function scoreChildDSM5(answers) {
  if (!answers || Object.keys(answers).length === 0) return null;

  const getScore = (idx) => parseInt(answers[idx], 10) || 0;
  const getYesNo = (idx) => answers[idx] === 'Yes';

  const domains = [
    { name: "Somatic", indices: [0], threshold: 2, critical: false },
    { name: "Sleep", indices: [1, 2], threshold: 2, critical: false },
    { name: "Inattention", indices: [3], threshold: 1, critical: false },
    { name: "Depression", indices: [4, 5], threshold: 2, critical: false },
    { name: "Anger/Irritability", indices: [6, 7], threshold: 2, critical: false },
    { name: "Mania", indices: [8, 9], threshold: 2, critical: false },
    { name: "Anxiety", indices: [10, 11, 12], threshold: 2, critical: false },
    { name: "Psychosis", indices: [13, 14], threshold: 1, critical: true },
    { name: "Repetitive Thoughts", indices: [15, 16, 17, 18], threshold: 2, critical: false },
  ];

  const yesNoDomains = [
    { name: "Substance Use", indices: [19, 20, 21, 22], critical: true },
    { name: "Suicidal Ideation/Attempts", indices: [23, 24], critical: true }
  ];

  const results = [];
  const criticalAlerts = [];

  domains.forEach(domain => {
    const scores = domain.indices.map(i => getScore(i));
    const highestScore = Math.max(...scores);
    const triggered = highestScore >= domain.threshold;
    
    results.push({
      domain: domain.name,
      score: highestScore,
      triggered,
      critical: domain.critical,
      isYesNo: false
    });

    if (triggered && domain.critical) {
      let severityLabel = highestScore === 1 ? 'Slight' : highestScore === 2 ? 'Mild' : highestScore === 3 ? 'Moderate' : 'Severe';
      criticalAlerts.push({ domain: domain.name, score: highestScore, label: severityLabel });
    }
  });

  yesNoDomains.forEach(domain => {
    const isTriggered = domain.indices.some(i => getYesNo(i));
    
    results.push({
      domain: domain.name,
      score: isTriggered ? 'Yes' : 'No',
      triggered: isTriggered,
      critical: domain.critical,
      isYesNo: true
    });

    if (isTriggered && domain.critical) {
      criticalAlerts.push({ domain: domain.name, score: 'Yes', label: 'Present' });
    }
  });

  return { results, criticalAlerts };
}
