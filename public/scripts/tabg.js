window.setInterval(apiCall, 30000);

function apiCall() {
    fetch("/api/tabg").then(res => {
    res.json().then(data => {
        console.log(data)
        document.getElementById("counter").innerHTML = data;
    })
})}

apiCall();