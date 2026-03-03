## Purpose

Patterns for managing LLM context windows, including chunking, retrieval-augmented generation, and context pruning.

## Implementation Patterns

### Pattern 1: Chunking + Retrieval
Chunk large documents and retrieve only relevant chunks for the prompt.

### Pattern 2: Context Pruning
Prioritize recent and high-salience context; prune low-value items.

## Examples

```markdown
Example: Use vector search to find the top-5 relevant passages and include them in prompt
```


## Deep Dive
Managing LLM context windows is critical when working with long documents or multi-step reasoning. Use retrieval-augmented generation by storing chunked embeddings in a vector store and fetching only the top-n relevant chunks at request time. When the context grows beyond token limits, implement a sliding window that preserves recent and salient information while pruning old data. Automatically summarize earlier conversation turns to reduce size while retaining meaning. These techniques collectively ensure your prompts remain under the model's input limit and that responses stay coherent over extended interactions.

## Examples

```python
# pseudo-code for context retrieval
query = "How do I handle user authentication?"
top_chunks = vector_store.search(query, k=5)
prompt = build_prompt(history_summary, top_chunks, query)
response = llm.call(prompt)
```
