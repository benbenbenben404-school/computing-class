//THIS IS FOR TESTING PURPOSES ONLY
document.onload = setTheme()

function setTheme(){
    if (localStorage.getItem('theme') == "light"){
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    //document.documentElement.setAttribute('data-theme', 'light');
}

function toggleTheme(){
    
    if (localStorage.getItem('theme') == "light"){
        localStorage.setItem('theme', 'dark');

        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');

        document.documentElement.setAttribute('data-theme', 'light');

    }
}