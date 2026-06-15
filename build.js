/**
 * ==========================================================================
 * BUILD.JS (Bulletproof Edition - Pure JS-Side Filtering Blueprint)
 * Language: Node.js
 * ==========================================================================
 */

const fs = require('fs');
const path = require('path');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
    console.error("⛔ Error: NOTION_TOKEN or NOTION_DATABASE_ID is missing in Vercel Environment Variables.");
    process.exit(1);
}

function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 12) ? match[2] : (match && match[2].length === 11) ? match[2] : null;
}

function parseRichText(richTextArray) {
    if (!richTextArray) return '';
    return richTextArray.map(text => {
        let content = text.plain_text;
        if (text.annotations.bold) content = `<strong>${content}</strong>`;
        if (text.annotations.italic) content = `<em>${content}</em>`;
        if (text.annotations.code) content = `<code>${content}</code>`;
        return content;
    }).join('');
}

// Smart update engine that auto-adapts to either native Status or Select types
async function updateNotionStatus(pageId, isNativeStatus) {
    try {
        const propertiesPayload = {};
        if (isNativeStatus) {
            propertiesPayload['Status'] = { status: { name: 'Published' } };
        } else {
            propertiesPayload['Status'] = { select: { name: 'Published' } };
        }

        const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ properties: propertiesPayload })
        });
        if (res.ok) console.log(`✅ Notion database status synced to 'Published' successfully.`);
    } catch (error) {
        console.error(`⚠️ Notion status auto-patch failed:`, error);
    }
}

async function build() {
    try {
        console.log("⚡ Initializing Architecture Build from Notion...");

        const dbUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
        
        // NO FILTERS SENT TO NOTION API TO BYPASS ALL TYPE-MISMATCH 400 ERRORS
        const dbResponse = await fetch(dbUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sorts: [{ property: 'Publish', direction: 'descending' }]
            })
        });

        const dbData = await dbResponse.json();
        
        if (dbData.object === 'error') {
            console.error(`⛔ Notion API Error Code (${dbData.status}): ${dbData.message}`);
            process.exit(1);
        }

        if (!dbData.results || dbData.results.length === 0) {
            console.log("⚠️ No entries found in the provided Notion database.");
            return;
        }

        const articles = [];
        const blogDir = path.join(__dirname, 'public', 'blog');
        if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

        const now = new Date();

        for (const page of dbData.results) {
            const props = page.properties;
            if (!props.Status) continue;

            // Robust multi-type check for status field (handles both Select and Status properties)
            const status = props.Status.select?.name || props.Status.status?.name || 'Draft';
            const isNativeStatus = props.Status.type === 'status';

            // JS-SIDE FILTERING: Skip drafts or empty rows silently
            if (status !== 'Prepared' && status !== 'Published') {
                continue;
            }

            const title = props.Name?.title?.[0]?.plain_text || 'Untitled Manuscript';
            let rawSlug = props.Slug?.rich_text?.[0]?.plain_text || page.id;
            const slug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            
            const category = props.Category?.select?.name || 'General';
            const dateStr = props.Publish?.date?.start || '2026-01-01'; 
            const summary = props.Summary?.rich_text?.[0]?.plain_text || '';
            const ytLink = props['YouTube Link']?.url || null;
            
            let thumbUrl = '../assets/images/placeholder.jpg';
            const thumbProp = props.Thumbnail?.files?.[0];
            if (thumbProp) {
                thumbUrl = thumbProp.type === 'file' ? thumbProp.file.url : thumbProp.external.url;
            }

            const publishDate = new Date(dateStr);

            // Time-Gate Guardrail
            if (status === 'Prepared' && publishDate > now) {
                console.log(`⏳ Scheduled: /blog/${slug} is set for future publishing (${dateStr}). Skipping.`);
                continue; 
            }

            console.log(`📑 Rendering active article: /blog/${slug} [Status: ${status}]`);

            if (status === 'Prepared') {
                await updateNotionStatus(page.id, isNativeStatus);
            }

            const formattedDate = publishDate.toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric'
            });

            const blocksUrl = `https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`;
            const blocksResponse = await fetch(blocksUrl, {
                headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
            });
            const blocksData = await blocksResponse.json();

            let bodyHtml = '';
            let insideList = false;

            if (blocksData.results) {
                blocksData.results.forEach(block => {
                    const type = block.type;
                    if (type !== 'bulleted_list_item' && insideList) {
                        bodyHtml += '</ul>\n';
                        insideList = false;
                    }
                    if (type === 'paragraph' && block.paragraph) bodyHtml += `<p>${parseRichText(block.paragraph.rich_text)}</p>\n`;
                    else if (type === 'heading_2' && block.heading_2) bodyHtml += `<h2>${parseRichText(block.heading_2.rich_text)}</h2>\n`;
                    else if (type === 'heading_3' && block.heading_3) bodyHtml += `<h3>${parseRichText(block.heading_3.rich_text)}</h3>\n`;
                    else if (type === 'quote' && block.quote) bodyHtml += `<blockquote><p>${parseRichText(block.quote.rich_text)}</p></blockquote>\n`;
                    else if (type === 'bulleted_list_item' && block.bulleted_list_item) {
                        if (!insideList) { bodyHtml += '<ul>\n'; insideList = true; }
                        bodyHtml += `<li>${parseRichText(block.bulleted_list_item.rich_text)}</li>\n`;
                    }
                });
            }
            if (insideList) bodyHtml += '</ul>\n';

            const ytId = getYouTubeId(ytLink);
            let videoEmbedHtml = '';
            if (ytId) {
                videoEmbedHtml = `
                <div style="width: 100%; aspect-ratio: 16/9; border: var(--border-thin); margin: var(--space-6) 0; background: #000;">
                    <iframe src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1" width="100%" height="100%" allowfullscreen style="border:none; display:block;"></iframe>
                </div>`;
            }

            const articleTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Mindset by Choice</title>
    <script src="../js/theme.js"></script>
    <link rel="stylesheet" href="../css/variables.css">
    <link rel="stylesheet" href="../css/reset.css">
    <link rel="stylesheet" href="../css/main.css">
    <style>
        .article-header { padding-top: var(--space-12); padding-bottom: var(--space-6); border-bottom: var(--border-thin); margin-bottom: var(--space-8); }
        .back-link { font-size: var(--text-sm); text-transform: uppercase; color: var(--color-dimmed); display: inline-flex; align-items: center; gap: var(--space-1); margin-bottom: var(--space-6); transition: color var(--transition-fast); }
        .back-link:hover { color: var(--color-text); }
        .post-meta { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-dimmed); margin-bottom: var(--space-3); display: flex; gap: var(--space-3); }
        .post-title { font-size: calc(var(--text-3xl) * 0.9); line-height: 1.2; letter-spacing: -0.01em; }
        .article-body { font-size: var(--text-base); line-height: 1.7; color: var(--color-text); }
        .article-body p { margin-bottom: var(--space-6); }
        .article-body h2 { font-size: var(--text-xl); margin-top: var(--space-8); margin-bottom: var(--space-3); letter-spacing: -0.01em; }
        .article-body h3 { font-size: var(--text-lg); margin-top: var(--space-6); margin-bottom: var(--space-2); }
        .article-body blockquote { border-left: var(--border-thin); padding-left: var(--space-4); margin: var(--space-8) 0; font-style: italic; color: var(--color-text); }
        .article-body blockquote p { margin-bottom: 0; font-size: var(--text-lg); }
        .article-body ul { margin-bottom: var(--space-6); padding-left: var(--space-4); }
        .article-body li { list-style-type: square; margin-bottom: var(--space-2); }
        .article-footer { margin-top: var(--space-12); padding-top: var(--space-6); border-top: var(--border-dimmed); display: flex; justify-content: space-between; align-items: center; }
    </style>
</head>
<body>
    <header class="brand-header">
        <div class="container flex-between">
            <a href="/" class="brand-logo">Mindset by Choice</a>
            <nav style="display: flex; align-items: center;">
                <ul style="display: flex; gap: var(--space-4); text-transform: uppercase; font-size: var(--text-sm);">
                    <li><a href="/" style="color: var(--color-dimmed);">Home</a></li>
                    <li><a href="/blog" style="border-bottom: var(--border-thin);">Blog</a></li>
                    <li><a href="/dashboard" style="color: var(--color-dimmed);">Dashboard</a></li>
                </ul>
                <button id="theme-toggle" style="font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; margin-left: var(--space-4); padding: 2px var(--space-1); border: var(--border-thin); background: none; color: inherit;">[ Day ]</button>
            </nav>
        </div>
    </header>
    <main class="container container-reading" style="padding-bottom: var(--space-12);">
        <header class="article-header">
            <a href="/blog" class="back-link">&larr; Return to Editorial</a>
            <div class="post-meta"><time datetime="${dateStr}">${formattedDate}</time><span>&bull;</span><span>${category}</span></div>
            <h1 class="post-title">${title}</h1>
        </header>
        <article class="article-body">${videoEmbedHtml}${bodyHtml}</article>
        <footer class="article-footer">
            <a href="/blog" class="back-link">&larr; Back to all articles</a>
            <span style="font-size: var(--text-xs); color: var(--color-dimmed); text-transform: uppercase;">Manuscript Sync Active</span>
        </footer>
    </main>
</body>
</html>`;

            fs.writeFileSync(path.join(blogDir, `${slug}.html`), articleTemplate);
            articles.push({ title, slug, category, formattedDate, dateStr, summary, thumbUrl });
        }

        console.log("🏁 Compilation: Constructing Blog Hub index grid...");
        let articleItemsHtml = '';
        articles.forEach(art => {
            articleItemsHtml += `
                <article class="article-item">
                    <div class="article-sidebar">
                        <div class="article-thumbnail"><img src="${art.thumbUrl}" alt="${art.title}"></div>
                        <aside class="article-meta">
                            <time datetime="${art.dateStr}">${art.formattedDate}</time>
                            <div style="color: var(--color-text); margin-top: 2px;">${art.category}</div>
                        </aside>
                    </div>
                    <div class="article-content">
                        <a href="/blog/${art.slug}"><h2>${art.title}</h2></a>
                        <p>${art.summary}</p>
                        <a href="/blog/${art.slug}" class="read-more">Read Full Article</a>
                    </div>
                </article>\n`;
        });

        const indexHubTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editorial | Mindset by Choice</title>
    <script src="../js/theme.js"></script>
    <link rel="stylesheet" href="../css/variables.css">
    <link rel="stylesheet" href="../css/reset.css">
    <link rel="stylesheet" href="../css/main.css">
    <style>
        .blog-header { padding: var(--space-12) 0 var(--space-8) 0; border-bottom: var(--border-thin); margin-bottom: var(--space-8); }
        .blog-title { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
        .article-list { display: flex; flex-direction: column; margin-bottom: var(--space-16); }
        .article-item { padding: var(--space-6) 0; border-bottom: var(--border-dimmed); display: grid; grid-template-columns: 180px 1fr; gap: var(--space-6); align-items: start; transition: padding-left var(--transition-fast), border-color var(--transition-fast); }
        .article-item:hover { padding-left: var(--space-2); border-bottom: var(--border-thin); }
        .article-item:last-child { border-bottom: var(--border-thin); }
        .article-sidebar { display: flex; flex-direction: column; gap: var(--space-3); }
        .article-thumbnail { width: 100%; aspect-ratio: 1 / 1; border: var(--border-thin); background-color: var(--color-surface); overflow: hidden; transition: border-color var(--transition-fast); }
        .article-thumbnail img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(1.1); transition: filter var(--transition-fast), transform var(--transition-fast); }
        .article-item:hover .article-thumbnail { border-color: var(--color-text); }
        .article-item:hover .article-thumbnail img { transform: scale(1.03); filter: grayscale(100%) contrast(1.25); }
        .article-meta { font-size: var(--text-xs); color: var(--color-dimmed); text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.4; }
        .article-content h2 { font-size: var(--text-xl); margin-bottom: var(--space-2); }
        .article-content p { font-size: var(--text-base); color: var(--color-dimmed); margin-bottom: var(--space-3); max-width: var(--container-reading); }
        .read-more { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid transparent; transition: border-color var(--transition-fast); }
        .article-item:hover .read-more { border-color: var(--color-text); }
        @media (max-width: 768px) { .article-item { grid-template-columns: 1fr; gap: var(--space-4); } .article-sidebar { flex-direction: row; align-items: center; gap: var(--space-4); } .article-thumbnail { width: 80px; } }
    </style>
</head>
<body>
    <header class="brand-header">
        <div class="container flex-between">
            <a href="/" class="brand-logo">Mindset by Choice</a>
            <nav style="display: flex; align-items: center;">
                <ul style="display: flex; gap: var(--space-4); text-transform: uppercase; font-size: var(--text-sm);">
                    <li><a href="/" style="color: var(--color-dimmed);">Home</a></li>
                    <li><a href="/blog" style="border-bottom: var(--border-thin);">Blog</a></li>
                    <li><a href="/dashboard" style="color: var(--color-dimmed);">Dashboard</a></li>
                </ul>
                <button id="theme-toggle" style="font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; margin-left: var(--space-4); padding: 2px var(--space-1); border: var(--border-thin); background: none; color: inherit;">[ Day ]</button>
            </nav>
        </div>
    </header>
    <main class="container">
        <header class="blog-header">
            <h1 class="blog-title">Editorial</h1>
            <p style="color: var(--color-dimmed); max-width: var(--container-reading);">Deep dives into the architecture of focus. Managed via Notion.</p>
        </header>
        <div class="article-list">${articleItemsHtml}</div>
    </main>
</body>
</html>`;

        fs.writeFileSync(path.join(blogDir, 'index.html'), indexHubTemplate);
        console.log("🔥 Architecture Build Completed Successfully.");

    } catch (globalError) {
        console.error("⛔ CRITICAL CRASH ENCOUNTERED DURING BUILD PIPELINE:");
        console.error(globalError);
        process.exit(1);
    }
}

build();
