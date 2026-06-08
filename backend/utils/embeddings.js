let extractor = null;
const indexedItems = [];
let indexReady = false;

async function loadExtractor() {
  if (extractor) return extractor;
  const { pipeline } = await import('@xenova/transformers');
  extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
  return extractor;
}

async function embed(text) {
  const ext = await loadExtractor();
  const out = await ext(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data);
}

function cosine(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

async function buildIndex(qaData) {
  for (const item of qaData) {
    const vector = await embed(item.q + ' ' + item.a);
    indexedItems.push({ q: item.q, a: item.a, vector });
  }
  indexReady = true;
}

async function semanticSearch(question, topK = 3) {
  if (!indexReady) return [];
  const qv = await embed(question);
  return [...indexedItems]
    .map(item => ({ q: item.q, a: item.a, score: cosine(qv, item.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

module.exports = { buildIndex, semanticSearch };