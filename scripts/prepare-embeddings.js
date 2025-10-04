const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function prepareEmbeddings() {
  console.log('🔄 Creating optimized embeddings file...');
  
  // Tech and mentoring relevant words
  const relevantWords = new Set([
    // === PROGRAMMING LANGUAGES & VARIATIONS ===
    'javascript', 'js', 'typescript', 'ts', 'python', 'java', 'c++', 'cpp', 'c#', 'csharp',
    'php', 'ruby', 'go', 'golang', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab',
    'perl', 'lua', 'dart', 'elixir', 'erlang', 'haskell', 'clojure', 'f#', 'vb.net',
    
    // === WEB TECHNOLOGIES ===
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'bootstrap', 'tailwind',
    'react', 'reactjs', 'vue', 'vuejs', 'angular', 'angularjs', 'svelte', 'ember',
    'jquery', 'backbone', 'knockout', 'polymer', 'lit', 'web', 'webapp', 'website',
    'frontend', 'backend', 'fullstack', 'full-stack', 'responsive', 'spa', 'pwa',
    
    // === FRAMEWORKS & LIBRARIES ===
    'node', 'nodejs', 'express', 'fastify', 'koa', 'nextjs', 'nuxt', 'gatsby',
    'django', 'flask', 'fastapi', 'spring', 'springboot', 'rails', 'laravel',
    'symfony', 'codeigniter', 'asp.net', 'blazor', 'gin', 'fiber', 'echo',
    'redux', 'mobx', 'vuex', 'pinia', 'rxjs', 'lodash', 'axios', 'fetch',
    
    // === DATABASES & DATA ===
    'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'redis', 'cassandra',
    'dynamodb', 'elasticsearch', 'solr', 'neo4j', 'graphql', 'sql', 'nosql',
    'database', 'db', 'orm', 'sequelize', 'mongoose', 'prisma', 'typeorm',
    'data', 'analytics', 'etl', 'warehouse', 'mining', 'visualization', 'tableau',
    
    // === CLOUD & DEVOPS ===
    'aws', 'azure', 'gcp', 'google', 'cloud', 'docker', 'kubernetes', 'k8s',
    'jenkins', 'gitlab', 'github', 'actions', 'terraform', 'ansible', 'puppet',
    'chef', 'vagrant', 'prometheus', 'grafana', 'elk', 'nginx', 'apache',
    'devops', 'deployment', 'ci/cd', 'pipeline', 'infrastructure', 'microservices',
    
    // === MOBILE DEVELOPMENT ===
    'ios', 'android', 'mobile', 'app', 'flutter', 'dart', 'react-native',
    'ionic', 'cordova', 'phonegap', 'xamarin', 'unity', 'kotlin', 'swift',
    'objective-c', 'java', 'xcode', 'android-studio', 'gradle', 'cocoapods',
    
    // === AI/ML & DATA SCIENCE ===
    'ai', 'ml', 'machine', 'learning', 'artificial', 'intelligence', 'deep',
    'neural', 'network', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
    'pandas', 'numpy', 'matplotlib', 'jupyter', 'notebook', 'colab',
    'opencv', 'nlp', 'computer', 'vision', 'reinforcement', 'supervised',
    'unsupervised', 'classification', 'regression', 'clustering', 'algorithm',
    
    // === TESTING & QUALITY ===
    'testing', 'test', 'unit', 'integration', 'e2e', 'tdd', 'bdd', 'jest',
    'mocha', 'chai', 'cypress', 'selenium', 'playwright', 'puppeteer',
    'junit', 'pytest', 'rspec', 'quality', 'assurance', 'qa', 'debugging',
    
    // === DESIGN & UI/UX ===
    'ui', 'ux', 'design', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
    'xd', 'invision', 'zeplin', 'wireframe', 'prototype', 'mockup', 'usability',
    'accessibility', 'a11y', 'responsive', 'material', 'bootstrap', 'animation',
    
    // === SECURITY & BLOCKCHAIN ===
    'security', 'cybersecurity', 'encryption', 'authentication', 'authorization',
    'oauth', 'jwt', 'ssl', 'tls', 'https', 'vulnerability', 'penetration',
    'blockchain', 'bitcoin', 'ethereum', 'crypto', 'cryptocurrency', 'smart',
    'contracts', 'solidity', 'web3', 'defi', 'nft', 'dapp',
    
    // === SOFT SKILLS & CAREER ===
    'leadership', 'management', 'team', 'teamwork', 'collaboration', 'communication',
    'presentation', 'public', 'speaking', 'networking', 'mentoring', 'coaching',
    'guidance', 'advice', 'career', 'growth', 'development', 'skills', 'training',
    'learning', 'teaching', 'knowledge', 'expertise', 'experience', 'professional',
    
    // === METHODOLOGIES & CONCEPTS ===
    'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'startup', 'mvp', 'prototype',
    'api', 'rest', 'restful', 'soap', 'microservices', 'monolith', 'serverless',
    'event-driven', 'architecture', 'design', 'patterns', 'solid', 'dry', 'kiss',
    'clean', 'code', 'refactoring', 'legacy', 'technical', 'debt', 'scalability',
    
    // === BUSINESS & INDUSTRY ===
    'business', 'startup', 'enterprise', 'saas', 'b2b', 'b2c', 'e-commerce',
    'fintech', 'healthtech', 'edtech', 'proptech', 'martech', 'adtech',
    'consulting', 'freelance', 'remote', 'hybrid', 'office', 'work', 'job',
    'product', 'project', 'portfolio', 'resume', 'cv', 'interview', 'hiring',
    
    // === ROLES & TITLES ===
    'developer', 'engineer', 'programmer', 'coder', 'architect', 'analyst',
    'scientist', 'researcher', 'designer', 'manager', 'director', 'cto', 'ceo',
    'senior', 'junior', 'mid-level', 'lead', 'principal', 'staff', 'intern',
    'student', 'graduate', 'undergraduate', 'phd', 'masters', 'bachelor',
    
    // === EDUCATION & LEARNING ===
    'education', 'university', 'college', 'school', 'course', 'bootcamp',
    'certification', 'certificate', 'degree', 'diploma', 'tutorial', 'workshop',
    'seminar', 'conference', 'meetup', 'hackathon', 'competition', 'challenge',
    'documentation', 'guide', 'manual', 'reference', 'api', 'sdk',
    
    // === TOOLS & PLATFORMS ===
    'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial', 'vscode',
    'intellij', 'eclipse', 'atom', 'sublime', 'vim', 'emacs', 'nano',
    'postman', 'insomnia', 'swagger', 'jira', 'confluence', 'trello',
    'asana', 'notion', 'slack', 'discord', 'teams', 'zoom', 'meet',
    
    // === PERFORMANCE & OPTIMIZATION ===
    'performance', 'optimization', 'caching', 'cdn', 'compression', 'minification',
    'lazy', 'loading', 'bundling', 'webpack', 'vite', 'rollup', 'parcel',
    'monitoring', 'logging', 'metrics', 'analytics', 'sentry', 'datadog',
    
    // === EMERGING TECHNOLOGIES ===
    'iot', 'ar', 'vr', 'mixed', 'reality', 'quantum', 'computing', 'edge',
    '5g', 'chatbot', 'voice', 'assistant', 'alexa', 'siri', 'automation',
    'rpa', 'low-code', 'no-code', 'jamstack', 'headless', 'cms',
    
    // === GENERAL TECH TERMS ===
    'software', 'hardware', 'system', 'platform', 'framework', 'library',
    'module', 'component', 'service', 'application', 'program', 'script',
    'technology', 'tech', 'digital', 'innovation', 'solution', 'implementation',
    'integration', 'migration', 'upgrade', 'maintenance', 'support', 'documentation'
  ]);

  const inputPath = path.join(process.cwd(), 'model', 'wiki_giga_50d.txt');
  const outputPath = path.join(process.cwd(), 'lib', 'optimized-embeddings.json');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    console.log('Please ensure your word embeddings file is at: model/wiki_giga_50d.txt');
    return;
  }

  const stream = fs.createReadStream(inputPath);
  const rl = readline.createInterface({ input: stream });
  
  const optimizedEmbeddings = {};
  let processed = 0;
  let total = 0;

  console.log('📊 Processing embeddings...');
  
  for await (const line of rl) {
    total++;
    if (total % 50000 === 0) {
      console.log(`📝 Processed ${total} lines, found ${processed} relevant words...`);
    }
    
    if (!line.trim()) continue;
    
    const parts = line.split(' ');
    const word = parts[0].toLowerCase();
    
    // Only keep relevant words
    if (relevantWords.has(word)) {
      const vector = parts.slice(1).map(Number);
      if (vector.length === 50 && !vector.some(isNaN)) {
        optimizedEmbeddings[word] = vector;
        processed++;
      }
    }
  }

  // Save as compressed JSON
  fs.writeFileSync(outputPath, JSON.stringify(optimizedEmbeddings));
  
  const stats = fs.statSync(outputPath);
  console.log(`✅ Optimization complete!`);
  console.log(`📦 Original words processed: ${total.toLocaleString()}`);
  console.log(`🎯 Relevant words saved: ${processed.toLocaleString()}`);
  console.log(`💾 Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📂 Saved to: ${outputPath}`);
}

prepareEmbeddings().catch(console.error);