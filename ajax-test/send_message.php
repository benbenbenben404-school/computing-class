

<?php
if ($_GET["message"] <>"") {
    $servername = "127.0.0.1:50447";
    $username = "azure";
    $password = "6#vWHD_$";
    $dbname = "testdb"; // only bit you need to change
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } else {
        echo "connection successful<br/>";
    }
    $sql = "INSERT INTO ajax VALUES ('".date("Y-m-d H:i:s")."','".$_GET["username"]."','".$_GET["message"]."');";
    echo $sql;
    echo "<br>";
    //echo $_GET["id"].$_GET["fname"].$_GET["lname"].$_GET["addr"].$_GET["city"];
    $result = mysqli_query($conn, $sql );
    echo $result;
    
    mysqli_close($conn);
}
?>