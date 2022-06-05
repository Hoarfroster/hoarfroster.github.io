const glob = require('glob'), path = require('path'), mkdirp = require('mkdirp'), os = require('os'), spawn = require('child_process').spawn, fs = require('fs'), fm = require('front-matter');
const cluster = require('cluster');
const tmpdir = path.join(os.tmpdir(), 'hoarfroster-blog-generator');

if (cluster.isMaster) {
    let db = JSON.parse(fs.existsSync('index.db') ? fs.readFileSync('index.db', { encoding: 'utf8' }) : '{}');
    if (db.history === undefined) {
        db.history = [];
    }

    glob('source/**/*.@(md|html)', {}, async (_err, files) => {
        await mkdirp(tmpdir);
        let id = 0, done = 0, workers = [];
        for (let i = 0; i < Math.min(os.cpus().length, files.length); i++) {
            let worker = cluster.fork();
            workers.push({ worker: worker, pid: worker.pid });
            worker.send({ fileName: files[id], db: db });
            id += 1;

            worker.on('message', function (msg) {
                if (msg.done) {
                    db.history.push({ path: msg.path, source: msg.source });
                    done += 1;
                    if (done >= files.length || id >= files.length) {
                        worker.process.kill();
                        workers = workers.filter(w => w.worker !== worker);
                        if (workers.length === 0) {
                            setTimeout(() => {
                                try {
                                    fs.rmSync(tmpdir, { recursive: true, force: true });
                                } catch (e) { console.warn(e); }
                                fs.writeFileSync('index.db', JSON.stringify(db));
                            }, 10);
                        }
                    } else {
                        worker.send({ fileName: files[id], db: db });
                        id += 1;
                    }
                }
            });
        }
    });
} else {
    process.on('message', async function (msg) {
        const file = msg.fileName, startingTime = new Date();

        console.log("[Worker] Working on " + file);

        let fileName = path.basename(file);
        const tmpFileName = process.pid + fileName, tmpOutFileName = process.pid + fileName + '.out.html';
        const tmpFilePath = path.join(tmpdir, tmpFileName), tmpOutFilePath = path.join(tmpdir, tmpOutFileName), filePath = path.join(__dirname, file);
        const source = fs.readFileSync(filePath, { encoding: 'utf8' });

        const entry = msg.db.history.filter(entry => { entry.path === file })[0];
        if (!entry || entry.source !== source) {
            fs.writeFileSync(tmpFilePath, source);

            const args = ["--lua-filter", path.join(__dirname, "filters/texsvg.lua"), '-f', 'commonmark_x', '-s', tmpFileName, '-o', tmpOutFileName, '--standalone'];
            const task = await spawn('pandoc', args, {
                cwd: path.join(tmpdir),
                env: process.env,
                encoding: "utf8"
            });

            task.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            task.on('close', async (code) => {
                if (code === 0) {
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
        console.log('[Worker] Succeed in proceeding file ' + file + ' in ' + (new Date() - startingTime) + 'ms');
        setTimeout(() => {
            process.send({ done: true, pid: process.pid, source: source, path: file });
        }, 10);
    });
}