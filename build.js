/**
 * ==========================================================================
 * BUILD.JS (Premium Editorial Edition with Native Spotify Integration)
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

// Converts standard Spotify URLs into absolute clean secure embed player frames
function getSpotifyEmbedUrl(url) {
    if (!url) return null;
    if (url.includes('spotify.com')) {
        return url.replace('spotify.com/', 'spotify.com/embed/');
    }
    return null;
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
    } catch (error) {
        console.error(`⚠️ Notion status patch failed:`, error);
    }
}

async function build() {
    try {
        console.log("⚡ Initializing Architecture Build from Notion...");

        const dbUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
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
            console.error(`⛔ Notion API Error: ${dbData.message}`);
            process.exit(1);
        }

        const articles = [];
        const blogDir = path.join(__dirname, 'public', 'blog');
        if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

        const now = new Date();

        for (const page of dbData.results) {
            const props = page.properties;
            if (!props.Status) continue;

            const status = props.Status.select?.name || props.Status.status?.name || 'Draft';
            const isNativeStatus = props.Status.type === 'status';

            if (status !== 'Prepared' && status !== 'Published') continue;

            const title = props.Name?.title?.[0]?.plain_text || 'Untitled Manuscript';
            let rawSlug = props.Slug?.rich_text?.[0]?.plain_text || page.id;
            const slug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            
            const category = props.Category?.select?.name || 'General';
            const dateStr = props.Publish?.date?.start || '2026-01-01'; 
            const summary = props.Summary?.rich_text?.[0]?.plain_text || '';
            const ytLink = props['YouTube Link']?.url || null;
            const spotifyLink = props['Spotify Link']?.url || null; // New integration link extraction
            
            let thumbUrl = '../assets/images/placeholder.jpg';
            const thumbProp = props.Thumbnail?.files?.[0];
            if (thumbProp) {
                thumbUrl = thumbProp.type === 'file' ? thumbProp.file.url : thumbProp.external.url;
            }

            const publishDate = new Date(dateStr);
            if (status === 'Prepared' && publishDate > now) continue; 

            console.log(`📑 Rendering active article: /blog/${slug}`);

            if (status === 'Prepared') {
                await updateNotionStatus(page.id, isNativeStatus);
            }

            const formattedDate = publishDate.toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric'
            });

            // Parsing plátna stránky
            const blocksUrl = `https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`;
            const blocksResponse = await fetch(blocksUrl, {
                headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
            });
            const blocksData = await blocksResponse.json();

            let finalContentHtml = '';
            let insideList = false;

            if (blocksData.results) {
                blocksData.results.forEach(block => {
                    const type = block.type;
                    if (type !== 'bulleted_list_item' && insideList) {
                        finalContentHtml += '</ul>\n';
                        insideList = false;
                    }
                    if (type === 'paragraph' && block.paragraph) finalContentHtml += `<p>${parseRichText(block.paragraph.rich_text)}</p>\n`;
                    else if (type === 'heading_2' && block.heading_2) finalContentHtml += `<h2>${parseRichText(block.heading_2.rich_text)}</h2>\n`;
                    else if (type === 'heading_3' && block.heading_3) finalContentHtml += `<h3>${parseRichText(block.heading_3.rich_text)}</h3>\n`;
                    else if (type === 'quote' && block.quote) finalContentHtml += `<blockquote><p>${parseRichText(block.quote.rich_text)}</p></blockquote>\n`;
                    else if (type === 'bulleted_list_item' && block.bulleted_list_item) {
                        if (!insideList) { finalContentHtml += '<ul>\n'; insideList = true; }
                        finalContentHtml += `<li>${parseRichText(block.bulleted_list_item.rich_text)}</li>\n`;
                    }
                });
            }
            if (insideList) finalContentHtml += '</ul>\n';

            // Media Builders
            const ytId = getYouTubeId(ytLink);
            let videoEmbedHtml = '';
            if (ytId) {
                videoEmbedHtml = `
                <div style="width: 100%; aspect-ratio: 16/9; margin: var(--space-6) 0; background: #000; border: var(--border-thin);">
                    <iframe src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1" width="100%" height="100%" allowfullscreen style="border:none; display:block;"></iframe>
                </div>`;
            }

            const spotifyEmbedUrl = getSpotifyEmbedUrl(spotifyLink);
            let spotifyEmbedHtml = '';
            if (spotifyEmbedUrl) {
                spotifyEmbedHtml = `
                <div style="width: 100%; margin: var(--space-6) 0 0 0;">
                    <iframe src="${spotifyEmbedUrl}" width="100%" height="232" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border: none;"></iframe>
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
        <article class="article-body">
            ${videoEmbedHtml}
            ${spotifyEmbedHtml}
            ${finalContentHtml}
        </article>
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
        console.error("⛔ CRITICAL CRASH ENCOUNTERED:");
        console.error(globalError);
        process.exit(1);
    }
}

build();
