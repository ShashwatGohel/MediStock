/**
 * Simple Drug Interaction Checker (MVP)
 * This utility checks for common high-risk drug-drug interactions.
 * 
 * Note: This is for demonstration and basic safety awareness. 
 * Users should ALWAYS consult a medical professional.
 */

const INTERACTION_DATABASE = [
    {
        pair: ["Aspirin", "Warfarin"],
        severity: "High",
        warning: "Increased risk of severe bleeding. Both are blood thinners."
    },
    {
        pair: ["Ibuprofen", "Aspirin"],
        severity: "Medium",
        warning: "Both are NSAIDs. Increased risk of stomach ulcers and bleeding."
    },
    {
        pair: ["Spironolactone", "Lisinopril"],
        severity: "High",
        warning: "Risk of high potassium levels (hyperkalemia), which can affect heart rhythm."
    },
    {
        pair: ["Sildenafil", "Nitroglycerin"],
        severity: "Critical",
        warning: "Severe drop in blood pressure. Can be fatal."
    },
    {
        pair: ["Metformin", "Contrast Dye"],
        severity: "Medium",
        warning: "Risk of lactic acidosis if used during certain medical imaging procedures."
    },
    {
        pair: ["Atorvastatin", "Clarithromycin"],
        severity: "High",
        warning: "Increased risk of muscle damage (rhabdomyolysis)."
    },
    {
        pair: ["Dolo 650", "Paracetamol"],
        severity: "High",
        warning: "Duplicate therapy. Both contain Paracetamol; risk of liver toxicity."
    }
];

export const checkInteractions = (medList) => {
    const alerts = [];
    const names = medList.map(m => m.medicineName.toLowerCase().trim());

    INTERACTION_DATABASE.forEach(rule => {
        const matches = rule.pair.filter(p =>
            names.some(n => n.includes(p.toLowerCase()))
        );

        if (matches.length === rule.pair.length) {
            alerts.push({
                meds: rule.pair,
                severity: rule.severity,
                warning: rule.warning
            });
        }
    });

    return alerts;
};
