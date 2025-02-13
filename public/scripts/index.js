const titles = [
    "Hello", "Bonjour", "Hola", 
    "Zdravstvuyte", "Nǐn hǎo", "Salve", 
    "Konnichiwa", "Guten Tag", "Hej", 
    "Olá", "Annyeonghaseyo", "Namaste", 
    "Merhaba", "Asalaam Alaikum", "Sawubona", 
    "Shalom", "Yassas", "Halo", 
    "Selamat Siang", "Habari", "Ciao", 
    "Terve", "Hallå", "Szia", 
    "Dobry Dzień", "Sveiki", "Hoi", 
    "God Dag", "Kamusta", "Xin Chào"
];

let increment = 0;

function ChangeTitle() {
    document.title = `Emil Söderqvist - ${titles[increment]}!`;
    increment = (increment + 1) % titles.length; // Automatically wraps around.
}

// Initial title change.
ChangeTitle();
setInterval(ChangeTitle, 5000);