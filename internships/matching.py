"""
Skill-matching algorithm for CareerBridge.

Rule-based matching — no ML required.
Transparent, testable, and fast for the MVP.
"""


def calculate_skill_match(student_skill_names: list, internship_skills: list) -> dict:
    """
    Compare a student's skills against an internship's required/preferred skills.

    Args:
        student_skill_names: list of skill name strings the student has.
        internship_skills: list of dicts like {"name": "Python", "is_required": True}.

    Returns:
        dict with score (0–100), matched skills, missing required skills,
        and missing preferred skills.
    """
    required = {s["name"] for s in internship_skills if s["is_required"]}
    preferred = {s["name"] for s in internship_skills if not s["is_required"]}
    student = set(student_skill_names)

    matched_required = sorted(student & required)
    missing_required = sorted(required - student)
    matched_preferred = sorted(student & preferred)

    # Scoring: required skills are weighted 3x preferred skills
    required_weight = 3
    preferred_weight = 1
    max_score = len(required) * required_weight + len(preferred) * preferred_weight

    if max_score == 0:
        score = 100  # No skills needed — perfect match
    else:
        earned = len(matched_required) * required_weight + len(matched_preferred) * preferred_weight
        score = round(earned / max_score * 100)

    return {
        "score": score,
        "matched_required": matched_required,
        "missing_required": missing_required,
        "matched_preferred": matched_preferred,
        "total_required": len(required),
        "total_preferred": len(preferred),
    }


def get_recommended_internships(student_profile, internships, top_n: int = 10) -> list:
    """
    Return the top_n internships ranked by skill-match score for a student.
    """
    student_skills = list(
        student_profile.student_skills.select_related("skill")
        .values_list("skill__name", flat=True)
    )

    scored = []
    for internship in internships:
        skills = [
            {"name": s.skill.name, "is_required": s.is_required}
            for s in internship.internship_skills.select_related("skill")
        ]
        match = calculate_skill_match(student_skills, skills)
        scored.append({"internship": internship, "match": match})

    scored.sort(key=lambda x: x["match"]["score"], reverse=True)
    return scored[:top_n]
