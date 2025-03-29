/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

import { createWorker } from 'tesseract.js';


let workerOptions = {
    // workerPath:workerFile,
    // // langPath:langData,
    // corePath:coreData,
    logger: (m) => console.log(m)
    // gzip : false,
    // workerBlobURL:false
};


console.log('👋 This message is being logged by "renderer.js", included via Vite');

const complete_btn = document.querySelector("#complete_btn");
const input_file = document.querySelector("#input_file");
const iframe_viewer = document.querySelector("#iframe_viewer");
const text_search_input = document.querySelector("#text_search_input");
const search_btn = document.querySelector("#search_btn");

let pdf;

async function recognizeText(images) {
    console.log(images);
    try {
        const worker = await createWorker('eng', 1, workerOptions);
        const { data } = await worker.recognize(
            images,
            { pdfTitle: images.name.split('.')[0] },
            { pdf: true }
        );
        console.log(data.text);

        pdf = data.pdf;

        worker.terminate();
        return Promise.resolve(data);
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

function downloadPdf(pdf,pdf_name) {
    let pdf_file;
    const blob = new Blob([new Uint8Array(pdf)], { type: 'application/pdf' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', pdf_name.name.split('.')[0]);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        // link.click();
        document.body.removeChild(link);
        pdf_file = url;
        return pdf_file;
    }
}

async function complete() {
    
    let file_img = input_file.files;
    await recognizeText(file_img[0]).then((data) => {
        let pdf_files = downloadPdf(data.pdf,file_img[0]);
        iframe_viewer.src = pdf_files;
        
    });
}

complete_btn.addEventListener("click",()=>{
    complete();
   
})

search_btn.addEventListener("click",()=>{
    window.pdf_api.search_text(text_search_input.value);
})




