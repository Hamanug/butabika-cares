export const getScoreInterpretation = (assessmentType, score) => {
  // Default fallback
  let result = { severity: "Score Recorded", description: "Your assessment has been saved to your profile.", colorClass: "text-slate-600 bg-slate-100" };

  switch (assessmentType) {
    case 'GAD7':
    case 'GAD-7':
      if (score <= 4) result = { severity: "Minimal Anxiety", description: "Your results indicate minimal anxiety symptoms.", colorClass: "text-emerald-700 bg-emerald-50" };
      else if (score <= 9) result = { severity: "Mild Anxiety", description: "Your results indicate mild anxiety. Mindfulness exercises may be beneficial.", colorClass: "text-yellow-700 bg-yellow-50" };
      else if (score <= 14) result = { severity: "Moderate Anxiety", description: "Your results indicate moderate anxiety. Consider discussing this with a therapist.", colorClass: "text-orange-700 bg-orange-50" };
      else result = { severity: "Severe Anxiety", description: "Your results indicate severe anxiety. We strongly recommend reaching out to a professional.", colorClass: "text-rose-700 bg-rose-50" };
      break;

    case 'PHQ9':
    case 'PHQ-9':
      if (score <= 4) result = { severity: "Minimal Depression", description: "Your results indicate minimal depressive symptoms.", colorClass: "text-emerald-700 bg-emerald-50" };
      else if (score <= 9) result = { severity: "Mild Depression", description: "Your results indicate mild depressive symptoms.", colorClass: "text-yellow-700 bg-yellow-50" };
      else if (score <= 14) result = { severity: "Moderate Depression", description: "Your results indicate moderate depressive symptoms. A consultation is recommended.", colorClass: "text-orange-700 bg-orange-50" };
      else if (score <= 19) result = { severity: "Moderately Severe", description: "Your results indicate moderately severe symptoms. Professional support is highly recommended.", colorClass: "text-rose-700 bg-rose-50" };
      else result = { severity: "Severe Depression", description: "Your results indicate severe symptoms. Please utilize our crisis resources or speak to a professional immediately.", colorClass: "text-red-700 bg-red-100" };
      break;

    case 'WHO5':
    case 'WHO-5':
      // WHO-5 is a well-being index. In Screenings.jsx, score is already multiplied by 4 to get percentage.
      if (score >= 50) result = { severity: "Good Well-being", description: "Your results indicate a healthy level of overall well-being.", colorClass: "text-emerald-700 bg-emerald-50" };
      else result = { severity: "Low Well-being", description: "Your results indicate poor well-being. This is a good time to focus on self-care and professional support.", colorClass: "text-orange-700 bg-orange-50" };
      break;

    case 'PCL5':
    case 'PCL-5':
      // PCL-5 for PTSD (cutoff is typically 31-33)
      if (score < 31) result = { severity: "Below Threshold", description: "Your symptoms are currently below the threshold for PTSD.", colorClass: "text-emerald-700 bg-emerald-50" };
      else result = { severity: "Elevated Symptoms", description: "Your results indicate elevated trauma symptoms. A clinical evaluation is strongly recommended.", colorClass: "text-rose-700 bg-rose-50" };
      break;

    case 'NSSI':
    case 'SUICIDE_RISK':
      // Any non-zero score on these requires clinical attention
      if (score === 0) result = { severity: "No Current Risk Identified", description: "Thank you for completing this check-in.", colorClass: "text-emerald-700 bg-emerald-50" };
      else result = { severity: "Clinical Attention Recommended", description: "Based on your answers, we strongly encourage you to utilize our crisis resources or speak with a professional immediately.", colorClass: "text-red-700 bg-red-100 font-bold" };
      break;

    case 'AGREEABLENESS':
      // Personality metric, not a severity scale
      if (score <= 20) result = { severity: "Lower Agreeableness", description: "You tend to prioritize objectivity and self-interest over group harmony.", colorClass: "text-indigo-700 bg-indigo-50" };
      else if (score <= 35) result = { severity: "Moderate Agreeableness", description: "You balance your own needs well with the needs of others.", colorClass: "text-indigo-700 bg-indigo-50" };
      else result = { severity: "High Agreeableness", description: "You are highly empathetic and prioritize cooperation and harmony.", colorClass: "text-indigo-700 bg-indigo-50" };
      break;
  }
  
  return result;
};
