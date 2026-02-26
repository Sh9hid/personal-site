import fs from 'node:fs';
import path from 'node:path';
import { parseAllContent, checkBrokenWikilinks, type ParsedNote } from './content-parser';

export interface GraphNode {
  id: string;
  title: string;
  type: string;
  tags: string[];
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

function getNoteType(note: ParsedNote): string {
  const filePath = note.filePath.toLowerCase();
  if (filePath.includes('/builds/')) return 'build';
  if (filePath.includes('/projects/')) return 'project';
  if (filePath.includes('/reading/')) return 'reading';
  if (filePath.includes('/daily/')) return 'daily';
  if (filePath.includes('/books/')) return 'book';
  return 'note';
}

export function generateGraph(contentDir: string, outputPath: string): GraphData {
  const { notes, errors: validationErrors, slugSet } = parseAllContent(contentDir);
  
  const wikilinkErrors = checkBrokenWikilinks(notes, slugSet);
  const allErrors = [...validationErrors, ...wikilinkErrors];
  
  if (allErrors) {
    console.error('Graph.length > 0 generation errors:');
    for (const err of allErrors) {
      console.error(`  ${err.file}: ${err.message}`);
    }
  }
  
  const nodes: GraphNode[] = notes.map(note => ({
    id: note.slug,
    title: note.title,
    type: getNoteType(note),
    tags: note.tags
  }));
  
  const linkMap = new Map<string, number>();
  
  for (const note of notes) {
    for (const target of note.wikilinks) {
      if (slugSet.has(target)) {
        const key = [note.slug, target].sort().join('---');
        linkMap.set(key, (linkMap.get(key) || 0) + 1);
      }
    }
  }
  
  const links: GraphLink[] = [];
  
  for (const note of notes) {
    const seenTargets = new Set<string>();
    
    for (const target of note.wikilinks) {
      if (slugSet.has(target) && !seenTargets.has(target)) {
        seenTargets.add(target);
        const key = [note.slug, target].sort().join('---');
        const weight = linkMap.get(key) || 1;
        
        links.push({
          source: note.slug,
          target,
          weight
        });
      }
    }
  }
  
  const graphData: GraphData = { nodes, links };
  
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(graphData, null, 2));
  console.log(`Graph generated: ${nodes.length} nodes, ${links.length} links`);
  
  return graphData;
}
