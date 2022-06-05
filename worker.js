const { parentPort, workerData } = require('worker_threads'), spawn = require('child_process').spawn, path = require('path'), fs = require('fs');

// const file = workerData;

// console.log("[Worker] Working on " + file);

// const fileName = path.basename(file), dirName = path.dirname(file);
// const tmpFilePath = path.join(__dirname, 'tmp', fileName), filePath = path.join(__dirname, file);
// fs.writeFileSync(tmpFilePath, fs.readFileSync(filePath));

// const args = ["--lua-filter", "./filters/texsvg.lua", '-f', 'commonmark_x', '-s', 'tmp.md', '-o', 'tmp.html', '--standalone'];
// const task = await spawn('pandoc', args, {
//     cwd: path.join(process.cwd(), 'tmp'),
//     env: process.env,
//     encoding: "utf8"
// });
// console.log(task)

// console.log(task.stdout);
// if (task.status == 0) {
//     if (task.stderr) {
//         var warn_msg = '' +
//             '[WARNING] On ' + data.path + '\n' +
//             '[WARNING] ' + task.stderr;
//         console.log(warn_msg);
//     }
// } else {
//     // Throw Exception
// }

parentPort.postMessage("Done");
process.exit()