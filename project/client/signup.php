<html>
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;900&display=swap" rel="stylesheet">

        <link  rel="stylesheet" href="style.css">

      <meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

    </head>
    <body>

        <section class="center-container">
            <h1>
                Sign Up
            </h1>
            <form action = "signup.php" method="post" class="auth-form">
                <input type = "text" name="username" placeholder="Username...">
                <input type = "password" name="password" placeholder="Password...">
                <p class="validation-space">
                    <?php
                        session_start();
                        if($_SERVER['REQUEST_METHOD'] == 'POST'){
                
                            $username =filter_input(INPUT_POST,'username', FILTER_SANITIZE_SPECIAL_CHARS) ;
                            $password = filter_input(INPUT_POST,'password', FILTER_SANITIZE_SPECIAL_CHARS);
                            $valid = True;
                            $error = "";
                            if (mb_strlen($username) >30){
                            	$valid = False;
                            	$error = "Username too long";
                            }	
                            if (mb_strlen($password) >30){
                            	$valid = False;
                            	$error = "password too long";
                            }	
                            if (mb_strlen($password) <8){
                            	$valid = False;
                            	$error = "password too short";
                            }	
                            if (mb_strlen($username) >30){
                            	$valid = False;
                            	$error = "Username too long";
                            }	
                            if ($error){
                            	echo $error;
                            }
                            
                            
                            if ($valid){
                            	$servername = "127.0.0.1:50447";
                            	$serverusername = "azure";
                            	$serverpassword = "6#vWHD_$";
                            	$dbname = "chat";
                            	$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
                                $conn->set_charset('utf8mb4');
                
                                $sql = "SELECT username, password_hash FROM user WHERE username='$username'";
                                $result = $conn->query($sql);
                                if ($result->num_rows > 0) {
                                 echo "Username not unique";
                                 
                                } else {
                                $password_hashed = password_hash($password ,PASSWORD_DEFAULT );
                
                                $sql = "INSERT INTO user VALUES ('$username', '$password_hashed')";
                                $result = $conn->query($sql);
                            	$_SESSION["username"] = $username;
                                header('Location: main.html');
                                }   
                            }
                        }
                    ?>
                </p>
                <input type ="submit" class="main-button" value="Sign Up">
                
            </form>

    </body>
</html>