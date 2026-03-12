const slug = new URLSearchParams(window.location.search).get('slug');
const post = POSTS.find(p => p.slug === slug);

if (!post) {
    document.getElementById('post').innerHTML = '<h2>Post not found.</h2>';
} else {
    document.title = post.title;

    marked.use({
        renderer: {
            code(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return `<pre><code class="hljs language-${language}">${hljs.highlight(code, {language}).value}</code></pre>`;
            }
        }
    });

    fetch(post.file)
        .then(res => res.text())
        .then(md => {
            document.getElementById('post').innerHTML = `${marked.parse(md)}`;
        });
}