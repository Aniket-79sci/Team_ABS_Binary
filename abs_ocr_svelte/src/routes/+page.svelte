<script>
	import Button from '$lib/components/ui/button/button.svelte';
	// import workerFile from 'tesseract.js/dist/worker.min.js'
	// // import langData from "$lib/tesseract_local/lang_data/eng.traineddata"
	// import coreData from "tesseract.js-core"

	import { createWorker } from 'tesseract.js';

	import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

	// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
	// 	'pdfjs-dist/build/pdf.worker.min.js',
	// 	import.meta.url
	// ).toString();
	let workerOptions = {
		// workerPath:workerFile,
		// // langPath:langData,
		// corePath:coreData,
		logger: (m) => console.log(m)
		// gzip : false,
		// workerBlobURL:false
	};

	let file_img;

	let pdf;

	let pdf_file;

	let images;

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

	function downloadPdf() {
		const blob = new Blob([new Uint8Array(pdf)], { type: 'application/pdf' });

		const link = document.createElement('a');
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', file_img[0].name.split('.')[0]);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			// link.click();
			document.body.removeChild(link);
			pdf_file = url;
		}
	}

	async function convertPdfToImages(file) {
		const reader = new FileReader();
		reader.readAsArrayBuffer(file);

		return new Promise((resolve) => {
			reader.onload = async () => {
				const arrayBuffer = reader.result;
				const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
				let pages = [];

				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const viewport = page.getViewport({ scale: 2 });
					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					canvas.width = viewport.width;
					canvas.height = viewport.height;

					await page.render({ canvasContext: context, viewport }).promise;
					pages.push(canvas.toDataURL('image/png'));
				}

				resolve(pages);
			};
		});
	}

	async function complete() {
		// let images = await convertPdfToImages(file_img[0]);

		await recognizeText(file_img[0]).then(() => {
			downloadPdf();
		});
	}
</script>

<div>
	<input
		type="file"
		on:input={() => {
			recognizeText(file_img[0]);
		}}
		name=""
		bind:files={file_img}
	/>

	<Button on:click={complete}>Complete</Button>
	<Button class="btn" on:click={recognizeText}>recognize</Button>
	<Button class="btn" on:click={downloadPdf}>Download PDF</Button>

	<iframe src={pdf_file} frameborder="0" title="pdf" class="h-screen w-screen"></iframe>
</div>
