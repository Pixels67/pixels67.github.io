const list = document.getElementById('post-list');

fetch('https://blogserve-kltj.onrender.com/posts')
    .then(response => response.json())
    .then(posts => {
        const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(post => {
            const postDate = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            list.innerHTML += `
                <div class="post-card">
                  <h2><a href="post.html?slug=${post.slug}">${post.title}</a></h2>
                  <div class="meta">${postDate}</div>
                </div>
            `;
        });
    })
    .catch(error => {
        console.error('Error:', error)
        list.innerHTML = `<h2>Error retrieving posts from server!</h2>`;
    });