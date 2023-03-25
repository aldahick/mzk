interface Transcription {
  id: string;
  status: string;
  label: string;
  midiUrl?: string;
}

interface UploadUrlResponse {
  /** signed URL, for recording files to be POSTed to */
  uploadUrl: string;
  /** use in {@link Api.startTranscription} */
  transcriptionId: string;
}

class Api {
  async fetchUploadUrl(): Promise<UploadUrlResponse> {
    return await this.fetch<UploadUrlResponse>('upload-url', {
      method: 'GET'
    });
  }

  async startTranscription(params: {
    label: string;
    transcriptionId: string;
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
    if (res.status !== 200) {
      throw new Error((await res.json()).error ?? 'Unknown error');
    }
    return res.json();
  }
}
