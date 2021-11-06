var global_data = {"chats":[]}

function display_message(content,username,time,start ){
	obj = document.getElementsByClassName("chat")[0]
	//https://stackoverflow.com/questions/876115/how-can-i-determine-if-a-div-is-scrolled-to-the-bottom
	if( window.scrollHeight - window.offsetHeight === (obj.scrollHeight - obj.offsetHeight)){
		console.log("bottom")
	} else {
		console.log("bottom")
	}
	
}
setInterval(display_message("hello","hello","hello",false ),1000)