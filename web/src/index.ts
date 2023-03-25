let config: {
  apiUrl: string
};
const makeConfig = (): typeof config => {
  const values = JSON.parse(document.getElementById('config')?.getAttribute('json') ?? '') as typeof config | undefined;
  if (!values) {
    throw new Error('Missing config! Make sure to run "npm run build"')
  }
  return values;
};

class TranscriptionStatus extends HTMLElement {
  private static readonly REFRESH_INTERVAL_MS = 3000;
  private readonly titleText: HTMLHeadingElement;
  private readonly statusText: HTMLParagraphElement;
  private intervalId?: number;
  private transcriptionId?: string;

  constructor() {
    super();
    this.titleText = document.createElement('h5');
    this.appendChild(this.titleText);
    this.statusText = document.createElement('p');
    this.appendChild(this.statusText);
  }

  set transcription({ id, label, status }: Transcription) {
    this.transcriptionId = id;
    this.intervalId = setInterval(() =>
      this.fetchAndDisplay().catch(() => this.updateStatusText('errored')),
      TranscriptionStatus.REFRESH_INTERVAL_MS
    );
    this.titleText.innerText = 'Transcription status: ' + label;
    this.updateStatusText(status);
  }

  private async fetchAndDisplay(): Promise<void> {
    if (!this.transcriptionId) {
      return clearInterval(this.intervalId);
    }
    const api = new Api();
    const { status, midiUrl } = await api.fetchTranscription(this.transcriptionId);
    const final = this.updateStatusText(status);
    if (midiUrl && status === 'success') {
      this.addDownloadButton(midiUrl);
    }
    // if this is a final state, don't fetch again
    if (final && !!this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * @returns true if this is a final state
   */
  private updateStatusText(status: string): boolean {
    let color = 'black';
    let final = false;
    if (status === 'success') {
      color = 'green';
      final = true;
    } else if (status === 'errored') {
      color = 'red';
      final = true;
    } else if (status === 'running') {
      color = 'orange';
    } else if (status === 'queued') {
      color = 'purple';
    }
    this.statusText.style.color = color;
    this.statusText.style.fontWeight = final ? 'bold' : 'normal';
    this.statusText.innerText = status;
    return final;
  }

  private addDownloadButton(url: string): void {
    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.href = url;
    this.appendChild(link);

    const button = document.createElement('button');
    button.textContent = 'Download transcription';
    link.appendChild(button);
  }
}
customElements.define('transcription-status', TranscriptionStatus);

class AudioUploadForm extends HTMLElement {
  private static readonly MESSAGE_DURATION_MS = 20_000;
  private readonly messageText: HTMLParagraphElement;
  private readonly fileInput: HTMLInputElement;
  private readonly submitButton: HTMLButtonElement;

  constructor() {
    super();

    this.messageText = document.createElement('p');
    this.messageText.style.fontWeight = 'bold';
    this.appendChild(this.messageText);

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.appendChild(this.fileInput);

    this.submitButton = document.createElement('button');
    this.submitButton.innerText = 'Submit';
    this.submitButton.addEventListener('click', () => this.handleSubmit().catch(this.handleError));
    this.appendChild(this.submitButton);
  }

  private handleSubmit = async (): Promise<void> => {
    const [file] = this.fileInput.files ?? [];
    if (!file) {
      return;
    }
    const api = new Api();
    const { uploadUrl, transcriptionId } = await api.fetchUploadUrl();
    await fetch(uploadUrl, {
      method: 'PUT',
      body: await file.arrayBuffer(),
      headers: {
        "Content-Type": file.type
      }
    });
    this.fileInput.value = '';
    this.setMessage(`Successfully uploaded ${file.name}, starting transcription...`, 'green');
    const transcription = await api.startTranscription({ label: file.name, transcriptionId });
    // const transcriptionStatus = document.createElement('transcription-status') as TranscriptionStatus;
    const transcriptionStatus = new TranscriptionStatus();
    transcriptionStatus.transcription = transcription;
    this.appendChild(transcriptionStatus);
  }

  private handleError = (err: unknown) => {
    const text = err instanceof Error ? err.message : err as string;
    console.error(err);
    this.setMessage(text, 'red');
  }

  private setMessage = (message: string, color: string) => {
    this.messageText.style.color = color;
    this.messageText.innerText = message;
    setTimeout(() => this.messageText.innerText = '', AudioUploadForm.MESSAGE_DURATION_MS);
  };
}
customElements.define("audio-upload-form", AudioUploadForm);
window.addEventListener('load', () => {
  config = makeConfig();
})
