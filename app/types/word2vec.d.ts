declare module 'word2vec' {
    interface Word2VecModel {
        size: number;
        getVector(word: string): Word2VecVector | null;
    }

    interface Word2VecVector {
        values: number[];
    }

    export function loadModel(
        path: string, 
        callback: (error: Error | null, model: Word2VecModel | null) => void
    ): void;
}