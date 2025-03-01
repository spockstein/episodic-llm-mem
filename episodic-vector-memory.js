const { similarity } = require('ml-distance');
const fs = require('fs');

function cosineSimilarity(vecA, vecB) {
    return similarity.cosine(vecA, vecB);
}

class EpisodicVectorMemory { // Renamed for clarity
    constructor(options = {}) {
        const { 
            eventTimeThreshold = 300000, 
            temporalContextWindow = 2 
        } = options;

        this.memoryStore = []; // Array to hold episodic events
        this.currentEvent = null; // Track the current event being built
        this.eventTimeThreshold = eventTimeThreshold;
        this.temporalContextWindow = temporalContextWindow;
        this.lastEventTimestamp = null; // Track the timestamp of the last event
    }

    add(vector, text = null, metadata = null) {
        // Input validations
        if (!Array.isArray(vector)) {
            throw new Error("Vector must be an array of numbers.");
        }
        if (!vector.every(Number.isFinite)) {
            throw new Error("Vector must contain only numbers.");
        }

        const currentTime = Date.now();

        // Determine if we need a new event
        const shouldCreateNewEvent = !this.currentEvent || 
            (currentTime - this.lastEventTimestamp > this.eventTimeThreshold);

        if (shouldCreateNewEvent) {
            // Create a new event
            this.currentEvent = {
                timestamp: currentTime,
                vectors: [vector],
                texts: text ? [text] : [],
                metadata: metadata ? [metadata] : []
            };
            this.memoryStore.push(this.currentEvent);
            this.lastEventTimestamp = currentTime;
        } else {
            // Add to current event
            this.currentEvent.vectors.push(vector);
            if (text) this.currentEvent.texts.push(text);
            if (metadata) this.currentEvent.metadata.push(metadata);
        }

        return this; // Allow method chaining
    }

    query(queryVector, k = 1) {
        if (!Array.isArray(queryVector)) {
            throw new Error("Query vector must be an array of numbers.");
        }
        if (!queryVector.every(Number.isFinite)) {
            throw new Error("Query vector must contain only numbers.");
        }

        if (this.memoryStore.length === 0) {
            return [];
        }

        const resultsWithSimilarity = this.memoryStore.map(event => {
            let avgSimilarity = 0;
            if (event.vectors.length > 0) {
                avgSimilarity = event.vectors.reduce((sum, vec) => 
                    sum + cosineSimilarity(queryVector, vec), 0) / event.vectors.length;
            }
            return {
                event: event,
                similarity: avgSimilarity
            };
        });

        // Sort by similarity in descending order
        resultsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

        // Select top k events
        const topKSimilarEvents = resultsWithSimilarity.slice(0, k);

        // Retrieve events with temporal context
        let retrievedEvents = [];
        topKSimilarEvents.forEach(similarEventResult => {
            const similarEventIndex = this.memoryStore.indexOf(similarEventResult.event);
            
            // Add the similar event
            if (!retrievedEvents.includes(similarEventResult.event)) {
                retrievedEvents.push(similarEventResult.event);
            }

            // Add temporally contiguous events
            for (let i = 1; i <= this.temporalContextWindow; i++) {
                if (similarEventIndex - i >= 0) {
                    const prevEvent = this.memoryStore[similarEventIndex - i];
                    if (!retrievedEvents.includes(prevEvent)) {
                        retrievedEvents.push(prevEvent);
                    }
                }
                if (similarEventIndex + i < this.memoryStore.length) {
                    const nextEvent = this.memoryStore[similarEventIndex + i];
                    if (!retrievedEvents.includes(nextEvent)) {
                        retrievedEvents.push(nextEvent);
                    }
                }
            }
        });

        // Flatten to vectors if needed
        let retrievedVectors = [];
        retrievedEvents.forEach(event => {
            retrievedVectors = retrievedVectors.concat(event.vectors);
        });

        return retrievedVectors;
    }

    save(filepath) {
        try {
            const jsonData = JSON.stringify(this.memoryStore, null, 2);
            fs.writeFileSync(filepath, jsonData, 'utf-8');
        } catch (error) {
            throw error;
        }
    }

    load(filepath) {
        try {
            const jsonData = fs.readFileSync(filepath, 'utf-8');
            this.memoryStore = JSON.parse(jsonData);
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.memoryStore = [];
            } else {
                throw error;
            }
        }
    }
}

module.exports = EpisodicVectorMemory;