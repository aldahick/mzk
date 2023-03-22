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

class Api {
  /** @returns a signed URL for recording files to be POSTed to */
  async fetchUploadUrl(): Promise<string> {
    const res = await this.fetch<{ uploadUrl: string }>('upload-url', {
      method: 'GET'
    });
    return res.uploadUrl;
  }
  /** @param path should NOT have a preceding '/' */
  async fetch<T>(path: string, { queryParams, ...options }: RequestInit & { queryParams?: Record<string, string> } = {}): Promise<T> {
    let url = config.apiUrl + path;
    if (queryParams) {
      const searchParams = new URLSearchParams(Object.entries(queryParams));
      url += "?" + searchParams.toString();
    }
    const res = await window.fetch(url, options);
    return res.json();
  }
}

class App extends HTMLElement {
  private fileInput: HTMLInputElement;
  constructor() {
    super();

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.onchange = this.handleFileChange.bind(this);
    this.appendChild(this.fileInput);
  }

  private handleFileChange(): void {
    if (!this.fileInput.files) {
      return;
    }
  }
}
customElements.define("app", App);
window.addEventListener('load', () => {
  config = makeConfig();
})
