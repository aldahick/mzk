from google.cloud import storage
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
from omnizart.music.app import MusicTranscription
import tempfile
import sys

DEFAULT_BUCKET_NAME = 'mzk-user-uploads'

class OmnizartRequestHandler(BaseHTTPRequestHandler):
  def transcribe(body: any):
    bucket_name = 'GOOGLE_STORAGE_BUCKET_NAME' in os.environ and os.environ['GOOGLE_STORAGE_BUCKET_NAME'] or DEFAULT_BUCKET_NAME
    input_storage_path = body['audioStoragePath']
    output_storage_path = body['midiStoragePath']
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    input_blob = bucket.blob(input_storage_path)
    output_blob = bucket.blob(output_storage_path)
    with tempfile.TemporaryFile() as input_file, tempfile.TemporaryFile() as output_file:
      input_blob.download_to_file(input_file)
      MusicTranscription().transcribe(input_file.name, output=output_file.name)
      output_blob.upload_from_file(output_file)

  def do_POST(self):
    try:
      body = self.get_request_body()
      self.send_json_response(200, body)
    except Exception as ex:
      if type(ex.args[0]) == dict:
        code = ex.args[0]['status']
        msg = ex.args[0]['msg']
        self.send_json_response(code, { 'error': msg })
      else:
        self.send_json_response(500, { 'error': str(ex) })

  def get_request_body(self):
    content_len = self.headers.get('Content-Length')
    if not content_len:
      raise Exception({ 'status': 400, 'msg': 'Missing header: Content-Length' })
    content_len = int(content_len)
    if content_len == 0:
      raise Exception({ 'status': 400, 'msg': 'Empty POST body' })
    content_type = self.headers.get('Content-Type')
    if content_type != 'application/json':
      raise Exception({ 'status': 400, 'msg': 'Invalid Content-Type: got "{}", expected "application/json"'.format(content_type) })
    json_body = self.rfile.read(content_len)
    return json.loads(json_body)

  def send_json_response(self, status: int, data: any):
    body = bytes(json.dumps(data), 'UTF-8')
    self.send_response(status)
    self.send_header('Content-Length', len(body))
    self.send_header('Content-Type', 'application/json')
    self.end_headers()
    self.wfile.write(body)

def main():
  port = 'PORT' in os.environ and int(os.environ['PORT']) or 8080
  httpd = HTTPServer(('', port), OmnizartRequestHandler)
  try:
    print('Serving on port {}'.format(port))
    httpd.serve_forever()
  except KeyboardInterrupt:
    print('Closing server...')
    httpd.server_close()
    sys.exit(130)

if __name__ == "__main__":
  main()
