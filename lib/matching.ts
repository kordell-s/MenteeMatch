import { TfIdf, WordTokenizer } from 'natural';
import * as fs from 'fs';
import * as path from 'path';

// --- Import pre-processed embeddings ---
import optimizedEmbeddings from './optimized-embeddings.json';

// --- Global Word Embeddings Storage ---
interface WordEmbeddings {
  [word: string]: number[];
}

let loadedWordEmbeddings: WordEmbeddings | null = null;
const embeddingDimensions = 50; // Fixed dimension for optimized embeddings
let lastLoadTime: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// A basic set of English stopwords
const stopwords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
]);

// --- Helper function for text pre-processing ---
const preprocessText = (text: string): string[] => {
  const tokenizer = new WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  if (!tokens) return [];
  return tokens.filter(token => !stopwords.has(token) && /^[a-zA-Z]+$/.test(token));
};

// --- Helper function to calculate cosine similarity ---
const cosineSimilarity = (vecA: number[] | null, vecB: number[] | null): number => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

// --- FAST: Load pre-processed embeddings ---
const loadWordEmbeddings = (): Promise<WordEmbeddings> => {
  return new Promise((resolve) => {
    const now = Date.now();
    
    // Return cached embeddings if still fresh
    if (loadedWordEmbeddings && (now - lastLoadTime) < CACHE_DURATION) {
      console.log("✅ Using cached word embeddings from memory");
      return resolve(loadedWordEmbeddings);
    }

    console.log('⚡ Loading optimized embeddings from JSON...');
    const startTime = performance.now();
    
    try {
      // Use the pre-processed JSON embeddings (much faster!)
      loadedWordEmbeddings = optimizedEmbeddings as WordEmbeddings;
      lastLoadTime = now;
      
      const loadTime = (performance.now() - startTime).toFixed(2);
      console.log(`✅ Loaded ${Object.keys(loadedWordEmbeddings).length} optimized embeddings in ${loadTime}ms`);
      
      resolve(loadedWordEmbeddings);
    } catch (error) {
      console.error('❌ Error loading optimized embeddings:', error);
      console.log('💡 Make sure to run: node scripts/prepare-embeddings.js');
      
      // Fallback to empty embeddings to prevent crashes
      loadedWordEmbeddings = {};
      resolve(loadedWordEmbeddings);
    }
  });
};

// --- Helper function to get document vector from word embeddings ---
const getDocumentVector = (text: string, embeddings: WordEmbeddings): number[] | null => {
  const tokens = preprocessText(text);
  const wordVectors = tokens
    .map(token => embeddings[token])
    .filter(v => v && v.length === embeddingDimensions);
  
  if (wordVectors.length === 0) return null;

  const docVector = new Array(embeddingDimensions).fill(0);
  wordVectors.forEach(vec => {
    for (let i = 0; i < embeddingDimensions; i++) {
      docVector[i] += vec[i];
    }
  });
  return docVector.map(val => val / wordVectors.length);
};

// --- Helper function to calculate TF-IDF vector ---
const getTfidfVector = (text: string, allTerms: string[], tfidf: TfIdf): number[] => {
  const vector = new Array(allTerms.length).fill(0);
  const textScores = new TfIdf();
  textScores.addDocument(preprocessText(text).join(' '));
  allTerms.forEach((term, index) => {
    vector[index] = textScores.tfidf(term, 0);
  });
  return vector;
};

// --- Main function to get mentor recommendations ---
export const getMentorRecommendations = async (menteeInput: string, mentors: any[]) => {
  const startTime = performance.now();
  console.log(`🧠 Starting recommendation for ${mentors.length} mentors...`);

  // Early return for empty input
  if (!menteeInput.trim() || mentors.length === 0) {
    console.log("⚠️ No input or mentors provided");
    return [];
  }

  try {
    // Load embeddings (cached after first load)
    const embeddings = await loadWordEmbeddings();
    
    // Pre-process mentee input once
    const menteeTokens = preprocessText(menteeInput);
    console.log(`📝 Mentee tokens: ${menteeTokens.length} words`);

    // DEBUG: Check token coverage (only in development)
    if (process.env.NODE_ENV === 'development') {
      const foundTokens = menteeTokens.filter(token => embeddings[token]);
      console.log(`🔍 Mentee tokens found in embeddings: ${foundTokens.length}/${menteeTokens.length}`);
      if (foundTokens.length > 0) {
        console.log(`📚 Sample found tokens: ${foundTokens.slice(0, 5).join(', ')}`);
      }
    }

    // --- Part 1: TF-IDF Calculation ---
    console.log("📊 Calculating TF-IDF scores...");
    const tfidf = new TfIdf();
    
    // Add all mentor documents to TF-IDF
    const mentorTexts = mentors.map(mentor => {
      // Weight skills and specialization more heavily by repeating them
      const skillsText = mentor.skills.join(' ').repeat(3); // 3x weight for skills
      const specializationText = (mentor.specialization || []).join(' ').repeat(2); // 2x weight for specialization
      const bioText = mentor.bio || '';

      const text = `${skillsText} ${specializationText} ${bioText}`;
      const processedText = preprocessText(text).join(' ');
      tfidf.addDocument(processedText);
      return text;
    });

    // Get all terms and create vector function
    const allTerms = tfidf.listTerms(0).map(term => term.term);
    console.log(`📚 TF-IDF vocabulary: ${allTerms.length} terms`);

    // Calculate mentee TF-IDF vector once
    const menteeVectorTfidf = getTfidfVector(menteeInput, allTerms, tfidf);
    
    // Calculate TF-IDF scores for all mentors
    const tfidfScores = mentors.map((_, index) => {
      const mentorVector = allTerms.map(term => tfidf.tfidf(term, index));
      return cosineSimilarity(menteeVectorTfidf, mentorVector);
    });

    // --- Part 2: Word Embeddings Calculation ---
    console.log("🔤 Calculating word embedding scores...");
    
    // Calculate embedding vectors
    const menteeVectorW2V = getDocumentVector(menteeInput, embeddings);
    const wordEmbeddingsScores = mentors.map((mentor, index) => {
      const mentorVectorW2V = getDocumentVector(mentorTexts[index], embeddings);
      return cosineSimilarity(menteeVectorW2V, mentorVectorW2V);
    });

    // --- Part 3: Combine Scores and Rank ---
    console.log("🎯 Combining scores and ranking...");
    
    const hybridScores = mentors.map((mentor, index) => {
      const tfidfWeight = 0.4;
      const wordEmbeddingsWeight = 0.6;

      const tfidfScore = tfidfScores[index] || 0;
      const embeddingScore = wordEmbeddingsScores[index] || 0;
      const finalScore = (tfidfScore * tfidfWeight) + (embeddingScore * wordEmbeddingsWeight);
      
      return { 
        ...mentor, 
        score: finalScore,
        _debug: process.env.NODE_ENV === 'development' ? {
          tfidfScore: tfidfScore.toFixed(3),
          embeddingScore: embeddingScore.toFixed(3)
        } : undefined
      };
    });

    // Sort by score
    const rankedMentors = hybridScores.sort((a, b) => b.score - a.score);
    
    const endTime = performance.now();
    const totalTime = (endTime - startTime).toFixed(2);
    
    console.log(`✅ Recommendations completed in ${totalTime}ms`);
    console.log(`🏆 Top 3 scores: ${rankedMentors.slice(0, 3).map(m => (m.score * 100).toFixed(1) + '%').join(', ')}`);

    // Log performance improvement
    if (parseFloat(totalTime) < 1000) {
      console.log(`🚀 Performance: FAST! (${totalTime}ms)`);
    }

    return rankedMentors;

  } catch (error) {
    const endTime = performance.now();
    console.error(`❌ Error in recommendation algorithm after ${(endTime - startTime).toFixed(2)}ms:`, error);
    
    // Return empty array instead of throwing
    return [];
  }
};