const express = require('express');
const { Client } = require('@notionhq/client');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/notion/auth-url — Generate Notion OAuth URL
router.get('/auth-url', authMiddleware, (req, res) => {
  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.NOTION_REDIRECT_URI);
  const state = req.user.id;

  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}&state=${state}`;

  res.json({ authUrl });
});

// POST /api/notion/callback — Exchange OAuth code for access token
router.post('/callback', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const credentials = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion OAuth error:', data);
      return res.status(400).json({ message: 'Failed to connect Notion account', error: data });
    }

    const { access_token, workspace_id } = data;

    // Save the token to the user — that's all we need
    await User.findByIdAndUpdate(
      req.user.id,
      {
        notionAccessToken: access_token,
        notionWorkspaceId: workspace_id,
      },
      { new: true }
    );

    res.json({
      message: 'Notion connected successfully',
      notionConnected: true,
    });
  } catch (error) {
    console.error('Notion callback error:', error);
    res.status(500).json({ message: 'Failed to connect Notion', error: error.message });
  }
});

// GET /api/notion/status — Check if user has Notion connected
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      connected: !!user.notionAccessToken,
    });
  } catch (error) {
    console.error('Notion status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/notion/disconnect — Disconnect Notion
router.post('/disconnect', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      notionAccessToken: null,
      notionWorkspaceId: null,
      notionDatabaseId: null,
      notionNotes: new Map(),
    });
    res.json({ message: 'Notion disconnected successfully' });
  } catch (error) {
    console.error('Notion disconnect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/notion/note/:videoId — Get or check if a note exists for a video
router.get('/note/:videoId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.notionAccessToken) {
      return res.status(400).json({ message: 'Notion not connected' });
    }

    const { videoId } = req.params;

    // Check MongoDB for existing mapping
    const noteInfo = user.notionNotes?.get(videoId);

    if (noteInfo && noteInfo.pageId) {
      try {
        const notion = new Client({ auth: user.notionAccessToken });

        // Fetch the page content (blocks)
        const blocks = await notion.blocks.children.list({
          block_id: noteInfo.pageId,
          page_size: 100,
        });

        res.json({
          exists: true,
          pageId: noteInfo.pageId,
          pageUrl: noteInfo.pageUrl,
          content: blocksToMarkdown(blocks.results),
        });
      } catch (notionErr) {
        console.error('Error fetching Notion page:', notionErr);
        // Page might have been deleted in Notion, clean up
        user.notionNotes.delete(videoId);
        await user.save();
        res.json({ exists: false });
      }
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Notion get note error:', error);
    res.status(500).json({ message: 'Failed to fetch note', error: error.message });
  }
});

// POST /api/notion/note — Create a new note for a video
router.post('/note', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.notionAccessToken) {
      return res.status(400).json({ message: 'Notion not connected' });
    }

    const notion = new Client({ auth: user.notionAccessToken });
    const { videoId, videoTitle, channelTitle, content } = req.body;

    // Check if already mapped
    const existingNote = user.notionNotes?.get(videoId);
    if (existingNote && existingNote.pageId) {
      return res.status(400).json({ message: 'Note already exists', pageId: existingNote.pageId });
    }

    // Find a parent page to create the note in
    const parentPageId = await getFirstPageId(notion);

    // Create a simple page (no database needed)
    const page = await notion.pages.create({
      parent: { type: 'page_id', page_id: parentPageId },
      properties: {
        title: [{ type: 'text', text: { content: `📺 ${videoTitle || 'Untitled Video'}` } }],
      },
      children: markdownToBlocks(content || ''),
    });

    // Save mapping in MongoDB
    if (!user.notionNotes) {
      user.notionNotes = new Map();
    }
    user.notionNotes.set(videoId, { pageId: page.id, pageUrl: page.url });
    await user.save();

    res.json({
      pageId: page.id,
      pageUrl: page.url,
      message: 'Note created successfully',
    });
  } catch (error) {
    console.error('Notion create note error:', error);
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
});

// PUT /api/notion/note/:pageId — Update note content
router.put('/note/:pageId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.notionAccessToken) {
      return res.status(400).json({ message: 'Notion not connected' });
    }

    const notion = new Client({ auth: user.notionAccessToken });
    const { pageId } = req.params;
    const { content } = req.body;

    // Delete existing blocks
    const existingBlocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    for (const block of existingBlocks.results) {
      await notion.blocks.delete({ block_id: block.id });
    }

    // Add new blocks
    const blocks = markdownToBlocks(content || '');
    if (blocks.length > 0) {
      await notion.blocks.children.append({
        block_id: pageId,
        children: blocks,
      });
    }

    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Notion update note error:', error);
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
});

// ============ Helper Functions ============

// Get the first accessible page to use as a parent
async function getFirstPageId(notion) {
  // Always create a dedicated page at the workspace level
  const newPage = await notion.pages.create({
    parent: { type: 'workspace', workspace: true },
    properties: {
      title: [{ type: 'text', text: { content: 'EduTube Notes' } }],
    },
  });

  return newPage.id;
}

// Convert Notion blocks to simple markdown
function blocksToMarkdown(blocks) {
  return blocks
    .map((block) => {
      const type = block.type;

      switch (type) {
        case 'paragraph':
          return richTextToMarkdown(block.paragraph.rich_text);
        case 'heading_1':
          return `# ${richTextToMarkdown(block.heading_1.rich_text)}`;
        case 'heading_2':
          return `## ${richTextToMarkdown(block.heading_2.rich_text)}`;
        case 'heading_3':
          return `### ${richTextToMarkdown(block.heading_3.rich_text)}`;
        case 'bulleted_list_item':
          return `- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}`;
        case 'numbered_list_item':
          return `1. ${richTextToMarkdown(block.numbered_list_item.rich_text)}`;
        case 'code':
          return `\`\`\`${block.code.language || ''}\n${richTextToMarkdown(block.code.rich_text)}\n\`\`\``;
        case 'divider':
          return '---';
        case 'to_do':
          const checked = block.to_do.checked ? 'x' : ' ';
          return `- [${checked}] ${richTextToMarkdown(block.to_do.rich_text)}`;
        case 'quote':
          return `> ${richTextToMarkdown(block.quote.rich_text)}`;
        default:
          return '';
      }
    })
    .join('\n\n');
}

function richTextToMarkdown(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return '';

  return richTextArray
    .map((rt) => {
      let text = rt.plain_text || '';
      if (rt.annotations) {
        if (rt.annotations.bold) text = `**${text}**`;
        if (rt.annotations.italic) text = `*${text}*`;
        if (rt.annotations.code) text = `\`${text}\``;
        if (rt.annotations.strikethrough) text = `~~${text}~~`;
      }
      if (rt.href) text = `[${text}](${rt.href})`;
      return text;
    })
    .join('');
}

// Map common language aliases to Notion-accepted language names
const LANGUAGE_MAP = {
  'cpp': 'c++', 'c++': 'c++',
  'csharp': 'c#', 'cs': 'c#', 'c#': 'c#',
  'js': 'javascript', 'javascript': 'javascript', 'jsx': 'javascript',
  'ts': 'typescript', 'typescript': 'typescript', 'tsx': 'typescript',
  'py': 'python', 'python': 'python', 'python3': 'python',
  'rb': 'ruby', 'ruby': 'ruby',
  'rs': 'rust', 'rust': 'rust',
  'sh': 'shell', 'shell': 'shell', 'zsh': 'shell',
  'bash': 'bash',
  'yml': 'yaml', 'yaml': 'yaml',
  'md': 'markdown', 'markdown': 'markdown',
  'objc': 'objective-c', 'objective-c': 'objective-c',
  'kt': 'kotlin', 'kotlin': 'kotlin',
  'swift': 'swift', 'go': 'go', 'java': 'java',
  'html': 'html', 'css': 'css', 'scss': 'scss', 'less': 'less',
  'json': 'json', 'xml': 'xml', 'sql': 'sql',
  'php': 'php', 'r': 'r', 'lua': 'lua',
  'scala': 'scala', 'perl': 'perl', 'dart': 'dart',
  'c': 'c', 'toml': 'toml', 'graphql': 'graphql',
  'dockerfile': 'docker', 'docker': 'docker',
  'makefile': 'makefile', 'make': 'makefile',
  'tex': 'latex', 'latex': 'latex',
  'asm': 'assembly', 'assembly': 'assembly',
  'ps1': 'powershell', 'powershell': 'powershell',
  'vb': 'visual basic', 'vbnet': 'vb.net',
  'proto': 'protobuf', 'protobuf': 'protobuf',
  'sol': 'solidity', 'solidity': 'solidity',
  'hs': 'haskell', 'haskell': 'haskell',
  'ex': 'elixir', 'elixir': 'elixir',
  'erl': 'erlang', 'erlang': 'erlang',
  'clj': 'clojure', 'clojure': 'clojure',
  'diff': 'diff', 'text': 'plain text', 'txt': 'plain text',
};

function mapLanguage(lang) {
  if (!lang) return 'plain text';
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || 'plain text';
}

// Convert simple markdown to Notion blocks
function markdownToBlocks(markdown) {
  if (!markdown || !markdown.trim()) {
    return [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: 'Start taking notes here...' } }],
        },
      },
    ];
  }

  const lines = markdown.split('\n');
  const blocks = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';

  for (const line of lines) {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: codeContent.trim() } }],
            language: mapLanguage(codeLang),
          },
        });
        inCodeBlock = false;
        codeContent = '';
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Skip empty lines
    if (!line.trim()) continue;

    // Headings
    if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: parseInlineMarkdown(line.slice(4)) },
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: parseInlineMarkdown(line.slice(3)) },
      });
    } else if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: { rich_text: parseInlineMarkdown(line.slice(2)) },
      });
    }
    // Divider
    else if (line.trim() === '---') {
      blocks.push({ object: 'block', type: 'divider', divider: {} });
    }
    // Quote
    else if (line.startsWith('> ')) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: { rich_text: parseInlineMarkdown(line.slice(2)) },
      });
    }
    // Checkbox
    else if (line.match(/^- \[(x| )\] /)) {
      const checked = line[3] === 'x';
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: parseInlineMarkdown(line.slice(6)),
          checked,
        },
      });
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: parseInlineMarkdown(line.slice(2)) },
      });
    }
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, '');
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: parseInlineMarkdown(content) },
      });
    }
    // Regular paragraph
    else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: parseInlineMarkdown(line) },
      });
    }
  }

  return blocks;
}

// Parse inline markdown (bold, italic, code, links)
function parseInlineMarkdown(text) {
  const parts = [];
  const segments = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);

  for (const segment of segments) {
    if (!segment) continue;

    if (segment.startsWith('**') && segment.endsWith('**')) {
      parts.push({
        type: 'text',
        text: { content: segment.slice(2, -2) },
        annotations: { bold: true },
      });
    } else if (segment.startsWith('*') && segment.endsWith('*')) {
      parts.push({
        type: 'text',
        text: { content: segment.slice(1, -1) },
        annotations: { italic: true },
      });
    } else if (segment.startsWith('`') && segment.endsWith('`')) {
      parts.push({
        type: 'text',
        text: { content: segment.slice(1, -1) },
        annotations: { code: true },
      });
    } else if (segment.match(/^\[.*?\]\(.*?\)$/)) {
      const match = segment.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        parts.push({
          type: 'text',
          text: { content: match[1], link: { url: match[2] } },
        });
      }
    } else {
      parts.push({
        type: 'text',
        text: { content: segment },
      });
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', text: { content: text } }];
}

module.exports = router;
