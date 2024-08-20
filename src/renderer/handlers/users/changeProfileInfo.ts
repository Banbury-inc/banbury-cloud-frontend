import axios from 'axios';


export async function change_profile_info(first_name: string, last_name: string, username: any, email: string, password: string) {

  try {
    const response = await axios.get<{
      result: string;
      username: string;
      // }>('https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo2/' + username + '/');
    }>('https://website2-v3xlkt54dq-uc.a.run.app/change_profile/' + username + '/' + password + '/' + first_name + '/' + last_name + '/' + email + '/');
    // }>('https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo/');
    const result = response.data.result;
    if (result === 'success') {
      console.log("change profile success");
      return 'success';
    }
    if (result === 'fail') {
      console.log("change profilefailed");
      return 'failed';
    }
    if (result === 'user_already_exists') {
      console.log("user already exists");
      return 'exists';
    }

    else {
      console.log("change profilefailed");
      return 'change profile failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


