export const CONFIG = {
  relayHost: '32.27.118.149',
  relayPort: 443,
  full_device_sync: false,
  skip_dot_files: true,
  scan_selected_folders: true,
  prod: false,
  dev: false,
  get url() {
    //return this.prod ? 'https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/' : 'http://localhost:8080/';
    if (this.prod) {
      return 'http://54.224.116.254:8080';
    } else if (this.dev) {
      // return 'http://54.197.4.251:8080';
      return 'http://3.84.158.138:8080';
    } else {
      return 'http://localhost:8080/';
    }
  },
  get url_ws() {
    //return this.prod ? 'https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/' : 'http://localhost:8080/';
    if (this.prod) {
      return 'ws://54.224.116.254:8082';
    } else if (this.dev) {
      // return 'http://54.197.4.251:8080';
      return 'ws://3.84.158.138:8082/ws/live_data/';
    } else {
      return 'ws://0.0.0.0:8082/ws/live_data/';
    }
  }
}
