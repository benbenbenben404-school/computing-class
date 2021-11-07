var global_data = { "chats": [] }
var current_user = "ben"

//Functions to generate random numbers from strings
//https://stackoverflow.com/a/47593316
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

//Function to add a message to the page
//Arguments are:
//	content: text of the message
//	useranme: sender of the message
//	time: when the message was sent, as a timestamp, in the format YYYY-MM-DD hh:mm:ss, ie  2038-01-19 03:14:07
//	start: if true, the message is added at the bottom of the chat section, if false it's added at the top
function display_message(content, username, time, start) {
	//Get the chat section
	var chatSection = document.getElementById("chat")

	//Check if the user is scrolled to the bottom of the chat section
	if (chatSection.scrollTop === (chatSection.scrollHeight - chatSection.offsetHeight)) {
		var at_bottom = true
	} else {
		var at_bottom = false
	}
	if (username == current_user) {
		var messageTemplate = document.getElementById("user-message")
	} else {
		var messageTemplate = document.getElementById("message")
	}
	var message = messageTemplate.content.cloneNode(true);
	message.querySelectorAll("b")[0].innerHTML = username
	message.querySelectorAll("time")[0].innerHTML = time
	message.querySelectorAll("p")[0].innerHTML = content
	var seed = xmur3(username)	
	var rand = mulberry32(seed())
	var h = rand()*360
	message.querySelectorAll("b")[0].style.color = "hsl("+ String(h)+",60%, 50%)"
	if (start) {
		chatSection.appendChild(message);
	} else {
		chatSection.prepend(message);
	}

	if (start && at_bottom) {
		console.log(chatSection.scrollHeight)
		chatSection.scrollTo(0, chatSection.scrollHeight);
	}
}



//just for testing


function randText(){
	var tokens =["lorem", "ipsum", "is", "simply", "dummy", "text", "of", "the", "printing", "and", "typesetting", "industry", "lorem", "ipsum", "has", "been", "the", "industrys", "standard", "dummy", "text", "ever", "since", "the", "1500s", "when", "an", "unknown", "printer", "took", "a", "galley", "of", "type", "and", "scrambled", "it", "to", "make", "a", "type", "specimen", "book", "it", "has", "survived", "not", "only", "five", "centuries", "but", "also", "the", "leap", "into", "electronic", "typesetting", "remaining", "essentially", "unchanged", "it", "was", "popularised", "in", "the", "1960s", "with", "the", "release", "of", "letraset", "sheets", "containing", "lorem", "ipsum", "passages", "and", "more", "recently", "with", "desktop", "publishing", "software", "like", "aldus", "pagemaker", "including", "versions", "of", "lorem", "ipsum"]
	var text = '';
	for (var i=0; i<Math.random()*1000; i++) {
		text += tokens[Math.floor(Math.random()*tokens.length)] +" ";
	}

}
function randomMessage(){
	var tokens =["lorem", "ipsum", "is", "simply", "dummy", "text", "of", "the", "printing", "and", "typesetting", "industry", "lorem", "ipsum", "has", "been", "the", "industrys", "standard", "dummy", "text", "ever", "since", "the", "1500s", "when", "an", "unknown", "printer", "took", "a", "galley", "of", "type", "and", "scrambled", "it", "to", "make", "a", "type", "specimen", "book", "it", "has", "survived", "not", "only", "five", "centuries", "but", "also", "the", "leap", "into", "electronic", "typesetting", "remaining", "essentially", "unchanged", "it", "was", "popularised", "in", "the", "1960s", "with", "the", "release", "of", "letraset", "sheets", "containing", "lorem", "ipsum", "passages", "and", "more", "recently", "with", "desktop", "publishing", "software", "like", "aldus", "pagemaker", "including", "versions", "of", "lorem", "ipsum"]
	var text = '';
	for (var i=0; i<Math.random()*1000; i++) {
		text += tokens[Math.floor(Math.random()*tokens.length)] +" ";
	}
	if (Math.random() >0.75){
		var usr="ben"
	} else{
		var usr = '';
		for (var i=0; i<Math.random()*3; i++) {
			usr += tokens[Math.floor(Math.random()*tokens.length)] +" ";
		}	}
	display_message(text,  usr, "2038-01-19 03:14:07", true)
}
setInterval(randomMessage, 1000 )
//setInterval(display_message, 1000, "//Function to add a message to the page//Arguments are://	content: text of the message", "Ben", "2038-01-19 03:14:07", true)