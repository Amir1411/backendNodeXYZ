<?php
class Login extends CI_Controller {

	function __construct() {
		parent::__construct();
		$this->load->model('loginmodel');
		$this->load->model('commonmodel');
		$this->load->model('site_settingsmodel');
		$this->load->model('facebookloginmodel');
		$this->limit = $this->site_settingsmodel->per_page();
	}

	public function index() {
		if($this->session->userdata('is_logged_in') && $this->session->userdata('userid')!='') {
			redirect("index.php/login/home");
		} else {
			$data = array();
			$data['email'] = (array_key_exists('cookie_email',$_COOKIE))?$_COOKIE['cookie_email']:'';
			$data['password'] = (array_key_exists('cookie_password',$_COOKIE))?$_COOKIE['cookie_password']:'';
			//$this->load->view("includes/header");
			$this->load->view("login/login",$data);
			//$this->load->view("includes/footer");
		}
	}

	function home() {
		if($this->session->userdata('is_logged_in') && $this->session->userdata('userid')!='') {

			$uri_segment = 3; # offset
			# Return third URI segment, if no third segment returns ''  
			$offset = $this->uri->segment($uri_segment,'');			

			# Get total URI segmentss
			$total_seg = $this->uri->total_segments();		
			$data['appointment'] = $this->loginmodel->showall_appointment($this->session->userdata('userid'),$this->limit, $offset);

			// set total_rows config data for pagination
			$config['total_rows'] = $this->loginmodel->count_all_appointment($this->session->userdata('userid'));
			//$data['fetch']=$this->loginmodel->userdetail();
			//$data['appointment']=$this->loginmodel->showall_appointment($this->session->userdata('userid'));
			$keys = "";

			// generate pagination
			$this->load->library('pagination');
			$config['base_url'] = base_url().'index.php/login/home/'.'/'.$keys.'/';
			$config['per_page'] = $this->limit;
			$config['uri_segment'] = $uri_segment;

			// CUSTOMIZE PAGINATION LINKS
			$config[ 'full_tag_open' ] = '<ul class="pagination">';
			$config[ 'full_tag_close' ] = '</ul>';
			$config[ 'num_tag_open' ] = '<li>';
			$config[ 'num_tag_close' ] = '</li>';
			$config[ 'cur_tag_open' ] = '<li class="active"><a>';
			$config[ 'cur_tag_close' ] = '</a></li>';
			$config[ 'prev_tag_open' ] = '<li aria-label="Previous" class="prev">';
			$config[ 'prev_link' ] = '&lt;';
			$config[ 'prev_tag_close' ] = '</li>';
			$config[ 'next_tag_open' ] = '<li aria-label="Next" class="next">';
			$config[ 'next_link' ] = '&gt;';
			$config[ 'next_tag_close' ] = '</li>';
			$config['first_link'] = '<<';
			$config['first_tag_open'] = '<li>';
			$config['first_tag_close'] = '</li>';
			$config['last_link'] = '>>';
			$config['last_tag_open'] = '<li>';
			$config['last_tag_close'] = '</li>';

			$this->pagination->initialize($config);
			$data['pagination'] = $this->pagination->create_links();
			$this->load->view("includes/header");
			$this->load->view('appointment/appointment',$data);
			$this->load->view("includes/footer");
		}
		else {
			redirect('index.php/login/index');
		}
	}

	public function success() {
		$name = trim($this->input->post('email'));
		$pswd = trim($this->input->post('password'));

		$check_login = $this->loginmodel->login_user($name, $pswd);
		//print_r($check_login);die;
		//echo $check_login;die;
		$redirect_url = "common";
		if( $check_login[ 'value' ] == '1' ) {

			if( $this->input->post('remember_me') == 1 ) {
				setcookie('cookie_value', 1, time() + 60 * 60 * 60 * 24 * 365,'/');
				setcookie('cookie_email', $name, time() + 60 * 60 * 60 * 24 * 365,'/');
				setcookie('cookie_password', $pswd, time() + 60 * 60 * 60 * 24 * 365,'/');
			} else {
				setcookie('cookie_value', '', -(time() + 60 * 60 * 60 * 24 * 365),'/');
				setcookie('cookie_email', '', -(time() + 60 * 60 * 60 * 24 * 365),'/');
				setcookie('cookie_password', '', -(time() + 60 * 60 * 60 * 24 * 365),'/');
			}
			$data = array(
				'userid'       => $check_login[ 'user_id' ],
				'email'        => $check_login[ 'email' ],
				'is_logged_in' => 1
			);

			$this->session->set_userdata($data);
			$redirect_url = "index.php/login/home";
			$message="You are Successfully Logged In.";
			$this->session->set_userdata('success_msg', '<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');

		} else {
			$redirect_url = 'index.php/login/index';
			//$message="Login Failed!";
			$message="Invalid User Name or Password";
			$this->session->set_userdata('error_msg', '<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');
			//redirect('login/index');
		}
		redirect($redirect_url);
	}

	function forgot_password() {
		$this->load->view('includes/header');
		$this->load->view('login/forgotpass');
		$this->load->view('includes/footer');
	}

	function get_mail() {
		$email=$this->input->post('email');
		$data1=$this->loginmodel->check_email($email);
		//echo"<script>alert('Email not sent')</script>";
		if($data1==1) {
			$n_data=$this->loginmodel->sendEmail($email);
			if($n_data==1) {
				//echo"<script>alert('Email sent successfully')</script>";
				//redirect('index.php/loginnew');
				$message="Email sent successfully.";
				$this->session->set_userdata('success_msg', '<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');

				$this->load->view('includes/header');
				//$this->load->view('login/forgotpass');
				$this->load->view('login/putpassword');
				$this->load->view('includes/footer');
				// login/passwordgenerate
			} else if($n_data==0) {
				//echo"<script>alert('Email not sent')</script>";
				$message="Error sending mail!";
				$this->session->set_userdata('error_msg', '<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');
				//$this->load->view('login/forgotpass');
			}
		} else {
			$message="Email does not exist!";
			$this->session->set_userdata('error_msg', '<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');
			redirect("index.php/login/forgot_password");
		}
	}

	function passwordgenerate() {
		$this->load->view('includes/header');
		$this->load->view('login/putpassword');
		$this->load->view('includes/footer');
	}

	function change_password() {
		$verification_code=$this->input->post('verification_code');
		$new_password=$this->input->post('new_password');
		// $user_id=$_REQUEST['user_id'];
		$data=$this->loginmodel->check_code($verification_code);

		if(!empty($data)) {
			$id=$data[0]->id;
			$n_data=$this->loginmodel->update_password($id,$new_password);
			if($n_data==1) {
				$message="updated successfully!";
				$this->session->set_userdata('success_msg', '<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');
				redirect('index.php/login');
			} else if($n_data==0) {
				$message="Failed!";
				$this->session->set_userdata('error_msg', '<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');;
			} 
		} else {
			$message="verification code doesnt match!";
			$this->session->set_userdata('error_msg', '<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');;
			// $this->load->view('login/putpassword');
			redirect("index.php/login/passwordgenerate");	
		}
	}

	public function logout() {
		$this->loginmodel->logout();
		$message="You are Successfully Logged Out.";
		$this->session->set_userdata('success_msg', '<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a><strong>' . $message . '</strong></div>');
		redirect('index.php/login');
	}

	//public function editprofile() {	
	//	$data=Array();
	//	$data['edit_user']=$this->loginmodel->profile_to_edit();
	//	//echo "<pre>";
	//	//print_r($data);die;
	//	$this->load->view('includes/header');
	//	$this->load->view('profile/editprofile', $data);
	//	$this->load->view('includes/footer');
	//	}

	function facebook_login() {
		$data = $this->facebookloginmodel->facebook_login();
		//print_r($data);die;
		if( !empty($data)) {
			//$userid=$this->session->userdata('userid');
			//$payment_validity=$this->commonmodel->payment_status($userid);

			$session_data = array(
				'userid'      => $data[ 'user_id' ],
				'is_logged_in' => 1,
				'email'    => $data[ 'email' ],
			);

			$this->session->set_userdata($session_data);
			//$userid=$this->session->userdata('userid');
			//$payment_validity=$this->commonmodel->payment_status($userid);
			//if($payment_validity==1)
			//{
			$this->session->set_userdata('success_msg','<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a><strong>Login successfully</strong></div>');
			redirect("index.php/login/home");
			//}
			//else{

			//$this->session->set_userdata('payment_msg', '<div class="alert alert-danger"><strong>Please login to the app and pay for further use of our web and app..</strong></div>');
			redirect("index.php/login/home");
			//}
		} else {
			$this->session->set_userdata('error_msg','<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><strong>User does not exist . Login failed.</strong></div>');
			session_destroy();
			redirect("index.php/login/index");			
		}
	}

	function deleteappointment(){
		//echo $_REQUEST['id'];die;
		$data=$this->loginmodel->app_req_deny($_REQUEST['id']);
		if($data==1){
		$this->session->set_userdata('success_msg','<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a><strong>Appointment has canceled successfully</strong></div>');
		redirect("index.php/login/home");
		}else{
		$this->session->set_userdata('error_msg','<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><strong>Failed to cancel</strong></div>');	
		redirect("index.php/login/home");
	}

}

}
?>