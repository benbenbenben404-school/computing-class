<?php
	date_default_timezone_set('UTC');
	echo date_default_timezone_get();
	echo date('Y-m-d H:i:s');
	
	
	?>
	<br>
	
<script>
	document.write(new Date().toISOString().replace("T"," ").replace("Z"," ").slice(0, 19))
	</script>