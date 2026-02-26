import { parseAllContent } from './content-parser';

export interface SiteStats {
  totalNotes: number;
  totalBuilds: number;
  totalProjects: number;
  totalNotesCount: number;
  booksReadThisYear: number;
  totalTags: number;
  topTags: Array<{ tag: string; count: number }>;
  totalWordCount: number;
  firstPostDate: string;
  latestPostDate: string;
  linkCount: number;
}

export function generateStats(contentDir: string): SiteStats {
  const { notes } = parseAllContent(contentDir);
  
  const currentYear = new Date().getFullYear();
  
  let totalBuilds = 0;
  let totalProjects = 0;
  let totalNotesCount = 0;
  let booksReadThisYear = 0;
  const tagCounts = new Map<string, number>();
  let totalWordCount = 0;
  let linkCount = 0;
  
  let firstPostDate = '9999-99-99';
  let latestPostDate = '0000-00-00';
  
  for (const note of notes) {
    const date = note.date;
    
    if (date < firstPostDate) firstPostDate = date;
    if (date > latestPostDate) latestPostDate = date;
    
    totalWordCount += note.wordCount;
    linkCount += note.wikilinks.length;
    
    const filePath = note.filePath.toLowerCase();
    if (filePath.includes('/builds/')) {
      totalBuilds++;
    } else if (filePath.includes('/projects/')) {
      totalProjects++;
    } else {
      totalNotesCount++;
    }
    
    if (filePath.includes('/books/') && date.startsWith(currentYear.toString())) {
      const content = note.content.toLowerCase();
      if (content.includes('status') && (content.includes('read') || content.includes('finished'))) {
        booksReadThisYear++;
      }
    }
    
    for (const tag of note.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
  
  const stats: SiteStats = {
    totalNotes: notes.length,
    totalBuilds,
    totalProjects,
    totalNotesCount,
    booksReadThisYear,
    totalTags: tagCounts.size,
    topTags: sortedTags,
    totalWordCount,
    firstPostDate: firstPostDate === '9999-99-99' ? 'N/A' : firstPostDate,
    latestPostDate: latestPostDate === '0000-00-00' ? 'N/A' : latestPostDate,
    linkCount
  };
  
  return stats;
}
