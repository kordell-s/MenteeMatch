type EntityWithSkills = {
    id: string;
    skills: string[];
};

type MatchResult = {
    mentorId: string;
    score: number;
};

/** 
 Calculating intersection over union between two sets of skills. 
 **/

 function calculateIoU(setA: Set<string>, setB: Set<string>): number {
    const intersection = new Set([...setA].filter(skill => setB.has(skill)));
    const union = new Set([...setA, ...setB]);
    const score = intersection.size / union.size;

    console.log('IoU calculation:', {
        setA: Array.from(setA),
        setB: Array.from(setB),
        intersection: Array.from(intersection),
        union: Array.from(union),
        score: score
    });
    
    return score;
 }

 /**
  * Match a mentee against a list of mentors based on skills
  * Returns a list of mentor IDs with their corresponding match score/IoU score
  */

 export function matchBySkillsIoU(
    mentee: EntityWithSkills,
    mentors: EntityWithSkills[]
 ): MatchResult[]{
    const menteeSkills = new Set(mentee.skills.map(skill => skill.toLowerCase()));
    const matches = mentors.map((mentor) => {
        const mentorSkills = new Set(mentor.skills.map(skill => skill.toLowerCase()));
        const score = calculateIoU(menteeSkills, mentorSkills);
        console.log(`Mentor ${mentor.id} - IoU Score: ${score}`);
        return { mentorId: mentor.id, score };
    });


    //sort mentors by score from most to least relevant
    const sortedMatches = matches.sort((a, b) => b.score - a.score);
    console.log('Sorted Matches:', sortedMatches);
    return matches.sort((a, b) => b.score - a.score);
    
}
