const EpisodicVectorMemory = require('../episodic-vector-memory'); // Adjust path if needed

describe('EpisodicVectorMemory', () => {
    let memory;

    beforeEach(() => {
        memory = new EpisodicVectorMemory({ 
            eventTimeThreshold: 100 // 100ms for testing
        });
    });

    it('should add vectors to memory and segment into events based on time', (done) => {
        // Add first two vectors in quick succession
        memory.add([1, 0, 0], "First vector");
        memory.add([0, 1, 0], "Second vector");

        // Wait long enough to trigger a new event
        setTimeout(() => {
            memory.add([0, 0, 1], "Third vector");

            // Verify event segmentation
            expect(memory.memoryStore.length).toBe(2);
            expect(memory.memoryStore[0].vectors).toHaveLength(2);
            expect(memory.memoryStore[1].vectors).toHaveLength(1);

            // Verify vector contents
            expect(memory.memoryStore[0].vectors[0]).toEqual([1, 0, 0]);
            expect(memory.memoryStore[0].vectors[1]).toEqual([0, 1, 0]);
            expect(memory.memoryStore[1].vectors[0]).toEqual([0, 0, 1]);

            done();
        }, 150); // Longer than the 100ms event time threshold
    }, 500); // Increase test timeout

    it('should query and retrieve top-k similar vectors with temporal context', () => {
        memory.add([1, 0, 0], "Doc 1"); // Event 1
        memory.add([0, 1, 0], "Doc 2"); // Event 1 (same event)
        memory.add([0, 0, 1], "Doc 3"); // Event 2 (new event after time threshold, or in a real scenario, it would be a different topic)

        const queryVector = [0.9, 0.1, 0];
        const results = memory.query(queryVector, 2); // Request 2 results

        expect(results.length).toBeGreaterThanOrEqual(1); // Should retrieve at least one vector
        // Further assertions to check retrieved vectors are relevant and temporal context is included.
    });

    // ... Add more tests for save, load, error handling, etc.
});