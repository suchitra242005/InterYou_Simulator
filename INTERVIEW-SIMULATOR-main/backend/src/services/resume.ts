import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import { Resume, IResume, IParsedData } from '../models/index.js';
import { AppError } from '../middleware/index.js';
import { config } from '../config/index.js';
import { huggingFaceService } from './huggingface.js';
import { ollamaService } from './ollama.js';

const pdfParse = require('pdf-parse');

export class ResumeService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = config.uploadDir;
  }

  async uploadResume(userId: string, file: Express.Multer.File): Promise<IResume> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, fileName);
    await fs.writeFile(filePath, file.buffer);

    const resume = new Resume({
      userId,
      fileName: file.originalname,
      filePath: fileName,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    await resume.save();
    return resume;
  }

  async parseResume(resumeId: string, userId: string): Promise<IResume> {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    try {
      const fileContent = await this.extractFileContent(resume.filePath);
      console.log('=== PARSING RESUME ===');
      console.log('File path:', resume.filePath);
      console.log('Extracted text length:', fileContent.length);
      console.log('====================');
      
      if (!fileContent || fileContent.trim().length < 50) {
        console.log('ERROR: No text extracted from resume!');
        throw new AppError('Could not extract text from resume', 500);
      }
      
      let parsedData: IParsedData;
      
      // Use Groq AI for better parsing
      console.log('Using Groq AI parsing...');
      parsedData = await this.parseResumeWithAI(fileContent);
      
      console.log('=== PARSING RESULT ===');
      console.log(JSON.stringify(parsedData, null, 2));
      console.log('=====================');
      
      resume.parsedData = parsedData;
      resume.isProcessed = true;
      
      console.log('Running ATS evaluation...');
      const atsResult = await this.evaluateResumeWithAI(parsedData, fileContent);
      resume.atsScore = atsResult.score;
      resume.atsFeedback = atsResult.feedback;
      resume.suggestions = atsResult.suggestions;
      
      await resume.save();
      
      console.log('=== PARSED DATA ===');
      console.log('Name:', parsedData.name);
      console.log('Email:', parsedData.email);
      console.log('Skills:', parsedData.skills.length);
      console.log('Education:', parsedData.education.length);
      console.log('Experience:', parsedData.experience.length);
      console.log('Projects:', parsedData.projects.length);
      console.log('====================');
      
      return resume;
    } catch (error) {
      console.error('Resume parsing error:', error);
      // Instead of throwing, return resume with empty parsed data
      resume.parsedData = this.getEmptyData();
      resume.isProcessed = false;
      await resume.save();
      return resume;
    }
  }

  private async parseResumeWithAI(text: string): Promise<IParsedData> {
    const basic = this.extractBasicInfo(text);
    
    const prompt = `You are a strict resume parser. Extract ONLY information from the resume below.
Return a JSON object with exactly these fields - no extra text:

{
  "name": "Full name from resume",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", "skill3"],
  "education": [{"institution": "college name", "degree": "degree type", "field": "field of study", "year": "graduation year", "grade": "GPA/percentage"}],
  "experience": [{"company": "company name", "position": "job title", "duration": "duration", "description": "job description"}],
  "internships": [{"company": "company name", "position": "internship title", "duration": "duration (e.g., May 2023 - July 2023)", "description": "what you did during internship", "startDate": "start month year", "endDate": "end month year"}],
  "projects": [{"name": "project name", "description": "what you did", "technologies": ["tech1", "tech2"]}],
  "certifications": [{"name": "certification name", "issuer": "issuing organization", "year": "year"}],
  "languages": ["English", "Hindi"]
}

IMPORTANT: Separate internships from experience. Internships are typically short-term positions (2-6 months) at companies as a student, usually labeled as "Intern", "Internship", "Trainee", or similar.

Resume text:
${text.slice(0, 8000)}

Return ONLY valid JSON:`;

    try {
      const aiResponse = await ollamaService.generate(prompt, 'You are a helpful resume parser. Return only valid JSON, no extra text.');
      
      if (!aiResponse || aiResponse.trim().length === 0) {
        console.log('AI response empty, falling back to regex');
        return this.parseResumeSimple(text);
      }
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiParsed = JSON.parse(jsonMatch[0]);
        
        return {
          name: aiParsed.name || basic.name || 'Not provided',
          email: basic.email || aiParsed.email || 'Not provided',
          phone: basic.phone || aiParsed.phone || '',
          linkedin: aiParsed.linkedin || '',
          portfolio: aiParsed.portfolio || '',
          skills: Array.isArray(aiParsed.skills) ? aiParsed.skills : [],
          technicalSkills: Array.isArray(aiParsed.skills) ? aiParsed.skills : [],
          softSkills: [],
          projects: Array.isArray(aiParsed.projects) ? aiParsed.projects.map((p: any) => ({
            name: p.name || '',
            description: p.description || '',
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
            url: p.url || ''
          })) : [],
          education: Array.isArray(aiParsed.education) ? aiParsed.education.map((e: any) => ({
            institution: e.institution || '',
            degree: e.degree || '',
            field: e.field || '',
            year: e.year || '',
            grade: e.grade || ''
          })) : [],
          experience: Array.isArray(aiParsed.experience) ? aiParsed.experience.map((e: any) => ({
            company: e.company || '',
            position: e.position || '',
            duration: e.duration || '',
            description: e.description || '',
            isCurrent: e.duration?.toLowerCase().includes('present') || false
          })) : [],
          internships: Array.isArray(aiParsed.internships) ? aiParsed.internships.map((i: any) => ({
            company: i.company || '',
            position: i.position || '',
            duration: i.duration || '',
            description: i.description || '',
            startDate: i.startDate || '',
            endDate: i.endDate || ''
          })) : [],
          certifications: Array.isArray(aiParsed.certifications) ? aiParsed.certifications.map((c: any) => ({
            name: c.name || '',
            issuer: c.issuer || '',
            year: c.year || '',
            url: c.url || ''
          })) : [],
          languages: Array.isArray(aiParsed.languages) ? aiParsed.languages : [],
          summary: aiParsed.summary || '',
          isFresher: (!aiParsed.experience || aiParsed.experience.length === 0) && (!aiParsed.internships || aiParsed.internships.length === 0)
        };
      }
    } catch (aiError) {
      console.error('AI parsing failed:', aiError);
    }
    
    return this.parseResumeSimple(text);
  }

  private async extractFileContent(filePath: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, filePath);
    console.log('Reading file from:', fullPath);
    try {
      const buffer = await fs.readFile(fullPath);
      console.log('File buffer size:', buffer.length, 'bytes');
      
      if (filePath.toLowerCase().endsWith('.pdf')) {
        console.log('Parsing PDF...');
        const pdfData = await pdfParse(buffer);
        console.log('PDF text extracted, length:', pdfData.text.length);
        console.log('First 500 chars:', pdfData.text.substring(0, 500));
        return pdfData.text;
      }
      
      console.log('Reading as text, length:', buffer.length);
      const text = buffer.toString('utf-8');
      console.log('First 500 chars:', text.substring(0, 500));
      return text;
    } catch (error: any) {
      console.error('Error extracting file content:', error.message);
      return '';
    }
  }

  private parseResumeSimple(text: string): IParsedData {
    console.log('=== SECTION-BASED PARSING ===');
    const lower = text.toLowerCase();
    
    // Find all section positions
    const sectionKeywords = [
      'summary', 'objective', 'about',
      'skills', 'technical skills',
      'education', 'academic', 'qualification',
      'experience', 'work history', 'employment',
      'projects', 'portfolio',
      'certifications', 'certificates', 'badges',
      'languages', 'language'
    ];
    
    const sectionPositions: {name: string; pos: number}[] = [];
    for (const kw of sectionKeywords) {
      const pos = lower.indexOf(kw);
      if (pos !== -1) sectionPositions.push({name: kw, pos});
    }
    sectionPositions.sort((a, b) => a.pos - b.pos);
    
    // Build sections map
    const sections: Record<string, string> = {};
    for (let i = 0; i < sectionPositions.length; i++) {
      const curr = sectionPositions[i];
      const next = sectionPositions[i + 1];
      const start = curr.pos + curr.name.length;
      const end = next ? next.pos : text.length;
      const content = text.substring(start, end).trim();
      if (content.length > 10) sections[curr.name] = content;
    }
    
    console.log('Sections found:', Object.keys(sections));
    if (sections['projects']) {
      console.log('PROJECT SECTION:', sections['projects'].substring(0, 200));
    }
    
    // Extract basic info
    const email = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/)?.[0] || '';
    const phone = text.match(/\+?\d[\d\s\-\(\)]{9,}/)?.[0]?.replace(/\s+/g, ' ').trim() || '';
    
    // Name from first lines
    let name = '';
    const lines = text.split('\n');
    for (const line of lines.slice(0, 10)) {
      const trimmed = line.trim();
      if (trimmed.includes('@') || /^\+?\d[\d\s\-]{8,}$/.test(trimmed)) continue;
      const clean = trimmed.replace(/\s{2,}\+?\d[\d\s\-\(\)]{7,}.*$/, '').trim();
      const words = clean.split(/\s+/).filter(w => /^[A-Z][a-zA-Z]*$/.test(w));
      if (words.length >= 2 && words.length <= 5) {
        name = words.join(' ');
        break;
      }
    }
    
    // Skills
    const skillList = [
      'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'AWS', 'Machine Learning',
      'ML', 'Data Analysis', 'Pandas', 'NumPy', 'React', 'Node.js', 'Docker', 'Kubernetes',
      'TensorFlow', 'PyTorch', 'Excel', 'Power BI', 'Tableau', 'C++', 'C#', 'Go', 'Rust',
      'PHP', 'Swift', 'Kotlin', 'Angular', 'Vue.js', 'Next.js', 'Django', 'Flask', 'FastAPI',
      'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Azure', 'GCP', 'Git', 'Linux',
      'HTML', 'CSS', 'Bootstrap', 'Tailwind', 'REST API', 'GraphQL', 'Agile', 'Scrum', 'Figma'
    ];
    const skills = skillList.filter(s => lower.includes(s.toLowerCase()));
    
    // Summary from section
    let summary = sections['summary'] || sections['objective'] || sections['about'] || '';
    if (summary) summary = summary.substring(0, 500);
    
    // Education - combine all into ONE entry
    const edu: any[] = [];
    const eduKeys = ['education', 'academic', 'qualification'];
    for (const key of eduKeys) {
      if (sections[key]) {
        // Get ALL education content as ONE entry
        const eduContent = sections[key];
        // Extract degree
        const degreeMatch = eduContent.match(/(B\.?Tech|B\.?E\.?|M\.?Tech|M\.?E\.?|B\.?Sc|M\.?Sc|Ph\.?D|Diploma)/i);
        // Extract field (look for "in" or "of" followed by AI/ML/CS etc)
        const fieldMatch = eduContent.match(/(?:in|of|[-–—])\s*([A-Za-z\s&]+?(?:Intelligence|Machine Learning|Computer Science|Data Science|Engineering))/i);
        // Extract institution (look for college names)
        const instMatch = eduContent.match(/([A-Z][a-zA-Z\s]+(?:Institute|College|University|School))/);
        // Extract year
        const yearMatch = eduContent.match(/\b(20[12]\d|19[89]\d)\b/);
        // Extract grade
        const gradeMatch = eduContent.match(/(?:CGPA|GPA|percentage|%)[:\s]*(\d+\.?\d*)/i);
        
        if (degreeMatch || eduContent.length > 20) {
          edu.push({
            degree: degreeMatch?.[0] || 'Bachelor',
            field: fieldMatch?.[1]?.trim() || '',
            institution: instMatch?.[1]?.trim() || eduContent.split('\n')[0].substring(0, 60),
            year: yearMatch?.[0] || '',
            grade: gradeMatch?.[1] || ''
          });
        }
        break;
      }
    }
    
    // Projects - Get ALL projects from resume
    let proj: any[] = [];
    const projKeys = ['projects', 'portfolio'];
    
    // Helper function to parse projects from text
    const parseProjectsFromText = (projContent: string, skills: string[]): any[] => {
      const result: any[] = [];
      const blocks = projContent.split(/(?:^|\n)\s*[-•*]\s*/);
      
      for (const block of blocks) {
        const trimmed = block.trim();
        if (trimmed.length < 15) continue;
        if (trimmed.toLowerCase().startsWith('project') && trimmed.length < 30) continue;
        if (trimmed.toLowerCase().startsWith('portfolio')) continue;
        
        const lines = trimmed.split('\n');
        const title = lines[0].trim();
        const description = lines.slice(1).join(' ').trim() || trimmed;
        const projTechs = skills.filter(s => description.toLowerCase().includes(s.toLowerCase()));
        
        result.push({ name: title, description, technologies: projTechs.slice(0, 5), url: '' });
      }
      return result;
    };
    
    // First try to find from sections
    for (const key of projKeys) {
      if (sections[key]) {
        proj = parseProjectsFromText(sections[key], skills);
        if (proj.length > 0) break;
      }
    }
    
    // Fallback: search entire resume
    if (proj.length === 0) {
      const projMatch = text.match(/(?:projects?|portfolio)[\s\S]{0,3000}/i);
      if (projMatch) {
        proj = parseProjectsFromText(projMatch[0], skills);
      }
    }
    
    console.log('Projects found:', proj.length);

    // Experience
    const exp: any[] = [];
    const expKeys = ['experience', 'work history', 'employment'];
    for (const key of expKeys) {
      if (sections[key]) {
        if (sections[key].toLowerCase().includes('fresher')) {
          exp.push({company: 'Fresher', position: 'Fresher', duration: 'Present', description: 'Looking for opportunities', isCurrent: true});
        } else {
          const expLines = sections[key].split('\n').filter(l => l.trim().length > 5);
          for (const line of expLines) {
            const hasDate = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4}/i.test(line);
            const hasTitle = /(engineer|developer|analyst|manager|intern|trainee|consultant)/i.test(line);
            if ((hasDate || hasTitle) && line.length > 10 && line.length < 100) {
              exp.push({company: '', position: line.replace(/^[-•*]\s*/, '').trim(), duration: '', description: '', isCurrent: false});
            }
          }
        }
        break;
      }
    }
    
    // Certifications
    const cert: any[] = [];
    const certKeys = ['certifications', 'certificates', 'certification', 'badges'];
    for (const key of certKeys) {
      if (sections[key]) {
        const certLines = sections[key].split('\n').filter(l => l.trim().length > 5);
        for (const line of certLines.slice(0, 8)) {
          const certName = line.replace(/^[-•*]\s*/, '').trim();
          if (certName.length > 8 && !certName.toLowerCase().startsWith('certif')) {
            const yearMatch = certName.match(/\b(20[12]\d|19[89]\d)\b/);
            cert.push({name: certName.substring(0, 80), issuer: '', year: yearMatch?.[0] || ''});
          }
        }
        break;
      }
    }
    
    // Languages
    const languages: string[] = [];
    if (sections['languages'] || sections['language']) {
      const langText = (sections['languages'] || sections['language']).toLowerCase();
      const langs = ['English', 'Hindi', 'Telugu', 'Tamil', 'French', 'German', 'Spanish', 'Chinese', 'Japanese'];
      for (const l of langs) if (langText.includes(l.toLowerCase())) languages.push(l);
    }
    
    // Fresher
    const isFresher = lower.includes('fresher') || exp.length === 0;
    if (isFresher && exp.length === 0) {
      exp.push({company: 'Fresher', position: 'Fresher', duration: 'Present', description: 'Looking for opportunities', isCurrent: true});
    }
    
    // Extract internships
    const intern: any[] = [];
    const internKeys = ['internship', 'internships', 'internship experience', 'summer internship', 'winter internship'];
    for (const key of internKeys) {
      if (sections[key] || lower.includes(key)) {
        const internContent = sections[key] || '';
        const internBlocks = internContent.split(/(?:^|\n)\s*[-•*]\s*/).filter((b: string) => b.trim().length > 10);
        
        for (const block of internBlocks) {
          const trimmed = block.trim();
          if (trimmed.length < 15) continue;
          
          const lines = trimmed.split('\n');
          const title = lines[0].replace(/^[-•*]\s*/, '').trim();
          const description = lines.slice(1).join(' ').trim() || trimmed;
          
          const dateMatch = trimmed.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,-]*(20[12]\d)/i);
          const durationMatch = trimmed.match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,-]*(20[12]\d)[\s,-]*(?:to|-)[\s,-]*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?[a-z]*[\s,-]*(20[12]\d|present)/i);
          
          intern.push({
            company: title.includes('at') ? title.split('at')[1]?.trim() || '' : '',
            position: title.replace(/@.*$/, '').trim(),
            duration: durationMatch ? durationMatch[0] : (dateMatch ? dateMatch[0] : ''),
            description: description.substring(0, 300),
            startDate: dateMatch ? dateMatch[0] : '',
            endDate: ''
          });
        }
        break;
      }
    }
    
    console.log('=== EXTRACTED ===', {name, email, skills: skills.length, edu: edu.length, proj: proj.length, exp: exp.length, intern: intern.length, cert: cert.length});
    
    return {
      name: name || email.split('@')[0] || 'Not provided',
      email: email || 'Not provided',
      phone,
      linkedin: '',
      portfolio: '',
      skills,
      technicalSkills: skills,
      softSkills: [],
      projects: proj,
      education: edu,
      experience: exp,
      internships: intern,
      certifications: cert,
      languages,
      summary: summary || '',
      isFresher: isFresher && intern.length === 0
    };
  }

  private getEmptyData(): IParsedData {
    return {
      name: 'Not provided',
      email: 'Not provided',
      phone: '',
      linkedin: '',
      portfolio: '',
      skills: [],
      technicalSkills: [],
      softSkills: [],
      projects: [],
      education: [],
      experience: [{company: 'Fresher', position: 'Fresher', duration: 'Present', description: 'Looking for opportunities', isCurrent: true}],
      internships: [],
      certifications: [],
      languages: [],
      summary: '',
      isFresher: true
    };
  }

  private extractBasicInfo(text: string): { name: string; email: string; phone: string } {
    const email = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/)?.[0] || '';
    const phone = text.match(/\+?\d[\d\s\-\(\)]{9,}/)?.[0]?.replace(/\s+/g, ' ').trim() || '';
    
    let name = '';
    const lines = text.split('\n');
    for (const line of lines.slice(0, 10)) {
      const trimmed = line.trim();
      if (trimmed.includes('@') || /^\+?\d[\d\s\-]{8,}$/.test(trimmed)) continue;
      const clean = trimmed.replace(/\s{2,}\+?\d[\d\s\-\(\)]{7,}.*$/, '').trim();
      const words = clean.split(/\s+/).filter(w => /^[A-Z][a-zA-Z]*$/.test(w));
      if (words.length >= 2 && words.length <= 5) {
        name = words.join(' ');
        break;
      }
    }
    
    return { name, email, phone };
  }

  async getResume(resumeId: string, userId: string): Promise<IResume> {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }
    return resume;
  }

  async getUserResumes(userId: string): Promise<IResume[]> {
    return Resume.find({ userId }).sort({ createdAt: -1 });
  }

  async deleteResume(resumeId: string, userId: string): Promise<void> {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }
    
    const filePath = path.join(this.uploadDir, resume.filePath);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete file:', error);
    }
    
    await Resume.deleteOne({ _id: resumeId });
  }

  async updateResume(resumeId: string, userId: string, updates: Partial<IParsedData>): Promise<IResume> {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (updates.skills) resume.parsedData.skills = updates.skills;
    if (updates.technicalSkills) resume.parsedData.technicalSkills = updates.technicalSkills;
    if (updates.projects) resume.parsedData.projects = updates.projects;
    if (updates.education) resume.parsedData.education = updates.education;
    if (updates.experience) resume.parsedData.experience = updates.experience;
    if (updates.internships) resume.parsedData.internships = updates.internships;
    if (updates.summary !== undefined) resume.parsedData.summary = updates.summary;
    if (updates.name) resume.parsedData.name = updates.name;
    if (updates.email) resume.parsedData.email = updates.email;
    if (updates.phone) resume.parsedData.phone = updates.phone;
    if (updates.certifications) resume.parsedData.certifications = updates.certifications;
    if (updates.languages) resume.parsedData.languages = updates.languages;

    await resume.save();
    return resume;
  }

  async generateReport(resumeId: string, userId: string): Promise<Buffer> {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Resume Analysis Report', { align: 'center' });
      doc.moveDown();
      
      if (resume.parsedData.name) {
        doc.fontSize(16).text(`Name: ${resume.parsedData.name}`);
      }
      if (resume.parsedData.email) {
        doc.fontSize(12).text(`Email: ${resume.parsedData.email}`);
      }
      if (resume.parsedData.phone) {
        doc.fontSize(12).text(`Phone: ${resume.parsedData.phone}`);
      }
      doc.moveDown();
      
      if (resume.parsedData.skills?.length) {
        doc.fontSize(14).text('Skills:');
        doc.fontSize(12).text(resume.parsedData.skills.join(', '));
        doc.moveDown();
      }
      
      if (resume.parsedData.education?.length) {
        doc.fontSize(14).text('Education:');
        resume.parsedData.education.forEach(edu => {
          doc.fontSize(12).text(`${edu.degree} in ${edu.field} at ${edu.institution} (${edu.year})`);
        });
        doc.moveDown();
      }
      
      if (resume.parsedData.projects?.length) {
        doc.fontSize(14).text('Projects:');
        resume.parsedData.projects.forEach(proj => {
          doc.fontSize(12).text(`- ${proj.name}: ${proj.description}`);
        });
        doc.moveDown();
      }
      
      doc.end();
    });
  }

  private async evaluateResumeWithAI(parsedData: IParsedData, rawText: string): Promise<{
    score: number;
    feedback: { strengths: string[]; weaknesses: string[]; overall: string };
    suggestions: string[];
  }> {
    const prompt = `You are an ATS (Applicant Tracking System) expert and resume reviewer. Analyze the following resume and provide:

1. ATS Score (0-100) - based on: format clarity, keyword density, skills match, experience relevance, education completeness
2. Strengths (3-5 points)
3. Weaknesses (3-5 points)  
4. Improvement suggestions (5-7 actionable items)

Resume parsed data:
${JSON.stringify(parsedData, null, 2)}

Raw resume text:
${rawText.slice(0, 4000)}

Return ONLY valid JSON with this exact structure:
{
  "score": number (0-100),
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "overall": "2-3 sentence overall assessment",
  "suggestions": ["suggestion1", "suggestion2", ...]
}`;

    try {
      const aiResponse = await ollamaService.generate(prompt, 'You are an ATS resume expert. Return only valid JSON.');
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(100, Math.max(0, result.score || 70)),
          feedback: {
            strengths: Array.isArray(result.strengths) ? result.strengths : [],
            weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
            overall: result.overall || ''
          },
          suggestions: Array.isArray(result.suggestions) ? result.suggestions : []
        };
      }
    } catch (error) {
      console.error('ATS evaluation failed:', error);
    }

    return {
      score: 70,
      feedback: {
        strengths: ['Basic information present', 'Skills section found', 'Education details included'],
        weaknesses: ['No work experience', 'Missing certifications'],
        overall: 'Standard resume format. Consider adding more projects and certifications.'
      },
      suggestions: [
        'Add more technical projects with descriptions',
        'Include relevant certifications',
        'Add a professional summary',
        'List key achievements in each role',
        'Include keywords from target job descriptions'
      ]
    };
  }
}

export const resumeService = new ResumeService();
