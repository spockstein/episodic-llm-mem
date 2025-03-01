# episodic-mem-js

**A Node.js library for episodic vector memory, inspired by human memory models, designed for long-context applications.**

This library provides an `EpisodicVectorMemory` class that implements an episodic memory system for storing and querying vector embeddings. It is inspired by human episodic memory and is designed to handle long conversational contexts and extended sequences of information by segmenting memories into time-based events and offering a two-stage retrieval process.

## Features

*   **Episodic Event Segmentation:** Automatically groups vectors added within a configurable time window into episodic events.
*   **Cosine Similarity Search:**  Efficiently queries memory using cosine similarity to find semantically relevant events.
*   **Temporal Contiguity Retrieval:**  Retrieves not only similar events but also temporally adjacent events to maintain context flow, mimicking human memory recall patterns.
*   **Persistence:**  Save and load memory to/from JSON files for persistence across sessions.
*   **Designed for Long Context:**  Suitable for applications dealing with extended conversations, document processing, and scenarios requiring long-term memory.
*   **Easy to Use:** Simple API for adding, querying, saving, and loading vector memories.

## Installation

```bash
npm install episodic-mem-js
Use code with caution.
Markdown
Usage
const EpisodicVectorMemory = require('episodic-mem-js');

const memory = new EpisodicVectorMemory(); // Using default settings

// Add vectors to memory, simulating a conversation or sequence of events
memory.add([1, 0, 0], "Document 1 content", { source: "file1.txt" });
memory.add([0, 1, 0], "Document 2 content", { source: "file2.pdf" });
memory.add([0, 0, 1], "Document 3 content", { source: "webpage.html" });

// Simulate a time gap to create a new event (if using default time threshold)
setTimeout(() => {
    memory.add([0.8, 0, 0], "Document 4 content (later event)", { source: "file4.txt" });

    // Query for similar vectors
    const queryVector = [0.9, 0.1, 0];
    const results = memory.query(queryVector, 2); // Get top 2 results with temporal context

    console.log("Query Results (Vectors):");
    results.forEach(vector => {
        console.log("- Vector:", vector);
        // You can access aggregated text or metadata if you stored them
        // (Note: Current query returns vectors, you might modify it to return events if needed)
    });

    // Save memory to a file
    memory.save('my_episodic_memory.json');

    // Load memory from a file
    const loadedMemory = new EpisodicVectorMemory();
    loadedMemory.load('my_episodic_memory.json');

    console.log("\nLoaded Memory Query Results:");
    const loadedResults = loadedMemory.query(queryVector, 1);
    loadedResults.forEach(vector => {
        console.log("- Vector (Loaded):", vector);
    });

}, 6000); // 6 seconds timeout to simulate time gap for event segmentation (adjust based on eventTimeThreshold)
Use code with caution.
JavaScript
Explanation of Usage Example:

Import EpisodicVectorMemory: const EpisodicVectorMemory = require('episodic-mem-js'); imports the class.

Create Instance: const memory = new EpisodicVectorMemory(); creates a new memory instance with default settings.

add(vector, text, metadata): Adds a vector to the memory.

vector: An array of numbers representing the vector embedding. Required.

text (optional): Descriptive text associated with the vector. Text from vectors within the same event will be aggregated.

metadata (optional): An object containing metadata about the vector. Metadata from vectors within the same event will be aggregated.

query(queryVector, k = 1): Queries the memory for the top k most similar vectors, also including temporally related events.

queryVector: The vector to query with (array of numbers). Required.

k (optional): The number of top similar events to retrieve (default is 1).

Returns: An array of vectors from the top k similar events and their temporally contiguous neighbors. (You can modify the query method to return events instead of vectors if you need event-level information).

save(filepath): Saves the entire memory store to a JSON file.

filepath: The path to the file where memory will be saved (e.g., 'memory.json').

load(filepath): Loads memory from a JSON file.

filepath: The path to the file to load memory from (e.g., 'memory.json'). If the file doesn't exist, it starts with an empty memory.

Constructor Options
You can customize the behavior of EpisodicVectorMemory by passing an options object to the constructor:

const memory = new EpisodicVectorMemory({
    eventTimeThreshold: 600000, // 10 minutes in milliseconds
    temporalContextWindow: 3 // Retrieve +/- 3 temporally adjacent events
});
Use code with caution.
JavaScript
eventTimeThreshold (milliseconds):

Determines the time gap (in milliseconds) that signifies the start of a new episodic event.

If a new vector is added and the time elapsed since the last vector in the current event exceeds this threshold, a new event is created.

Default: 300000 (5 minutes).

temporalContextWindow (integer):

Controls the number of temporally adjacent events to retrieve during a query, in addition to the semantically similar events.

For each top similar event found, the library will also retrieve events that were added within +/- temporalContextWindow events in the memory's chronological order.

Helps maintain conversational or sequential context in retrieval results.

Default: 2 (retrieves up to 2 events before and 2 events after each similar event).

API Reference
EpisodicVectorMemory Class
constructor(options?: { eventTimeThreshold?: number, temporalContextWindow?: number })
options (optional): An object to configure the memory behavior.

eventTimeThreshold (number, optional): Time threshold for event segmentation (milliseconds).

temporalContextWindow (number, optional): Number of temporally adjacent events to retrieve.

add(vector: number[], text?: string | null, metadata?: object | null): void
Adds a new vector to the episodic memory.

vector (number[]): The vector embedding to store.

text (string | null, optional): Text associated with the vector.

metadata (object | null, optional): Metadata associated with the vector.

Throws:

Error: If vector is not an array or does not contain only numbers.

query(queryVector: number[], k?: number): number[]
Queries the episodic memory for vectors similar to the queryVector.

queryVector (number[]): The vector to query with.

k (number, optional): The number of top similar events (and their temporal context) to retrieve. Default is 1.

Returns:

number[]: An array of vectors from the top k similar events and their temporally contiguous neighbors, sorted by similarity (descending). Returns an empty array if memory is empty.

Throws:

Error: If queryVector is not an array or does not contain only numbers.

save(filepath: string): void
Saves the entire episodic memory to a JSON file.

filepath (string): The path to the file where memory will be saved.

Throws:

Error: If there is an error during file writing.

load(filepath: string): void
Loads episodic memory from a JSON file. If the file does not exist, it initializes with an empty memory store.

filepath (string): The path to the file to load memory from.

Throws:

Error: If there is an error during file reading or JSON parsing (except for ENOENT error when file is not found, in which case it starts with empty memory).

Further Customization
Segmentation Strategies: You can explore more sophisticated event segmentation methods beyond time-based thresholds, such as topic modeling or surprise-based segmentation (as inspired by the research paper).

Similarity Metrics: The library currently uses cosine similarity. You could extend it to support other similarity metrics (e.g., Euclidean distance, dot product) if needed.

Vector Database Integration: For very large-scale memory, consider integrating with a dedicated vector database for optimized storage and retrieval.

License
MIT License

Spockstein
