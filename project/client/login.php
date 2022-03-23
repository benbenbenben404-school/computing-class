<!--Page to log into the application. This sets a session variable of the user on the server-->
<html>

<head>
    <!--Load some fonts from Google fonts
		Specifically poppins at weight 400 and 900-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;900&display=swap" rel="stylesheet" />
    <!--Load the main stylesheet with all the css in it-->
    <link rel="stylesheet" href="style.css" />
    <!--Load the main Javascript file -->
    <script src="main.js"></script>
    <!--Set the page title-->
    <title>Chat</title>
    <!--Set the viewport, to allow breakpoints in css to work-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--Set the character set to use in the website, to allow unicode, such as emoji, to work -->
    <meta charset="UTF-8" />
</head>
<!--Main body, with function called on load to set theme-->

<body onload="load_theme()">
    <!-- Main Section, with heading, and form to log in -->
    <section class="center-container">
        <h1>
            Log in
        </h1>
        <!-- Form to log in, which calls itself when submitted, as POST -->
        <form action="login.php" method="POST" class="auth-form">
            <!-- Inputs for username and password -->
            <input type="text" name="username" placeholder="Username..." maxlength=30>
            <input type="password" name="password" placeholder="Password..." maxlength=30>
            <p class="validation-space">
                <?php
                // Start a session, to enable the use of session variables
                session_start();
                // If the form was previously submitted as post, run form processing on it
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    // Get username and password from request, using filter_input to sanitize input
                    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_SPECIAL_CHARS);
                    $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_SPECIAL_CHARS);
                    // Run input validation on the username and password
                    // If there are any errors, echo it, so it is displayed in the validation space in the form
                    $valid = True;
                    $error = "";
                    #Note that all validation is done in code
                    #I could have done this in the form itself, but this allows for more consistent error messages
                    #This also prevents users from creating out of spec accounts by editing the request after the form sends it
                    if (mb_strlen($username) > 30) {
                        $valid = False;
                        $error = "Username too long";
                    }
                    if (mb_strlen($password) > 30) {
                        $valid = False;
                        $error = "password too long";
                    }
                    if (mb_strlen($password) < 8) {
                        $valid = False;
                        $error = "password too short";
                    }
                    if (mb_strlen($username) == 0) {
                        $valid = False;
                        $error = "Username too short";
                    }
                    if ($error) {
                        echo $error;
                    }

                    // If there was a validation error, don't do the rest of the form processing
                    if ($valid) {
                        // Log into the database, and set the character set to unicode
                        $servername = "127.0.0.1:50447";
                        $serverusername = "azure";
                        $serverpassword = "6#vWHD_$";
                        $dbname = "chat";
                        $conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
                        $conn->set_charset('utf8mb4');
                        // Run a query, and use password_verify, to check of the username and password are valid
                        // password_verify is required as only the password hash is stored, not the passowrd itself
                        $sql = "SELECT username, password_hash FROM user WHERE username='$username'";
                        $result = $conn->query($sql);
                        if (password_verify($password, $result->fetch_assoc()["password_hash"])) {
                            // If the password is valid, set the username in a session variable, and redirect the user to the main page
                            $_SESSION["username"] = $username;
                            header('Location: main.html');
                        } else {
                            // if the password is wrong, echo this in the validation space in the form
                            echo "username or password wrong";
                        }
                    }
                }
                ?>
            </p>
            <input type="submit" class="main-button" value="Log in">

        </form>


</body>

</html>