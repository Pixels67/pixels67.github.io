const slug = new URLSearchParams(window.location.search).get('slug');
fetch('https://blogserve-kltj.onrender.com/posts/' + slug)
    .then(response => response.json())
    .then(post => {
        document.title = post.title;
        marked.use({
            renderer: {
                code(code, lang) {
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return `<pre><code class="hljs language-${language}">${hljs.highlight(code, {language}).value}</code></pre>`;
                }
            }
        });

        document.getElementById('post').innerHTML = marked.parse(post.content);
    })
    .catch(error => {
        console.error('Error:', error)
        document.getElementById('post').innerHTML = `<h2>Error retrieving post from server!</h2>`;
    });