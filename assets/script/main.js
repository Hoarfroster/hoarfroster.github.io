// Date.prototype.toYYYYMMDDString = function () {
//     return this.toLocaleString('en-us', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit'
//     }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
// }

window.addEventListener("load", async () => {
    let classList = document.querySelector(".content").classList;
    if (classList.contains('about')) {
        console.log("---");
        let tabs = document.querySelectorAll('.tab-item'),
            containers = document.querySelectorAll('.content.about .main > *'),
            currentTab = [...tabs].filter(e => {
                return e.classList.contains('active')
            })[0],
            currentContainer = [...containers].filter(e => {
                return e.classList.contains('active')
            })[0];

        [...tabs].forEach((e, index) => {
            e.addEventListener('click', () => {
                containers[index].classList.add('animation');
                currentContainer.classList.add('animation');
                e.classList.add('active');
                currentTab.classList.remove('active');
                setTimeout(() => {
                    containers[index].classList.remove('animation');
                    currentContainer.classList.remove('animation');

                    if (currentContainer !== containers[index])
                        currentContainer.classList.remove('active');
                    containers[index].classList.add('active');
                    currentContainer = containers[index];
                    currentTab = e;
                }, 500);
            });
        });
    }
    // else if (classList.contains('archive') || classList.contains('article')) {
    //         const yearbook = {};
    //         const posts = Array.from(await (await fetch('/posts.json')).json()).map(e => {
    //             const date = new Date(e['date']), result = {
    //                 title: e['title'],
    //                 date: date,
    //                 author: e['author'],
    //                 tag: e['tag'].split(','),
    //                 category: e['category'],
    //                 subCategory: e['sub_category'],
    //                 path: e['path']
    //             };
    //             if (yearbook[date.getFullYear()] === undefined)
    //                 yearbook[date.getFullYear()] = [];
    //             yearbook[date.getFullYear()].push(result)
    //             return result;
    //         });
    //         const config = (await (await fetch('/config.json')).json())
    //         const folders = Array.from(config['folders']);
    //         const categoryList = document.querySelector('.sidebar .category ul'),
    //             archiveList = document.querySelector('.sidebar .archive ul');
    //         folders.forEach((e) => {
    //             let item = document.createElement('li');
    //             item.innerHTML = "<a href='/" + e['path'] + "/archive.html'>" + e['name'] + "</a>";
    //             categoryList.appendChild(item);
    //         });
    //         for (let [key, value] of Object.entries(yearbook)) {
    //             let item = document.createElement('li');
    //             item.innerHTML = "<a href='/archive.html?year=" + key + "'>" + key + " 年</a>";
    //             archiveList.appendChild(item);
    //         }

    //         function name2path(name) {
    //             return folders.filter(e => {
    //                 return e.name === name
    //             })[0].path;
    //         }

    //         function path2name(path) {
    //             return folders.filter(e => {
    //                 return e.path === path
    //             })[0].name;
    //         }

    //         // For archive pages
    //         function initializeArchivePage(_posts) {
    //             const list = document.querySelector('.main .archive');
    //             _posts.sort((a, b) => {
    //                 return b.date - a.date
    //             }).forEach((e) => {
    //                 const html = `<div class='archive-item'>
    //                             <a class='title' href="${e.path}"><span class="category">${e.category}</span>${e.title}</a>
    //                             <ul class="tags"><li>${e.tag.join("</li><li>")}</li></ul>
    //                             <span class="meta">
    //                                 <span class="author">${e.author}</span>
    //                                 <span class="date">${e.date.toYYYYMMDDString()}</span>
    //                             </span>
    //                           </div>`;
    //                 let item = document.createElement('li');
    //                 item.innerHTML = html;
    //                 list.appendChild(item);
    //             });
    //         }

    //         if (window.location.pathname.endsWith("/archive.html")) {
    //             if (/\/(.+?)\/archive\.html/.test(window.location.pathname)) {
    //                 const type = window.location.pathname.match(/\/(.+?)\/archive.html/)[1];
    //                 const name = path2name(type);
    //                 initializeArchivePage(posts.filter(e => {
    //                     return e.category === name
    //                 }));
    //             } else {
    //                 // Global Archive Page
    //                 initializeArchivePage(posts)
    //             }
    //         } else if (/\/.+?\/.+?\/.+?\.html/.test(window.location.pathname)) {
    //             // Common Article
    //             [...document.querySelectorAll(".main img[data-src]")].forEach(e => {
    //                 e.src = e.attributes['data-src'].value;
    //             });
    //         }
    //     }
});