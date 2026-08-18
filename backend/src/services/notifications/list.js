const errors = {
  app: {
    title: 'ABA Schedules',
  },

  auth: {
    userDisabled: 'Your account is disabled',
    userNotFound: `Sorry, we don't recognize your credentials`,
    wrongPassword: `Sorry, we don't recognize your credentials`,
    weakPassword: 'This password is too weak',
    emailAlreadyInUse: 'Email is already in use',
	superAdminNotFound: 'Super admin user not found',
	companyNotFound: 'Selected company not found',
    invalidEmail: 'Please provide a valid email',
    passwordReset: {
      invalidToken: 'Password reset link is invalid or has expired',
      error: `Email not recognized`,
    },
    passwordUpdate: {
      samePassword: `You can't use the same password. Please create new password`,
    },
    userNotVerified: `Sorry, your email has not been verified yet`,
    emailAddressVerificationEmail: {
      invalidToken: 'Email verification link is invalid or has expired',
      error: `Email not recognized`,
    },
  },

  activity: {
	hasEvent: 'This Activity has associated event'
  },

  iam: {
    errors: {
      userAlreadyExists: 'User with this email already exists',
      userNotFound: 'User not found',
      disablingHimself: `You can't disable yourself`,
      revokingOwnPermission: `You can't revoke your own owner permission`,
      deletingHimself: `You can't delete yourself`,
      userWithSameUserbaneAlreadyExists:
        'User with this firstname-lastname already exists',
	  systemLevelRecord : 'You can not delete, this is system level'
    },
  },

  importer: {
    errors: {
      invalidFileEmpty: 'The file is empty',
      invalidFileExcel: 'Only excel (.xlsx) files are allowed',
      invalidFileUpload:
        'Invalid file. Make sure you are using the last version of the template.',
      importHashRequired: 'Import hash is required',
      importHashExistent: 'Data has already been imported',
    },
  },

  errors: {
    forbidden: {
      message: 'Forbidden',
    },
    validation: {
      message: 'An error occurred',
    },
  },

  branches: {
    notFound: 'Branch not found',
    hasChild: 'This branch has dependent children',
    breakStructure: 'This parent is already descendent to updated branch',
    branchNameTaken: 'Branch with same name exists',
    invalidBranchName: 'Invalid branch name',
    breakTypeParentStructure: 'Parent branch has lower branchtype',
    breakTypeChildStructure: 'One of children branch has higher branchtype',
	hasActiveUsers: 'Branch has related active users'
  },

  roles: {
	hasActiveUsers: 'Role has related active users'
  },

  branchetypes: {
    notFound: 'Branchtype not found',
    hasChild: 'This branchtype has dependent children',
    breakStructure: 'This parent is already descendent to updated branchtype',
    branchtypeNameTaken: 'Branchtype with same name exists',
  },

  branchetypes: {
    notFound: 'Branchtype not found',
    hasChild: 'This branchtype has dependent children',
    breakStructure: 'This parent is already descendent to updated branchtype',
    branchtypeNameTaken: 'Branchtype with same name exists',
  },

  emails: {
    invitation: {
      subject: `You've been invited to {0}`,
      body: `    
        <p>Hello,</p>
        <p>You've been invited to {0} set password for your {1} account.</p>
        <p><a href='{2}'>{2}</a></p>
        <p>Thanks,</p>
        <p>Your {0} team</p>
      `,
    },
    emailAddressVerification: {
      subject: `Verify your email for {0}`,
      body: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify Email</title>
<style type="text/css">
	@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"');
	body {
		margin: 0;
		padding: 0;
		background-color: #ebedf3;
	}
	table {
		border-spacing: 0;
	}
	td {
		padding: 0;
	}
	img {
		border: 0;
	}
	p{
		font-family: 'Poppins', sans-serif;
		color: rgba(0, 0, 0, 0.6)
	}
	a{
		font-family: 'Poppins', sans-serif;
	}
	h3{
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
	}
	.wrapper {
    table-layout: fixed;
				padding-top: 30px;
				padding-bottom: 30px;
				background-color: #ebedf3;
}
.main {
    width: 100%;
		max-width: 600px;
    font-family: sans-serif;
    color: #4a4a4a;
    text-align: center;
    margin: 5em auto;
    padding: 2em;
    background-color: #FFFF;
    border-radius: 0.5em;
    box-shadow: 2px 3px 7px 2px rgba(0, 0, 0, 0.02);
}
.mainContainer {
    text-align: center;
}
@media (max-width: 700px){
	.wrapper {
		padding-top: 0;
}
.main{
	width: auto;
	margin: 0 auto;
}
}
</style>
</head>
<body>

	<center class="wrapper">
    <table class="main" width="100%" border="0" cellspacing="0" cellpadding="0">
        <!-- Password input -->
        <tr class="mainContainer">
					<td align="center" style="padding: 20px 0; padding-top: 0px">
						<table>
							<a href="https://abaschedules.com/"
								><img src="https://fcsckcm.stripocdn.email/content/guids/72d46a46-fafd-46d0-848b-9f3c296ae2d1/images/logo192.png" alt="ABA Schedules" width="100"
							/></a>
						</table>
					</td>
				</tr>
        <tr>
				<td align="center">
					<table>
						<p style="color: #16365f; font-size: 20px; font-weight: 600">Verify your email for ABA Schedules</p>
					</table>
				</td>
			</tr>
				<tr>
					<td >
							<table width="100%">
									<tr>
											<td >
													<p style="font-size: 16px; text-align: center; color: rgb(79, 79, 92); line-height: 22px;">Hello, Please click the button below to verify your email.</p>
											</td>
									</tr>
									<tr>
											<td align="center" style="padding: 5px 0;">
													<table role="presentation" cellspacing="0" cellpadding="0" border="0">
															<tr>
																	<td style="background-color: #4d53e0; border-radius: 8px; text-align: center;" bgcolor="#3498db">
																			<a href="{0}" target="_blank" style="font-size: 14px; font-weight: 400; color: #ffffff; text-decoration: none; display: inline-block; padding: 12px 20px;">Verify Email</a>
																	</td>
															</tr>
													</table>
											</td>
									</tr>
							</table>
					</td>
			</tr>
			<tr>
				<td align="center">
					<table>
						<p style="line-height: 23px; font-size: 13px;">If you didn't ask to reset your password, you can ignore this email.</p>
					</table>
				</td>
			</tr>
			<tr>
				<td height="2" bgcolor="#ffffff" style="border:none; border-bottom: 1px solid #cecece; font-size:1px; line-height:1px;">&nbsp;</td>
		</tr>
        <!-- FOOTER SECTION -->
        <tr style='margin: 10px 0;'>
            <td>
                <table width="100%">
									<td>
										<p style="line-height: 23px; font-size: 14px;">Thank you,</p>
										<p style="line-height: 23px; font-size: 14px;"> Your ABA Schedules team.</p>
									</td>
                </table>
            </td>
        </tr>
    </table> <!-- End Main Class -->
</center> <!-- End Wrapper -->
</body>
</html>
      `,
    },
    passwordReset: {
      subject: `Reset your password for {0}`,
      body: `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RESET Email</title>
<style type="text/css">
	@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"');
	body {
		margin: 0;
		padding: 0;
		background-color: #ebedf3;
	}
	table {
		border-spacing: 0;
	}
	td {
		padding: 0;
	}
	img {
		border: 0;
	}
	p{
		font-family: 'Poppins', sans-serif;
		color: rgba(0, 0, 0, 0.6)
	}
	a{
		font-family: 'Poppins', sans-serif;
	}
	h3{
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
	}
	.wrapper {
    table-layout: fixed;
				padding-top: 30px;
				padding-bottom: 30px;
				background-color: #ebedf3;
}
.main {
    width: 100%;
		max-width: 600px;
    font-family: sans-serif;
    color: #4a4a4a;
    text-align: center;
    margin: 5em auto;
    padding: 2em;
    background-color: #FFFF;
    border-radius: 0.5em;
    box-shadow: 2px 3px 7px 2px rgba(0, 0, 0, 0.02);
}
.mainContainer {
    text-align: center;
}
@media (max-width: 700px){
	.wrapper {
		padding-top: 0;
}
.main{
	width: auto;
	margin: 0 auto;
}
}
</style>
</head>
<body>

	<center class="wrapper">
    <table class="main" width="100%" border="0" cellspacing="0" cellpadding="0">
        <!-- Password input -->
        <tr class="mainContainer">
					<td align="center" style="padding: 20px 0; padding-top: 0px">
						<table>
							<a href="https://abaschedules.com/"
								><img src="https://fcsckcm.stripocdn.email/content/guids/72d46a46-fafd-46d0-848b-9f3c296ae2d1/images/logo192.png" alt="ABA Schedules" width="100"
							/></a>
						</table>
					</td>
				</tr>
        <tr>
				<td align="center">
					<table>
						<p style="color: #16365f; font-size: 20px; font-weight: 600">Reset your password for ABA Schedules</p>
					</table>
				</td>
			</tr>
				<tr>
					<td >
							<table width="100%">
									<tr>
											<td >
													<p style="font-size: 16px; text-align: center; color: rgb(79, 79, 92); line-height: 22px;">Hello, A request has been received to change the password for your {1} account.</p>
											</td>
									</tr>
									<tr>
											<td align="center" style="padding: 5px 0;">
													<table role="presentation" cellspacing="0" cellpadding="0" border="0">
															<tr>
																	<td style="background-color: #4d53e0; border-radius: 8px; text-align: center;" bgcolor="#3498db">
																			<a href="{2}" target="_blank" style="font-size: 14px; font-weight: 400; color: #ffffff; text-decoration: none; display: inline-block; padding: 12px 20px;">Reset Password</a>
																	</td>
															</tr>
													</table>
											</td>
									</tr>
							</table>
					</td>
			</tr>
			<tr>
				<td align="center">
					<table>
						<p style="line-height: 23px; font-size: 14px;">If you didn't ask to reset your password, you can ignore this email.</p>
					</table>
				</td>
			</tr>
			<tr>
				<td height="2" bgcolor="#ffffff" style="border:none; border-bottom: 1px solid #cecece; font-size:1px; line-height:1px;">&nbsp;</td>
		</tr>
        <!-- FOOTER SECTION -->
        <tr style='margin: 10px 0;'>
            <td>
                <table width="100%">
									<td>
										<p style="line-height: 23px; font-size: 14px;">Thank you,</p>
										<p style="line-height: 23px; font-size: 14px;"> Your ABA Schedules team.</p>
									</td>
                </table>
            </td>
        </tr>
    </table> <!-- End Main Class -->
</center> <!-- End Wrapper -->
</body>
</html>
      `,
    },
    welcome: {
      subject: `Welcome to ABA Schedules! Your Free Trial Starts Today 🚀`,
      body: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ABASchedules 2 HTML Email Template</title>
<style type="text/css">
	@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"');
	body {
		margin: 0;
		text-align: center;
	}
	table {
		border-spacing: 0;
	}
	td {
		padding: 0;
	}
	img {
		border: 0;
	}
	.wrapper {
		width: 100%;
		table-layout: fixed;
		background-color: #f7f8fb;
		padding-bottom: 60px;
	}
	.main{
		width: 100%;
		max-width: 700px;
		background-color: #FFFFFF;
		font-family: sans-serif;
		color: #4a4a4a;
		box-shadow: 0 0 25px rgba(0, 0, 0, .15);
		text-align: center;
	}
	.header-bg{
		 background-image: url('https://abaschedules-images.s3.amazonaws.com/Frame.png');
			background-size: cover;
			background-repeat: no-repeat;
			background-position: center center;
	}

	h1{
		font-family: 'Poppins', sans-serif;
		color: #fff;
		font-size: 36px;
		line-height: 42px;
	}
	h3{
		font-family: 'Poppins', sans-serif;
		font-size: 28px;
	}
	h4{
		font-family: 'Poppins', sans-serif;
		font-size: 22px;
	}
	p{
		font-family: 'Poppins', sans-serif;
	}
	a{
		font-family: 'Poppins', sans-serif;
		text-decoration: none;
	}
	.button{
		background-color: #4d53e0;
		color: #fff;
		text-decoration: none;
		padding: 12px 20px;
		/* font-weight: bold; */
		border-radius: 5px;
	}

	.three-columns{
		font-size: 0;
		padding: 25px 0 45px;
		width: 100%;
	}
	.three-columns .column{
		width: 100%;
		max-width: 30%;
		display: inline-block;
		margin: 10px;
		vertical-align: top;
	}
	.three-columns .padding{
		padding: 8px;
    padding-top: 16px;
		box-shadow: 0px 0px 14px rgba(209, 209, 209, 0.51);
		background-color: #f7f8fb;
		border-radius: 8px;
	}
	.three-columns .content{
		font-size: 15px;
		line-height: 20px;
	}

	@media (max-width: 685px) {
		.three-columns .column{
			max-width: 100%;
			margin: 10px 0;
			display: table;
			text-align: center;
	}
	.three-columns .padding{
		width: 100%;
	}
	.three-columns .content{
		width: 100%;
		line-height: 20px;
	}
	}
	.social{
		width: 38px;
	}
</style>
</head>
<body>

	<center class="wrapper">

		<table class="main" width="100%">

<!-- Header -->
			<tr>
				<td style="padding: 35px 0;" class="header-bg">
					<table width='100%'>
								<td style='padding: 20px 5px 5px;'>
									<a href="https://abaschedules.com/"><img src="https://abaschedules-images.s3.amazonaws.com/ABAschedules_Logo.2241fc0f.png" alt="ABASchedules" width="150"></a>
									<h1>Welcome aboard to <br>
										ABA Schedules!</h1>
								</td>
					</table>
				</td>
			</tr>
<!-- Title Button -->
			<tr>
				<td align="center" style="padding: 20px 15px 50px;">
        <table width="100%">
									<tr>
											<td>
								<p style="line-height: 23px; font-size: 15px; padding: 0 0 22px; text-align: center;">Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.</p>
							</td>
									</tr>
									<tr>
											<td align="center" style="padding: 5px 0;">
													<table role="presentation" cellspacing="0" cellpadding="0" border="0">
															<tr>
																	<td style="background-color: #4d53e0; border-radius: 8px; text-align: center;" bgcolor="#3498db">
																			<a href="https://app.abaschedules.com/admin/scheduler" target="_blank" style="font-size: 14px; font-weight: 400; color: #ffffff; text-decoration: none; display: inline-block; padding: 12px 20px;">Get Started</a>
																	</td>
															</tr>
													</table>
											</td>
									</tr>
							</table>
				</td>
			</tr>
	
<!-- Three section column -->
<tr>
	<td>
		<table width='100%'>
			<tr>
				<td class="three-columns">
					<table class="column">
						<tr>
							<td class="padding" height='100'>

								<table class="content">
									<tr>
										<td>
											<a href="#"><img src="https://abaschedules-images.s3.amazonaws.com/square-star.png" alt="" ></a>
										</td>
									</tr>
									<tr>
										<td style="padding: 5px 0 10px;">
											<h4>Explore Limitless Features</h4>
											<p>Dive into our suite of tools designed to improve your workflow.</p>
										</td>
									</tr>
								</table>

							</td>
						</tr>
					</table>

					<table class="column">
						<tr>
							<td class="padding" height='100'>

								<table class="content">
									<tr>
										<td>
											<a href="#"><img src="https://abaschedules-images.s3.amazonaws.com/comments-question-check.png" alt="" ></a>
										</td>
									</tr>
									<tr>
										<td style="padding: 5px 0 10px;">
											<h4>Personalized Support</h4>
											<p>Our support team is here to assist you at every step of the way. If you have any questions or need guidance, don't hesitate to reach out.</p>
										</td>
									</tr>
								</table>

							</td>
						</tr>
					</table>

					<table class="column">
						<tr>
							<td class="padding" height='100'>

								<table class="content">
									<tr>
										<td>
											<a href="#"><img src="https://abaschedules-images.s3.amazonaws.com/customization.png" alt="" ></a>
										</td>
									</tr>
									<tr>
										<td style="padding: 5px 0 10px;">
											<h4>Tailored Experience</h4>
											<p>Customize your ABA Schedules experience to suit your unique needs and preferences</p>
										</td>
									</tr>
								</table>

							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</td>
</tr>

<!-- divider -->
<tr>
	<td height='2' style="background: rgb(235, 234, 234)"></td>
</tr>
<!-- Simple Expanation -->
<tr>
	<td style="padding: 20px 15px 50px;">
		<table width='100%'>
			<tr>
				<td>
					<p style="line-height: 23px; font-size: 14px;">Attached you will find additional resources to help you and your team during onboarding.</p>
					<p style="line-height: 23px; font-size: 14px;">Should you have any questions, require assistance, or want to share your feedback, feel free to contact our support team at <a href='mailto:McKenna@abaschedules.com'>McKenna@abaschedules.com</a> or schedule a 30-minute meeting <a href='https://calendly.com/mckenna-25/30min'>here</a>.</p>
					<p style="line-height: 23px; font-size: 14px; ">Thank you once again for choosing ABA Schedules! We're excited to embark on this journey with you.</p>
					<p style="line-height: 23px; font-size: 14px; ">P.S. Remember, this trial is the perfect opportunity to explore the full potential of ABA Schedules. Enjoy!</p>
				</td>
			</tr>
		</table>
	</td>
</tr>
<!-- FOOTER SECTION -->
			<tr>
				<td style="padding: 20px 15px 30px; background-color: rgb(17, 15, 42);">
					<table width='100%'>
						<tr>
							<td style="padding: 35px 10px;">
								<a href="#"><img src="https://abaschedules-images.s3.amazonaws.com/ABAschedules_Logo.2241fc0f.png" alt="" width="100"></a>

								<p style='padding: 2px; color: #fff;'>Best regards</p>
								<p style='padding: 2px; font-weight: 600; color: #fff;'>McKenna Williams <br /> Director of Business Development</p>
								<p style='padding: 2px; color: #fff;'>P: (281) 660-1428</p>
								<p style='padding: 2px; color: #fff;'>E: McKenna@ABASchedules.com</p>

								<a href="https://www.facebook.com/ABAschedules"><img src="https://abaschedules-images.s3.amazonaws.com/circum_facebook.png" alt="" class="social"></a>
								<a href="https://www.linkedin.com/company/aba-schedules/"><img src="https://abaschedules-images.s3.amazonaws.com/ant-design_linkedin-outlined.png" alt="" class="social"></a>
								<a href="https://twitter.com/Abaschedules"><img src="https://abaschedules-images.s3.amazonaws.com/akar-icons_x-fill.png" alt="" class="social"></a>
								<a href="https://www.instagram.com/abaschedules/"><img src="https://abaschedules-images.s3.amazonaws.com/mdi_instagram.png" alt="" class="social"></a>

								<p style='padding: 10px; color: #fff;'>Book a <a href='https://mailtrack.io/trace/link/5e08e1b5c7c7fe13b0db359f038cb1fea81e04b4?url=https%3A%2F%2Fabaschedules.com%2Fbook-demo%2F&userId=7535990&signature=005870454a4d2358' style="color: #fff">demo</a></p>
							</td>
						</tr>
					</table>
				</td>
			</tr>

		</table> <!-- End Main Class -->

	</center> <!-- End Wrapper -->

</body>
</html>
      `,
    },
  },

  events: {
    notFound: 'Event not found!',
    invalidEventFrequencyInterval: 'Invalid event data (frequency or interval)!',
	invalidEventActivity: 'Invalid event data (activity should be provided)!',
    invalidStartEnd: 'Invalid event data provided (start time must be before end time)!',
    invalidDate: 'Invalid event data provided (start date must be before end date)!',
	invalidDateFormat: 'Invalid event date format',
	missingRequiredQueryParam: 'Missing required query parameter !!!',
	invalidQueryParameter: 'Invalid query parameter !!!',
	invalidDaysOfWeek: 'Invalid days of week',
  },

  availabilities: {
    invalidStartEnd: 'Invalid availability data provided (start time must be before end time)!',
    invalidDate: 'Invalid availability data provided (start date must be before end date)!',
	invalidDateFormat: 'Invalid availability date format'
  },

  companies: {
    alreadyExists: 'This Company name is already used!',
    notFound: 'Company not found!',
  },
  groupings: {
    groupingNameTaken: 'Group with same name exists',
	hasChild : 'This group has dependent tag',
	matchingNameValidation : 'You can not change name to/from Matching',
	funderNameValidation : 'You can not change name to/from Funder'
  },

  subgroups: {
    subgroupNameTaken: 'Tag with same name exists',
  },
};

module.exports = errors;
