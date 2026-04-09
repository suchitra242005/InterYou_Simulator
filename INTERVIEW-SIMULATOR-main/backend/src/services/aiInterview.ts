import { config } from '../config/index.js';

interface ResumeEntity {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  skills: string[];
  technicalSkills: string[];
  softSkills: string[];
  projects: Array<{ name: string; description: string; technologies: string[]; url?: string }>;
  certifications: Array<{ name: string; issuer: string; year: string; url?: string }>;
  experience: Array<{ company: string; position: string; duration: string; description: string; isCurrent?: boolean }>;
  internships: Array<{ company: string; position: string; duration: string; description: string; startDate?: string; endDate?: string }>;
  education: Array<{ institution: string; degree: string; field: string; year: string; grade?: string }>;
  languages: string[];
  summary?: string;
  isFresher?: boolean;
}

interface AIFeedback {
  correctness: number;
  confidence: number;
  fluency?: number;
  clarity: number;
  eyeContact: number;
  bodyLanguage: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
  sampleAnswer?: string;
  nextDifficulty?: 'increase' | 'same' | 'decrease';
}

interface CodeEvaluation {
  correctness: number;
  efficiency: number;
  codeQuality: number;
  edgeCases: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
}

interface QuestionContext {
  role: string;
  company: string;
  interviewType: string;
  difficulty: string;
  resume: ResumeEntity;
  previousQuestions: any[];
  previousAnswers: any[];
  userPerformanceHistory: number[];
  currentDifficultyLevel: number;
  askedCategories?: string[];
  weakAreas?: string[];
  strongAreas?: string[];
  hasPreviousSessions?: boolean;
}

class AIInterviewAgent {
  private groqApiKey: string;
  private model: string;

  constructor() {
    this.groqApiKey = config.groq.apiKey || '';
    this.model = config.groq.model || 'llama-3.3-70b-versatile';
  }

  private async callGroq(prompt: string, system?: string): Promise<string> {
    if (!this.groqApiKey || this.groqApiKey === 'your_groq_api_key_here') {
      throw new Error('Groq API key not configured');
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (system) {
      messages.push({ role: 'system', content: system });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.groqApiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || '';
  }

  async generateAdaptiveQuestions(
    role: string,
    company: string,
    interviewType: string,
    difficulty: string,
    resumeData: any,
    questionCount: number = 5,
    sessionHistory?: {
      previousQuestions: string[];
      askedCategories: string[];
      weakAreas: string[];
      strongAreas: string[];
      previousInterviewCount: number;
    }
  ): Promise<any[]> {
    const resume = this.extractResumeEntities(resumeData);
    
    // Filter out previously asked questions
    const filteredPreviousQuestions = sessionHistory?.previousQuestions || [];
    const askedCategories = sessionHistory?.askedCategories || [];
    const weakAreas = sessionHistory?.weakAreas || [];
    const strongAreas = sessionHistory?.strongAreas || [];
    const hasPreviousSessions = (sessionHistory?.previousInterviewCount || 0) > 0;
    
    const context: QuestionContext = {
      role,
      company,
      interviewType,
      difficulty,
      resume,
      previousQuestions: filteredPreviousQuestions,
      previousAnswers: [],
      userPerformanceHistory: [],
      currentDifficultyLevel: this.mapDifficultyToLevel(difficulty),
      askedCategories,
      weakAreas,
      strongAreas,
      hasPreviousSessions
    };

    const questions: any[] = [];

    // Add intro question as index 0 (this is the "Tell me about yourself" - NOT counted in questionCount)
    const introQuestion = this.generateIntroQuestion(role, company, resume);
    introQuestion.isIntro = true;
    questions.push(introQuestion);

    // Generate the actual questions (these are counted in questionCount)
    for (let i = 0; i < questionCount; i++) {
      const question = await this.generateNextQuestion(context, questions, i + 1);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  private extractResumeEntities(resumeData: any): ResumeEntity {
    return {
      name: resumeData?.name,
      email: resumeData?.email,
      phone: resumeData?.phone,
      linkedin: resumeData?.linkedin,
      portfolio: resumeData?.portfolio,
      skills: resumeData?.skills || resumeData?.technicalSkills || [],
      technicalSkills: resumeData?.technicalSkills || resumeData?.skills || [],
      softSkills: resumeData?.softSkills || [],
      projects: resumeData?.projects || [],
      certifications: resumeData?.certifications || [],
      experience: resumeData?.experience || [],
      internships: resumeData?.internships || [],
      education: resumeData?.education || [],
      languages: resumeData?.languages || [],
      summary: resumeData?.summary,
      isFresher: resumeData?.isFresher || (!resumeData?.experience?.length && !resumeData?.internships?.length)
    };
  }

  private mapDifficultyToLevel(difficulty: string): number {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 1;
      case 'medium': return 5;
      case 'hard': return 8;
      default: return 5;
    }
  }

  private generateIntroQuestion(role: string, company: string, resume: ResumeEntity): any {
    const skills = resume.technicalSkills?.slice(0, 5).join(', ') || resume.skills?.slice(0, 5).join(', ') || '';
    const projects = resume.projects?.map(p => p.name).slice(0, 2).join(', ') || '';
    const exp = resume.experience?.map(e => e.position).slice(0, 2).join(', ') || '';
    
    return {
      text: `🎤 YOUR INTRODUCTION: This is your time to shine! Introduce yourself to the interviewer. Cover: Your name, background, key experience (${exp || 'fresh graduate'}), your top skills like ${skills || 'communication'}, projects you've worked on (${projects || 'academic projects'}), and why you're excited about this ${role} role at ${company}. Take your time!`,
      type: 'behavioral',
      category: 'Introduction',
      expectedDuration: 180,
      difficulty: 3,
      focus: 'introduction',
      isIntro: true,
      evaluationCriteria: ['clarity', 'confidence', 'relevance', 'uniqueness']
    };
  }

  private async generateNextQuestion(context: QuestionContext, previousQuestions: any[], questionIndex: number): Promise<any> {
    const avgPerformance = context.userPerformanceHistory.length > 0
      ? context.userPerformanceHistory.reduce((a, b) => a + b, 0) / context.userPerformanceHistory.length
      : 70;

    const shouldIncreaseDifficulty = avgPerformance >= 75;
    const shouldDecreaseDifficulty = avgPerformance < 50;
    
    let targetDifficulty = context.currentDifficultyLevel;
    if (shouldIncreaseDifficulty) {
      targetDifficulty = Math.min(10, targetDifficulty + 1);
    } else if (shouldDecreaseDifficulty) {
      targetDifficulty = Math.max(1, targetDifficulty - 1);
    }

    const difficultyLabel = targetDifficulty <= 3 ? 'easy' : targetDifficulty <= 6 ? 'medium' : 'hard';

    // Get question types based on interview type
    let questionTypes = this.getQuestionDistribution(context.interviewType);
    
    // If has previous sessions, prioritize weak areas and different categories
    if (context.hasPreviousSessions && context.askedCategories && context.askedCategories.length > 0) {
      // Remove categories already heavily asked
      const categoryCounts = context.askedCategories.reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // If user performed poorly in certain areas, prioritize those
      if (context.weakAreas && context.weakAreas.length > 0) {
        // Add more questions from weak areas
        const weakTypes = context.weakAreas.slice(0, 2).map(area => this.categoryToQuestionType(area));
        questionTypes = [...weakTypes, ...questionTypes];
      }
    }
    
    // Shuffle for variety if has previous sessions
    if (context.hasPreviousSessions) {
      questionTypes = this.shuffleArray([...questionTypes]);
    }
    
    const nextType = questionTypes[questionIndex % questionTypes.length];

    switch (nextType) {
      case 'project':
        return await this.generateProjectBasedQuestion(context, targetDifficulty);
      case 'skill':
        return await this.generateSkillBasedQuestion(context, targetDifficulty);
      case 'certification':
        return await this.generateCertificationQuestion(context, targetDifficulty);
      case 'coding':
        return await this.generateCodingQuestion(context, targetDifficulty);
      case 'case_study':
        return await this.generateCaseStudyQuestion(context, targetDifficulty);
      case 'company_specific':
        return await this.generateCompanySpecificQuestion(context, targetDifficulty);
      case 'behavioral':
        return await this.generateBehavioralQuestion(context, targetDifficulty);
      default:
        return await this.generateBehavioralQuestion(context, targetDifficulty);
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private categoryToQuestionType(category: string): string {
    const categoryMap: Record<string, string> = {
      'Technical Skills': 'skill',
      'Problem Solving': 'skill',
      'Debugging': 'skill',
      'Design Patterns': 'skill',
      'Best Practices': 'skill',
      'ML Fundamentals': 'skill',
      'Data Preprocessing': 'skill',
      'Project Deep Dive': 'project',
      'Technical Achievement': 'project',
      'Introduction': 'behavioral',
      'Motivation': 'behavioral',
      'Career Goals': 'behavioral',
      'Stress Management': 'behavioral',
      'Teamwork': 'behavioral',
      'Leadership': 'behavioral',
      'System Design': 'case_study',
      'Architecture': 'case_study'
    };
    return categoryMap[category] || 'behavioral';
  }

  private getQuestionDistribution(interviewType: string): string[] {
    switch (interviewType.toLowerCase()) {
      case 'technical':
        return ['skill', 'project', 'skill', 'coding', 'skill', 'coding', 'case_study'];
      case 'behavioral':
        return ['behavioral', 'behavioral', 'project', 'behavioral', 'certification', 'company_specific', 'behavioral'];
      case 'mixed':
      default:
        return ['behavioral', 'skill', 'project', 'behavioral', 'coding', 'skill', 'case_study', 'certification'];
    }
  }

  private async generateProjectBasedQuestion(context: QuestionContext, difficulty: number): Promise<any> {
    const projects = context.resume.projects;
    if (projects.length === 0) {
      return this.generateSkillBasedQuestion(context, difficulty);
    }

    const project = projects[Math.floor(Math.random() * projects.length)];
    const difficultyText = difficulty >= 7 ? 'deep dive with architectural decisions, challenges faced, and optimization strategies' : 
                          difficulty >= 4 ? 'details about your implementation, tech stack, and results' : 
                          'basic overview and your role';

    const allTech = context.resume.technicalSkills?.concat(context.resume.skills || []).slice(0, 10).join(', ') || project.technologies.join(', ');

    const prompt = `Generate a project-based interview question about "${project.name}" which uses ${project.technologies.join(', ')}.

Project description: ${project.description}
Project URL: ${project.url || 'N/A'}

Candidate's ALL technologies: ${allTech}
Candidate's experience: ${context.resume.experience?.map(e => `${e.position} at ${e.company}`).join('; ') || 'N/A'}
Candidate's certifications: ${context.resume.certifications?.map(c => c.name).join(', ') || 'N/A'}
Candidate's summary: ${context.resume.summary || 'N/A'}
Is fresher: ${context.resume.isFresher ? 'Yes' : 'No'}

Target company: ${context.company} (${context.difficulty} difficulty)
Target role: ${context.role}

Generate a ${difficulty >= 7 ? 'hard' : difficulty >= 4 ? 'medium' : 'easy'} level question that asks the candidate to explain ${difficultyText}.

IMPORTANT: The question must be specific to THIS project, not generic. Ask about specific features they built, challenges specific to ${project.technologies.join(', ')}, or measurable impact. Also relate to their experience and certifications.

Return ONLY JSON:
{"text": "question here", "type": "technical", "category": "Project Deep Dive", "expectedDuration": ${difficulty >= 7 ? 240 : 180}, "difficulty": ${difficulty}, "focus": "project", "projectName": "${project.name}", "evaluationCriteria": ["technical_depth", "problem_solving", "impact"]}`;

    try {
      const result = await this.callGroq(prompt, 'You are an expert technical interviewer generating project-specific questions.');
      const question = JSON.parse(result);
      return { ...question, projectName: project.name };
    } catch (error) {
      return {
        text: `Tell me about "${project.name}". What was your specific contribution, what challenges did you face working with ${project.technologies.slice(0, 2).join(', ')}, and what measurable impact did your work have?`,
        type: 'technical',
        category: 'Project Deep Dive',
        expectedDuration: 180,
        difficulty,
        focus: 'project',
        projectName: project.name
      };
    }
  }

  private async generateSkillBasedQuestion(context: QuestionContext, difficulty: number): Promise<any> {
    const skills = context.resume.technicalSkills?.length ? context.resume.technicalSkills : context.resume.skills;
    if (!skills || skills.length === 0) {
      return this.generateCodingQuestion(context, difficulty);
    }

    const skill = skills[Math.floor(Math.random() * Math.min(skills.length, 5))];
    const difficultyLevel = difficulty >= 7 ? 'advanced' : difficulty >= 4 ? 'intermediate' : 'basic';
    
    const allSkills = [...(context.resume.technicalSkills || []), ...(context.resume.skills || [])].slice(0, 10).join(', ');
    const relatedProjects = context.resume.projects?.filter(p => 
      p.technologies?.some(t => t.toLowerCase().includes(skill.toLowerCase()))
    ).map(p => p.name) || [];
    
    // Include internships
    const internshipInfo = context.resume.internships?.map(i => 
      `${i.position} at ${i.company} (${i.duration})`
    ).join('; ') || 'No internships';

    const prompt = `Generate a technical interview question based on the CANDIDATE'S ACTUAL SKILLS AND EXPERIENCE - NOT generic role-based questions.

CANDIDATE'S ACTUAL BACKGROUND:
- Technical Skills: ${allSkills}
- Projects: ${context.resume.projects?.map(p => `${p.name}: ${p.description.substring(0,100)}`).join('; ') || 'None listed'}
- Work Experience: ${context.resume.experience?.map(e => `${e.position} at ${e.company} (${e.duration})`).join('; ') || 'Fresher'}
- Internships: ${internshipInfo}
- Certifications: ${context.resume.certifications?.map(c => c.name).join(', ') || 'None'}
- Education: ${context.resume.education?.map(e => `${e.degree} in ${e.field} at ${e.institution}`).join('; ') || 'N/A'}
- Languages: ${context.resume.languages?.join(', ') || 'N/A'}

TARGET ROLE: ${context.role} at ${context.company}
DIFFICULTY: ${difficulty}/10 (${difficultyLevel})

IMPORTANT: 
- Ask about their ACTUAL skills, projects, internships listed above
- If they have Python skill, ask about their Python projects
- If they did internship at XYZ, ask about that experience
- Do NOT ask about skills they don't have
- Questions should be answerable from their resume

Return JSON:
{"text": "question about their specific skill/project/internship", "type": "technical", "category": "Skill-Based", "expectedDuration": 120, "difficulty": ${difficulty}, "focus": "skill", "skillName": "${skill}"}`;

    try {
      const result = await this.callGroq(prompt, 'You are an expert interviewer. Generate questions ONLY about what the candidate has listed on their resume. Do NOT ask about topics not mentioned in their profile.');
      const question = JSON.parse(result);
      return { ...question, skillName: skill };
    } catch (error) {
      return {
        text: `Tell me about your experience with ${skill}. What projects have you built using ${skill}?`,
        type: 'technical',
        category: 'Skill-Based',
        expectedDuration: 120,
        difficulty,
        focus: 'skill',
        skillName: skill
      };
    }
  }

  private async generateCertificationQuestion(context: QuestionContext, difficulty: number): Promise<any> {
    const certs = context.resume.certifications;
    
    if (!certs || certs.length === 0) {
      return this.generateProjectBasedQuestion(context, difficulty);
    }

    const cert = certs[Math.floor(Math.random() * certs.length)];
    
    const allSkills = [...(context.resume.technicalSkills || []), ...(context.resume.skills || [])].slice(0, 10).join(', ');
    const relatedProjects = context.resume.projects?.filter(p => 
      p.description?.toLowerCase().includes(cert.name.toLowerCase()) ||
      p.technologies?.some(t => cert.name.toLowerCase().includes(t.toLowerCase()))
    ).map(p => p.name) || [];

    const prompt = `Generate a certification-based interview question about "${cert.name}" issued by ${cert.issuer || 'unknown'} (${cert.year || 'N/A'}).

CANDIDATE PROFILE:
- All Skills: ${allSkills}
- Related Projects: ${relatedProjects.join(', ') || 'N/A'}
- Experience: ${context.resume.experience?.map(e => `${e.position} at ${e.company}`).join('; ') || 'Fresher'}
- Other Certifications: ${certs.filter(c => c.name !== cert.name).map(c => c.name).join(', ') || 'N/A'}
- Summary: ${context.resume.summary || 'N/A'}

TARGET INTERVIEW:
- Role: ${context.role}
- Company: ${context.company}
- Difficulty: ${difficulty}/10

Generate a question that explores how they applied this certification in real work.

Return ONLY JSON:
{"text": "question here", "type": "behavioral", "category": "Certification", "expectedDuration": ${difficulty >= 7 ? 180 : 120}, "difficulty": ${difficulty}, "focus": "certification", "certificationName": "${cert.name}", "evaluationCriteria": ["practical_application", "learning", "impact"]}`;

    try {
      const result = await this.callGroq(prompt, 'You are an expert interviewer generating certification-related questions.');
      const question = JSON.parse(result);
      return { ...question, certificationName: cert.name };
    } catch (error) {
      return {
        text: `I see you have the "${cert.name}" certification from ${cert.issuer || 'unknown'}. How has this certification helped you in your work? Can you give a specific example where you applied knowledge from ${cert.name} to solve a real-world problem?`,
        type: 'behavioral',
        category: 'Certification',
        expectedDuration: 120,
        difficulty: Math.max(1, difficulty - 1),
        focus: 'certification',
        certificationName: cert.name
      };
    }
  }

  private async generateCodingQuestion(context: QuestionContext, difficulty: number): Promise<any> {
    const role = context.role.toLowerCase();
    const skills = [...(context.resume.technicalSkills || []), ...(context.resume.skills || [])];

    const codingTopics = this.getCodingTopicsForRole(role, difficulty);
    const topic = codingTopics[Math.floor(Math.random() * codingTopics.length)];

    const leetCodeDifficulty = difficulty <= 3 ? 'Easy (LeetCode Easy)' : difficulty <= 6 ? 'Medium (LeetCode Medium)' : 'Hard (LeetCode Hard)';
    
    const preferredLanguages = skills.filter(s => 
      ['javascript', 'python', 'java', 'cpp', 'c++', 'c#', 'typescript', 'react', 'angular', 'vue', 'node', 'sql', 'mongodb'].includes(s.toLowerCase())
    ).slice(0, 3);

    const prompt = `Generate a LeetCode/HackerRank style coding interview question.

CANDIDATE PROFILE:
- Role: ${context.role}
- Company: ${context.company}
- All Skills: ${skills.slice(0, 15).join(', ')}
- Preferred Languages: ${preferredLanguages.join(', ') || 'JavaScript, Python, Java'}
- Experience: ${context.resume.experience?.map(e => `${e.position} at ${e.company}`).join('; ') || 'Fresher'}
- Projects: ${context.resume.projects?.map(p => p.name).join(', ') || 'N/A'}
- Is Fresher: ${context.resume.isFresher ? 'Yes' : 'No'}

TARGET INTERVIEW:
- Interview Type: ${context.interviewType}
- Difficulty: ${leetCodeDifficulty} (${difficulty}/10)
- Topic: ${topic.name} (${topic.category})

Create a practical coding problem that:
1. Is relevant to ${context.role} position
2. Tests ${topic.name} skills from LeetCode/HackerRank style
3. Has clear input/output examples
4. Is appropriate for ${context.resume.isFresher ? 'fresher' : 'experienced'} level
5. Uses ${preferredLanguages[0] || 'JavaScript/Python'} as primary language

Return ONLY JSON:
{"text": "question here with clear examples", "type": "coding", "category": "${topic.category}", "expectedDuration": ${difficulty >= 7 ? 600 : 300}, "difficulty": ${difficulty}, "focus": "coding", "topic": "${topic.name}", "testCases": [{"input": "example1", "output": "expected1", "explanation": "why this test"}], "evaluationCriteria": ["correctness", "efficiency", "code_quality", "edge_cases"]}`;

    try {
      const result = await this.callGroq(prompt, 'You are an expert coding interview question generator like LeetCode with focus on practical problems.');
      const question = JSON.parse(result);
      return question;
    } catch (error) {
      return this.getFallbackCodingQuestion(topic.name, difficulty);
    }
  }

  private getCodingTopicsForRole(role: string, difficulty: number): Array<{ name: string; category: string }> {
    const allTopics = [
      { name: 'Arrays and Hashing', category: 'Data Structures' },
      { name: 'Two Pointers', category: 'Algorithms' },
      { name: 'Binary Search', category: 'Algorithms' },
      { name: 'Dynamic Programming', category: 'Algorithms' },
      { name: 'Graph Algorithms', category: 'Data Structures' },
      { name: 'Tree Traversal', category: 'Data Structures' },
      { name: 'Linked List', category: 'Data Structures' },
      { name: 'Stack and Queue', category: 'Data Structures' },
      { name: 'Sorting Algorithms', category: 'Algorithms' },
      { name: 'String Manipulation', category: 'Data Structures' },
      { name: 'Recursion', category: 'Concepts' },
      { name: 'Bit Manipulation', category: 'Concepts' },
      { name: 'System Design', category: 'Architecture' },
      { name: 'Database Design', category: 'Database' },
      { name: 'API Design', category: 'Architecture' }
    ];

    if (role.includes('frontend') || role.includes('react') || role.includes('javascript')) {
      return [
        { name: 'Array Manipulation', category: 'JavaScript' },
        { name: 'DOM Manipulation', category: 'Frontend' },
        { name: 'Async/Await Promises', category: 'JavaScript' },
        { name: 'React Patterns', category: 'Frontend' },
        ...allTopics.slice(0, 5)
      ];
    }

    if (role.includes('data') || role.includes('analyst') || role.includes('scientist')) {
      return [
        { name: 'SQL Queries', category: 'Database' },
        { name: 'Data Transformation', category: 'Data Processing' },
        { name: 'Statistical Analysis', category: 'Statistics' },
        { name: 'Pandas Operations', category: 'Python' },
        ...allTopics.slice(0, 3)
      ];
    }

    return allTopics;
  }

  private getFallbackCodingQuestion(topic: string, difficulty: number): any {
    const questions: Record<string, any> = {
      'Arrays and Hashing': {
        text: `Write a function to find the maximum subarray sum (Kadane's Algorithm). Given an integer array nums, find the subarray with the largest sum and return its sum.

Example:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.`,
        testCases: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6' }]
      },
      'Two Pointers': {
        text: `Write a function to remove duplicates from a sorted array in-place. Return the number of unique elements.

Example:
Input: nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]`,
        testCases: [{ input: '[0,0,1,1,1,2,2,3,3,4]', output: '5' }]
      },
      'Binary Search': {
        text: `Write a function to search for a target value in a sorted array. If target exists, return its index. Otherwise, return -1.

Example:
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4`,
        testCases: [{ input: '[-1,0,3,5,9,12], 9', output: '4' }]
      },
      'Dynamic Programming': {
        text: `Write a function to climb to the top of a staircase. You can climb either 1 or 2 steps at a time. Given n stairs, count the number of distinct ways to reach the top.

Example:
Input: n = 3
Output: 3
Explanation: There are 3 ways: 1+1+1, 1+2, 2+1`,
        testCases: [{ input: '3', output: '3' }]
      },
      'String Manipulation': {
        text: `Write a function to check if two strings are anagrams of each other.

Example:
Input: s = "anagram", t = "nagaram"
Output: true`,
        testCases: [{ input: '"anagram", "nagaram"', output: 'true' }]
      }
    };

    const defaultQuestion = {
      text: `Write a function to reverse a string in-place without using built-in reverse methods.

Example:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]`,
      testCases: [{ input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }]
    };

    return {
      ...(questions[topic] || defaultQuestion),
      type: 'coding',
      category: 'Data Structures',
      expectedDuration: difficulty >= 7 ? 600 : 300,
      difficulty,
      focus: 'coding',
      topic
    };
  }

  private async generateCaseStudyQuestion(context: QuestionContext, difficulty: number): Promise<any> {
    const role = context.role;
    const company = context.company;
    const skills = [...(context.resume.technicalSkills || []), ...(context.resume.skills || [])].slice(0, 10).join(', ');

    const prompt = `Generate a real-world case study interview question for a ${role} position at ${company}.

CANDIDATE PROFILE:
- Skills: ${skills}
- Experience: ${context.resume.experience?.map(e => `${e.position} at ${e.company}`).join('; ') || 'Fresher'}
- Projects: ${context.resume.projects?.map(p => p.name).join(', ') || 'N/A'}
- Certifications: ${context.resume.certifications?.map(c => c.name).join(', ') || 'N/A'}
- Is Fresher: ${context.resume.isFresher ? 'Yes' : 'No'}

The case study should:
1. Be based on a realistic business scenario relevant to ${company}
2. Test problem-solving and decision-making skills
3. Have no single "right" answer - evaluate approach
4. Be at ${difficulty >= 7 ? 'advanced' : difficulty >= 4 ? 'intermediate' : 'beginner'} level
5. Relate to the candidate's skills and experience where possible

Return ONLY JSON:
{"text": "detailed case study question", "type": "case_study", "category": "Case Study", "expectedDuration": ${difficulty >= 7 ? 300 : 180}, "difficulty": ${difficulty}, "focus": "case_study", "scenario": "brief scenario description", "evaluationCriteria": ["problem_analysis", "decision_making", "communication", "technical_knowledge"]}`;

    try {
      const result = await this.callGroq(prompt, 'You are an expert business case study interviewer for tech companies.');
      return JSON.parse(result);
    } catch (error) {
      return {
        text: `As a ${role} at ${company}, you notice the current system is causing 30% slower user response times. Management wants you to propose a solution. How would you approach this problem, and what factors would you consider before making recommendations? Also relate your answer to your experience with ${skills.split(',')[0] || 'relevant technologies'}.`,
        type: 'case_study',
        category: 'Problem Solving',
        expectedDuration: 180,
        difficulty,
        focus: 'case_study',
        scenario: 'Performance optimization challenge'
      };
    }
  }

  private async generateCompanySpecificQuestion(context: QuestionContext, difficulty: number): Promise<any> {
    const company = context.company;
    const companyLower = company.toLowerCase();

    const companyQuestions = this.getCompanySpecificQuestions(companyLower, context.role, difficulty);
    return companyQuestions;
  }

  private getCompanySpecificQuestions(company: string, role: string, difficulty: number): any {
    const companyData: Record<string, any> = {
      google: {
        questions: [
          { text: 'How would you design a system to handle 1 million concurrent users? What are the key architectural decisions you would make?', category: 'System Design', difficulty: 8 },
          { text: 'Tell me about a time you had to make a decision with incomplete information. How did you handle the ambiguity?', category: 'Leadership Principles', difficulty: 6 },
          { text: 'How do you prioritize when you have multiple urgent tasks? Give me an example.', category: 'Time Management', difficulty: 5 },
          { text: 'Describe a time when you failed. What did you learn from it and how did you apply those lessons?', category: 'Googley Values', difficulty: 5 }
        ]
      },
      microsoft: {
        questions: [
          { text: 'Tell me about a time when you had to learn a new technology quickly. How did you approach it?', category: 'Growth Mindset', difficulty: 5 },
          { text: 'How do you ensure your work has a positive impact on customers?', category: 'Customer Obsession', difficulty: 6 },
          { text: 'Describe a time when you disagreed with your team lead. How did you handle it?', category: 'Conflict Resolution', difficulty: 5 },
          { text: 'How do you stay current with the latest technology trends?', category: 'Learning Attitude', difficulty: 4 }
        ]
      },
      amazon: {
        questions: [
          { text: 'Tell me about a time when you had to deliver a project with a tight deadline. How did you prioritize?', category: 'Bias for Action', difficulty: 5 },
          { text: 'Describe a situation where you had to make a decision that would benefit the customer, even if it was difficult for the company.', category: 'Customer Obsession', difficulty: 7 },
          { text: 'Tell me about a time when you took ownership of a problem. What did you do?', category: 'Ownership', difficulty: 5 },
          { text: 'How do you handle disagreement with a peer? Give an example.', category: 'Dive Deep', difficulty: 5 },
          { text: 'Describe a time when you saw a problem and took initiative to solve it before being asked.', category: 'Bias for Action', difficulty: 5 }
        ]
      },
      meta: {
        questions: [
          { text: 'Tell me about a time when you moved fast and took calculated risks.', category: 'Move Fast', difficulty: 5 },
          { text: 'How do you handle building something that might not work? What\'s your approach to risk?', category: 'Boldness', difficulty: 6 },
          { text: 'Describe a time when you had to communicate a complex technical idea to a non-technical audience.', category: 'Communication', difficulty: 5 },
          { text: 'Tell me about a time you failed and how you handled it.', category: 'Resilience', difficulty: 5 }
        ]
      },
      apple: {
        questions: [
          { text: 'Tell me about a time when you went above and beyond to deliver an amazing customer experience.', category: 'Customer Experience', difficulty: 6 },
          { text: 'How do you ensure attention to detail in your work? Give an example.', category: 'Excellence', difficulty: 5 },
          { text: 'Describe a time when you had to keep information confidential.', category: 'Integrity', difficulty: 4 },
          { text: 'How do you approach solving complex technical problems?', category: 'Problem Solving', difficulty: 6 }
        ]
      },
      tcs: {
        questions: [
          { text: 'How do you adapt to changing requirements in a project?', category: 'Adaptability', difficulty: 4 },
          { text: 'Tell me about a time when you had to work with a difficult client.', category: 'Client Relations', difficulty: 5 },
          { text: 'How do you prioritize learning new technologies?', category: 'Learning Agility', difficulty: 4 },
          { text: 'Describe your approach to working in a team environment.', category: 'Teamwork', difficulty: 4 }
        ]
      },
      infosys: {
        questions: [
          { text: 'How do you ensure quality in your deliverables?', category: 'Quality Focus', difficulty: 4 },
          { text: 'Tell me about a time you solved a complex problem for a client.', category: 'Problem Solving', difficulty: 5 },
          { text: 'How do you manage multiple projects simultaneously?', category: 'Multi-tasking', difficulty: 5 },
          { text: 'Describe your experience with offshore team collaboration.', category: 'Collaboration', difficulty: 4 }
        ]
      }
    };

    for (const [key, value] of Object.entries(companyData)) {
      if (company.includes(key)) {
        const qs = value.questions;
        const q = qs[Math.floor(Math.random() * qs.length)];
        return {
          ...q,
          type: 'behavioral',
          expectedDuration: 180,
          focus: 'company_specific',
          company: company
        };
      }
    }

    return {
      text: `Why do you want to join ${company} and what unique contributions can you make to our team as a ${role}?`,
      type: 'behavioral',
      category: 'Motivation',
      expectedDuration: 120,
      difficulty: 4,
      focus: 'company_specific',
      company
    };
  }

  private async generateBehavioralQuestion(context: QuestionContext, difficulty: number): Promise<any> {
    const behavioralTopics = [
      'leadership', 'conflict_resolution', 'teamwork', 'problem_solving',
      'communication', 'time_management', 'adaptability', 'innovation',
      'failure_learn', 'career_goals', 'strengths_weaknesses'
    ];

    const topic = behavioralTopics[Math.floor(Math.random() * behavioralTopics.length)];
    
    const skills = [...(context.resume.technicalSkills || []), ...(context.resume.skills || [])].slice(0, 8).join(', ');
    const experience = context.resume.experience?.map(e => `${e.position} at ${e.company}`).join('; ') || 'Fresher';
    const softSkills = context.resume.softSkills?.join(', ') || 'N/A';

    const prompt = `Generate a behavioral interview question about "${topic.replace('_', ' ')}" at difficulty level ${difficulty}/10.

CANDIDATE PROFILE:
- Role: ${context.role}
- Company Applied: ${context.company}
- Skills: ${skills}
- Soft Skills: ${softSkills}
- Experience: ${experience}
- Summary: ${context.resume.summary || 'N/A'}
- Is Fresher: ${context.resume.isFresher ? 'Yes' : 'No'}

Use STAR method format in the question (Situation, Task, Action, Result).
The question should help evaluate the candidate's ${topic.replace('_', ' ')} skills.
Make it relevant to their experience and the ${context.company} role.

Return ONLY JSON:
{"text": "question here", "type": "behavioral", "category": "${this.capitalizeFirst(topic)}", "expectedDuration": ${difficulty >= 7 ? 180 : 120}, "difficulty": ${difficulty}, "focus": "behavioral", "evaluationCriteria": ["star_format", "specificity", "learning", "impact"]}`;

    try {
      const result = await this.callGroq(prompt, 'You are an expert HR interviewer generating behavioral questions using STAR method.');
      return JSON.parse(result);
    } catch (error) {
      return this.getFallbackBehavioralQuestion(topic, difficulty);
    }
  }

  private getFallbackBehavioralQuestion(topic: string, difficulty: number): any {
    const questions: Record<string, any> = {
      leadership: {
        text: 'Tell me about a time when you led a team through a challenging situation. What was the situation, what actions did you take, and what was the outcome?',
        category: 'Leadership'
      },
      conflict_resolution: {
        text: 'Describe a time when you had a conflict with a coworker. How did you handle it?',
        category: 'Conflict Resolution'
      },
      teamwork: {
        text: 'Tell me about a time when you had to work with a difficult team member. How did you collaborate to achieve the goal?',
        category: 'Teamwork'
      },
      problem_solving: {
        text: 'Describe a complex problem you faced and how you went about solving it.',
        category: 'Problem Solving'
      },
      communication: {
        text: 'Tell me about a time when you had to explain a complex technical concept to a non-technical person.',
        category: 'Communication'
      },
      failure_learn: {
        text: 'Tell me about a time you failed. What did you learn from it?',
        category: 'Learning from Mistakes'
      }
    };

    return {
      ...(questions[topic] || questions.problem_solving),
      type: 'behavioral',
      expectedDuration: 120,
      difficulty,
      focus: 'behavioral'
    };
  }

  private capitalizeFirst(str: string): string {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  getIntroduction(resumeData: any, role: string, company: string): string {
    return `Hello! I'm James, the HR Representative for ${company}. I'm here to help you practice and build confidence for your real interviews.

We'll start with you introducing yourself, then I'll ask several questions. After each answer, you'll get AI feedback. Difficulty will adjust based on your performance.

Let's begin! Please tell me about yourself - your background, experience, and why you're a great fit for this ${role} role at ${company}. Take your time!`;
  }

  async generateFeedback(
    question: any,
    answer: string,
    speechAnalysis?: any,
    facialAnalysis?: any,
    resumeData?: any
  ): Promise<AIFeedback> {
    const isIntro = question?.isIntro || question?.focus === 'introduction' || question?.category === 'Introduction';
    
    // Special evaluation for introduction questions
    if (isIntro) {
      return this.evaluateIntroduction(answer, question, resumeData);
    }
    
    // Check for very short answers
    if (answer.length < 15) {
      return {
        correctness: 30,
        confidence: 40,
        clarity: 35,
        eyeContact: 70,
        bodyLanguage: 70,
        overallScore: 42,
        sampleAnswer: this.getSampleAnswer(question),
        feedback: 'Your answer is too short. Please elaborate more.',
        suggestions: ['Provide more details', 'Give specific examples'],
        nextDifficulty: 'same'
      };
    }
    
    // Check for nonsense answers
    const randomIndicators = ['asdf', 'qwerty', 'test', 'blah blah', 'lalala'];
    const hasNonsense = randomIndicators.some(word => answer.toLowerCase().includes(word));
    if (hasNonsense) {
      return {
        correctness: 20,
        confidence: 30,
        clarity: 25,
        eyeContact: 50,
        bodyLanguage: 50,
        overallScore: 28,
        sampleAnswer: this.getSampleAnswer(question),
        feedback: 'Please answer genuinely.',
        suggestions: ['Answer seriously', 'Be honest'],
        nextDifficulty: 'decrease'
      };
    }
    
    // Now use AI for evaluation - focus on CORRECTNESS, FILLER WORDS, FLUENCY, EYE CONTACT
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'I think', 'maybe', 'sort of', 'kind of', 'so yeah', 'right?', 'i mean', 'yeah so', 'okay so'];
    const fillerCount = fillerWords.filter(word => answer.toLowerCase().includes(word)).length;
    const fillerPenalty = Math.min(fillerCount * 8, 25);
    
    const hasSTAR = /situation|task|action|result|worked|built|developed|created|solved/i.test(answer);
    const hasNumbers = /\d+%|increased|decreased|managed|team|project|users|clients/i.test(answer);
    const hasSpecificExamples = /for example|for instance|specifically|particular|exact|precisely/i.test(answer);
    const answerLength = answer.length;
    const wordCount = answer.split(/\s+/).length;
    
    const structureIndicators = /first|second|third|firstly|secondly|moreover|furthermore|however|therefore|additionally/i.test(answer);
    
    const prompt = `You are an expert technical interview coach evaluating a candidate's answer with STRICT real-world standards.

Question Type: ${question?.type || 'behavioral'}
Question Category: ${question?.category || 'General'}
Question Focus: ${question?.focus || 'general'}

Question: "${question?.text || 'N/A'}"
Candidate's Answer: "${answer}"

Answer Statistics:
- Word count: ${wordCount}
- Contains STAR method elements: ${hasSTAR ? 'Yes' : 'No'}
- Contains numbers/metrics: ${hasNumbers ? 'Yes' : 'No'}
- Contains specific examples: ${hasSpecificExamples ? 'Yes' : 'No'}
- Has structured transitions: ${structureIndicators ? 'Yes' : 'No'}
- Filler words detected: ${fillerCount}

Evaluate with REALISTIC and STRICT scoring based on real interview standards:

1. correctness (0-100): Does the answer address the question correctly and comprehensively?
   - Excellent (80-100): Directly addresses question with specific examples, technical depth, relevant experience
   - Good (65-79): Answers question adequately but lacks depth or specific examples
   - Average (50-64): Partially answers or generic response without specifics
   - Poor (below 50): Doesn't address question or contains misinformation

2. confidence (0-100): Does the answer sound confident and assertive?
   - Watch for: filler words, hedging language, uncertain phrases
   - Higher filler word count = significantly lower confidence score
   - Direct, assertive statements = higher score

3. fluency (0-100): How smooth is the delivery? 
   - Hesitations, pauses, repetition, run-on sentences = lower
   - Natural, flowing answer = higher

4. clarity (0-100): How well structured is the answer?
   - Good structure with clear points = 70-90
   - Some organization = 50-70
   - Rambling, disorganized = below 50

5. eyeContact (0-100): Based on the confidence and fluency of the answer, infer eye contact:
   - Confident, fluent answer likely has good eye contact = 70-90
   - Hesitant answer suggests looking away = 40-70
   - Very uncertain = below 40
    
6. bodyLanguage (0-100): Based on answer quality, infer engagement:
   - Detailed, engaged answer = 70-90
   - Average engagement = 50-70
   - Minimal engagement = below 50

7. overallScore: WEIGHTED: correctness 35%, confidence 20%, fluency 15%, clarity 10%, eyeContact 15%, bodyLanguage 5%

8. sampleAnswer: A strong model answer using STAR method with specific metrics
9. feedback: Specific, actionable feedback on strengths and weaknesses
10. suggestions: 2-3 specific improvement suggestions
11. nextDifficulty: Based on performance (>=75=increase, 45-74=same, <45=decrease)

Return ONLY valid JSON:
{"correctness": 0, "confidence": 0, "fluency": 0, "clarity": 0, "eyeContact": 0, "bodyLanguage": 0, "overallScore": 0, "sampleAnswer": "string", "feedback": "string", "suggestions": ["string"], "nextDifficulty": "increase|same|decrease"}`;

    try {
      const result = await this.callGroq(prompt, 'You are a STRICT real-world interview evaluator. Apply realistic standards - top 10% of candidates should score 85+, average should score 60-75. Be harsh but fair.');
      const feedback = JSON.parse(result);
      
      // STRICT scoring - apply realistic multipliers
      const correctness = Math.round((feedback.correctness || 55) * 0.90);
      const confidence = Math.round((feedback.confidence || 55) * 0.85);
      const fluency = Math.round((feedback.fluency || 55) * 0.85);
      const clarity = Math.round((feedback.clarity || 55) * 0.85);
      const eyeContact = Math.round((feedback.eyeContact || 50) * 0.70);
      const bodyLanguage = Math.round((feedback.bodyLanguage || 60) * 0.80);
      
      // Penalize for filler words
      const fillerPenalty = Math.min(fillerCount * 5, 20);
      
      // Bonus for STAR method
      const starBonus = hasSTAR ? 5 : 0;
      const metricsBonus = hasNumbers ? 5 : 0;
      const exampleBonus = hasSpecificExamples ? 5 : 0;
      
      const overallScore = Math.round(
        Math.max(0, Math.min(100,
          (correctness * 0.35 +
          confidence * 0.20 +
          fluency * 0.15 +
          clarity * 0.10 +
          eyeContact * 0.15 +
          bodyLanguage * 0.05) - fillerPenalty + starBonus + metricsBonus + exampleBonus
        ))
      );
      
      // Generate specific feedback based on actual answer characteristics
      const feedbackParts = [];
      if (!hasSTAR && question?.type === 'behavioral') {
        feedbackParts.push('Use the STAR method (Situation, Task, Action, Result) to structure your answer');
      }
      if (!hasNumbers) {
        feedbackParts.push('Include quantifiable metrics and specific numbers in your examples');
      }
      if (!hasSpecificExamples) {
        feedbackParts.push('Provide specific examples from your experience rather than generic statements');
      }
      if (fillerCount > 2) {
        feedbackParts.push(`Reduce filler words (found ${fillerCount}) - practice pausing instead of using "um" or "like"`);
      }
      if (!structureIndicators && wordCount > 50) {
        feedbackParts.push('Use transition words (first, second, however, therefore) to structure longer answers');
      }
      
      return {
        correctness,
        confidence,
        clarity,
        eyeContact,
        bodyLanguage,
        overallScore,
        sampleAnswer: feedback.sampleAnswer || this.getSampleAnswer(question),
        feedback: feedback.feedback || (feedbackParts.length > 0 ? feedbackParts.join('. ') : 'Good attempt!'),
        suggestions: feedback.suggestions?.slice(0, 3) || [
          feedbackParts[0] || 'Practice using STAR method for behavioral questions',
          feedbackParts[1] || 'Include specific metrics and achievements',
          'Maintain eye contact with camera throughout your answer'
        ],
        nextDifficulty: overallScore >= 80 ? 'increase' : overallScore < 45 ? 'decrease' : 'same'
      };
    } catch (error) {
      return this.getBalancedFallback(question);
    }
  }
  
  private getSampleAnswer(question: any): string {
    if (question?.focus === 'introduction' || question?.category === 'Introduction') {
      return 'I am a [role] with [X] years of experience in [field]. My key technical skills include [skills]. In my current role at [company], I led [project] which resulted in [metric] improvement. Previously, I worked on [project] using [tech stack]. I am excited about this role because [reasons].';
    }
    if (question?.type === 'behavioral') {
      return 'STAR Example: Situation - "In my previous role at [Company], we faced [challenge]..." Task - "I was responsible for [goal]..." Action - "I implemented [specific steps] by [how you did it]..." Result - "This led to [quantifiable outcome - %, $, time saved]..."';
    }
    if (question?.type === 'technical') {
      return 'A strong technical answer should: 1) Explain the concept clearly, 2) Provide a specific example from your experience, 3) Discuss trade-offs or alternatives, 4) If applicable, mention performance/optimization considerations.';
    }
    if (question?.type === 'coding') {
      return 'For coding questions: 1) Clarify the problem understanding, 2) Discuss approach and time complexity, 3) Write clean, working code, 4) Test with provided examples, 5) Consider edge cases.';
    }
    return 'A good answer directly addresses the question with specific examples, quantifiable results, and clear structure.';
  }
  
  private getBalancedFallback(question: any): AIFeedback {
    const isBehavioral = question?.type === 'behavioral';
    const isTechnical = question?.type === 'technical';
    
    return {
      correctness: 60,
      confidence: 55,
      clarity: 55,
      eyeContact: 60,
      bodyLanguage: 65,
      overallScore: 58,
      sampleAnswer: this.getSampleAnswer(question),
      feedback: isBehavioral 
        ? 'Your answer needs more structure. Use STAR method with specific examples and measurable outcomes.'
        : isTechnical
        ? 'Provide more technical depth with specific examples from your projects.'
        : 'Add more details and specific examples to strengthen your answer.',
      suggestions: isBehavioral ? [
        'Use STAR method: Situation, Task, Action, Result',
        'Include quantifiable metrics (%, $, time saved)',
        'Maintain eye contact with camera throughout'
      ] : [
        'Give specific technical examples from your experience',
        'Explain the "why" behind your technical choices',
        'Practice speaking about your projects in detail'
      ],
      nextDifficulty: 'same'
    };
  }

  private getDefaultFeedback(): AIFeedback {
    return {
      correctness: 70,
      confidence: 70,
      clarity: 70,
      eyeContact: 75,
      bodyLanguage: 75,
      overallScore: 72,
      feedback: 'Good attempt! Try to provide more specific examples from your experience.',
      suggestions: [
        'Use the STAR method for behavioral questions',
        'Maintain consistent eye contact',
        'Be more confident in your responses'
      ]
    };
  }

  private async evaluateIntroduction(answer: string, question: any, resumeData?: any): Promise<AIFeedback> {
    const wordCount = answer.split(/\s+/).length;
    const charCount = answer.length;
    
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'I think', 'maybe', 'sort of', 'kind of', 'so yeah', 'right?', 'i mean', 'yeah so', 'okay so'];
    const foundFillers = fillerWords.filter(w => answer.toLowerCase().includes(w));
    const fillerCount = foundFillers.length;
    
    const hasName = /i am|i'm|my name is/i.test(answer);
    const hasBackground = /experience|worked|job|role|position|internship/i.test(answer);
    const hasSkills = /skill|proficient|expert|knowledge|熟悉|擅长/i.test(answer);
    const hasProjects = /project|built|developed|created|implemented/i.test(answer);
    const hasEducation = /university|college|degree|bachelor|master|education|studied/i.test(answer);
    const hasGoals = /goal|aspire|dream|interested|excited|passion/i.test(answer);
    const hasMetrics = /\d+|%|\$|years|months|users|clients|team|project/i.test(answer);
    const hasStructure = /\bfirst\b|\bsecond\b|\bthird\b|\balso\b|\bfurthermore\b|\bhowever\b|\btherefore\b/i.test(answer);
    
    const skills = resumeData?.technicalSkills || resumeData?.skills || [];
    const projects = resumeData?.projects || [];
    const experience = resumeData?.experience || [];
    const internships = resumeData?.internships || [];
    
    const mentionedSkills = skills.filter((s: string) => 
      answer.toLowerCase().includes(s.toLowerCase())
    );
    const mentionedProjects = projects.filter((p: any) => 
      answer.toLowerCase().includes(p.name?.toLowerCase())
    );
    const mentionedExp = experience.filter((e: any) => 
      answer.toLowerCase().includes(e.company?.toLowerCase()) || answer.toLowerCase().includes(e.position?.toLowerCase())
    );
    const mentionedInterns = internships.filter((i: any) => 
      answer.toLowerCase().includes(i.company?.toLowerCase())
    );

    const completenessScore = [
      hasName ? 15 : 0,
      hasBackground ? 20 : 0,
      hasSkills ? 20 : 0,
      hasProjects ? 15 : 0,
      hasEducation ? 10 : 0,
      hasGoals ? 10 : 0,
      hasMetrics ? 10 : 0
    ].reduce((a, b) => a + b, 0);

    const confidenceScore = fillerCount <= 2 ? 85 : fillerCount <= 5 ? 65 : 45;
    const fluencyScore = wordCount < 50 ? 45 : wordCount < 100 ? 65 : wordCount < 200 ? 80 : 85;
    const clarityScore = hasStructure ? 80 : wordCount < 80 ? 50 : 65;
    
    const mentionBonus = Math.min(15, (mentionedSkills.length * 3) + (mentionedProjects.length * 3) + (mentionedExp.length * 3) + (mentionedInterns.length * 3));
    
    const overallScore = Math.round(
      Math.min(100, Math.max(0,
        (completenessScore * 0.30) +
        (confidenceScore * 0.20) +
        (fluencyScore * 0.20) +
        (clarityScore * 0.20) +
        (mentionBonus * 0.10)
      ))
    );

    const suggestions: string[] = [];
    
    if (!hasName) {
      suggestions.push('Start with your name and a brief professional title');
    }
    if (!hasBackground) {
      suggestions.push('Include your work experience or academic background');
    }
    if (!hasSkills) {
      suggestions.push('Mention your key technical skills relevant to the role');
    }
    if (!hasProjects) {
      suggestions.push('Highlight 1-2 key projects with brief descriptions');
    }
    if (!hasEducation) {
      suggestions.push('Include your education background');
    }
    if (!hasGoals) {
      suggestions.push('Explain why you are interested in this role and your career goals');
    }
    if (!hasMetrics) {
      suggestions.push('Add quantifiable achievements (e.g., "improved performance by 30%")');
    }
    if (!hasStructure) {
      suggestions.push('Structure your response: Background → Skills → Projects → Goals');
    }
    if (fillerCount > 3) {
      suggestions.push(`Reduce filler words (found ${fillerCount}: ${foundFillers.slice(0, 3).join(', ')}). Practice pausing instead.`);
    }
    if (wordCount < 80) {
      suggestions.push('Your introduction is too short. Aim for 1-2 minutes (150-250 words)');
    }
    if (mentionedSkills.length < 2 && skills.length > 0) {
      suggestions.push(`Mention more of your skills: ${skills.slice(0, 3).join(', ')}`);
    }
    if (mentionedProjects.length === 0 && projects.length > 0) {
      suggestions.push(`Mention your project "${projects[0]?.name}" to demonstrate practical experience`);
    }

    let feedback = '';
    if (overallScore >= 80) {
      feedback = 'Excellent self-introduction! You covered all key elements professionally.';
    } else if (overallScore >= 65) {
      feedback = 'Good self-introduction. Add more specific details to make it memorable.';
    } else if (overallScore >= 50) {
      feedback = 'Decent start, but your introduction needs more structure and specific details.';
    } else {
      feedback = 'Your introduction needs significant improvement. Follow the suggested areas below.';
    }

    const detailedFeedback = [];
    if (hasName && hasBackground && hasSkills) {
      detailedFeedback.push('✓ You covered the basics well');
    }
    if (hasProjects && mentionedProjects.length > 0) {
      detailedFeedback.push('✓ Good job mentioning your project work');
    }
    if (hasMetrics) {
      detailedFeedback.push('✓ Nice work including quantifiable achievements');
    }
    if (mentionedSkills.length >= 3) {
      detailedFeedback.push('✓ You effectively highlighted your technical skills');
    }
    if (fillerCount <= 2) {
      detailedFeedback.push('✓ Good control over filler words');
    }
    
    if (detailedFeedback.length > 0) {
      feedback += ' ' + detailedFeedback.join('. ');
    }

    return {
      correctness: completenessScore,
      confidence: confidenceScore,
      fluency: fluencyScore,
      clarity: clarityScore,
      eyeContact: overallScore >= 70 ? 75 : 55,
      bodyLanguage: overallScore >= 70 ? 75 : 60,
      overallScore,
      feedback,
      suggestions: suggestions.slice(0, 5),
      sampleAnswer: `A strong introduction should include: 1) Your name and professional title, 2) Brief background (experience/education), 3) Key skills relevant to ${resumeData?.targetRole || 'the role'}, 4) 1-2 notable projects with achievements, 5) Why you're excited about this opportunity. Aim for 1-2 minutes.`,
      nextDifficulty: overallScore >= 75 ? 'increase' : overallScore < 45 ? 'decrease' : 'same'
    };
  }

  async evaluateCode(
    code: string,
    language: string,
    question: any,
    testCases?: any[]
  ): Promise<CodeEvaluation> {
    const prompt = `You are an expert code reviewer evaluating a candidate's solution.

Question Topic: ${question?.topic || 'General'}
Question Category: ${question?.category || 'Data Structures'}
Difficulty: ${question?.difficulty || 5}/10

Question: "${question?.text?.slice(0, 300) || 'N/A'}..."

Code Submitted:
\`\`\`${language}
${code}
\`\`\`

Test Cases: ${JSON.stringify(testCases || question?.testCases || [])}

Evaluate the code and provide:
1. correctness (0-100): Does the code solve the problem? Handle edge cases?
2. efficiency (0-100): Time and space complexity
3. codeQuality (0-100): Readability, naming, structure, best practices
4. edgeCases (0-100): Does it handle edge cases?
5. overallScore (0-100): Weighted average
6. feedback: Specific feedback on the solution
7. suggestions: 2-3 suggestions for improvement
8. nextDifficulty: Should next coding question be easier, same, or harder?

Return ONLY valid JSON:
{"correctness": 0, "efficiency": 0, "codeQuality": 0, "edgeCases": 0, "overallScore": 0, "feedback": "string", "suggestions": ["string"], "nextDifficulty": "increase|same|decrease"}`;

    try {
      const result = await this.callGroq(prompt, 'You are an expert software engineer reviewing code like a senior developer would.');
      const evaluation = JSON.parse(result);
      
      return {
        correctness: evaluation.correctness || 60,
        efficiency: evaluation.efficiency || 60,
        codeQuality: evaluation.codeQuality || 60,
        edgeCases: evaluation.edgeCases || 50,
        overallScore: evaluation.overallScore || 58,
        feedback: evaluation.feedback || 'Good attempt!',
        suggestions: evaluation.suggestions || ['Handle edge cases', 'Optimize complexity']
      };
    } catch (error) {
      return this.getDefaultCodeEvaluation();
    }
  }

  private getDefaultCodeEvaluation(): CodeEvaluation {
    return {
      correctness: 60,
      efficiency: 60,
      codeQuality: 60,
      edgeCases: 50,
      overallScore: 58,
      feedback: 'Your code compiles and runs. Consider edge cases and optimization.',
      suggestions: [
        'Handle edge cases like empty inputs',
        'Optimize for better time complexity',
        'Add comments for clarity'
      ]
    };
  }
}

export const aiInterviewService = new AIInterviewAgent();
