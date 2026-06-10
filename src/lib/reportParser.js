// Pure report text parsing — no React/JSX dependencies

export function extractRefsFromText(rawText) {
  // Match [REFS]...[/REFS] or [REFS]... to end-of-string (handles truncated output)
  const refsBlock = rawText.match(/\[REFS\]([\s\S]*?)(?:\[\/REFS\]|$)/);
  if (!refsBlock) return [];
  const content = refsBlock[1].trim();
  if (!content) return [];
  // Split on [N] boundaries so single-line and multi-line formats both work
  const parts = content.split(/(?=\[\d+\])/).filter(s => s.trim());
  const refs = [];
  for (const part of parts) {
    const rm = part.trim().match(/^\[(\d+)\]\s*([\s\S]+)/);
    if (!rm) continue;
    const body = rm[2].replace(/\s+/g, ' ').trim();
    const segments = body.split(/\s*—\s*/);
    refs.push({ n: '['+rm[1]+']', src: segments[0]||'来源', title: segments[1]||segments[0]||'参考资料', url: segments[2]||'', date: segments[3]||'' });
  }
  return refs;
}
export function extractTitleFromText(rawText) {
  const tm = rawText.match(/^\[TITLE:\s*(.+?)\]/m);
  return tm ? tm[1].trim() : null;
}
// ── Markdown → Report Sections parser ───────────────────────────────────────
export function parseMarkdownReport(rawText) {
  if (!rawText?.trim()) return [];
  const NUMS = ['01','02','03','04','05','06','07','08','09','10'];
  const cleanText = rawText
    .replace(/^\[TITLE:[^\]]*\]\s*/m, '')
    .replace(/\[REFS\][\s\S]*?(?:\[\/REFS\]|$)/g, '');

  // Tokenize line by line
  const tokens = [];
  for (const raw of cleanText.split('\n')) {
    const line = raw.trim();
    if (!line) { tokens.push({ type: 'blank' }); continue; }
    // Chart data block: [CHART:{...}]
    const chartMatch = line.match(/^\[CHART:(\{.*\})\]$/);
    if (chartMatch) {
      try {
        const chartData = JSON.parse(chartMatch[1]);
        tokens.push({ type: 'chart', data: chartData });
      } catch { tokens.push({ type: 'text', text: line }); }
      continue;
    }
    // Heading patterns
    if (/^[一二三四五六七八九十]+[、．]/.test(line) ||
        /^#{1,3}\s/.test(line) ||
        (/^\*\*/.test(line) && /\*\*$/.test(line) && /[一二三四五六七八九十]+[、．]|第[一二三四五六七八九十\d]+[节章]/.test(line)) ||
        /^第[一二三四五六七八九十\d]+[节章][·：:\s]/.test(line)) {
      const text = line.replace(/^\*{1,2}|\*{1,2}$/g,'').replace(/^#{1,3}\s*/,'').trim();
      tokens.push({ type: 'heading', text });
    } else if (line.startsWith('> ')) {
      tokens.push({ type: 'quote-line', text: line.slice(2).trim() });
    } else {
      tokens.push({ type: 'text', text: line });
    }
  }

  // Group into sections
  const sections = [];
  let sIdx = 0;
  let currentTitle = null;
  let currentBlocks = [];
  let textBuffer = [];
  let isFirstBlock = true;
  let inQuote = false;
  let quoteLines = [];

  const flushText = () => {
    const txt = textBuffer.join(' ').trim();
    if (txt) { currentBlocks.push({ kind: isFirstBlock ? 'lede' : 'p', text: txt }); isFirstBlock = false; }
    textBuffer = [];
  };
  const flushQuote = () => {
    if (inQuote && quoteLines.length > 0) {
      const qText = quoteLines[0];
      const by = quoteLines.slice(1).join(' ').replace(/^[—\s]+/,'').trim();
      currentBlocks.push({ kind: 'quote', text: qText, by });
      isFirstBlock = false;
      inQuote = false; quoteLines = [];
    }
  };
  const commitSection = () => {
    flushQuote(); flushText();
    if (currentBlocks.length > 0) {
      sIdx++;
      sections.push({ id: `s${sIdx}`, num: NUMS[sIdx-1] || String(sIdx).padStart(2,'0'), en: currentTitle || '正文', cn: '', blocks: currentBlocks });
    }
    currentTitle = null; currentBlocks = []; isFirstBlock = true;
  };

  for (const token of tokens) {
    if (token.type === 'heading') { commitSection(); currentTitle = token.text; }
    else if (token.type === 'blank') { flushQuote(); flushText(); }
    else if (token.type === 'chart') {
      flushQuote(); flushText();
      currentBlocks.push({ kind: 'chart', data: token.data });
      isFirstBlock = false;
    }
    else if (token.type === 'quote-line') {
      flushText();
      if (!inQuote) { inQuote = true; quoteLines = [token.text]; }
      else { const attr = token.text.replace(/^[—\s]+/,''); if (attr) quoteLines.push(attr); }
    }
    else if (token.type === 'text') {
      flushQuote();
      textBuffer.push(token.text);
    }
  }
  commitSection();
  return sections.filter(s => s.blocks.length > 0);
}
