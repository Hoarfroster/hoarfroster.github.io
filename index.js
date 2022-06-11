const glob = require('glob'), path = require('path'), mkdirp = require('mkdirp'), os = require('os'), spawn = require('child_process').spawn, fs = require('fs'), fm = require('front-matter');
const cluster = require('cluster');
const sqlite3 = require('sqlite3');
const tmpdir = path.join(os.tmpdir(), 'hoarfroster-blog-generator');

if (cluster.isMaster) {
    var db = new sqlite3.Database('index.db', sqlite3.OPEN_READWRITE, function (e) {
        if (e && e.code == "SQLITE_CANTOPEN") {
            db = new sqlite3.Database('index.db', (e) => console.error(e));
            db.run("create table if not exists history(title text, path text PRIMARY KEY, content text, stat text)", (e) => console.error(e));
            return;
        } else if (e) {
            console.error(e);
        }
    });

    const files = glob.sync('source/**/*.@(md|html)', {});
    db.all('SELECT PATH FROM HISTORY', function (e, rows) {
        if (e) {
            console.error(e);
        } else {
            rows.forEach(function (row) {
                if (files.filter(f => f === row.path).length === 0) {
                    db.run('DELETE FROM HISTORY WHERE PATH = ?', row);
                }
            });
        }
    });

    let done = 0, id = 0, workers = [];
    mkdirp.sync(tmpdir);
    for (let i = 0; i < Math.min(os.cpus().length, files.length); i++) {
        let worker = cluster.fork();
        workers.push({ worker: worker, pid: worker.pid });
        worker.send({ fileName: files[id] });
        id += 1;

        worker.on('message', workerMessageHandler);

        function workerMessageHandler(msg) {
            if (msg.done !== undefined) {
                if (msg.done) {
                    db.run('REPLACE INTO HISTORY (TITLE, PATH, CONTENT, STAT) VALUES (?, ?, ?, ?)', [msg.title, msg.path, msg.source, JSON.stringify(msg.stat)], (e) => console.error(e));
                }
                done += 1;
                if (done >= files.length || id >= files.length) {
                    worker.process.kill();
                    workers = workers.filter(w => w.worker !== worker);
                    if (workers.length === 0) {
                        setTimeout(() => {
                            try {
                                fs.rmSync(tmpdir, { recursive: true, force: true });
                            } catch (e) { console.warn(e); }
                        }, 10);
                    }
                } else {
                    worker.send({ fileName: files[id], db: db });
                    id += 1;
                }
            }
        }
    }
} else {
    process.on('message', async function (msg) {
        let filePath = msg.fileName, fileName = path.basename(filePath);
        const startingTime = new Date(), checker = setTimeout(() => {
            console.log("[Worker] Failed to process file: " + filePath + " in " + 60000 + "ms");
            process.send({ done: false, pid: process.pid, source: source, path: filePath, stat: fs.statSync(filePath), title: "" });
        }, 60000);

        const tmpFileName = process.pid + fileName, tmpOutFileName = process.pid + fileName + '.out.html';
        const tmpFilePath = path.join(tmpdir, tmpFileName), tmpOutFilePath = path.join(tmpdir, tmpOutFileName);
        const source = fs.readFileSync(filePath, { encoding: 'utf8' });

        var db = new sqlite3.Database('index.db', sqlite3.OPEN_READWRITE, function (e) {
            if (e) {
                console.error(e);
            }
        });
        db.all('SELECT CONTENT FROM HISTORY WHERE PATH = ?', filePath, function (e, rows) {
            if (e) {
                console.error(e);
            } else {
                if (rows[0] && source === rows[0].content) {
                    process.send({ done: true, pid: process.pid, source: source, path: filePath, stat: fs.statSync(filePath), title: "" });
                    clearTimeout(checker);
                } else {
                    processFile();
                }
            }
        });
        async function processFile() {
            console.log("[Worker] Working on " + filePath);
            fs.writeFileSync(tmpFilePath, source);

            const args = ["--lua-filter", path.join(__dirname, "filters/texsvg.lua"), '-f', 'commonmark_x', '-s', tmpFileName, '-o', tmpOutFileName, '--standalone'];
            const task = await spawn('pandoc', args, {
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
                    renderFile();
                    console.log('[Worker] Succeed in proceeding file ' + filePath + ' in ' + (new Date() - startingTime) + 'ms');
                    setTimeout(() => {
                        clearInterval(checker);
                        process.send({ done: true, pid: process.pid, source: source, path: filePath, stat: fs.statSync(filePath), title: meta.title ?? "" });
                    }, 10);
                }
            });
        }

        function renderFile() {
            const jsdom = require("jsdom");
            const { JSDOM } = jsdom;
            let outHtml = fs.readFileSync(tmpOutFilePath, { encoding: "utf8" });
            outHtml = outHtml.replaceAll(/\[(.+?)\]\^\((.+?)\)/g, '<ruby><rb>$1</rb><rt>$2</rt></ruby>'); // Ruby Support
            var el = new JSDOM(outHtml).window.document;
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

            const content = el.querySelector("body").innerHTML;
            const meta = fm(source).attributes;
            let outputFileDir;
            if (Array.isArray(meta.category)) {
                outputFileDir = path.join(__dirname, 'public', ...meta.category);
            } else {
                outputFileDir = path.join(__dirname, 'public', meta.title.toString());
            }
            await mkdirp(outputFileDir);
            fs.writeFileSync(path.join(outputFileDir, 'index.html'), content);
        }
    });
}