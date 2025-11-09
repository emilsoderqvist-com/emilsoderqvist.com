const projectList = document.getElementById("project-list");

fetch("projects.json").then(res => {
    res.json().then(data => {
        PopulateProjectList(data);
    })
})

function PopulateProjectList(data) {
    data.forEach(project => {
        const projectDiv = document.createElement("div");
        projectDiv.classList.add("modal");

        let statusSymbol = document.createElement("div");
        statusSymbol.classList.add("modal-symbol");

        if (project.link) {
            projectDiv.onclick = (() => {
                window.open(project.link);
            });

            projectDiv.classList.add("clickable");
            statusSymbol.classList.add("open");
        }

        let title = document.createElement("h2");
        title.innerHTML = project.title;

        let timeline = document.createElement("p");
        timeline.classList.add("quiet");
        timeline.innerHTML = project.timeline;

        let description = document.createElement("p");
        description.innerHTML = project.description;

        let tagContainer = document.createElement("div");
        tagContainer.classList.add("project-tags");

        project.tags.forEach(tag => {
            let tagP = document.createElement("p");
            tagP.innerHTML = tag;
            tagContainer.appendChild(tagP);
        });

        projectDiv.appendChild(title);
        projectDiv.appendChild(timeline);
        projectDiv.appendChild(description);
        projectDiv.appendChild(tagContainer);
        projectDiv.appendChild(statusSymbol);
        
        projectList.appendChild(projectDiv);
    })
}