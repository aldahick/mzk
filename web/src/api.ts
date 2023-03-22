interface Transcription {
  id: string;
  status: string;
  label: string;
}

class Api {
  /** @returns a signed URL for recording files to be POSTed to */
  async fetchUploadUrl(): Promise<string> {
    const res = await this.fetch<{ uploadUrl: string }>('upload-url', {
      method: 'GET'
    });
    return res.uploadUrl;
  }

  async startTranscription(params: {
    label: string;
    url: string;
  }): Promise<Transcription> {
    return await this.fetch<Transcription>('transcription', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async fetchTranscription(id: string): Promise<Transcription> {
    return await this.fetch<Transcription>(`transcription/${id}`, {
      method: 'GET'
    });
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
