from google.cloud import storage
import json
import os
import sys
import tempfile
print('Loading Omnizart...')
from omnizart.music.app import MusicTranscription

DEFAULT_BUCKET_NAME = 'mzk-user-uploads'
BUCKET_NAME = 'GOOGLE_STORAGE_BUCKET_NAME' in os.environ and os.environ['GOOGLE_STORAGE_BUCKET_NAME'] or DEFAULT_BUCKET_NAME

def make_temp_path():
  return os.path.join(tempfile.gettempdir(), os.urandom(24).hex())

def update_status(bucket, metadata_storage_path, new_status):
  blob = bucket.blob(metadata_storage_path)
  metadata = json.loads(blob.download_as_text())
  metadata['status'] = new_status
  blob.upload_from_string(json.dumps(metadata))

def transcribe(bucket, input_storage_path, output_storage_path):
  input_blob = bucket.blob(input_storage_path)
  output_blob = bucket.blob(output_storage_path)
  input_filename = make_temp_path() + '.mp3'
  output_filename = make_temp_path() + '.mid'
  print('Downloading {} to {}'.format(input_storage_path, input_filename))
  input_blob.download_to_filename(input_filename)
  print('Transcribing to {}'.format(output_filename))
  MusicTranscription().transcribe(input_filename, output=output_filename)
  print('Uploading {} to {}'.format(output_filename, output_storage_path))
  output_blob.upload_from_filename(output_filename)

def main(args):
  metadata_path = args[0]
  input_path = args[1]
  output_path = args[2]
  print(args)

  storage_client = storage.Client()
  bucket = storage_client.bucket(BUCKET_NAME)
  try:
    transcribe(bucket, input_path, output_path)
    update_status(bucket, metadata_path, 'success')
  except Exception as ex:
    print(ex)
    update_status(bucket, metadata_path, 'errored')

if __name__ == "__main__":
  main(sys.argv[1:])
