import axios from 'axios';

export async function addDevice() {

  let username = "nate";
  let device_name = "test_device";
  try {
    const response = await axios.get<{
      result: string;
      username: string;
      // }>('https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo2/' + username + '/');
    }>('https://website2-v3xlkt54dq-uc.a.run.app/add_device/' + username + '/' + device_name + '/');
    // }>('https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo/');
    const result = response.data.result;
    if (result === 'success') {
      console.log("device add_success");
      return 'success';
    }
    if (result === 'fail') {
      console.log("device_add failed");
      return 'failed';
    }
    if (result === 'device_already_exists') {
      console.log("device already exists");
      return 'exists';
    }

    else {
      console.log("device_add failed");
      return 'device_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

