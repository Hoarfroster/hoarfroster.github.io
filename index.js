const glob = require('glob'), path = require('path'), mkdirp = require('mkdirp'), os = require('os'), spawn = require('child_process').spawn, fse = require('fs-extra'), fm = require('front-matter');
const cluster = require('cluster');
const sqlite3 = require('sqlite3'), openDB = () =>
    new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, function (e) {
        if (e && e.code == "SQLITE_CANTOPEN") {
            db = new sqlite3.Database(dbPath, (e) => console.error(e));
            db.run("CREATE TABLE IF NOT EXISTS HISTORY(TITLE TEXT, PATH TEXT PRIMARY KEY, CATEGORY TEXT, HASH TEXT, STAT TEXT)", (e) => console.error(e));
            return;
        } else if (e) {
            console.error(e);
        }
    });
const tmpdir = path.join(os.tmpdir(), 'hoarfroster-blog-generator'), dbPath = path.join(tmpdir, 'index.db');
const crypto = require('crypto'), getSHA256 = function (input) {
    return crypto.createHash('sha256').update(input).digest('hex')
};
const reservedPages = ['404', 'CATEGORIES', 'CATEGORY', 'TAGS', 'TAG'];
const platform = process.env.__TESTING_MKDIRP_PLATFORM__ || process.platform

let templateTopbar = fse.readFileSync(path.join(__dirname, 'template', 'topbar.html'));
let templateFooter = fse.readFileSync(path.join(__dirname, 'template', 'footer.html'));
let templateSidebar = fse.readFileSync(path.join(__dirname, 'template', 'sidebar.html'));

if (cluster.isMaster) {
    const files = glob.sync('source/**/*.@(md|html)', {});
    let hashTable = {};
    var db = openDB();
    db.all('SELECT PATH, HASH FROM HISTORY', function (e, rows) {
        if (e) {
            console.error(e);
        } else {
            rows.forEach(function (row) {
                if (files.indexOf(row.PATH) === -1) {
                    db.run('DELETE FROM HISTORY WHERE PATH = ?', row.PATH);
                }
                hashTable[row.PATH] = row.HASH;
            });
            processFiles();
        }
    });
    db.close();

    function processFiles() {
        let done = 0, id = 0, workers = [], entries = [];
        mkdirp.sync(tmpdir);
        for (let i = 0; i < Math.min(os.cpus().length, files.length); i++) {
            let worker = cluster.fork();
            workers.push({ worker: worker, pid: worker.pid });
            worker.send({ fileName: files[id], hashTable: hashTable });
            id += 1;

            worker.on('message', workerMessageHandler);

            function workerMessageHandler(msg) {
                if (msg.state !== undefined) {
                    if (msg.state === 0) {
                        entries.push([msg.meta.title, msg.path, JSON.stringify(msg.meta.categories), msg.hash, JSON.stringify(msg.stat)]);
                    }
                    done += 1;
                    if (done >= files.length || id >= files.length) {
                        worker.process.kill();
                        workers = workers.filter(w => w.worker !== worker);
                        if (workers.length === 0) {
                            setTimeout(() => {
                                var db = openDB();
                                entries.forEach(entry => {
                                    db.run('REPLACE INTO HISTORY (TITLE, PATH, CATEGORY, HASH, STAT) VALUES (?, ?, ?, ?, ?)', entry, (e) => e !== null ? console.error(e) : null);
                                });
                                db.close();
                                generateIndexPage();
                                fse.copySync(path.join(__dirname, 'resources', 'assets'), path.join(__dirname, 'public', 'assets'), { overwrite: true });
                                fse.copySync(path.join(__dirname, 'resources', 'CNAME'), path.join(__dirname, 'public', 'CNAME'), { overwrite: true });
                                let aboutPageContent = fse.readFileSync(path.join(__dirname, 'resources', 'about.html'), 'utf8');
                                aboutPageContent = aboutPageContent.replace('{{sidebar}}', templateSidebar).replace('{{topbar}}', templateTopbar).replace('{{footer}}', templateFooter);
                                fse.writeFileSync(path.join(__dirname, 'public', 'about.html'), aboutPageContent);
                            }, 10);
                        }
                    } else {
                        worker.send({ fileName: files[id], hashTable: hashTable });
                        id += 1;
                    }
                }
            }
        }
    }


    function generateIndexPage() {
        var db = openDB();
        db.all("SELECT * FROM HISTORY", function (e, rows) {
            if (!e) {
                let html = '';
                rows.map(row => {
                    return {
                        title: row.TITLE,
                        path: row.PATH,
                        category: row.CATEGORY !== null && row.CATEGORY !== undefined ? JSON.parse(row.CATEGORY)[0] : null,
                        stat: JSON.parse(row.STAT),
                    };
                }).filter(row => reservedPages.indexOf(`${row.title}`.toUpperCase()) === -1).forEach(entry => {
                    let p = entry.category === null ? entry.title : entry.category.join('/');
                    if (platform === 'win32') {
                        const badWinChars = /[*|"<>?:]/g
                        p = p.replaceAll(badWinChars, '-');
                    }
                    html += `<div class="post"><a href='/archive/${p}'><h2 class='post-title'>${entry.title}</h2></a><p class='meta'><span class='chars'>${entry.stat.size}B</span><span class='created-date'>Created ${entry.stat.ctime.split('T')[0]}</span><span class='modified-date'>Modified ${entry.stat.mtime.split('T')[0]}</span></p></div>`;
                });
                let templateIndexPage = fse.readFileSync(path.join(__dirname, 'template', 'index.html'), 'utf8');
                templateIndexPage = templateIndexPage.replace('{{topbar}}', templateTopbar).replace('{{footer}}', templateFooter).replace('{{content}}', html).replace('{{sidebar}}', templateSidebar);
                fse.writeFileSync(path.join(__dirname, 'public', 'index.html'), templateIndexPage);
            } else {
                console.error(e);
            }
        });
        db.close();
    }
} else {
    process.on('message', async function (msg) {
        let filePath = msg.fileName, fileName = path.basename(filePath);
        const startingTime = new Date(), checker = setTimeout(() => {
            console.log("[Worker] Failed to process file: " + filePath + " in " + 120000 + "ms");
            process.send({ state: 1, pid: process.pid });
        }, 120000);

        const tmpFileName = process.pid + fileName, tmpOutFileName = process.pid + fileName + '.out.html';
        const tmpFilePath = path.join(tmpdir, tmpFileName), tmpOutFilePath = path.join(tmpdir, tmpOutFileName);
        const source = fse.readFileSync(filePath, { encoding: 'utf8' });

        if (msg.hashTable[filePath] === getSHA256(source)) {
            process.send({ state: -1, pid: process.pid });
            clearTimeout(checker);
        } else {
            processFile();
        }
        async function processFile() {
            console.log("[Worker] Working on " + filePath);
            fse.writeFileSync(tmpFilePath, source);

            const args = ["--lua-filter", path.join(__dirname, "filters/texsvg.lua"), '-f', 'commonmark_x', '-s', tmpFileName, '-o', tmpOutFileName, '--standalone'];
            const task = spawn('pandoc', args, {
                cwd: path.join(tmpdir),
                env: process.env,
                encoding: "utf8"
            });

            let output = "";
            task.stderr.on('data', (data) => {
                output += data;
            });

            task.on('close', async (code) => {
                if (output !== '') { console.log(output); }
                if (code === 0) {
                    let meta = renderFile();
                    console.log('[Worker] Succeed in proceeding file ' + filePath + ' in ' + (new Date() - startingTime) + 'ms');
                    fse.rmSync(tmpFilePath);
                    fse.rmSync(tmpOutFilePath);
                    setTimeout(() => {
                        clearInterval(checker);
                        const stat = fse.statSync(filePath);
                        stat.chars = source.length;
                        process.send({ state: 0, pid: process.pid, hash: getSHA256(source), path: filePath, stat: meta[1], meta: meta[0] ?? "" });
                    }, 10);
                }
            });
        }

        function renderFile() {
            const jsdom = require("jsdom");
            const { JSDOM } = jsdom;
            let outHtml = fse.readFileSync(tmpOutFilePath, { encoding: "utf8" });
            outHtml = outHtml.replaceAll(/\[(.+?)\]\^\((.+?)\)/g, '<ruby><rb>$1</rb><rt>$2</rt></ruby>'); // Ruby Support
            var el = new JSDOM(outHtml).window.document;
            let titleElement = el.querySelector('#title-block-header');
            titleElement.parentElement.removeChild(titleElement);
            [...el.querySelectorAll(".math.latex > svg")].forEach(e => e.setAttribute('stroke', 'currentColor') && [...e.querySelectorAll('path[stroke="#000"]')].forEach(i => i.setAttribute('stroke', 'currentColor')));

            [...el.querySelectorAll('pre[class="template:classcial-chinese-literature-and-poetry-translation"] code')].forEach(e => {
                let result = el.createElement('div');
                e.innerHTML.trim().split('\n\n').forEach(g => {
                    let text = g.split('\n'), j = el.createElement('div');
                    for (let i = 0; i < text.length; i += 2) {
                        let originalText = el.createElement('p'), translation = el.createElement('p');
                        originalText.innerHTML = text[i];
                        translation.innerHTML = text[i + 1];
                        originalText.classList.add('original-text');
                        translation.classList.add('translation');
                        j.appendChild(originalText);
                        j.appendChild(translation);
                    }
                    j.classList.add('paragraph');
                    result.appendChild(j);
                });
                result.classList.add('classcial-chinese-literature-and-poetry-translation');
                e.parentElement.parentElement.replaceChild(result, e.parentElement);
            });

            [...el.querySelectorAll("p")].forEach(e => {
                e.innerHTML = e.innerHTML.replaceAll(/==(.+?)==/g, "<mark>$1</mark>").replaceAll(/​\s+?/g, "<span class='tab'></span>");
            });

            const meta = fm(source).attributes, stat = fse.statSync(filePath);
            let templatePostPage = fse.readFileSync(path.join(__dirname, 'template', 'post.html'), 'utf8');
            templatePostPage = templatePostPage.replace('{{topbar}}', templateTopbar).replace('{{footer}}', templateFooter).replace('{{content}}', el.querySelector("body").innerHTML).replaceAll('{{title}}', meta.title).replace('{{meta}}', `<span class='chars'>${stat.size}B</span><span class='created-date'>Created ${`${stat.ctime}`.split('T')[0]}</span><span class='modified-date'>Modified ${`${stat.mtime}`.split('T')[0]}</span>`).replace('{{sidebar}}', templateSidebar);

            let outputFileDir = path.join(__dirname, 'public', 'archive');
            if (reservedPages.indexOf(`${meta.title}`.toUpperCase()) !== -1) {
                outputFileDir = path.join(__dirname, 'public');
            }


            if (meta.categories && meta.categories.length > 0) {
                meta.categories.forEach(e => {
                    e.push(`${meta.title}`);
                    let p = path.join(...e);
                    if (platform === 'win32') {
                        const badWinChars = /[*|"<>?:]/g
                        p = p.replaceAll(badWinChars, '-');
                    }
                    outputFileDir = path.join(outputFileDir, p);
                });
            } else {
                let p = `${meta.title}`;
                if (platform === 'win32') {
                    const badWinChars = /[*|"<>?:]/g
                    p = p.replaceAll(badWinChars, '-');
                }
                outputFileDir = path.join(outputFileDir, p);
            }
            mkdirp.sync(outputFileDir);
            fse.writeFileSync(path.join(outputFileDir, 'index.html'), templatePostPage);
            return [meta, stat];
        }
    });
}